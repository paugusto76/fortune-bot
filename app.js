var restify = require('restify');
var builder = require('botbuilder');
var fs = require('fs');
var config = require('config');

var configBot = config.get('bot');

var quotes;

fs.readFile('data/fortunes.txt', 'utf8', function(error,data){
    if (error)
    {
        return console.log(error);
    }

    quotes = data.split('%');
});

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});

// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: process.env.MicrosoftAppId || configBot.microsoftAppId,
    appPassword: process.env.MicrosoftAppPassword || configBot.microsoftAppPassword
});

// Listen for messages from users 
server.post('/api/messages', connector.listen());

function randomIntInc (low, high) {
    return Math.floor(Math.random() * (high - low + 1) + low);
}

// Receive messages from the user and respond by echoing each message back (prefixed with 'You said:')
var bot = new builder.UniversalBot(connector, function (session) {
    var text = session.message.text;
    if (session.message.entities) {
        var botId = session.message.bot.id;
        session.send(botId);
        
        session.message.entities
            .filter(entity => ((entity.type === "mention") && (entity.mentioned.id.toLowerCase() === botId)))
            .forEach(entity => {
                text = text.replace(entity.text, "");
            });
        text = text.trim();
    }

    session.send(text);
    
    
    
    // if (session.message.text) {
    //     switch (session.message.text.toLowerCase().trim()) {
    //         case 'fortune':
    //         case 'fortune bot fortune':
                
    //             var index = randomIntInc(0, quotes.length - 1);

    //             var msg = new builder.Message(session);
    //             msg.attachmentLayout(builder.AttachmentLayout.carousel);
    //             msg.attachments([
    //                 new builder.HeroCard(session)
    //                     .title('Fortune cookie')
    //                     .text(quotes[index])
    //                     .images([builder.CardImage.create(session, 'https://classroomclipart.com/images/gallery/Clipart/Food/Dessert_Clipart/fortune_cookie.jpg')])
    //             ]);

    //             session.send(msg).endDialog();

    //             break;
    //         default:
    //             session.send(session.message.text.toLowerCase().trim());
    //             break;
    //     }
    // }
});
