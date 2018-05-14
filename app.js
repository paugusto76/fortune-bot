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
    // session.send(session.message.text);
});

bot.recognizer({
    recognize: function (context, done) {
        var intent = { score: 0.0 };
  
        if (context.message.text) {
            switch (context.message.text.toLowerCase()) {
                case 'fortune':
                case 'fortune bot fortune':
                    intent = { score: 1.0, intent: 'Fortune' };
                    break;
            }
        }
        done(null, intent);
    }
});
  
bot.dialog('fortuneDialog', function (session) {
    var index = randomIntInc(0, quotes.length - 1);

    var msg = new builder.Message(session);
    msg.attachmentLayout(builder.AttachmentLayout.carousel);
    msg.attachments([
        new builder.HeroCard(session)
            .title('Fortune cookie')
            .text(quotes[index])
            .images([builder.CardImage.create(session, 'https://classroomclipart.com/images/gallery/Clipart/Food/Dessert_Clipart/fortune_cookie.jpg')])
    ]);

    session.send(msg).endDialog();

    // session.send(quotes[index]).endDialog();

}).triggerAction({ matches: 'Fortune' });

bot.dialog('hashTagDialog', function (session) {
    var regex = /\B#\w*[a-zA-Z]+\w*/;
    var result = session.message.text.match(regex);
    


}).triggerAction({matches: /\B#\w*[a-zA-Z]+\w*/ });
