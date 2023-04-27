const getDistanceInMeters = require("../utils/haversine")
const moment = require('moment-timezone');
const {Firestore} = require('@google-cloud/firestore');
const path = require("path");
const keyFilename = path.join(__dirname, "../serviceAccounts/serviceAccountProduccion.json");
const firestoreGCP = new Firestore({
  projectId: 'jorge-gas-management',
  keyFilename: keyFilename
});



const ingresoJornada = async(req,res) => {
    const {id, nombreCompleto, latitude, longitude} = req.body;
    const coordenadasJorgeGas = {latitude: -33.62549622379493, longitude: -70.58403775961933};
    const coordenadasDelUsuario = {latitude: parseFloat(latitude), longitude: parseFloat(longitude)};
    const distanceInMeters = getDistanceInMeters(coordenadasJorgeGas, coordenadasDelUsuario);
    const now = moment.tz('America/Santiago');
    const currentDate = now.format('DD-MM-YYYY');
    const currentTime = now.format('HH:mm:ss');
    const docRef = firestoreGCP.collection("RegistroDeAsistencia").doc(id)

    console.log(distanceInMeters);
    console.log(coordenadasDelUsuario);
    console.log(coordenadasJorgeGas);


    if(distanceInMeters>500){
        res.status(500).json({"msg": "Para poder marcar su ingreso debe de estar a menos de 500 metros de la empresa."})
    }else{
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
                        console.log("error al crear el registro"+ e.message)
                        res.status(500).json({ "msg": e.message })
                    });
                }
            })
            .catch((e) =>{
                console.log("error al obtener el documento"+ e.message)
                res.status(500).send(e.message)
            });
        }catch(e){
            res.status(404).json({"msg": "Error 404"})
        }
    }
}

const salidaJornada = async(req,res) => {
    console.log(req.headers)
    const {id, tiempoenverde, tiempoenamarillo, tiempoenrojo, tiempoenazul, tiempoenrosado} = req.headers

    const now = moment.tz('America/Santiago');
    const currentDate = now.format('DD-MM-YYYY');
    const currentTime = now.format('HH:mm:ss');
    const docRef = firestoreGCP.collection("RegistroDeAsistencia").doc(id)

    docRef.get()
        .then((doc)=>{
            if(!doc.exists){
                res.status(200).json({"msg": "Antes de finalizar tu jornada debes de iniciarla."})
            }else{
                const registroAsistencia = doc.data().registroAsistencia
                let aux = -1;
                registroAsistencia.forEach((element, index) => {{
                    if(element.fecha === currentDate){
                        aux = index ;
                    }
                }})
                if(aux === -1){
                    res.status(200).json({"msg" : "Antes de finalizar tu jornada debes de iniciarla."})
                }else{
                    if(registroAsistencia[aux].salidaJornada === ""){
                        registroAsistencia[aux] = {
                            fecha: registroAsistencia[aux].fecha,
                            ingresoJornada: registroAsistencia[aux].ingresoJornada,
                            salidaJornada: currentTime,
                            tiempoEnVerde : tiempoenverde || 0,
                            tiempoEnAmarillo : tiempoenamarillo || 0,
                            tiempoEnRojo : tiempoenrojo || 0,
                            tiempoEnAzul : tiempoenazul || 0,
                            tiempoEnRosado : tiempoenrosado || 0,

                        }
                        docRef.update({registroAsistencia})
                        .then(()=>{
                            res.status(200).json({"msg": "Salida de jornada registrada"})
                        })
                        .catch((e)=>{
                            console.log(e.message)
                            res.status(500).json({"msg": e.message})
                        });
                    }else{
                        res.status(200).json({"msg" : "Ya haz finalizado tu jornada de hoy." })
                    }
                }

            }
        })
        .catch((e)=>{
            console.log(e.message)
            res.status(500).json({"msg": e.message})
        });
}

module.exports = {ingresoJornada, salidaJornada}


