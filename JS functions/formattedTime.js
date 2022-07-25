// Takes a date object and returns is as formatted string
const formattedTime = (time) => {
  let dt = new Date(time);
  let hours = dt.getHours();
  let AmOrPm = hours >= 12 ? "pm" : "am";
  hours = hours % 12 || 12;
  let minutes = dt.getMinutes().toString();
  if (minutes.length == 1) {
    minutes = "0" + minutes;
  }
  let finalTime = hours + ":" + minutes + " " + AmOrPm;
  return finalTime;
};
module.exports = formattedTime;
