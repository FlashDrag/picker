import initDateTimePicker from "./dateTimePicker.js";

document.addEventListener("DOMContentLoaded", function () {
  initDateTimePicker("#dateOfCreationContainer");
  initDateTimePicker("#dateOfReportContainer");
  initDateTimePicker("#otherDateContainer");

  // Find all .form-container divs and loop through them
  document
    .querySelectorAll(".form-container")
    .forEach(function (formContainer) {
      // Within each formContainer, find the NullFlavor checkbox
      const checkbox = formContainer.querySelector(".form-check-input");

      // If the checkbox doesn't exist, skip this container
      if (!checkbox) {
        return;
      }

      // Find the nullFlavorOptions select and the input where the selected null flavor should be displayed
      const nullFlavorSelect =
        formContainer.querySelector(".nullFlavorOptions");
      const nullFlavorInput = formContainer.querySelector(
        ".nullflavorContainer input.form-control"
      );

      // Add an event listener to the nullFlavorOptions select
      nullFlavorSelect.addEventListener("change", function () {
        // Update the input field with the selected option's value
        nullFlavorInput.value = this.value;
      });

      // Function to toggle visibility based on the checkbox state
      function toggleContainers() {
        const dateTimeFieldContainer = formContainer.querySelector(
          ".dateTimeFieldContainer"
        );
        const nullflavorContainer = formContainer.querySelector(
          ".nullflavorContainer"
        );

        if (checkbox.checked) {
          // If the checkbox is checked, hide the dateTimeFieldContainer and show the nullflavorContainer
          dateTimeFieldContainer.classList.remove("d-block");
          dateTimeFieldContainer.classList.add("d-none");
          nullflavorContainer.classList.remove("d-none");
          nullflavorContainer.classList.add("d-flex");
          // reset the value of the nullFlavorInput and nullFlavorSelect
          nullFlavorInput.value = "";
          nullFlavorSelect.value = "";
        } else {
          // If the checkbox is unchecked, show the dateTimeFieldContainer and hide the nullflavorContainer
          dateTimeFieldContainer.classList.remove("d-none");
          dateTimeFieldContainer.classList.add("d-block");
          nullflavorContainer.classList.remove("d-flex");
          nullflavorContainer.classList.add("d-none");
        }
      }

      // Initially call toggleContainers in case the checkbox is pre-checked
      toggleContainers();

      // Setup event listener for change on the checkbox
      checkbox.addEventListener("change", toggleContainers);
    });
});
