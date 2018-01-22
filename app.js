/*import { await } from 'most';*/

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
  dev: false //We will connect to the test server.
}           //Any empty configurations fields can just not be specified

const telegram = MTProto({ server, api });

var respuesta;

io.on('connection', (client)=>{
    client.on('setPhone',(data)=>{
        phone.number = data;    
        
        async function verifyPhone(){
          response = await telegram('auth.checkPhone', {
            phone_number: phone.number
          });
        }

        verifyPhone().then(()=>{
          console.log('Response', response);
          // Si el teléfono está registrado en el servidor, le enviamos el código a su Telegram ya activo
          if(response.phone_registered){
            async function conseguirPhoneCodeHash(){
              response = await telegram('auth.sendCode', {
                phone_number  : phone.number,
                sms_type : 5,
                api_id        : 85721,
                api_hash      : '3f93a7cd550c0599884616ed325c4427',
                lang_code : 'en'
              });
            }
            conseguirPhoneCodeHash().then(()=>{
              phone.phone_code_hash = response.phone_code_hash;
              client.emit('nextStep');
            });
          // Otherwise, le enviamos un sms con el código de confirmación de la cuenta
          }else{
            async function conseguirPhoneCodeHash(){
              response = await telegram('auth.sendCode', {
                phone_number  : phone.number,
                sms_type : 1,
                api_id        : 85721,
                api_hash      : '3f93a7cd550c0599884616ed325c4427',
                lang_code : 'en'
              });
            }
            conseguirPhoneCodeHash().then(()=>{
              phone.phone_code_hash = response.phone_code_hash;
              client.emit('nextStep');
            });
          }
        });
    });

    client.on('setCode',(data)=>{
      phone.code = data;
      async function conseguirPhoneUser(){
        phone.user = await telegram('auth.signIn', {
          phone_number   : phone.number,
          phone_code_hash: phone.phone_code_hash,
          phone_code     : phone.code
        })
      }
      conseguirPhoneUser().then(()=>{
        console.log('Conectado como:\n', phone.user);
        async function conseguirContactos(){
          response = await telegram('contacts.getContacts', {});
        }
        conseguirContactos().then(()=>{
          console.log('Respuesta:', response);
          async function conseguirChat(){
            response = await telegram('messages.getChats',{
              chats : [4561094]
            });
          }
          conseguirChat().then(()=>{
            console.log("En teoría Chat con Isma:", response);
          });
        });
      });
    });
});