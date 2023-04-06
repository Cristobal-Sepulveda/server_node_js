const functions = require('firebase-functions');
const firebaseConfig = require("./firebaseConfiguration")
const { initializeApp } = require("firebase/app");
//const serviceAccount = require('./firebaseConfiguration.json');

// Initialize Firebase
const admin = initializeApp(firebaseConfig);

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount)
// });


exports.notificarAdministradores = functions.firestore
    .document('RegistroTrayectoVolanteros/{registroId}')
    .onUpdate(async (change, context) => {
        const newValue = change.after.data();
        const oldValue = change.before.data();

        // Check if the value of estaActivo changed to false
        if (newValue && newValue.estaActivo === false && oldValue && oldValue.estaActivo === true) {
            console.log("un volantero dejo de estar activo")
            const registrationTokens = [];
            const usuariosAdmin = await admin.firestore().collection('Usuarios')
                .where('rol', '==', 'Administrador')
                .get();

            usuariosAdmin.forEach(doc => {
                if (doc.data().tokenDeFCM != "" && doc.data().tokenDeFCM) {
                    console.log(doc.data(id))
                    registrationTokens.push(doc.data().tokenDeFCM);
                }
            });

            const payload = {
                notification: {
                    title: 'Alerta',
                    body: 'Se ha desactivado un trayecto'
                },
                data: {
                    customData: 'Valor personalizado'
                }
            };

            await admin.messaging().sendToDevice(registrationTokens, payload);
        }
    });