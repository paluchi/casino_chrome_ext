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
  currentChatData = {};

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
      let isAwaitingCallback = false; // Add this flag
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

          isAwaitingCallback = true; // Set the flag to true before awaiting the callback
          // Await the callback
          await button.callback(closeModalCallback, allValues);
          isAwaitingCallback = false; // Reset the flag after the callback is done
        };
        buttonsContainer.appendChild(buttonElement);
      });

      closeButton.onclick = () => {
        modal.remove();
        resolve(false);
      };

      modal.onclick = (e) => {
        if (closable && e.target === modal && !isAwaitingCallback) {
          // Check the flag here
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
    if (description) {
      const descriptionElement = document.createElement("span");
      descriptionElement.className = "notification-description";
      descriptionElement.innerText = description;
      notification.appendChild(descriptionElement);
    }

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
    baseUrl = "http://127.0.0.1:5252",
    // baseUrl = "https://bankingsystemservertools.online:5252",
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

  async saveIntoClipboard(text, notify = false) {
    try {
      await navigator.clipboard.writeText(text);

      notify &&
        this.notify({
          title: "Copiado al portapapeles!",
          lifespan: 500,
          closable: false,
          description: text,
        });
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

  createInputButton({ title, callback, defaultValue = "", color = "#4caf50" }) {
    const container = document.createElement("div");
    container.className = "input-btn-container";

    const button = document.createElement("button");
    button.className = "send-btn";
    button.innerText = title;
    button.style.backgroundColor = color;

    const input = document.createElement("input");
    input.type = "search";
    input.value = defaultValue;
    input.className = "input-field";
    input.autocomplete = "off";

    const spinner = document.createElement("div");
    spinner.className = "spinner";

    const handleButtonClick = async () => {
      button.appendChild(spinner);
      button.disabled = true;
      input.disabled = true;

      const result = await callback(input.value);

      button.disabled = false;
      input.disabled = false;
      spinner.remove();

      if (typeof result === "string") {
        this.notify({
          title: result,
          lifespan: 1000,
          color: "#ff0000",
        });
        input.focus(); // Refocus the input if callback is not successful
      } else {
        input.value = ""; // Clear the input after successful callback
        input.blur(); // Remove focus from the input
      }
    };

    button.addEventListener("click", handleButtonClick);

    button.addEventListener("mouseover", () => {
      input.focus();
    });

    const handleEnterPress = (event) => {
      if (event.key === "Enter") {
        handleButtonClick();
      }
    };

    input.addEventListener("focus", () => {
      input.addEventListener("keyup", handleEnterPress);
    });

    input.addEventListener("blur", () => {
      input.removeEventListener("keyup", handleEnterPress);
    });

    container.appendChild(button);
    container.appendChild(input);

    return container;
  }

  createButton({ title, callback, color, isDisabled = false, classes = [] }) {
    const button = document.createElement("button");
    button.className = "custom-btn " + classes.join(" "); // Apply a class for styling
    button.innerText = title;
    if (color) button.style.backgroundColor = color; // Apply color
    button.disabled = isDisabled; // Set disabled state

    const spinner = document.createElement("div");
    spinner.className = "spinner";

    button.addEventListener("click", async () => {
      // Ensure the button is not disabled when clicked
      if (!button.disabled) {
        button.appendChild(spinner); // Show spinner
        button.disabled = true; // Disable button

        const result = await callback();

        button.disabled = false; // Enable button
        spinner.remove(); // Remove spinner

        if (typeof result === "string") {
          this.notify({
            title: result,
            lifespan: 1000,
            color: "#ff0000",
          });
        }
      }
    });

    return button;
  }

  async releaseCoins(balance, phoneNumber) {
    try {
      if (!phoneNumber) phoneNumber = await this.findPhoneNumber();
      const res = await this.serverFetch({
        method: "POST",
        path: "operator/release_coins",
        params: {
          username: phoneNumber,
          coinsAmount: balance,
        },
      });
      if (!res.success) {
        this.notify({
          title: "Error enviando fichas",
          color: "#ff6b6b",
          description: res.error,
        });
        return false;
      } else
        this.notify({
          title: "Fichas enviadas",
          description: `Se enviaron ${balance} fichas al usuario asociado al telefono\n${phoneNumber}\n\n${res.data.message}`,
          buttons: [
            {
              title: "Copiar mensaje",
              callback: async (close, params) => {
                await this.saveIntoClipboard(res.data.message);
                close();
              },
            },
          ],
          lifespan: 15000,
        });

      // Update the current chat balance
      this.updateCurrentChatBalance(balance);

      if (!this.currentChatData.userFound) {
        this.currentChatData.userFound = true;
        const usernameElement = document.querySelector(".client-data.username");
        usernameElement.innerText = res.data.username;
      }

      return true;
    } catch (error) {
      this.notify({
        title: "Error enviando fichas",
        color: "#ff6b6b",
        description: "Por favor intente nuevamente.",
      });
      return false;
    }
  }

  async subtractCoins(balance, phoneNumber) {
    if (!phoneNumber) phoneNumber = await this.findPhoneNumber();
    try {
      const res = await this.serverFetch({
        method: "POST",
        path: "operator/subtract_coins",
        params: {
          username: phoneNumber,
          coinsAmount: balance,
        },
      });
      if (!res.success) {
        this.notify({
          title: "Error descargando fichas",
          color: "#ff6b6b",
          description: res.error,
        });
        return false;
      } else
        this.notify({
          title: "Fichas descargadas",
          description: `Se descargaron ${balance} fichas del usuario asociado al telefono\n${phoneNumber}\n\n${res.data.message}`,
          buttons: [
            {
              title: "Copiar mensaje",
              callback: async (close, params) => {
                await this.saveIntoClipboard(res.data.message);
                close();
              },
            },
          ],
          lifespan: 15000,
        });

      this.updateCurrentChatBalance(-balance);

      return true;
    } catch (error) {
      this.notify({
        title: "Error enviando fichas",
        color: "#ff6b6b",
        description: "Por favor intente nuevamente.",
      });
      return false;
    }
  }

  updateCurrentChatBalance(balance) {
    this.currentChatData.balance =
      (this.currentChatData.balance || 0) + balance;
    const balanceDiv = document.querySelector(".client-data.balance");
    balanceDiv.innerText = `${this.currentChatData.balance}`;
    this.pushCurrentChatMovement({
      action: balance >= 0 ? "add" : "subtract",
      parameters: { amount: Math.abs(balance) },
    });
  }

  pushCurrentChatMovement(data) {
    data.date = new Date();
    data.operatorName = this.username;
    if (!this.currentChatData.movements) this.currentChatData.movements = [];

    this.currentChatData.movements.push(data);
    this.displayMovements();
  }

  async displayMovements(movementsDiv) {
    if (!movementsDiv)
      movementsDiv = document.querySelector(".client-movements");

    const movementsListContainer = movementsDiv.querySelector(
      ".movements-list-container"
    );

    // Turn movements upside down
    const movements = [...this.currentChatData.movements].reverse();

    const actionsMap = {
      create: "Creó usuario",
      add: "Agregó fichas",
      subtract: "Retiró fichas",
      update_password: "Actualizó contraseña",
      block_user: "Bloqueó usuario",
      unblock_user: "Desbloqueó usuario",
    };

    // Create a new ul element
    const ul = document.createElement("ul");
    ul.className = "movements-list";

    // Loop through the movements and create li elements
    movements.forEach((movement) => {
      const li = document.createElement("li");
      li.className = "movement-item";

      // Create elements for operatorName, action, parameters, and date
      const operatorNameSpan = document.createElement("span");
      operatorNameSpan.className = "operator-name";
      operatorNameSpan.innerText = `Operator: ${movement.operatorName}`;

      const actionSpan = document.createElement("span");
      const formattedAction = actionsMap[movement.action] || movement.action;
      actionSpan.className = "action";
      actionSpan.innerText = `Accion: ${formattedAction}`;

      function flattenObject(obj, prefix = "") {
        return Object.keys(obj).reduce((acc, k) => {
          const pre = prefix.length ? prefix + "_" : "";
          if (typeof obj[k] === "object")
            Object.assign(acc, flattenObject(obj[k], pre + k));
          else acc[pre + k] = obj[k];
          return acc;
        }, {});
      }

      const parametersContainer = document.createElement("div");
      parametersContainer.className = "parameters";

      // Flatten the object and loop through each key-value pair
      const flattenedParameters = movement.parameters
        ? flattenObject(movement.parameters)
        : {};
      for (const [key, value] of Object.entries(flattenedParameters)) {
        const parameterSpan = document.createElement("span");
        parameterSpan.className = "parameter";
        parameterSpan.innerText = `${key}: ${value}`;
        parametersContainer.appendChild(parameterSpan);
      }

      const dateSpan = document.createElement("span");
      dateSpan.className = "date";
      dateSpan.innerText = `${new Date(movement.date).toLocaleString()}`;

      // Append the elements to the li
      li.appendChild(dateSpan);
      li.appendChild(operatorNameSpan);
      li.appendChild(actionSpan);
      li.appendChild(parametersContainer);

      // Append the li to the ul
      ul.appendChild(li);
    });

    // Remove all existing children from movementsListContainer
    while (movementsListContainer.firstChild) {
      movementsListContainer.removeChild(movementsListContainer.firstChild);
    }

    // Append the new ul to movementsListContainer
    movementsListContainer.appendChild(ul);
  }

  async updatePassword(newPassword, phoneNumber) {
    if (!phoneNumber) phoneNumber = await this.findPhoneNumber();
    try {
      const res = await this.serverFetch({
        method: "PATCH",
        path: "operator/user_password",
        params: {
          username: phoneNumber,
          password: newPassword,
        },
      });
      if (!res.success) {
        this.notify({
          title: "Error Actualizando contraseña",
          color: "#ff6b6b",
          description: res.error,
        });
        return false;
      } else
        this.notify({
          title: "Contraseña Actualizada",
          description: `Se actualizo la contraseña del usuario asociado al telefono\n${phoneNumber}\n\n${res.data.friendlyMessage}`,
          lifespan: 15000,
          closable: true,
          buttons: [
            {
              title: "Copiar mensaje",
              callback: async (close, params) => {
                await this.saveIntoClipboard(res.data.friendlyMessage);
                close();
              },
            },
          ],
        });

      // Add movement to movements list
      this.pushCurrentChatMovement({
        action: "update_password",
        parameters: { password: newPassword },
      });

      return true;
    } catch (error) {
      this.notify({
        title: "Error Actualizando contraseña",
        color: "#ff6b6b",
        description: "Por favor intente nuevamente.",
      });
      return false;
    }
  }

  async toggleUserBlock(phoneNumber) {
    if (!phoneNumber) phoneNumber = await this.findPhoneNumber();
    try {
      const res = this.currentChatData.isBlocked
        ? await this.serverFetch({
            method: "PATCH",
            path: "operator/unblock_user",
            params: {
              username: phoneNumber,
            },
          })
        : await this.serverFetch({
            method: "PATCH",
            path: "operator/block_user",
            params: {
              username: phoneNumber,
            },
          });

      if (!res.success) {
        this.notify({
          title: `Error ${
            this.currentChatData.isBlocked ? "desbloqueando" : "bloqueando"
          } usuario`,
          color: "#ff6b6b",
          description: res.error,
        });
        return false;
      } else
        this.notify({
          title: `Usuario ${
            this.currentChatData.isBlocked ? "desbloqueado" : "bloqueado"
          }`,
          description: `Se ${
            this.currentChatData.isBlocked ? "desbloqueo" : "bloqueo"
          } al usuario asociado al telefono\n${phoneNumber}`,
          lifespan: 2000,
          closable: true,
        });

      // Update the currentChatData
      this.currentChatData.isBlocked = !this.currentChatData.isBlocked;

      // Update the button element
      const blockButton = document.querySelector(".block-user-button");
      blockButton.classList.toggle("user-blocked");
      blockButton.innerText = this.currentChatData.isBlocked
        ? "Desbloquear"
        : "Bloquear";

      // Add movement
      this.pushCurrentChatMovement({
        action: this.currentChatData.isBlocked ? "block_user" : "unblock_user",
      });

      return true;
    } catch (error) {
      console.log("error:", error);
      this.notify({
        title: `Error ${
          this.currentChatData.isBlocked ? "desbloqueando" : "bloqueando"
        } al usuario`,
        color: "#ff6b6b",
        description: "Por favor intente nuevamente.",
      });
      return false;
    }
  }
}
