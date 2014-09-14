var express = require('express');
var load = require('express-load');
var error = require('./middleware/error');
var app = express();
//var routes = require('./routes'); 
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

const KEY = 'ntalk.sid', SECRET = 'ntalk'; 
var cookie = express.cookieParser(SECRET);
var store = new express.session.MemoryStore();
var sessOpts = {secret: SECRET, key: KEY, store: store};
var session = express.session(sessOpts);
var mongoose = require('mongoose');
global.db = mongoose.connect('mongodb://localhost/ntalk');


app.set('views', __dirname + '/views'); 
app.set('view engine', 'ejs'); 
app.use(cookie); 
app.use(session); 
app.use(express.json()); 
app.use(express.urlencoded());
app.use(express.methodOverride()); 
app.use(app.router); 
app.use(express.static(__dirname + '/public')); 
app.use(error.notFound); 
app.use(error.serverError);

io.set('authorization', function(data, accept) { 
	cookie(data, {}, function(err) { 
		var sessionID = data.signedCookies[KEY]; 
		store.get(sessionID, function(err, session) { 
			if (err || !session){ 
				accept(null, false); 
			} else { 
				data.session = session; 
				accept(null, true); 
			} 
		}); 
	}); 
})

load('models') 
	.then('controllers') 
	.then('routes') 
	.into(app);

load('sockets') 
	.into(io);
/*io.sockets.on('connection', function (client) { 
	client.on('send-server', function (data) { 
		var msg = "<b>"+data.nome+":</b> "+data.msg+"<br>"; 
		client.emit('send-client', msg); 
		client.broadcast.emit('send-client', msg); 
	}); 
});*/
server.listen(3000, function(){ 
	console.log("Ntalk no ar."); 
});