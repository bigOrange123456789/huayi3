const fs=require("fs")
const commonPackCache={}
function load(i){
  if(i>=16800){return;}
  var path="dist/assets/models/huayi/"+i+".zip"
  fs.readFile(path, function (err, buffer) {//读取文件//将模型数据读取到buffer中，buffer应该是字符串类型的数据
    commonPackCache[path.split("huayi/")[1]]=buffer  
    load(i+1)
    process.stdout.write('正在缓存数据包'+(i+1)+'/16800\t\r')
  });
}
load(0)
class Node {
  constructor(value) {
      this.item = value;
      this.next = null
  }
}
class Line {
  constructor() {
      this.header = {
          next: null
      };
      this.length = 0
  }
  //尾部插入
  append(element) {
      const node = new Node(element)
      if (this.isEmpty()) {
          this.header.next = node

      } else {
          let LastNode = this.header.next
          while (LastNode.next != null) {
              LastNode = LastNode.next
          }
          LastNode.next = node
      }
      this.length += 1
  }
  //任意位置插入
  insert(position, element) {
      if (position < 0 || position > this.size()) {
          console.log('插入位置失败！')
          return
      }
      const node = new Node(element)
      let insertNode = this.header
      while (position > 0) {
          insertNode = insertNode.next
          position--
      }
      //开始插入
      node.next = insertNode.next
      insertNode.next = node
      this.length += 1
  }
  //任意位置删除
  deleteAt(position) {
      if (position < 0 || position > this.size()) {
          console.log('删除位置失败！')
          return
      }
      let deleteNode = this.header
      while (position > 0) {
          deleteNode = deleteNode.next
          position--
      }
      const deleteNextNode = deleteNode.next
      deleteNode.next = deleteNextNode.next
      this.length -= 1
  }
  delete() {
  }
  //是否是空链表
  isEmpty() {
      if (this.length === 0) {
          return true
      } else {
          return false
      }
  }
  //链表的长度
  size() {
      return this.length
  }
  //链表的数据
  toValue() {
      return this.header
  }
}
const server=require('http').createServer(function (request, response) {
    var communication={
      request:request,
      response:response,
    }
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
        response.write(buffer)
        response.end()
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