// This file is required by the factura.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
angular
  .module("fact_velez", [])

  // El logotipo predeterminado para la factura
  .constant("DEFAULT_LOGO", "./dist/img/home.jpg")

  // Datos de inicio
  .constant("DEFAULT_INVOICE", {
    invoice_number: "",
    subTotal: 0,
    taxTotal: 0,
    discountTotal: 0,
    amountTotal: 0,
    client_info: {
      nameclient: "",
      lastnameclient: "",
      idclient: "",
      email: "",
      tel: ""
    },
    seller_info: {
      idseller: ""
    },
    items: [{ qty: 1, code: "", cost: "", descUni: "", cosTot: "" }]
  })

  // Servicio para acceder al almacenamiento local
  .service("LocalStorage", [
    function() {
      var Service = {};

      // Verifica si se almacena una factura
      var hasInvoice = function() {
        return !(
          localStorage.invoice == "" || localStorage.invoice == null
        );
      };

      // Devuelve una factura almacenada (falsa si no se hay ninguna)
      Service.getInvoice = function() {
        if (hasInvoice()) {
          if (
            localStorage.invoice !== undefined &&
            localStorage.invoice !== "undefined"
          ) {
            return JSON.parse(localStorage.invoice);
          } else {
            return false;
          }
        } else {
          return false;
        }
      };

      Service.setInvoice = function(invoice) {
        localStorage.invoice = JSON.stringify(invoice);
      };

      // Borra todo el almacenamiento local
      Service.clear = function() {
        localStorage.invoice = "";
      };

      return Service;
    }
  ])

  // Controlador principal de la aplicación
  .controller("factVelezCtrl", [
    "$scope",
    "DEFAULT_INVOICE",
    "DEFAULT_LOGO",
    "LocalStorage",
    function($scope, DEFAULT_INVOICE, DEFAULT_LOGO, LocalStorage) {
      $scope.readInit = function() {
        //Inicializar clase DataBase
        db = new fnDataBase();
        //Inicializar Query de consultas
        var querySQL = new consultas();
        //Crear base de datos Sqlite
        db.fnCrearDB();
        //Leo el archivo de configuracion
        querySQL.archivoConfigTienda("FactOffline.json");
        // Intenta cargar la factura del almacenamiento local
        var invoice = LocalStorage.getInvoice();
        $scope.invoice = invoice ? invoice : DEFAULT_INVOICE;
        // Establecer el logotipo
        $scope.logo = DEFAULT_LOGO;

        //Consulta factura con consecutivo mas alto
        querySQL.fnConsulUltimaFactura(function(datos) {
          localStorage.setItem("lastfact", datos.rows[0].factura);
        });
        //Establezco el número de factura
        $scope.lastFact();
      };

      //Se consulta el consecutivo de factura correspondiente
      $scope.lastFact = function() {
        var factOfflineRead = localStorage.getItem("FactOffline");
        var factOffline = JSON.parse(factOfflineRead);
        if (localStorage.getItem("rangoActual") === null) {
          localStorage.setItem("rangoActual", factOffline.RangoActual);
        }

        if (
          localStorage.getItem("rangoActual") !== factOffline.RangoActual &&
          localStorage.getItem("lastfact") !== factOffline.RangoActual
        ) {
          $scope.invoice.invoice_number = factOffline.RangoActual;
          localStorage.setItem("rangoActual", factOffline.RangoActual);
        } else if (
          localStorage.getItem("rangoActual") === factOffline.RangoActual &&
          localStorage.getItem("lastfact") === "null"
        ) {
          $scope.invoice.invoice_number = factOffline.RangoActual;
        } else {
          var storageLastFact = "";
          if (
            parseInt(localStorage.getItem("rangoActual")) <
            parseInt(localStorage.getItem("lastfact"))
          ) {
            storageLastFact = parseFloat(localStorage.getItem("lastfact")) + 1;
          } else if (
            localStorage.getItem("rangoActual") ===
            localStorage.getItem("lastfact")
          ) {
            storageLastFact =
              parseFloat(localStorage.getItem("rangoActual")) + 1;
          } else {
            storageLastFact = localStorage.getItem("rangoActual");
          }
          if (
            storageLastFact === "" ||
            storageLastFact === "null" ||
            storageLastFact === null
          ) {
            $scope.invoice.invoice_number = factOffline.RangoActual;
          } else if (
            parseFloat(storageLastFact) >
            parseFloat(factOffline.rangoFactura.final)
          ) {
            swal(
              "ALERTA",
              "Se acabaron los consecutivos de factura, contactar con el administrador",
              "error"
            );
          } else {
            $scope.invoice.invoice_number = storageLastFact;
          }
        }
      };

      //Nombre de la tienda
      $scope.nameShop = function() {
        var factOfflineRead = localStorage.getItem("FactOffline");
        var factOffline = JSON.parse(factOfflineRead);
        var nameShop = " FACTURACIÓN VELEZ | ";
        return nameShop + factOffline.nombreTienda;
      };

      //Fecha actual del sistema
      $scope.currentDate = function() {
        var dt = new Date();
        return (
          dt.getDate() + "/" + (dt.getMonth() + 1) + "/" + dt.getFullYear()
        );
      };
      //IVA
      $scope.IVA = function() {
        var factOfflineRead = localStorage.getItem("FactOffline");
        var iva = JSON.parse(factOfflineRead).iva;
        return iva;
      };
      //Contador de productos
      $scope.accountant = function() {
        return $scope.invoice.items.length;
      };

      // Agrega otro campo a los artículos de la factura
      $scope.addItem = function() {
        $scope.invoice.items.push({
          qty: 1,
          code: "",
          cost: "",
          descUni: "",
          cosTot: ""
        });
      };
      // Remueve un artículo de la factura
      $scope.removeItem = function(item) {
        $scope.invoice.items.splice($scope.invoice.items.indexOf(item), 1);
      };

      // Calcula el subtotal de la factura
      $scope.invoiceSubTotal = function() {
        var subTotal = 0.0;
        angular.forEach($scope.invoice.items, function(item) {
          var value = item.cost.replace(/[^0-9.-]+/g, "").toString();
          var factOfflineRead = localStorage.getItem("FactOffline");
          var iva = parseFloat("1." + JSON.parse(factOfflineRead).iva);
          subTotal += (item.qty * value.split(".")[0]) / iva; //OJO Cambio de calculo
        });
        subTotal = parseFloat(subTotal);
        $scope.invoice.subTotal = subTotal;
        return subTotal;
      };
      // Calcula el IVA de la factura
      $scope.calculateTax = function() {
        var taxTotal = 0;
        angular.forEach($scope.invoice.items, function(item) {
          var desc = parseFloat($scope.removePerc(item.descUni));
          if (desc === undefined || isNaN(desc)) {
            desc = 0;
          }
          var value = item.cost.replace(/[^0-9.-]+/g, "").toString();
          var factOfflineRead = localStorage.getItem("FactOffline");
          var iva0 = parseFloat("0." + JSON.parse(factOfflineRead).iva);
          var iva1 = parseFloat("1." + JSON.parse(factOfflineRead).iva);
          var result = ((value - (value * desc) / 100) / iva1) * iva0;
          taxTotal += result;
        });
        $scope.invoice.taxTotal = taxTotal;
        return taxTotal;
      };
      //Calcula descuento total
      $scope.calculateDesc = function() {
        var discountTotal = 0.0;
        angular.forEach($scope.invoice.items, function(item) {
          var value = item.cost.replace(/[^0-9.-]+/g, "").toString();
          var descUni = $scope.removePerc(item.descUni);
          var factOfflineRead = localStorage.getItem("FactOffline");
          var iva1 = parseFloat("1." + JSON.parse(factOfflineRead).iva);
          var costoF = value / iva1; //Ojo cambio de calculo
          discountTotal += (costoF * descUni) / 100;
        });
        discountTotal = parseFloat(discountTotal);
        $scope.invoice.discountTotal = discountTotal;
        return discountTotal;
      };
      //Calcular precio unitario
      $scope.calculateUnit = function(output) {
        if (output.item.cost !== 0 && output.item.cost !== "") {
          var pr = 0;
          var value = output.item.cost.replace(/[^0-9.-]+/g, "").toString();
          var descUni = $scope.removePerc(output.item.descUni);
          var cosTot = value - (value * descUni) / 100;
          cosTot = parseFloat(cosTot);
          output.item.cosTot = cosTot;
          pr = cosTot;
          return pr;
        } else {
          return 0;
        }
      };

      // Calcula el total general de la factura
      $scope.calculateGrandTotal = function() {
        saveInvoice();
        var grandTotal =
          $scope.calculateTax() +
          $scope.invoiceSubTotal() -
          $scope.calculateDesc();
        grandTotal = parseFloat(grandTotal);
        $scope.invoice.amountTotal = parseFloat(grandTotal);
        return grandTotal;
      };

      //Borra el almacenamiento local
      $scope.clearLocalStorage = function() {
        var creacion = localStorage.getItem("facturaCreada");
        if (creacion === "1") {
          LocalStorage.clear();
          setInvoice(DEFAULT_INVOICE);
          $scope.lastFact();
        } else {
          swal({
            title: "Reiniciar factura",
            text: "¿Esta seguro que quiere salir de la factura actual?",
            icon: "warning",
            buttons: true,
            dangerMode: true
          }).then(willDelete => {
            if (willDelete) {
              LocalStorage.clear();
              setInvoice(DEFAULT_INVOICE);
              $scope.lastFact();
              location.reload();
            }
          });
        }
      };

      // Establece la factura actual
      var setInvoice = function(invoice) {
        $scope.invoice = "";
        for (var index = 0; index < invoice.items.length; index++) {
          if (index >= 0) {
            invoice.items.splice(index, 1);
            index -= 1;
          }
        }
        invoice.items.push({
          qty: 1,
          code: "",
          cost: "",
          descUni: "",
          cosTot: ""
        });
        $scope.invoice = invoice;
        saveInvoice();
      };

      // Guarda la factura en el almacenamiento local
      var saveInvoice = function() {
        LocalStorage.setInvoice($scope.invoice);
      };

      $scope.validarCodigoBarras = function() {
        var code = $scope.validateFormatCode();
        var tamCode = $scope.validateTamCod();
        if (code === false) {
          return false;
        } else if (tamCode === false) {
          return false;
        } else {
          return true;
        }
      };

      //Valida si la final esta vacia y la elimina
      $scope.validateFormatFieldEmpaty = function() {
        var sw = false;
        var size = $scope.invoice.items.length;
        var code = $scope.invoice.items[size - 1].code.toString();
        var cost = $scope.invoice.items[size - 1].cost.toString();
        if (code === "" && cost === "" && size !== 1) {
          sw = true;
          $scope.invoice.items.splice(size - 1, size - 1); //Eliminar fila vacia
        }
        return sw;
      };

      //Validaciones
      $scope.validate = function() {
        $scope.validateFormatFieldEmpaty();
        var creaFact = localStorage.getItem("facturaCreada");
        if (creaFact === "0") {
          var idSeller = $scope.validateIdSeller(
            $scope.invoice.seller_info.idseller
          );
          var idClient = $scope.validateIdClient(
            $scope.invoice.client_info.idclient
          );
          var email = $scope.validateEmail($scope.invoice.client_info.email);
          var tel = $scope.validateTel($scope.invoice.client_info.tel);
          var name = $scope.validateNameClient(
            $scope.invoice.client_info.nameclient
          );
          var lastname = $scope.validateLastName(
            $scope.invoice.client_info.lastnameclient
          );
          var tamCode = $scope.validateTamCod();
          var code = $scope.validateFormatCode();
          var costs = $scope.validateCost();
          var prods = $scope.validateProds($scope.invoice);

          if (idSeller === false) {
            swal(
              "Error cédula vendedor",
              "La cédula del vendedor tiene un formato incorrecto",
              "warning",
              {
                button: false
              }
            );
          } else if (idClient === false) {
            swal(
              "Error Identificación cliente",
              "La identificación del cliente tiene un formato incorrecto",
              "warning",
              {
                button: false
              }
            );
          } else if (
            email === false &&
            $scope.invoice.client_info.email !== ""
          ) {
            swal(
              "Error Email",
              "El email tiene un formato incorrecto",
              "warning",
              {
                button: false
              }
            );
          } else if (tel === false) {
            swal(
              "Error Teléfono",
              "El télefono es obligatorio ó tiene un formato incorrecto",
              "warning",
              {
                button: false
              }
            );
          } else if (name === false) {
            swal(
              "Error Nombre del cliente",
              "Debe indicar el nombre del cliente",
              "warning",
              {
                button: false
              }
            );
          } else if (lastname === false) {
            swal(
              "Error Apellido del cliente",
              "Debe indicar el apellido del cliente",
              "warning",
              {
                button: false
              }
            );
          } else if (tamCode === false) {
            swal(
              "Error código de barras",
              "El código de barras debe ser de 7 ó 16 números",
              "error",
              {
                button: false
              }
            );
          } else if (code === false) {
            swal(
              "Error código de barras",
              "El código tiene un formato incorrecto",
              "error",
              {
                button: false
              }
            );
          } else if (costs === false) {
            swal(
              "Error",
              "Debe indicar el precio de todos los productos",
              "error",
              {
                button: false
              }
            );
          } else if (prods === false) {
            swal(
              "Error",
              "Debe registrar productos para realizar el pago",
              "error",
              {
                button: false
              }
            );
          } else {
            window.location = "payment.html";
          }
        } else {
          if (creaFact !== null) {
            $scope.clearLocalStorage();
          }
          localStorage.setItem("facturaCreada", "0");
          $scope.validate();
        }
      };
      //Valida que se hayan registrado productos
      $scope.validateProds = function(invoice) {
        if (invoice.items.length === 0) {
          return false;
        } else {
          return true;
        }
      };
      //Valida si el email tiene un formato correcto
      $scope.validateEmail = function(email) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
      };
      //Valida el número de télefono
      $scope.validateTel = function(tel) {
        if (tel !== null && tel !== undefined && tel !== "") {
          return $scope.expNumber(tel);
        } else {
          return false;
        }
      };
      //Valida la identificación del vendedor
      $scope.validateIdSeller = function(idSeller) {
        if (idSeller !== null && idSeller !== undefined && idSeller !== "") {
          return $scope.expNumber(idSeller);
        } else {
          return false;
        }
      };
      //Valida la identificación del cliente
      $scope.validateIdClient = function(idClient) {
        if (idClient !== null && idClient !== undefined && idClient !== "") {
          return $scope.expNumber(idClient);
        } else {
          return false;
        }
      };
      //Validar tamaño del codigo de barras
      $scope.validateTamCod = function() {
        var sw = true;
        angular.forEach($scope.invoice.items, function(item) {
          var code = item.code.toString().length;
          if (!(code === 7 || code === 16)) {
            sw = false;
          }
        });
        return sw;
      };
      //Valida el formato del código de barras
      $scope.validateFormatCode = function() {
        var sw = true;
        angular.forEach($scope.invoice.items, function(item) {
          var code = item.code;
          if (!$scope.expNumber(code)) {
            sw = false;
          }
        });
        return sw;
      };
      //Valida que se digite el precio
      $scope.validateCost = function() {
        var sw = true;
        angular.forEach($scope.invoice.items, function(item) {
          var cost = item.cost;
          if (cost === 0 || cost === "" || cost === "0.00" || cost === "0") {
            sw = false;
          }
        });
        return sw;
      };
      //Verifica si una cadena es numerica
      $scope.expNumber = function(number) {
        if (!/^([0-9])*$/.test(number)) {
          return false;
        } else {
          return true;
        }
      };
      //Valida el nombre del cliente
      $scope.validateNameClient = function(name) {
        if (name === "") {
          return false;
        }
        return true;
      };
      //Valida el apellido del cliente
      $scope.validateLastName = function(lastname) {
        if (lastname === "") {
          return false;
        }
        return true;
      };
      //Valida el valor del porcentaje
      $scope.validatePercentage = function(perc) {
        var sw = true;
        angular.forEach($scope.invoice.items, function(item) {
          if (!(perc >= 0 && perc <= 100)) {
            sw = false;
          }
        });
        return sw;
      };
      //Agrega miles y decimas al costo
      $scope.formatCoin = function(item) {
        var data = item.cost;
        var result = formatMoney(data);
        item.cost = result;

        function formatMoney(n, c, d, t) {
          var c = isNaN((c = Math.abs(c))) ? 2 : c,
            d = d == undefined ? "." : d,
            t = t == undefined ? "," : t,
            s = n < 0 ? "-" : "",
            i = String(parseFloat((n = Math.abs(Number(n) || 0).toFixed(c)))),
            j = (j = i.length) > 3 ? j % 3 : 0;
          return (
            s +
            (j ? i.substr(0, j) + t : "") +
            i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) +
            (c ? d.slice(2) : "")
          );
        }
      };
      //Agrega el signo %
      $scope.formatPerc = function(item) {
        var perc = item.descUni;
        perc = perc.replace(/^0+/, "");
        if (!$scope.validatePercentage(perc)) {
          swal(
            "Error Descuento",
            "El descuento tiene un formato incorrecto",
            "error",
            {
              button: false
            }
          );
          item.descUni = "";
        } else {
          if (perc == null || perc == "") {
            item.descUni = "0%";
          } else {
            item.descUni = perc + "%";
          }
        }
      };
      //Devuelve el formato original del costo
      $scope.clearMoney = function(item) {
        var value = item.cost.replace(/[^0-9.-]+/g, "").toString();
        if (value === "0") {
          item.cost = "";
        } else {
          item.cost = value.split(".")[0];
        }
      };
      //Devuelve el formato original de porcentaje
      $scope.clearPerc = function(item) {
        var perc = item.descUni;
        item.descUni = $scope.removePerc(perc);
      };
      //Remueve el signo %
      $scope.removePerc = function(cad) {
        if (cad === undefined) {
          return undefined;
        } else {
          return cad.split("%")[0];
        }
      };
      //Tabula entre inputs de tabla productos
      $scope.enterGeneric = function(event, index, campo) {
        var result, id;
        if (event.key === "Enter" && campo === "producto") {
          result = $scope.validarCodigoBarras();
          if (result === true) {
            id = "cost" + index;
            document.getElementById(id).focus();
          }
        } else if (event.key === "Enter" && campo === "desc") {
          result = $scope.validarCodigoBarras();
          if (result === true) {
            id = "desc" + index;
            document.getElementById(id).focus();
          }
        } else if (event.key === "Enter" && campo === "newLine") {
          result = $scope.validarCodigoBarras();
          if (result === true) {
            $scope.addItem();
            setTimeout(() => {
              var cont = index + 1;
              id = "product" + cont.toString();
              document.getElementById(id).focus();
            }, 200);
          }
        }
      };

      //Tabula entre inputs de cabecera
      $scope.enter = function(event, index) {
        var id = "input" + (index + 1);
        if (event.key === "Enter") {
          if (index === 1) {
            var idSeller = $scope.validateIdSeller(
              $scope.invoice.seller_info.idseller
            );
            if (idSeller === false) {
              swal(
                "Error cédula vendedor",
                "La cédula del vendedor tiene un formato incorrecto",
                "warning",
                {
                  button: false
                }
              );
            } else {
              document.getElementById(id).focus();
            }
          }
          if (index === 2) {
            var idClient = $scope.validateIdClient(
              $scope.invoice.client_info.idclient
            );
            if (idClient === false) {
              swal(
                "Error Identificación cliente",
                "La identificación del cliente tiene un formato incorrecto",
                "warning",
                {
                  button: false
                }
              );
            } else {
              document.getElementById(id).focus();
            }
          }

          if (index === 6) {
            id = "product0";
            document.getElementById(id).focus();
          } else {
            document.getElementById(id).focus();
          }
        }
      };

      //Permite limpiar y validar si una factura fue creada para comenzar con otra
      $scope.validarCreacion = function(op) {
        //Establezco el número de factura
        if (op === 1) {
          $scope.lastFact();
        }
        var creacionFactura = localStorage.getItem("facturaCreada");
        if (creacionFactura === "1") {
          $scope.clearLocalStorage();
          localStorage.setItem("facturaCreada", "0");
        }
      };
    }
  ]);
