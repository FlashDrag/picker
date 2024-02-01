import timezoneSelector from "./timeZone.js";
import { clearApplyBtnContainer, clearBtn, applyBtn } from "./clearApplyBtn.js";

const dateParts = { year: "", month: "", day: "" };
const timeParts = { hour: "", minute: "", second: "", timezone: "" };

const customInput = document.getElementById("customInputField");
const openCalendarInput = document.getElementById("openflatpickrCalendar");

let yearSelector;
let monthPickerDropdown;
let datePickerContainer;
let datePickers;
let hourSelector;
let minuteSelector;
let secondSelector;

const todayButton = document.querySelector(".today-btn");

const nullflavorDropdown = document.getElementById("nullflavorDropdown");

const fpCalendar = flatpickr("#flatpickrCalendar", {
  enableTime: true,
  dateFormat: "Y-m-d H:i:S",
  defaultHour: 0,
  defaultDate: "today",
  enableSeconds: true,
  time_24hr: true,
  onReady: function (selectedDates, dateStr, instance) {
    // Add timezone dropdown to the calendar
    instance.calendarContainer.appendChild(timezoneSelector);
    // Add clear and apply buttons to the calendar
    instance.calendarContainer.appendChild(clearApplyBtnContainer);

    yearSelector = document.querySelector(".flatpickr-month .numInputWrapper");
    monthPickerDropdown = document.querySelector(
      ".flatpickr-monthDropdown-months"
    );
    datePickerContainer = document.querySelector(".flatpickr-innerContainer");
    datePickers = document.querySelectorAll(".flatpickr-day");

    addClassesToTimeInputWrappers();
    hourSelector = document.querySelector(".flatpickr-hour-wrapper");
    minuteSelector = document.querySelector(".flatpickr-minute-wrapper");
    secondSelector = document.querySelector(".flatpickr-second-wrapper");


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

    // set current month as selected month
    const currentMonth = instance.currentMonth + 1;
    monthPickerDropdown.value = currentMonth;
    console.log(monthPickerDropdown.value);

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

    console.log("onChange");

    // if hourSelector is active, capture the current hour
    if (hourSelector.classList.contains("active")) {
      timeParts.hour = selectedDates[0].getHours();
    }

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

// listener for openCalendarInput,
// when the user clicks on it, open the flatpickrCalendar instance
openCalendarInput.addEventListener("click", function (e) {
  fpCalendar.open();
});

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
// when the user clicks on it, the new date is captured
// datePickers.forEach((datePicker) => {
//   datePicker.addEventListener("click", function (e) {
//     e.preventDefault();
//     console.log("datePicker clicked");
//     // Capture the current date
//     const currentDate = fpCalendar.selectedDates[0].getDate();
//     dateParts.day = currentDate;

//     constructDatetimeString();
//   });
// });

// listener for hourSelector,
// reset opacity of hour picker and timezone when the user hover over it
hourSelector.addEventListener("click", function (e) {
  console.log("hourSelector clicked");
  monthPickerDropdown.style.opacity = 1;
  datePickerContainer.style.opacity = 1;
  hourSelector.style.opacity = 1;
  timezoneSelector.style.opacity = 1;

  // add active class to hourSelector
  hourSelector.classList.add("active");

  constructDatetimeString();
});

// listener for minuteSelector,
// reset opacity of minute
minuteSelector.addEventListener("click", function (e) {
  monthPickerDropdown.style.opacity = 1;
  datePickerContainer.style.opacity = 1;
  hourSelector.style.opacity = 1;
  minuteSelector.style.opacity = 1;
  timezoneSelector.style.opacity = 1;

  const currentHour = fpCalendar.currentHour;
  const currentMinute = fpCalendar.currentMinute;
  timeParts.hour = currentHour;
  timeParts.minute = currentMinute;
});

// listener for secondSelector,
// reset opacity of second
secondSelector.addEventListener("click", function (e) {
  monthPickerDropdown.style.opacity = 1;
  datePickerContainer.style.opacity = 1;
  hourSelector.style.opacity = 1;
  minuteSelector.style.opacity = 1;
  secondSelector.style.opacity = 1;
  timezoneSelector.style.opacity = 1;

  const currentHour = fpCalendar.currentHour;
  const currentMinute = fpCalendar.currentMinute;
  const currentSecond = fpCalendar.currentSecond;
  timeParts.hour = currentHour;
  timeParts.minute = currentMinute;
  timeParts.second = currentSecond;
});

// listener for month Selector,
// reset opacity of month picker when user clicks on it
monthPickerDropdown.addEventListener("click", function (e) {
  monthPickerDropdown.style.opacity = 1;
});

// listener for timezoneSelector,
// update custom input field with the selected timezone
timezoneSelector.addEventListener("change", function () {
  timeParts.timezone = timezoneSelector.value;
});

// listener for clearBtn,
// clear the flatpickrCalendar input and custom input field by clicking the clear button
// set opacity of month picker, date picker, time picker and timezone picker to 0.3
// reset dateParts and timeParts
clearBtn.addEventListener("click", function () {
  flatpickrCalendar.value = "";
  customInput.value = "";

  monthPickerDropdown.style.opacity = 0.4;
  datePickerContainer.style.opacity = 0.4;
  hourSelector.style.opacity = 0.4;
  minuteSelector.style.opacity = 0.4;
  secondSelector.style.opacity = 0.4;
  timezoneSelector.style.opacity = 0.4;

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
  customInput.value = `${currentDate.getFullYear()}-${
    currentDate.getMonth() + 1
  }-${currentDate.getDate()}`;

  // reset flatpickrCalendar
  monthPickerDropdown.style.opacity = 0.4;
  datePickerContainer.style.opacity = 0.4;
  hourSelector.style.opacity = 0.4;
  minuteSelector.style.opacity = 0.4;
  secondSelector.style.opacity = 0.4;
  timezoneSelector.style.opacity = 0.4;

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
  if (timeParts.hour !== "") {
    dateFormat += " H";
    selectedDate += ` ${timeParts.hour}`;
  }
  if (timeParts.minute !== "") {
    dateFormat += ":i";
    selectedDate += `:${timeParts.minute}`;
  }
  if (timeParts.second !== "") {
    dateFormat += ":S";
    selectedDate += `:${timeParts.second}`;
  }

  // update dateFormat for flatpickrCalendar instance
  fpCalendar.config.dateFormat = dateFormat;
  // update flatpickrCalendar input
  fpCalendar.setDate(selectedDate);
  console.log("constructDatetimeString");
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

/**
 * Select all the parent wrappers of the time input elements
 * Add additional classes to the wrappers based on the child class
 */
function addClassesToTimeInputWrappers() {
  const numInputWrappers = document.querySelectorAll(
    ".flatpickr-time .numInputWrapper"
  );

  numInputWrappers.forEach((wrapper) => {
    const childClass = wrapper.firstChild.classList.value;

    if (childClass.includes("flatpickr-hour")) {
      wrapper.classList.add("flatpickr-hour-wrapper");
    } else if (childClass.includes("flatpickr-minute")) {
      wrapper.classList.add("flatpickr-minute-wrapper");
    } else if (childClass.includes("flatpickr-second")) {
      wrapper.classList.add("flatpickr-second-wrapper");
    }
  });
}

// ./ ---FUNCTIONS---
