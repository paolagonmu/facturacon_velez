/** GULP TASK
 * @function GULP automatizar tareas para DevOps he integracion continua
 * @description Utilizamos en este caso GULP para automatizar tareas y crear la distribucion minificada
 *              del proyecto para su posterior publicacion.
 * @author Santiago Gonzalez Acevedo
 * @summary Se crear el 11 de Octubre del 2018 Email: santiagosk80@gmail.com
 * INSTRUCCION EJECUCION PARA REALIZAR TEST DE CODIGO
 * 1) gulp jshint
 * INSTRUCCIONES DE EJECUCION GENERAR PROYECTO PARA PRODUCCION:
 * 1) gulp compress
 * 2) gulp minifycss
 * 3) gulp deletefile
 * 4) gulp obfuscate
 */
var gulp = require('gulp'),
  gutil = require('gulp-util'),
  minify = require('gulp-minify'),
  deletefile = require('gulp-delete-file'),
  cleanCSS = require('gulp-clean-css'),
  javascriptObfuscator = require('gulp-javascript-obfuscator'),
  jshint = require('gulp-jshint');

// Define una tarear para escuchar
gulp.task('test', ['watch']);

//JSHIN: configuracion de la tarea para Testing al codigo JavaScript
gulp.task('jshint', function() {
  return gulp.src('./dist/**/*.js')
  .pipe(jshint())
  .pipe(jshint.reporter('jshint-stylish')) //Plugin (Dar estilo al reporte) que se instala de la siguiente forma:npm install --save-dev jshint-stylish
  //.pipe(jshint.failOnError());
  //.pipe(jshint.reporter('fail'));
});

//COPYHTML: Copiar los archivos HTML a la carpeta de produccion
gulp.task('copy', function () {
    gulp.src(['*.html','main.js','package.json'])
        .pipe(gulp.dest('produccion'));
});

//GULP-MINIFY: Tarea para comprimir los archivos de Javascript y prepararlos para produccion
gulp.task('compress', function() {
    gulp.src(['dist/**/*.js'])
      .pipe(minify({
        ext:{
            src:'.jsd',
            min:'.js'
        },
        ignoreFiles: ['*.min.js','*-min.js']
      }))
      .pipe(gulp.dest('produccion/dist'))
});

//MINIFY-CSS: Minificar los archivos CSS
gulp.task('minifycss', () => {
    return gulp.src('dist/**/*.css')
      .pipe(cleanCSS({compatibility: 'ie8'}))
      .pipe(gulp.dest('produccion/dist'));
});

//DELETEFILE: Elimina en este caso todos los archivos que no esten minifcados para distribucion
gulp.task('deletefile', function () {
    var regexp = /\w*(-min.css)$/;
    gulp.src(['produccion/dist/**/*.jsd'
    ]).pipe(deletefile({
        reg: regexp,
        deleteMatch: false
    }))
});

//OBFUSCATE: Ofuscar codigo JavaScript para evitar robo de codigo. Permite encriptarlo
gulp.task('obfuscate', () => {
    return gulp.src('produccion/dist/**/*.js')
    .pipe(javascriptObfuscator())
    .pipe(gulp.dest('produccion/dist'));
});


// Configurar tareas para cuando un archivo cambie
gulp.task('watch', function() {
    gulp.watch('dist/**/*.js', ['jshint']);
});