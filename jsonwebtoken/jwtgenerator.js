const jwt = require("jsonwebtoken");


const jwtGenerator = (id) => {
  return new Promise((resolve, reject) =>{
    const payload = { id };
    //jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: '8h'}, (err,token) => {
    jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: '1m'}, (err,token) => {
      if (err) {
        console.log(err);
        reject("No se pudo generar el JWT");
      } else {
        resolve(token);
      } 
    });
  });
};


const jwtVerify = async (token, res) => {
  if (!token) {
    return res.status(401).json({
      msg: "No se proporcionó un token"
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.status(200).send("token valido")
    //req.user = decoded
    //next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return res.status(401).json({msg: "El token ha expirado"});
    } else {
      return res.status(401).json({msg: "Token inválido"});
    }
  }
};


module.exports = {jwtGenerator, jwtVerify}
