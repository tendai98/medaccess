const PROTOCOL = "http"
const OPD_DATA = "OPD-GENERAL-DISEASES-CONDITIONS"
const STI_DATA = "Sexually-Transmitted-Diseases"
const BAR_CHART = 'bar'
const API_URL = `${PROTOCOL}://${window.location.host}/api`
const MAX_INPUTS = 137

function loadUrl(url, token, origin){
    let nextUrl = `${PROTOCOL}://${window.location.host}/${url}?token=${token}&origin=${origin}`
    window.location.href = nextUrl
}

function renderDataGraphs(dataObject, dataSelector){

    let chartIds = ['chart1', 'chart2', 'chart3', 'chart4']
    let selectors = ['male', 'female']
    let elementCount = Object.keys(dataObject[0].conditions).length * 2
    let graphDataset = null
    let dataset1, dataset2, dataset3, dataset4
    let labels = Object.keys(dataObject[0].conditions)

    const subKey1 = "(Under 5 Years)"
    const subKey2 = "(5 Years and Over)"
    const subKey3 = "0 - 9 Years"
    const subKey4 = "10 - 24 Years"
    const subKey5 = "25 - 49 Years"
    const subKey6 = "50+ Years"

    function runOPDDataExtract(selector){
        let datasetA = new Uint32Array(elementCount)
        let datasetB = new Uint32Array(elementCount)
        let condition = null
        for(let itemIndex in dataObject){
            for (let labelIndex in labels){
                condition = dataObject[itemIndex].conditions[labels[labelIndex]]
                datasetA[labelIndex] += parseInt(condition[subKey1][selector])
                datasetB[labelIndex] += parseInt(condition[subKey2][selector])
            }
        }

        dataset1 = datasetA
        dataset2 = datasetB
    }

    function runSTIDataExtract(key){
        let datasetA = new Uint32Array(elementCount)
        let datasetB = new Uint32Array(elementCount)
        let datasetC = new Uint32Array(elementCount)
        let datasetD = new Uint32Array(elementCount)
        let condition = null
        for(let itemIndex in dataObject){
            for (let labelIndex in labels){
                condition = dataObject[itemIndex].conditions[labels[labelIndex]]
                datasetA[labelIndex] += parseInt(condition[subKey3][key])
                datasetB[labelIndex] += parseInt(condition[subKey4][key])
                datasetC[labelIndex] += parseInt(condition[subKey5][key])
                datasetD[labelIndex] += parseInt(condition[subKey6][key])
            }
        }

        dataset1 = datasetA
        dataset2 = datasetB
        dataset3 = datasetC
        dataset4 = datasetD
    }

    function buildOPDGraphDataset(){
        return {
            labels:labels, 
            datasets:[
                {
                    label:subKey1,
                    data:dataset1,
                    borderColor: 'rgba(255, 99, 132, 1)',
                    backgroundColor: 'rgba(255, 99, 132, 0.7)',
                    borderWidth: 1,
                },
                {
                    label:subKey2,
                    data:dataset2,
                    borderColor: 'rgba(54, 162, 235, 1)',
                    backgroundColor: 'rgba(54, 162, 235, 0.7)',
                    borderWidth: 1
                }
            ]
        }
    }

    

    function buildSTIGraphDataset(){

        return {
            labels:labels, 
            datasets:[
                {
                    label:subKey3,
                    data:dataset1,
                    borderColor: 'rgba(10, 172, 181, 1)',
                    backgroundColor: 'rgba(10, 172, 181, 0.5)',
                    borderWidth: 3,
                },
                {
                    label:subKey4,
                    data:dataset2,
                    borderColor: 'rgba(83, 11, 220, 1)',
                    backgroundColor: 'rgba(83, 11, 220, 0.5)',
                    borderWidth: 3
                },
                {
                    label:subKey5,
                    data:dataset3,
                    borderColor: 'rgba(0, 124, 255, 1)',
                    backgroundColor: 'rgba(0, 124, 255, 0.5)',
                    borderWidth: 3,
                },
                {
                    label:subKey6,
                    data:dataset4,
                    borderColor: 'rgba(189, 33, 48, 1)',
                    backgroundColor: 'rgba(189, 33, 48, 0.5)',
                    borderWidth: 3
                }
            ]
        }
    }

    function initDataRender(chartType, chartId, description, selector, titleSelector){

        switch(titleSelector){

            case OPD_DATA:
                console.warn(`[+] Render DataSet: [${OPD_DATA}]`)
                runOPDDataExtract(selector)
                description += ` (${selector.toUpperCase()}S)`
                graphDataset = buildOPDGraphDataset()
                renderGraphs(chartType,chartId, graphDataset, description)
                break

            case STI_DATA:
                console.warn(`[+] Render DataSet: [${STI_DATA}]`)
                runSTIDataExtract(selector)
                description += ` (${selector.toUpperCase()}S)`
                graphDataset = buildSTIGraphDataset()
                renderGraphs(chartType,chartId, graphDataset, description)
                break

        }

    }

    switch(dataSelector){
        case OPD_DATA:
            initDataRender(BAR_CHART, chartIds[0], dataObject[0].description, selectors[0], dataSelector)
            initDataRender(BAR_CHART, chartIds[1], dataObject[0].description, selectors[1], dataSelector)
            break;

        case STI_DATA:
            initDataRender(BAR_CHART, chartIds[2], dataObject[0].description, selectors[0], dataSelector)
            initDataRender(BAR_CHART, chartIds[3], dataObject[0].description, selectors[1], dataSelector)
            break;

    }

}

function renderDataGraph(dataObject, dataSelector){

    let chartIds = ['chart1', 'chart2', 'chart3', 'chart4']
    let selectors = ['male', 'female']
    let elementCount = Object.keys(dataObject.conditions).length * 2
    let graphDataset = null
    let origin = dataObject.origin
    let dataset1, dataset2, dataset3, dataset4
    let labels = Object.keys(dataObject.conditions)
    let headerElement = document.getElementById("header_text")
    headerElement.innerText = `(${origin.toUpperCase()})`

    const subKey1 = "(Under 5 Years)"
    const subKey2 = "(5 Years and Over)"
    const subKey3 = "0 - 9 Years"
    const subKey4 = "10 - 24 Years"
    const subKey5 = "25 - 49 Years"
    const subKey6 = "50+ Years"

    function runOPDDataExtract(selector){
        let datasetA = new Uint32Array(elementCount)
        let datasetB = new Uint32Array(elementCount)
        let condition = null

        for (let labelIndex in labels){
            condition = dataObject.conditions[labels[labelIndex]]
            datasetA[labelIndex] = parseInt(condition[subKey1][selector])
            datasetB[labelIndex] = parseInt(condition[subKey2][selector])
        }
        
        dataset1 = datasetA
        dataset2 = datasetB
    }

    function runSTIDataExtract(key){
        let datasetA = new Uint32Array(elementCount)
        let datasetB = new Uint32Array(elementCount)
        let datasetC = new Uint32Array(elementCount)
        let datasetD = new Uint32Array(elementCount)
        let condition = null

            for (let labelIndex in labels){
                condition = dataObject.conditions[labels[labelIndex]]
                datasetA[labelIndex] = parseInt(condition[subKey3][key])
                datasetB[labelIndex] = parseInt(condition[subKey4][key])
                datasetC[labelIndex] = parseInt(condition[subKey5][key])
                datasetD[labelIndex] = parseInt(condition[subKey6][key])
            }
        

        dataset1 = datasetA
        dataset2 = datasetB
        dataset3 = datasetC
        dataset4 = datasetD
    }

    function buildOPDGraphDataset(){
        return {
            labels:labels, 
            datasets:[
                {
                    label:subKey1,
                    data:dataset1,
                    borderColor: 'rgba(255, 99, 132, 1)',
                    backgroundColor: 'rgba(255, 99, 132, 0.7)',
                    borderWidth: 1,
                },
                {
                    label:subKey2,
                    data:dataset2,
                    borderColor: 'rgba(54, 162, 235, 1)',
                    backgroundColor: 'rgba(54, 162, 235, 0.7)',
                    borderWidth: 1
                }
            ]
        }
    }

    

    function buildSTIGraphDataset(){

        return {
            labels:labels, 
            datasets:[
                {
                    label:subKey3,
                    data:dataset1,
                    borderColor: 'rgba(10, 172, 181, 1)',
                    backgroundColor: 'rgba(10, 172, 181, 0.5)',
                    borderWidth: 3,
                },
                {
                    label:subKey4,
                    data:dataset2,
                    borderColor: 'rgba(83, 11, 220, 1)',
                    backgroundColor: 'rgba(83, 11, 220, 0.5)',
                    borderWidth: 3
                },
                {
                    label:subKey5,
                    data:dataset3,
                    borderColor: 'rgba(0, 124, 255, 1)',
                    backgroundColor: 'rgba(0, 124, 255, 0.5)',
                    borderWidth: 3,
                },
                {
                    label:subKey6,
                    data:dataset4,
                    borderColor: 'rgba(189, 33, 48, 1)',
                    backgroundColor: 'rgba(189, 33, 48, 0.5)',
                    borderWidth: 3
                }
            ]
        }
    }

    function initDataRender(chartType, chartId, description, selector, titleSelector){

        switch(titleSelector){

            case OPD_DATA:
                runOPDDataExtract(selector)
                description += ` (${selector.toUpperCase()}S)`
                graphDataset = buildOPDGraphDataset()
                renderGraphs(chartType,chartId, graphDataset, description)
                break

            case STI_DATA:
                runSTIDataExtract(selector)
                description += ` (${selector.toUpperCase()}S)`
                graphDataset = buildSTIGraphDataset()
                renderGraphs(chartType,chartId, graphDataset, description)
                break

        }

    }

    switch(dataSelector){
        case OPD_DATA:
            initDataRender(BAR_CHART, chartIds[0], dataObject.description, selectors[0], dataSelector)
            initDataRender(BAR_CHART, chartIds[1], dataObject.description, selectors[1], dataSelector)
            break;

        case STI_DATA:
            initDataRender(BAR_CHART, chartIds[2], dataObject.description, selectors[0], dataSelector)
            initDataRender(BAR_CHART, chartIds[3], dataObject.description, selectors[1], dataSelector)
            break;

    }

}


function renderGraphs(chartType, chartId, dataset, title){
    let ctx = $(`#${chartId}`);
    renderChart(chartType, chartId, ctx, dataset, title, chartId)
}

function appendHTMLList(targetId, data,target){
    let listObject = document.getElementById(`${targetId}_list`)
    let htmlCode = null
    let date = null
    let value = null
    data.forEach(timeStampId => {
        date = new Date(parseInt(timeStampId) * 1000).toString()
        value = date.substring(4, 24)
        htmlCode = `<a class="dropdown-item" href="#" onclick="getReport('${target}', '${value}', '${timeStampId}')">${value}</a>`
        listObject.innerHTML += htmlCode
    })
}

function getJSON(json){
    let header;

    switch(json.resp){
        case "auth":
            localStorage.setItem('sessionToken', json.args.token)
            header = json.args.data
            if(header){
                loadUrl(json.args.url, json.args.token, header)
            }else{
                loadUrl(json.args.url, json.args.token)
            }
            break

        case "deauth":
            localStorage.removeItem('sessionToken')
            loadUrl(json.args.url, json.args.token)
            break;

        case "access":
            header = json.args.data
            if(header){
                loadUrl(json.args.url, json.args.token, header)
            }else{
                loadUrl(json.args.url, json.args.token)
            }
            break;

        case "success":
            alert(json.args.errorMessage)
            loadUrl(json.args.url, json.args.token)
            break;

        case "collections":
            let targetList = json.args.target
            let data = null
            switch(targetList){
                case 'opd':
                    data = json.args.data
                    appendHTMLList(targetList, data, 'opd')
                    break;

                case 'sti':
                    data = json.args.data
                    appendHTMLList(targetList, data, 'sti')
                    break;

                default:
                    alert("Unknown Data")
            }
            break;

        case "query":
            let returnData = json.args.data
            let target = json.args.target
            switch(target){
                case 'opd':
                    renderDataGraph(returnData, json.args.data.description)
                    break;

                case 'sti':
                    renderDataGraph(returnData, json.args.data.description)
                    break;

                default:
                    alert("Unknown Data")
            }
            break

        case "data":
            let title = json.args.title
            switch(title){
                case OPD_DATA:
                    renderDataGraphs(json.args.data, title)
                    break;

                case STI_DATA:
                    renderDataGraphs(json.args.data, title)
                    break;
                
                default:
                    alert("Unknown Data")
            }
            break;

        case "tlv-response":
            let message = "Imminent OutBreak Detected\n\n"
            
            let entries = json.args.entries
            for (let key in entries){
                message += `${entries[key]}\n`
            }

            alert(message)
            break;
        
        case "error":
            alert(json.args.errorMessage)
            break;

        case "error-redirect":
            alert(json.args.errorMessage)
            loadUrl(json.args.url, null)
            break;

    }
}


function openPage(target){
    let token = localStorage.sessionToken
    let origin = window.location.href.split("&")[1].split("=")[1]
    let request = {command: target, args:{token: token, origin:origin}}
    $.post(API_URL, request, getJSON)
}


function packEntryData(){
    let jsonDataDocument = generateOPDJSONDocument()
    let entryKeys = Object.keys(jsonDataDocument.conditions)
    let index = 1
    const subKey1 = "(Under 5 Years)"
    const subKey2 = "(5 Years and Over)"
    entryKeys.forEach((key) => {

        jsonDataDocument.conditions[key][subKey1].male   = parseInt($(`#input_${index + 0}`).val())
        jsonDataDocument.conditions[key][subKey1].female = parseInt($(`#input_${index + 1}`).val())
        jsonDataDocument.conditions[key][subKey2].male   = parseInt($(`#input_${index + 2}`).val())
        jsonDataDocument.conditions[key][subKey2].female = parseInt($(`#input_${index + 3}`).val())
        index += 4
    })

    return jsonDataDocument
}

function packSTIData(){
    let jsonDataDocument = generateSTIJSONDocument()
    let entryKeys = Object.keys(jsonDataDocument.conditions)
    let index = 1

    const subKey1 = "0 - 9 Years"
    const subKey2 = "10 - 24 Years"
    const subKey3 = "25 - 49 Years"
    const subKey4 = "50+ Years"

    entryKeys.forEach((key) => {

        jsonDataDocument.conditions[key][subKey1].male   = parseInt($(`#input_${index + 0}`).val())
        jsonDataDocument.conditions[key][subKey1].female = parseInt($(`#input_${index + 1}`).val())
        jsonDataDocument.conditions[key][subKey2].male   = parseInt($(`#input_${index + 2}`).val())
        jsonDataDocument.conditions[key][subKey2].female = parseInt($(`#input_${index + 3}`).val())
        jsonDataDocument.conditions[key][subKey3].male   = parseInt($(`#input_${index + 4}`).val())
        jsonDataDocument.conditions[key][subKey3].female = parseInt($(`#input_${index + 5}`).val())
        jsonDataDocument.conditions[key][subKey4].male   = parseInt($(`#input_${index + 6}`).val())
        jsonDataDocument.conditions[key][subKey4].female = parseInt($(`#input_${index + 7}`).val())
    
        index += 8
    })

    return jsonDataDocument
}

function sendEntryData(){
    if(dataValidation(MAX_INPUTS)){
        let jsonDataDocument = packEntryData()
        let origin = window.location.href.split("&")[1].split("=")[1]
        let token = localStorage.sessionToken
        let query = {command: "data", args:{data:jsonDataDocument, token:token, origin:origin}}
        $.post(API_URL, query, getJSON)
    }else{
        alert("Validation Failed. Check your Inputs")
    }
}

function sendSTIData(){
    if(dataValidation(48)){
        let jsonDataDocument = packSTIData()
        let origin = window.location.href.split("&")[1].split("=")[1]
        let token = localStorage.sessionToken
        let query = {command: "data", args:{data:jsonDataDocument, token:token, origin:origin}}
        $.post(API_URL, query, getJSON)
    }else{
        alert("Validation Failed. Check your Inputs")
    }
}

function dataValidation(maxInputCount){

    let value = null

    for(let index = 1; maxInputCount > index; index++){
        try{
            value = parseInt($(`#input_${index}`).val())
            if(value >= 0 && 48000000001 > value ){
            }else{
                return false
            }
        }catch(e){
            return false
        }
    }

    return true
}

function generateOPDJSONDocument(){
    let entryDataObject = {
                description:"OPD-GENERAL-DISEASES-CONDITIONS",
                timestamp:0,
                conditions:{
                   "Immunisable Diseases":{
                        "(Under 5 Years)":{male:0, female:0},
                        "(5 Years and Over)":{male:0, female:0}
                    },

                    "Other Notifiable Diseases":{
                        "(Under 5 Years)":{male:0, female:0},
                        "(5 Years and Over)":{male:0, female:0}
                    },

                    "Diarrhoea (No Dehydration)":{
                        "(Under 5 Years)":{male:0, female:0},
                        "(5 Years and Over)":{male:0, female:0}
                    },           
                    
                    "Diarrhoea (No Dehydration)":{
                        "(Under 5 Years)":{male:0, female:0},
                        "(5 Years and Over)":{male:0, female:0}
                    },                   

                    "Diarrhoea (With Dehydration)":{
                        "(Under 5 Years)":{male:0, female:0},
                        "(5 Years and Over)":{male:0, female:0}
                    },                   

                    "Dysentery":{
                        "(Under 5 Years)":{male:0, female:0},
                        "(5 Years and Over)":{male:0, female:0}
                    }, 

                    "Nutritional Deficiences (Kwashiorkor)":{
                        "(Under 5 Years)":{male:0, female:0},
                        "(5 Years and Over)":{male:0, female:0}
                    },                   


                    "Nutritional Deficiences (Marasmus)":{
                        "(Under 5 Years)":{male:0, female:0},
                        "(5 Years and Over)":{male:0, female:0}
                    },    

                    "Nutritional Deficiences (Pellagra)":{
                        "(Under 5 Years)":{male:0, female:0},
                        "(5 Years and Over)":{male:0, female:0}
                    }, 
                    
                    "Malaria (Suspected Cases)":{
                        "(Under 5 Years)":{male:0, female:0},
                        "(5 Years and Over)":{male:0, female:0}
                    }, 

                    "Malaria (Suspected Cases Test by RDT or Blood Slide)":{
                        "(Under 5 Years)":{male:0, female:0},
                        "(5 Years and Over)":{male:0, female:0}
                    }, 

                    "Malaria (Confirmed Cased)":{
                        "(Under 5 Years)":{male:0, female:0},
                        "(5 Years and Over)":{male:0, female:0}
                    }, 

                    "Ear Condition":{
                        "(Under 5 Years)":{male:0, female:0},
                        "(5 Years and Over)":{male:0, female:0}
                    }, 

                    "Acute Respiratory Infections [Mild (Cough & Cold)]":{
                        "(Under 5 Years)":{male:0, female:0},
                        "(5 Years and Over)":{male:0, female:0}
                    }, 

                    "Acute Respiratory Infections [Moderate (Pneumonia)]":{
                        "(Under 5 Years)":{male:0, female:0},
                        "(5 Years and Over)":{male:0, female:0}
                    }, 

                    "Acute Respiratory Infections [Severe (Pneumonia)]":{
                        "(Under 5 Years)":{male:0, female:0},
                        "(5 Years and Over)":{male:0, female:0}
                    }, 
                
                    "Abortion":{
                        "(Under 5 Years)":{male:0, female:0},
                        "(5 Years and Over)":{male:0, female:0}
                    }, 

                    "Bilharzia":{
                        "(Under 5 Years)":{male:0, female:0},
                        "(5 Years and Over)":{male:0, female:0}
                    }, 

                    "Acute Mental Disorders":{
                        "(Under 5 Years)":{male:0, female:0},
                        "(5 Years and Over)":{male:0, female:0}
                    }, 

                    "Cataracts (Diseases of the Eye)":{
                        "(Under 5 Years)":{male:0, female:0},
                        "(5 Years and Over)":{male:0, female:0}
                    }, 

                    "Other Eye Diseases (Diseases of the Eye)":{
                        "(Under 5 Years)":{male:0, female:0},
                        "(5 Years and Over)":{male:0, female:0}
                    }, 

                    "Chicken Pox (Skin Diseases)":{
                        "(Under 5 Years)":{male:0, female:0},
                        "(5 Years and Over)":{male:0, female:0}
                    },
                    
                    "Herpes Zoster (Skin Diseases)":{
                        "(Under 5 Years)":{male:0, female:0},
                        "(5 Years and Over)":{male:0, female:0}
                    }, 

                    "Seabies (Skin Diseases)":{
                        "(Under 5 Years)":{male:0, female:0},
                        "(5 Years and Over)":{male:0, female:0}
                    }, 

                    "Other (Skin Diseases)":{
                        "(Under 5 Years)":{male:0, female:0},
                        "(5 Years and Over)":{male:0, female:0}
                    }, 

                    "Dental Conditions":{
                        "(Under 5 Years)":{male:0, female:0},
                        "(5 Years and Over)":{male:0, female:0}
                    }, 

                    "Burns and Scalds (Injuries)":{
                        "(Under 5 Years)":{male:0, female:0},
                        "(5 Years and Over)":{male:0, female:0}
                    }, 

                    "Road Traffic Accidents (Injuries)":{
                        "(Under 5 Years)":{male:0, female:0},
                        "(5 Years and Over)":{male:0, female:0}
                    }, 

                    "All other injuries (Injuries)":{
                        "(Under 5 Years)":{male:0, female:0},
                        "(5 Years and Over)":{male:0, female:0}
                    }, 

                    "Poisioning and Toxic Effects":{
                        "(Under 5 Years)":{male:0, female:0},
                        "(5 Years and Over)":{male:0, female:0}
                    }, 

                    "Disease 1 (Locally Monitored)":{
                        "(Under 5 Years)":{male:0, female:0},
                        "(5 Years and Over)":{male:0, female:0}
                    }, 

                    "Disease 2 (Locally Monitored)":{
                        "(Under 5 Years)":{male:0, female:0},
                        "(5 Years and Over)":{male:0, female:0}
                    }, 

                    "Disease 3 (Locally Monitored)":{
                        "(Under 5 Years)":{male:0, female:0},
                        "(5 Years and Over)":{male:0, female:0}
                    }, 

                    "All Other Diseases":{
                        "(Under 5 Years)":{male:0, female:0},
                        "(5 Years and Over)":{male:0, female:0}
                    }, 

                    "Total New Diseases / Conditions":{
                        "(Under 5 Years)":{male:0, female:0},
                        "(5 Years and Over)":{male:0, female:0}
                    }, 

                    "Repeat Visits":{
                        "(Under 5 Years)":{male:0, female:0},
                        "(5 Years and Over)":{male:0, female:0}
                    },

                    "Referals Outs":{
                        "(Under 5 Years)":{male:0, female:0},
                        "(5 Years and Over)":{male:0, female:0}
                    }
            }
    }      

    return entryDataObject
}

function generateSTIJSONDocument(){
    let dataObject = {
        description:"Sexually-Transmitted-Diseases",
        timestamp:0,   
        conditions:{

            "Urethal / Vaginal Discharge":{
                "0 - 9 Years":{male:0, female:0},
                "10 - 24 Years":{male:0, female:0},
                "25 - 49 Years":{male:0, female:0},
                "50+ Years":{male:0, female:0}
            },

            "Genital Ulcers":{
                "0 - 9 Years":{male:0, female:0},
                "10 - 24 Years":{male:0, female:0},
                "25 - 49 Years":{male:0, female:0},
                "50+ Years":{male:0, female:0}
            },

            "PID":{
                "0 - 9 Years":{male:0, female:0},
                "10 - 24 Years":{male:0, female:0},
                "25 - 49 Years":{male:0, female:0},
                "50+ Years":{male:0, female:0}
            },

            "Ophthalmia Neonatorum":{
                "0 - 9 Years":{male:0, female:0},
                "10 - 24 Years":{male:0, female:0},
                "25 - 49 Years":{male:0, female:0},
                "50+ Years":{male:0, female:0}
            },

            "Other Forms of STI":{
                "0 - 9 Years":{male:0, female:0},
                "10 - 24 Years":{male:0, female:0},
                "25 - 49 Years":{male:0, female:0},
                "50+ Years":{male:0, female:0}
            },

            "Repeat STI Visits":{
                "0 - 9 Years":{male:0, female:0},
                "10 - 24 Years":{male:0, female:0},
                "25 - 49 Years":{male:0, female:0},
                "50+ Years":{male:0, female:0}
            },


        }
    }

    return dataObject
}




function getTargetData(collection, timestamp){
    switch(collection){
        case 'opd':
            queryTargetDocument(OPD_DATA, timestamp, 'opd')
            break

        case 'sti':
            queryTargetDocument(STI_DATA, timestamp, 'sti')
            break
    }
}

function getReport(mainDataSource, target, timestamp){
    let mainHeader = document.getElementById(`${mainDataSource}_main_header`)
    mainHeader.innerHTML = `<b>Report Data as of ${target}</b>`
    getTargetData(mainDataSource, timestamp)
}

function getCollections(query, target){
    let token = localStorage.sessionToken
    let apiQuery = {command: "collections", args:{query:query, token:token, target:target}}
    $.post(API_URL, apiQuery, getJSON)
}

function tlvCheck(){
    let token = localStorage.sessionToken
    let apiQuery = {command: "check-tlv", args:{token:token}}
    $.post(API_URL, apiQuery, getJSON)
}

getCollections(OPD_DATA, 'opd')
getCollections(STI_DATA, 'sti')