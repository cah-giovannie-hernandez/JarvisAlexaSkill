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

	var heroId;
	var description;
	var heroName;
	var heroImage;
	var speechOutput;

	var PRIV_KEY = "68a9ac0460981d000acb70fba3a1db88e2408fdb";
	var PUB_KEY = "6864eb209818465f2af97ba120632a3b";
	var hash = crypto.createHash('md5').update("20160423" + PRIV_KEY + PUB_KEY).digest('hex');

	var url = "http://gateway.marvel.com:80/v1/public/characters?name=" + heroName + "&apikey=" +
			  PUB_KEY + "&ts=20160423"; 

	var http = require( 'http' );

    http.get( url, function( response ) {
        
        var data = '';
        
        response.on( 'data', function( x ) { data += x; } );
        
        response.on( 'end', function() {
            
            var json = JSON.parse(data);

            if(json.data.results.length > 0){

	            heroId = json.data.results[0].id;
	            description = json.data.results[0].description;
	            heroName = json.data.results[0].name;
	            heroImage = json.data.results[0].thumbnail.path + "." + json.data.results[0].thumbnail.extension;
      	  		if(description === ""){
      	  			speechOutput = heroName + " does not have a description"
      	  		}else{
      	  			speechOutput = heroName + ", " + description;
      	  		}
      	  }else{

      	  	var text = "Your requested superhero does not exist";
      	  	var cardTitle = "Invalid Superhero";
      	  	var shouldEndSession = true;
      	  	sendOutput(cardTitle, text, "", shouldEndSession, context);

        	}
    	} );
        
    });
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
            },
            "shouldEndSession": shouldEndSession
        };
        context.succeed( { response: response } );
        
}