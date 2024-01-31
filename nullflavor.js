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
