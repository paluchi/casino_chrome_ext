class Operator extends OperatorUtils {
  apiKey = null;
  phoneNumber = null;
  username = null;
  apiKey = null;
  currentShift = {
    isOpen: false,
    shift: null,
  };
  cbus = [];

  boundOnChatClickListener = null;
  boundOnControlPanelClickListener = null;

  constructor(apiKey) {
    super(apiKey);

    this.apiKey = apiKey;
    this.boundOnChatClickListener = this.onChatClickListener.bind(this);
    this.boundOnControlPanelClickListener =
      this.onControlPanelClickListener.bind(this);
  }

  async init() {
    await this.blockInteractionsUntilResolved({
      title: "Cargando tus datos",
      description: "Estamos cargando tus datos de operador, por favor espera.",
      callback: async () => {
        const res = await this.serverFetch({
          method: "GET",
          path: "operator/operator_data",
        });

        if (!res.success) {
          this.notify({
            color: "#ff6b6b",
            title: "Error cargando tus datos",
            description:
              "No se pudo cargar tus datos de operador, por favor intenta recargar la página o comunicate con el administrador.",
          });
        } else {
          this.phoneNumber = res.data.phoneNumber;
          this.username = res.data.username;
          this.currentShift = res.data.lastWorkShift;
          this.cbus = res.data.cbus;

          if (!this.apiKey) {
            this.notify({
              color: "#ff6b6b",
              title: "Aun no cargaste tu codigo de identificación",
              description:
                "Comunicate con el administrador para que te de tu codigo de identificación y te explique como ingresarlo.",
            });
            return false;
          }

          // Send welcome message
          await this.notify({
            closable: true,
            lifespan: 10000,
            title: "Bienvenido",
            description: `Hola ${this.username}, gracias por usar el operador de WhatsApp.`,
            buttons: [
              {
                title: this.currentShift.isOpen
                  ? "Cerrar turno"
                  : "Abrir nuevo turno",
                callback: this.updateShift.bind(this),
              },
            ],
          });

          // Start listeners
          await this.startListeners();
        }
      },
    });

    return true;
  }

  async startListeners() {
    await this.startControlPanelListener();
    await this.startNewChatListener();
  }

  onControlPanelClickListener(event) {
    let target = event.target;

    // Traverse up the DOM tree to check if the clicked element or any of its ancestors has role="listitem"
    while (target) {
      if (
        target.getAttribute &&
        target.getAttribute("id") === "control-panel"
      ) {
        this.onControlPanelClickCallback(target);
        return;
      }
      target = target.parentElement;
    }
  }

  async updateShift(close) {
    if (this.currentShift.isOpen) {
      let confirmed = false;

      await this.openModal({
        title: "Seguro que queres cerrar el turno?",
        description:
          "Al cerrar el turno no podrás seguir atendiendo clientes hasta que habras un nuevo turno.",
        buttons: [
          {
            title: "Cancelar",
            callback: (close) => {
              close();
            },
          },
          {
            title: "Cerrar turno",
            callback: (close) => {
              confirmed = true;
              close();
            },
          },
        ],
      });

      if (!confirmed) return false;
    }

    const res = await this.serverFetch({
      method: "POST",
      path: this.currentShift.isOpen
        ? "operator/close_work_shift"
        : "operator/open_work_shift",
    });

    if (!res.success) {
      this.notify({
        color: "#ff6b6b",
        title: this.currentShift.isOpen
          ? "Error cerrando turno"
          : "Error abriendo turno",
        description: `No se pudo ${
          this.currentShift.isOpen ? "cerrar el" : "abrir un"
        } turno, por favor intenta recargar la página o comunicate con el administrador.`,
      });
      close && close();
      return false;
    }

    this.currentShift = res.data;
    this.notify({
      title: this.currentShift.isOpen ? "Turno abierto" : "Turno cerrado",
      description: this.currentShift.isOpen
        ? "Se abrió el turno correctamente."
        : "Se cerró el turno correctamente.",
      buttons: [
        {
          title: this.currentShift.isOpen
            ? "Cerrar turno"
            : "Abrir nuevo turno",
          callback: this.updateShift.bind(this),
        },
      ],
    });
    close && close();
    return true;
  }

  openUpdatePhoneNumberModal() {
    this.openModal({
      title: "Actualizar numero de whatsapp",
      description:
        "Aca podes actualizar tu numero de whatsapp.\nEste numero corresponde al whatsapp que estas usando ahora.\nEsta accion se tiene que realizar cuando cambias de numero de whatsapp.",
      inputs: [
        {
          title: "Numero de whatsapp",
          optional: false,
          description: "Nuevo numero de whatsapp",
          defaultValue: this.phoneNumber,
        },
      ],
      buttons: [
        {
          title: "Cancelar",
          callback: (close) => {
            close();
          },
        },
        {
          title: "Actualizar",
          callback: async (close, data) => {
            const phoneNumber = data["Numero de whatsapp"];
            if (phoneNumber === this.phoneNumber) {
              close(
                "El numero de whatsapp ingresado es el mismo que el actual."
              );
              return;
            } else if (!phoneNumber) {
              close("Por favor completa todos los campos.");
              return;
            } else {
              const res = await this.serverFetch({
                method: "PATCH",
                path: "operator/operator_phone_number",
                params: {
                  phoneNumber,
                },
              });
              if (!res.success) {
                close();
                this.notify({
                  color: "#ff6b6b",
                  title: "Error al actualizar el numero de whatsapp",
                  description: res.error,
                });
                return;
              }

              this.phoneNumber = phoneNumber;
              close();
              this.notify({
                title: "Numero de whatsapp actualizado",
                description: `Se actualizo el numero de whatsapp correctamente a ${this.phoneNumber}.`,
                buttons: [
                  {
                    title: "Abrir panel de control",
                    callback: this.onControlPanelClickCallback.bind(this),
                  },
                ],
                lifespan: 10000,
              });
            }
          },
        },
      ],
    });
  }

  openAddCbuModal() {
    this.openModal({
      title: "Agregar cbu",
      description: "Aca podes agregar un nuevo cbu para recibir dinero.",
      inputs: [
        {
          title: "Nombre",
          optional: false,
          description: "Texto descriptivo para identificar el cbu.",
          placeholder: "Banco Uala, Cuenta de jose luis",
        },
        {
          title: "Cbu",
          optional: false,
          description: "Cbu de la cuenta bancaria.",
          placeholder: "1234567891234567891234",
        },
      ],
      buttons: [
        {
          title: "Cancelar",
          callback: (close) => {
            close();
          },
        },
        {
          title: "Agregar cbu",
          callback: async (close, data) => {
            const { Nombre, Cbu } = data;
            // Replace all spaces and dashes with nothing
            const parsedCbu = Cbu.replace(/[\s-]/g, "");
            if (!Nombre || !Cbu) close("Por favor completa todos los campos.");
            else if (!isValidCbu(parsedCbu))
              close(
                "El cbu ingresado no es válido.\nPor favor verificalo e intenta nuevamente."
              );
            else {
              const res = await this.serverFetch({
                method: "POST",
                path: "operator/operator_cbu",
                params: {
                  name: Nombre,
                  cbu: parsedCbu,
                },
              });
              if (!res.success) {
                close();
                this.notify({
                  color: "#ff6b6b",
                  title: "Error al agregar cbu",
                  description: res.error,
                });
                return;
              }

              this.cbus.push({
                name: Nombre,
                cbu: parsedCbu,
                available: true,
              });
              close();
              this.notify({
                title: "Cbu agregado correctamente",
                description: `Se agregó el cbu ${parsedCbu} correctamente y esta listado para recibir dinero.`,
                buttons: [
                  {
                    title: "Administrar cbus",
                    callback: this.openCbusModal.bind(this),
                  },
                ],
                lifespan: 10000,
              });
            }
          },
        },
      ],
    });
  }

  openRemoveCbuModal() {
    const checkboxes = this.cbus.map((cbu) => ({
      title: cbu.cbu,
      description: cbu.name,
      checked: false,
    }));

    this.openModal({
      title: "Eliminar cbu",
      description:
        "Aca podes eliminar un cbu de tu listado, esto\nse hace cuando el cbu queda descontinuado o\n ya no lo usas por cualquier otro motivo.",
      checkboxes,
      buttons: [
        {
          title: "Cancelar",
          callback: (close) => {
            close();
          },
        },
        {
          title: "Eliminar cbus seleccionados",
          callback: async (close, data) => {
            const delErrorCbus = [];
            const delSuccessCbus = [];

            const cbus = Object.entries(data).filter(([_, del]) => del);

            if (!cbus.length) {
              close("No seleccionaste ningun cbu para eliminar.");
              return;
            }

            await Promise.all(
              cbus.map(async ([cbu]) => {
                const res = await this.serverFetch({
                  method: "DELETE",
                  path: "operator/operator_cbu",
                  params: {
                    cbu,
                  },
                });
                if (!res.success) {
                  delErrorCbus.push(cbu);
                  return;
                }
                delSuccessCbus.push(cbu);
              })
            );

            close();
            delErrorCbus.forEach((cbu) => {
              this.notify({
                color: "#ff6b6b",
                title: "Error al eliminar cbu",
                description: `No se pudo eliminar el cbu ${cbu}, por favor intenta recargar la página o comunicate con el administrador.`,
                lifespan: 10000,
                buttons: [
                  {
                    title: "Administrar cbus",
                    callback: this.openCbusModal.bind(this),
                  },
                ],
              });
            });

            delSuccessCbus.forEach((cbu) => {
              this.cbus = this.cbus.filter((c) => c.cbu !== cbu);
              this.notify({
                title: "Cbu eliminado correctamente",
                description: `Se eliminó el cbu ${cbu}`,
                lifespan: 10000,
                buttons: [
                  {
                    title: "Administrar cbus",
                    callback: this.openCbusModal.bind(this),
                  },
                ],
              });
            });
          },
        },
      ],
    });
  }

  openUpdatecCbuListingModal() {
    const checkboxes = this.cbus.map((cbu) => ({
      title: cbu.cbu,
      checked: cbu.available,
      description: cbu.name,
    }));

    this.openModal({
      title: "Actualizar listado de cbus",
      description:
        "Aca podes actualizar el listado de cbus, los cbus\nque esten seleccionados se van a agregar a la\nlista de cbus para recibir dinero.",
      checkboxes,
      buttons: [
        {
          title: "Cancelar",
          callback: (close) => {
            close();
          },
        },
        {
          title: "Actualizar listado",
          callback: async (close, data) => {
            const deactivationCbus = [];
            const activationCbus = [];

            Object.entries(data).forEach(([cbu, add]) => {
              // Compare the current state of the cbu with the new state
              const currentCbu = this.cbus.find((c) => c.cbu === cbu);
              if (currentCbu.available !== add) {
                if (add) activationCbus.push(cbu);
                else deactivationCbus.push(cbu);
              }
            });

            if (!activationCbus.length && !deactivationCbus.length) {
              close("No cambiaste ningun cbu.");
              return;
            }

            const updateActivationErrorCbus = [];
            const updateActivationSuccessCbus = [];
            const updateDeactivationErrorCbus = [];
            const updateDeactivationSuccessCbus = [];

            await Promise.all([
              ...activationCbus.map(async (cbu) => {
                const res = await this.serverFetch({
                  method: "PATCH",
                  path: "operator/operator_cbu",
                  params: {
                    cbu,
                    available: true,
                  },
                });
                if (!res.success) {
                  updateActivationErrorCbus.push(cbu);
                  return;
                }
                updateActivationSuccessCbus.push(cbu);
              }),
              ...deactivationCbus.map(async (cbu) => {
                const res = await this.serverFetch({
                  method: "PATCH",
                  path: "operator/operator_cbu",
                  params: {
                    cbu,
                    available: false,
                  },
                });
                if (!res.success) {
                  updateDeactivationErrorCbus.push(cbu);
                  return;
                }
                updateDeactivationSuccessCbus.push(cbu);
              }),
            ]);

            close();
            updateActivationErrorCbus.forEach((cbu) => {
              this.notify({
                color: "#ff6b6b",
                title: "Error al activar cbu",
                description: `No se pudo activar el cbu ${cbu}, por favor intenta recargar la página o comunicate con el administrador.`,
                lifespan: 10000,
                buttons: [
                  {
                    title: "Administrar cbus",
                    callback: this.openCbusModal.bind(this),
                  },
                ],
              });
            });
            updateDeactivationErrorCbus.forEach((cbu) => {
              this.notify({
                color: "#ff6b6b",
                title: "Error al desactivar cbu",
                description: `No se pudo desactivar el cbu ${cbu}, por favor intenta recargar la página o comunicate con el administrador.`,
                lifespan: 10000,
                buttons: [
                  {
                    title: "Administrar cbus",
                    callback: this.openCbusModal.bind(this),
                  },
                ],
              });
            });
            updateActivationSuccessCbus.forEach((cbu) => {
              this.cbus.find((c) => c.cbu === cbu).available = true;
              this.notify({
                title: "Cbu activado correctamente",
                description: `Se activó el cbu ${cbu}`,
                lifespan: 10000,
                buttons: [
                  {
                    title: "Administrar cbus",
                    callback: this.openCbusModal.bind(this),
                  },
                ],
              });
            });
            updateDeactivationSuccessCbus.forEach((cbu) => {
              this.cbus.find((c) => c.cbu === cbu).available = false;
              this.notify({
                title: "Cbu desactivado correctamente",
                description: `Se desactivó el cbu ${cbu}`,
                lifespan: 10000,
                buttons: [
                  {
                    title: "Administrar cbus",
                    callback: this.openCbusModal.bind(this),
                  },
                ],
              });
            });
          },
        },
      ],
    });
  }

  openCbusModal() {
    this.openModal({
      title: "Administrar cbus",
      description: "Aca podes administrar los cbus para recibir dinero.",
      buttons: [
        {
          title: "Cancelar",
          callback: (close) => {
            close();
          },
        },
        ...(this.cbus.length > 0
          ? [
              {
                title: "Borrar cbu",
                callback: (close) => {
                  close();
                  this.openRemoveCbuModal();
                },
              },
            ]
          : []),
        {
          title: "Agregar cbu",
          callback: (close) => {
            close();
            this.openAddCbuModal();
          },
        },
        ...(this.cbus.length > 0
          ? [
              {
                title: "Actualzar listado",
                callback: (close, data) => {
                  close();
                  this.openUpdatecCbuListingModal();
                },
              },
            ]
          : []),
      ],
    });
  }

  onControlPanelClickCallback() {
    const buttons = [
      this.currentShift.isOpen
        ? {
            title: "Cerrar turno",
            callback: this.updateShift.bind(this),
          }
        : {
            title: "Abrir turno",
            callback: this.updateShift.bind(this),
          },
      {
        title: "Administrar cbus",
        callback: async (close, data) => {
          close();
          this.openCbusModal();
        },
      },
      {
        title: "Actualizar telefono",
        callback: (close) => {
          close();
          this.openUpdatePhoneNumberModal();
        },
      },
    ];

    this.openModal({
      title: "Panel de control",
      description: "Aca se encuentran las opciones de control del operador.",
      buttons,
    });
  }

  async startControlPanelListener() {
    // wait for menu bar chat to be loaded
    // duplicate element from menu bar chat
    let menuBarChat;
    while (true) {
      menuBarChat = document.querySelector(
        '[title="Nuevo chat"]'
      )?.parentElement;
      if (menuBarChat) break;
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    const controlPanel = menuBarChat.cloneNode(true);
    controlPanel.setAttribute("id", "control-panel");
    // select first child of controlPanel
    controlPanel.children[0].setAttribute(
      "title",
      "Panel de control del operador"
    );
    controlPanel.children[0].setAttribute(
      "aria-label",
      "Panel de control del operador"
    );
    // Replace inner svg with img from "assets/control_panel.png" of size 24x24px
    const imgElement = document.createElement("img");
    imgElement.src = chrome.runtime.getURL("assets/control_panel.png");
    imgElement.width = 24;
    imgElement.height = 24;
    controlPanel.querySelector("svg").replaceWith(imgElement);
    // Add event listener to control panel
    controlPanel.removeEventListener(
      "click",
      this.boundOnControlPanelClickListener
    );
    controlPanel.addEventListener(
      "click",
      this.boundOnControlPanelClickListener
    );
    // Insert control panel after menuBarChat
    menuBarChat.parentNode.insertBefore(controlPanel, menuBarChat.nextSibling);
  }

  onChatClickListener(event) {
    let target = event.target;

    // Traverse up the DOM tree to check if the clicked element or any of its ancestors has role="listitem"
    while (target) {
      if (target.getAttribute && target.getAttribute("role") === "listitem") {
        // Execute your callback
        this.appendUserData();
        return;
      }
      target = target.parentElement;
    }
  }

  async getUserData(movements = false) {
    try {
      // Get user data
      const userDataRes = await this.serverFetch({
        method: "GET",
        path: "operator/client_data",
        params: {
          username: await this.findPhoneNumber(),
          returnMovements: movements,
        },
      });

      if (!userDataRes.success) {
        return null;
      }

      this.currentChatData = {
        ...this.currentChatData,
        ...userDataRes.data,
        userFound: userDataRes.userFound,
      };

      return userDataRes;
    } catch (error) {
      console.log("error:", error);
      this.notify({
        title: "Error al obtener datos del cliente",
        description: "Hubo un error al obtener los datos del cliente.",
      });

      return {
        success: false,
        userFound: false,
        error: "Error al obtener datos del cliente",
      };
    }
  }

  async appendUserData() {
    // Check if the header element already has a 'header-data' div
    if (!document.querySelector("#main > header > .header-data")) {
      this.currentChatData = {};
      // Get the header element
      const header = document.querySelector("#main > header");

      // Create a new div with class 'header-data' and append all current children of the header to it
      const newHeaderDiv = document.createElement("div");
      newHeaderDiv.className = "header-data";
      while (header.firstChild) {
        newHeaderDiv.appendChild(header.firstChild);
      }
      // Insert the new 'header' div into the header
      header.appendChild(newHeaderDiv);

      // Create and insert a div with class 'client-data-container' into the header
      const clientDataContainer = document.createElement("div");
      clientDataContainer.className = "client-data-container";
      header.appendChild(clientDataContainer);

      // Add flex-direction: column style to header element
      header.style.flexDirection = "column";

      // Get user data
      await this.getUserData();
      if (!this.currentChatData.userFound) {
        this.currentChatData = {
          userFound: false,
          username: "Usuario nuevo",
          balance: 0,
          phoneNumber: (await this.findPhoneNumber()).replace(/[\s-]/g, ""),
          isBlocked: false,
          movements: [],
        };
      }

      // Inside first div append in column alignment 'username' and 'balance', below the phone number and below the create date
      const usernameDiv = document.createElement("div");
      usernameDiv.className = "username copyable client-data";
      usernameDiv.innerText = `${this.currentChatData.username}`;
      usernameDiv.title = "Click para copiar"; // Optional: add a title to show a tooltip on hover
      usernameDiv.addEventListener("click", () =>
        this.saveIntoClipboard(this.currentChatData.username, true)
      );

      const balanceDiv = document.createElement("div");
      balanceDiv.className = "balance copyable client-data";
      balanceDiv.innerText = `${this.currentChatData.balance}`;
      balanceDiv.title = "Click para copiar";
      balanceDiv.addEventListener("click", () =>
        this.saveIntoClipboard(this.currentChatData.balance, true)
      );

      const phoneNumberDiv = document.createElement("div");
      phoneNumberDiv.className = "phone-number copyable client-data";
      phoneNumberDiv.innerText = `${this.currentChatData.phoneNumber}`;
      phoneNumberDiv.title = "Click para copiar";
      phoneNumberDiv.addEventListener("click", () =>
        this.saveIntoClipboard(this.currentChatData.phoneNumber, true)
      );

      // Create a div for the top section and append username and balance to it
      const topDiv = document.createElement("div");
      topDiv.className = "top";
      topDiv.appendChild(usernameDiv);
      topDiv.appendChild(balanceDiv);

      const leftElementsContainer = document.createElement("div");
      leftElementsContainer.className = "left-elements";

      const clientDataInputs = document.createElement("div");
      clientDataInputs.className = "client-data-inputs";

      // If the user is not blocked, append the buttons to the client-data-inputs container
      const sendCoinsButton = this.createInputButton({
        title: "Enviar fichas",
        callback: async (balance) => {
          if (!(await this.checkOpenTurn())) return "No hay turno abierto";
          if (this.currentChatData.isBlocked)
            return "El usuario está bloqueado";
          const parsedBalance = parseFloat(balance);
          if (isNaN(parsedBalance) || parsedBalance <= 0)
            return "Valor inválido";

          await this.releaseCoins(
            parsedBalance,
            this.currentChatData.phoneNumber
          );
        },
      });
      clientDataInputs.appendChild(sendCoinsButton);

      const subtractCoinsButton = this.createInputButton({
        title: "Retirar fichas",
        callback: async (balance) => {
          if (!(await this.checkOpenTurn())) return "No hay turno abierto";
          if (!this.currentChatData.userFound)
            return "Es un usuario nuevo, solo se puede enviar fichas";
          if (this.currentChatData.isBlocked)
            return "El usuario está bloqueado";
          const parsedBalance = parseFloat(balance);
          if (isNaN(parsedBalance) || parsedBalance <= 0)
            return "Valor inválido";
          if (parsedBalance > this.currentChatData.balance)
            return "No tiene suficientes fichas";

          await this.subtractCoins(
            parsedBalance,
            this.currentChatData.phoneNumber
          );
        },
        color: "#FF4757",
      });
      clientDataInputs.appendChild(subtractCoinsButton);

      const updatePasswordButton = this.createInputButton({
        title: "Cambiar contraseña",
        callback: async (newPass) => {
          if (!(await this.checkOpenTurn())) return "No hay turno abierto";
          if (!this.currentChatData.userFound)
            return "Es un usuario nuevo, solo se puede enviar fichas";
          if (this.currentChatData.isBlocked)
            return "El usuario está bloqueado";
          if (!newPass.length) return "La contraseña no puede estar vacía";
          await this.updatePassword(newPass, this.currentChatData.phoneNumber);
        },
        color: "#4a90e2",
      });
      clientDataInputs.appendChild(updatePasswordButton);

      // Replace client-data-inputs with

      // Add a block or unblock button relative to isBlocked value, relatively also update color and callback
      const blockButton = this.createButton({
        title: this.currentChatData.isBlocked ? "Desbloquear" : "Bloquear",
        callback: async () => {
          if (!(await this.checkOpenTurn())) return "No hay turno abierto";
          if (!this.currentChatData.userFound)
            return "Es un usuario nuevo, solo se puede enviar fichas";
          await this.toggleUserBlock(this.currentChatData.phoneNumber);
        },
        classes: [
          "block-user-button",
          ...(this.currentChatData.isBlocked
            ? ["user-blocked"]
            : ["user-unblocked"]),
        ],
      });

      // Append all existing elements to the leftElementsContainer
      clientDataContainer.appendChild(leftElementsContainer);
      leftElementsContainer.appendChild(topDiv);
      leftElementsContainer.appendChild(phoneNumberDiv);
      leftElementsContainer.appendChild(clientDataInputs);
      leftElementsContainer.appendChild(blockButton);

      const movementsDiv = document.createElement("div");
      movementsDiv.className = "client-movements";

      // Create a header div to hold the title and sync button
      const headerDiv = document.createElement("div");
      headerDiv.className = "movements-header";

      // Create and append a title
      const title = document.createElement("h2");
      title.className = "movements-title";
      title.innerText = "Historial de movimientos";
      headerDiv.appendChild(title);

      // Create a sync icon button
      const syncIconButton = this.createButton({
        title: "↻",
        callback: async () => {
          await this.getUserData(true);
          this.displayMovements(movementsDiv);
        },
        classes: ["sync-icon-button"],
      });
      headerDiv.appendChild(syncIconButton);

      // Append the header div to the movementsDiv
      movementsDiv.appendChild(headerDiv);

      // Create a separate container for the movements list
      const movementsListContainer = document.createElement("div");
      movementsListContainer.className = "movements-list-container";

      // Create and append a "Cargar historial" button
      const loadHistoryButton = this.createButton({
        title: "Cargar historial",
        callback: async () => {
          await this.getUserData(true);
          this.displayMovements(movementsDiv);
        },
        classes: ["load-history-button"],
      });
      movementsListContainer.appendChild(loadHistoryButton);

      // Append the movements list container to the movementsDiv
      movementsDiv.appendChild(movementsListContainer);

      // Create a new container for left data
      clientDataContainer.appendChild(movementsDiv);
    }
  }

  // Start listening for new chat clicked
  startNewChatListener() {
    document.removeEventListener("click", this.boundOnChatClickListener);
    document.addEventListener("click", this.boundOnChatClickListener);
  }

  async checkOpenTurn() {
    if (!this.currentShift.isOpen) {
      this.notify({
        color: "#FFCC00",
        title: "Turno cerrado",
        description: "Para cargar fichas debes tener un turno abierto.",
        buttons: [
          {
            title: "Abrir nuevo turno",
            callback: this.updateShift.bind(this),
          },
        ],
      });
      return false;
    }
    return true;
  }

  async addCoinsCallback() {
    if (!this.currentShift.isOpen) {
      this.notify({
        color: "#FFCC00",
        title: "Turno cerrado",
        description: "Para cargar fichas debes tener un turno abierto.",
        buttons: [
          {
            title: "Abrir nuevo turno",
            callback: this.updateShift.bind(this),
          },
        ],
      });
      return;
    }
    const phoneNumber = await this.findPhoneNumber();

    await this.openModal({
      title: "Cargar fichas",
      description: `Cargar fichas al usuario asociado al telefono\n${phoneNumber}`,
      inputs: [
        {
          title: "Cantidad de fichas",
          placeholder: "0",
          optional: false,
        },
      ],
      buttons: [
        {
          title: "Cancelar",
          callback: (closeModalCallback) => {
            closeModalCallback();
          },
        },
        {
          title: "Cargar fichas",
          callback: async (closeModalCallback, values) => {
            const { "Cantidad de fichas": coins } = values;
            const coinsAmount = parseInt(coins);
            if (isNaN(coinsAmount)) {
              closeModalCallback("La cantidad de fichas debe ser un numero.");
            } else {
              await this.releaseCoins(coinsAmount, phoneNumber);
              closeModalCallback();
            }
          },
        },
      ],
    });
  }

  async removeCoinsCallback() {
    if (!this.currentShift.isOpen) {
      this.notify({
        color: "#FFCC00",
        title: "Turno cerrado",
        description: "Para descargar fichas debes tener un turno abierto.",
        buttons: [
          {
            title: "Abrir nuevo turno",
            callback: this.updateShift.bind(this),
          },
        ],
      });
      return;
    }
    const phoneNumber = await this.findPhoneNumber();

    await this.openModal({
      title: "Descargar fichas",
      description: `Descargar fichas del usuario asociado al telefono\n${phoneNumber}`,
      inputs: [
        {
          title: "Cantidad de fichas",
          placeholder: "0",
          optional: false,
        },
      ],
      buttons: [
        {
          title: "Cancelar",
          callback: (closeModalCallback) => {
            closeModalCallback();
          },
        },
        {
          title: "Descargar fichas",
          callback: async (closeModalCallback, values) => {
            const { "Cantidad de fichas": coins } = values;
            const coinsAmount = parseInt(coins);
            if (isNaN(coinsAmount)) {
              closeModalCallback("La cantidad de fichas debe ser un numero.");
            } else {
              await this.subtractCoins(coinsAmount, phoneNumber);
              closeModalCallback();
            }
          },
        },
      ],
    });
  }
}
