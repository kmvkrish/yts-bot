var express = require('express')
var bodyParser = require('body-parser')
var request = require('request')
var app = express()

var yts = require("./yts").yts;

var token = "EAARms7g6rZAUBALWlSsazZCmL2mc8WZCHlfHNKPT2glmGS2aq5MGqfZAkUYDvdYYIZAw531L0FpHHvNhi38l8m13LHTWUKbp3CuLwUZAP1qn12dCinCPhBhQOkLYjl8UI5BgMtZANvsZAlCxEs777CUUoMGxDTX4sZCTWXEuKTcnzFgZDZD"

function sendTextMessage(sender, text) {
    messageData = {
        text:text
    }
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:token},
        method: 'POST',
        json: {
            recipient: {id:sender},
            message: messageData,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}

app.set('port', (process.env.PORT || 5000));

app.use(bodyParser.urlencoded({extended: false}));

app.use(bodyParser.json());

app.get('/', function (req, res) {
    yts.getMovies(1, 2016, 40).then((response) => {
    	res.send(response.body.data);
    });
});

app.post('/webhook/', function (req, res) {
    messaging_events = req.body.entry[0].messaging
    for (i = 0; i < messaging_events.length; i++) {
        event = req.body.entry[0].messaging[i]
        sender = event.sender.id
        if (event.message && event.message.text) {
            text = event.message.text
            if (text === 'List' || text == "list") {
                yts.getMovies().then((response) => {
                	var movies = response.body.data.movies;
                	for(var i=0; i < movies.length; i++){
                		sendTextMessage(sender, movies[i].url);
                	}
                });
            }
            sendTextMessage(sender, "Text received, echo: " + text.substring(0, 200))
        }
        if (event.postback) {
            text = JSON.stringify(event.postback)
            sendTextMessage(sender, "Postback received: "+text.substring(0, 200), token)
            continue
        }
    }
    res.sendStatus(200)
})

app.listen(app.get('port'), function() {
    console.log('running on port', app.get('port'))
});