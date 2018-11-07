angular.module("payment", []).controller("payment", [
  "$scope",
  function($scope) {
    //valores iniciales.
    $scope.readInit = function() {
      var invoice = JSON.parse(localStorage.getItem("invoice"));      
      $scope.numFact = invoice.invoice_number;
      $scope.purchase = Math.round(invoice.amountTotal);
      $scope.missing = Math.round(invoice.amountTotal);
      $scope.leftover = 0;
      $scope.totalCash = 0;
      $scope.totalCard = 0;

      $scope.opcMenu = ""; //establece que menu mostrar
      $scope.dsbSavePay = true;
      $scope.dsbBack = false;

      //Inicializar clase DataBase
      db = new fnDataBase();
      //Conecta base de datos Sqlite
      db.fnCrearDB();
      //Inicializar Query de consultas
      var querySQL = new consultas();
      //Leer archivo de configuracion
      querySQL.archivoConfigNumFact("confNumFacturas.json");
      $scope.ConsulultimaFact();
    };

    //Mostrar en inputs el valor faltante
    $scope.writeMissing = function(obj) {
      var missing = $scope.missing;
      if (obj.opcMenu === "E") {
        $scope.valueCash = $scope.formatMoney(missing);
      } else {
        $scope.valueCard = $scope.formatMoney(missing);
      }
    };

    //Aprobar o denegar abono
    $scope.pay = function(value, opc) {      
      value = value == undefined ? "0" : value;
      var amount = value.replace(/[^0-9.-]+/g, "").toString();
      if (opc == 1) {
        //EFECTIVO
        $scope.payCash(amount); //valida la data para efectivo
        if (amount > $scope.missing) {
          //calculo el cambio
          $scope.calculateLeftover(amount);
        }
      } else {
        //TARJETA
        $scope.payCard(amount); //valida la data para tarjeta
      }
      $scope.validateMorePay();
    };

    //Abono con efectivo
    $scope.payCash = function(cash) {
      var rpta = $scope.validateCash(cash);
      if (rpta != true) {
        swal("Error", rpta, "warning", { button: false });
      } else {
        var totalCash = 0;
        if (cash > $scope.missing) {
          //si se paga con un monto mayor
          totalCash =
            parseInt($scope.totalCash.toString().replace(/[^0-9.-]+/g, "")) +
            parseInt($scope.missing);
          $scope.totalCash = $scope.formatMoney(totalCash);
        } else {
          totalCash =
            parseInt($scope.totalCash.toString().replace(/[^0-9.-]+/g, "")) +
            parseInt(cash);
          $scope.totalCash = $scope.formatMoney(totalCash);
        }
        $scope.tableItem(cash, 1);
        $scope.clearMenuCash();
      }
    };

    //Abono con tarjeta
    $scope.payCard = function(card) {
      var rpta = $scope.validateCard(card);
      if (rpta != true) {
        swal("Error", rpta, "warning", { button: false });
      } else {
        var totalCard =
          parseInt($scope.totalCard.toString().replace(/[^0-9.-]+/g, "")) +
          parseInt(card);
        $scope.totalCard = $scope.formatMoney(totalCard);
        $scope.tableItem(card, 2);
        $scope.clearMenuCard();
      }
    };

    //Calcula a la cantidad faltante
    $scope.calculateMissing = function() {
      var totalCash = $scope.totalCash.toString();
      var totalCard = $scope.totalCard.toString();

      totalCash = parseFloat(totalCash.replace(/[^0-9.-]+/g, ""));
      totalCard = parseFloat(totalCard.replace(/[^0-9.-]+/g, ""));

      var missing = $scope.purchase - totalCash - totalCard;
      $scope.missing = missing;
      return missing;
    };

    //Calcula el cambio
    $scope.calculateLeftover = function(value) {
      $scope.leftover = value - $scope.missing;
    };

    //Guardo en la base de datos y genero archivos TXT
    $scope.savePay = function(datos) {
      $scope.dsbSavePay = true;
      $scope.dsbBack = true;
      datos.dataPayment.leftover = $scope.leftover;
      swal("OK", "Pago realizado con exito", "success", {
        button: false
      });
      //Definición de variables para las tablas
      var tabla1 = "tbl_cab_factura";
      var tabla2 = "tbl_det_factura";
      var tabla3 = "tbl_medio_pago";
      if (datos.dataPayment !== undefined) {
        var size = datos.dataPayment.pay_info.length;
        //Obtener datos de los medios de pagos
        var mediosPagos = datos.dataPayment.pay_info;
        localStorage.setItem("dataPayment", JSON.stringify(datos.dataPayment));
        //Obtener datos de las facturas, cabecera y detalle
        var datosFacturas = JSON.parse(localStorage.getItem("invoice"));
        if (size === 0) {
          swal("Error", "Debe seleccionar algún medio de pago", "warning", {
            button: false
          });
        } else {
          $scope.actualizar(tabla1, tabla2, tabla3);
          setTimeout(() => {
            //INSERTAR CABECERA FACTURA
            $scope.insertarCabFact(datosFacturas);
            //INSERTAR DETALLE FACTURA
            $scope.insertarDetFact(datosFacturas);
            //INSERTAR MEDIO DE PAGO
            $scope.insertarMedioPago(size, mediosPagos);
            //GENERAR LOS TRES ARCHIVOS
            $scope.ConsulFacturas(tabla1, tabla2, tabla3);
            //Generar archivo con la ultima factura
            $scope.generarFileUltimaFactura(datosFacturas.invoice_number);
            localStorage.setItem("imprimirFact", $scope.numFact);

            //volver
            setTimeout(() => {
              localStorage.setItem("facturaCreada", "1");
              var modal = new nueva_ventana();
              modal.finalizar();
              window.location = "factura.html";
            }, 700);
          }, 1000);
        }
      } else {
        swal("Error", "Debe ingresar el medio de pago", "warning", {
          button: false
        });
      }
    };

    //Verifica solo numeros
    $scope.expNumber = function(numero) {
      if (!/^([0-9])*$/.test(numero)) {
        return false;
      } else {
        return true;
      }
    };
    //Valida pago efectivo
    $scope.validateCash = function(cash) {
      if (cash == 0 || cash == undefined || cash == null || cash == "") {
        return "Debe ingresar el valor a pagar con efectivo";
      }
      return true;
    };
    //Valida pago tarjeta
    $scope.validateCard = function(card) {
      if (card == 0 || card == undefined || card == null || card == "") {
        return "Debe ingresar el valor a pagar con tarjeta";
      }      
      if ($scope.digits == undefined || $scope.digits.length < 4) {
        return "Debe ingresar los 4 digitos de la tarjeta";
      }
      if (
        $scope.typeCard == null ||
        $scope.typeCard == undefined ||
        $scope.typeCard == ""
      ) {
        return "Debe seleccionar una tarjeta";
      }
      if (
        $scope.approval == null ||
        $scope.approval == undefined ||
        $scope.approval == ""
      ) {
        return "Debe ingresar el código de aprobación";
      }
      if (card > $scope.missing) {
        return "El valor a pagar no puede ser mayor al valor faltante";
      }
      return true;
    };
    //Limpiar el menu efectivo
    $scope.clearMenuCash = function() {
      $scope.dsbWriteCash = true;
      $scope.valueCash = "";
    };
    //Limpiar el menu tarjeta
    $scope.clearMenuCard = function() {
      $scope.valueCard = "";
      $scope.typeCard = "";
      $scope.digits = "";
      $scope.approval = "";
    };

    //Valida si se pueden realizar mas pagos
    $scope.validateMorePay = function() {
      var missing = $scope.calculateMissing();
      if (missing == 0) {
        $scope.dsbWriteCard = true;
        $scope.dsbWriteCash = true;
        $scope.dsbSavePay = false;
        $scope.clearMenuCash();
        $scope.clearMenuCard();
      } else {
        if ($scope.totalCash == 0) {
          $scope.dsbWriteCash = false;
        }
        $scope.dsbWriteCard = false;
        $scope.dsbSavePay = true;
      }
    };

    //Valida solo números
    $scope.validateNumbers = function(value, opc) {
      var sw = $scope.expNumber(value);
      if (!sw) {
        swal("Error", "No se permiten letras", "warning", { button: false });
        switch (opc) {
          case 1:
            $scope.valueCash = "";
            break;
          case 2:
            $scope.valueCard = "";
            break;
          case 3:
            $scope.digits = "";
            break;
        }
      }
    };

    //Formato moneda a los inputs
    $scope.setMoney = function(valor, opc) {
      var result = $scope.formatMoney(valor);
      if (opc == 1) {
        $scope.valueCash = result;
      } else {
        $scope.valueCard = result;
      }
    };

    //Quitar formato de moneda a los inputs
    $scope.clearformatMoney = function(valor, opc) {
      var costo = valor.replace(/[^0-9.-]+/g, "").toString();
      if (costo === "0") {
        $scope.valueCash = "";
        $scope.valueCard = "";
      } else {
        if (opc == 1) {
          $scope.valueCash = costo.split(".")[0];
        } else {
          $scope.valueCard = costo.split(".")[0];
        }
      }
    };
    //Devuelve un numero en formato moneda
    $scope.formatMoney = function(n, c, d, t) {
      var c = isNaN((c = Math.abs(c))) ? 2 : c,
        d = d == undefined ? "." : d,
        t = t == undefined ? "," : t,
        s = n < 0 ? "-" : "",
        i = String(parseInt((n = Math.abs(Number(n) || 0).toFixed(c)))),
        j = (j = i.length) > 3 ? j % 3 : 0;
      return (
        s +
        (j ? i.substr(0, j) + t : "") +
        i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) +
        (c ? d.slice(2) : "")
      );
    };

    //Arma el item para la tabla
    $scope.tableItem = function(value, opc) {
      var dataFact = JSON.parse(localStorage.getItem("invoice")).invoice_number;
      var typePay = "";
      var medioSelect = "";
      var pos = 1;
      var modelData = {};
      if (opc == 1) {
        //item para efectivo
        typePay = "Efectivo";
        medioSelect = "E";
        pos = 1;
        if (value > $scope.missing) {
          value = $scope.missing;
        }
        value = $scope.formatMoney(value);
        if ($scope.dataPayment !== undefined) {
          pos = $scope.dataPayment.pay_info.length + 1;
        }
        modelData = {
          leftover: $scope.leftover,
          pay_info: [
            {
              numFact: dataFact,
              position: pos,
              type: typePay,
              idMedio: medioSelect,
              amount: value,
              authorization: "",
              digits: ""
            }
          ]
        };
        if ($scope.dataPayment === undefined) {
          $scope.dataPayment = modelData;
        } else {
          $scope.dataPayment.pay_info.push(modelData.pay_info[0]);
        }
      } else {
        //item para tarjeta
        typePay = $scope.typeCard.label.toString();
        medioSelect = $scope.typeCard.id.toString();
        pos = 1;
        var valueCard = $scope.valueCard;
        if ($scope.dataPayment !== undefined) {
          pos = $scope.dataPayment.pay_info.length + 1;
        }
        modelData = {
          leftover: $scope.leftover,
          pay_info: [
            {
              numFact: dataFact,
              position: pos,
              type: typePay,
              idMedio: medioSelect,
              amount: valueCard,
              authorization: $scope.approval,
              digits: $scope.digits
            }
          ]
        };
        if ($scope.dataPayment === undefined) {
          $scope.dataPayment = modelData;
        } else {
          $scope.dataPayment.pay_info.push(modelData.pay_info[0]);
        }
      }
    };

    //Remueve un item de la tabla
    $scope.removePay = function(item) {
      var index = $scope.dataPayment.pay_info.indexOf(item);
      $scope.dataPayment.pay_info.splice(index, 1);
      var rest = parseFloat(item.amount.replace(/[^0-9.-]+/g, ""));
      var total = 0;
      if (item.type === "Efectivo") {
        total = parseFloat($scope.totalCash.replace(/[^0-9.-]+/g, ""));
        $scope.totalCash = $scope.formatMoney(total - rest);
        $scope.leftover = 0;
        $scope.dsbWriteCash = false;
      } else {
        total = parseFloat($scope.totalCard.replace(/[^0-9.-]+/g, ""));
        $scope.totalCard = $scope.formatMoney(total - rest);
      }
      $scope.reposition();
      $scope.validateMorePay();
      $scope.dsbWriteCash = false;
    };

    //Establece la posición en la tabla
    $scope.reposition = function() {
      var size = $scope.dataPayment.pay_info.length;
      for (var i = 0; i < size; i++) {
        $scope.dataPayment.pay_info[i].position = i + 1;
      }
    };

    //Items tarjetas
    $scope.mediosPagosTarjetas = [
      {
        id: "3",
        label: "OCCIVELEZ VISA"
      },
      {
        id: "D",
        label: "BONO BIG PASS"
      },
      {
        id: "H",
        label: "PAGO SODEXO"
      },
      {
        id: "B",
        label: "AMERICAN EXPRESS"
      },
      {
        id: "L",
        label: "DINERS"
      },
      {
        id: "N",
        label: "FALABELLA"
      },
      {
        id: "O",
        label: "MASTERCARD CREDITO"
      },
      {
        id: "P",
        label: "MASTERCARD DEBITO"
      },
      {
        id: "R",
        label: "VISA CREDITO"
      },
      {
        id: "S",
        label: "VISA DEBITO"
      },
      {
        id: "U",
        label: "V.ELECTRON"
      },
      {
        id: "V",
        label: "TARJETA EXITO TUYA"
      },
      {
        id: "X",
        label: "CODENSA"
      }
    ];
    //Regresa al menu principal
    $scope.back = function() {
      window.location = "factura.html";
    };
    //Fecha actual del sistema
    $scope.currentDate = function() {
      var dt = new Date();
      var month = (dt.getMonth() + 1).toString();
      var day = dt.getDate().toString();
      var year = dt.getFullYear().toString();

      if (month < 10) {
        month = "0" + month;
      }
      if (day < 10) {
        day = "0" + day;
      }

      return year + "" + month + "" + day;
    };
    //Obtener la hora
    $scope.getHour = function() {
      var d = new Date();
      var hour = d.getHours().toString();
      var minute = d.getMinutes().toString();
      var second = d.getSeconds().toString();
      if (hour < 10) {
        hour = "0" + hour;
      }
      if (minute < 10) {
        minute = "0" + minute;
      }
      if (second < 10) {
        second = "0" + second;
      }
      return hour + "" + minute + "" + second;
    };

    //Establecer estado "OK" o ""
    $scope.actualizar = function(tabla1, tabla2, tabla3) {
      //Inicializar clase DataBase
      db = new fnDataBase();
      //Inicializar Query de consultas
      var querySQL = new consultas();
      //Leer archivo de configuracion
      querySQL.archivoConfigNumFact("confNumFacturas.json");
      var archivoConfigTienda;
      if (
        localStorage.getItem("confNumFacturas") !== "undefined" &&
        localStorage.getItem("confNumFacturas") !== null
      ) {
        archivoConfigTienda = JSON.parse(
          localStorage.getItem("confNumFacturas")
        );
        var max_factura = archivoConfigTienda.NumActual;
        var estatus = archivoConfigTienda.estatus;
        if (
          estatus !== "" &&
          estatus !== null &&
          estatus !== undefined &&
          estatus !== "undefined"
        ) {
          querySQL.fnUpdateEstatus(tabla1, estatus, max_factura, function(
            tabla
          ) {
            console.info("Se actualiza el estatus de la tabla: " + tabla);
          });
          //Actualiza estatus tabla detalle factura
          querySQL.fnUpdateEstatus(tabla2, estatus, max_factura, function(
            tabla
          ) {
            console.info("Se actualiza el estatus de la tabla: " + tabla);
          });
          //Actualiza estatus tabla medio pago
          querySQL.fnUpdateEstatus(tabla3, estatus, max_factura, function(
            tabla
          ) {
            console.info("Se actualiza el estatus de la tabla: " + tabla);
          });
        }
      }
    };

    //GUARDAR EN BASE DE DATOS
    $scope.insertarCabFact = function(datosFacturas) {
      //Inicializar clase DataBase
      db = new fnDataBase();
      //Inicializar Query de consultas
      var querySQL = new consultas();

      var numFact = datosFacturas.invoice_number;
      var cedulaCliente = datosFacturas.client_info.idclient;
      var nombreCliente = datosFacturas.client_info.nameclient;
      var apeCliente = datosFacturas.client_info.lastnameclient;
      var email = datosFacturas.client_info.email;
      var telefono = datosFacturas.client_info.tel;
      var cedulaVendedor = datosFacturas.seller_info.idseller;
      var fecha = $scope.currentDate();
      var hora = $scope.getHour();
      var valorNeto = datosFacturas.subTotal;
      var totalDesc = datosFacturas.discountTotal;
      var impuesto = datosFacturas.taxTotal;
      var total = datosFacturas.amountTotal;
      var factOfflineRead = localStorage.getItem("FactOffline");
      var centro = JSON.parse(factOfflineRead).CodigoTienda;
      var estatus = "";
      //INSERTA CABECERA FACTURA: PRIIMERA FACTURA A MANERA DE EJEMPLO
      querySQL.fnInsertaCabFactura(
        numFact,
        cedulaCliente,
        nombreCliente,
        apeCliente,
        email,
        telefono,
        cedulaVendedor,
        fecha,
        hora,
        valorNeto,
        totalDesc,
        impuesto,
        total,
        centro,
        estatus,
        function() {
          console.info("CAB FACT: datos insertado");
        }
      );
    };
    $scope.insertarDetFact = function(datosFacturas) {
      //Inicializar clase DataBase
      db = new fnDataBase();
      //Inicializar Query de consultas
      var querySQL = new consultas();

      var size = datosFacturas.items.length;
      var items = datosFacturas.items;
      var numFact = datosFacturas.invoice_number;
      querySQL.fnInsertaDetFacturaMasive(items, size, numFact, function() {
        console.log("datos detalle factura ingresados correctamente");
      });
    };
    $scope.insertarMedioPago = function(size, mediosPagos) {
      //Inicializar clase DataBase
      db = new fnDataBase();
      //Inicializar Query de consultas
      var querySQL = new consultas();
      for (let index = 0; index < size; index++) {
        querySQL.fnInsertaMedioPago(
          mediosPagos[index].numFact,
          mediosPagos[index].position.toString(),
          mediosPagos[index].idMedio,
          mediosPagos[index].amount.toString(),
          mediosPagos[index].authorization,
          mediosPagos[index].digits,
          "",
          function() {
            console.info("MEDIO PAGO: datos insertado");
          }
        );
      }
    };

    //Guardo en L.E ultimaFactura
    $scope.ConsulultimaFact = function() {
      db = new fnDataBase();
      //Inicializar Query de consultas
      var querySQL = new consultas();

      querySQL.fnConsulUltimaFactura(function(datosFacturas) {
        var ultimaFactura = datosFacturas.rows[0].factura;
        localStorage.setItem("ultimaFactura", ultimaFactura);
        console.info("Obteniendo la ultima factura: " + ultimaFactura);
      });
    };
    //Crar archivo confNumFacturas
    $scope.generarFileUltimaFactura = function(numFact) {
      db = new fnDataBase();
      //Inicializar Query de consultas
      var querySQL = new consultas();
      //Creamos el archivo donde se encuentra el ultimo numero de la factura y el estatus
      querySQL.crearTienda(numFact, "confNumFacturas.json");
    };
    //Se generan los 3 archivos TXT
    $scope.ConsulFacturas = function(tabla1, tabla2, tabla3) {
      db = new fnDataBase();
      //Inicializar Query de consultas
      var querySQL = new consultas();

      querySQL.fnConsulFacturas(tabla1, function(tabla, datos) {
        var numFacturas = datos.rows.length;
        //GENERAR ARCHIVO CSB para Consulta Cabecera Facturas
        querySQL.fnGenerarCabCSV("cabeceraFactura.txt", datos.rows);
        console.info(
          "Se consulta todas las facturas tabla: " +
            tabla +
            ", numero facturas consultadas: " +
            numFacturas
        );
      });

      //CONSULTA EL DETALLE DE LA FACTURA
      querySQL.fnConsulFacturas(tabla2, function(tabla, datos) {
        var numFacturas = datos.rows.length;
        //GENERAR ARCHIVO CSB para Consulta Detalle Facturas
        querySQL.fnGenerarDetCSV("detalleFactura.txt", datos.rows);
        console.info(
          "Se consulta todas las facturas tabla: " +
            tabla +
            ", numero facturas consultadas: " +
            numFacturas
        );
      });

      //CONSULTA TODAS LAS POSICIONES DE MEDIO DE PAGO
      querySQL.fnConsulFacturas(tabla3, function(tabla, datos) {
        var numFacturas = datos.rows.length;
        querySQL.fnGenerarMedioPagoCSV("medioPago.txt", datos.rows);
        console.info(
          "Se consulta todas las facturas tabla: " +
            tabla +
            ", numero facturas consultadas: " +
            numFacturas
        );
      });

      $scope.leerarchivos = function() {
        db = new fnDataBase();
        //Inicializar Query de consultas
        var querySQL = new consultas();

        querySQL.archivoConfigTienda("confNumFacturas.json");
        //Se espera un tiempo hasta que la lectura se realiza con exito
        setTimeout(() => {
          var data = localStorage.getItem("confNumFacturas"); // se busca el json en memoria
          //se convierte el valor en JSON
          var dataJSON = JSON.parse(data);
          //alert(data);
        }, 2000);
      };
    };

  }
]);