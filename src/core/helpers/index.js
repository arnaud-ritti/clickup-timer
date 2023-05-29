export function isEmptyObject(object) {
  return Object.keys(object).length === 0;
}

export function waitAsync(timeout = 1000) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), timeout);
  });
}
export function timeToMinutes(value) {
  return Number(
    value.split(':').reduce(function (seconds, v) {
      return +v + seconds * 60;
    }, 0)
  );
}
