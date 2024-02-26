/**
 * Validates datetime fields in a form and returns the updated form data.
 * - If a field is valid, it is converted to a backend-friendly format using convertUserDateTimeStrToBackendFormat function.
 * - If a field is invalid, an error is thrown and the field is highlighted.
 * @param {HTMLFormElement} form - The form to validate.
 * @returns {FormData} The form data with the datetime fields updated to a backend-friendly format.
 * @throws {Error} An error if the datetime format is invalid.
 */
export function validateDateTimeFields(form) {
  const dateTimeFields = form.querySelectorAll(".dateTimeInputField");
  const formData = new FormData(form);

  for (const field of dateTimeFields) {
    let dateTimeStr;
    try {
      dateTimeStr = convertUserDateTimeStrToBackendFormat(field.value);
    } catch (error) {
      field.style.border = "1px solid red";
      field
        .closest(".dateTimeFieldContainer")
        .querySelector(".date-format-error").style.display = "block";
      field.focus();

      throw error;
    } 
      
    formData.set(field.name, dateTimeStr);
  }
  return formData;
}

/**
 * Converts a datetime string from the backend to a more readable format.
 * This function tries various date formats until one matches, then formats it in a more readable form.
 * @param {string} dateTimeString - The date string to parse.
 * @returns {string} The parsed date string in a friendly format or the original string if no format matches.
 * @example 201606241300+0200 -> 2016-06-24 13:00 +02:00
 */
export function convertDateTimeStrToReadableFormat(dateTimeString) {
  const formats = [
    { format: "YYYYMMDDHHmmssZ", friendly_format: "YYYY-MM-DD HH:mm:ss Z" },
    { format: "YYYYMMDDHHmmss", friendly_format: "YYYY-MM-DD HH:mm:ss" },
    { format: "YYYYMMDDHHmmZ", friendly_format: "YYYY-MM-DD HH:mm Z" },
    { format: "YYYYMMDDHHmm", friendly_format: "YYYY-MM-DD HH:mm" },
    { format: "YYYYMMDDHHZ", friendly_format: "YYYY-MM-DD HH Z" },
    { format: "YYYYMMDDHH", friendly_format: "YYYY-MM-DD HH" },
    { format: "YYYYMMDD", friendly_format: "YYYY-MM-DD" },
    { format: "YYYYMM", friendly_format: "YYYY-MM" },
    { format: "YYYY", friendly_format: "YYYY" },
  ];

  for (const { format, friendly_format } of formats) {
    const parsedDateMoment = moment(dateTimeString, format, true);
    if (parsedDateMoment.isValid()) {
      // Preserve the timezone if the original format includes it
      if (format.includes("Z")) {
        const timezoneOffset = moment
          .parseZone(dateTimeString, format)
          .format("Z");
        return parsedDateMoment
          .utcOffset(timezoneOffset, false) // preserve the original date and time
          .format(friendly_format);
      }
      return parsedDateMoment.format(friendly_format);
    }
  }

  console.error(`Failed to parse date string: ${dateTimeString}`);
  // Return the original string if no format matches
  return dateTimeString;
}

/**
 * Converts a datetime string from the user to a backend-friendly format.
 * - This function tries various date formats until one matches, returns the converted date string.
 * - If no format matches or the timezone offset is invalid, an error is thrown.
 * @param {string} dateTimeString - The date string to parse.
 * @returns {string} The parsed date string in a backend-friendly format, or null if no format matches.
 * @throws An error if the date or time or timezone format is invalid.
 * @example
 * - Converted str: 2016-06-24 13:00 +02:00 -> 201606241300+0200
 * - Timezone Error: "Invalid timezone offset: -01:05"
 * - Invalid format Error: "Invalid date or time format: 2016-06-24 13:00:00:00"
 */
export function convertUserDateTimeStrToBackendFormat(dateTimeString) {
  const formats = [
    { format: "YYYY-MM-DD HH:mm:ss Z", backend_format: "YYYYMMDDHHmmssZ" },
    { format: "YYYY-MM-DD HH:mm:ss", backend_format: "YYYYMMDDHHmmss" },
    { format: "YYYY-MM-DD HH:mm Z", backend_format: "YYYYMMDDHHmmZ" },
    { format: "YYYY-MM-DD HH:mm", backend_format: "YYYYMMDDHHmm" },
    { format: "YYYY-MM-DD HH Z", backend_format: "YYYYMMDDHHZ" },
    { format: "YYYY-MM-DD HH", backend_format: "YYYYMMDDHH" },
    { format: "YYYY-MM-DD", backend_format: "YYYYMMDD" },
    { format: "YYYY-MM", backend_format: "YYYYMM" },
    { format: "YYYY", backend_format: "YYYY" },
  ];

  for (const { format, backend_format } of formats) {
    const parsedDateMoment = moment(dateTimeString, format, true);
    if (parsedDateMoment.isValid()) {
      // Preserve the timezone if the original format includes it
      if (format.includes("Z")) {
        const timezoneOffset = moment
          .parseZone(dateTimeString, format)
          .format("Z");
        if (isTimezoneOffsetValid(timezoneOffset)) {
          return parsedDateMoment
            .utcOffset(timezoneOffset, false)
            .format(backend_format);
        } else {
          throw new Error(`Invalid timezone offset: ${timezoneOffset}`);
        }
      }
      return parsedDateMoment.format(backend_format);
    }
  }

  console.error(`Failed to parse date string: ${dateTimeString}`);
  throw new Error(`Invalid date or time format: ${dateTimeString}`);
}

/**
 * Checks if the timezone offset is included in the list of valid offsets from moment-timezone.
 * @param {string} timezoneOffset - The timezone offset to validate.
 * @returns {boolean} True if the offset is valid, otherwise false.
 */
function isTimezoneOffsetValid(timezoneOffset) {
  // timezoneOffsets from moment-timezone
  const timezone_names = moment.tz.names();
  let timezoneOffsets = timezone_names.map((zone) => moment.tz(zone).format("Z"));
  timezoneOffsets = [...new Set(timezoneOffsets)]; // Remove duplicates
  return timezoneOffsets.includes(timezoneOffset);
}
