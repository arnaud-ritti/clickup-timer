import request from 'request';
import store from '@core/store';
import cache from '@core/store/cache';

const BASE_URL = 'https://api.clickup.com/api/v2';
//const BASE_URL = 'https://a00fb6e0-339c-4201-972f-503b9932d17a.remockly.com';

const SPACES_CACHE_KEY = 'spaces';
const FOLDERS_CACHE_KEY = 'folders';
const LISTS_CACHE_KEY = 'lists';
const TASKS_CACHE_KEY = 'tasks';
const TAGS_CACHE_KEY = 'tags';
const USERS_CACHE_KEY = 'users';
const USER_CACHE_KEY = 'user';
//const TIMER_CACHE_KEY = 'timer';

const teamRootUrl = () => {
  return `${BASE_URL}/team/${store.get('settings.clickup_team_id')}`;
};

const tokenValid = (token) => {
  if (!token) {
    return false;
  }
  return new Promise((resolve, reject) => {
    request(
      {
        method: 'GET',
        mode: 'no-cors',
        url: BASE_URL + '/user',
        headers: {
          Authorization: token,
          'Content-Type': 'application/json'
        }
      },
      (error, response) => {
        if (error) return reject(error);
        const data = response?.body ? JSON.parse(response.body) : null;
        if (error || data?.ECODE) return reject(error || data);

        if (data.user) {
          cache.put(
            USER_CACHE_KEY,
            data.user,
            3600 * 6 // plus 6 hours
          );
        }

        resolve(data.user || null);
      }
    );
  });
};

const getUser = async () => {
  try {
    if (store.get('settings.clickup_access_token')) {
      await tokenValid(store.get('settings.clickup_access_token'));
    }
    return cache.get(USER_CACHE_KEY) ?? null;
  } catch (error) {
    return null;
  }
};

const getUsers = () => {
  return new Promise((resolve, reject) => {
    request(
      {
        method: 'GET',
        url: `${BASE_URL}/team/`,
        headers: {
          Authorization: store.get('settings.clickup_access_token'),
          'Content-Type': 'application/json'
        }
      },
      (error, response) => {
        if (error) return reject(error);

        const teams = JSON.parse(response.body).teams;
        const users = teams
          .flatMap((team) => team.members)
          .map((member) => member.user)
          .filter((user) => user.role !== 4) // Remove guests
          .filter((user, index, self) => self.indexOf(user) === index) // only unique id's
          .sort(function (a, b) {
            // sort alphabetically by name
            if (a.username === b.username) return 0;

            return a.username < b.username ? -1 : 1;
          });

        resolve(users);
      }
    );
  });
};

const getCachedUsers = async () => {
  const cached = cache.get(USERS_CACHE_KEY);

  if (cached) {
    return cached;
  }

  return cache.put(
    USERS_CACHE_KEY,
    await getUsers(),
    3600 * 6 // plus 6 hours
  );
};

const clearCachedUsers = () => {
  cache.clear(USERS_CACHE_KEY);
};

const getTimeTrackingRange = (start, end, userId) => {
  return new Promise((resolve, reject) => {
    const params = {
      start_date: start.valueOf(),
      end_date: end.valueOf(),
      include_location_names: true,
      include_task_tags: true
    };

    // Only set assignee when argument was given
    if (userId) {
      params.assignee = userId;
    }

    request(
      {
        method: 'GET',
        mode: 'no-cors',
        url: `${teamRootUrl()}/time_entries?` + new URLSearchParams(params),

        headers: {
          Authorization: store.get('settings.clickup_access_token'),
          'Content-Type': 'application/json'
        }
      },
      (error, response) => {
        if (error) return reject(error);
        const data = response?.body ? JSON.parse(response.body) : null;
        if (error || data?.ECODE) return reject(error || data);
        resolve(data.data || []);
      }
    );
  });
};

const getTasks = async (list) => {
  let page = 0;
  let results = [];

  const getTasksPage = (page, list) => {
    page = page || 0;

    return new Promise((resolve, reject) => {
      request(
        {
          method: 'GET',
          mode: 'no-cors',
          url:
            (list
              ? `${BASE_URL}/list/${list}/task?`
              : `${teamRootUrl()}/task?`) +
            new URLSearchParams({
              page: page,
              include_closed: true,
              subtasks: true,
              reverse: true
            }),

          headers: {
            Authorization: store.get('settings.clickup_access_token'),
            'Content-Type': 'application/json'
          }
        },
        (error, response) => {
          if (error) return reject(error);
          const data = response?.body ? JSON.parse(response.body) : null;
          if (error || data?.ECODE) return reject(error || data);
          resolve(data.tasks || []);
        }
      );
    });
  };

  do {
    try {
      results = await results.concat(await getTasksPage(page, list));
      page++;
    } catch (e) {
      console.log(`Error retrieving tasks page ${page}. Retrying...`, e);
    }
  } while (results.length / page === 100);

  return results;
};

const getCachedTasks = async (list) => {
  const CACHE_KEY = `${TASKS_CACHE_KEY}${list ? '.' + list : ''}`;
  const cached = cache.get(CACHE_KEY);

  if (cached) {
    return cached;
  }

  let tasks = await getTasks(list);
  tasks = tasks.map((task) => ({
    id: task.id,
    name: `${task.name}`,
    url: `${task.url}`
  }));

  return cache.put(
    CACHE_KEY,
    tasks,
    3600 * 6 // plus 6 hours
  );
};

const clearCachedTasks = (list) => {
  cache.clear(`${TASKS_CACHE_KEY}${list ? '.' + list : ''}`);
};

const getTimeEntry = (entryId) => {
  return new Promise((resolve, reject) => {
    const params = {
      include_location_names: true,
      include_task_tags: true
    };

    request(
      {
        method: 'GET',
        mode: 'no-cors',
        url:
          `${teamRootUrl()}/time_entries/${entryId}?` +
          new URLSearchParams(params),
        headers: {
          Authorization: store.get('settings.clickup_access_token'),
          'Content-Type': 'application/json'
        }
      },
      (error, response) => {
        if (error) return reject(error);
        const data = response?.body ? JSON.parse(response.body) : null;
        if (error || data?.ECODE) return reject(error || data);
        resolve(data.data || []);
      }
    );
  });
};

const createTimeTrackingEntry = (
  taskId,
  description,
  start,
  end,
  tags,
  billable
) => {
  return new Promise((resolve, reject) => {
    request(
      {
        method: 'POST',
        url: `${teamRootUrl()}/time_entries`,
        headers: {
          Authorization: store.get('settings.clickup_access_token'),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          description,
          tid: taskId,
          start: start.valueOf(),
          duration: end.valueOf() - start.valueOf(),
          tags,
          billable
        })
      },
      (error, response) => {
        if (error) return reject(error);
        const data = response?.body ? JSON.parse(response.body) : null;
        if (error || data?.ECODE) return reject(error || data);
        resolve(data.data);
      }
    );
  });
};

const updateTimeTrackingEntry = (
  entryId,
  description,
  start,
  end,
  tags,
  billable
) => {
  return new Promise((resolve, reject) => {
    request(
      {
        method: 'PUT',
        url: `${teamRootUrl()}/time_entries/${entryId}`,
        headers: {
          Authorization: store.get('settings.clickup_access_token'),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tag_action: 'replace',
          description,
          start: start.valueOf(),
          end: end.valueOf(),
          duration: end.valueOf() - start.valueOf(),
          tags,
          billable
        })
      },
      (error, response) => {
        if (error) return reject(error);
        const data = response?.body ? JSON.parse(response.body) : null;
        if (error || data?.ECODE) return reject(error || data);
        resolve(data.data[0]);
      }
    );
  });
};

const deleteTimeTrackingEntry = (entryId) => {
  return new Promise((resolve, reject) => {
    request(
      {
        method: 'DELETE',
        url: `${teamRootUrl()}/time_entries/${entryId}`,
        headers: {
          Authorization: store.get('settings.clickup_access_token'),
          'Content-Type': 'application/json'
        }
      },
      (error, response) => {
        if (error) return reject(error);
        const data = response?.body ? JSON.parse(response.body) : null;
        if (error || data?.ECODE) return reject(error || data);
        resolve(data.data[0]);
      }
    );
  });
};

const currentTimeTrackingEntry = () => {
  return new Promise((resolve, reject) => {
    request(
      {
        method: 'GET',
        url: `${teamRootUrl()}/time_entries/current`,
        headers: {
          Authorization: store.get('settings.clickup_access_token'),
          'Content-Type': 'application/json'
        }
      },
      (error, response) => {
        if (error) return reject(error);
        const data = response?.body ? JSON.parse(response.body) : null;
        if (error || data?.ECODE) return reject(error || data);
        resolve(data.data);
      }
    );
  });
};

const startTimeTrackingEntry = (taskId, description, tags, billable) => {
  return new Promise((resolve, reject) => {
    request(
      {
        method: 'POST',
        url: `${teamRootUrl()}/time_entries/start`,
        headers: {
          Authorization: store.get('settings.clickup_access_token'),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tid: taskId,
          description,
          tags,
          billable
        })
      },
      (error, response) => {
        if (error) return reject(error);
        const data = response?.body ? JSON.parse(response.body) : null;
        if (error || data?.ECODE) return reject(error || data);
        resolve(data.data);
      }
    );
  });
};

const stopTimeTrackingEntry = () => {
  return new Promise((resolve, reject) => {
    request(
      {
        method: 'POST',
        url: `${teamRootUrl()}/time_entries/stop`,
        headers: {
          Authorization: store.get('settings.clickup_access_token'),
          'Content-Type': 'application/json'
        }
      },
      (error, response) => {
        if (error) return reject(error);
        const data = response?.body ? JSON.parse(response.body) : null;
        if (error || data?.ECODE) return reject(error || data);
        resolve(data.data);
      }
    );
  });
};

const getTags = async () => {
  return await new Promise((resolve, reject) => {
    request(
      {
        method: 'GET',
        mode: 'no-cors',
        url: `${teamRootUrl()}/time_entries/tags`,
        headers: {
          Authorization: store.get('settings.clickup_access_token'),
          'Content-Type': 'application/json'
        }
      },
      (error, response) => {
        if (error) return reject(error);
        const data = response?.body ? JSON.parse(response.body) : null;
        if (error || data?.ECODE) return reject(error || data);
        resolve(data || []);
      }
    );
  });
};

const getCachedTags = async () => {
  const cached = cache.get(TAGS_CACHE_KEY);

  if (cached) {
    return cached;
  }

  let tags = await getTags();
  tags = tags.map((tag) => ({
    id: tag.id,
    name: `${tag.name}`,
    folder: `${tag.folder.name}`
  }));

  return cache.put(
    TAGS_CACHE_KEY,
    tags,
    3600 * 6 // plus 6 hours
  );
};

const clearCachedTags = () => {
  cache.clear(TAGS_CACHE_KEY);
};

const getSpaces = async () => {
  return await new Promise((resolve, reject) => {
    request(
      {
        method: 'GET',
        mode: 'no-cors',
        url: `${teamRootUrl()}/space`,
        headers: {
          Authorization: store.get('settings.clickup_access_token'),
          'Content-Type': 'application/json'
        }
      },
      (error, response) => {
        if (error) return reject(error);
        const data = response?.body ? JSON.parse(response.body) : null;
        if (error || data?.ECODE) return reject(error || data);
        resolve(data.spaces || []);
      }
    );
  });
};

const getCachedSpaces = async () => {
  const cached = cache.get(SPACES_CACHE_KEY);

  if (cached) {
    return cached;
  }

  let spaces = await getSpaces();
  spaces = spaces.map((space) => ({
    id: space.id,
    name: `${space.name}`,
    color: space.color,
    avatar: space.avatar,
    archived: space.archived
  }));

  return cache.put(
    SPACES_CACHE_KEY,
    spaces,
    3600 * 6 // plus 6 hours
  );
};

const clearCachedSpaces = () => {
  cache.clear(SPACES_CACHE_KEY);
};

const getFolders = async (space) => {
  return await new Promise((resolve, reject) => {
    request(
      {
        method: 'GET',
        mode: 'no-cors',
        url: `${BASE_URL}/space/${space}/folder`,
        headers: {
          Authorization: store.get('settings.clickup_access_token'),
          'Content-Type': 'application/json'
        }
      },
      (error, response) => {
        if (error) return reject(error);
        const data = response?.body ? JSON.parse(response.body) : null;
        if (error || data?.ECODE) return reject(error || data);
        resolve(data.folders || []);
      }
    );
  });
};

const getCachedFolders = async (space) => {
  const CACHE_KEY = `${FOLDERS_CACHE_KEY}${space ? '.' + space : ''}`;
  const cached = cache.get(CACHE_KEY);
  if (cached) {
    return cached;
  }

  let folders = await getFolders(space);
  folders = folders.map((folder) => ({
    id: folder.id,
    name: `${folder.name}`,
    hidden: folder.hidden,
    archived: folder.archived
  }));

  return cache.put(
    CACHE_KEY,
    folders,
    3600 * 6 // plus 6 hours
  );
};

const clearCachedFolders = (space) => {
  cache.clear(`${FOLDERS_CACHE_KEY}${space ? '.' + space : ''}`);
};

const getLists = async (folder) => {
  return await new Promise((resolve, reject) => {
    request(
      {
        method: 'GET',
        mode: 'no-cors',
        url: `${BASE_URL}/folder/${folder}/list`,
        headers: {
          Authorization: store.get('settings.clickup_access_token'),
          'Content-Type': 'application/json'
        }
      },
      (error, response) => {
        if (error) return reject(error);
        const data = response?.body ? JSON.parse(response.body) : null;
        if (error || data?.ECODE) return reject(error || data);
        resolve(data.lists || []);
      }
    );
  });
};

const getCachedLists = async (folder) => {
  const CACHE_KEY = `${LISTS_CACHE_KEY}${folder ? '.' + folder : ''}`;
  const cached = cache.get(CACHE_KEY);
  if (cached) {
    return cached;
  }

  let lists = await getLists(folder);
  lists = lists.map((list) => ({
    id: list.id,
    name: `${list.name}`,
    archived: list.archived
  }));

  return cache.put(
    CACHE_KEY,
    lists,
    3600 * 6 // plus 6 hours
  );
};

const clearCachedLists = (folder) => {
  cache.clear(`${LISTS_CACHE_KEY}${folder ? '.' + folder : ''}`);
};

export default {
  tokenValid,
  getUser,
  getUsers,
  getCachedUsers,
  clearCachedUsers,
  getTimeTrackingRange,
  getTasks,
  getCachedTasks,
  clearCachedTasks,
  getTimeEntry,
  createTimeTrackingEntry,
  updateTimeTrackingEntry,
  deleteTimeTrackingEntry,
  currentTimeTrackingEntry,
  startTimeTrackingEntry,
  stopTimeTrackingEntry,
  getTags,
  getCachedTags,
  clearCachedTags,
  getSpaces,
  getCachedSpaces,
  clearCachedSpaces,
  getFolders,
  getCachedFolders,
  clearCachedFolders,
  getLists,
  getCachedLists,
  clearCachedLists
};
