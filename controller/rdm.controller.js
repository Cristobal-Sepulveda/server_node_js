const { firestore } = require("firebase-admin")
const admin = require("firebase-admin");
const serviceAccountDesarrollo = require("../serviceAccounts/serviceAccountDesarrollo.json");
const serviceAccountProduccion = require("../serviceAccounts/serviceAccountProduccion.json");
const getDistanceInMeters = require("../utils/haversine")



const firestoreGCP = admin.firestore();

const pedido = async(req,res) => {
    const {uid} = req.header;
    const now = moment.tz('America/Santiago');
    const currentDate = now.format('DD-MM-YYYY');
    const currentTime = now.format('HH:mm:ss');
    const docRef = firestoreGCP.collection("RegistroTrayectoVolanteros").doc(uid)

    try{
        docRef.get()
        .then((doc) =>{
            if(!doc.exists){
                res.status(500).json({"msg": "No puedes pedir materiales si no haz iniciado tu trayecto.", "horaDeLaResponse": currentTime})
            }else{
                const registroJornada = doc.data().registroJornada;
                registroJornada.forEach((registro) => {
                    if(registro.fecha === currentDate){
                        if(registro.hasOwnProperty("rdm")){
                            const lastElementIndex = registro.rdm.length - 1;
                            const lastElement = registro.rdm[lastElementIndex];
                            if(lastElement.entrega = ""){
                                res.status(500).json({"msg": "Ya tienes un pedido de materiales en camino pedido a las: " + lastElement.pedido, "horaDeLaResponse": currentTime})
                            }else{
                                registro.rdm.push({pedido: currentTime, entrega: ""})
                            }
                        } else {
                            registro.rdm = [{pedido: currentTime, entrega: ""}]
                        }
                        docRef.update({registroJornada})
                        .then(()=>{
                            res.status(200).json({"msg": "Solicitud de materiales realizada.", "horaDeLaResponse": currentTime})    
                        })
                        .catch((e)=>{
                            res.status(500).json({"msg": "Error al pedir materiales. Intentelo Nuevamente" + e.message, "horaDeLaResponse": currentTime})
                        })
                    }
                });
            }
        })
        .catch((e) =>{
            console.log("error al obtener el documento")
            res.status(500).json({"msg": "Error al pedir materiales. Intentelo Nuevamente" + e.message})
        });
            
    }catch(e){
        res.status(404).json({"msg": "Error 404: " + e.message})
    }
}


const entrega = async(req,res) => {

   
}

module.exports = {pedido, entrega}


