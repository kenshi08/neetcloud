// See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
// for Dialogflow fulfillment library docs, samples, and to report issues
'use strict';
 
const functions = require('firebase-functions');
const {WebhookClient} = require('dialogflow-fulfillment');
const {Card, Suggestion} = require('dialogflow-fulfillment');
 
process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements
 
exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });
  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
 
  function welcome(agent) {
    agent.add(`Hi! What can I do for you today?`);
  }
 
  function fallback(agent) {
    agent.add(`I didn't understand`);
    agent.add(`I'm sorry, can you try again?`);
}

function getIPAddress(token, deploymentID) {
    var request = require('request-promise-native');
    var url = 'https://api.mgmt.cloud.vmware.com/blueprint/api/blueprint-deployments/' + deploymentID + '/events';
    var options = {
        method: 'get',
        json: true,
        url: url,
        headers: {
            'Authorization' : 'Bearer ' + token
        }
    };
    var promise = new Promise(function(resolve, reject){
        request(options, function (err, res, body) {
            var statuscode = res.statusCode;
            if (err) {
                console.error('error posting json: ', err);
                console.log("Error!");
                reject(err);
            }
            else if (statuscode == 200) {
                console.log('getIPAddress StatusCode: ', statuscode);
                console.log('getIPAddress Body: ', body);
                var data = JSON.parse(body);
                var ipaddress = data.objects[0].properties.address;
                resolve(ipaddress);                
            }
            else {
                console.log("Something went wrong. Status Code: " + statuscode);
                console.log('resourceBody: ', body);
                reject(body);
            }
        });        
    });
    return promise;
}

function checkStatus(token, requestID) {
    var status;
    while (status != "FINISHED"){
        getRequestStatus(token, requestID).then(function(result){
            status = result;
        });        
    }
    return status;
}

function getRequestStatus(token, requestID) {
    var request = require('request-promise-native');
    var url = 'https://api.mgmt.cloud.vmware.com/blueprint/api/blueprint-requests/'+requestID;
    var options = {
        method: 'get',
        json: true,
        url: url,
        headers: {
            'Authorization' : 'Bearer ' + token
        }
    };
    var promise = new Promise(function(resolve, reject){
        request(options, function (err, res, body) {
            var statuscode = res.statusCode;
            if (err) {
                console.error('error posting json: ', err);
                console.log("Error!");
                reject(err);
            }
            else if (statuscode == 200) {
                console.log('checkRequestStatus StatusCode: ', statuscode);
                console.log('checkRequestStatus Body: ', body);
                var data = JSON.parse(body);
                var status = body.status;
                resolve(status);               
            }
            else {
                console.log("Something went wrong. Status Code: " + statuscode);
                console.log('resourceBody: ', body);
                reject(body);
            }
        });        
    });
    return promise;
}

function createServerAPI(token, data) {
    var request = require('request-promise-native');
    var url = 'https://api.mgmt.cloud.vmware.com/blueprint/api/blueprint-requests';
    var options = {
        method: 'post',
        body: data,
        json: true,
        url: url,
        headers: {
            'Authorization' : 'Bearer ' + token
        }
    };
    var promise = new Promise(function(resolve, reject) {
        request(options, function(err,res,body) {
            if (err) {
                console.error('error posting json:', err);
                reject(err);
            }
            else if (res.statusCode == 200) {
                console.log('serverRequest status code: ', res.statusCode);
                console.log('server result: ', body);
                resolve(body.deploymentId);
            }
            else {
                console.log('something went wrong with error: ', res.statusCode);
                console.log('result body: ', body);
                agent.add("Opps! Something went wrong there! Please try again!");
				reject(body);
            }
        });
    });
    return promise;
}

function getToken(refreshToken) {
    var request = require('request-promise-native');
    var data = {"refreshToken": refreshToken};
    var url = 'https://api.mgmt.cloud.vmware.com/iaas/api/login?apiVersion=2019-01-15';
    var options = {
        method: 'post',
        body: data,
        json: true,
        url: url
    };
    
    var promise = new Promise(function(resolve, reject) {
        request(options, function(err,res,body) {
            if (err) {
                console.error('error posting json:', err);
                reject(err);
            }
            else if (res.statusCode == 200) {
                console.log('tokenRequest status code: ', res.statusCode);
                console.log('token result: ', body.token);
                resolve(body.token);
            }
            else {
                console.log('something went wrong with error: ', res.statusCode);
                console.log('result body: ', body);
                agent.add("Opps! Something went wrong there! Please try again!");
				reject(body);
            }
        });
    });
    return promise;
}

function createServer(agent) {
    //user inputs from agent
    let os = agent.parameters.os;
    let size = agent.parameters.size;
    let platform = agent.parameters.platform;
    
    //api refresh token
    var refreshToken = "6a76f0e9-4d5c-4ef4-8344-5919548afc81";
    var deploymentID;
    var token;
    var requestStatus;
    var ipAddress;
    
    //Format user request to payload jason
	var randomInt = Math.floor(Math.random() * Math.floor(1000));
	var deploymentName = "NEETbot-otengu-" + randomInt;
	var payloadData = {
	  "projectId": "81e5de7e-c49a-4dda-9712-610385cef550",
	  "deploymentId": null,
	  "deploymentName": deploymentName,
	  "reason": "NEETbot-otengu-Slack",
	  "description": "requested from Slack with Otengu",
	  "plan": false,
	  "blueprintId":"9353c5c3-1881-45a8-8af7-ffaec47071f4",
	  "content": null,
	  "inputs": {
		"os": os.toString(),
		"size": size.toString(),
        "platform": platform.toString(),
        "count": "1",
        "network": "public"
	  }
    };
    
    //get token
    getToken(refreshToken).then(function(result) {
        token = result;
        //create server
        return createServerAPI(token, payloadData).then(function(result) {
            deploymentID = result;
            agent.add('Your request has been submitted! I will ping you again when it is done!');
            //requestStatus = checkStatus(token, deploymentID);
            //get IP address of server and response back to user
            //getIPAddress(token, deploymentID).then(function(result){
                //ipAddress = result;
                //agent.add("Good news! Your server is ready and you can access it at " + ipAddress);
            //});    
        });
    });
}

function createApp(agent) {
    //user inputs from agent
    let os = agent.parameters.os;
    let size = agent.parameters.size;
    let platform = agent.parameters.platform;
    let name = agent.parameters.name;
    
    //api refresh token
    var refreshToken = "";
    var deploymentID;
    var token;
    var requestStatus;
    
    //Format user request to payload jason
	var randomInt = Math.floor(Math.random() * Math.floor(1000));
	var deploymentName = "NEETbot-otengu-" + randomInt;
	var payloadData = {
	  "projectId": "81e5de7e-c49a-4dda-9712-610385cef550",
	  "deploymentId": null,
	  "deploymentName": deploymentName,
	  "reason": "NEETbot-otengu-Slack",
	  "description": "requested from Slack with Otengu",
	  "plan": false,
	  "blueprintId":"05a635f8-8602-456c-a80e-f7b072495eee",
	  "content": null,
	  "inputs": {
		"os": os.toString(),
		"size": size.toString(),
        "platform": platform.toString(),
        "name": name.toString()
	  }
    };
    
    //get token
    getToken(refreshToken).then(function(result) {
        token = result;
        //create server
        return createServerAPI(token, payloadData).then(function(result) {
            deploymentID = result;
            agent.add('Your request has been submitted! I will ping you again when it is done!');
            //requestStatus = checkStatus(token, deploymentID);
            //get IP address of server and response back to user
            //getIPAddress(token, deploymentID).then(function(result){
                //ipAddress = result;
                //agent.add("Good news! Your server is ready and you can access it at " + ipAddress);
            //});    
        });
    });
}

  // // Uncomment and edit to make your own intent handler
  // // uncomment `intentMap.set('your intent name here', yourFunctionHandler);`
  // // below to get this function to be run when a Dialogflow intent is matched
  // function yourFunctionHandler(agent) {
  //   agent.add(`This message is from Dialogflow's Cloud Functions for Firebase editor!`);
  //   agent.add(new Card({
  //       title: `Title: this is a card title`,
  //       imageUrl: 'https://developers.google.com/actions/images/badges/XPM_BADGING_GoogleAssistant_VER.png',
  //       text: `This is the body text of a card.  You can even use line\n  breaks and emoji! ??`,
  //       buttonText: 'This is a button',
  //       buttonUrl: 'https://assistant.google.com/'
  //     })
  //   );
  //   agent.add(new Suggestion(`Quick Reply`));
  //   agent.add(new Suggestion(`Suggestion`));
  //   agent.setContext({ name: 'weather', lifespan: 2, parameters: { city: 'Rome' }});
  // }

  // // Uncomment and edit to make your own Google Assistant intent handler
  // // uncomment `intentMap.set('your intent name here', googleAssistantHandler);`
  // // below to get this function to be run when a Dialogflow intent is matched
  // function googleAssistantHandler(agent) {
  //   let conv = agent.conv(); // Get Actions on Google library conv instance
  //   conv.ask('Hello from the Actions on Google client library!') // Use Actions on Google library
  //   agent.add(conv); // Add Actions on Google library responses to your agent's response
  // }
  // // See https://github.com/dialogflow/dialogflow-fulfillment-nodejs/tree/master/samples/actions-on-google
  // // for a complete Dialogflow fulfillment library Actions on Google client library v2 integration sample

  // Run the proper function handler based on the matched Dialogflow intent name
  let intentMap = new Map();
  intentMap.set('Default Welcome Intent', welcome);
  intentMap.set('Default Fallback Intent', fallback);
  intentMap.set('neetcloud.server.create', createServer);
  intentMap.set('neetcloud.app.create', createApp);
  // intentMap.set('your intent name here', yourFunctionHandler);
  // intentMap.set('your intent name here', googleAssistantHandler);
  agent.handleRequest(intentMap);
});