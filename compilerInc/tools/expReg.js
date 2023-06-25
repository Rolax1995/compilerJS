"use strict";
const expReg = {
    ones: /^(([\(\)\{\}\[\]\,])|(?:[a-zA-Z]\w*)|(?:\"(?:\w+|\s|[\.\+-\:\*])*\")|(?:\d+\.\d+)|(?:\d+)|(?:\[(?:\,|\s|\d+)*\])|(?:[\-\+\*\/\;]{1})|(?:[&]{2}|[|]{2}|[=]{3}|[<>=]{1}=|=[<>=]{1}|[<>=]{1}|![=]{2}|!=|[!]{1}|\W-[\s]))/,
    caracter : {
        ID:  /^[a-zA-Z]\w*/,
        CADENA:  /^(?:\"(?:\w+|\s|[\.\+-\:\*])*\")/,
        FLOAT: /^\d+\.\d{0,9}$/,
        NUMERO: /^\d+/,
        OPERADOR:  /^[+\-/*]/
    },
    Espacio: /^\s+/,
    line: /(.*)/g,
    comentario: /^\s*\#/ ,
    comentario2: /\/\//
};
module.exports = expReg;