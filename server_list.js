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

////////////////////////////////////

const fs=require("fs")
const commonPackCache={}
function load(i){
  if(i>=16800)return
  var path="dist/assets/models/huayi/"+i+".zip"
  fs.readFile(path, function (err, buffer) {//读取文件//将模型数据读取到buffer中，buffer应该是字符串类型的数据
    commonPackCache[path.split("huayi/")[1]]=buffer  
    load(i+1)
    process.stdout.write('正在缓存数据包'+(i+1)+'/16800\t\r')
  });
}
load(0)
const server=require('http').createServer(function (request, response) {
    var filePath;
    response.setHeader("Access-Control-Allow-Origin", "*");
    request.on('data', function (data) {//接受请求
        filePath=String.fromCharCode.apply(null,data)
    });
    request.on('end', function () {//返回数据
      var path=filePath
      var buffer=commonPackCache[path.split("huayi/")[1]]
      if(buffer){//有缓存
        console.log(path)
        response.write(buffer);
        response.end();
      }
    });
}).listen(8081, '0.0.0.0', function () {
    console.log("listening to client:8081");
});
server.on('close',()=>{
  console.log('服务关闭')
})
server.on('error',()=>{
  console.log('服务发送错误')
})
server.on('connection',()=>{
  console.log('服务连接')
})
server.on('timeout',()=>{
  console.log("监听超时")
})
//https://blog.csdn.net/NI_computer/article/details/109362820  
