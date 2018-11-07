/**
 *------------------------------------------------------------------------------------------------------
 * 																									   |
 *                          CREACION DE LA BASE DE DATOS -- NEW Solution Systems		               | 
 *      @author:                                       									               |
 *      	          Santiago Gonzalez Acevedo	santiagosk80@gmail.com								   |
 *      FECHA:        12 Septiembre 2018                                                               |
 *      @description: Se crea una base de datos, para guardar la informacion necesaria para el         |
 *      			  funcionamiento basico de la aplicacion      									   |
 *      @class:       El nombre de la clase principal es baseDatos                                     |
 *_____________________________________________________________________________________________________| */

//Clase principal de consultas
function consultas() {
    //Configuracion de la aplicacion
    var fileConfig = JSON.parse(config);
    //Datos de conexion y creacion
    var NombreDB = fileConfig[0].database;
    var VersionDB = fileConfig[0].version;
    var Descripcion = fileConfig[0].descripcion;
    var tamano = 5 * 1024 * 1024;

    this.basedatosConexion = function () {
        this.db = window.openDatabase(NombreDB, VersionDB, Descripcion, tamano);
    };

    /**
     * @function fnUltimaFactura
     * @param {*} callback 
     * @description Funcion que permite obtener el numero de la ultima factura
     */
    this.fnConsulUltimaFactura = function (callback) {

        this.basedatosConexion();
        this.db.transaction(fnConsultar, fnErrorDB, fnExitoDB);

        function fnConsultar(tx) {
            //Sentencia SQL para consultar el consecutivo maximo de factura
            var sql ="SELECT MAX(codFactura) as factura FROM tbl_cab_factura";
            //Setencia sql
            tx.executeSql(sql, [], fnExitoConsulta, fnErrorDB);

            function fnExitoConsulta(tx, results) {
                var eContador = results.rows.length;
                if (eContador > 0) {
                    //Callback con el resultado obtenido del select
                    callback(results);
                    console.info("Se obtiene el ultimo numero de factura correctamente");
                } else {
                    console.log("Ejecucion correcta: No se encontraron registros");
                }
            }
        }
        //Validacion y mensajes de error
        function fnErrorDB() {
            console.log("Error al consultar: tbl_cab_facturas");
        }

        function fnExitoDB() {
            console.log("Exito al consultar: tbl_cab_facturas");
        }
    };

    /**
     * @function fnConsulFacturas
     * @description consulta las talbas cabecera detalle y medios de pago
     * @param {*} tabla se pasa la tabla a la cual deseamos consultar
     * @param {*} callback 
     */
    this.fnConsulFacturas = function (tabla,callback) {

        this.basedatosConexion();
        this.db.transaction(fnConsultar, fnErrorDB, fnExitoDB);

        function fnConsultar(tx) {
            //Sentencia SQL para consultar el consecutivo maximo de factura
            var sql ="SELECT *  FROM "+tabla+" WHERE estatus = ''";
            //Setencia sql
            tx.executeSql(sql, [], fnExitoConsulta, fnErrorDB);

            function fnExitoConsulta(tx, results) {
                var eContador = results.rows.length;
                if (eContador > 0) {
                    //Callback con el resultado obtenido del select
                    callback(tabla,results);
                    console.info("Se consulta todas las facturas no sincronizadas");
                } else {
                    console.log("Ejecucion correcta: No se encontraron registros");
                }
            }
        }
        //Validacion y mensajes de error
        function fnErrorDB() {
            console.log("Error al consultar: tbl_cab_facturas");
        }

        function fnExitoDB() {
            console.log("Exito al consultar: tbl_cab_facturas");
        }
    };


    /**
     * @function fnInsertaCabFactura
     * @description Funcion para insertar datos de cabecera de factura
     * @param {*} codFactura 
     * @param {*} ccCliente 
     * @param {*} nameClient 
     * @param {*} lastnameClient 
     * @param {*} email 
     * @param {*} telefono 
     * @param {*} ccVendedor 
     * @param {*} fecha 
     * @param {*} hora 
     * @param {*} valorNeto 
     * @param {*} totalDesc 
     * @param {*} impuesto 
     * @param {*} total 
     * @param {*} estatus permite saber si la sincronizacion en el ERP fue correcta. Se debe leer el archivo de acciones.json
     * @param {*} callback 
     */
    this.fnInsertaCabFactura = function (codFactura, ccCliente, nameClient, lastnameclient, email, telefono, ccVendedor, fecha, hora, valorNeto, totalDesc, impuesto, total,centro, estatus, callback) {
        //se toma solo la parte entera por peticion del cliente
        valorNeto = parseInt(valorNeto);
        totalDesc = parseInt(totalDesc);
        impuesto = parseInt(impuesto);
        total = parseInt(total);

        this.basedatosConexion();
        this.db.transaction(fnConsultar, fnErrorDB, fnExitoDB);

        function fnConsultar(tx) {
            //SENTENCIA SQL para insertar nueva cabecera de factura
            var sql = "INSERT OR IGNORE INTO tbl_cab_factura(" 
                        +"codFactura, ccCliente, nameClient, apeClient, email, telefono, ccVendedor, " 
                        +"fecha, hora, valorNeto, totalDesc, impuesto, total, centro, estatus) "
                        +" VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);";
            //Ejecutar sentencia SQL
            tx.executeSql(sql,[codFactura, ccCliente, nameClient,lastnameclient, email, telefono, ccVendedor, fecha, hora, valorNeto, totalDesc, impuesto, total,centro, estatus], fnExitoConsulta, fnErrorDB);

            function fnExitoConsulta(tx, results) {
                callback();
            }
        }
        //Validacion y mensajes de error
        function fnErrorDB(e) {
            console.log("Error al consultar: tblProductos");
        }

        function fnExitoDB(e) {
            console.log("Exito al consultar: tblProductos");
        }
    };

    /**
     * @function fnInsertaDetFactura
     * @description Funcion para insertar el detalle de la factura
     * @param {*} codFactura 
     * @param {*} numPosicion 
     * @param {*} codBarras 
     * @param {*} precio 
     * @param {*} descuento 
     * @param {*} neto 
     * @param {*} puestoExp 
     * @param {*} callback 
     */
    this.fnInsertaDetFactura = function (codFactura, numPosicion, codBarras, precio, descuento, neto,  puestoExp, estatus) {
        //se toma solo la parte entera por peticion del cliente
        precio = parseInt(precio);
        descuento = parseInt(descuento);
        neto = parseInt(neto);


        this.basedatosConexion();
        this.db.transaction(fnConsultar, fnErrorDB, fnExitoDB);

        function fnConsultar(tx) {
            //SENTENCIA SQL para insertar nueva cabecera de factura
            var sql = "INSERT OR IGNORE INTO tbl_det_factura(" 
                        +"codFactura, numPosicion, codBarras, precio, descuento, neto,  puestoExp, estatus) "
                        +"VALUES(?,?,?,?,?,?,?,?);";
            //Ejecutar sentencia SQL
            tx.executeSql(sql,[codFactura, numPosicion, codBarras, precio, descuento, neto,  puestoExp, estatus], fnExitoConsulta, fnErrorDB);

            function fnExitoConsulta(tx, results) {
               
            }
        }
        //Validacion y mensajes de error
        function fnErrorDB(e) {
            console.log("Error al consultar: tblProductos");
        }

        function fnExitoDB(e) {
            console.log("Exito al consultar: tblProductos");
        }
    };


    this.fnInsertaDetFacturaMasive = function (items,size,numFact,callback) {

        this.basedatosConexion();
        this.db.transaction(fnConsultar, fnErrorDB, fnExitoDB);

        function fnConsultar(tx) {
            //SENTENCIA SQL para insertar nueva cabecera de factura
            var sql = "INSERT OR IGNORE INTO tbl_det_factura(" 
                        +"codFactura, numPosicion, codBarras, precio, descuento, neto,  puestoExp, estatus) "
                        +"VALUES(?,?,?,?,?,?,?,?);";
                        for (let index = 0; index < size; index++) {
                            var pos = index + 1;
                            var numPosicion = pos.toString();
                            var codBarras = items[index].code.toString();

                            //se toma solo la parte entera por peticion del cliente
                            var precio = items[index].cost.replace(/[^0-9.-]+/g, "").toString();
                            precio = parseInt(precio);
                            var neto = items[index].cosTot.toString();
                            neto = parseInt(neto);
                            var descuento = items[index].descUni.toString().split("%")[0];                            
                            

                            var puestoExp = "";
                            var estatus = "";
                            //Ejecutar sentencia SQL
                             tx.executeSql(sql,[numFact, numPosicion, codBarras, precio, descuento, neto,  puestoExp, estatus], fnExitoConsulta, fnErrorDB);  
                        }
            

            function fnExitoConsulta(tx, results) {
               callback();
            }
        }
        //Validacion y mensajes de error
        function fnErrorDB(e) {
            console.log("Error al consultar: tblProductos");
        }

        function fnExitoDB(e) {
            console.log("Exito al consultar: tblProductos");
        }
    };

    /**
     * @function fnInsertaMedioPago
     * @description Funcion para insertar datos del medio de pago
     * @param {*} codFactura 
     * @param {*} posPago 
     * @param {*} codigoPago 
     * @param {*} monto 
     * @param {*} autorizacion 
     * @param {*} digitos 
     * @param {*} estatus 
     * @param {*} callback 
     */
    this.fnInsertaMedioPago = function (codFactura,posPago, codigoPago, monto, autorizacion, digitos, estatus, callback) {

        this.basedatosConexion();
        this.db.transaction(fnConsultar, fnErrorDB, fnExitoDB);

        function fnConsultar(tx) {
            //SENTENCIA SQL para insertar nueva cabecera de factura
            var sql = "INSERT OR IGNORE INTO tbl_medio_pago(" 
                        +"codFactura, posPago, codigoPago, monto, autorizacion, digitos, estatus) "
                        +"VALUES(?,?,?,?,?,?,?);";
            //Ejecutar sentencia SQL
            tx.executeSql(sql,[codFactura, posPago, codigoPago, monto, autorizacion, digitos, estatus], fnExitoConsulta, fnErrorDB);

            function fnExitoConsulta(tx, results) {
                callback();
            }
        }
        //Validacion y mensajes de error
        function fnErrorDB(e) {
            console.log("Error al consultar: tblProductos");
        }

        function fnExitoDB(e) {
            console.log("Exito al consultar: tblProductos");
        }
    };

    /**
     * @function fnUpdateEstatus
     * @description Funcion para actualizar el estatus para todas las tablas
     * @param {*} tabla se actualiza el estatus para todas las tablas
     * @param {*} estatus 
     * @param {*} max_factura 
     * @param {*} callback 
     */
    this.fnUpdateEstatus = function (tabla,estatus,max_factura, callback) {

        this.basedatosConexion();
        this.db.transaction(fnConsultar, fnErrorDB, fnExitoDB);

        function fnConsultar(tx) {
            //SENTENCIA SQL para acutalizar el estatus dependiendo del maximo numero factura. Osea desde ese numero a tras
            var sql = "UPDATE "+tabla+" SET estatus = '"+estatus+"' WHERE codFactura <= '"+max_factura+"';";
            //Ejecutar sentencia SQL
            tx.executeSql(sql,[], fnExitoConsulta, fnErrorDB);

            function fnExitoConsulta(tx, results) {
                callback(tabla);
            }
        }
        //Validacion y mensajes de error
        function fnErrorDB(e) {
            console.log("Error al consultar: tblProductos");
        }

        function fnExitoDB(e) {
            console.log("Exito al consultar: tblProductos");
        }
    };

    /**
     * @function fnGenerarDetCSV
     * @description Funcion que permite generar los archivos CSV para cualquier tabla
     * @param {*} data Parametro de entrada con los datos de la consulta a la base de datos SQLITE
     */
    this.fnGenerarDetCSV = function(fileName,data){
        var stringCSV = "";
        var ruta = fileConfig[0].rutaArchivos + fileName;
        for (var index = 0; index < data.length; index++) {
            stringCSV += data[index].codFactura+","
                    +data[index].numPosicion+","
                    +data[index].codBarras+","
                    +data[index].precio+","
                    +data[index].descuento+","
                    +data[index].neto+","
                    +data[index].puestoExp+";";
        }
        /*Crear archivo CSV*/
        saveChanges(ruta,stringCSV);
    };

    /**
     * @function fnGenerarCabCSV
     * @description Funcion que permite generar los archivos CSV para cualquier tabla
     * @param {*} data Parametro de entrada con los datos de la consulta a la base de datos SQLITE
     */
    this.fnGenerarCabCSV = function(fileName,data){
        var stringCSV = "";
        var ruta = fileConfig[0].rutaArchivos + fileName;        
        for (var index = 0; index < data.length; index++) {
            stringCSV += data[index].codFactura+","
            +data[index].ccCliente+","
            +data[index].nameClient+","
            +data[index].apeClient+","
            +data[index].email+","
            +data[index].telefono+","
            +data[index].ccVendedor+","
            +data[index].fecha+","
            +data[index].hora+","
            +data[index].valorNeto+","
            +data[index].totalDesc+","
            +data[index].impuesto+","
            +data[index].total+","
            +data[index].centro+";";
        }
        /*Crear archivo CSV*/
        saveChanges(ruta,stringCSV);
    };

    /**
     * @function fnGenerarMedioPagoCSV
     * @description Funcion que permite generar los archivos CSV para medios de pago
     * @param {*} data Parametro de entrada con los datos de la consulta a la base de datos SQLITE
     */
    this.fnGenerarMedioPagoCSV = function(fileName,data){
        var stringCSV = "";
        var ruta = fileConfig[0].rutaArchivos + fileName;
        for (var index = 0; index < data.length; index++) {
            stringCSV += data[index].codFactura+","
                    +data[index].posPago+","
                    +data[index].codigoPago+","
                    +data[index].monto.replace(",","")+","
                    +data[index].autorizacion+","
                    +data[index].digitos+";";
        }
        /*Crear archivo CSV*/
        saveChanges(ruta,stringCSV);
    };

    /**
     * @function archivoConfigTienda
     * @description Se lee los archivos de configuracion desde el computador de la tienda
     * @param {*} fileName 
     */
    this.archivoConfigTienda = function(fileName){
        var ruta = fileConfig[0].rutaArchivos + fileName;
        readFile(ruta,function(datos){
            if(datos == "error"){
                location.href="error.html";
                console.info(
                   "Creando archivo confNumFacturas.json"
                  );
            }
            //Guardamos en memoria la configuracion del JSON
            localStorage.setItem(fileName.split(".")[0],datos);
         });
    };

    /**
     * @function archivoConfigTienda
     * @description Se lee los archivos de configuracion desde el computador de la tienda
     * @param {*} fileName 
     */
    this.archivoConfigNumFact = function(fileName){
        var ruta = fileConfig[0].rutaArchivos + fileName;
        readFile(ruta,function(datos){
            if(datos == "error"){
                console.info(
                   "Creando archivo confNumFacturas.json"
                  );
                this.crearTienda("","confNumFacturas.json");
            }
            //Guardamos en memoria la configuracion del JSON
            localStorage.setItem(fileName.split(".")[0],datos);
         });
    };

    this.crearTienda = function(max_fact,fileName){
        var filepath = fileConfig[0].rutaArchivos + fileName;
        var content= '{"NumActual": "'+max_fact+'","estatus":""}';
        saveChanges(filepath,content);   
    };
}