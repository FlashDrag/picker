/**
 * Initialize the flatpickrCalendar instance and add event listeners to the input fields
 * @param {string} containerSelector - The selector of the container that contains the flatpickrCalendar instance
 */
export default function initDateTimePicker(containerSelector) {
  const container = document.querySelector(containerSelector);

  const dateParts = { year: "", month: "", day: "" };
  const timeParts = { hour: "", minute: "", second: "", timezone: "" };

  const customInput = container.querySelector(".dateTimeInputField");
  const selecteDateInput = container.querySelector(".selectedDateInput");
  const openCalendarBtn = container.querySelector(".openflatpickrCalendarBtn");

  let yearSelector;
  let monthPickerDropdown;
  let datePickerContainer;
  let hourSelector;
  let minuteSelector;
  let secondSelector;
  let timezoneSelector;
  let clearBtn;
  let applyBtn;

  const todayButton = container.querySelector(".today-btn");

  // TODO: add nullflavorDropdown
  // const nullflavorDropdown = document.getElementById("nullflavorDropdown");

  // Initialize flatpickrCalendar instance of the container
  const fpCalendar = flatpickr(container.querySelector(".flatpickrCalendar"), {
    enableTime: true,
    dateFormat: "Y-m-d H:i:S",
    defaultDate: "today",
    enableSeconds: true,
    time_24hr: true,
    positionElement: customInput,
    appendTo: container,
    onReady: function (selectedDates, dateStr, instance) {
      // Add timezone dropdown to the calendar
      // TimeZone Dropdown
      const timezone_names = moment.tz.names();
      // Detect user's timezone
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      // Create select element and populate timezone dropdown with options
      timezoneSelector = document.createElement("select");
      timezoneSelector.classList.add("timezoneSelector");

      timezone_names.forEach((timezone) => {
        let timezoneOffset = moment.tz(timezone).format("Z");
        let option = document.createElement("option");
        option.value = timezoneOffset;
        option.text = timezone + " " + timezoneOffset;
        // Set default selection to user's timezone
        if (timezone === userTimezone) {
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

      yearSelector = container.querySelector(
        ".flatpickr-month .numInputWrapper"
      );
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

  // listener for yearSelector,
  // when the user clicks on it, the new year is captured
  // TODO: remove yearSelector
  // yearSelector.addEventListener("click", function (e) {
  //   // Capture the current year
  //   const currentYear = fpCalendar.currentYear;
  //   dateParts.year = currentYear;

  //   constructDatetimeString();
  // });

  // listener for monthDropdown,
  // when the user first time clicks on it, month is captured
  monthPickerDropdown.addEventListener("click", function (e) {
    if (!monthPickerDropdown.classList.contains("active")) {
      monthPickerDropdown.style.opacity = 1;
      monthPickerDropdown.classList.add("active");

      // Capture the current month
      dateParts.year = fpCalendar.currentYear;
      dateParts.month = fpCalendar.currentMonth + 1;

      constructDatetimeString();
    }
  });

  // listener for hourSelector,
  // reset opacity of hour picker and timezone when the user first time clicks on it
  hourSelector.addEventListener("click", function (e) {
    if (!hourSelector.classList.contains("active")) {
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

      constructDatetimeString();
    }
  });

  // listener for minuteSelector,
  // reset opacity of minute picker and timezone when the user first time clicks on it
  minuteSelector.addEventListener("click", function (e) {
    if (!minuteSelector.classList.contains("active")) {
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

      constructDatetimeString();
    }
  });

  // listener for secondSelector,
  // reset opacity of second
  secondSelector.addEventListener("click", function (e) {
    if (!secondSelector.classList.contains("active")) {
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
    customInput.value = "";

    resetflatpickrCalendar();
  });

  // listener for applyBtn,
  // Insert the selected datetime into the custom input field by clicking the apply button
  applyBtn.addEventListener("click", function () {
    customInput.value = selecteDateInput.value;

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

    resetflatpickrCalendar();
    setCurrentDateForFlatpickrCalendar();

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

    if (dateParts.year) {
      selectedDate += dateParts.year;
    }
    if (dateParts.month) {
      selectedDate += `-${dateParts.month}`;
    }
    if (dateParts.day) {
      selectedDate += `-${dateParts.day}`;
    }
    if (timeParts.hour !== "") {
      selectedDate += ` ${timeParts.hour}`;
    }
    if (timeParts.minute !== "") {
      selectedDate += `:${timeParts.minute}`;
    }
    if (timeParts.second !== "") {
      selectedDate += `:${timeParts.second}`;
    }
    if (timeParts.timezone !== "") {
      selectedDate += ` z${timeParts.timezone}`;
    }

    selecteDateInput.value = selectedDate;
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
   * Reset the flatpickrCalendar instance to the current date and time
   * Reset the opacity of month picker, date picker, time picker and timezone picker
   * Remove active classes from selectors
   * Reset dateParts and timeParts
   */
  function resetflatpickrCalendar() {
    fpCalendar.setDate("today");
    selecteDateInput.value = fpCalendar.currentYear;

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

    // reset timezoneSelector
    timezoneSelector.value = "+00:00";

    Object.keys(dateParts).forEach((key) => (dateParts[key] = ""));
    Object.keys(timeParts).forEach((key) => (timeParts[key] = ""));
  }

  /**
   * Set the current date and time to the flatpickrCalendar instance
   * Set the current date to the openCalendarInput
   * Reset the opacity of month picker and date picker
   */
  function setCurrentDateForFlatpickrCalendar() {
    dateParts.year = fpCalendar.currentYear;
    dateParts.month = fpCalendar.currentMonth + 1;
    dateParts.day = fpCalendar.selectedDates[0].getDate();

    monthPickerDropdown.style.opacity = 1;
    datePickerContainer.style.opacity = 1;

    constructDatetimeString();
  }

  // ./ ---FUNCTIONS---
}
