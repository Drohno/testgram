// app.js
var express = require('express');  
var app = express();  
var server = require('http').createServer(app);  
var io = require('socket.io')(server);
const MTProto = require('telegram-mtproto').MTProto


app.use(express.static(__dirname + '/node_modules'));  
app.get('/', function(req, res,next) {  
    res.sendFile(__dirname + '/cliente/index.html');
});

server.listen(4200);  

io.on('connection', (client)=>{
    client.on('setPhone',(data)=>{
        phone.num = data;
    });

    client.on('setCode',(data)=>{
        phone.code = data;
        connect();
    });
});

const phone = {
  num : '+9996620001',
  code: '22222'
}

const api = {
  layer          : 57,
  initConnection : 0x69796de9,
  api_id         : 85721
}

const servidor = {
  dev: true //We will connect to the test server.
}           //Any empty configurations fields can just not be specified

const client = MTProto({ servidor, api })

async function connect(){
  const { phone_code_hash } = await client('auth.sendCode', {
    phone_number  : phone.num,
    current_number: false,
    api_id        : 85721,
    api_hash      : '3f93a7cd550c0599884616ed325c4427'
  })
  const { user } = await client('auth.signIn', {
    phone_number   : phone.num,
    phone_code_hash: phone_code_hash,
    phone_code     : phone.code
  })

  console.log('signed as ', user)
}