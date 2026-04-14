const express = require("express");
const fs = require("fs");

const app = express();
app.use(express.json());
app.use(express.static("."));

let database = {};

if (fs.existsSync("data.json")) {
    database = JSON.parse(fs.readFileSync("data.json"));
}

function saveDatabase() {
    fs.writeFileSync("data.json", JSON.stringify(database, null, 2));
}

// API to run query
app.post("/query", (req, res) => {
    let query = req.body.query;
    let command = query.toUpperCase();

    try {

        // 🔥 CREATE
        if (command.startsWith("CREATE")) {
            let parts = query.split(" ");
            let tableName = parts[2].replace("(", "");

            let colsPart = query.substring(query.indexOf("(") + 1, query.indexOf(")"));
            let columns = colsPart.split(",").map(col => col.trim());

            database[tableName] = {
                columns: columns,
                rows: []
            };

            saveDatabase();
            return res.send({ result: "Table created: " + tableName });
        }

        // 🔥 INSERT
        else if (command.startsWith("INSERT")) {
            let tableName = query.split(" ")[2];
            let values = query.substring(query.indexOf("(") + 1, query.indexOf(")"))
                .split(",").map(v => v.trim());

            database[tableName].rows.push(values);

            saveDatabase();
            return res.send({ result: "Row inserted" });
        }

        // 🔥 SELECT + WHERE
        else if (command.startsWith("SELECT")) {
            let tableName = query.split(" ")[3];
            let table = database[tableName];

            if (!table) {
                return res.send({ result: "Table not found" });
            }

            if (command.includes("WHERE")) {
                let condition = query.split("WHERE")[1].trim();
                let [col, val] = condition.split("=");

                col = col.trim();
                val = val.trim();

                let colIndex = table.columns.indexOf(col);

                let filtered = table.rows.filter(row => row[colIndex] == val);

                return res.send({
                    columns: table.columns,
                    rows: filtered
                });
            }

            return res.send({
                columns: table.columns,
                rows: table.rows
            });
        }

        // 🔥 DELETE + WHERE
        else if (command.startsWith("DELETE")) {
            let tableName = query.split(" ")[2];
            let table = database[tableName];

            if (!table) {
                return res.send({ result: "Table not found" });
            }

            if (command.includes("WHERE")) {
                let condition = query.split("WHERE")[1].trim();
                let [col, val] = condition.split("=");

                col = col.trim();
                val = val.trim();

                let colIndex = table.columns.indexOf(col);

                table.rows = table.rows.filter(row => row[colIndex] != val);

                saveDatabase();
                return res.send({ result: "Row(s) deleted" });
            }

            table.rows = [];
            saveDatabase();
            return res.send({ result: "All rows deleted" });
        }

        // 🔥 UPDATE + WHERE
        else if (command.startsWith("UPDATE")) {
            let tableName = query.split(" ")[1];
            let table = database[tableName];

            if (!table) {
                return res.send({ result: "Table not found" });
            }

            let setPart = query.split("SET")[1].split("WHERE")[0].trim();
            let [setCol, setVal] = setPart.split("=");

            let condition = query.split("WHERE")[1].trim();
            let [col, val] = condition.split("=");

            let colIndex = table.columns.indexOf(col.trim());
            let setIndex = table.columns.indexOf(setCol.trim());

            table.rows.forEach(row => {
                if (row[colIndex] == val.trim()) {
                    row[setIndex] = setVal.trim();
                }
            });

            saveDatabase();
            return res.send({ result: "Row updated" });
        }

        // 🔥 DROP
        else if (command.startsWith("DROP")) {
            let tableName = query.split(" ")[2];

            delete database[tableName];

            saveDatabase();
            return res.send({ result: "Table dropped" });
        }

        else {
            return res.send({ result: "Invalid command" });
        }

    } catch (e) {
        return res.send({ result: "Error in query" });
    }
});


app.listen(3000, () => console.log("Server running on http://localhost:3000"));
