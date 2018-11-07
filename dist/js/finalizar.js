angular
  .module("finalizar", [])
  //llamada al controlador
  .controller("finalizar", [
    "$scope",
    function($scope) {
      $scope.init = function() {
        var invoice = localStorage.getItem("invoice");
        localStorage.setItem("copyInvoice", invoice);//creo una copia de los datos del menu principal
      };
      $scope.factura = function() {
        return localStorage.getItem("imprimirFact");
      };

      $scope.imprimir = function() {
        var modal = new nueva_ventana();
        modal.printPage();
        window.close();
      };
    }
  ]);
