"use strict";

const fs = require('fs');

const Signs = require('../config/sings');
const KeyWords = require('../config/keywords');
const expReg = require('../tools/expReg');
const colors = require('@colors/colors');

module.exports = class LexicalAnalyzer {

    constructor(){
        this.srcCode = "";
        this.lines = [];
        this.name = this.constructor.name;
        this.planeText = "";
        this.tokens = [];
        this.error = false;
    }

    clear(){
        this.srcCode = "";
        this.lines = [];
        this.name = this.constructor.name;
        this.planeText = "";
        this.error = false;
    }

    setTokens(){
        this.tokens = [];
    }

    setTextPlane(text){
        this.planeText = text;
    }
    
    /**
     * @description Esta funcion obtiene el codigo fuente del archivo que se le envia en el parametro que inicializa la funcion.
     * @param {String} srcCode El nombre del archivo que contiene el codigo fuente. 
     */
    importCode(srcCode){
        this.srcCode = srcCode;
        console.log(srcCode);
        try{
            this.planeText = this.srcCode/*fs.readFileSync(`${__dirname}/../../${this.fileName}`, 'utf-8');*/

        } catch (err){
            this.error = true;
            console.log(colors.red('✘') + ' Lexical Scanner');
            console.log(colors.red("No se ha podido encontrar el archivo " + this.srcCode + " dentro de la carpeta raiz del proyecto."));
        }

    }

    /**
     * @description Esta funcion se encarga de preparar el documento para ser leido, y reconocer de esta manera las expresiones regulares, compatibles.
     * Las cuales se estan definiendo en el archivo de expReg.js. Es decir se borran las lineas en blanco y los comentarios.
     */
    readLines(){
        //borramos las lineas vacias
        this.planeText.match(expReg.line).filter( row => row.length > 0).forEach((line,index) =>{
            //filtramos las lineas que son comentario
            (expReg.comentario.test(line) || expReg.comentario2.test(line)) ? false : this.lines.push({ line: line, number: index+1 });
        });

    }


    analyzeLines(succes = () => {  }){
        this.lines.forEach(line => {
            let texto = line.line;
            while (texto.length) {

                texto = texto.replace(expReg.Espacio, '');
                const match = expReg.ones.exec(texto);

                try {

                    if (match === null){
                        //Aqui tendría que hacer manejo de errore para la tabla correspondiente de simbolos no reconocidos....
                        console.log(colors.red('✘')+' Lexical Scanner')
                        console.log(colors.red(`Lexical Error> token no valido o inesperado ${texto[0]} en la linea ${line.number}`));
    
                        this.tokens.push({
                            name: 'Error',
                            element: texto,
                            type: undefined,
                            line: line.number
                        });
                        texto = '';
                        this.clear();
                    } else {

                        const type = this.getType(match[0]);

                        if (!type){
                            //Aqui tendría que hacer manejo de errore para la tabla correspondiente de simbolos no reconocidos....
                            console.log(colors.red('✘') +' Lexical Scanner');
                            console.log(colors.red(`Lexical Error> token no valido o inesperado ${texto[0]} en la linea ${line.number}`));
                            this.clear();
                        } else {

                            if(type === 'CADENA'){
                                texto = texto.slice(match[0].length);
    
                                this.tokens.push({
                                    name: 'Token',
                                    element: '"',
                                    type: "COMILLA",
                                    line: line.number
                                });
    
                                this.tokens.push({
                                    name: 'Token',
                                    element: match[0].replace(/\"/g, ''),
                                    type: 'TEXTO',
                                    line: line.number
                                });

                                this.tokens.push({
                                    name: 'Token',
                                    element: '"',
                                    type: "COMILLA",
                                    line: line.number
                                });
    
                            } else {

                                texto = texto.slice(match[0].length);
                                this.tokens.push({
                                    name: 'Token',
                                    element: match[0],
                                    type: type,
                                    line: line.number
                                });

                            }

                        }

                        

                    }

                } catch (error) {
                    
                    texto = "";
                    this.error = true;
                    this.Error = error.message;
                    console.log(colors.red(error.message));
                    this.srcCode = '';
                    this.clear();
                }

                texto = texto.replace(expReg.Espacio,'');

            }
        });

        succes(this.tokens);
        //return this.tokens;
    }
    
    /**
     * @description devuelve el tipo de elemento que es
     * @param {String} element elemento a analizar 
     * @returns {String | Boolean} tipo del elemento
     */
    getType(element) {


        let type;

        // es un caracter
        type = Signs.find(e => e.char === element.toUpperCase());
        if( type !== undefined ) {
            return type.value;
        }

        // es una palabra reservada
        type = KeyWords.find(e => e === element.toUpperCase());
        if (type !== undefined) {
            return type;
        }

        // es un elemento
        type = Object.keys(expReg.caracter).find(e => {
            if (expReg.caracter[e].test(element)){
                return e;
            }
        });

        if(type !== undefined) {
            return type;
        }

        return false;

    }

};


