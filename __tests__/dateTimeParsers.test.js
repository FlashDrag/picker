/* To run tests locally:
 - install npm if you haven't already
 - install dependencies from package.json: npm install
 - run test: npm test
*/

import {
  validateDateTimeFields,
  convertDateTimeStrToReadableFormat,
  convertUserDateTimeStrToBackendFormat,
} from "../dateTimeParsers.js";

const validCases = [
  ["2024", "2024"],
  ["2024-01", "202401"],
  ["2024-02-20", "20240220"],
  ["2024-03-20 02", "2024032002"],
  ["2024-04-20 14 +02:00", "2024042014+0200"],
  ["2024-05-20 00:05", "202405200005"],
  ["2024-06-20 01:05 +04:00", "202406200005+0400"],
  ["2024-07-20 02:05:00", "20240720000500"],
  ["2024-08-20 18:05:00 -02:00", "20240820000500-0200"],
  ["2024-09-20 23:59:59 +01:00", "20240920000500+0100"],
  ["2024-09-20 23:59:59 +00:60", "20240920000500+0100"],
];

const invalidCases = [
  ["invalid-datetime", "Invalid date or time format: "],
  ["2024-01-01 00:00:00:00", "Invalid date or time format: "],
  ["2024-24-01", "Invalid date or time format: "],
  ["2024-01-32", "Invalid date or time format: "],
  ["2024-01-01 25", "Invalid date or time format: "],
  ["2024-01-01 00:60", "Invalid date or time format: "],
  ["2024-09-20 23:59:60", "Invalid date or time format: "],
  ["2024-01-01 00:00 +25:00", "Invalid timezone offset: +25:00"],
  ["2024-01-01 00:00 -25:00", "Invalid timezone offset: -25:00"],
  ["2024-01-01 00:00 +00:90", "Invalid timezone offset: +01:30"],
  ["2024-01-01 00:00 -00:65", "Invalid timezone offset: -01:05"],
  ["2024-09-20 23:00 +00:120", "Invalid date or time format: "],
  ["20-01-01", "Invalid date or time format: "],
  ["2024-123", "Invalid date or time format: "],
  ["2024-01-123", "Invalid date or time format: "],
  ["2024-01-01 123", "Invalid date or time format: "],
  ["2024-01-01 00:123", "Invalid date or time format: "],
  ["2024-01-01 00:00 +123:00", "Invalid date or time format: "],
  ["2024/01/01", "Invalid date or time format: "],
  ["2024-01/01", "Invalid date or time format: "],
  ["2024-01-01 00/00", "Invalid date or time format: "],
  ["2024-01-01 00:00 +00/00", "Invalid date or time format: "],
  ["2024-01-0100:00", "Invalid date or time format: "],
];

describe("validateDateTimeFields", () => {
  test.each(validCases)("validates correct datetime format %s", (validCase, backendFormat) => {
    // Mock a form element with a valid datetime input
    const form = document.createElement("form");
    const input = document.createElement("input");
    input.classList.add("dateTimeInputField");
    input.value = validCase;
    form.appendChild(input);

    // Call the function and expect no error to be thrown
    expect(() => validateDateTimeFields(form)).not.toThrow();
  });

  test.each(invalidCases)(
    "throws an error for invalid datetime format %s",
    (invalidCase, errorMsg) => {
      // Mock a form element with an invalid datetime input
      const form = document.createElement("form");

      const input = document.createElement("input");
      input.classList.add("dateTimeInputField");
      input.value = invalidCase;

      const dateTimeFieldContainer = document.createElement("div");
      dateTimeFieldContainer.classList.add("dateTimeFieldContainer");

      const dateFormatErrorSpan = document.createElement("span");
      dateFormatErrorSpan.classList.add("date-format-error");

      dateTimeFieldContainer.appendChild(dateFormatErrorSpan);
      dateTimeFieldContainer.appendChild(input);

      form.appendChild(dateTimeFieldContainer);

      if (errorMsg.includes("timezone")) {
        expect(() => validateDateTimeFields(form)).toThrow(errorMsg);
      } else {
        expect(() => validateDateTimeFields(form)).toThrow(errorMsg + invalidCase);
      }
    }
  );
});
