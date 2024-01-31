import timezoneSelector from "./timeZone.js";

const customInput = document.getElementById("customInputField");
const dateParts = { year: "", month: "", day: "" };
const timeParts = { hour: "", minute: "", second: "", timezone: "" };

const todayButton = document.querySelector(".today-btn");

const nullflavorDropdown = document.getElementById("nullflavorDropdown");

nullflavorDropdown.addEventListener("change", function () {
  // reset flatpickrCalendar
  flatpickrCalendar.value = "";

  // reset dateParts and timeParts
  Object.keys(dateParts).forEach((key) => (dateParts[key] = ""));
  Object.keys(timeParts).forEach((key) => (timeParts[key] = ""));

  if (nullflavorDropdown.value === "") {
  // make the select dropdown grey when the user selects the default option
    nullflavorDropdown.style.color = "#999";
    customInput.value = "";
  } else {
    nullflavorDropdown.style.color = "#000";
    customInput.value = nullflavorDropdown.value;
  }
});


todayButton.addEventListener("click", function () {
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0);

  // instance.setDate(currentDate);

  dateParts.year = currentDate.getFullYear();
  dateParts.month = currentDate.getMonth() + 1;
  dateParts.day = currentDate.getDate();
  timeParts.hour = currentDate.getHours();
  timeParts.minute = currentDate.getMinutes();
  timeParts.second = currentDate.getSeconds();

  updateCustomInputWithDate();
  updateCustomInputWithTime();

  flatpickrCalendar.value = "";

  // reset nullflavorDropdown
  nullflavorDropdown.style.color = "#999";
  nullflavorDropdown.value = "";
});


function updateCustomInputWithDate() {
  customInput.value = Object.values(dateParts).filter(Boolean).join("-");
}

/**
 * Constructs and appends a time string to `customInput` based on `timeParts` values.
 * Formats time as HH:MM:SS, defaulting unset components to '00'. Ensures that if a later time component
 * is set (e.g., minutes), all preceding components (e.g., hours) are included, defaulting to '00' if necessary.
 * Updates `customInput` only if at least one time component is set.
 */
function updateCustomInputWithTime() {
  let timeString = "";
  if (timeParts.hour || timeParts.minute || timeParts.second) {
    timeString += timeParts.hour || "00";
  }
  if (timeParts.minute || timeParts.second) {
    timeString += ":" + (timeParts.minute || "00");
  }
  if (timeParts.second) {
    timeString += ":" + timeParts.second;
  }

  // Add time string with timezone to the input value if any time component is present
  if (timeString) {
    timeParts.timezone = timezoneSelector.value;
    customInput.value += " " + timeString + " " + "z" + timezoneSelector.value;
  }
}

const fpCalendar = flatpickr("#flatpickrCalendar", {
  enableTime: true,
  dateFormat: "Y-m-d H:i:S",
  defaultHour: 0,
  enableSeconds: true,
  time_24hr: true,
  onReady: function (selectedDates, dateStr, instance) {
    // Add timezone dropdown to the calendar
    instance.calendarContainer.appendChild(timezoneSelector);
  },

  onOpen: function (selectedDates, dateStr, instance) {

    // reset nullflavorDropdown
    nullflavorDropdown.value = "";
    nullflavorDropdown.style.color = "#999";

    // Capture the current year
    dateParts.year = instance.currentYear;

    updateCustomInputWithDate();
    updateCustomInputWithTime();
  },

  onClose: function (selectedDates, dateStr, instance) {
    // clear flatpickrCalendar input and flatpickrTime input
    // document.getElementById("flatpickrCalendar").value = "";

    updateCustomInputWithDate();
    updateCustomInputWithTime();
  },

  // Triggered when the user selects a date, or changes the time on a selected date
  onChange: function (selectedDates, dateStr, instance) {
    // Capture the current date
    dateParts.year = selectedDates[0].getFullYear();
    dateParts.month = selectedDates[0].getMonth() + 1;
    dateParts.day = selectedDates[0].getDate();
    timeParts.hour = selectedDates[0].getHours();
    timeParts.minute = selectedDates[0].getMinutes();
    timeParts.second = selectedDates[0].getSeconds();

    updateCustomInputWithDate();
    updateCustomInputWithTime();

  },

  // Triggered when the month is changed, either by the user or programmatically
  onMonthChange: function (selectedDates, dateStr, instance) {
    // Capture the current month
    dateParts.month = instance.currentMonth + 1;

    updateCustomInputWithDate();
    updateCustomInputWithTime();
  },

  // Triggered when the year is changed, either by the user or programmatically
  onYearChange: function (selectedDates, dateStr, instance) {
    // Capture the current year
    dateParts.year = instance.currentYear;

    updateCustomInputWithDate();
    updateCustomInputWithTime();
  },
});

// add listener to flatpickr-monthDropdown-months so that when the user clicks on a month, the custom input field is updated
document
  .querySelector(".flatpickr-monthDropdown-months")
  .addEventListener("click", function (e) {
    // Capture the current month
    const currentMonth = fpCalendar.currentMonth + 1;
    dateParts.month = currentMonth;

    updateCustomInputWithDate();
    updateCustomInputWithTime();
  });

// reset opacity of time picker and timezone when the user hover over it
document
  .querySelector(".flatpickr-calendar.hasTime .flatpickr-time")
  .addEventListener("mouseover", function (e) {
    document.querySelector(
      ".flatpickr-calendar.hasTime .flatpickr-time"
    ).style.opacity = 1;
    document.querySelector("#timezoneSelector").style.opacity = 1;
  });

// update custom input field with the selected timezone
timezoneSelector.addEventListener("change", function () {
  timeParts.timezone = timezoneSelector.value;
  updateCustomInputWithDate();
  updateCustomInputWithTime();
});
