function getErrorElement(inputElement) {
  return inputElement.nextElementSibling;
}

function showInputError(inputElement, settings) {
  const errorElement = getErrorElement(inputElement);

  let errorMessage = inputElement.validationMessage;

  if (inputElement.validity.patternMismatch) {
    errorMessage = inputElement.dataset.errorMessage;
  }

  inputElement.classList.add(settings.inputErrorClass);
  errorElement.textContent = errorMessage;
  errorElement.classList.add(settings.errorClass);
}

function hideInputError(inputElement, settings) {
  const errorElement = getErrorElement(inputElement);

  inputElement.classList.remove(settings.inputErrorClass);
  errorElement.textContent = "";
  errorElement.classList.remove(settings.errorClass);
}

function checkInputValidity(inputElement, settings) {
  if (!inputElement.validity.valid) {
    showInputError(inputElement, settings);
  } else {
    hideInputError(inputElement, settings);
  }
}

function hasInvalidInput(inputList) {
  return inputList.some((inputElement) => !inputElement.validity.valid);
}

function disableSubmitButton(buttonElement, settings) {
  buttonElement.classList.add(settings.inactiveButtonClass);
  buttonElement.disabled = true;
}

function enableSubmitButton(buttonElement, settings) {
  buttonElement.classList.remove(settings.inactiveButtonClass);
  buttonElement.disabled = false;
}

function toggleButtonState(inputList, buttonElement, settings) {
  if (hasInvalidInput(inputList)) {
    disableSubmitButton(buttonElement, settings);
  } else {
    enableSubmitButton(buttonElement, settings);
  }
}

function setEventListeners(formElement, settings) {
  const inputList = Array.from(
    formElement.querySelectorAll(settings.inputSelector)
  );
  const buttonElement = formElement.querySelector(
    settings.submitButtonSelector
  );

  toggleButtonState(inputList, buttonElement, settings);

  inputList.forEach((inputElement) => {
    inputElement.addEventListener("input", () => {
      checkInputValidity(inputElement, settings);
      toggleButtonState(inputList, buttonElement, settings);
    });
  });
}

function clearValidation(formElement, settings) {
  const inputList = Array.from(
    formElement.querySelectorAll(settings.inputSelector)
  );
  const buttonElement = formElement.querySelector(
    settings.submitButtonSelector
  );

  inputList.forEach((inputElement) => {
    hideInputError(inputElement, settings);
  });

  disableSubmitButton(buttonElement, settings);
}

function enableValidation(settings) {
  const formList = Array.from(
    document.querySelectorAll(settings.formSelector)
  );

  formList.forEach((formElement) => {
    setEventListeners(formElement, settings);
  });
}

export { enableValidation, clearValidation };
