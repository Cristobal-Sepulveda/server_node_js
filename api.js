const express = require("express");
const mongoose = require("mongoose");
const user = require("./user.controller");
const app = express();

//aqui creo el localhost:3000
const port = 3000;
//asi me conecto a la mongodb-cloud
mongoose.connect(
  "mongodb+srv://Cristobal:977614Asdf1234@cluster0.rurnojx.mongodb.net/miapp?retryWrites=true&w=majority"
);
/** 
  middleware, funcion que se va a ejecutar cuando nosotros realicemos cualquier
  tipo de peticion en nuestra aplicación.
  estos se utilizan generalmente para realizar validaciones, como por ejemplo, sacar
  los datos que vienen a traves de una peticion de post e inyectarlos en la propiedad de body de nuestro
  objeto de request.... 
  Esto lo que hará será tomar todas las peticiones que vengan en un formato json y las convertira en un objeto js
  y las asignará a la propiedad de body.
*/
app.use(express.json());

//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
//endpoints
//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

app.get("/users", user.list);
app.post("/users", user.create);
app.get("/users/:id", user.get);
app.put("/users/:id", user.update);
app.patch("/users/:id", user.update);
app.delete("/users/:id", user.destroy);

//aqui le decimos que vaya a una carpeta y esa carpeta la serviremos
app.use(express.static("client"));
app.get("/", (req, res) => {
  console.log(__dirname);
  res.sendFile(`${__dirname}/index.html`);
});
//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
//si el usuario ingresa una ruta inexistente...
//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
//'*' -> captura todas las urls ingresadas que no existan
app.get("*", user.urlNoExiste);
app.post("*", user.urlNoExiste);
//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

app.listen(port, () => {
  console.log("arrancando la aplicacion");
});
