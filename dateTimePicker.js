/**
 * Initialize the flatpickrCalendar instance and add event listeners to the input fields
 * @param {string} containerSelector - The selector of the container that contains the flatpickrCalendar instance
 */
export default function initDateTimePicker(containerSelector) {
  const container = document.querySelector(containerSelector);
  const userTimezone = getUserTimezone();

  // Object to store the selected date and time parts
  const selectedDateTimeParts = createDateTimeObject();

  // Query selectors for UI elements
  const uiElements = getUIElements(container);

  const fpCalendar = initializeFlatpickr(
    container,
    userTimezone,
    uiElements,
    selectedDateTimeParts
  );

  addEventListeners(
    fpCalendar,
    uiElements,
    userTimezone,
    selectedDateTimeParts
  );
}

function createDateTimeObject() {
  return {
    date: { year: "", month: "", day: "" },
    time: { hour: "", minute: "", second: "" },
    timezone: "",
  };
}

function getUIElements(container) {
  return {
    dateFormatError: container.querySelector(".date-format-error"),
    todayButton: container.querySelector(".today-btn"),
    customInput: container.querySelector(".dateTimeInputField"),
    openCalendarBtn: container.querySelector(".openflatpickrCalendarBtn"),
    // Other UI elements will be initialized later in the setupCalendar function,
    // when the flatpickr instance is ready:
    // timezoneSelector, clearBtn, applyBtn, monthPickerDropdown,
    // datePickerContainer, hourSelector, minuteSelector, secondSelector
  };
}

function getUserTimezone() {
  return {
    name: moment.tz.guess(),
    offset: moment.tz(moment.tz.guess()).format("Z"),
  };
}

function initializeFlatpickr(
  container,
  userTimezone,
  uiElements,
  selectedDateTimeParts
) {
  const fpCalendar = flatpickr(container.querySelector(".flatpickr"), {
    enableTime: true,
    dateFormat: "Y-m-d H:i:S",
    defaultDate: "today",
    enableSeconds: true,
    time_24hr: true,
    positionElement: uiElements.openCalendarBtn,
    appendTo: container,
    onReady: (selectedDates, dateStr, instance) =>
      setupCalendar(instance, uiElements, userTimezone, container),
    onOpen: (selectedDates, dateStr, instance) =>
      handleCalendarOpen(instance, uiElements, selectedDateTimeParts),
    onChange: (selectedDates, dateStr, instance) =>
      handleCalendarChange(selectedDates, uiElements, selectedDateTimeParts),
    onMonthChange: (selectedDates, dateStr, instance) =>
      handleCalendarMonthChange(instance, uiElements, selectedDateTimeParts),
    onYearChange: (selectedDates, dateStr, instance) =>
      handleCalendarYearChange(instance, uiElements, selectedDateTimeParts),
  });

  return fpCalendar;
}

function setupCalendar(instance, uiElements, userTimezone, container) {
  // Add timezone dropdown to the calendar
  const timezoneSelector = createTimezoneDropdown(userTimezone);
  instance.calendarContainer.appendChild(timezoneSelector);

  // Add clear and apply buttons to the calendar
  const { clearApplyBtnContainer, clearBtn, applyBtn } = createClearApplyBtns();
  instance.calendarContainer.appendChild(clearApplyBtnContainer);

  // Get other UI elements and store them in the uiElements object
  const monthPickerDropdown = container.querySelector(
    ".flatpickr-monthDropdown-months"
  );
  const datePickerContainer = container.querySelector(
    ".flatpickr-innerContainer"
  );
  addClassesToTimeInputWrappers(container);
  const hourSelector = container.querySelector(".flatpickr-hour-wrapper");
  const minuteSelector = container.querySelector(".flatpickr-minute-wrapper");
  const secondSelector = container.querySelector(".flatpickr-second-wrapper");

  uiElements.timezoneSelector = timezoneSelector;
  uiElements.clearBtn = clearBtn;
  uiElements.applyBtn = applyBtn;
  uiElements.monthPickerDropdown = monthPickerDropdown;
  uiElements.datePickerContainer = datePickerContainer;
  uiElements.hourSelector = hourSelector;
  uiElements.minuteSelector = minuteSelector;
  uiElements.secondSelector = secondSelector;
}

function createTimezoneDropdown(userTimezone) {
  const timezone_names = moment.tz.names();
  // Create select element and populate timezone dropdown with options
  const timezoneSelector = document.createElement("select");
  timezoneSelector.classList.add("timezoneSelector");

  timezone_names.forEach((timezone) => {
    let timezoneOffset = moment.tz(timezone).format("Z");
    let option = document.createElement("option");
    option.value = timezoneOffset;
    option.text = timezone + " " + timezoneOffset;
    // Set default selection to user's timezone
    if (timezone === userTimezone.name) {
      option.selected = true;
    }
    timezoneSelector.appendChild(option);
  });

  return timezoneSelector;
}

function createClearApplyBtns() {
  const clearApplyBtnContainer = document.createElement("div");
  clearApplyBtnContainer.classList.add("clearApplyBtnContainer");
  const clearBtn = document.createElement("button");
  clearBtn.classList.add("clearBtn");
  clearBtn.innerHTML = "Clear";
  const applyBtn = document.createElement("button");
  applyBtn.classList.add("applyBtn");
  applyBtn.innerHTML = "Apply";

  clearApplyBtnContainer.appendChild(clearBtn);
  clearApplyBtnContainer.appendChild(applyBtn);

  return { clearApplyBtnContainer, clearBtn, applyBtn };
}

/**
 * Select all the parent wrappers of the time input elements
 * Add additional classes to the wrappers based on the child class
 */
function addClassesToTimeInputWrappers(container) {
  const numInputWrappers = container.querySelectorAll(
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

function handleCalendarOpen(fpInstance, uiElements, selectedDateTimeParts) {
  const parsedDateObj = parseDateFromCustomInput(uiElements);

  if (parsedDateObj) {
    fpInstance.setDate(parsedDateObj.parsedDate);
    activateSelector(
      parsedDateObj.granularity,
      fpInstance,
      uiElements,
      selectedDateTimeParts
    );

    // set selected timezone in the timezoneSelector based on the user's input
    if (parsedDateObj.timezoneOffset) {
      uiElements.timezoneSelector.value = parsedDateObj.timezoneOffset;
      selectedDateTimeParts.timezone = parsedDateObj.timezoneOffset;
    }
  } else {
    // Capture the current year
    selectedDateTimeParts.date.year = fpInstance.currentYear;
  }
}

function handleCalendarChange(
  selectedDates,
  uiElements,
  selectedDateTimeParts
) {
  uiElements.monthPickerDropdown.style.opacity = 1;
  uiElements.datePickerContainer.style.opacity = 1;

  // Capture the current date
  selectedDateTimeParts.date.year = selectedDates[0].getFullYear();
  selectedDateTimeParts.date.month = selectedDates[0].getMonth() + 1;
  selectedDateTimeParts.date.day = selectedDates[0].getDate();

  // if hourSelector is active, capture the current hour
  if (uiElements.hourSelector.classList.contains("active")) {
    selectedDateTimeParts.time.hour = selectedDates[0].getHours();
    selectedDateTimeParts.timezone = uiElements.timezoneSelector.value;
  }
  if (uiElements.minuteSelector.classList.contains("active")) {
    selectedDateTimeParts.time.minute = selectedDates[0].getMinutes();
  }
  if (uiElements.secondSelector.classList.contains("active")) {
    selectedDateTimeParts.time.second = selectedDates[0].getSeconds();
  }
}

function handleCalendarMonthChange(
  fpInstance,
  uiElements,
  selectedDateTimeParts
) {
  if (!uiElements.monthPickerDropdown.classList.contains("active")) {
    uiElements.monthPickerDropdown.style.opacity = 1;
    uiElements.monthPickerDropdown.classList.add("active");
  }

  // Capture the current year and month
  selectedDateTimeParts.date.year = fpInstance.currentYear;
  selectedDateTimeParts.date.month = fpInstance.currentMonth + 1;
}

function handleCalendarYearChange(
  fpInstance,
  uiElements,
  selectedDateTimeParts
) {
  // Capture the current year
  selectedDateTimeParts.date.year = fpInstance.currentYear;
}

function addEventListeners(
  fpCalendar,
  uiElements,
  userTimezone,
  selectedDateTimeParts
) {
  // listener for openCalendarInput,
  // when the user clicks on it, open the flatpickrCalendar instance
  uiElements.openCalendarBtn.addEventListener("click", function (e) {
    e.preventDefault();
    fpCalendar.toggle();
  });

  // listener for customInput change,
  // when the user types a date in the input field, parse and validate the date
  uiElements.customInput.addEventListener("change", function (e) {
    e.preventDefault();
    parseDateFromCustomInput(uiElements, e.target.value);
  });

  // listener for monthDropdown,
  // when the user first time clicks on it, month is captured
  uiElements.monthPickerDropdown.addEventListener("click", function (e) {
    if (!uiElements.monthPickerDropdown.classList.contains("active")) {
      activateMonthSelector(fpCalendar, uiElements, selectedDateTimeParts);
    }
  });

  // listener for hourSelector,
  // reset opacity of hour picker and timezone when the user first time clicks on it
  uiElements.hourSelector.addEventListener("click", function (e) {
    if (!uiElements.hourSelector.classList.contains("active")) {
      activateHourSelector(fpCalendar, uiElements, selectedDateTimeParts);
    }
  });
  // If the user changes the hour manually by typing, update the time parts.hour
  uiElements.hourSelector.addEventListener("change", function (e) {
    const selectedHour = Number(e.target.value);
    if (!isNaN(selectedHour) && selectedHour >= 0 && selectedHour <= 23) {
      selectedDateTimeParts.time.hour = selectedHour;
    }
  });

  // listener for minuteSelector,
  // reset opacity of minute picker and timezone when the user first time clicks on it
  uiElements.minuteSelector.addEventListener("click", function (e) {
    if (!uiElements.minuteSelector.classList.contains("active")) {
      activateMinuteSelector(fpCalendar, uiElements, selectedDateTimeParts);
    }
  });
  // If the user changes the minute manually by typing, update the time parts.minute
  uiElements.minuteSelector.addEventListener("change", function (e) {
    const selectedMinutes = Number(e.target.value);
    if (
      !isNaN(selectedMinutes) &&
      selectedMinutes >= 0 &&
      selectedMinutes <= 59
    ) {
      selectedDateTimeParts.time.minute = selectedMinutes;
    }
  });

  // listener for secondSelector,
  // reset opacity of second
  uiElements.secondSelector.addEventListener("click", function (e) {
    if (!uiElements.secondSelector.classList.contains("active")) {
      activateSecondSelector(fpCalendar, uiElements, selectedDateTimeParts);
    }
  });
  // If the user changes the second manually by typing, update the time parts.second
  uiElements.secondSelector.addEventListener("change", function (e) {
    const selectedSeconds = Number(e.target.value);
    if (
      !isNaN(selectedSeconds) &&
      selectedSeconds >= 0 &&
      selectedSeconds <= 59
    ) {
      selectedDateTimeParts.time.second = selectedSeconds;
    }
  });

  // listener for timezoneSelector,
  // update custom input field with the selected timezone
  uiElements.timezoneSelector.addEventListener("change", function () {
    if (uiElements.hourSelector.classList.contains("active")) {
      selectedDateTimeParts.timezone = uiElements.timezoneSelector.value;
    }
  });

  // listener for clearBtn,
  // clear the flatpickrCalendar instance, and custom input fields
  uiElements.clearBtn.addEventListener("click", function () {
    uiElements.customInput.style.border = "1px solid #767676";
    uiElements.dateFormatError.style.display = "none";
    uiElements.customInput.value = "";

    resetflatpickrCalendar(
      fpCalendar,
      uiElements,
      selectedDateTimeParts,
      userTimezone
    );
  });

  // listener for applyBtn,
  // Insert the selected datetime into the custom input field by clicking the apply button
  uiElements.applyBtn.addEventListener("click", function () {
    uiElements.customInput.style.border = "1px solid #767676";
    uiElements.dateFormatError.style.display = "none";
    uiElements.customInput.value = constructDatetimeString(
      userTimezone,
      selectedDateTimeParts
    );

    // close flatpickrCalendar
    fpCalendar.close();
  });

  // listener for todayButton,
  // set the current date and time to the custom input field by clicking the today button
  uiElements.todayButton.addEventListener("click", function () {
    const currentDate = moment.tz(userTimezone.name).toDate();
    uiElements.customInput.value = moment(currentDate).format("YYYY-MM-DD");

    resetflatpickrCalendar(
      fpCalendar,
      uiElements,
      selectedDateTimeParts,
      userTimezone
    );
  });
}

// --- HELPER FUNCTIONS ---
// Activate selectors

/**
 * Activate the selector based on the selector identifier
 * @param {string} selector - The granular part of the date and time. E.g. month, hour, minute, second
 */
function activateSelector(
  selector,
  fpInstance,
  uiElements,
  selectedDateTimeParts
) {
  switch (selector) {
    case "month":
      activateMonthSelector(fpInstance, uiElements, selectedDateTimeParts);
      break;
    case "day":
      activateDaySelector(fpInstance, uiElements, selectedDateTimeParts);
      break;
    case "hour":
      activateHourSelector(fpInstance, uiElements, selectedDateTimeParts);
      break;
    case "minute":
      activateMinuteSelector(fpInstance, uiElements, selectedDateTimeParts);
      break;
    case "second":
      activateSecondSelector(fpInstance, uiElements, selectedDateTimeParts);
      break;
    default:
      break;
  }
}

/**
 * Activate the month picker
 * Set the opacity to 1 and add active class
 * Capture the current month and year
 * @param {object} fpInstance - The flatpickr instance
 * @param {object} uiElements - The object containing the UI elements
 * @param {object} selectedDateTimeParts - The object containing the selected date and time parts
 */
function activateMonthSelector(fpInstance, uiElements, selectedDateTimeParts) {
  uiElements.monthPickerDropdown.style.opacity = 1;
  uiElements.monthPickerDropdown.classList.add("active");

  // Capture the current month
  selectedDateTimeParts.date.year = fpInstance.currentYear;
  selectedDateTimeParts.date.month = fpInstance.currentMonth + 1;
}

/**
 * Activate the month and date pickers
 * Set the opacity to 1
 * Add active classes
 * Capture the current date parts and time parts
 * Set the dateParts and timeParts
 * @param {object} fpInstance - The flatpickr instance
 * @param {object} uiElements - The object containing the UI elements
 * @param {object} selectedDateTimeParts - The object containing the selected date and time parts
 */
function activateDaySelector(fpInstance, uiElements, selectedDateTimeParts) {
  uiElements.monthPickerDropdown.style.opacity = 1;
  uiElements.datePickerContainer.style.opacity = 1;

  selectedDateTimeParts.date.year = fpInstance.selectedDates[0].getFullYear();
  selectedDateTimeParts.date.month = fpInstance.selectedDates[0].getMonth() + 1;
  selectedDateTimeParts.date.day = fpInstance.selectedDates[0].getDate();
}

/**
 * Activate the month, date, hour and timezone pickers
 * Set the opacity to 1
 * Add active classes
 * Capture the current date parts and time parts
 * Set the dateParts and timeParts
 * @param {object} fpInstance - The flatpickr instance
 * @param {object} uiElements - The object containing the UI elements
 * @param {object} selectedDateTimeParts - The object containing the selected date and time parts
 */
function activateHourSelector(fpInstance, uiElements, selectedDateTimeParts) {
  uiElements.monthPickerDropdown.style.opacity = 1;
  uiElements.datePickerContainer.style.opacity = 1;
  uiElements.hourSelector.style.opacity = 1;
  uiElements.timezoneSelector.style.opacity = 1;

  // add active class to hourSelector
  uiElements.hourSelector.classList.add("active");

  selectedDateTimeParts.date.year = fpInstance.selectedDates[0].getFullYear();
  selectedDateTimeParts.date.month = fpInstance.selectedDates[0].getMonth() + 1;
  selectedDateTimeParts.date.day = fpInstance.selectedDates[0].getDate();
  selectedDateTimeParts.time.hour = fpInstance.selectedDates[0].getHours();
  selectedDateTimeParts.timezone = uiElements.timezoneSelector.value;
}

/**
 * Activate the month, date, hour, minute and timezone pickers
 * Set the opacity to 1
 * Add active classes
 * Capture the current date parts and time parts
 * Set the dateParts and timeParts
 * @param {object} fpInstance - The flatpickr instance
 * @param {object} uiElements - The object containing the UI elements
 * @param {object} selectedDateTimeParts - The object containing the selected date and time parts
 */
function activateMinuteSelector(fpInstance, uiElements, selectedDateTimeParts) {
  uiElements.monthPickerDropdown.style.opacity = 1;
  uiElements.datePickerContainer.style.opacity = 1;
  uiElements.hourSelector.style.opacity = 1;
  uiElements.minuteSelector.style.opacity = 1;
  uiElements.timezoneSelector.style.opacity = 1;

  // add active class to hourSelector
  uiElements.hourSelector.classList.add("active");
  // add active class to minuteSelector
  uiElements.minuteSelector.classList.add("active");

  selectedDateTimeParts.date.year = fpInstance.selectedDates[0].getFullYear();
  selectedDateTimeParts.date.month = fpInstance.selectedDates[0].getMonth() + 1;
  selectedDateTimeParts.date.day = fpInstance.selectedDates[0].getDate();
  selectedDateTimeParts.time.hour = fpInstance.selectedDates[0].getHours();
  selectedDateTimeParts.time.minute = fpInstance.selectedDates[0].getMinutes();
  selectedDateTimeParts.timezone = uiElements.timezoneSelector.value;
}

/**
 * Activate the month, date, hour, minute, second and timezone pickers
 * Set the opacity to 1
 * Add active classes
 * Capture the current date parts and time parts
 * Set the dateParts and timeParts
 * @param {object} fpInstance - The flatpickr instance
 * @param {object} uiElements - The object containing the UI elements
 * @param {object} selectedDateTimeParts - The object containing the selected date and time parts
 */
function activateSecondSelector(fpInstance, uiElements, selectedDateTimeParts) {
  uiElements.monthPickerDropdown.style.opacity = 1;
  uiElements.datePickerContainer.style.opacity = 1;
  uiElements.hourSelector.style.opacity = 1;
  uiElements.minuteSelector.style.opacity = 1;
  uiElements.secondSelector.style.opacity = 1;
  uiElements.timezoneSelector.style.opacity = 1;

  // add active class to hourSelector
  uiElements.hourSelector.classList.add("active");
  // add active class to minuteSelector
  uiElements.minuteSelector.classList.add("active");
  // add active class to secondSelector
  uiElements.secondSelector.classList.add("active");

  selectedDateTimeParts.date.year = fpInstance.selectedDates[0].getFullYear();
  selectedDateTimeParts.date.month = fpInstance.selectedDates[0].getMonth() + 1;
  selectedDateTimeParts.date.day = fpInstance.selectedDates[0].getDate();
  selectedDateTimeParts.time.hour = fpInstance.selectedDates[0].getHours();
  selectedDateTimeParts.time.minute = fpInstance.selectedDates[0].getMinutes();
  selectedDateTimeParts.time.second = fpInstance.selectedDates[0].getSeconds();
  selectedDateTimeParts.timezone = uiElements.timezoneSelector.value;
}

// ./Activate selectors

/**
 * Parse and validate the datetime from the custom input field
 * @param {object} uiElements - The object containing the UI elements
 * @param {string} customInputValue(optional) - The value of the custom input field
 * @returns {object} - The parsed date, timezoneOffset, and granularity
 */
function parseDateFromCustomInput(uiElements, customInputValue) {
  let timezoneOffset = null;
  let parsedDate = null;
  const inputValue = customInputValue || uiElements.customInput.value;

  if (inputValue === "") {
    uiElements.customInput.style.border = "1px solid #767676";
    uiElements.dateFormatError.style.display = "none";
    return null;
  }
  const formats = [
    { format: "YYYY-MM-DD HH:mm:ss [z]Z", granularity: "second" },
    { format: "YYYY-MM-DD HH:mm:ss", granularity: "second" },
    { format: "YYYY-MM-DD HH:mm [z]Z", granularity: "minute" },
    { format: "YYYY-MM-DD HH:mm", granularity: "minute" },
    { format: "YYYY-MM-DD HH [z]Z", granularity: "hour" },
    { format: "YYYY-MM-DD HH", granularity: "hour" },
    { format: "YYYY-MM-DD", granularity: "day" },
    { format: "YYYY-MM", granularity: "month" },
    { format: "YYYY", granularity: "year" },
  ];

  for (let { format, granularity } of formats) {
    // true for strict parsing
    const parsedDateMoment = moment(inputValue, format, true);

    if (parsedDateMoment.isValid()) {
      if (format.includes("[z]Z")) {
        // get timezoneOffset from the date string
        // e.g. "2024-02-03 02:00:00 z+03:00" => "+03:00"
        // "(?<=z)" is a positive lookbehind assertion
        const timezoneMatch = inputValue.match(/(?<=z)[+-]\d{2}:\d{2}$/);
        timezoneOffset = timezoneMatch ? timezoneMatch[0] : null;

        // set the time back to the original timezone, so that the time doesn't change
        // since the time was changed with the timezone offset provided by the user
        parsedDate = parsedDateMoment
          .utcOffset(timezoneOffset, false)
          .format(format);
      } else {
        parsedDate = parsedDateMoment.format(format);
      }

      uiElements.customInput.style.border = "1px solid #767676";
      uiElements.dateFormatError.style.display = "none";

      return { parsedDate, timezoneOffset, granularity };
    }
  }

  console.error("Invalid date format");
  // make the custom input field red
  uiElements.customInput.style.border = "1px solid red";
  uiElements.dateFormatError.style.display = "block";
  return null;
}

/**
 * Constructs a dateformat string based on `selectedDateTimeParts` values.
 * @param {object} userTimezone - The user's timezone object
 * @param {object} selectedDateTimeParts - The object containing the selected date and time parts
 * @returns {string} - The date string in the appropriate format, based on non-empty `selectedDateTimeParts` values
 * E.g. "2024-02-03 02:10:00 z+03:00" or "2024-02-03" or "2024-02-03 02 z+03:00" etc.
 */
function constructDatetimeString(userTimezone, selectedDateTimeParts) {
  let result = "";
  let selectedDate = "";
  let dateFormat = "";
  let timeZoneOffset = userTimezone.offset;

  if (selectedDateTimeParts.date.year) {
    selectedDate += selectedDateTimeParts.date.year;
    dateFormat += "YYYY";
  }
  if (selectedDateTimeParts.date.month) {
    selectedDate += `-${selectedDateTimeParts.date.month}`;
    dateFormat += "-MM";
  }
  if (selectedDateTimeParts.date.day) {
    selectedDate += `-${selectedDateTimeParts.date.day}`;
    dateFormat += "-DD";
  }
  if (selectedDateTimeParts.time.hour !== "") {
    selectedDate += ` ${selectedDateTimeParts.time.hour}`;
    dateFormat += " HH";
  }
  if (selectedDateTimeParts.time.minute !== "") {
    selectedDate += `:${selectedDateTimeParts.time.minute}`;
    dateFormat += ":mm";
  }
  if (selectedDateTimeParts.time.second !== "") {
    selectedDate += `:${selectedDateTimeParts.time.second}`;
    dateFormat += ":ss";
  }
  if (selectedDateTimeParts.timezone !== "") {
    timeZoneOffset = selectedDateTimeParts.timezone;
    // " [z]Z" is used to display the timezone offset in the format "z+00:00"
    // "Z" is used to set the timezone offset for moment.js, "[z]" is used to add the 'z' to the string
    dateFormat += " [z]Z";
  }

  // Construct the date format string
  // utcOffset is used to set the timezone offset but it doesn't change time provided by the user
  result = moment(selectedDate, dateFormat)
    .utcOffset(timeZoneOffset, true)
    .format(dateFormat);

  return result;
}

/**
 * Reset the flatpickrCalendar instance to the current date and time
 * Reset the opacity of month picker, date picker, time picker and timezone picker
 * Remove active classes from selectors
 * Reset dateParts, timeParts, and timezone
 */
function resetflatpickrCalendar(
  fpCalendar,
  uiElements,
  selectedDateTimeParts,
  userTimezone
) {
  fpCalendar.setDate("today");
  // selectedDateInput = fpCalendar.currentYear;

  uiElements.monthPickerDropdown.style.opacity = 0.4;
  uiElements.datePickerContainer.style.opacity = 0.4;
  uiElements.hourSelector.style.opacity = 0.4;
  uiElements.minuteSelector.style.opacity = 0.4;
  uiElements.secondSelector.style.opacity = 0.4;
  uiElements.timezoneSelector.style.opacity = 0.4;

  uiElements.monthPickerDropdown.classList.remove("active");
  uiElements.hourSelector.classList.remove("active");
  uiElements.minuteSelector.classList.remove("active");
  uiElements.secondSelector.classList.remove("active");

  // reset timezones to user's timezone in the timezoneSelector
  for (let option of uiElements.timezoneSelector.options) {
    if (option.text.includes(userTimezone.name)) {
      option.selected = true;
      break;
    }
  }

  // reset dateParts, timeParts, and timezone
  Object.keys(selectedDateTimeParts.date).forEach(
    (key) => (selectedDateTimeParts.date[key] = "")
  );
  Object.keys(selectedDateTimeParts.time).forEach(
    (key) => (selectedDateTimeParts.time[key] = "")
  );
  selectedDateTimeParts.timezone = "";

  // set the current year by default
  selectedDateTimeParts.date.year = fpCalendar.currentYear;
}
