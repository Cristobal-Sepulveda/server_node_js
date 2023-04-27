const moment = require('moment-timezone');
const {Firestore} = require('@google-cloud/firestore');
const path = require("path");
const keyFilename = path.join(__dirname, "../serviceAccounts/serviceAccountProduccion.json");
const firestoreGCP = new Firestore({
  projectId: 'jorge-gas-management',
  keyFilename: keyFilename
});


const ingresarBono = async(req, res) => {
    const {uid, bono, mes, anio} = req.headers;
    console.log(uid, bono, mes, anio)
    const docRef = firestoreGCP.collection("RegistroDeAsistencia").doc(uid)
    try{
        const doc = await docRef.get();
        if(!doc.exists){
            return res.status(200).json({"msg": "El registro de ese volantero presenta problemas, favor contactar al administrador"})
        }
        const objectRegistroDeBonoPersonal = {"mes": mes, "anio": anio, "bono":bono};
        const registroDeBonoPersonal = doc.data().registroDeBonoPersonal;
        if(registroDeBonoPersonal === undefined){
            try{
                await docRef.update({registroDeBonoPersonal: 
                    Firestore.FieldValue.arrayUnion(objectRegistroDeBonoPersonal)});
                return res.status(200).json({"msg": "El bono ha sido ingresado con éxito."})
            }catch(e){
                return res.status(200).json({"msg": "Error al actualizar el registroDeBonoPersonal"});
            }
        }else{
            let aux = false;
            registroDeBonoPersonal.forEach((element) =>{
                if(element.mes === mes && element.anio ===anio){
                    aux = true;
                    return res.status(200).json({"msg": "Ya existe un bono para ese mes y año."});
                }
            });
            if(!aux){
                try{
                    await docRef.update({registroDeBonoPersonal: 
                        Firestore.FieldValue.arrayUnion(objectRegistroDeBonoPersonal)});
                    return res.status(200).json({"msg": "El bono ha sido ingresado con éxito."})
                }catch(e){
                    return res.status(200).json({"msg": "Error al actualizar el registroDeBonoPersonal"});
                }    
            }
        }
    }catch(e){
        console.log(e.message)
        return res.status(200).json({"msg": e.message})
    }

}

module.exports = {ingresarBono}