/**
 *------------------------------------------------------------------------------------------------------
 * 																									   |
 *                          FUNCIONES PARA LEER ARCHIVOS -- NEW Solution Systems		               | 
 *      @author:                                       									               |
 *      	          Santiago Gonzalez Acevedo	santiagosk80@gmail.com								   |
 *      FECHA:        12 Septiembre 2018                                                               |
 *      @description: Funciones para leer rutas y archivos alojados en el computador de la tienda      |
 *_____________________________________________________________________________________________________| */

//Librerias o dependencias 
var remote = require('electron').remote;
var dialog = require('electron').remote.dialog;
var fs = require('fs');

/**
 * @function readFile
 * @description Funcion que permite leer el archivo desde la ruta especificada
 * @param {*} filepath 
 */
function readFile(filepath,callback) {
    fs.readFile(filepath, 'utf-8', function (err, data) {
        if(err){       
            callback("error");
        }
        callback(data);
    });
}

/**
 * @function deleteFile
 * @description Funcion que permite eliminar un archivo de una ruta especifica
 * @param {*} filepath 
 */
function deleteFile(filepath){
    fs.exists(filepath, function(exists) {
        if(exists) {
            // File exists deletings
            fs.unlink(filepath,function(err){
                if(err){     
                    console.log(err);
                    return;
                }
            });
        } else {
        }
    });
}

/**
 * @function saveChanges
 * @description Funcion que permite guardar los cambios del archivo en una ruta especifica
 * @param {*} filepath 
 */
function saveChanges(filepath,content){
    fs.writeFile(filepath, content, function (err) {
        if(err){
            console.log(err);
            return;
        }
    }); 
}