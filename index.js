const Fs = require("fs");
const readXlsxFile = require("read-excel-file/node");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const CsvReadableStream = require("csv-reader");
const mysql = require("mysql");

// coneccion a base de datos
const con = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "",
  database: "valle_magico",
});
//readXlsx("institucion.xlsx");

// lectura de archivo .xlsx de una sola fila, si hay mas filas cambiar el codigo.
function readXlsx(path) {
  readXlsxFile(path).then((rows) => {
    console.log(rows.map((val) => val[0]));

    insertArray(rows.map((val) => val[0]));
  });
}

//readXlsxSedes("sede.xlsx");

function readXlsxSedes(path) {
  readXlsxFile(path).then((rows) => {
    //console.log(rows.map((val) => val));
    insertArraySede(rows);
  });
}

readXlsxUsers("recomendations.xlsx");

function readXlsxUsers(path) {
  console.log("gg");

  readXlsxFile(path).then((rows) => {
    console.log(rows);
    insertArrayUsers(rows);
  });
}

//readCsv("institution_id.csv");

async function readCsv(path) {
  let inputStream = Fs.createReadStream(path, "utf8");
  let institution = [];
  inputStream
    .pipe(
      new CsvReadableStream({
        parseNumbers: true,
        parseBooleans: true,
        trim: true,
      })
    )
    .on("data", function (row) {
      //insertOneData(row);
      institution.push(row);
    })
    .on("end", function (data) {
      console.log("No more rows!");
      console.log(institution);
    });
}

// funcion para insertar los datos de un arreglo a la base de datos
async function insertArrayUsers(rows) {
  //console.log(rows);
  let arraydb = await rows.map((val, i) => {
    return querySQLUsers(val, i).then((resolve) => resolve);
  });

  //console.log(arraydb);
  con.end();
  /* Promise.all(arraydb).then((resolve) =>
    createFileCSV("user_id_dissabilitye.csv", resolve, [
      { id: "user_id", title: "USER_ID" },
      { id: "id_user_dis", title: "ID_USER_DIS" },
      { id: "id_dissabilitye", title: "ID_DISSABILITYE" },
    ])
  ); */
}
// funcion para insertar los datos de un arreglo a la base de datos
async function insertArraySede(rows) {
  //console.log(rows);
  let arraydb = await rows.map((val) => {
    return querySQLSede(val).then((resolve) => resolve);
  });

  //console.log(arraydb);
  con.end();
  Promise.all(arraydb).then((resolve) =>
    createFileCSV("sede_id.csv", resolve, [
      { id: "sede", title: "SEDE" },
      { id: "id_sede", title: "ID_SEDE" },
      { id: "id_ins", title: "ID_INS" },
      { id: "id_munic", title: "ID_MUNI" },
    ])
  );
}
// funcion para insertar los datos de un arreglo a la base de datos
async function insertArraySede(rows) {
  //console.log(rows);
  let arraydb = await rows.map((val) => {
    return querySQLSede(val).then((resolve) => resolve);
  });

  //console.log(arraydb);
  con.end();
  Promise.all(arraydb).then((resolve) =>
    createFileCSV("sede_id.csv", resolve, [
      { id: "sede", title: "SEDE" },
      { id: "id_sede", title: "ID_SEDE" },
      { id: "id_ins", title: "ID_INS" },
      { id: "id_munic", title: "ID_MUNI" },
    ])
  );
}

// funcion para insertar los datos de un arreglo a la base de datos
async function insertArray(rows) {
  console.log(rows);
  let arraydb = await rows.map((val) => {
    //return querySQL(val).then((resolve) => resolve);
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

// ejecucion del la insertcion a la base de datos
async function querySQLUsers(val, i) {
  /* console.log(
    `INSERT INTO recomendations (id,performance_id, subject_id, hierarchy_id, grade_id, recomendation, created_at, updated_at) VALUES (${i},${val[3]},${val[2]},${val[0]},${val[1]},${val[4]},'2020-02-26 16:06:24','2020-02-26 16:06:24')`
  ); */

  let promesa = await new Promise((resolve, reject) => {
    con.query(
      `INSERT INTO recomendations ( performance_id, subject_id, hierarchy_id, grade_id, recomendation, created_at, updated_at) VALUES ('${val[3]}','${val[2]}','${val[0]}','${val[1]}','${val[4]}', '2020-02-26 16:06:24', '2020-02-26 16:06:24')`,
      function (error, result) {
        if (error) throw error;
        resolve({
          id_user_dis: result.insertId,
          user_id: val[0],
          id_dissabilitye: val[1],
        });
      }
    );
  });
  return promesa;
}

// ejecucion del la insertcion a la base de datos
async function querySQLSede(val) {
  console.log(
    `INSERT INTO headquarters (name, town_id, institution_id) VALUES ( '${val[0]}', ${val[1]}, ${val[2]} )`
  );

  let promesa = await new Promise((resolve, reject) => {
    con.query(
      `INSERT INTO headquarters (name, town_id, institution_id) VALUES ( '${val[0]}', ${val[1]}, ${val[2]} )`,
      function (error, result) {
        if (error) throw error;
        resolve({
          sede: val[0],
          id_sede: result.insertId,
          id_ins: val[2],
          id_munic: val[1],
        });
      }
    );
  });
  return promesa;
}
// ejecucion del la insertcion a la base de datos
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

// funcion para crear el archivo csv
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
