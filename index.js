const express = require("express");
const jwtController = require("./controller/jwt.controller");
const asistenciaController = require("./controller/asistencia.controller");
const rdmController = require("./controller/rdm.controller");
const rdaController = require("./controller/rda.controller");
const rdpController = require("./controller/rdp.controller");
const rdbController = require("./controller/rdb.controller");

const morgan = require("morgan");
const app = express();
const admin = require("firebase-admin");
const serviceAccountProduccion = require("./serviceAccounts/serviceAccountProduccion.json");

require("dotenv").config();
app.use(express.json());
app.use(morgan("dev"));


admin.initializeApp({
  credential: admin.credential.cert(serviceAccountProduccion),
  databaseURL: "https://jorge-gas-management.firebaseio.com"
})
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccountDesarrollo),
//   databaseURL: "https://jorgegas-management-desa-a0dc2.firebaseio.com"
// })
const firestoreGCP = admin.firestore();




const urlNoExiste = async(req, res) => {
  res.status(404).send("Esta pagina no existe");
}

app.get("/getToken", jwtController.getToken);
app.post("/validateToken", jwtController.validateToken);
app.post("/ingresoJornada", asistenciaController.ingresoJornada);
app.post("/salidaJornada", asistenciaController.salidaJornada);
app.post("/rdmPedido", rdmController.pedido);
app.post("/rdmEntrega", rdmController.entrega);
app.post("/exportarRegistroDeAsistenciaAExcel", rdaController.exportarRegistroDeAsistenciaAExcel);
app.post("/crearPedido", rdpController.crearPedido);
app.post("/ingresarBono", rdbController.ingresarBono);
app.get("*", urlNoExiste);
app.post("*", urlNoExiste);


const port = 8080;

app.listen(port, () => {
  console.log("http://localhost:8080");
});


