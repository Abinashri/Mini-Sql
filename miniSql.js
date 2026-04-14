const readline = require("readline");
const fs = require("fs");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Load database from file
let database = {};

if (fs.existsSync("data.json")) {
    let data = fs.readFileSync("data.json", "utf-8");
    database = JSON.parse(data);
}

console.log("Mini SQL Compiler Started");

// Save function
function saveDatabase() {
    fs.writeFileSync("data.json", JSON.stringify(database, null, 2));
}

function createTable(query) {
    let parts = query.split(" ");
    let tableName = parts[2];

    let colsPart = query.substring(query.indexOf("(") + 1, query.indexOf(")"));
    let columns = colsPart.split(",").map(col => col.trim());

    database[tableName] = {
        columns: columns,
        rows: []
    };

    saveDatabase(); // ✅ correct place
    console.log("Table created:", tableName);
}

function insertRow(query) {
    let parts = query.split(" ");
    let tableName = parts[2];

    if (!database[tableName]) {
        console.log("Table not found");
        return;
    }

    let valuesPart = query.substring(query.indexOf("(") + 1, query.indexOf(")"));
    let values = valuesPart.split(",").map(val => val.trim());

    database[tableName].rows.push(values);

    saveDatabase(); // ✅ correct place
    console.log("Row inserted into", tableName);
}

function selectAll(query) {
    let parts = query.split(" ");
    let tableName = parts[3];

    if (!database[tableName]) {
        console.log("Table not found");
        return;
    }

    let table = database[tableName];

    console.log("Data from table:", tableName);
    console.log(table.columns.join(" | "));

    // 🔥 check for WHERE
    if (query.includes("WHERE")) {

        let condition = query.split("WHERE")[1].trim(); // id=1
        let [col, val] = condition.split("=");

        col = col.trim();
        val = val.trim();

        let colIndex = table.columns.indexOf(col);

        table.rows.forEach(row => {
            if (row[colIndex] == val) {
                console.log(row.join(" | "));
            }
        });

    } else {
        // normal SELECT
        table.rows.forEach(row => {
            console.log(row.join(" | "));
        });
    }
}


function deleteRows(query) {
    let parts = query.split(" ");
    let tableName = parts[2];

    if (!database[tableName]) {
        console.log("Table not found");
        return;
    }

    database[tableName].rows = [];

    saveDatabase(); // ✅ correct place
    console.log("All rows deleted from", tableName);
}

function updateRow(query) {
    let parts = query.split(" ");
    let tableName = parts[1];

    if (!database[tableName]) {
        console.log("Table not found");
        return;
    }

    let table = database[tableName];

    // SET part
    let setPart = query.split("SET")[1].split("WHERE")[0].trim();
    let [setCol, setVal] = setPart.split("=");

    setCol = setCol.trim();
    setVal = setVal.trim();

    // WHERE part
    let condition = query.split("WHERE")[1].trim();
    let [col, val] = condition.split("=");

    col = col.trim();
    val = val.trim();

    let colIndex = table.columns.indexOf(col);
    let setIndex = table.columns.indexOf(setCol);

    table.rows.forEach(row => {
        if (row[colIndex] == val) {
            row[setIndex] = setVal;
        }
    });

    saveDatabase(); // important

    console.log("Row updated in", tableName);
}

function dropTable(query) {
    let parts = query.split(" ");
    let tableName = parts[2];

    if (!database[tableName]) {
        console.log("Table not found");
        return;
    }

    delete database[tableName];

    saveDatabase();

    console.log("Table dropped:", tableName);
}

function deleteRows(query) {
    let parts = query.split(" ");
    let tableName = parts[2];

    if (!database[tableName]) {
        console.log("Table not found");
        return;
    }

    let table = database[tableName];

    // 🔥 check for WHERE
    if (query.includes("WHERE")) {

        let condition = query.split("WHERE")[1].trim();
        let [col, val] = condition.split("=");

        col = col.trim();
        val = val.trim();

        let colIndex = table.columns.indexOf(col);

        if (colIndex === -1) {
            console.log("Column not found");
            return;
        }

        // filter rows
        table.rows = table.rows.filter(row => row[colIndex] != val);

        console.log("Row(s) deleted with condition");

    } else {
        // delete all rows
        table.rows = [];
        console.log("All rows deleted from", tableName);
    }

    saveDatabase();
}


function start() {
    rl.question("Enter SQL command: ", (query) => {

        let command = query.toUpperCase();
    
        if (command.startsWith("CREATE")) {
            createTable(query);
        }
        else if (command.startsWith("INSERT")) {
            insertRow(query);
        }
        else if (command.startsWith("SELECT")) {
            selectAll(query);
        }
        else if (command.startsWith("DELETE")) {
            deleteRows(query);
        }
        else if (command.startsWith("UPDATE")) {
            updateRow(query);
        }
        else if (command.startsWith("DROP")) {
            dropTable(query);
        }
        else if (command === "EXIT") {
            console.log("Exiting...");
            rl.close();
            return;
        }
        else {
            console.log("Invalid command");
        }
    
        start();
    });
    
}

start();
