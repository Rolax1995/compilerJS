# compilerJS
This is a compiler that can read a languge based on JavaScript.
Compilador JS:

La siguiente aplicación consiste en un pequeño compilador el cuál es capaz de poder identificar y reconocer instrucciones de alto nivel redactadas en un lenguaje similar a JavaScript contenidas dentro de un archivo.txt el cual deberá contener su código fuente a analizar, con la diferencia de que este únicamente se puede llevar a cabo de forma estricta. 

Fases de Análisis:
Para este lenguaje se utilizó cómo fundamento principal la interpretación y declaración una tabla de símbolos y palabras reservadas que deberá utilizar el usuario para la implementación de estructuras de control, declaraciones o estructuras iterativas además de manejar expresiones regulares para poder identificar cada uno de los elementos de la tabla de símbolos que posee. El entorno de desarrollo que nos brinda JavaScript para el manejo de expresiones regulares, el cuál es empleado para el reconocimiento de los símbolos es “RegExpression”, este framework nos permite la identificación de cada una de las expresiones regulares contenidas en el código fuente las cuales hacen match con las expresiones definidas en el manual técnico de la presente aplicación, en esto es lo que consiste el Análisis Léxico, por lo que se muestra la tabla en la “navTab” inferior en el apartado “Analisis Lexico” el cual se activa posterior a la carga del archivo, mostrando el resultado de dicho análisis.

Posteriormente a que se hallan verificado que todos los símbolos pertenecen a algún token especial del lenguaje, se inicia el análisis sintáctico del código fuente en donde se mostrará el árbol de derivación descendente por derecha, este árbol muestra el resultado de la comparación del orden de cada uno de los tokens con respecto al que describe cada una de las producciones de estos lenguajes detallados en el manual técnico. Si todo el análisis sintáctico es correcto, y existe producciones válidas para la interpretación del código, se desplegará el árbol de forma visible en Análisis Sintáctico; de existir algún token o producción inesperadas para el lenguaje el error se mostrará en el mismo lugar.

Ejemplos:

Declaraciones / Asignaciones:
Se pueden utilizar las palabras reservadas: var, let, const.
	let a;
	const a = "Hola mundo";
	var a = 15;
	let a = 0.50;
	var a = true;

Expresiones:
Se pueden reconocer las siguientes expresiones: Aritmeticas y Logicas.

Expresiones Aritmeticas:
Se pueden realizar entre id y expresiones aritmeticas.
	Suma +
	Autoincremento ++
	Autodecremento --
	Resta -
	Multiplicacion *
	Division /
	Agrupaciones ()

Expresiones Logicas o Booleanas:
Se pueden realizar entre id y expresiones aritmeticas o logicas.
	Mayor Que >
	Menor Que <
	Igualdad ==
	Igualdad Estricata ===
	Distinto De !=
	Distinto De Estricto !==
	AND &&
	OR ||

Estructura de Control:
Se puede reconocer un if con condicion simple o compuesta con and y or.
	if(a > 100){
	    i = false;
	} else {
 	    i = true;
	};
Ciclos:
Se puede reconocer: while, do-while, for
	let a = 0;
	do{
 	 a++;
	}while(a > 100);
