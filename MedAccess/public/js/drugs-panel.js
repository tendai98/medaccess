const MAX_ITEMS = 12
const START_INDEX = 1;

function checkSelectedItems(){

    let items = []
    let item = null
    let check = null

    for (let i = START_INDEX; MAX_ITEMS >= i; i++){
        check = document.getElementById(`item_select_${i}`).checked
        if(check){
            items.push(i)
        }
    }

    return items
}

function runOperation(){

    let selectedItems = checkSelectedItems()

    if(selectedItems.length == 0){
        alert("No items selected")
    }
    else if(selectedItems.length > 0){
        let state = confirm("Continue with Dispense operation?")
        if(state){
            let token = localStorage.sessionToken
            let origin = window.location.href.split("&")[1].split("=")[1]
            let query = {command:"dispense", args:{token:token, origin:origin}}
            $.post(API_URL, query, getJSON)
        }
    }
    else{
        alert("Cancelled")
    }
}