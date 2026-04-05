// mobile number validator
export const validateMobile = (value) => {
  const cleanValue = value.replaceAll(" ", "");

  const mobileRegex = /^07[0-9]{8}$/;
  const doesItFit = mobileRegex.test(cleanValue);

  if (doesItFit === true) {
    return { isValid: true, error: null };
  } else {
    return {
      isValid: false,
      error: "Must be exactly 10 digits starting with 07.",
    };
  }
};

// name validator
export const validateName = (value) => {
  if (value.trim() === "") {
    return { isValid: false, error: "Name cannot be empty" };
  }

  const nameRegex = /^[A-Za-z\s]+$/;
  const doesItFit = nameRegex.test(value);

  if (doesItFit === false) {
    return {
      isValid: false,
      error: "Name can only contain letters and spaces.",
    };
  }

  // FIX 1: The filter protects your loop from accidental double-spaces
  const namePieces = value
    .trim()
    .split(" ")
    .filter((piece) => piece !== "");

  // FIX 2: Added .length
  if (namePieces.length < 2) {
    return {
      isValid: false,
      error: "Name should have at least two parts (Ex: John Doe)",
    };
  }

  // Your brilliant addition!
  for (let part of namePieces) {
    if (part.length < 2) {
      return {
        isValid: false,
        error: "Each part of the name must be at least 2 letters.",
      };
    }
  }

  return { isValid: true, error: null };
};

// generate short name
export const generateShortName = (fullname) => {
  const cleanName = fullname.trim();
  if (cleanName === "") {
    return "";
  }

  const namePieces = cleanName.split(" ");

  const surname = namePieces.pop();
  // now the namePieces does not have last part
  let initials = "";
  for (let piece of namePieces) {
    let firstLetter = piece.charAt(0).toUpperCase();
    initials = initials + firstLetter + ". ";
  }
  const finalSurname =
    surname.charAt(0).toUpperCase() + surname.slice(1).toLowerCase();

  return initials + finalSurname;
};

// age validator
export const ageValidator = (value, minimumAge, maximumAge, name) => {
  const birthDate = new Date(value);
  const today = new Date();

  // ADDED (): Tell JavaScript to actually run the calculations!
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();

  // ADDED (): Run the getDate actions
  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < birthDate.getDate())
  ) {
    age = age - 1;
  }

  const minAge = parseInt(minimumAge);
  const maxAge = parseInt(maximumAge);

  if (age > maxAge || age < minAge) {
    // Pro-tip: You can use backticks to inject the actual numbers into the error!
    return {
      isValid: false,
      error: `${name} is ${age} years old. Must be between ${minAge} and ${maxAge}.`,
    };
  }

  return { isValid: true, error: null };
};

export const validateNICAndAge = (nic, minAge, maxAge, name) => {
  const cleanNIC = nic.trim();

  if (cleanNIC === "") {
    return { isValid: false, error: "Enter valid NIC" };
  }

  // 1. THE SHAPE BOUNCER
  const nicRegex = /^([0-9]{9}[vVxX]|[0-9]{12})$/;
  if (nicRegex.test(cleanNIC) === false) {
    return {
      isValid: false,
      error: "Invalid format. Must be 9 digits + V/X, or 12 digits.",
      dob: null,
    };
  }

  // 2. EXTRACT YEAR AND DAYS
  let yearText = "";
  let daysText = "";

  if (cleanNIC.length === 10) {
    yearText = "19" + cleanNIC.substring(0, 2);
    daysText = cleanNIC.substring(2, 5);
  } else {
    yearText = cleanNIC.substring(0, 4);
    daysText = cleanNIC.substring(4, 7);
  }

  const year = parseInt(yearText);
  let days = parseInt(daysText);

  // 3. THE MATH BOUNCER (Are the days mathematically possible?)
  if (days < 1 || days > 866 || (days > 366 && days < 500)) {
    return {
      isValid: false,
      error:
        "Invalid NIC: The embedded birth date is mathematically impossible.",
      dob: null,
    };
  }

  // Remove the female +500 modifier so we get the true day of the year for the calendar
  if (days > 500) {
    days = days - 500;
  }

  // 4. THE MAGIC DATE FORMATTING
  // We let JavaScript figure out the exact month and day based on the year and total days
  const dobObject = new Date(year, 0, days);

  // We format it into standard YYYY-MM-DD so your ageValidator can read it perfectly
  const localMonth = String(dobObject.getMonth() + 1).padStart(2, "0");
  const localDay = String(dobObject.getDate()).padStart(2, "0");
  const formattedDOB = `${dobObject.getFullYear()}-${localMonth}-${localDay}`;

  // 5. THE COMBINATION!
  // We hand the formatted date, plus the limits, straight to the function you wrote.
  const ageCheck = ageValidator(formattedDOB, minAge, maxAge, name);

  if (ageCheck.isValid === false) {
    // It failed the age limit! We pass your exact error message back to the UI.
    return { isValid: false, error: ageCheck.error, dob: null };
  }

  // It survived every single bouncer!
  // We return true, AND we return the formattedDOB so your React form can auto-fill the birthdate box!
  return { isValid: true, error: null, dob: formattedDOB };
};

// 1. THE EMAIL BOUNCER
export const validateEmail = (email) => {
  if (email.trim() === "") {
    return { isValid: false, error: "Email is required." };
  }
  // This Regex checks for "something @ something . something"
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (emailRegex.test(email) === false) {
    return { isValid: false, error: "Please enter a valid email address." };
  }
  return { isValid: true, error: null };
};

// 2. THE GENERIC "REQUIRED" BOUNCER (Great for Address and Dropdowns!)
export const validateRequired = (value, fieldName) => {
  // We check if it's null, undefined, or just empty spaces
  if (!value || value.toString().trim() === "") {
    return { isValid: false, error: `${fieldName} is required.` };
  }
  return { isValid: true, error: null };
};

export const validateNIC = (nic, minAge, maxAge, name) => {
  const cleanNIC = nic.trim();

  if (cleanNIC==="") {
    return {isValid: true, error: null, dob: null}
  }

  const nicRegex = /^([0-9]{9}[vVxX]|[0-9]{12})$/;
  if (nicRegex.test(cleanNIC) === false) {
    return {
      isValid: false,
      error: "Invalid format. Must be 9 digits + V/X, or 12 digits.",
      dob: null,
    };
  }

  let yearText = "";
  let daysText = "";

  if (cleanNIC.length === 10) {
    yearText = "19" + cleanNIC.substring(0, 2);
    daysText = cleanNIC.substring(2, 5);
  } else {
    yearText = cleanNIC.substring(0, 4);
    daysText = cleanNIC.substring(4, 7);
  }

  const year = parseInt(yearText);
  let days = parseInt(daysText);

  if (days < 1 || days > 866 || (days > 366 && days < 500)) {
    return {
      isValid: false,
      error:
        "Invalid NIC: The embedded birth date is mathematically impossible.",
      dob: null,
    };
  }

  if (days > 500) {
    days = days - 500;
  }

  const dobObject = new Date(year, 0, days);

  const localMonth = String(dobObject.getMonth() + 1).padStart(2, "0");
  const localDay = String(dobObject.getDate()).padStart(2, "0");
  const formattedDOB = `${dobObject.getFullYear()}-${localMonth}-${localDay}`;

  const ageCheck = ageValidator(formattedDOB, minAge, maxAge, name);

  if (ageCheck.isValid === false) {
    return { isValid: false, error: ageCheck.error, dob: null };
  }

  return { isValid: true, error: null, dob: formattedDOB };
};
