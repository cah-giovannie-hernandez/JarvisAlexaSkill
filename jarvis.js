exports.handler = function( event, context ) {    
};

function getSuperhero(intent, context) {
	var params = {
		TableName: "JarvisAlexaSkillData",
		KeyConditionExpression: "heroID = :heroID",
		ExpressionAttributeValues: {
			"heroID" : "heroID",
		}
	};
	dynamodb.query(params, function(err, data)) {
		if(err) {
			context.fail('ERROR: Query failed: ' + err + " Data:" + JSON.stringify(params));
		} else {
			console.log("Success Update of: ." + JSON.stringify(params));

			if(data.Count > 0) {

				params = {
					TableName: "JarvisAlexaSkillData",
					Key: {
						"heroId" : superheroData.heroID
					},
					UpdateExpression: "set timesAsked = timesAsked + :val",
					ExpressionAttributeValues:{
						":val":1
					},
					ReturnValues: "UPDATED_NEW"
				};

				dynamodb.updateItem(params, function(err, data) {
					if(err) {
						context.fail('ERROR: Update failed: ' + JSON.stringify(params));
					}
					else {
						console.log("Success Update of: " + JSON.strinfy(params));
					}
				}};
			}else{
				params = {
					Item: {
						heroID: superheroData.id,
						name: superheroData.name,
						timesAsked : 1
					},
					TableName: 'JarvisAlexaSkillData'
				};
				if(superheroData.description) params.Item.description = superheroData.description;
				if(superheroData.thumbnail.path) params.Item.image = superheroData.thumbnail.path + "." + superheroData.thumbnail.extention;

				dynamodb.putItem(params, function(err, data) {
					if(err){
						context.fail('ERROR: Insert failed: ' + err + "Data: " + JSON.stringify(params));
					}
					else {
						console.log("Success Insert of: " + JSON.stringify(params));
						sendOutput(cardTitle, speechOutput, repromptText, shouldEndSession, context);
					}
				}};
			}
		}
	}};
	}else{
		speechOutput = "I couldn't find any hero under that name.";
	}
} };
}}.on('error', function (e)){
	console.log("Got error: " + e.message);
	speechOutput = "I'm having trouble with your request.";
	repromptText = "You can ask me who any Marvel Hero is, for example; Who is Iron Man?";
	sendOutput(cardTitle, speechOutput, repromptText, shouldEndSession, context);
}};
}else{
	console.log("Invalid Hero Name: " + intent.slots.heroname);
}
}


function sendOutput(cardTitle, text, repromptText, shouldEndSession, context) {
    
}