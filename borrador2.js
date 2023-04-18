const functions = require('firebase-functions');
const admin = require("firebase-admin");
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase Admin SDK
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://jorge-gas-management.firebaseio.com"
})

exports.notificarAdministradoresDeFaltaDeMaterial = functions.firestore
    .document('RegistroTrayectoVolanteros/{registroId}')
    .onUpdate(async (change, context) => {
        const registroId = context.params.registroId;
        const newValue = change.after.data();
        const oldValue = change.before.data();

        if(newValue && oldValue){
            const registrationTokens = [];
            const nombreCompleto = newValue.nombreCompleto
            const rol = newValue.rol

            // Check if the value of estaActivo changed to false
            if (newValue.conMaterial === false) {
                const usuariosAdmin = await admin.firestore()
                    .collection('Usuarios')
                    .where('rol', '==', 'Administrador')
                    .get();

                usuariosAdmin.forEach(doc => {
                    if (doc.data().tokenDeFCM != "" && doc.data().tokenDeFCM) {
                        console.log(doc.data().id)
                        registrationTokens.push(doc.data().tokenDeFCM);
                    }
                });

                const payload = {
                    notification: {
                        title: 'Alerta',
                        body: `${rol}: ${nombreCompleto} se ha quedado sin materiales`
                    },
                    data: {
                        customData: 'Valor personalizado'
                    },
                    tokens: registrationTokens
                };
                await admin.messaging().sendMulticast(payload)
                    .then((response)=>{
                        console.log("notificaciones enviadas")
                    })
                    .catch((error)=>{
                        console.log("Error:", error);
                    });
            }

            
            // Check if the value of estaActivo changed to true
            if (newValue.conMaterial === true && oldValue.conMaterial === false) {
                const usuarioVolantero = await admin.firestore()
                    .collection('Usuarios')
                    .where('id', '==', registroId)
                    .get();
                
                
                if (usuarioVolantero[0].data().tokenDeFCM && usuarioVolantero[0].data().tokenDeFCM != "") {
                    registrationTokens.push(usuarioVolantero[0].data().tokenDeFCM);
                }

                const payload = {
                    notification: {
                        title: 'Alerta',
                        body: `El administrador ha reportado entrega de material, vuelve a caminar.`
                    },
                    data: {
                        customData: 'Valor personalizado'
                    },
                    tokens: registrationTokens
                };

                await admin.messaging().sendMulticast(payload)
                    .then((response)=>{
                        console.log("notificaciones enviadas")
                    })
                    .catch((error)=>{
                        console.log("Error:", error);
                    });

            }
        }
        
    });