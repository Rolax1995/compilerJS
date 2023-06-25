"use strict";
const express = require('express');
const LexicalAnalyzer = require('./compilerInc/tools/lexicalAnalyzer');
const SintacticalAnalyzer = require('./compilerInc/tools/sintacticalAnalyzer');
const colors = require('@colors/colors');
const fs = require('fs');
const app = express();
const bodyParser = require('body-parser');
const port = 7000;

var analizadorLexico = new LexicalAnalyzer();
var analizadorSintactico = new SintacticalAnalyzer({debug: false});

var fileName = 'ejemplo.txt';
var makeReport = false;
var tokens;
var copyTokens = [];
var glb_tree;
var glb_error = undefined;
var glb_result = {
    lexicalError: false,
    lexicalObj: null,
    sintacticalError: false,
    sintacticalObj: null
}

app.use(express.static('./public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

app.get('/', (req,res)=>{
    res.sendFile(__dirname + '/public/Views/index.html');
});

app.post('/compilerJS',(req,res)=>{
    let data = req.body;
    console.log("Mostrando la data.");
    console.log(data);
    compilerJS(data.sourceCode, res);
    //res.json(glb_result);
});

app.listen(port, ()=>{
    console.log(colors.green(`Compiler listen on port: ${port}`));
});


function myFunction(){
    console.log("Funciona... :D");
}

//compilerJS();

function compilerJS(code, cs_res){
    console.log("Usando mi primer archivo estricto");
    
    /*var tokens =*/ lexicalAnalyzer(code);
    console.log(colors.green('✔' ) + ' Lexical Scanner ');
    console.table(tokens);
    let error = checkTokens(tokens);
    glb_result.lexicalObj = copyTokens;
    if(!error){
        glb_result.lexicalError = false;
        let error = sintacticalAnalyzer();
        if(!error){
            glb_result.sintacticalError = false;
            glb_result.sintacticalObj = glb_tree;
            console.log("Terminando mi primer aplicacion...");
            cs_res.json(glb_result);
        } else {
            console.log("Check your file, there be an error.");
            console.log(error);
            glb_result.sintacticalError = true;
            glb_result.sintacticalObj = error;
            cs_res.json(glb_result);
        };
        
    } else {
        glb_result.lexicalError = true;
        cs_res.json(glb_result);
        console.log("Revisa tu archivo porfavor.");
    };
    clear();
}

function lexicalAnalyzer(cs_code){

    try{


        analizadorLexico.importCode(cs_code);
        analizadorLexico.readLines();
        analizadorLexico.analyzeLines((e)=>{tokens = e});
        analizadorLexico.clear();
        analizadorLexico.setTokens();
        tokens.forEach((e)=>{
            copyTokens.push(e);
        })

    } catch(error) {
        glb_error = error;
        console.log(error);
    };

    if(glb_error === undefined){
        let tmp_file = JSON.stringify(tokens);
        fs.writeFileSync(__dirname + '/tmp_results/lexical.txt',tmp_file);
    };

}

function sintacticalAnalyzer(){
    let badTree = false;
    try{

        analizadorSintactico.start({tokens}, (tree, error = false)=>{
            /*console.log("Mostrando el Tree...");
            console.log(error);
            console.log(tree);*/
            if(!error){
                glb_tree = tree;
                tree.showTree(' ', ' ', true);
                let tmpFile = JSON.stringify(glb_tree);
                fs.writeFileSync(__dirname + "/tmp_results/sintactical.txt", tmpFile);
            } else {
                badTree = tree;
            }
            analizadorSintactico.clear();
        });

        return badTree;

    } catch(error){
        console.log("Mostrando el error en el try...");
        console.log(error);
    };
    
}

function checkTokens(lexResult){
    let error = false;
    lexResult.forEach(element => {
        if(element.type === undefined || element.type === null) error = true;
    });
    return error;
}

function clear(){
    glb_error=undefined;
    tokens = null;
    copyTokens = [];
    glb_tree = null;
    glb_result.lexicalError =false;
    glb_result.lexicalObj= null;
    glb_result.sintacticalError= false;
    glb_result.sintacticalObj= null;
}