/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 99.26096997690532, "KoPercent": 0.7390300230946882};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.9926096997690531, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "GoToHome_SendCom"], "isController": false}, {"data": [1.0, 500, 1500, "GoToGuestBook_ClearBook"], "isController": false}, {"data": [1.0, 500, 1500, "PostComent_SendCom"], "isController": false}, {"data": [1.0, 500, 1500, "GetGuestBook_SendCom"], "isController": false}, {"data": [1.0, 500, 1500, "GoToGuestBook_SendCom"], "isController": false}, {"data": [1.0, 500, 1500, "GetGuestBook__ClearBook"], "isController": false}, {"data": [0.9526627218934911, 500, 1500, "Update_SendCom"], "isController": false}, {"data": [1.0, 500, 1500, "DELETE FROM BOOK"], "isController": false}, {"data": [1.0, 500, 1500, "GoToClient_SendCom"], "isController": false}, {"data": [1.0, 500, 1500, "GoToHome_ClearBook"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 2165, 16, 0.7390300230946882, 11.473441108545035, 2, 174, 7.0, 17.40000000000009, 29.0, 94.72000000000116, 5.966899554894098, 45.743378748260234, 2.776744250141249], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["GoToHome_SendCom", 368, 0, 0.0, 11.516304347826079, 4, 54, 11.0, 18.0, 19.0, 25.24000000000001, 1.0142490973734255, 22.412527905630736, 0.45958162224733345], "isController": false}, {"data": ["GoToGuestBook_ClearBook", 5, 0, 0.0, 5.2, 4, 6, 5.0, 6.0, 6.0, 6.0, 0.015624707036743062, 0.06274296419442137, 0.007171496393817617], "isController": false}, {"data": ["PostComent_SendCom", 360, 0, 0.0, 12.43611111111111, 3, 164, 5.0, 25.700000000000443, 71.84999999999997, 136.81999999999948, 1.0748996013913978, 0.2876196199035576, 0.8414127698445873], "isController": false}, {"data": ["GetGuestBook_SendCom", 360, 0, 0.0, 10.361111111111112, 2, 121, 5.0, 21.0, 63.64999999999992, 90.77999999999997, 1.0748963919311112, 5.4349594609170655, 0.33695482598621745], "isController": false}, {"data": ["GoToGuestBook_SendCom", 360, 0, 0.0, 10.10833333333332, 3, 32, 9.0, 16.0, 18.0, 21.389999999999986, 1.0748771355718645, 4.316303497530768, 0.49335181027224245], "isController": false}, {"data": ["GetGuestBook__ClearBook", 5, 0, 0.0, 9.4, 3, 24, 5.0, 24.0, 24.0, 24.0, 0.015623828212884033, 0.167730340146364, 0.004897703961265405], "isController": false}, {"data": ["Update_SendCom", 338, 16, 4.733727810650888, 11.547337278106497, 2, 135, 5.0, 29.100000000000023, 55.0, 104.61000000000001, 1.0152223276825298, 8.296088099446733, 0.3331198262708301], "isController": false}, {"data": ["DELETE FROM BOOK", 4, 0, 0.0, 52.25, 11, 174, 12.0, 174.0, 174.0, 174.0, 0.01666680555671297, 1.668308173401445E-4, 0.0], "isController": false}, {"data": ["GoToClient_SendCom", 360, 0, 0.0, 12.475000000000003, 4, 33, 12.0, 18.0, 19.0, 27.16999999999996, 1.0748161616523506, 6.439450343493332, 0.4891253235644487], "isController": false}, {"data": ["GoToHome_ClearBook", 5, 0, 0.0, 16.0, 5, 54, 7.0, 54.0, 54.0, 54.0, 0.01563276753136715, 0.3454475231443123, 0.0070835977876507385], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /&lt;b&gt;Эльдорадо&lt;\\\\/b&gt;: 'Вы превзошли все ожидания, молодцы!'&lt;br&gt;/", 1, 6.25, 0.046189376443418015], "isController": false}, {"data": ["Test failed: text expected to contain /&lt;b&gt;ДжиИ Мани Банк&lt;\\\\/b&gt;: 'ЕЩЩЩКЕЕЕЕЕРРЕЕЕЕЕ'&lt;br&gt;/", 1, 6.25, 0.046189376443418015], "isController": false}, {"data": ["Test failed: text expected to contain /&lt;b&gt;МТС Банк&lt;\\\\/b&gt;: 'Самая надежная компания, рекомендую всем!'&lt;br&gt;/", 1, 6.25, 0.046189376443418015], "isController": false}, {"data": ["Response was null", 5, 31.25, 0.23094688221709006], "isController": false}, {"data": ["Test failed: text expected to contain /&lt;b&gt;Спутник&lt;\\\\/b&gt;: 'Самая надежная компания, рекомендую всем!'&lt;br&gt;/", 1, 6.25, 0.046189376443418015], "isController": false}, {"data": ["Test failed: text expected to contain /&lt;b&gt;ДжиИ Мани Банк&lt;\\\\/b&gt;: 'Спасибо!'&lt;br&gt;/", 1, 6.25, 0.046189376443418015], "isController": false}, {"data": ["Test failed: text expected to contain /&lt;b&gt;Мегафон&lt;\\\\/b&gt;: 'Благодарю за отличную работу!'&lt;br&gt;/", 1, 6.25, 0.046189376443418015], "isController": false}, {"data": ["Test failed: text expected to contain /&lt;b&gt;Газпромбанк&lt;\\\\/b&gt;: 'Рекомендую, это лучшая компания на свете Отличные ребята.'&lt;br&gt;/", 1, 6.25, 0.046189376443418015], "isController": false}, {"data": ["Test failed: text expected to contain /&lt;b&gt;Райффайзенбанк&lt;\\\\/b&gt;: 'Рекомендую, это лучшая компания на свете Отличные ребята.'&lt;br&gt;/", 1, 6.25, 0.046189376443418015], "isController": false}, {"data": ["Test failed: text expected to contain /&lt;b&gt;Ренессанс Жизнь&lt;\\\\/b&gt;: 'Благодарю за отличную работу!'&lt;br&gt;/", 1, 6.25, 0.046189376443418015], "isController": false}, {"data": ["Test failed: text expected to contain /&lt;b&gt;Центральный банк РФ&lt;\\\\/b&gt;: 'Спасибо!'&lt;br&gt;/", 1, 6.25, 0.046189376443418015], "isController": false}, {"data": ["Test failed: text expected to contain /&lt;b&gt;Хоум Кредит энд Финанс Банк&lt;\\\\/b&gt;: 'Привет! Я все выяснил по твоей просьбе: значит запись на лечение геморроя проводится по пятницам с 8:00 кабинет №13. Извини что в гостевой пишу, у меня что-то личка тормозит. Всегда рад помочь.'&lt;br&gt;/", 1, 6.25, 0.046189376443418015], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 2165, 16, "Response was null", 5, "Test failed: text expected to contain /&lt;b&gt;Спутник&lt;\\\\/b&gt;: 'Самая надежная компания, рекомендую всем!'&lt;br&gt;/", 1, "Test failed: text expected to contain /&lt;b&gt;Эльдорадо&lt;\\\\/b&gt;: 'Вы превзошли все ожидания, молодцы!'&lt;br&gt;/", 1, "Test failed: text expected to contain /&lt;b&gt;ДжиИ Мани Банк&lt;\\\\/b&gt;: 'Спасибо!'&lt;br&gt;/", 1, "Test failed: text expected to contain /&lt;b&gt;Мегафон&lt;\\\\/b&gt;: 'Благодарю за отличную работу!'&lt;br&gt;/", 1], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Update_SendCom", 338, 16, "Response was null", 5, "Test failed: text expected to contain /&lt;b&gt;Спутник&lt;\\\\/b&gt;: 'Самая надежная компания, рекомендую всем!'&lt;br&gt;/", 1, "Test failed: text expected to contain /&lt;b&gt;Эльдорадо&lt;\\\\/b&gt;: 'Вы превзошли все ожидания, молодцы!'&lt;br&gt;/", 1, "Test failed: text expected to contain /&lt;b&gt;ДжиИ Мани Банк&lt;\\\\/b&gt;: 'Спасибо!'&lt;br&gt;/", 1, "Test failed: text expected to contain /&lt;b&gt;Мегафон&lt;\\\\/b&gt;: 'Благодарю за отличную работу!'&lt;br&gt;/", 1], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
