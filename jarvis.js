exports.handler = function( event, context ){
    if (event.request.intent){
    	var intent = event.request.intent;
    	var intentname = intent.name;
   		var text = " ";
    	var repromptText = " ";
    	var cardTitle = " ";
    	var shouldEndSession = " ";

    	if (intentname === "WhoIsThisSuperhero"){
    		getSuperhero(intent, context);
    	}
    	else if(intentname === AMAZON.HelpIntent){
    		text = " JARVIS is a very intelligent system. JARVIS can help you with many things. Ask him something. ";
    		repromptText = " What Superhero would you like to search about?";
    		cardTitle = "help";
    		shouldEndSession = true;
    		sendOutput(cardTitle, text, repromptText, shouldEndSession, context);
    	}
    	else if(intentname === AMAZON.StopIntent){
    		text = "Goodbye";
    		shouldEndSession = true;
    		sendOutput(cardTitle, text, repromptText, shouldEndSession, context);}
    	else{
    		text = "Invalid. Try again.";
    		shouldEndSession = true;
    		sendOutput(cardTitle, text, repromptText, shouldEndSession, context);}


    }
};

function getSuperhero(intent, context) {
}

function sendOutput(cardTitle, text, repromptText, shouldEndSession, context) {
    
}