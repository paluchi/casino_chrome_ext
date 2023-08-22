function fadeOutAndRemove(element) {
  element.classList.add("notification-exit");
  element.addEventListener("transitionend", () => {
    element.remove();
  });
}

function getContrastColor(color) {
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? "black" : "white";
}

function fadeOutAndRemove(element) {
  element.classList.add("notification-exit");
  element.addEventListener("transitionend", () => {
    element.remove();
  });
}

function getContrastColor(color) {
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? "black" : "white";
}

function fadeOutAndRemove(element) {
  element.style.opacity = "0";
  setTimeout(() => {
    element.remove();
  }, 300); // Assuming a 300ms fade out duration
}

function fadeOutAndRemove(element) {
  element.classList.add("notification-exit");
  element.addEventListener("transitionend", () => {
    element.remove();
  });
}

function getContrastColor(bgColor) {
  // Determine if the background color is light or dark
  const r = parseInt(bgColor.slice(1, 3), 16);
  const g = parseInt(bgColor.slice(3, 5), 16);
  const b = parseInt(bgColor.slice(5, 7), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? "black" : "white";
}

function getContrastColor(color) {
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? "black" : "white";
}

function fadeOutAndRemove(element) {
  element.classList.add("notification-exit");
  element.addEventListener("transitionend", () => {
    element.remove();
  });
}

function hexToRgbA(hex, alpha) {
  const [r, g, b] = hex.match(/\w\w/g).map((x) => parseInt(x, 16));
  return `rgba(${r},${g},${b},${alpha})`;
}

function isValidCbu(value) {
  return value.length === 22 && /^\d+$/.test(value);
}

class OperatorUtils {
  apiKey = null;
  interfaceApiKey = "c74cccb9-74e6-421e-853a-4f00d00ecb8e";
  interfaceId = "648b787f9fcbd80a3a00af9f";

  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  async openModal({
    inputs = [],
    buttons,
    checkboxes = [],
    closable = true,
    title,
    description,
  }) {
    return new Promise((resolve) => {
      // Create modal container
      const modal = document.createElement("div");
      modal.id = "extensionModal";
      modal.className = "modal-container";

      // Create modal content container
      const modalContent = document.createElement("div");
      modalContent.className = "modal-content";
      modal.appendChild(modalContent);

      // Create modal header container
      const modalHeader = document.createElement("div");
      modalHeader.className = "modal-header";
      modalContent.appendChild(modalHeader);

      // Add modal title
      if (title) {
        const modalTitle = document.createElement("h2");
        modalTitle.className = "modal-title";
        modalTitle.innerText = title;
        modalHeader.appendChild(modalTitle);
      }

      // Add modal description
      if (description) {
        const modalDescription = document.createElement("p");
        modalDescription.className = "modal-description";
        modalDescription.innerText = description;
        modalHeader.appendChild(modalDescription);
      }

      // Create inputs
      const inputElements = [];
      inputs.forEach((input) => {
        const inputContainer = document.createElement("div");
        inputContainer.className = "input-container";

        const titleLabel = document.createElement("label");
        titleLabel.className = "input-title";
        titleLabel.innerText = input.title;

        if (input.optional === false) {
          const requiredAsterisk = document.createElement("span");
          requiredAsterisk.innerText = " *";
          requiredAsterisk.className = "required"; // Add a 'required' class for styling
          titleLabel.appendChild(requiredAsterisk);
        }

        inputContainer.appendChild(titleLabel);

        if (input.description) {
          const descriptionLabel = document.createElement("p");
          descriptionLabel.innerText = input.description;
          descriptionLabel.className = "input-description";
          inputContainer.appendChild(descriptionLabel);
        }

        const inputElement = document.createElement("input");
        if (input.placeholder) inputElement.placeholder = input.placeholder;
        if (input.defaultValue) inputElement.defaultValue = input.defaultValue;
        inputElement.dataset.metadata = JSON.stringify(input.metadata);

        // Add an event listener to handle the first-time focus
        inputElement.addEventListener("click", function onClick() {
          setTimeout(() => {
            inputElement.focus();
          }, 301);
          // Remove the event listener after the first focus
          inputElement.removeEventListener("click", onClick);
        });

        inputContainer.appendChild(inputElement);
        inputElements.push(inputElement);
        modalContent.appendChild(inputContainer);
      });

      // Create checkboxes
      const checkboxElements = [];
      checkboxes.forEach((checkbox) => {
        const checkboxContainer = document.createElement("div");
        checkboxContainer.className = "checkbox-container";

        const checkboxLabel = document.createElement("label");
        checkboxLabel.className = "checkbox-label";

        const checkboxInput = document.createElement("input");
        checkboxInput.type = "checkbox";
        checkboxInput.checked = checkbox.checked || false;
        checkboxLabel.appendChild(checkboxInput);

        const checkboxTitle = document.createElement("span");
        checkboxTitle.innerText = checkbox.title;
        checkboxLabel.appendChild(checkboxTitle);

        checkboxContainer.appendChild(checkboxLabel);

        if (checkbox.description) {
          const descriptionLabel = document.createElement("p");
          descriptionLabel.innerText = checkbox.description;
          descriptionLabel.className = "checkbox-description";
          checkboxContainer.appendChild(descriptionLabel);
        }

        checkboxElements.push(checkboxInput);
        modalContent.appendChild(checkboxContainer);
      });

      // Create buttons
      const buttonsContainer = document.createElement("div");
      buttonsContainer.className = "buttons-container";
      modalContent.appendChild(buttonsContainer);

      // Handle closable
      const closeButton = document.createElement("button");
      closeButton.innerText = "X";
      closeButton.className = "close-button";
      if (closable) {
        modalContent.appendChild(closeButton);
      }

      buttons.forEach((button) => {
        const buttonElement = document.createElement("button");
        buttonElement.className = "modal-button";
        buttonElement.innerText = button.title;
        buttonElement.onclick = async () => {
          // Disable all buttons, inputs, checkboxes, and close button
          inputElements.forEach((input) => (input.disabled = true));
          buttonsContainer
            .querySelectorAll("button")
            .forEach((btn) => (btn.disabled = true));
          if (closable) closeButton.disabled = true;

          const checkboxElements = modalContent.querySelectorAll(
            "input[type='checkbox']"
          );
          checkboxElements.forEach((checkbox) => (checkbox.disabled = true));

          // Add spinner to the clicked button
          const spinner = document.createElement("div");
          spinner.className = "spinner";
          buttonElement.appendChild(spinner);

          const inputValues = {};
          inputElements.forEach((inputEl, index) => {
            inputValues[inputs[index].title] = inputEl.value;
          });

          // Collect checkbox values
          const checkboxValues = {};
          checkboxElements.forEach((checkboxEl, index) => {
            checkboxValues[checkboxes[index].title] = checkboxEl.checked;
          });

          // Merge input and checkbox values
          const allValues = { ...inputValues, ...checkboxValues };

          function closeModalCallback(errorMsg) {
            // Remove the spinner
            spinner.remove();

            // Enable all buttons, inputs, checkboxes, and close button
            inputElements.forEach((input) => (input.disabled = false));
            checkboxElements.forEach((checkbox) => (checkbox.disabled = false));

            buttonsContainer
              .querySelectorAll("button")
              .forEach((btn) => (btn.disabled = false));
            if (closable) closeButton.disabled = false;

            if (errorMsg) {
              // Delete the previous error message if it exists
              const previousErrorElement =
                modal.querySelector(".error-message");
              if (previousErrorElement) previousErrorElement.remove();

              const errorElement = document.createElement("div");
              errorElement.className = "error-message";
              errorElement.innerText = errorMsg;
              // Insert the error message after the modal-header
              modalHeader.insertAdjacentElement("afterend", errorElement);
            } else {
              modal.remove();
              resolve(true);
            }
          }

          // Await the callback
          await button.callback(closeModalCallback, allValues);
        };
        buttonsContainer.appendChild(buttonElement);
      });

      closeButton.onclick = () => {
        modal.remove();
        resolve(false);
      };

      modal.onclick = (e) => {
        if (closable && e.target === modal) {
          closeButton.onclick();
        }
      };

      document.body.appendChild(modal);

      // Set focus on the first input after appending the modal to the body
      if (inputElements.length > 0) inputElements[0].focus();
    });
  }

  notify({
    title,
    description,
    lifespan = 5000,
    color = "#25d366",
    closable = false,
    buttons = [],
  }) {
    // Create notification container if it doesn't exist
    let container = document.querySelector(".notification-container");
    if (!container) {
      container = document.createElement("div");
      container.className = "notification-container";
      document.body.appendChild(container);
    }

    // Create notification element
    const notification = document.createElement("div");
    notification.className = "notification";
    const rgbaColor = hexToRgbA(color, 0.8);
    notification.style.backgroundColor = rgbaColor;
    notification.style.color = getContrastColor(color);

    // Add title
    const titleElement = document.createElement("span");
    titleElement.className = "notification-title";
    titleElement.innerText = title;
    notification.appendChild(titleElement);

    // Add description
    const descriptionElement = document.createElement("span");
    descriptionElement.className = "notification-description";
    descriptionElement.innerText = description;
    notification.appendChild(descriptionElement);

    // Add close button if closable
    const closeButton = document.createElement("span");
    closeButton.className = "notification-close";
    closeButton.onclick = () => {
      fadeOutAndRemove(notification);
    };
    if (closable) {
      notification.appendChild(closeButton);
    }

    // Add buttons
    const buttonsContainer = document.createElement("div");
    buttonsContainer.className = "buttons-container";
    buttons.forEach((btn) => {
      const buttonElement = document.createElement("button");
      buttonElement.innerText = btn.title;
      buttonElement.onclick = async () => {
        // Clear lifespan timeout
        clearTimeout(lifespanTimeout);

        // Disable all buttons and close "x" immediately
        buttonsContainer
          .querySelectorAll("button")
          .forEach((b) => (b.disabled = true));
        closeButton.style.pointerEvents = "none"; // Disable close button
        closeButton.style.display = "none";

        // Add spinner to the clicked button
        const spinner = document.createElement("div");
        spinner.className = "spinner";
        buttonElement.appendChild(spinner);

        // Track if closeNotification has been called
        let closeNotificationCalled = false;

        // Modify closeNotification to track its call
        const originalCloseNotification = closeNotification;
        closeNotification = (shouldClose = true) => {
          closeNotificationCalled = true;
          originalCloseNotification(shouldClose);
        };

        // Await the callback
        await btn.callback(closeNotification, btn.parameters);

        // If closeNotification hasn't been called, call it with shouldClose as false
        if (!closeNotificationCalled) {
          closeNotification(false);
        }

        // Remove spinner after callback completes
        spinner.remove();

        // Re-enable buttons and close "x"
        buttonsContainer
          .querySelectorAll("button")
          .forEach((b) => (b.disabled = false));
        closeButton.style.pointerEvents = ""; // Re-enable close button
        closeButton.style.display = "flex";
      };
      buttonsContainer.appendChild(buttonElement);
    });
    notification.appendChild(buttonsContainer);

    // Append notification to container
    container.appendChild(notification);

    // Automatically remove after lifespan
    let lifespanTimeout;
    if (lifespan > 0) {
      lifespanTimeout = setTimeout(() => {
        fadeOutAndRemove(notification);
      }, lifespan);
    }

    function closeNotification(shouldClose = true) {
      if (shouldClose) {
        fadeOutAndRemove(notification);
      } else {
        // Re-enable buttons and close "x"
        buttonsContainer
          .querySelectorAll("button")
          .forEach((b) => (b.disabled = false));
        if (closable) closeButton.disabled = false;

        // Clear the existing lifespan timeout
        clearTimeout(lifespanTimeout);

        // Restart lifespan timeout
        if (lifespan > 0) {
          lifespanTimeout = setTimeout(() => {
            fadeOutAndRemove(notification);
          }, lifespan);
        }
      }
    }
  }

  async asyncFetch(url, options = {}) {
    // Convert params to query string
    if (options.params) {
      const queryString = new URLSearchParams(options.params).toString();
      url = `${url}?${queryString}`;
    }

    // Set up fetch options
    const fetchOptions = {
      method: options.method || "GET",
      headers: options.headers,
      // ... any other fetch options you want to support
    };

    // If there's a body, add it to fetchOptions
    if (options.body) {
      fetchOptions.body = JSON.stringify(options.body);
    }

    // Fetch with timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
    }, options.timeout || 25000); // Default timeout is 60 seconds

    try {
      const res = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });

      clearTimeout(timeout); // Clear the timeout if the request completes successfully

      return await res.json();
    } catch (error) {
      console.log("error:", error);
      this.notify({
        title: "Error critico",
        description:
          "Ocurrio un error al intentar conectarse con el servidor, por favor recarga la pagina. Si el problema persiste contactar al adiministrador.",
        color: "#ff0000",
        lifespan: 15000,
        closable: true,
      });
    }
  }

  async serverFetch({
    // baseUrl = "http://127.0.0.1:5252",
    baseUrl = "https://bankingsystemservertools.online:5252",
    path,
    method = "GET",
    params = {},
    headers = {},
  }) {
    const url = `${baseUrl}/${path}`;
    const options = {
      method,
      params,
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.interfaceApiKey,
        "interface-id": this.interfaceId,
        "operator-api-key": this.apiKey,
        ...headers,
      },
    };

    return await this.asyncFetch(url, options);
  }

  async findPhoneNumber() {
    // Utulity function to know if a variable is a phone number can cointain also '-' and '+'
    function isPhoneNumber(str) {
      // Regular expression pattern to match a wide variety of phone numbers
      const pattern = /^(?:\+)?(\d[\s-]*){6,15}\d$/;

      // Test the pattern against the input string
      return pattern.test(str);
    }

    // display none to the right drawer
    const drawerRight = document.querySelector("#wa-popovers-bucket")
      .nextElementSibling.nextElementSibling.nextElementSibling
      .nextElementSibling.nextElementSibling;
    drawerRight.style.display = "none";

    // click title="Detalles del perfil"
    document.querySelector('[title="Detalles del perfil"]').click();

    await new Promise((resolve) => setTimeout(resolve, 0));

    // Select the last .selectable-text.copyable-text inside drawerRight
    const selectableTexts = drawerRight.querySelectorAll(
      ".selectable-text.copyable-text"
    );
    const PhoneNumberContainer =
      selectableTexts[selectableTexts.length - 1].firstElementChild || null;

    // Get text inside
    let phoneNumber = PhoneNumberContainer?.textContent;

    if (!isPhoneNumber(phoneNumber))
      phoneNumber =
        drawerRight.querySelector("span.copyable-text")?.textContent;

    if (!isPhoneNumber(phoneNumber))
      phoneNumber = drawerRight.querySelector(
        "span.copyable-text > span"
      )?.textContent;

    // click data-icon="x"
    drawerRight.querySelector('[data-icon="x"]').click();

    setTimeout(() => {
      drawerRight.style.display = "block";
    }, 350);

    return phoneNumber;
  }

  async saveIntoClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error("Failed to write to clipboard: ", err);
    }
  }

  async blockInteractionsUntilResolved({
    callback,
    title = null,
    description = null,
  }) {
    return new Promise((resolve) => {
      // Create an overlay to block interactions
      const overlay = document.createElement("div");
      overlay.className = "custom-overlay";

      // Add title if provided
      if (title) {
        const titleElement = document.createElement("h2");
        titleElement.innerHTML = title;
        titleElement.className = "overlay-title";
        overlay.appendChild(titleElement);
      }

      // Add description if provided
      if (description) {
        const descriptionElement = document.createElement("p");
        descriptionElement.innerHTML = description;
        descriptionElement.className = "overlay-description";
        overlay.appendChild(descriptionElement);
      }

      // Add spinner
      const spinner = document.createElement("div");
      spinner.className = "big-spinner";
      overlay.appendChild(spinner);

      // Append the overlay to the body
      document.body.appendChild(overlay);

      // Execute the callback
      callback().finally(() => {
        // Remove the overlay once the callback is resolved or rejected
        document.body.removeChild(overlay);
        resolve();
      });
    });
  }
}
