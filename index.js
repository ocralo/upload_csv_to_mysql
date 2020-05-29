const readXlsxFile = require("read-excel-file/node");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const mysql = require("mysql");

//coneccion a base de datos
const con = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "",
  database: "open_city",
});

// lectura de archivo .xlsx de una sola fila, si hay mas filas cambiar el codigo.
readXlsxFile("instituciones.xlsx").then((rows) => {
  console.log(rows.map((val) => val[0]));

  insert(rows.map((val) => val[0]));
});

//funcion para insertar los datos de un arreglo a la base de datos
async function insert(rows) {
  console.log(rows);
  let arraydb = await rows.map((val) => {
    return querySQL(val).then((resolve) => resolve);
  });

  console.log(arraydb);
  con.end();
  Promise.all(arraydb).then((resolve) =>
    createFileCSV("institution_id.csv", resolve, [
      { id: "ins", title: "INSTITUCION" },
      { id: "id_ins", title: "ID_INSTITUCION" },
    ])
  );
}

//ejecucion del la insertcion a la base de datos
async function querySQL(val) {
  let promesa = await new Promise((resolve, reject) => {
    con.query(`INSERT INTO institutions (name) VALUES ('${val}')`, function (
      error,
      result
    ) {
      if (error) throw error;
      resolve({ ins: val, id_ins: result.insertId });
    });
  });
  return promesa;
}

//funcion para crear el archivo csv
function createFileCSV(nameFile, dataCsv, header) {
  const csvWriter = createCsvWriter({
    path: nameFile,
    header,
  });
  csvWriter
    .writeRecords(dataCsv) // returns a promise
    .then(() => {
      console.log("...Done");
    });
}
