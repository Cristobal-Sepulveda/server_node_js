const express = require("express");
const mongoose = require("mongoose");
const jwtController = require("./controller/jwt.controller");
const asistenciaController = require("./controller/asistencia.controller");
const rdmController = require("./controller/rdm.controller");
const morgan = require("morgan")
const app = express();
require("dotenv").config();
const admin = require("firebase-admin");
const serviceAccountProduccion = require("./serviceAccounts/serviceAccountProduccion.json")

//aqui creo el localhost:3000
const port = 8080;

//Aquí me conecto a firebase
//produccion
admin.initializeApp({
  credential: admin.credential.cert(serviceAccountProduccion),
  databaseURL: "https://jorge-gas-management.firebaseio.com"
})
const firestoreGCP = admin.firestore();

//desarrollo
// admin.initializeApp({
//     credential: admin.credential.cert(serviceAccountDesarrollo),
//     databaseURL: "https://jorgegas-management-desa-a0dc2.firebaseio.com"
// })



//esto convierte todo lo que caiga en un json
app.use(express.json());
app.use(morgan("dev"));



const urlNoExiste = async(req, res) => {
  res.status(404).send("Esta pagina no existe");
}


//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
//endpoints
//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
app.get("/getToken", jwtController.getToken);
app.post("/validateToken", jwtController.validateToken);
app.post("/ingresoJornada", asistenciaController.ingresoJornada);
app.post("/salidaJornada", asistenciaController.salidaJornada);
app.post("rdmPedido", rdmController.pedido)
app.post("rdmEntrega", rdmController.entrega)


app.get("*", urlNoExiste);
app.post("*", urlNoExiste);


app.listen(port, () => {
  console.log("http://Localhost:8080");
});

module.exports = firestoreGCP

