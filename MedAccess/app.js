const express = require('express')
const crypto = require('crypto')
const firebase = require('./firebase')
const mailer = require('./mailer')
const APP_SETTINGS = require('./config.json')

const app = express()
const SERVER_PORT = process.env.PORT || APP_SETTINGS.port
const TOKEN_LIFE_SPAN = APP_SETTINGS.tokenLifeSpan
const HASH_ALGORITHM = APP_SETTINGS.hashAlgorithm
const STATIC_FILES = APP_SETTINGS.staticFilesPath

function generateToken(){
	let hash = ""
	let randomNumber = Math.random().toString()
	hash = crypto.createHash(HASH_ALGORITHM).update(randomNumber).digest("hex")
	return hash
}

function hashPassword(password){
	let hash = crypto.createHash(HASH_ALGORITHM).update(password).digest("hex")
	return hash
}

function sendErrorMessage(res, msg){
	response = {resp:"error", args:{errorMessage:msg}}
	res.json(response)
}

function sendCLIErrorMessage(res, msg){
	response = {resp:"error", errorMessage:msg}
	res.json(response)	
}

function sendMessage(res, msg, data){
	data.errorMessage = msg
	data.resp = "error"
	res.json(data)	
}


function boostTokenLife(token){
	if(token){
		firebase.database.ref("sessions").child(token).child('timestamp').set(getTimestamp())
	}
}

function runVerifiedDataUpload(res, token , entry, origin){
	let ref = firebase.database.ref("sessions").child(token)
	ref.on("value", (snapshot)=>{
		try{
			let storedToken = snapshot.val()
			let timeDifference = getTimestamp() - storedToken.timestamp

			if(timeDifference >= TOKEN_LIFE_SPAN){
				ref.off()
				ref.remove()
				response = {resp:"error-redirect", args:{errorMessage:"Session Exprired", url:"index.html"}}
				res.json(response)
			}else{
				ref.off()
				let timestamp = entry.timestamp
				entry.origin = origin
				firebase.firestore.collection(entry.description).doc(timestamp.toString()).set(entry).then((d)=>{

					response = {resp:"success", args:{errorMessage:"Data Upload Success", url:"select.html", token:token}}
					res.json(response)
					
					})
			}
		}catch(e){
				response = {resp:"error-redirect", args:{errorMessage:"Error on Data Upload", url:"index.html"}}
				res.json(response)
		}
	})
}

function authUser(args, respJSON, res){

	let password = hashPassword(args.passwd)

	try{
		firebase.database.ref("sessions").child(respJSON.args.token).set({user:args.user, timestamp: respJSON.args.timestamp})
		firebase.database.ref("logins").child(getTimestamp()).set({user:args.user, token:respJSON.args.token})

		firebase.firestore.collection('users').doc(args.user).get().then((data)=>{
			try{
				let user = data.data()
				if(password === user.password && user.type === "admin"){
					respJSON.args.url = "dash.html"
					res.json(respJSON)
				}else if(password === user.password){
					respJSON.args.url = "select.html"
					respJSON.args.data = user.clinic
					res.json(respJSON)
				}else{
					sendErrorMessage(res, "Invalid username or password")
				}
			}catch(e){
				sendErrorMessage(res, "Invalid username or password")				
			}
		})
	}catch(e){
		sendErrorMessage(res, "Invalid username or password")
	}
}

function authAdminUser(args, res){
	let password = hashPassword(args.password)

	try{
		firebase.database.ref("logins-admins").child(getTimestamp()).set({user:args.username})

		firebase.firestore.collection('users').doc(args.username).get().then((data)=>{
			try{
				let storedPassword = data.data().password
				let accountType = data.data().type
				if(password === storedPassword && accountType === "admin" ){
					sendCLIErrorMessage(res, "Success")
				}else{
					sendCLIErrorMessage(res, "Invalid Username or Password")
				}
			}catch(e){
				console.log(e)
				sendCLIErrorMessage(res, "Invalid Username or Password")			
			}
		})
	}catch(e){
		console.log(e)
		sendCLIErrorMessage(res, "Error has occured")
	}
}

function getTimestamp(){
	let date = new Date()
	return Math.floor(date / 1000)
}


function api(req, res){

	let request = req.body
	let token, origin
	let response = null
	switch(request['command']){

		case 'auth':
			try{
				let accessToken = generateToken()
				response = {resp: "auth", args:{token:accessToken, timestamp:getTimestamp()}}
				authUser(request['args'], response, res)
			}catch(e){
				sendErrorMessage(res, "An error has occurred [1]")
			}
			break;

		case 'check-tlv':

			try{

				let token = request.args.token
				let ref = firebase.database.ref()

				ref.child('tlv').on('value', snapshot => {

					let data = {}
					try{

						let value = parseInt(snapshot.val())
						data.entry1 = "Cholera"
						data.entry2 = "Malaria"
						response = {resp: "tlv-response", args:{ value:value, entries:data }}
						res.json(response)
						
					}catch(e){
						sendErrorMessage(res, "An error has occurred [2]")
					}

					boostTokenLife(token)
					ref.off()
				})

			}catch(e){
				sendErrorMessage(res, "An error has occurred [3] ")
			}
			break;


		case 'deauth':
			try{
				let body = req.body
				token = body.args.token
				firebase.database.ref("sessions").child(token).remove()
				response = {resp:"deauth", args:{url:"index.html"}}
				res.json(response)
			}catch(e){
				sendErrorMessage(res, "An error has occurred [4]")
			}
			break;

		case 'dash':
			try{
				token = req.body.args.token
				let ref = firebase.database.ref().child('sessions').child(token)

				ref.on('value', snapshot =>{
					let user = snapshot.val().user
					if(user){
						firebase.firestore.collection('users').doc(user).get().then(data => {
							let clinic = data.data().clinic
							response = {resp:"access", args:{url:"dash.html", token:token}}
							if(clinic){	
								response.args.data = clinic
								res.json(response)
							}else{
								res.json(response)
							}
							ref.off()
						})
					}
				})

				boostTokenLife(token)
			}catch(e){
				sendErrorMessage(res, "An error has occurred [5]")
			}
			break;

		case 'entry':
			try{
				token = req.body.args.token
				origin = req.body.args.origin
				boostTokenLife(token)
				response = {resp:"access", args:{url:"entry.html", token:token, data:origin}}
				res.json(response)
			}catch(e){
				sendErrorMessage(res, "An error has occurred [6]")
			}
			break;

		case 'select':
			try{
				token = req.body.args.token
				origin = req.body.args.origin
				boostTokenLife(token)
				response = {resp:"access", args:{url:"select.html", token:token, data:origin}}
				res.json(response)
			}catch(e){
				sendErrorMessage(res, "An error has occurred [7]")
			}
			break;

		case 'sti':
			try{
				token = req.body.args.token
				origin = req.body.args.origin
				boostTokenLife(token)
				response = {resp:"access", args:{url:"sti.html", token:token, data:origin}}
				res.json(response)
			}catch(e){
				sendErrorMessage(res, "An error has occurred")
			}
			break;

		case 'drugs':
			try{
				token = req.body.args.token
				origin = req.body.args.origin
				boostTokenLife(token)
				response = {resp:"access", args:{url:"drugs.html", token:token, data:origin}}
				res.json(response)
			}catch(e){
				sendErrorMessage(res, "An error has occurred [8]")
			}
			break;	

		case 'dispense':
				try{
					token = req.body.args.token
					origin = req.body.args.origin
					boostTokenLife(token)
					response = {resp:"access", args:{url:"select.html", token:token, data:origin}}
					res.json(response)
				}catch(e){
					sendErrorMessage(res, "An error has occurred [8]")
				}
				break;	

		case 'data':
			try{
				let entry = req.body.args.data
				let origin = req.body.args.origin
				token = req.body.args.token
				let timestamp = getTimestamp()
				entry.timestamp = timestamp
				boostTokenLife(token)
				runVerifiedDataUpload(res, token , entry, origin)
			}catch(e){
				sendErrorMessage(res, "Data upload failed [9]")
			}
			break;

		case 'target-query':
			try{

				token = req.body.args.token
				let collection = req.body.args.collection
				let document = req.body.args.doc
				let target = req.body.args.target

				firebase.firestore.collection(collection).doc(document).get().then((doc)=>{
					let response = {resp:"query", args:{data:doc.data(), token:token, target:target}}
					res.json(response)
					boostTokenLife(token)
				})
			}catch(e){
				sendErrorMessage(res, "An error has occurred [10]")
			}
			break;
	

		case 'query-all':
			try{
				let query = req.body
				token = query.args.token
				let targetCollectionName = query.args.query
				let dataArray = []
				firebase.firestore.collection(targetCollectionName).get().then((collections) => {
					
					collections.forEach((collection) =>{
						dataArray.push(collection.data())
					})

					let response = {resp:"data", args:{data:dataArray, token:token, title:targetCollectionName}}
					res.json(response)
					boostTokenLife(token)
				})
			}catch(e){
				sendErrorMessage(res, "An error has occurred [11]")
			}
			break

		case 'collections':
			let queryObject = req.body
			targetCollectionName = queryObject.args.query
			let userToken = queryObject.args.token
			let target = queryObject.args.target
	
			try{
				let dataArray = []
				firebase.firestore.collection(targetCollectionName).get().then((collections)=>{
					
					collections.forEach((collection) =>{
						dataArray.push(collection.data().timestamp)
					})

					let response = {resp:"collections", args:{data:dataArray, token:userToken, target:target }}
					res.json(response)
					boostTokenLife(userToken)
				})
			}catch(e){
				sendErrorMessage(res, "An error has occurred [12]")
			}
			break;


		default:
			try{
				sendErrorMessage(res, "Invalid API operation [13]")
			}catch(e){
				sendErrorMessage(res, "An error has occurred [14]")
			}
	}
}

function cli(req, res){
	
	let request = req.body
	let command = request.command
	delete request.command

	switch(command){

		case "login":
			try{
				authAdminUser(request, res)
			}catch(e){
				sendCLIErrorMessage(res, "Error has occured:[SYSTEM LOGIN]")
			}
			break

		case "add-user":
			try{
				let user = {}
				let clinic = request.clinic
				let r = hashPassword(Math.random().toString()).substring(0,5)
				let username = `${request.email.split("@")[0]}-${clinic}-${r}`
				let email = request.email
				let service = request.service
				let password = hashPassword(Math.random().toString()).substring(0,16)
				let passwordHash = hashPassword(password)


				user.username = username
				user.password = passwordHash
				user.emailAddress = email
				user.clinic = clinic
				user.uid = request.uid

				mailer.createTransporter(service)
				mailer.sendMail("Your new credentails",
					`Username:<b><u>${username}</u></b><br> Password:<b><u>${password}</u></b>`,
					email,
					res,firebase.firestore, user)

			}catch(e){
			}
			break

		case "del-user":
			try{
				let username = request.username
				if(username !== 'sysadmin'){
					firebase.firestore.collection('users').doc(username).delete().then(e => {
						res.json({resp:'error', errorMessage:"Success"})
					})
				}else{
					sendCLIErrorMessage(res, "Error has occured:[DEL_USER]")
				}
			}catch(e){
				sendCLIErrorMessage(res, "Error has occured:[DEL_USER]")
			}
			break


		case "user-logs":
			try{
				let query = request.query
				let ref = firebase.database.ref(query)
				ref.on("value", snapshot => {
					let entries = snapshot.val()
					let sortedEntries = {}
					let key = null
					let date = null

					if(entries){
						for(key in entries){
							date = new Date(parseInt(key)).toString().substring(0,33)
							sortedEntries[key] = `${key}  =>  ${entries[key].user}   =>   LoginDate: ${date}`
						}
						sendMessage(res, "Success", sortedEntries)
					}else{
						sendMessage(res, "No logs found", {})
					}
					ref.off()
				})
			}catch(e){
				sendMessage(res, "Error has occured:[USER_LOGS]", {})
			}
			break

		case "list-users":
			try{
				query = request.query
				let output = {}
				firebase.firestore.collection(query).get().then((col)=>{
					
					col.forEach(doc =>{
						output[doc.data()['username']] = doc.data()['emailAddress']
					})

					output.errorMessage = "Success"
					output.resp = "error"

					res.json(output)
				})
			}catch(e){
				sendCLIErrorMessage(res, "Error has occured:[LIST-USERS]")
			}
		break


		case "prune-tokens":
			try{
				let target = request.target
				ref = firebase.database.ref().child(target).remove();
				sendCLIErrorMessage(res, "Success")
			}catch(e){
				sendCLIErrorMessage(res, "Error has occured:[PRUNE-TOKENS]")
			}
			break

		case "config-admin":
			try{
				request.password = hashPassword(request.password)
				firebase.firestore.collection("users").doc(request.username).set(request).then(e => {
					sendCLIErrorMessage(res, "Success")
				})
			}catch(e){
				sendCLIErrorMessage(res, "Error has occured:[CONFIG_ADMIN]")
			}
			break

		case "set-tlv":
			try{
				let value = request.value
				firebase.database.ref().child("tlv").set(parseInt(value))
				sendCLIErrorMessage(res, "Success")
			}catch(e){
				sendCLIErrorMessage(res, "Error has occured:[SET_TLV]")
			}
			break

		case "monitor-tlv":
			try{
				let key = Object.keys(request)[0]
				firebase.database.ref().child("tlvMonitors").child(key).set(request[key])
				sendCLIErrorMessage(res, "Success")
			}catch(e){
				sendCLIErrorMessage(res, "Error has occured:[SET_TLV]")
			}
			break
	
		case "drop-tlv":
			try{
				firebase.database.ref().child("tlvMonitors").child(request.query).remove()
				sendCLIErrorMessage(res, "Success")
			}catch(e){
				sendCLIErrorMessage(res, "Error has occured:[SET_TLV]")
			}
			break

		case "ls-tlv":
			try{
				let ref = firebase.database.ref().child("tlvMonitors")
	
				ref.on('value' , snapshot => {
					let data  = snapshot.val()
					if(data){
						data.errorMessage = "Success"
						data.resp = "error"
					}else{
						data = {}
						data.errorMessage = "No data found"
						data.resp = "error"
					}
					ref.off()
					res.json(data)
				})

			}catch(e){
				sendCLIErrorMessage(res, "Error has occured:[SET_TLV]")
			}
			break

		case "reset-tlv":
			try{
				firebase.database.ref().child("tlvMonitors").remove()
				sendCLIErrorMessage(res, "Success")
			}catch(e){
				sendCLIErrorMessage(res, "Error has occured:[SET_TLV]")
			}
			break

		case "drug-ctl":
			try{

				let r = req.body;
				let subcommand = r.operation
				let itemName = r.name
				switch(subcommand){

					case "create":
						delete r.name
						delete r.operation

						firebase.firestore.collection("Drug-Administration").doc(itemName).set(r).then( d => {
							sendCLIErrorMessage(res, "Success")
						})
						break;
					
					case "read":
					break;

				}
			}catch(e){
				console.log(e)
				sendCLIErrorMessage(res, "Error has occured:[DRUG-CTL]")
			}
			break

		default:
			try{
				console.log("[!] Invalid Operation")
				sendCLIErrorMessage(res, "Invalid Operation")
			}catch(e){
				sendCLIErrorMessage(res, "Error has occured:[OPERATION NOT IMPLEMENTED]")
			}
			break

	}
}


function boot(){
	console.log(`Server:[ONLINE]  ::${SERVER_PORT}`)
}

//	MIDDLEWARE
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(express.static(STATIC_FILES))
//	MIDDLEWARE


app.post('/api', api)
app.post('/cli', cli)
app.listen(SERVER_PORT, boot)
