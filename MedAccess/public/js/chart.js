let charts = {
      'chart1':null,
      'chart2':null,
      'chart3':null,
      'chart4':null
    }

function queryAllData(collection){
    let token = localStorage.sessionToken
    let query = {command:"query-all", args:{token:token, query:collection}}
    $.post(API_URL, query, getJSON)
}

function queryTargetDocument(collection, doc, target){
  let token = localStorage.sessionToken
  let query = {command:"target-query", args:{token:token, collection:collection, doc:doc, target:target}}
  $.post(API_URL, query, getJSON)
}

function renderChart(chartType, chartIdText, context, data, title, id){

    $(`#${chartIdText}_title`).text(title)


    if(charts[id]){
      charts[id].destroy();
    }
      charts[id] = new Chart(context, {
          type: chartType,
          data: data,
          options: {
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                },
                title: {
                  display: true,
                  text: ''
                }
              }
          }
      });
}




queryAllData(OPD_DATA)
queryAllData(STI_DATA)