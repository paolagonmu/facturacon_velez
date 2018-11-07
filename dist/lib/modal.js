const electron = require("electron");
const path = require("path");
const BrowserWindow = electron.remote.BrowserWindow;
/**
 * @class new_window
 * @description Clase que permite crear nuevos Modal o Popus
 */
function nueva_ventana() {
  /**
   * @function finalizar
   * @description Funcion que permite mostrar un Modal para visualizar la factura creada correctamente
   *              y tambien para mostrar la opcion de imprimir.
   */
  this.finalizar = function() {
    // Ventana para generar la visualizacion de la factura
    const modalPath = path.join("file://", __dirname, "finalizar.html");
    let win = new BrowserWindow({
      width: 500,
      height: 250,
      resizable: false,
      minimizable: false,
      maximizable: false,
      modal: true,
      alwaysOnTop: true,
      icon: path.join(__dirname, "./dist/img/icon.png")
    });
    win.on("close", function() {
      win = null;
    });

    win.loadURL(modalPath);
    win.once("ready-to-show", () => {
      win.show();
    });
    
  };

  /**
   * @function printPage
   * @description Funcion que permite mostrar un Modal para visualizar la factura creada correctamente
   *              y tambien para mostrar la opcion de imprimir.
   */
  this.printPage = function() {
    // Stuff here soon
    const modalPath = path.join("file://", __dirname, "print.html");
    let win = new BrowserWindow({
      width: 290,
      height: 1000,
      resizable: false,
      minimizable: false,
      maximizable: false,
      alwaysOnTop: true,
      icon: path.join(__dirname, "./dist/img/icon.png")
    });
    win.on("close", function() {
      win = null;
    });
    win.loadURL(modalPath);
    
    win.once("ready-to-show", () => {
      win.show();
    });
  };

  this.ventanaPrincipal = function() {
    const modalPath = path.join("file://", __dirname, "index.html");
    let win = new BrowserWindow({
      width: 800,
      height: 600,
      icon: path.join(__dirname, "./dist/img/icon.png")
    });
    win.on("close", function() {
      win = null;
    });
    win.loadURL(modalPath);
    win.show();
  };
}
