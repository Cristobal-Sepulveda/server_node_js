const functions = require('firebase-functions');
const admin = require("firebase-admin");
const serviceAccount = require('./serviceAccountKey.json');


const DOCUMENT_TRAYECTO_VOLANTEROS = 'RegistroTrayectoVolanteros/{registroId}';

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://jorge-gas-management.firebaseio.com"
});

  
exports.notificarAdministradores = functions.firestore.document(DOCUMENT_TRAYECTO_VOLANTEROS).onUpdate(async (change, context) => {
    const newValue = change.after.data();
    const oldValue = change.before.data();
    if (newValue.estaActivo !== oldValue.estaActivo) {
        const registrationTokens = [];
        const nombreCompleto = newValue.nombreCompleto
        const rol = newValue.rol
        const usuariosAdmin = await admin.firestore().collection('Usuarios').where('rol', '==', 'Administrador').get();
    
        usuariosAdmin.forEach(doc => {
            if (doc.data().tokenDeFCM != "" && doc.data().tokenDeFCM) {
                console.log(doc.data().id)
                registrationTokens.push(doc.data().tokenDeFCM);
            }
        });
    
        switch(true){
            case newValue.estaActivo === false && oldValue.estaActivo === true:
                console.log("Alerta", `${rol}: ${nombreCompleto} ha detenido la trasmisión`)
                sendNotification("Alerta", `${rol}: ${nombreCompleto} ha detenido la trasmisión`, registrationTokens, false);
                break;
    
            case newValue.estaActivo === true && oldValue.estaActivo === false:
                console.log("Alerta", `${rol}: ${nombreCompleto} ha iniciado la trasmisión`)
                sendNotification("Alerta", `${rol}: ${nombreCompleto} ha iniciado la transmisión`, registrationTokens)
                break;
        }
    }else{
        console.log("la function se ejecuto pero no computo nada ya que el valor estaActivo del documento en cuestion no cambio de value")
    }
});


async function sendNotification(title, body, tokens) {
    const payload = {
        notification: {
            title: title,
            body: body
        },
        data: {
            customData: 'Valor personalizado'
        },
        tokens: tokens
    };

    try {
        const response = await admin.messaging().sendMulticast(payload);
        console.log("Notificaciones enviadas:", response.successCount);
    } catch (error) {
        console.log("Error al enviar notificaciones:", error);
    }
}