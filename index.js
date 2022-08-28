const mongoose = require("mongoose");

//aqui creo un modelo(los modelos se crean con mayuscula):
//atributos:1)nombredelmodelo,2) atributos
const User = mongoose.model("User", {
  username: String,
  edad: Number,
});

//funcion asincrona para crear usuario
const crear = async () => {
  const user = new User({ username: "chanchito feliz", edad: 25 });
  //.save retorna una promesa, por lo tanto...
  const savedUser = await user.save();
  console.log(savedUser);
};

//crear();
const buscarTodo = async () => {
  //esto va a buscar, a la coleccion de User, todos los docs
  //y lo devuelve como JSON
  const users = await User.find();
  console.log(users);
};

// buscarTodo();

const buscar = async () => {
  const user = await User.find({ username: "chanchito feliz" });
  console.log(user);
};

// buscar();

const buscarUno = async () => {
  const user = await User.findOne({ username: "chanchito feliz" });
  console.log(user);
};

// buscarUno();

const actualizar = async () => {
  const user = await User.findOne({ username: "chanchito feliz" });
  user.edad = 30;
  await user.save();
};

// actualizar();

const eliminar = async () => {
  const user = await User.findOne({ username: "chanchito feliz" });
  try {
    await user.remove();
  } catch (e) {
    console.log(e);
  }
};

//eliminar();
