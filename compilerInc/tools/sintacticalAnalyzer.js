"use strict";

const productions = require('../config/productions');
const chars = require('../config/sings');
const colors = require('@colors/colors');
const fs = require('fs');

let ultimoToken = '';
let modeDebug = false;


function show(text, force = false){
    (force || modeDebug) ? console.log(text): null;
}


Object.prototype.first = function (){
    return this.produce[0];
};

Object.prototype.existInProduce = function (element) {
    let position_first_word = 99;
    let creat_words_before = false;
    return this.produce.some((e, index)=>{
        if (e[0] !== '<' && e !== 'EPSILON'){
            position_first_word = index;
            creat_words_before = true;
        }
        if (e === element && position_first_word > index) {
            return true;
        }
    });
};

Object.prototype.showTree = function(init = '', spaces = '', force = false) {
    show(init +  colors.cyan(this.node),force);
    if(this.childs.length) {

        this.childs.forEach((element, index) =>{

            if(typeof element === 'string') {

                if(element !== 'EPSILON'){

                    if(/^[<]/.test(element)) {

                        if (this.childs.length - 1 === index) {
                            show(spaces + '└──' + colors.blue(element), force);
                        } else {
                            show(spaces + '├──' + colors.blue(element), force);
                        }

                    } else {

                        if(this.childs.length -1 === index) {
                            show(spaces + '└──' + colors.white(element), force);
                        } else {
                            show(spaces + '├──' + colors.white(element), force);
                        }
                    }
                } else {

                    if(this.childs.length - 1 === index) {
                        show(spaces + '└──' + colors.gray(element), force);
                    } else {
                        show(spaces + '├──' + colors.gray(element), force);
                    }
                }
            }

            switch(element.name){
                case 'Token' :
                    if (this.childs.length - 1 === index){
                        show(spaces + '└──' + colors.yellow(element.type) + `'${element.element}'`, force);
                    }else{
                        show(spaces + '├──' + colors.yellow(element.type) + `'${element.element}'`, force);
                    }
                    break;
                case 'Arbol':
                    if (this.childs.length -1 === index){
                        element.showTree(spaces + '└──', spaces+'   ', force);
                    }else{
                        element.showTree(spaces + '├──', spaces+ '│  ', force);
                    }
                    break;

                case 'Produccion':
                    if (this.childs.length - 1 === index){
                        show(spaces + '└──' + colors.green(element.produccion) + '[' + element.produce +']', force);
                    }else{
                        show(spaces + '├──' + colors.green(element.produccion) + '[' + element.produce + ']', force);                    
                    }
                    break;
                
                default :
                    break;
            }
        });
    }
};

Object.prototype.hasSpace = function () {
    const isFull = this.childs.some(e => {
        if(typeof e === 'string' && e !== 'EPSILON') {
            return true;
        } else {
            switch (e.name){
                case 'Token': 
                    return false;
                case 'Produccion':
                    return true;
                case 'Arbol':
                    return e.hasSpace();
                default:
                    break;
            }
        }
    });
    return isFull;
};

Object.prototype.next = function() {
    let element;
    this.childs.forEach(e => {
        if(element !== undefined) { return;}

        if(typeof e === 'string') {
            if(e !== 'EPSILON') { element = e;}
        } else {
            switch(e.name){
                case 'Arbol':
                    if(e.hasSpace()){
                        const newE = e.next();
                        if(newE) {element = newE}
                    }
                    break;
                case 'Produccion':
                    element = e;
                    break;
            }
        }
    });
    return element; 
};

Object.prototype.setChild = function(newChild){
    let isFollow = true;
    this.childs.forEach((e, index)=>{
        if(typeof e === 'string' && isFollow){
            if (e !== 'EPSILON'){
                isFollow = false;
                this.childs[index] = newChild;
            }
        } else {
            if(e.name === 'Arbol' && isFollow){
                if(e.hasSpace()){
                    e.setChild(newChild);
                    isFollow = false;
                }
            } else if (e.name === 'Produccion'){
                isFollow = false;
                this.childs[index] = newChild;
            }
        }
    });
}

Object.prototype.positionInProduce = function(element){
    const position = this.produce.findIndex(e => e === element);
    return position;
}

module.exports = class SintacticalAnalyzer {

    constructor(params) {
        const { debug = false } = params;
        modeDebug = debug;
        this.name = this.constructor.name;
        this.tokens = [];
        this.error = false;

        //Lista de arboles a procesar.
        this.productions = [];

        //Lista de Arboles procesados.
        this.stackProductionReady = [];
    }

    clear(){
        this.tokens = [];
        this.error = false;
        this.productions = [];
        this.stackProductionReady = [];
        this.stackProductionFull = [];
    }

    /**
     * Esta funcion se utilizará mas adelante para poder leer los elementos del arbol.
     */
    initTree(){
        const element = this.tokens.shift();

        
        const productionsList = this.getProduction(element);
        
        this.productions = productionsList.map(e => {
            e.produce[0] = element;
            return ({ node: e.produccion, childs: e.produce, name: 'Arbol' });
        });

    }

    getProduction(element){

        try{

            switch(element.name){
                case 'Token' :
                    const tmp_productions = JSON.parse((JSON.stringify(productions)));
                    const prod = tmp_productions.filter(e => element.type === e.first());

                    if(prod.length){
                        return prod;
                    }else{
                        console.log(colors.red(`ERROR: doesn't exist element to produce '${element.element}' on line ${element.line}`));

                    }
                    break;
                
                default:
                    const tmp_default_prod = JSON.parse((JSON.stringify(productions)));
                    const prod2 = tmp_default_prod.filter(e => { 
                         if(e.existInProduce(element)){
                            show(`Posicion del index : ${e.produce.indexOf(element)}`);
                            return true;
                         }
                    });

                    if(prod2.length){
                        return prod2;
                    }else{
                        return;
                    }
                    break;
            }

        }catch(error){

            if(!this.error){
                console.log(colors.red('✘') + "Sintactical Scanner");
                show(error, true);
            }
            this.error = true;
    
        }

    }

    start(tokens, fun){
        //console.log(tokens.tokens);
        this.tokens = tokens.tokens;
        this.initTree();

        while(this.tokens.length) {

            show("************ Production ************");
            this.productions.forEach(e => {
                e.showTree();
                show('...................................');
            });
            let nextToken = this.tokens.shift();
            show(colors.bgBlue(`Proximo token : ${nextToken.type} '${nextToken.element}'`));
            if(this.productions != 0){
                ultimoToken = nextToken
            }
            while(this.productions.length) {
                show(colors.bgCyan('Analizando producciones....'));
                this.productions.forEach(e => {
                    e.showTree();
                    show('.................................');
                });
                this.checkProductions(nextToken);
            }
            this.productions = this.stackProductionReady;
            this.stackProductionReady = [];
        }

        this.productions.forEach(e => {
            e.showTree();
        });

        show('***************************Verificamos que sean generados por el nodo raíz*************************');
        this.stackProductionRooted = [];
        this.stackProductionRouted = [];
        while(this.productions.length){

            this.productions.forEach((e)=>{
                this.rootProduction(e);
            });

            this.productions = this.stackProductionRouted;
            this.stackProductionRouted = [];

        }

        this.productions = this.stackProductionRooted;
        show('************Rooteados*****************');
        this.productions.forEach((e)=>{
            e.showTree();
        });


        show('****************************Verificamos que el arbol este completo*************************************');
        this.stackProductionFull = [];
        this.stackProductionNotFull = [];
        this.stackProductionReady = [];

        while(this.productions.length){

            this.productions.forEach((e)=>{
                this.completeProduction(e);
            });

            this.productions = this.stackProductionNotFull;
            this.stackProductionNotFull = [];
        }

        try{
            if(this.stackProductionReady.length > 0){
                this.stackProductionReady = this.stackProductionReady[0];
            } else {
                throw new Error(`SyntaxError: token inesperado '${ultimoToken.element}' en linea ${ultimoToken.line}`);
            }
            //this.stackProductionReady.showTree('', '', true);
            console.log(colors.green('✔')+' Sintactical Scann');
            fun(this.stackProductionReady);
        } catch (error){
            console.log("Dentro del catch si se puede...");
            if(!this.error){
                console.log(colors.red('✘')+' Sintactical Scann');
                show(colors.red(error.message), true);
                //fun(error.message, true);
            }
            fun(error.message, true);
            this.error = true;
        }
    }

    getProduce(production){
        const _productions = JSON.parse((JSON.stringify(productions)));
        const def_productions = _productions.filter(e => production === e.produccion);
        return def_productions;
    }

    checkElement(element, production){
        const child = production.next();

        if(/^[<]/.test(child)) {
            // Es una produccion...
            show(`Elemento a analizar: ${child} (Es un string-produccion)`);
            const produce = this.getProduce(child);
            return produce;
        } else if (typeof child === 'string'){
            // Es una palabra....
            if (child === element.type){
                show(`Elemento a analizar: ${child} (Es un String-token)`);
                return element;
            } else {
                show(`Elemento a analizar: ${child} (Es un String y no coinciden)`);
                show(colors.red('Descartar Arbol'));
                return;
            }
        } else if(child.name === 'Produccion'){
            show(`Elemento a analizar: ${child.produccion} (Es una produccion)`);
            return ({ node: child.produccion, childs: child.produce, name: 'Arbol' });
        }
    }


    checkProductions(token) {

        const _this = this;
        let newProductions = [];
        this.productions.forEach((oneProduction, index) => {
            show(colors.bgGreen(`Analizando produccion ${index} ....`));
            if(oneProduction.hasSpace()){
                show('Hay espacio en el arbol');
                const newChild = _this.checkElement(token, oneProduction);
                if( newChild !== undefined){
                    if(newChild.length){
                        show('hay un array de nuevos hijos');
                        newChild.forEach(elementNewChild => {
                            show(`-- hijo: [${elementNewChild.produce}] (${elementNewChild.name})`);
                            let newProduction = JSON.parse((JSON.stringify(this.productions[index])));
                            newProduction.setChild(elementNewChild);
                            newProductions.push(newProduction);
                        });
                    } else {
                        let newProduction = JSON.parse((JSON.stringify(this.productions[index])));
                        newProduction.setChild(newChild);
                        if(newChild.name === 'Token') {
                            show(`-- hijo: ${newChild.name} (${newChild.type}) "${newChild.element}"`);
                            show(colors.green('Produccion lista'));
                            _this.stackProductionReady.push(newProduction);
                        } else {
                            show(`-- hijo: ${newChild.name}`);
                            newProductions.push(newProduction);
                        }
                    }
                } 
            } else {
                show(`No hay espacio en el arbol`);
                //Tree is full
                let newsRoots = this.getProduction(oneProduction.node);
                if(newsRoots) {
                    newsRoots.forEach(newsProduccion => {
                        newsProduccion.produce[newsProduccion.positionInProduce(oneProduction.node)] = oneProduction;
                        let newProduction = {
                            node: newsProduccion.produccion,
                            childs: newsProduccion.produce,
                            name: 'Arbol'
                        };
                        newProductions.push(newProduction);
                    });
                }
            }
        });

        this.productions = newProductions;
    }

    rootProduction(oneProduction){
        if(oneProduction.node === '<Programa>'){
            show('La produccion ya esta ruteada.');
            this.stackProductionRooted.push(oneProduction);
            return;
        } else {
            let newRoots = this.getProduction(oneProduction.node);
            if(newRoots) {
                newRoots.forEach((newsProduction)=>{
                    newsProduction.produce[newsProduction.positionInProduce(oneProduction.node)] = oneProduction;
                    let tmpProduction = {
                        node: newsProduction.produccion,
                        childs: newsProduction.produce,
                        name: 'Arbol'
                    };
                    this.stackProductionRouted.push(tmpProduction);
                });
            }
        }
    }

    forceEpsilon(child){

        if(/^[<]/.test(child)){
            show(`Elemento a analizar: ${child} (Es un string-produccion)`);
            let newChild = this.getProduce(child).filter(oneProduction => oneProduction.produce.every(e => /^<|EPSILON/.test(e)));
            if(newChild.length){
                return newChild;
            } else {
                show('ninguna de las nuevas producciones sirve');
                return false; 
            };
        } else if(typeof child === 'string') {
            //Palabra
            show(`Elemento a analizar: ${child} (Es un String-token)`);
            return child;
        } else if (child.name === 'Produccion') {
            show(`Elemento a analizar: ${child.produccion} (Es una produccion)`);
            return ({ node: child.produccion, childs: child.produce, name: 'Arbol' });
        };
    }

    completeProduction(production){

        if(production.hasSpace()){
            //Obtenemos el proximo elemento
            let newChild = this.forceEpsilon(production.next());
            if(newChild){
                if(newChild.length){
                    try{
                        if(typeof newChild == 'string'){
                            let element = chars.find((e)=>{ e.value === newChild});
                            element = element ? element.char : newChild;
                            throw new Error(colors.red((`SyntaxError: se esperaba un '${element}' en linea ${ultimoToken.line}`)));
                        }
                        newChild.forEach((elementNewChild)=>{
                            show(`-- hijo: [${elementNewChild.produce}] (${elementNewChild.name})`);
                            let newProduction = JSON.parse((JSON.stringify(production)));
                            newProduction.setChild(elementNewChild);
                            this.stackProductionNotFull.push(newProduction);
                            newProduction.showTree();
                        });
                    }catch (error){
                        if(!this.error){
                            console.log(colors.red('✘')+' Sintactical Scann');
                            show(error.message, true);
                        }
                    }
                } else {
                    let newProduction = JSON.parse((JSON.stringify(production)));
                    newProduction.setChild(newChild);
                    if (newChild.name === 'Token') {
                        show(`-- hijo: ${newChild.name} (${newChild.type}) "${newChild.element}"`);
                        show(colors.green('Produccion lista'));
                        this.stackProductionFull.push(newProduction);
                    } else {
                        show(`-- hijo: ${newChild.name}`);
                        this.stackProductionNotFull.push(newProduction);
                    }
                    newProduction.showTree();
                }
            } else {
                show('err newChild');
            }
        } else {
            show('la produccion ya esta completa');
            this.stackProductionReady.push(production);
        }
    }
};