exports.handler = function( event, context ) {
    
    var response = {
        outputSpeech: {
            type: "PlainText",
            text: "Hello World"
        },
        card: {
            type: "Simple",
            title: "Hello World",
            content: "Alexa Skills Kit"
        },
        shouldEndSession: true
    };
    
    context.succeed( { response: response } );
    
};