import timezoneSelector from "./timeZone.js";
import { clearApplyBtnContainer, clearBtn, applyBtn } from "./clearApplyBtn.js";

const dateParts = { year: "", month: "", day: "" };
const timeParts = { hour: "", minute: "", second: "", timezone: "" };

const customInput = document.getElementById("customInputField");

let yearSelector;
let monthPickerDropdown;
let datePickerContainer;
let timeSelectorContainer;

const todayButton = document.querySelector(".today-btn");

const nullflavorDropdown = document.getElementById("nullflavorDropdown");


const fpCalendar = flatpickr("#flatpickrCalendar", {
  enableTime: true,
  dateFormat: "Y-m-d H:i:S",
  defaultHour: 0,
  enableSeconds: true,
  time_24hr: true,
  onReady: function (selectedDates, dateStr, instance) {
    // Add timezone dropdown to the calendar
    instance.calendarContainer.appendChild(timezoneSelector);
    // Add clear and apply buttons to the calendar
    instance.calendarContainer.appendChild(clearApplyBtnContainer);

    yearSelector = document.querySelector(".numInputWrapper");
    monthPickerDropdown = document.querySelector(
      ".flatpickr-monthDropdown-months"
    );
    datePickerContainer = document.querySelector(".flatpickr-innerContainer");
    timeSelectorContainer = document.querySelector(
      ".flatpickr-calendar.hasTime .flatpickr-time"
    );

    // Add "Month" and "Year" first option to the month and year dropdowns
    // const monthDropdown = document.querySelector(".flatpickr-monthDropdown-months");
    // const yearDropdown = document.querySelector(".flatpickr-monthDropdown-years");
    // const monthOption = document.createElement("option");
    // const yearOption = document.createElement("option");
    // monthOption.value = "";
    // monthOption.innerHTML = "Month";
    // yearOption.value = "";
    // yearOption.innerHTML = "Year";
    // monthDropdown.insertBefore(monthOption, monthDropdown.firstChild);
    // yearDropdown.insertBefore(yearOption, yearDropdown.firstChild);
  },

  onOpen: function (selectedDates, dateStr, instance) {
    // reset nullflavorDropdown
    nullflavorDropdown.value = "";
    nullflavorDropdown.style.color = "#999";

    // Capture the current year
    dateParts.year = instance.currentYear;

    constructDatetimeString();
  },

  onClose: function (selectedDates, dateStr, instance) {
    // reserved for future use
  },

  // Triggered when the user selects a date, or changes the time on a selected date
  onChange: function (selectedDates, dateStr, instance) {
    monthPickerDropdown.style.opacity = 1;
    datePickerContainer.style.opacity = 1;

    // Capture the current date
    dateParts.year = selectedDates[0].getFullYear();
    dateParts.month = selectedDates[0].getMonth() + 1;
    dateParts.day = selectedDates[0].getDate();
    timeParts.hour = selectedDates[0].getHours();
    timeParts.minute = selectedDates[0].getMinutes();
    timeParts.second = selectedDates[0].getSeconds();

    constructDatetimeString();
  },

  // Triggered when the month is changed, either by the user or programmatically
  onMonthChange: function (selectedDates, dateStr, instance) {
    // reset opacity of month picker
    monthPickerDropdown.style.opacity = 1;

    // Capture the current month
    dateParts.month = instance.currentMonth + 1;

    constructDatetimeString();
  },

  // Triggered when the year is changed, either by the user or programmatically
  onYearChange: function (selectedDates, dateStr, instance) {
    // Capture the current year
    dateParts.year = instance.currentYear;

    constructDatetimeString();
  },
});

// ---LISTENERS---

// listener for yearSelector,
// when the user clicks on it, the new year is captured
yearSelector.addEventListener("click", function (e) {
  // Capture the current year
  const currentYear = fpCalendar.currentYear;
  dateParts.year = currentYear;

  constructDatetimeString();
});

// listener for monthDropdown,
// when the user clicks on it, the new month is captured
monthPickerDropdown.addEventListener("click", function (e) {
  // Capture the current month
  const currentMonth = fpCalendar.currentMonth + 1;
  dateParts.month = currentMonth;

  constructDatetimeString();
});

// listener for datePickerContainer,
// reset opacity of time picker and timezone when the user hover over it
timeSelectorContainer.addEventListener("click", function (e) {
  timeSelectorContainer.style.opacity = 1;
  timezoneSelector.style.opacity = 1;
});

// listener for timeSelectorContainer,
// reset opacity of month picker when user clicks on it
monthPickerDropdown.addEventListener("click", function (e) {
  monthPickerDropdown.style.opacity = 1;
});

// listener for timezoneSelector,
// update custom input field with the selected timezone
timezoneSelector.addEventListener("change", function () {
  timeParts.timezone = timezoneSelector.value;
  updateCustomInputWithDate();
  updateCustomInputWithTime();
});

// listener for clearBtn,
// clear the flatpickrCalendar input and custom input field by clicking the clear button
// set opacity of month picker, date picker, time picker and timezone picker to 0.3
// reset dateParts and timeParts
clearBtn.addEventListener("click", function () {
  flatpickrCalendar.value = "";
  customInput.value = "";

  monthPickerDropdown.style.opacity = 0.3;
  datePickerContainer.style.opacity = 0.3;
  timeSelectorContainer.style.opacity = 0.3;
  timezoneSelector.style.opacity = 0.3;

  Object.keys(dateParts).forEach((key) => (dateParts[key] = ""));
  Object.keys(timeParts).forEach((key) => (timeParts[key] = ""));

  constructDatetimeString();
});

// listener for applyBtn,
// Insert the selected datetime into the custom input field by clicking the apply button
applyBtn.addEventListener("click", function () {

  // update custom input field
  updateCustomInputWithDate();
  updateCustomInputWithTime();

  // close flatpickrCalendar
  fpCalendar.close();
});

// listener for todayButton,
// set the current date and time to the custom input field by clicking the today button
todayButton.addEventListener("click", function () {
  const currentDate = new Date();
  customInput.value = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()}`

  // reset flatpickrCalendar
  monthPickerDropdown.style.opacity = 0.3;
  datePickerContainer.style.opacity = 0.3;
  timeSelectorContainer.style.opacity = 0.3;
  timezoneSelector.style.opacity = 0.3;

  Object.keys(dateParts).forEach((key) => (dateParts[key] = ""));
  Object.keys(timeParts).forEach((key) => (timeParts[key] = ""));

  constructDatetimeString();

  // reset nullflavorDropdown
  nullflavorDropdown.style.color = "#999";
  nullflavorDropdown.value = "";
});

// ./ ---LISTENERS---

// ---FUNCTIONS---
/**
 * Constructs a dateformat string and a selected date string based on `dateParts` values.
 * Updates the dateFormat for the flatpickrCalendar instance.
 * Updates the flatpickrCalendar input with the selected date string.
 */
function constructDatetimeString() {
  let dateFormat = "";
  let selectedDate = "";

  if (dateParts.year) {
    dateFormat += "Y";
    selectedDate += dateParts.year;
  }
  if (dateParts.month) {
    dateFormat += "-m";
    selectedDate += `-${dateParts.month}`;
  }
  if (dateParts.day) {
    dateFormat += "-d";
    selectedDate += `-${dateParts.day}`;
  }

  // update dateFormat for flatpickrCalendar instance
  fpCalendar.config.dateFormat = dateFormat;
  // update flatpickrCalendar input
  fpCalendar.setDate(selectedDate);
}


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

// ./ ---FUNCTIONS---