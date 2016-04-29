/* 
    Description: Gets a Marvel Superhero name and grabs the description from Marvel using Marvel APIs.
*/

exports.handler = function( event, context ) {
    try {
        // Validate that Jarvis is the one talking to Lambda
        if (event.session.application.applicationId !== "amzn1.echo-sdk-ams.app.3b50e2ae-782b-4a96-b911-6a9a8d3f3599") {
            context.fail("Invalid Application ID");
        }

        if (event.request.type === "LaunchRequest"){
            
            getWelcomeResponse(context);
              
        } else if ( event.request.type ===  "IntentRequest") { 
            
            var intent = event.request.intent;
            var intentName = event.request.intent.name;
            var cardTitle = "";
            var speechOutput = "";
            var repromptText = "";
            var shouldEndSession = true;

            // Dispatch to your skill's intent handlers
            if ("WhoIsThisSuperhero" === intentName) {
                
                getSuperhero(intent, context);
                
            } else if ("AMAZON.HelpIntent" === intentName) {
                
                cardTitle = "Welcome";
                speechOutput = "Hello, my name is JARVIS. I am an AI built by Tony Stark with expertise on the Marvel Universe. " +
                                   "Which Marvel Superhero would you like to know about?";
                repromptText = "Which Marvel Superhero would you like to know about?";
                shouldEndSession = false;
                
                sendOutput(cardTitle, speechOutput, repromptText, shouldEndSession, context);                
                
            } else if ("AMAZON.StopIntent" === intentName || "AMAZON.CancelIntent" === intentName) {
                
                cardTitle = "Session Ended";
                speechOutput = "I will power off for now to recharge!";
                repromptcText = "";
                sendOutput(cardTitle, speechOutput, repromptcText, shouldEndSession, context);        
            
            } else {
                throw "Invalid intent";
            }            
            
        } else if (event.request.type === "SessionEndedRequest" ){  
            context.succeed(); 
        }     
    } catch (e){
        context.fail("Exception: " + e);
    }
};

function getSuperhero(intent, context) {
    // Library imports
    var AWS = require("aws-sdk");
    var doc = require('dynamodb-doc');
    var http = require('http');
    
    // Variables
    var cardTitle = intent.name;
    var repromptText = "";
    var shouldEndSession = true;
    var speechOutput = "";
    var dynamodb = new doc.DynamoDB();
    var params = {}
  
    if (intent.slots.heroname) {
        var heroname = intent.slots.heroname.value;
        var apikey = "e992ac3e89d0d8597249d43fcb22a929";
        var url = "http://gateway.marvel.com:80/v1/public/characters?name=" + heroname + 
                  "&ts=20160419251&apikey=" + apikey + "&hash=b4e3e427ca023a9993c84dfa40f3ad09";
        http.get( url, function( response ) {
            var data = '';
            var description = '';
            
            console.log("Got response: " + response.statusCode);
            
            response.on( 'data', function( x ) { data += x; } );

            response.on( 'end', function() {

                var json = JSON.parse(data);
                
                if (json.data.results.length > 0){
                    var superheroData = json.data.results[0];
                    
                    if (superheroData.description === ""){
                        speechOutput = heroname + ", does not have a description.";
                    }else{
                        speechOutput = heroname + ", " + superheroData.description;
                    }
                                 
                    params = {
                        TableName : "JarvisSkillHeroData",
                        KeyConditionExpression: "heroId = :superheroId",
                        ExpressionAttributeValues: {
                            ":superheroId":superheroData.id
                        }
                    };
                    
                     dynamodb.query(params, function(err, data) {
                        if (err) {
                            context.fail('ERROR: Query failed: ' + err + " Data:" + JSON.stringify(params)); // an error occurred
                        } else {
                            console.log("Sucess Update of: ." + JSON.stringify(params));
                            
                            if (data.Count > 0){
                                
                                params = {
                                    TableName: "JarvisSkillHeroData",
                                    Key:{
                                        "heroId": superheroData.id
                                    },
                                    UpdateExpression: "set timesAsked = timesAsked + :val",
                                    ExpressionAttributeValues:{
                                        ":val":1
                                    },
                                    ReturnValues:"UPDATED_NEW"
                                };
                                    
                                dynamodb.updateItem(params, function(err, data) {
                                    if (err){
                                        context.fail('ERROR: Update failed: ' + err + " Data: " + JSON.stringify(params)); // an error occurred
                                    }
                                    else {    
                                        console.log("Success Update of: " + JSON.stringify(params)); 
                                        sendOutput(cardTitle, speechOutput, repromptText, shouldEndSession, context);// successful update
                                    }
                                });                   
                            }else{
                                params = {
                                    Item: {
                                        heroId: superheroData.id,
                                        name: superheroData.name,
                                        timesAsked: 1
                                    },
                                    TableName: 'JarvisSkillHeroData'
                                };
                                if (superheroData.description) params.Item.description = superheroData.description;
                                if (superheroData.thumbnail.path) params.Item.image = superheroData.thumbnail.path + "." + superheroData.thumbnail.extension;

                                dynamodb.putItem(params, function(err, data) {
                                    if (err){
                                        context.fail('ERROR: Insert failed: ' + err + " Data: " + JSON.stringify(params)); // an error occurred
                                    }
                                    else {    
                                        console.log("Success Insert of: " + JSON.stringify(params)); 
                                        sendOutput(cardTitle, speechOutput, repromptText, shouldEndSession, context);// successful insert
                                    }
                                });    
                            }
                        }
                    });                                                 
                } else{
                    speechOutput = "I couldn't find any hero under that name."; 
                }        
            } );
        }).on('error', function (e) {
                console.log("Got error: " + e.message);  
                speechOutput = "I'm having trouble with your request.";
                repromptText = "You can ask me who any Marvel Hero is, for example; Who is Iron Man?";        
                sendOutput(cardTitle, speechOutput, repromptText, shouldEndSession, context);
            } );
    } else {
        console.log("Invalid Hero Name: " + intent.slots.heroname);
        speechOutput = "I'm having trouble with your request.";
        repromptText = "You can ask me who any Marvel Hero is, for example; Who is Iron Man?";        
        sendOutput(cardTitle, speechOutput, repromptText, shouldEndSession, context);
    }
}

function sendOutput(cardTitle, text, repromptText, shouldEndSession, context) {

    var response = {
        outputSpeech: {
            type: "PlainText",
            text: text
        },
        card: {
            type: "Simple",
            title: "Jarvis - " + cardTitle,
            content: text
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
    console.log(JSON.stringify(response));
    context.succeed( { response: response } );
    
}
