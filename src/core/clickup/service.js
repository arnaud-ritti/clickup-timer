import ky from 'ky';
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

const tokenValid = async (token) => {
  if (!token) {
    return false;
  }

  const response = await ky(`${BASE_URL}/user`, {
    method: 'GET',
    headers: {
      Authorization: token
    }
  }).json();
  if (response?.ECODE) throw new Error(response?.ECODE);
  if (response.user) {
    cache.put(
      USER_CACHE_KEY,
      response.user,
      3600 * 6 // plus 6 hours
    );
  }
  return response.user || null;
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

const getUsers = async () => {
  const response = await ky(`${BASE_URL}/team`, {
    method: 'GET',
    headers: {
      Authorization: store.get('settings.clickup_access_token')
    }
  }).json();
  if (response?.ECODE) throw new Error(response?.ECODE);
  return response.teams
    .flatMap((team) => team.members)
    .map((member) => member.user)
    .filter((user) => user.role !== 4) // Remove guests
    .filter((user, index, self) => self.indexOf(user) === index) // only unique id's
    .sort(function (a, b) {
      // sort alphabetically by name
      if (a.username === b.username) return 0;

      return a.username < b.username ? -1 : 1;
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

const getTimeTrackingRange = async (start, end, userId) => {
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

  const response = await ky(`${teamRootUrl()}/time_entries`, {
    method: 'GET',
    headers: {
      Authorization: store.get('settings.clickup_access_token')
    },
    searchParams: params
  }).json();
  if (response?.ECODE) throw new Error(response?.ECODE);
  return response.data || [];
};

const getTasks = async (list) => {
  let page = 0;
  let results = [];

  const getTasksPage = async (page, list) => {
    page = page || 0;

    const response = await ky(
      list ? `${BASE_URL}/list/${list}/task` : `${teamRootUrl()}/task`,
      {
        method: 'GET',
        headers: {
          Authorization: store.get('settings.clickup_access_token')
        },
        searchParams: {
          page: page,
          include_closed: true,
          subtasks: true,
          reverse: true
        }
      }
    ).json();
    if (response?.ECODE) throw new Error(response?.ECODE);
    return response.tasks || [];
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

const getTimeEntry = async (entryId) => {
  const params = {
    include_location_names: true,
    include_task_tags: true
  };

  const response = await ky(`${teamRootUrl()}/time_entries/${entryId}`, {
    method: 'GET',
    headers: {
      Authorization: store.get('settings.clickup_access_token')
    },
    searchParams: params
  }).json();
  if (response?.ECODE) throw new Error(response?.ECODE);
  return response.data || [];
};

const createTimeTrackingEntry = async (
  taskId,
  description,
  start,
  end,
  tags,
  billable
) => {
  const response = await ky(`${teamRootUrl()}/time_entries`, {
    method: 'POST',
    headers: {
      Authorization: store.get('settings.clickup_access_token')
    },
    json: {
      description,
      tid: taskId,
      start: start.valueOf(),
      duration: end.valueOf() - start.valueOf(),
      tags,
      billable
    }
  }).json();
  if (response?.ECODE) throw new Error(response?.ECODE);
  return response.data;
};

const updateTimeTrackingEntry = async (
  entryId,
  description,
  start,
  end,
  tags,
  billable
) => {
  const response = await ky(`${teamRootUrl()}/time_entries`, {
    method: 'POST',
    headers: {
      Authorization: store.get('settings.clickup_access_token')
    },
    json: {
      tag_action: 'replace',
      description,
      start: start.valueOf(),
      end: end.valueOf(),
      duration: end.valueOf() - start.valueOf(),
      tags,
      billable
    }
  }).json();

  if (response?.ECODE) throw new Error(response?.ECODE);
  return response.data[0];
};

const deleteTimeTrackingEntry = async (entryId) => {
  const response = await ky(`${teamRootUrl()}/time_entries/${entryId}`, {
    method: 'DELETE',
    headers: {
      Authorization: store.get('settings.clickup_access_token')
    }
  }).json();

  if (response?.ECODE) throw new Error(response?.ECODE);

  return response.data[0];
};

const currentTimeTrackingEntry = async () => {
  const response = await ky(`${teamRootUrl()}/time_entries/current`, {
    method: 'GET',
    headers: {
      Authorization: store.get('settings.clickup_access_token')
    }
  }).json();
  if (response?.ECODE) throw new Error(response?.ECODE);
  return response.data || null;
};

const startTimeTrackingEntry = async (taskId, description, tags, billable) => {
  const response = await ky(`${teamRootUrl()}/time_entries/start`, {
    method: 'POST',
    headers: {
      Authorization: store.get('settings.clickup_access_token')
    },
    json: {
      tid: taskId,
      description,
      tags,
      billable
    }
  }).json();
  if (response?.ECODE) throw new Error(response?.ECODE);
  return response.data || null;
};

const stopTimeTrackingEntry = async () => {
  const response = await ky(`${teamRootUrl()}/time_entries/stop`, {
    method: 'POST',
    headers: {
      Authorization: store.get('settings.clickup_access_token')
    }
  }).json();
  if (response?.ECODE) throw new Error(response?.ECODE);
  return response.data || null;
};

const getTags = async () => {
  const response = await ky(`${teamRootUrl()}/time_entries/tags`, {
    method: 'GET',
    headers: {
      Authorization: store.get('settings.clickup_access_token')
    }
  }).json();
  if (response?.ECODE) throw new Error(response?.ECODE);
  return response.data || [];
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
  const response = await ky(`${teamRootUrl()}/space`, {
    method: 'GET',
    headers: {
      Authorization: store.get('settings.clickup_access_token')
    }
  }).json();
  if (response?.ECODE) throw new Error(response?.ECODE);
  return response.spaces || [];
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
  const response = await ky(`${BASE_URL}/space/${space}/folder`, {
    method: 'GET',
    headers: {
      Authorization: store.get('settings.clickup_access_token')
    }
  }).json();
  if (response?.ECODE) throw new Error(response?.ECODE);
  return response.folders || [];
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
  const response = await ky(`${BASE_URL}/folder/${folder}/list`, {
    method: 'GET',
    headers: {
      Authorization: store.get('settings.clickup_access_token')
    }
  }).json();
  if (response?.ECODE) throw new Error(response?.ECODE);
  return response.lists || [];
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
