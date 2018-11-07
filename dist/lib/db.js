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

//Clase principal
function fnDataBase(){
	//Configuracion de la aplicacion
	var fileConfig = JSON.parse(config);
	//Datos de conexion y creacion
	var NombreDB   = fileConfig[0].database;
	var VersionDB  = fileConfig[0].version;
	var Descripcion= fileConfig[0].descripcion;
	var tamano     =5*1024*1024;
	
	this.basedatosConexion=function(){
		this.db = window.openDatabase(NombreDB,VersionDB,Descripcion,tamano);
	};
	
	//Metodo que me permite la creacion he inserccion de datos necesarios para la conexion a los servicios Web
	this.fnCrearDB = function(){
		
		this.basedatosConexion();
		this.db.transaction(crear, errorDB,exitoDB);
		function crear(tx){
            //Tabla Cabecera de factura
            tx.executeSql("CREATE TABLE IF NOT EXISTS tbl_cab_factura("
                +"codFactura 	INTEGER PRIMARY KEY," //Código de la factura
                +"ccCliente	    char(100),"           //Cedula del cliente
                +"nameClient	char(100),"           //Nombre del cliente
                +"apeClient     char(100)," 		  //Apellido del cliente
                +"email	        char(100),"           //Correo
                +"telefono  	char(100),"           //Telefono
                +"ccVendedor 	char(200),"			  //Cedula del vendedor
                +"fecha    	    char(100),"           //Fecha
                +"hora       	char(100),"           //Hora
                +"valorNeto     char(100),"           //Valor neto
                +"totalDesc     char(100),"           //Total Descuento
                +"impuesto      char(100),"           //Impuesto
                +"total       	char(100),"           //Hora
                +"centro        char(100),"           //centro
                +"estatus       char(100)"            //Estado de sincronizacion
                +"," + "UNIQUE(codFactura));");
            
                //Tabla Detalle de factura
            tx.executeSql("CREATE TABLE IF NOT EXISTS tbl_det_factura("
                +"codFactura 	INTEGER,"             //Código de la factura
                +"numPosicion   char(100),"           //Numero posicion
                +"codBarras     char(100),"           //Código barras
                +"precio        char(100),"           //Precio
                +"descuento     char(100),"           //Descuento
                +"neto          char(100),"           //Neto
                +"puestoExp     char(100),"           //
                +"estatus       char(100));");        //Estado de sincronizacion

            //Tabla medios de pago
            tx.executeSql("CREATE TABLE IF NOT EXISTS tbl_medio_pago("
                +"codFactura 	INTEGER,"             //Código de la factura
                +"posPago       char(100),"           //Posicion pago
                +"codigoPago    char(100),"           //Escoger medio de pago: Tarjeta o efectivo
                +"monto         char(100),"           //Valor pagado con el medio de pago seleccionado
                +"autorizacion  char(100),"           //Numero de aprobacion o autorizacion
                +"digitos       char(100),"           //Numero de aprobacion o autorizacion
                +"estatus       char(100));");          //ultimos 4 Digitos tarjeta de credito
		}
		function errorDB(){
			 console.log("Error en la tabla tblProductos. Metodo: fnCrearDB");
		}
		function exitoDB(){
			console.log("Operacion correcta. Metodo: fnCrearDB");
		}
	};	
}