angular.module("print", []).controller("print", [
  "$scope",
  function($scope) {
    //Obtener datos almacenados
    var factOffline = JSON.parse(localStorage.getItem("FactOffline"));
    var invoice = JSON.parse(localStorage.getItem("copyInvoice"));
    invoice.invoice_number = localStorage.getItem("lastfact");
    var dataPayment = JSON.parse(localStorage.getItem("dataPayment"));
    var leftover = dataPayment.leftover;

    $scope.readInit = function() {
      localStorage.setItem("copyInvoice", null);//borro los datos de la factura
      var total2 = invoice.amountTotal;
      var add = {
        qty: $scope.cantProd(),
        code: "",
        cost: "",
        descUni: "",
        cosTot: total2
      };
      invoice.items.push(add);

      $scope.invoice = invoice;

      $scope.factOffline = factOffline;
      $scope.dataPayment = dataPayment;
      setTimeout(() => {
        window.print();
      }, 800);
    };

    $scope.print = function() {
      window.print();
    };

    //Logo almacen
    $scope.img = function() {
      var ruta = "";
      var canal = factOffline.canal.toUpperCase();
      switch (canal) {
        case "VELEZ":
          ruta = "./dist/img/velez.jpg";
          break;
        case "NAPPA":
          ruta = "./dist/img/nappa.jpg";
          break;
        case "TANNINO":
          ruta = "./dist/img/tannino.jpg";
          break;
        case "OUTLET":
          ruta = "./dist/img/outlet.jpg";
          break;
        case "BAZAR":
          ruta = "./dist/img/bazar.jpg";
          break;
        case "ACCESORIOS":
          ruta = "./dist/img/accesorios.jpg";
          break;
        default:
          ruta = "./dist/img/home.jpg";
          break;
      }
      return ruta;
    };
    //Fecha
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

      return (
        day +
        "." +
        month +
        "." +
        year +
        " - " +
        dt.getHours() +
        ":" +
        dt.getMinutes().toString() +
        ":" +
        dt.getSeconds().toString()
      );
    };

    //Nombre completo del cliente
    $scope.allName = function() {
      return (
        invoice.client_info.nameclient.toUpperCase() +
        " " +
        invoice.client_info.lastnameclient.toUpperCase()
      );
    };
    //Información< de la tienda
    $scope.shop = function() {
      return factOffline.nombreTienda + " -- " + factOffline.CodigoTienda;
    };

    //Remueve el signo %
    $scope.removePercZero = function(cad) {
      if (cad === "%" || cad === "0%" || cad == 0) {
        cad = "";
      }
      return cad;
    };
    //Cantidad de productos
    $scope.cantProd = function() {
      return invoice.items.length;
    };
    //Formato de números
    $scope.formatCoin = function(item) {
      if (item !== "") {
        item = parseInt(item);
        var result = formatMoney(item);
        return result;

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
      }
    };
    //Pasa números  texto
    $scope.numText = function(num) {
      return numeroALetras(num, {
        plural: "pesos colombianos"
      });
    };
    //Arma cabezera
    $scope.header = function(index) {
      var header = factOffline.textoFacturaCabecera.split(",");
      return header[index];
    };
    //Total recibido
    $scope.received = function() {
      return invoice.amountTotal + leftover;
    };
    //Cambio
    $scope.leftover = leftover;
   
  }
]);
