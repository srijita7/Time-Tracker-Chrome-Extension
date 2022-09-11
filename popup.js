let showTableBtn = document.getElementById('btnShowTable');
let clearTimesBtn = document.getElementById('btnClearTimes');
let errorMessageElement = document.getElementById('errorMessage');
let timeTable = document.getElementById('timeTable');
clearTimesBtn.onclick = function(element) {
    chrome.storage.local.set({ "tabTimeObject": "{}" }, function () { });
}

showTableBtn.onclick = function(element) {
    chrome.storage.local.get("tabTimeObject", function (dataCont) {
        console.log("data content : "+JSON.stringify(dataCont));
        let dataString = dataCont["tabTimeObject"];
        if (dataString == null)
            return;
        try {
            let data = JSON.parse(dataString);
            var rowCount = timeTable.rows.length;
            for (var x = rowCount - 1; x >= 0; x--) {
                timeTable.deleteRow(x);
            }
            let entries = [];
            for (var key in data) {
                if (data.hasOwnProperty(key)) {
                    entries.push(data[key]);
                }
            }
            entries.sort(function (e1, e2) {
                let e15 = e1["trackedSeconds"];
                let e25 = e2["trackedSeconds"];
                if (isNaN(e15) || isNaN(e25)) return 0;
                if (e15 > e25) return 1;
                else if (e15 < e25) return -1;
                return 0;
            });
            entries.map(function (urlObject) {
                let newRow = timeTable.insertRow(0);
                let cellHostName = newRow.insertCell(0);
                let cellTimeMinutes = newRow.insertCell(1);
                let cellTime = newRow.insertCell(2);
                let cellLastDate = newRow.insertCell(3);
                let cellFirstDate = newRow.insertCell(4);
                cellHostName.innerHTML = urlObject["url"];
                let time_ = urlObject["trackedSeconds"] != null ? urlObject["trackedSeconds"] : 0;
                cellTime.innerHTML = Math.round(time_);
                cellTimeMinutes.innerHTML = (time_ / 60).toFixed(2);
                let date = new Date();
                
                date.setTime(urlObject["lastDateVal"] != null ? urlObject["lastDateVal"] : 0);
                cellLastDate.innerHTML=date.toUTCString();

            });
            let headerRow = timeTable.insertRow(0);
            headerRow.insertCell(0).innerHTML = "url";
            headerRow.insertCell(1).innerHTML = "Minutes";
            headerRow.insertCell(2).innerHTML = "Tracked Seconds";
            headerRow.insertCell(3).innerHTML = "Last Date";
        }
        catch (err) {
            const message = "loading the tabTimeObject went wrong : " + err.toString();
            console.error(message);
            errorMessageElement.innerText = message;
            errorMessageElement.innerText = dataString;
        }
    });
}