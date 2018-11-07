angular
    .module('appejemplo', [])
    .controller('app_controller', ['$scope', '$http', app_controller]);

//Controlador principal para la creacion de nuevos usuarios
function app_controller($scope, $http) {

    $scope.init = function () {

        //Inicializar clase DataBase
        db = new fnDataBase();
        //Inicializar Query de consultas
        var querySQL = new consultas();
        //Crear base de datos Sqlite
        db.fnCrearDB();

        //OJO Estos datos los obtenemos del formulario para cabecera
        var numFactura = ""; // Comun para DET y CAB
        var cedulaVendedor = "";
        var nombreCliente = "";
        var apeCliente = "";
        var cedulaCliente = "";
        var email = "";
        var telefono = "";
        var fecha = "";
        var hora = "";
        var valorNeto = "";
        var totalDesc = "";
        var impuesto = "";
        var total = "";
        var estatus=""; // Comun para DET y CAB vacio porque no ha sido sincronizado en el erp 
        

        //INSERTA CABECERA FACTURA: PRIIMERA FACTURA A MANERA DE EJEMPLO
        querySQL.fnInsertaCabFactura(numFactura, cedulaCliente, nombreCliente,apeCliente,
            email, telefono, cedulaVendedor, fecha, hora, valorNeto,
            totalDesc, impuesto, total, estatus,
            function () {
                console.info("CAB FACT: datos insertado");
                alert("CAB FACT: datos insertado");
            });
            
        //OJO Estos datos los obtenemos del formulario para detalle
        var numPosicion="";
        var codBarras="";
        var precio="";
        var descuento="";
        var neto="";
        var puestoExp="";

        //INSERTA DETALLE FACTURA
        querySQL.fnInsertaDetFactura(numFactura, numPosicion, codBarras, precio,
            descuento, neto, puestoExp, estatus,
            function () {
                console.info("DET FACT: datos insertado");
                alert("DET FACT: datos insertado");
        });

        //OJO estos datos los obtenemos del formulario medio de pago
        var posPago="";
        var codigoPago="";
        var monto="";
        var autorizacion=""; //Numero de aprobacion
        var digitos ="";
        //INSERTA MEDIO DE PAGO
        querySQL.fnInsertaMedioPago(numFactura,posPago, codigoPago, monto, autorizacion, digitos, estatus,
            function () {
                console.info("MEDIO PAGO: datos insertado");
                alert("MEDIO PAGO: datos insertado");
        });

        //CONSULTA FACTURA CON CONSECUTIVO MAS ALTO
        querySQL.fnConsulUltimaFactura(function (datos) {
            var ultimaFactura = datos.rows[0].factura;
            console.info("Obteniendo la ultima factura: " + ultimaFactura);
            alert("Ultima factura ingresada: " + ultimaFactura);
        });

        //CONSULTA TODAS LAS FACTURAS NO SINCRONIZADAS O CON ESTATUS VACIO
        var tabla1 ="tbl_cab_factura";
        var tabla2 ="tbl_det_factura";
        var tabla3 ="tbl_medio_pago";
        //CONSULTA LA CABECERA DE LA FACTURA
        querySQL.fnConsulFacturas(tabla1,function (tabla,datos) {
            var numFacturas = datos.rows.length;
            //GENERAR ARCHIVO CSB para Consulta Cabecera Facturas
            querySQL.fnGenerarCabCSV("cabeceraFactura.csv",datos.rows);
            console.info("Se consulta todas las facturas tabla: "+tabla+", numero facturas consultadas: " + numFacturas);
            alert("Se consulta todas las facturas tabla: "+tabla+", numero facturas consultadas: " + numFacturas);
        });
        //CONSULTA EL DETALLE DE LA FACTURA
        querySQL.fnConsulFacturas(tabla2,function (tabla,datos) {
            var numFacturas = datos.rows.length;
            //GENERAR ARCHIVO CSB para Consulta Detalle Facturas
            querySQL.fnGenerarDetCSV("detalleFactura.csv",datos.rows);
            console.info("Se consulta todas las facturas tabla: "+tabla+", numero facturas consultadas: " + numFacturas);
            alert("Se consulta todas las facturas tabla: "+tabla+", numero facturas consultadas: " + numFacturas);
        });
        //CONSULTA TODAS LAS POSICIONES DE MEDIO DE PAGO
        querySQL.fnConsulFacturas(tabla3,function (tabla,datos) {
            var numFacturas = datos.rows.length;
            querySQL.fnGenerarMedioPagoCSV("medioPago.csv",datos.rows);
            console.info("Se consulta todas las facturas tabla: "+tabla+", numero facturas consultadas: " + numFacturas);
            alert("Se consulta todas las facturas tabla: "+tabla+", numero facturas consultadas: " + numFacturas);
        });

        //Actualizar estatus para cada tabla
        estatus="ok";
        var max_factura="2003";
        //Actualiza estatus tabla cabecera factura
        querySQL.fnUpdateEstatus(tabla1,estatus,max_factura, function(tabla){
            console.info("Se actualiza el estatus de la tabla: "+ tabla);
            alert("Se actualiza el estatus de la tabla: "+ tabla);
        });
        //Actualiza estatus tabla detalle factura
        querySQL.fnUpdateEstatus(tabla2,estatus,max_factura, function(tabla){
            console.info("Se actualiza el estatus de la tabla: "+ tabla);
            alert("Se actualiza el estatus de la tabla: "+ tabla);
        });
        //Actualiza estatus tabla medio pago
        querySQL.fnUpdateEstatus(tabla3,estatus,max_factura, function(tabla){
            console.info("Se actualiza el estatus de la tabla: "+ tabla);
            alert("Se actualiza el estatus de la tabla: "+ tabla);
        });

        //Se invoca la funcion para obtener los datos de configuracion numero factura
        querySQL.archivoConfigTienda("confNumFacturas.json");
        //Se espera un tiempo hasta que la lectura se realiza con exito
        setTimeout(() => {
            var data = localStorage.getItem("confNumFacturas"); // se busca el json en memoria            
            //se convierte el valor en JSON
            var dataJSON = JSON.parse(data);
            alert(data);
        }, 2000);

    };

    $scope.grabar = function () {
        var email = $scope.validarEmail($scope.email);
        var cedulaVendedor = $scope.validarCedulaVendedor($scope.cedulaVendedor);
        if (email === false) {
            alert("correo malo");
        } else if (cedulaVendedor === false || $scope.cedulaVendedor === "" || $scope.cedulaVendedor === undefined) {
            alert("La cedula ingresada es incorrecta");
        }

    };

    $scope.validarEmail = function (email) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    };
    $scope.validarCedulaVendedor = function (cedulaVendedor) {
        if (cedulaVendedor !== null && cedulaVendedor !== undefined && cedulaVendedor !== "") {
            return $scope.expNumber(cedulaVendedor);
        }
    };
    $scope.expNumber = function (numero) {
        var mensaje = "";
        if (!/^([0-9])*$/.test(numero)) {
            return false;
        } else {
            return true;
        }
    };

}