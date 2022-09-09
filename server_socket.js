console.log('version:01')
var path0="./"//"dist\\assets\\models"
var jsonFile = require('jsonfile')


var data={}
function load(index){
  var fileName = 'dist/visibility/['+index+']7.ls_d_index.json'
  jsonFile.readFile(path0+"\\"+fileName, function(err, jsonData) {
    console.log(fileName)
    if (err) throw err;
    data[index]=jsonData
    if(index+1<=6)load(index+1)
    else console.log("Loading complete")  //console.log(jsonData["43"])
  });
}
load(1)




////////////
var nodeStatic = require('node-static');
var http = require('http');

var fileServer = new(nodeStatic.Server)();
var app = http.createServer(function(req, res) {
  fileServer.serve(req, res);
}).listen(8887);

var io = require('socket.io').listen(app);
io.sockets.on('connection', function(socket) {
  socket.emit('receive', "origin:server")
  socket.on('listen', data=> console.log(data))
  socket.on('send', message=> {
    console.log(message)
    socket.broadcast.emit('receive', message)
  })
  socket.on('channel1', message=> {
    console.log(message)
    socket.broadcast.emit('channel1', message)
  })
  socket.on('index', index=> {
    var data0={}
    for(var i=1;i<=6;i++){
      var list=data[i][index]
      if(typeof(list)=="undefined")list=[]
      data0[i]=list
    }
    // var list=data[index]
    
    console.log(index)
    // console.log({index:list})
    socket.emit('list', {index:index,data0:data0})
    // socket.broadcast.emit('index', message)
  })
  // socket.on('join', roomId=> socket.join(roomId))
  // socket.on('roomSend', data=> io.sockets.in(data.room).emit('receive', data.message))
});

