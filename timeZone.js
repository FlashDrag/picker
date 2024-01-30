// TimeZone Dropdown

const m = moment();

const timezone_names = moment.tz.names();

// Detect user's timezone
const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

// Create select element and populate timezone dropdown with options
const timezoneSelector = document.createElement('select');
timezoneSelector.id = 'timezoneSelector';

timezone_names.forEach(timezone => {
  let timezoneOffset = moment.tz(timezone).format('Z');
  let option = document.createElement('option');
  option.value = timezoneOffset;
  option.text = timezone + ' ' + timezoneOffset;
  // Set default selection to user's timezone
  if (timezone === userTimezone) {
      option.selected = true;
  }
  timezoneSelector.appendChild(option);
});

export default timezoneSelector;