// app.js
var express = require('express');  
var app = express();  
var servidor = require('http').createServer(app);  
var io = require('socket.io')(servidor);
const MTProto = require('telegram-mtproto').MTProto;
var port = 4200;


app.use(express.static(__dirname + '/node_modules'));  
app.get('/', function(req, res,next) {  
    res.sendFile(__dirname + '/cliente/index.html');
});

servidor.listen(port, ()=>{
  console.log("Escuchando en http://localhost:" + port);
});  

const phone = {}

const api = {
  layer          : 57,
  initConnection : 0x69796de9,
  api_id         : 85721
}

const server = {
  dev: true //We will connect to the test server.
}           //Any empty configurations fields can just not be specified

const telegram = MTProto({ server, api });

io.on('connection', (client)=>{
    client.on('setPhone',(data)=>{
        phone.num = data;
        try{
          async function conseguirPhoneCodeHash(){
            phone.phone_code_hash = await telegram('auth.sendCode', {
              phone_number  : phone.num,
              current_number: false,
              api_id        : 85721,
              api_hash      : '3f93a7cd550c0599884616ed325c4427'
            });
          }
          conseguirPhoneCodeHash().then(()=>{
            console.log("phone_code_hash\n", phone.phone_code_hash);
          });
      }catch(error){
        console.log(error);
      }
    });

    client.on('setCode',(data)=>{
        phone.code = data;
        try{
        async function conseguirPhoneUser(){
          phone.user = await telegram('auth.signIn', {
            phone_number   : phone.num,
            phone_code_hash: phone.phone_code_hash,
            phone_code     : phone.code
          })
        }
        conseguirPhoneUser().then(()=>{
          console.log('Conectado como:\n', phone.user)
        });
      }catch(error){
        console.log(error);
      }
    });
});