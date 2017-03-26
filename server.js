var http = require('http');
var express = require('express');
var app = express();

// view engine setup
app.set('views', __dirname+'/views');
app.set('view engine', 'ejs');


// static file setting
app.use(express.static('public'));

//route setup
var index = require('./routes/index');
app.use('/', index);

//port setup
var port = process.env.PORT || 3000;


var server = http.createServer(app);
server.listen(port);

var azure = require('azure');
var hubName = 'pushApp';
var connectionString = 'Endpoint=sb://azurenotificationtest.servicebus.windows.net/;SharedAccessKeyName=DefaultFullSharedAccessSignature;SharedAccessKey=Q+Rgz8F1XhNO83Tl3GMytYa3jE6PGS6zAy1WliFD2zg=';
var notificationHubService = azure.createNotificationHubService(hubName,connectionString);

var io = require('socket.io').listen(server);
io.sockets.on('connection',function(socket){
    socket.emit('toclient',{msg:'Welcome!'});
    notificationHubService.gcm.send(null, {data:{id:socket.id, message:'Welcome'}},function(error){
        if(!error){
            console.log('send');
        }
    });

    socket.on('fromclient',function(data){
        socket.broadcast.emit('toclient',data);
        socket.emit('toclient',data);
        console.log('Message from client :'+data.msg);

        if(!data.msg==""){
            notificationHubService.gcm.send(null, {data:{id:socket.id, message:data.msg}}, function(error){
                if(!error){
                    //notification sent
                        console.log('send');
                }
            });
        }
    })
});
