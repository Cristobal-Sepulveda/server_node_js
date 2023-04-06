const {jwtGenerator, jwtVerify} = require("../jsonwebtoken/jwtgenerator")


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
  console.log(req.headers)
  const token = req.headers["authorization"]
  await jwtVerify(token,res)
}



module.exports = { getToken, validateToken }