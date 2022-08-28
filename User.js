const mongoose = require("mongoose");

const Users = mongoose.model("User", {
  //al crearlo así, será un objeto de mongoose
  //así, el modelo será dinamico, podrá tener mas funcionalidades
  name: { type: String, required: true, minLength: 3 },
  lastname: { type: String, required: true, minLength: 3 },
});

module.exports = Users;
