let history = [];

async function runQuery() {
    let inputBox = document.getElementById("query");
    let query = inputBox.value;

    if (!query.trim()) return;

    // 🔥 store history
    history.unshift(query);

    updateHistoryUI();

    let res = await fetch("/query", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ query })
    });

    let data = await res.json();

    if (data.columns && data.rows) {
        displayTable(data.columns, data.rows);
    } else {
        document.getElementById("output").innerText = data.result;
    }

    // ❌ DO NOT clear input now
}

function updateHistoryUI() {
    let list = document.getElementById("historyList");
    list.innerHTML = "";

    history.forEach(cmd => {
        let li = document.createElement("li");
        li.innerText = cmd;

        li.onclick = () => {
            document.getElementById("query").value = cmd;
        };

        list.appendChild(li);
    });
}


function displayTable(columns, rows) {
    let html = "<table><tr>";

    // headers
    columns.forEach(col => {
        html += `<th>${col}</th>`;
    });
    html += "</tr>";

    // rows
    rows.forEach(row => {
        html += "<tr>";
        row.forEach(cell => {
            html += `<td>${cell}</td>`;
        });
        html += "</tr>";
    });

    html += "</table>";

    document.getElementById("output").innerHTML = html;
}
