export default {
  fromTimer: function (entry) {
    return {
      entryId: entry.id,
      taskId: entry.task.id,
      title: entry.task.name,
      billable: entry.billable,
      task: entry.task,
      description: entry.description,
      start: new Date(Number(entry.start)),
      end: new Date(Date.now()),
      timer: true,

      draggable: false,
      resizable: false,
      deletable: false,
      class: 'running-timer'
    };
  },

  fromClickup: function (entry) {
    if (!entry.task) return false;
    if (entry.task === '0') return this.entryWithoutTask(entry);

    const editable =
      ['Closed', 'archived'].indexOf(entry.task.status.status) === -1;

    return {
      entryId: entry.id,
      taskId: entry.task.id,
      title: entry.task.name,
      taskUrl: entry.task_url,
      billable: entry.billable,
      task: entry.task,
      task_location: entry.task_location,
      description: entry.description,
      start: new Date(Number(entry.start)),
      end: new Date(Number(entry.start) + Number(entry.duration)),

      // Only make draggable/resizable/editable if task is not closed or archived
      draggable: editable,
      resizable: editable,
      deletable: editable,
      class: !editable ? 'not-editable' : null
    };
  },

  fromEvent: function (entry) {
    return {
      id: entry.entryId,
      task: entry.taskId
        ? {
            id: entry.taskId,
            name: entry.title
          }
        : null,
      task_url: entry.taskUrl ?? null,
      description: entry.description ?? '',
      start: new Date(entry.start),
      end: new Date(entry.end),
      duration: Number(entry.endTimeMinutes) - Number(entry.startTimeMinutes)
    };
  },

  entryWithoutTask: function (entry) {
    return {
      entryId: entry.id,
      taskId: null,
      title: 'No access to task details',
      taskUrl: false,
      task: null,
      task_location: null,
      description: entry.description,
      start: new Date(Number(entry.start)),
      end: new Date(Number(entry.start) + Number(entry.duration)),

      // No task is attached. Disable mutations
      draggable: false,
      resizable: false,
      deletable: false,
      class: 'not-editable'
    };
  },

  updateFromRemote: (original, remote) => {
    return Object.assign(original, {
      entryId: remote.id,
      taskId: remote.task.id,
      taskUrl: `https://app.clickup.com/t/${remote.task.id}`,
      title: remote.task.name,
      description: remote.description,
      start: new Date(Number(remote.start)),
      end: new Date(Number(remote.start) + Number(remote.duration))
    });
  }
};
