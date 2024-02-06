/**
 * Initialize the flatpickrCalendar instance and add event listeners to the input fields
 * @param {string} containerSelector - The selector of the container that contains the flatpickrCalendar instance
 */
export default function initDateTimePicker(containerSelector) {
  const container = document.querySelector(containerSelector);

  let selectedDateInput = "";
  const dateParts = { year: "", month: "", day: "" };
  const timeParts = { hour: "", minute: "", second: "", timezone: "" };

  // Detect user's timezone
  const userTimezoneName = moment.tz.guess();
  const userTimezoneOffset = moment.tz(userTimezoneName).format("Z");

  const dateFormatError = container.querySelector(".date-format-error");
  const todayButton = container.querySelector(".today-btn");
  const customInput = container.querySelector(".dateTimeInputField");
  const openCalendarBtn = container.querySelector(".openflatpickrCalendarBtn");

  // let yearSelector;
  let monthPickerDropdown;
  let datePickerContainer;
  let hourSelector;
  let minuteSelector;
  let secondSelector;
  let timezoneSelector;
  let clearBtn;
  let applyBtn;

  // TODO: add nullflavorDropdown
  // const nullflavorDropdown = document.getElementById("nullflavorDropdown");

  // Initialize flatpickrCalendar instance of the container
  const fpCalendar = flatpickr(container.querySelector(".flatpickrCalendar"), {
    enableTime: true,
    dateFormat: "Y-m-d H:i:S",
    defaultDate: "today",
    enableSeconds: true,
    time_24hr: true,
    positionElement: openCalendarBtn,
    appendTo: container,
    onReady: function (selectedDates, dateStr, instance) {
      // Add timezone dropdown to the calendar
      // TimeZone Dropdown
      const timezone_names = moment.tz.names();
      // Create select element and populate timezone dropdown with options
      timezoneSelector = document.createElement("select");
      timezoneSelector.classList.add("timezoneSelector");

      timezone_names.forEach((timezone) => {
        let timezoneOffset = moment.tz(timezone).format("Z");
        let option = document.createElement("option");
        option.value = timezoneOffset;
        option.text = timezone + " " + timezoneOffset;
        // Set default selection to user's timezone
        if (timezone === userTimezoneName) {
          option.selected = true;
        }
        timezoneSelector.appendChild(option);
      });

      instance.calendarContainer.appendChild(timezoneSelector);
      // ./ TimeZone Dropdown

      // Add clear and apply buttons to the calendar
      const clearApplyBtnContainer = document.createElement("div");
      clearApplyBtnContainer.classList.add("clearApplyBtnContainer");
      clearBtn = document.createElement("button");
      clearBtn.classList.add("clearBtn");
      clearBtn.innerHTML = "Clear";
      applyBtn = document.createElement("button");
      applyBtn.classList.add("applyBtn");
      applyBtn.innerHTML = "Apply";

      clearApplyBtnContainer.appendChild(clearBtn);
      clearApplyBtnContainer.appendChild(applyBtn);
      instance.calendarContainer.appendChild(clearApplyBtnContainer);
      // ./ Add clear and apply buttons to the calendar

      // yearSelector = container.querySelector(
      //   ".flatpickr-month .numInputWrapper"
      // );
      monthPickerDropdown = container.querySelector(
        ".flatpickr-monthDropdown-months"
      );
      datePickerContainer = container.querySelector(
        ".flatpickr-innerContainer"
      );

      addClassesToTimeInputWrappers();
      hourSelector = container.querySelector(".flatpickr-hour-wrapper");
      minuteSelector = container.querySelector(".flatpickr-minute-wrapper");
      secondSelector = container.querySelector(".flatpickr-second-wrapper");
    },

    onOpen: function (selectedDates, dateStr, instance) {
      // TODO: reset nullflavorDropdown
      // nullflavorDropdown.value = "";
      // nullflavorDropdown.style.color = "#999";

      // if custom input has a value,
      // parse the date and time from the custom input and set the flatpickrCalendar instance to the custom input value
      const parsedDateObj = parseDateFromCustomInput(customInput.value);

      if (parsedDateObj) {
        activateSelector(parsedDateObj.granularity);
        instance.setDate(parsedDateObj.parsedDate);

        // set selected timezone in the timezoneSelector based on the user's input
        if (parsedDateObj.timezoneOffset) {
          timezoneSelector.value = parsedDateObj.timezoneOffset;
        }
      } else {
        // Capture the current year
        dateParts.year = instance.currentYear;
        constructDatetimeString();
      }
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

      // if hourSelector is active, capture the current hour
      if (hourSelector.classList.contains("active")) {
        timeParts.hour = selectedDates[0].getHours();
        timeParts.timezone = timezoneSelector.value;
      }
      if (minuteSelector.classList.contains("active")) {
        timeParts.minute = selectedDates[0].getMinutes();
      }
      if (secondSelector.classList.contains("active")) {
        timeParts.second = selectedDates[0].getSeconds();
      }

      constructDatetimeString();
    },

    // Triggered when the month is changed, either by the user or programmatically
    onMonthChange: function (selectedDates, dateStr, instance) {
      if (!monthPickerDropdown.classList.contains("active")) {
        monthPickerDropdown.style.opacity = 1;
        monthPickerDropdown.classList.add("active");
      }

      // Capture the current month
      dateParts.year = fpCalendar.currentYear;
      dateParts.month = fpCalendar.currentMonth + 1;

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
  openCalendarBtn.addEventListener("click", function (e) {
    e.preventDefault();
    fpCalendar.toggle();
  });

  customInput.addEventListener("change", function (e) {
    e.preventDefault();
    parseDateFromCustomInput(e.target.value);
  });

  // listener for monthDropdown,
  // when the user first time clicks on it, month is captured
  monthPickerDropdown.addEventListener("click", function (e) {
    if (!monthPickerDropdown.classList.contains("active")) {
      activateMonthSelector();
      constructDatetimeString();
    }
  });

  // listener for hourSelector,
  // reset opacity of hour picker and timezone when the user first time clicks on it
  hourSelector.addEventListener("click", function (e) {
    if (!hourSelector.classList.contains("active")) {
      activateHourSelector();
      constructDatetimeString();
    }
  });
  // If the user changes the hour manually by typing, update the timeParts.hour
  hourSelector.addEventListener("change", function (e) {
    const selectedHour = Number(e.target.value);
    if (selectedHour !== NaN && selectedHour >= 0 && selectedHour <= 23) {
      timeParts.hour = selectedHour;
      constructDatetimeString();
    }
  });

  // listener for minuteSelector,
  // reset opacity of minute picker and timezone when the user first time clicks on it
  minuteSelector.addEventListener("click", function (e) {
    if (!minuteSelector.classList.contains("active")) {
      activateMinuteSelector();
      constructDatetimeString();
    }
  });
  // If the user changes the minute manually by typing, update the timeParts.minute
  minuteSelector.addEventListener("change", function (e) {
    const selectedMinutes = Number(e.target.value);
    if (selectedMinutes !== NaN && selectedMinutes >= 0 && selectedMinutes <= 59) {
      timeParts.minute = selectedMinutes;
      constructDatetimeString();
    }
  });

  // listener for secondSelector,
  // reset opacity of second
  secondSelector.addEventListener("click", function (e) {
    if (!secondSelector.classList.contains("active")) {
      activateSecondSelector();
      constructDatetimeString();
    }
  });
  // If the user changes the second manually by typing, update the timeParts.second
  secondSelector.addEventListener("change", function (e) {
    const selectedSeconds = Number(e.target.value);
    if (selectedSeconds !== NaN && selectedSeconds >= 0 && selectedSeconds <= 59) {
      timeParts.second = selectedSeconds;
      constructDatetimeString();
    }
  });

  // listener for timezoneSelector,
  // update custom input field with the selected timezone
  timezoneSelector.addEventListener("change", function () {
    timeParts.timezone = timezoneSelector.value;
    constructDatetimeString();
  });

  // listener for clearBtn,
  // clear the flatpickrCalendar instance, openCalendar input and custom input fields
  clearBtn.addEventListener("click", function () {
    customInput.style.border = "1px solid #767676";
    dateFormatError.style.display = "none";
    customInput.value = "";

    resetflatpickrCalendar();
  });

  // listener for applyBtn,
  // Insert the selected datetime into the custom input field by clicking the apply button
  applyBtn.addEventListener("click", function () {
    customInput.value = selectedDateInput;
    customInput.style.border = "1px solid #767676";
    dateFormatError.style.display = "none";

    // close flatpickrCalendar
    fpCalendar.close();
  });

  // listener for todayButton,
  // set the current date and time to the custom input field by clicking the today button
  todayButton.addEventListener("click", function () {
    const currentDate = moment.tz(userTimezoneName).toDate();
    customInput.value = moment(currentDate).format("YYYY-MM-DD");

    resetflatpickrCalendar();

    // TODO reset nullflavorDropdown
    // nullflavorDropdown.style.color = "#999";
    // nullflavorDropdown.value = "";
  });

  // ./ ---LISTENERS---

  // ---FUNCTIONS---
  /**
   * Constructs a dateformat string and a selected date string based on `dateParts` values.
   * Updates the dateFormat for the flatpickrCalendar instance.
   * Updates the flatpickrCalendar input with the selected date string.
   */
  function constructDatetimeString() {
    let selectedDate = "";
    let dateFormat = "";
    let timeZoneOffset = userTimezoneOffset;

    if (dateParts.year) {
      selectedDate += dateParts.year;
      dateFormat += "YYYY";
    }
    if (dateParts.month) {
      selectedDate += `-${dateParts.month}`;
      dateFormat += "-MM";
    }
    if (dateParts.day) {
      selectedDate += `-${dateParts.day}`;
      dateFormat += "-DD";
    }
    if (timeParts.hour !== "") {
      selectedDate += ` ${timeParts.hour}`;
      dateFormat += " HH";
    }
    if (timeParts.minute !== "") {
      selectedDate += `:${timeParts.minute}`;
      dateFormat += ":mm";
    }
    if (timeParts.second !== "") {
      selectedDate += `:${timeParts.second}`;
      dateFormat += ":ss";
    }
    if (timeParts.timezone !== "") {
      timeZoneOffset = timeParts.timezone;
      // " [z]Z" is used to display the timezone offset in the format "z+00:00"
      // "Z" is used to set the timezone offset for moment.js, "[z]" is used to add the 'z' to the string
      dateFormat += " [z]Z";
    }

    // Construct the date format string
    // utcOffset is used to set the timezone offset but it doesn't change time provided by the user
    selectedDateInput = moment(selectedDate, dateFormat)
      .utcOffset(timeZoneOffset, true)
      .format(dateFormat);
  }

  /**
   * Select all the parent wrappers of the time input elements
   * Add additional classes to the wrappers based on the child class
   */
  function addClassesToTimeInputWrappers() {
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

  /**
   * Activate the month picker
   * Set the opacity to 1 and add active class
   */
  function activateMonthSelector() {
    monthPickerDropdown.style.opacity = 1;
    monthPickerDropdown.classList.add("active");

    // Capture the current month
    dateParts.year = fpCalendar.currentYear;
    dateParts.month = fpCalendar.currentMonth + 1;
  }

  /**
   * Activate the month, date, hour and timezone pickers
   * Set the opacity to 1
   * Add active classes
   * Capture the current date parts and time parts
   * Set the dateParts and timeParts
   */
  function activateHourSelector() {
    monthPickerDropdown.style.opacity = 1;
    datePickerContainer.style.opacity = 1;
    hourSelector.style.opacity = 1;
    timezoneSelector.style.opacity = 1;

    // add active class to hourSelector
    hourSelector.classList.add("active");

    dateParts.year = fpCalendar.selectedDates[0].getFullYear();
    dateParts.month = fpCalendar.selectedDates[0].getMonth() + 1;
    dateParts.day = fpCalendar.selectedDates[0].getDate();
    timeParts.hour = fpCalendar.selectedDates[0].getHours();
    timeParts.timezone = timezoneSelector.value;
  }

  /**
   * Activate the month, date, hour, minute and timezone pickers
   * Set the opacity to 1
   * Add active classes
   * Capture the current date parts and time parts
   * Set the dateParts and timeParts
   */
  function activateMinuteSelector() {
    monthPickerDropdown.style.opacity = 1;
    datePickerContainer.style.opacity = 1;
    hourSelector.style.opacity = 1;
    minuteSelector.style.opacity = 1;
    timezoneSelector.style.opacity = 1;

    // add active class to hourSelector
    hourSelector.classList.add("active");
    // add active class to minuteSelector
    minuteSelector.classList.add("active");

    dateParts.year = fpCalendar.selectedDates[0].getFullYear();
    dateParts.month = fpCalendar.selectedDates[0].getMonth() + 1;
    dateParts.day = fpCalendar.selectedDates[0].getDate();
    timeParts.hour = fpCalendar.selectedDates[0].getHours();
    timeParts.minute = fpCalendar.selectedDates[0].getMinutes();
    timeParts.timezone = timezoneSelector.value;
  }

  /**
   * Activate the month, date, hour, minute, second and timezone pickers
   * Set the opacity to 1
   * Add active classes
   * Capture the current date parts and time parts
   * Set the dateParts and timeParts
   */
  function activateSecondSelector() {
    monthPickerDropdown.style.opacity = 1;
    datePickerContainer.style.opacity = 1;
    hourSelector.style.opacity = 1;
    minuteSelector.style.opacity = 1;
    secondSelector.style.opacity = 1;
    timezoneSelector.style.opacity = 1;

    // add active class to hourSelector
    hourSelector.classList.add("active");
    // add active class to minuteSelector
    minuteSelector.classList.add("active");
    // add active class to secondSelector
    secondSelector.classList.add("active");

    dateParts.year = fpCalendar.selectedDates[0].getFullYear();
    dateParts.month = fpCalendar.selectedDates[0].getMonth() + 1;
    dateParts.day = fpCalendar.selectedDates[0].getDate();
    timeParts.hour = fpCalendar.selectedDates[0].getHours();
    timeParts.minute = fpCalendar.selectedDates[0].getMinutes();
    timeParts.second = fpCalendar.selectedDates[0].getSeconds();
    timeParts.timezone = timezoneSelector.value;
  }

  /**
   * Activate the selector based on the selector identifier
   * @param {string} selector - The granular part of the date and time. E.g. month, hour, minute, second
   */
  function activateSelector(selector) {
    switch (selector) {
      case "month":
        activateMonthSelector();
        break;
      case "day":
        monthPickerDropdown.style.opacity = 1;
        datePickerContainer.style.opacity = 1;
        break;
      case "hour":
        activateHourSelector();
        break;
      case "minute":
        activateMinuteSelector();
        break;
      case "second":
        activateSecondSelector();
        break;
      default:
        break;
    }
  }

  /**
   * Reset the flatpickrCalendar instance to the current date and time
   * Reset the opacity of month picker, date picker, time picker and timezone picker
   * Remove active classes from selectors
   * Reset dateParts and timeParts
   */
  function resetflatpickrCalendar() {
    fpCalendar.setDate("today");
    selectedDateInput = fpCalendar.currentYear;

    monthPickerDropdown.style.opacity = 0.4;
    datePickerContainer.style.opacity = 0.4;
    hourSelector.style.opacity = 0.4;
    minuteSelector.style.opacity = 0.4;
    secondSelector.style.opacity = 0.4;
    timezoneSelector.style.opacity = 0.4;

    monthPickerDropdown.classList.remove("active");
    hourSelector.classList.remove("active");
    minuteSelector.classList.remove("active");
    secondSelector.classList.remove("active");

    // reset timezones to user's timezone
    for (let option of timezoneSelector.options) {
      if (option.text.includes(userTimezoneName)) {
        option.selected = true;
        break;
      }
    }

    Object.keys(dateParts).forEach((key) => (dateParts[key] = ""));
    Object.keys(timeParts).forEach((key) => (timeParts[key] = ""));
  }

  /**
   * Parse and validate the datetime from the custom input field
   * @param {string} dateStr - The datetime string from the custom input field
   * @returns {object} - The parsed date, timezone, and granularity
   */
  function parseDateFromCustomInput(dateStr) {
    let timezoneOffset = null;

    if (dateStr === "") {
      customInput.style.border = "1px solid #767676";
      dateFormatError.style.display = "none";
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
      const parsedDateMoment = moment(dateStr, format, true);

      if (parsedDateMoment.isValid()) {
        if (format.includes("[z]Z")) {
          // get timezoneOffset from the date string
          // e.g. "2024-02-03 02:00:00 z+03:00" => "+03:00"
          // "(?<=z)" is a positive lookbehind assertion
          const timezoneMatch = dateStr.match(/(?<=z)[+-]\d{2}:\d{2}$/);
          timezoneOffset = timezoneMatch ? timezoneMatch[0] : null;

          // remove the timezone from the format
          // format = format.replace(" [z]Z", "");

          // set the time back to the original timezone, so that the time doesn't change
          // since the time was changed with the timezone offset provided by the user
          selectedDateInput = parsedDateMoment.utcOffset(timezoneOffset, false).format(format);
        } else {
          selectedDateInput = parsedDateMoment.format(format);
        }

        customInput.style.border = "1px solid #767676";
        dateFormatError.style.display = "none";

        return { parsedDate: selectedDateInput, timezoneOffset, granularity };
      }
    }

    console.error("Invalid date format");
    // make the custom input field red
    customInput.style.border = "1px solid red";
    dateFormatError.style.display = "block";
    return null;
  }
  // ./ ---FUNCTIONS---
}
