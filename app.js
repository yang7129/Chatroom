var express = require('express'); 
var http = require('http');
 
var app = express();
var io = require('socket.io');
var fs = require('fs');  

 
var multer  = require('multer'); 
var storage	=	multer({
  destination: function (req, file, callback) {
    callback(null, './uploads');
  },
  filename: function (req, file, callback) {
    callback(null, file.fieldname + '-' + Date.now());
  }  
});
var upload = multer({ dest: './views/uploads' }).single('Upfile');
var port = 8080;
//app.use(express.static(__dirname + '/views'));  
app.use('/', express.static(__dirname + '/views'));     
app.post('/file_upload', function(req, res) {
    upload(req, res, function(err) {
        if (req.file == undefined){
          return  res.json({ code: 200, msg: { url: '找不到檔案' } });
        };
        // console.log(req.body); 
        // console.log(req.file ); 
        var tmpPath = req.file.path;
        var targetPath = tmpPath.replace(req.file.filename, req.file.originalname);
        fs.rename(tmpPath, targetPath, function(err) {
            if (err) throw err;
            fs.unlink(tmpPath, function() {
                //console.log('File Uploaded to ' + targetPath + ' - ' + req.file.size + ' bytes');
            });
        });

        if (err) {
            return res.end("上傳檔案發生錯誤");
        }
        if (req.file.mimetype.indexOf('image') > -1) { 
            res.json({ code: 200, msg: { url: '<img src="' + 'http://10.16.1.63:' + port + targetPath.replace('views\\', '/').replace('\\', '/') + '" />' } });
        } else { 
            res.json({ code: 200, msg: { url: '<a href="' + 'http://10.16.1.63:' + port + targetPath.replace('views\\', '/').replace('\\', '/') + '" target="_blank">' + req.file.originalname + '下載</a>' } });
        } 
    }); 
}); 
var server = http.createServer(app);
io = io.listen(server);
server.listen(port);
console.log('server listen ' + port);
//聊天室
var users = [];
io.sockets.on('connection', function(socket) {
    //on JA
    socket.on('online', function(data) {
        socket.name = data;
        if (users.indexOf(data) > -1) {
            socket.emit('nickExisted');
        } else {
            socket.nameindex = users.length;
            users.push(socket.name);
        }
        writeLog(socket.name + '進來了');
        socket.broadcast.emit('online', { message: socket.name + '進來了', count: users });
    });
    socket.on('fromClient', function(data) {
        writeLog(data.name + ":" + data.message);
        if (users.indexOf(data.name) == -1) {
            socket.name = data.name;
            socket.nameindex = users.length;
            users.push(socket.name);
            socket.broadcast.emit('online', { message: socket.name + '重新連接', count: users });
        }
        socket.broadcast.emit('fromserver', { name: data.name, message: data.message, count: users });
    });
    socket.on('disconnect', function() {
        if (socket.name === undefined) { } else {
            if (users.indexOf(socket.name) > -1) {
                writeLog(socket.name + '離線了');
                users.splice(socket.nameindex, 1);
                socket.broadcast.emit('offline', { message: socket.name + '離線了', count: users });
            }
        };
    });
    socket.on('Usercount', function() {
        socket.broadcast.emit('Usercount', users);
    });
});
function writeLog(msg) { 
    fs.appendFile(__dirname + '/' + new Date().toLocaleDateString() +  'Log.txt', msg + "|" + new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString() + '\r\n' , 'utf8',function(error){ //把資料寫入檔案
    if(error){ //如果有錯誤，把訊息顯示並離開程式
        console.log('檔案寫入錯誤' + error );
    }});
};
