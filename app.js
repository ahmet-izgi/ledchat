var express = require('express'),
	app = express(),
	server = require('http').createServer(app),
	io = require('socket.io').listen(server),
    mysql = require('mysql');
	users = {},
	seats = ['a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7', 'a8', 'a9', 'a10', 'a11', 'a12', 'a13', 'a14', 'a15', 'a16', 'a17', 
			'b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7', 'b8', 'b9', 'b10', 'b11', 'b12', 'b13', 'b14', 'b15', 'b16', 'b17',
			'c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9', 'c10', 'c11', 'c12', 'c13', 'c14', 'c15', 'c16', 'c17',
			'd1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7', 'd8', 'd9', 'd10', 'd11', 'd12', 'd13', 'd14', 'd15', 'd16', 'd17',
			'e1', 'e2', 'e3', 'e4', 'e5', 'e6', 'e7', 'e8', 'e9', 'e10', 'e11', 'e12', 'e13', 'e14', 'e15', 'e16', 'e17',
			'f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8', 'f9', 'f10', 'f11', 'f12', 'f13', 'f14', 'f15', 'f16', 'f17',
			'g1', 'g2', 'g3', 'g4', 'g5', 'g6', 'g7', 'g8', 'g9', 'g10', 'g11', 'g12', 'g13', 'g14', 'g15', 'g16', 'g17',
			'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'h7', 'h8', 'h9', 'h10', 'h11', 'h12', 'h13', 'h14', 'h15', 'h16', 'h17',
			'i1', 'i2', 'i3', 'i4', 'i5', 'i6', 'i7'],
    events = 
    [
        {"event" : {'eventId':1, 'name':'Beşiktaş Stad Açılışı', 'type':'FUTBOL', 'date':"21.08.2015", 'location':'Vodafone Arena', 'location_id':1}},
        {"event" : {'eventId':2, 'name':'Bursaspor - Atletico Madrid', 'type':'FUTBOL', 'date':"21.08.2015", 'location':'Bursa Timsah Arena', 'location_id':2}},
        {"event" : {'eventId':3, 'name':'Fenerbahçe - Shahktar', 'type':'FUTBOL', 'date':"21.08.2015", 'location':'Şükrü Saraçoğlu', 'location_id':3}},
        {"event" : {'eventId':4, 'name':'Galatasaray - Sivasspor', 'type':'FUTBOL', 'date':"21.08.2015", 'location':'Türk Telekom Arena', 'location_id':4}},
    ],
	userCount = 0;

var db_config = {
    host     : 'localhost',
    user     : 'root',
    password : 'logo',
    database : 'ledchat'
};

var connection;

function handleDisconnect() {
    connection = mysql.createConnection(db_config); // Recreate the connection, since
                                                  // the old one cannot be reused.

    connection.connect(function(err) {              // The server is either down
        if(err) {                                     // or restarting (takes a while sometimes).
          console.log('error when connecting to db:', err);
          setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
        }                                     // to avoid a hot loop, and to allow our node script to
    });                                     // process asynchronous requests in the meantime.
                                          // If you're also serving http, display a 503 error.
    connection.on('error', function(err) {
        console.log('db error', err);
        if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
            handleDisconnect();                         // lost due to either server restart, or a
        } else {                                      // connnection idle timeout (the wait_timeout
            throw err;                                  // server variable configures this)
        }
    });
}

handleDisconnect();

server.listen(3000);

app.get('/', function(req, res){
	res.sendfile(__dirname + '/index.html');
});

app.get('/server', function(request, response){
    response.sendfile('server.html');
});

io.sockets.on('connection', function(socket){
	
	socket.on('new user', function(data, callback){
		if (seats.indexOf(data) in users){
			callback(false);
		} else{
			callback(true);
			console.log('INDEX OF ' + data + ' is '  + seats.indexOf(data));
			socket.nickname = seats.indexOf(data);
			users[socket.nickname] = socket;
			console.log('USER ARRAY SIZE ' + users.length);
			socket.emit('userPacket', socket.nickname);
			updateNicknames();
            
		}
	});
    
    socket.on('koltukKayit', function(data, callback){
        
        //connection.connect();
        var queryString = 'SELECT * from koltuk_bit_index where LOCATION_ID = ? and TRIBUN_ID = ? and BLOK_ID = ? and SIRA = ? and KOLTUK = ?'; 
        connection.query(queryString, [data.location, data.tribun, data.blok, data.sira, data.koltuk], function(err, rows, fields) {
            if (err) {
                callback(false);
            }
            socket.emit('bitIndex', rows[0].BIT_INDEX);
            console.log('The solution is: ', rows[0].BIT_INDEX);
        });

        //connection.end();
        
        console.log(data);
    });

	function updateUserId(){
		io.sockets.emit('usernames', Object.keys(users));
	}
		
	function updateNicknames(){
		io.sockets.emit('usernames', Object.keys(users));
	}
    
    socket.on('getEventList', function(){
        var queryString = 'SELECT * from event'; 
        connection.query(queryString, [], function(err, rows, fields) {
            if (err) {
                callback(false);
            }
            socket.emit('eventList', rows);
        });        
    });
    
    socket.on('getEvent', function(data){
        for(var i = 0; i < events.length; i++)
        {
            if(events[i].event.eventId == data)
            {
                socket.emit('showEvent', events[i].event);
            }
        }
    });
	
	socket.on('lights', function(data, callback){
		var msg = data.trim();
		console.log('after trimming message is: ' + msg);
		io.sockets.emit('light_packet', msg);
	});

	socket.on('send message', function(data, callback){
		var msg = data.trim();
		console.log('after trimming message is: ' + msg);
		if(msg.substr(0,3) === '/w '){
			msg = msg.substr(3);
			var ind = msg.indexOf(' ');
			if(ind !== -1){
				var name = msg.substring(0, ind);
				var msg = msg.substring(ind + 1);
				if(name in users){
					users[name].emit('whisper', {msg: msg, nick: socket.nickname});
					console.log('message sent is: ' + msg);
					console.log('Whisper!');
				} else{
					callback('Error!  Enter a valid user.');
				}
			} else{
				callback('Error!  Please enter a message for your whisper.');
			}
		} else{
			io.sockets.emit('new message', {msg: msg, nick: socket.nickname});
		}
	});
	
	socket.on('disconnect', function(data){
		if(!socket.nickname) return;
		delete users[socket.nickname];
		updateNicknames();
	});
});