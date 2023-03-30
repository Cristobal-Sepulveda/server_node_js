const express = require("express");
const mongoose = require("mongoose");
const admin = require("firebase-admin")
const serviceAccount = require("./serviceAccount.json")
const jwtController = require("./jwt.controller");
const morgan = require("morgan")
const app = express();
const jwt = require("jsonwebtoken");
const { jwtGenerator } = require("./jsonwebtoken/jwtgenerator");
require("dotenv").config();


//aqui creo el localhost:3000
const port = 8080;

//asi me conecto a la mongodb-cloud
mongoose.connect(
  "mongodb+srv://Cristobal:asdF1234@cluster0.rurnojx.mongodb.net/?retryWrites=true&w=majority"
);

admin.initializeApp({credential: admin.credential.cert(serviceAccount),})

//esto convierte todo lo que caiga en un json
app.use(express.json());
app.use(morgan("dev"));

//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
//endpoints
//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
app.get("/")
app.get("/getToken", jwtController.getToken);
app.post("/validateToken", jwtController.validateToken);
app.get("*", urlNoExiste);
app.post("*", urlNoExiste);

const urlNoExiste = async(req, res) => {
  res.status(404).send("Esta pagina no existe");
}

app.listen(port, () => {
  console.log("http://Localhost:8080");
});


module.exports = admin;