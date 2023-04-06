const { firestore } = require("firebase-admin")
const admin = require("firebase-admin");
const serviceAccount = require("../serviceAccount.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://jorgegas-management-desa-a0dc2.firebaseio.com"
  })

const firestoreGCP = admin.firestore();

const ingresoJornada = async(req,res) => {
    const {id, nombreCompleto} = req.body
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1; // add 1 to get 1-12 instead of 0-11
    const day = now.getDate();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const docRef = firestoreGCP.collection("RegistroDeAsistencia").doc(id)
    const currentDate = `${day}-${month}-${year}`
    const currentTime = `${hours}:${minutes}:${seconds}`

    try{
        docRef.get()
        .then((doc) =>{
            if(doc.exists){
                const registroAsistencia = doc.data().registroAsistencia
                let jornadaYaIniciada = false; // flag to track if jornada has already been initiated
                registroAsistencia.forEach((registro) =>{
                    if(registro.fecha === currentDate){
                        jornadaYaIniciada = true;
                    }
                })
                if(jornadaYaIniciada){
                    res.status(500).json({"msg": "Usted ya inicio jornada el día de hoy"})
                }else{
                    registroAsistencia.push({
                        fecha: currentDate,
                        ingresoJornada: currentTime,
                        salidaJornada: ""
                      });
                    docRef.update({registroAsistencia})
                      .then(()=>{
                        res.status(200).json({"msg": "Exito"})
                      })
                      .catch((e)=>{
                        res.status(500).json({"msg": e.message})
                      })
                }
            }else{
                console.log("el documento no existe")
                const nuevoRegistro = {
                    nombreCompleto : nombreCompleto,
                    registroAsistencia: [{
                        fecha: currentDate, 
                        ingresoJornada: currentTime,
                        salidaJornada: "" }
                    ]  
                }
                docRef.set(nuevoRegistro)
                    .then(()=>{
                        res.status(200).json({"msg": "Exito"})
                    })
                    .catch((e)=>{
                        res.status(500).json({"msg": e.message})
                    });

            }
        })
        .catch((e) =>{
            res.status(500).json({"msg": e.message})
        });
    }catch(e){
        res.status(404).json({"msg": "Error 404"})
    }
    
}

const salidaJornada = async(req,res) => {
    const {id, nombreCompleto} = req.body
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1; // add 1 to get 1-12 instead of 0-11
    const day = now.getDate();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const docRef = firestoreGCP.collection("RegistroDeAsistencia").doc(id)
    const currentDate = `${day}-${month}-${year}`
    const currentTime = `${hours}:${minutes}:${seconds}`

    docRef.get()
        .then((doc)=>{

        })
        .catch((e)=>{

        });
}

module.exports = {ingresoJornada, salidaJornada}


