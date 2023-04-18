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
  const {desde, hasta} = req.headers;
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
          const registroAsistencia = data.registroAsistencia;
          registroAsistencia.forEach((map)=>{
            if(isBetweenDates(map.fecha, desde, hasta)){
              diasTrabajados++;
            }  
          });
          const sueldo = sueldoDiario*diasTrabajados;
          const volantero = {
            "nombre": nombreCompleto,
            "sueldoDiario": sueldoDiario,
            "diasTrabajados": diasTrabajados,
            "sueldo": sueldo,
            "bono": bono,
            "total": total
          };
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

        // Set the headers for the response
        res.setHeader('Content-Disposition', 'attachment; filename="RegistroDeAsistenciaVolanteros.xlsx"');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Length', buffer.length);

        // Send the buffer as the response
        console.log("excel con exito")
        return res.status(200).send(buffer)
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


