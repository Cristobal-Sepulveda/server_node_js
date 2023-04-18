const moment = require('moment-timezone');
const {Firestore} = require('@google-cloud/firestore');
const path = require("path");
const keyFilename = path.join(__dirname, "../serviceAccounts/serviceAccountProduccion.json");
const firestoreGCP = new Firestore({
  projectId: 'jorge-gas-management',
  keyFilename: keyFilename
});
const Excel = require('exceljs');
const fs = require('fs');
const nodemailer = require('nodemailer');


const exportarRegistroDeAsistenciaAExcel = async (req, res) => {
    const {emailreceptor, desde, hasta} = req.headers;
    console.log(emailreceptor)
    const now = moment.tz('America/Santiago');
    const currentTime = now.format('HH:mm:ss');
    const colRef = firestoreGCP.collection("RegistroDeAsistencia");
    
    try {
      colRef.get()
        .then(async (querySnapshot) => {
            const workbook = new Excel.Workbook();
            const worksheet = workbook.addWorksheet("Asistencia de Volanteros");

            worksheet.columns = [
              { header: 'Nombre', key: 'nombre' },
              { header: 'Sueldo Diario', key: 'sueldoDiario' },
              { header: 'Días Trabajados', key: 'diasTrabajados' },
              { header: 'Sueldo', key: 'sueldo' },
              { header: 'Bono', key: 'bono' },
              { header: 'Total', key: 'total' },
            ];

            querySnapshot.forEach((doc) => {
              // Convert each document to a plain JavaScript object
                const data = doc.data();
                const nombreCompleto = data.nombreCompleto;
                const sueldoDiario = 10000;
                let diasTrabajados = 0;
                const bono = ""
                const total = ""
                const registroAsistencia = data.registroAsistencia
                console.log("hola")
                registroAsistencia.forEach((map)=>{
                  if(isBetweenDates(map.fecha, desde, hasta)){
                    console.log("fecha entre")
                    diasTrabajados++;
                  }  
                })
                const sueldo = sueldoDiario*diasTrabajados;
                const volantero = {
                  "nombre": nombreCompleto,
                  "sueldoDiario": sueldoDiario,
                  "diasTrabajados": diasTrabajados,
                  "sueldo": sueldo,
                  "bono": bono,
                  "total": total
                }
                console.log(volantero)
                worksheet.addRow(volantero);
            });
            // Auto-fit the columns
            worksheet.columns.forEach((column) => {
              column.width = column.header.length < 12 ? 12 : column.header.length;
            });

            // Freeze the first row
            worksheet.views = [
                { state: 'frozen', xSplit: 0, ySplit: 1 },
            ];
    
            // Write the workbook to a buffer
            const buffer = await workbook.xlsx.writeBuffer();
            
            // Create a transporter for sending emails
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                  user: 'jorgegasempresaapp@gmail.com',
                  pass: 'hgwgpfbfjndysxyp'
                }
              });
            
            // Define the email options
            const mailOptions = {
              from: 'jorgegasempresaapp@gmail.com', // Replace with the sender's email address
              to: emailreceptor, // Replace with the recipient's email address
              subject: 'Registro de Asistencia', // Replace with the email subject
              text: 'Adjunto se encuentra el registro de asistencia en formato Excel', // Replace with the email body
              attachments: [
                {
                  filename: 'RegistroDeAsistenciaVolanteros.xlsx',
                  content: buffer,
                },
              ],
            };
    
            // Send the email
            transporter.sendMail(mailOptions, (error, info) => {
              if (error) {
                console.log(error);
                return res.status(200).json({"msg": "Error al enviar el correo electrónico", "horaDeLaResponse": currentTime});
              } else {
                console.log('Email sent: ' + info.response);
                return res.status(200).json({"msg": "Excel enviado al correo electrónico", "horaDeLaResponse": currentTime});
              }
            });
        })
        .catch((e) => {
          console.log(e.message);
          return res.status(200).json({"msg": "Error al obtener el registro de asistencia "+ e.message, "horaDeLaResponse": currentTime});
        });
    } catch (e) {
      console.log(e.message);
      return res.status(200).json({"msg": "Error al obtener el registro de asistencia: "+  e.message, "horaDeLaResponse": currentTime});
    }
  };
  
  function isBetweenDates(dateStr, startDateStr, endDateStr) {
    const dateParts = dateStr.split('-');
    const startDateParts = startDateStr.split('-');
    const endDateParts = endDateStr.split('-');
  
    const date = new Date(`${dateParts[1]}-${dateParts[0]}-${dateParts[2]}`).getTime();
    const startDate = new Date(`${startDateParts[1]}-${startDateParts[0]}-${startDateParts[2]}`).getTime();
    const endDate = new Date(`${endDateParts[1]}-${endDateParts[0]}-${endDateParts[2]}`).getTime();
  
    return startDate <= date && date <= endDate;
  }
  
    


module.exports = {exportarRegistroDeAsistenciaAExcel}


