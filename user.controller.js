const Users = require("./User");

const User = {
  //status 200 se usará para cuando queramos devolver ok y devolver datos o console.log
  //status 201 se usará para devolver ok, objeto creado y devuelve dato o console.log
  //status 204 se usará para devolver ok, requerimiento ejecutado. Esto no devuelve data ni console.log

  get: async (req, res) => {
    const { id } = req.params;
    const user = await Users.findOne({ _id: id });
    res.status(200).send(user);
  },
  list: async (req, res) => {
    const users = await Users.find();
    res.status(200).send("users");
  },
  create: async (req, res) => {
    console.log(req.body);
    const user = new Users(req.body);
    const savedUser = await user.save(user.id);
    res.status(201).send(savedUser._id);
  },
  // a
  update: async (req, res) => {
    const { id } = req.params;
    const user = await Users.findOne({ _id: id });
    Object.assign(user, req.body);
    await user.save();
    res.sendStatus(204);
  },
  destroy: async (req, res) => {
    const { id } = req.params;
    const user = await Users.findOne({ _id: id });
    if (user) {
      user.remove();
    }
    res.sendtatus(204);
  },
  urlNoExiste: async (req, res) => {
    res.status(404).send("Esta pagina no existe");
  },
};

module.exports = User;
