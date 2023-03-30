const {jwtGenerator, jwtVerify} = require("./jsonwebtoken/jwtgenerator")


const getToken = async(req,res) =>{
    const { id } = req.body
    try{
        const newToken = await jwtGenerator(id)
        if(newToken == "No se pudo generar el JWT"){
          res.status(500)
        }else{
          res.status(200).send(newToken)
        }  
      }catch(e){
        res.status(500).send({msg: e.message})
      }
}

const validateToken = async(req,res) => {
    const { token } = req.body
    await jwtVerify(token,res)
}

module.exports = {getToken, validateToken}

    // const user = new Users(req.body);
    // const savedUser = await user.save(user.id);

    // const colRefUsuariosEnFirestoreGCP = firestoreGCP.collection("Usuarios")
    // colRefUsuariosEnFirestoreGCP.get()
    //   .then((snapshot) => {
    //     snapshot.forEach(element => {
    //       console.log(element.id, "=>", element.data());
    //     })
    //     res.status(200).send("El proceso se ejecuto con exito");
    //   })
    //   .catch((e) =>{
    //     console.log("Error: ",e);
    //     res.status(500).send("El usuario no pudo ser creado",e);
    //   })