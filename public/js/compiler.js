
function showfile(input){
    let file = input.files[0];
    //console.log(file);

    let reader = new FileReader();
    let dataComp = {
        sourceCode: '',
        debugMode: false
    }

    reader.readAsArrayBuffer(file);

    reader.onload = ()=>{
        let decoder = new TextDecoder('utf8');
        let data = new Uint8Array(reader.result);
        let tmp_res = decoder.decode(data);
        dataComp.sourceCode = tmp_res; 
        console.log(tmp_res);
        $('#compiler-objCode').removeAttr('disabled');
        $('#objCode-container').append(`<span>${tmp_res.split('\n').join('<br>')}</span>`);

        $.ajax({
            type:"POST",
            url:"/compilerJS",
            data: dataComp
        }).done(function(msg){
            console.log("Recibiendo el mensaje..");
            console.log(msg);
            let tmp_tokens = msg.lexicalObj;
            let st_tokens = '';
            tmp_tokens.forEach(element => {
                st_tokens = st_tokens + `${JSON.stringify(element)} <br>`;
            });
            $('#compiler-lexAnalysis').removeAttr('disabled');
            $('#lexical-container').append(`<span>${st_tokens}</span>`);
            if(!msg.lexicalError){
                $('#compiler-sinAnalysis').removeAttr('disabled');
                if(msg.sintacticalError){
                    $('#sintactical-container').append(`<span>${msg.sintacticalObj}</span>`);
                } else {
                    showTree(msg.sintacticalObj);
                    //$('#sintactical-container').append(`<span>${JSON.stringify(msg.sintacticalObj)}</span>`);
                }
            }
            reader = undefined;
        });

    };


    reader.onerror = ()=>{
        console.log(reader.error);
    };
}

function showTree(cs_tree, init = '', spaces = ''){
    console.log(cs_tree.node);
    cs_tree.node = changeLabel(cs_tree.node);
    let line = ``;
    $('#sintactical-container').append(`<span>${init + cs_tree.node}</span><br>`);
    cs_tree.childs.forEach((element, index)=>{
        //console.log();
        console.log(element);
        if(typeof element  === 'string'){

            if(element !== 'EPSILON'){

                if(element.indexOf('<') !== -1){
                    
                    if(cs_tree.childs.length - 1 === index){
                        line = spaces + '└──' + element;
                        $('#sintactical-container').append(`<span>${line}</span><br>`);
                    } else {
                        line = spaces + '├──' + element;
                        $('#sintactical-container').append(`<span>${line}</span><br>`);
                    }
                } else {

                    if(cs_tree.childs.length - 1 === index){
                        line = spaces + '└──' + element;
                        $('#sintactical-container').append(`<span>${line}</span><br>`);
                    } else {
                        line = spaces + '├──' + element;
                        $('#sintactical-container').append(`<span>${line}</span><br>`);
                    }
                }

            } else {

                if(cs_tree.childs.length - 1 === index){
                    line = spaces + '└──' + element;
                    $('#sintactical-container').append(`<span>${line}</span><br>`);
                } else {
                    line = spaces + '├──' + element;
                    $('#sintactical-container').append(`<span>${line}</span><br>`);
                }
            }

        } else {

            switch(element.name){
                case 'Token':
                    console.log("ultimo hijo...");
                    if(cs_tree.childs.length - 1 === index){
                        line = spaces + '└──' + element.type + ' ' + element.element;
                        $('#sintactical-container').append(`<span>${line}</span><br>`); 
                    }else{
                        line = spaces + '├──' + element.type + ' ' + element.element;
                        $('#sintactical-container').append(`<span>${line}</span><br>`);
                    }
                    break;

                case 'Arbol':
                    if(cs_tree.childs.length - 1 === index){
                        showTree(element, spaces + '└──', spaces+'---------');
                    } else {
                        showTree(element, spaces + '├──', spaces+'│--------');
                    }
                    break;

                case 'Produccion':
                    if(cs_tree.childs.length - 1 === index){
                        line = spaces + '└──' + element.produccion + '{'+ element.produce + '}';
                        $('#sintactical-container').append(`<span>${line}</span><br>`);
                    } else {
                        line = spaces + '├──' + element.produccion + '{'+ element.produce + '}';
                        $('#sintactical-container').append(`<span>${line}</span><br>`);
                    }
                    break;
                
                default :
                    break;
            }


        }
    });
    //console.log(cs_tree);
}

function changeLabel(cs_string){
    cs_string = cs_string.replace('<','[');
    cs_string = cs_string.replace('>',']');

    return cs_string;
}