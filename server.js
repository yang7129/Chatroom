
var express = require('express');
var http = require('http');
var app = express();
app.get('/', function(req, res){
    res.send('hello! express！ this is a index');
});
var server = http.createServer(app);
server.listen(8080);
// var server = http.createServer(app);
// app.get('/',function(request, response){ //我們要處理URL為 "/" 的HTTP GET請求
//     // response.charset = 'utf-8';
//     // response.send('你好！some html');
//     response.end('Hello World'); //作出回應
// });
// server.listen(8080,'10.16.1.63',function(){
//     console.log('HTTP伺服器在 http://10.16.1.63:8080/ 上運行');
// });