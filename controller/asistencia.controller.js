const { firestore } = require("firebase-admin")
const admin = require("firebase-admin");
const serviceAccount = require("../serviceAccount.json");
const getDistanceInMeters = require("../utils/haversine")

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://jorgegas-management-desa-a0dc2.firebaseio.com"
  })

const firestoreGCP = admin.firestore();

const ingresoJornada = async(req,res) => {
    const {id, nombreCompleto, latitude, longitude} = req.body;
    const coordenadasJorgeGas = {latitude: -33.62549622379493, longitude: -70.58403775961933};
    const coordenadasDelUsuario = {latitude: parseFloat(latitude), longitude: parseFloat(longitude)};
    const distanceInMeters = getDistanceInMeters(coordenadasJorgeGas, coordenadasDelUsuario);

    console.log(distanceInMeters);
    console.log(coordenadasDelUsuario);
    console.log(coordenadasJorgeGas);


    if(distanceInMeters>500){
        res.status(500).json({"msg": "Para poder marcar su ingreso debe de estar a menos de 500 metros de la empresa."})
    }else{
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
                                res.status(200).json({"msg": "Ingreso de jornada registrado"})
                            })
                            .catch((e)=>{
                                res.status(500).json({"msg": e.message})
                            })
                    }
                }else{
                    console.log("el documento no existia, se creara uno nuevo")
                    const nuevoRegistro = {
                        nombreCompleto: nombreCompleto,
                        registroAsistencia: [{
                            fecha: currentDate,
                            ingresoJornada: currentTime,
                            salidaJornada: ""
                        }]
                    }
                    docRef.set(nuevoRegistro)
                    .then(() => {
                        res.status(200).json({ "msg": "Se creo el registro de tu asistencia" })
                    })
                    .catch((e) => {
                        console.log("error al crear el registro")
                        res.status(500).json({ "msg": e.message })
                    });
                }
            })
            .catch((e) =>{
                console.log("error al obtener el documento")
                res.status(500).send(e.message)
            });
        }catch(e){
            res.status(404).json({"msg": "Error 404"})
        }
    }
}

const salidaJornada = async(req,res) => {
    console.log(req.headers)
    const {id} = req.headers
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
            if(!doc.exists){
                res.status(500).json({"msg": "Antes de finalizar tu jornada debes de iniciarla."})
            }else{
                const registroAsistencia = doc.data().registroAsistencia
                let aux = -1;
                registroAsistencia.forEach((element, index) => {{
                    if(element.fecha === currentDate){
                        aux = index ;
                    }
                }})
                if(aux === -1){
                    res.status(500).json({"msg" : "Antes de finalizar tu jornada debes de iniciarla."})
                }else{
                    if(registroAsistencia[aux].salidaJornada === ""){
                        registroAsistencia[aux].salidaJornada = currentTime
                        docRef.update({registroAsistencia})
                        .then(()=>{
                            res.status(200).json({"msg": "Salida de jornada registrada"})
                        })
                        .catch((e)=>{
                            res.status(500).json({"msg": e.message})
                        });
                    }else{
                        res.status(500).json({"msg" : "Ya haz finalizado tu jornada de hoy." })
                    }
                }

            }
        })
        .catch((e)=>{
            res.status(500).json({"msg": e.message})
        });
}

module.exports = {ingresoJornada, salidaJornada}


