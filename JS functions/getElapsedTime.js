// Takes a date object,
const getElapsedTime = (date) => {
  let startTime = new Date(date).getTime() / 1000;
  let endTime = new Date().getTime() / 1000;
  let SECONDS = Math.round(endTime - startTime);
  let elapsedTime = new Date(SECONDS * 1000).toISOString().substr(11, 8);
  return elapsedTime;
};
module.exports = getElapsedTime;
