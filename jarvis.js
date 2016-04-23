exports.handler = function( event, context ) {    
};

function getSuperhero(intent, context) {
}

function sendOutput(cardTitle, text, repromptText, shouldEndSession, context) {
	var response = {
        outputSpeech: {
            type: "PlainText",
            text: text
        },
        card: {
            type: "Simple",
            title: "Jarvis",
            content: "Alexa Skills Kit"
        },
         "reprompt": {
	      "outputSpeech": {
	        "type": "string",
	        "text": repromptText
	      }
        shouldEndSession: shouldEndSession
    };
    
    context.succeed( { response: response } );
    
};

}