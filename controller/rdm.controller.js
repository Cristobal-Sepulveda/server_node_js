const moment = require('moment-timezone');
const {Firestore} = require('@google-cloud/firestore');
const path = require("path");
const keyFilename = path.join(__dirname, "../serviceAccounts/serviceAccountProduccion.json");
const firestoreGCP = new Firestore({
  projectId: 'jorge-gas-management',
  keyFilename: keyFilename
});


const pedido = async(req,res) => {
    const {uid} = req.headers;
    const now = moment.tz('America/Santiago');
    const currentDate = now.format('YYYY-MM-DD');
    const currentTime = now.format('HH:mm:ss');
    const docRef = firestoreGCP.collection("RegistroTrayectoVolanteros").doc(uid)

    try{
        docRef.get()
        .then((doc) =>{
            if(!doc.exists){
                res.status(200).json({"msg": "No puedes pedir materiales si no haz iniciado tu trayecto.", "horaDeLaResponse": currentTime})
            }else{
                console.log("el documento existe")
                const registroJornada = doc.data().registroJornada;
                let responseSent = false; // flag variable
                registroJornada.forEach((registro) => {
                    if(registro.fecha === currentDate){
                        if(registro.hasOwnProperty("rdm")){
                            console.log("rdm ya existe")
                            const lastElementIndex = registro.rdm.length - 1;
                            const lastElement = registro.rdm[lastElementIndex];
                            console.log(lastElement)
                            if(lastElement.entrega === ""){
                                if (!responseSent) {
                                    responseSent = true;
                                    res.status(200).json({"msg": "Ya tienes un pedido de materiales en camino pedido a las: " + lastElement.pedido, "horaDeLaResponse": currentTime})
                                }
                            }else{
                                registro.rdm.push({pedido: currentTime, entrega: ""})
                            }
                        } else {
                            console.log("rdm no existe")
                            registro.rdm = [{pedido: currentTime, entrega: ""}]
                        }
                        docRef.update({registroJornada: registroJornada, conMaterial: false})
                        .then(()=>{
                            if (!responseSent) {
                                responseSent = true;
                                res.status(200).json({"msg": "Solicitud de materiales realizada.", "horaDeLaResponse": currentTime})    
                            }
                        })
                        .catch((e)=>{
                            if (!responseSent) {
                                responseSent = true;
                                res.status(500).json({"msg": "Error al pedir materiales. Intentelo Nuevamente" + e.message, "horaDeLaResponse": currentTime})
                            }
                        })
                    }
                });
            }
        })
        .catch((e) =>{
            console.log("error al obtener el documento")
            res.status(500).json({"msg": "Error al pedir materiales. Intentelo Nuevamente" + e.message, "horaDeLaResponse": currentTime})
        });
            
    }catch(e){
        res.status(404).json({"msg": "Error 404: " + e.message, "horaDeLaResponse": currentTime})
    }
}

const entrega = async(req,res) => {
    const {uid} = req.headers;
    const now = moment.tz('America/Santiago');
    const currentDate = now.format('YYYY-MM-DD');
    const currentTime = now.format('HH:mm:ss');
    const docRef = firestoreGCP.collection("RegistroTrayectoVolanteros").doc(uid)

    try{
        const doc = await docRef.get();
        if(!doc.exists){
            return res.status(200).json({"msg": "No puedes pedir materiales si no haz iniciado tu trayecto.", "horaDeLaResponse": currentTime})
        }

        const registroJornada = doc.data().registroJornada;
        for(const registro of registroJornada){
            if(registro.fecha === currentDate){
                const lastElementIndex = registro.rdm.length - 1;
                const lastElement = registro.rdm[lastElementIndex];
                if(lastElement.entrega == ""){
                    try{
                        lastElement.entrega = currentTime;
                        await docRef.update({registroJornada: registroJornada, conMaterial: true});
                        return res.status(200).json({"msg": "Entrega de materiales realizada.", "horaDeLaResponse": currentTime});
                    }catch(e){
                        return res.status(200).json({"msg": "Error al entregar materiales. Intentelo Nuevamente" + e.message, "horaDeLaResponse": currentTime});
                    }
                }else{
                    return res.status(200).json({"msg": "Ya se entregaron los materiales.", horaDeLaResponse: currentTime})
                }
                
            }
        }
        return res.status(200).json({"msg": "Error al entregar materiales. Intentelo Nuevamente", "horaDeLaResponse": currentTime});
    }catch(e){
        return res.status(500).json({"msg": "Error 404: " + e.message, "horaDeLaResponse": currentTime});
    }
}

module.exports = {pedido, entrega}


