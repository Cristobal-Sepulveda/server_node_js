const express = require("express");
const mongoose = require("mongoose");

const jwtController = require("./controller/jwt.controller");
const asistenciaController = require("./controller/asistencia.controller");

const morgan = require("morgan")
const app = express();
require("dotenv").config();

//aqui creo el localhost:3000
const port = 8080;

//asi me conecto a la mongodb-cloud
mongoose.connect("mongodb+srv://Cristobal:asdF1234@cluster0.rurnojx.mongodb.net/?retryWrites=true&w=majority");



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
app.post("/salidaJornada", asistenciaController.salidaJornada)


app.get("*", urlNoExiste);
app.post("*", urlNoExiste);


app.listen(port, () => {
  console.log("http://Localhost:8080");
});

