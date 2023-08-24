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

  boundOnAttachMenuClickListener = null;
  boundOnChatClickListener = null;
  boundOnControlPanelClickListener = null;

  constructor(apiKey) {
    super(apiKey);

    this.apiKey = apiKey;
    this.boundOnAttachMenuClickListener =
      this.onAttachMenuClickListener.bind(this);
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

            console.log("data:", data);
            const cbus = Object.entries(data).filter(([_, del]) => del);
            console.log("cbus:", cbus);

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
        this.startAttachMenuListener();
        return;
      }
      target = target.parentElement;
    }
  }

  // Start listening for new chat clicked
  startNewChatListener() {
    document.removeEventListener("click", this.boundOnChatClickListener);
    document.addEventListener("click", this.boundOnChatClickListener);
  }

  onAttachMenuClickListener(event) {
    let target = event.target;

    // Traverse up the DOM tree to check if the clicked element or any of its ancestors has role="listitem"
    while (target) {
      if (target.getAttribute && target.getAttribute("title") === "Adjuntar") {
        this.onAttachMenuClickCallback(target);
        return;
      }
      target = target.parentElement;
    }
  }

  async onAttachMenuClickCallback(element) {
    // get title="Adjuntar" next sibling inner div
    const attachMenuPopupContainer = element?.nextElementSibling;
    const containerEl = attachMenuPopupContainer?.firstElementChild;
    if (!containerEl) return;

    const options = [
      {
        title: "Cargar fichas",
        callback: this.addCoinsCallback,
        iconPath: "assets/add_coins.png",
      },
      {
        title: "Descargar fichas",
        callback: this.removeCoinsCallback,
        iconPath: "assets/remove_coins.png",
      },
    ];

    // Get the first listed item
    const firstChild =
      containerEl.firstElementChild.firstElementChild.firstElementChild;

    // Remove all elements with class custom-menu-item
    containerEl.querySelectorAll(".custom-menu-item").forEach((el) => {
      el.remove();
    });

    options.forEach((option) => {
      // Clone the first child
      const clonedChild = firstChild.cloneNode(true);
      clonedChild.classList.add("custom-menu-item");

      // Find the span containerEl inside the cloned child
      clonedChild.querySelector("span").textContent = option.title;

      // Replace the svg element with an img element
      const imgElement = document.createElement("img");
      imgElement.src = chrome.runtime.getURL(option.iconPath);
      imgElement.width = 20;
      imgElement.height = 20;
      clonedChild.querySelector("svg").replaceWith(imgElement);

      // Find the li element inside the cloned child and set its opacity to 1
      clonedChild.querySelector("li").style.opacity = "1";

      // Attach an event listener to the cloned child to execute the callback when clicked
      clonedChild.addEventListener("click", option.callback.bind(this));

      // Append the cloned child to the containerEl
      containerEl.appendChild(clonedChild);
    });
  }

  // Start listening for new chat clicked
  startAttachMenuListener() {
    document.removeEventListener("click", this.boundOnAttachMenuClickListener);
    document.addEventListener("click", this.boundOnAttachMenuClickListener);
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
              try {
                const res = await this.serverFetch({
                  method: "POST",
                  path: "operator/release_coins",
                  params: {
                    username: phoneNumber,
                    coinsAmount,
                  },
                });
                if (!res.success)
                  this.notify({
                    title: "Error enviando fichas",
                    color: "#ff6b6b",
                    description: res.error,
                  });
                else
                  this.notify({
                    title: "Fichas enviadas",
                    description: `Se enviaron ${coinsAmount} fichas al usuario asociado al telefono\n${phoneNumber}\n\n${res.data.message}`,
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
                closeModalCallback();
              } catch (error) {
                closeModalCallback();
                this.notify({
                  title: "Error enviando fichas",
                  color: "#ff6b6b",
                  description: "Por favor intente nuevamente.",
                });
              }
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
              try {
                const res = await this.serverFetch({
                  method: "POST",
                  path: "operator/subtract_coins",
                  params: {
                    username: phoneNumber,
                    coinsAmount,
                  },
                });
                if (!res.success)
                  this.notify({
                    title: "Error descargando fichas",
                    color: "#ff6b6b",
                    description: res.error,
                  });
                else
                  this.notify({
                    title: "Fichas descargadas",
                    description: `Se descargaron ${coinsAmount} fichas del usuario asociado al telefono\n${phoneNumber}\n\n${res.data.message}`,
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
                closeModalCallback();
              } catch (error) {
                console.log("error:", error);
                closeModalCallback();
                this.notify({
                  title: "Error enviando fichas",
                  color: "#ff6b6b",
                  description: "Por favor intente nuevamente.",
                });
              }
            }
          },
        },
      ],
    });
  }
}
