var express = require('express')
var bodyParser = require('body-parser')
var request = require('request')
var app = express()

var yts = require("./yts").yts;

var token = "EAARms7g6rZAUBALWlSsazZCmL2mc8WZCHlfHNKPT2glmGS2aq5MGqfZAkUYDvdYYIZAw531L0FpHHvNhi38l8m13LHTWUKbp3CuLwUZAP1qn12dCinCPhBhQOkLYjl8UI5BgMtZANvsZAlCxEs777CUUoMGxDTX4sZCTWXEuKTcnzFgZDZD"

function handleMessage(sender, text){
	var pattern = new RegExp("search\s", "ig");
	if(pattern.test(text.split("search ")[0])){
		var moviename = text.split("search ")[1];
		yts.search(movieName).then((response) => {
			sendTextMessage(sender, JSON.stringify(response.data));
		});
	}else{
		sendTextMessage(sender, text);
	}
}

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

function sendGenericMessage(sender) {
    messageData = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [{
                    "title": "First card",
                    "subtitle": "Element #1 of an hscroll",
                    "image_url": "http://messengerdemo.parseapp.com/img/rift.png",
                    "buttons": [{
                        "type": "web_url",
                        "url": "https://www.messenger.com",
                        "title": "web url"
                    }, {
                        "type": "postback",
                        "title": "Postback",
                        "payload": "Payload for first element in a generic bubble",
                    }],
                }, {
                    "title": "Second card",
                    "subtitle": "Element #2 of an hscroll",
                    "image_url": "http://messengerdemo.parseapp.com/img/gearvr.png",
                    "buttons": [{
                        "type": "postback",
                        "title": "Postback",
                        "payload": "Payload for second element in a generic bubble",
                    }],
                }]
            }
        }
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
    yts.getMovies().then((response) => {
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
            handleMessage(sender, text);
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