//config.loading；加载数据包
//window.param.projectName: 用于获取config.json的地址
//window.c : 判断视点的位置和相机是否移动
import {
    Frustum,//用于视锥剔除
    Matrix4,//用于视锥剔除
} from '../three/build/three.js';
export {Visibility}
class Visibility{//最好再加入遮挡剔除
    constructor(config) {
        var scope=this
        scope.border=false//判断视点是否在场景边缘的标记
        this.loading=config.loading
        scope.list_shell=window.config.list_shell
        
        var list1=Array.from(Array(100)).map((e, i) => this.list_shell[i])
		var list2=Array.from(Array(100)).map((e, i) => this.list_shell[i+100])
		var list3=Array.from(Array(100)).map((e, i) => this.list_shell[i+200])
        setTimeout(()=>{
            scope.loading(list3)
		    scope.loading(list2)
        },200)
		
		this.loading(list1)
        var socketURL="http://100.80.225.141:5000"//"localhost:8887"//"122.224.63.190:38080"//
        // this.socket=this.initSocket(socketURL)
        // window.socket=this.socket
        
        scope.areaInf=[
            {
                "min": [
                    1747,
                    -27,
                    -1669
                ],
                "max": [
                    1841,
                    45,
                    -1535
                ],
                "step": [
                    47,
                    36,
                    67
                ],
                "path":"./assets/models/huayirvm0616-0.log/6.ls_d.json",
                "preload":false
            },
            // {
            //     "max": [3080.75, 79.75, -1251.25], 
            //     "min": [1643.25, -32.75, -2638.75], 
            //     "step": [115, 9, 111],
            //     "path":"./assets/models/huayirvm0616-0.log/6.ls_d.json",
            //     "preload":false
            // }
        ]
        //data
        scope.prePoint="";//视点移动就进行加载 (或者添加了新的模型) //window.c.position.x+","+window.c.position.y+","+window.c.position.z
        scope.prePoint2="";//视点移动就进行渲染剔除 (或者添加了新的模型) //window.c.position.x+","+window.c.position.y+","+window.c.position.z

        var s=scope.areaInf[0].step
        // console.log((s[0]+1)*(s[1]+1)*(s[2]+1) )
        this.visualList=Array.from(Array( (s[0]+1)*(s[1]+1)*(s[2]+1) )).map((e, i) => false)
        this.visualList_request=Array.from(Array( (s[0]+1)*(s[1]+1)*(s[2]+1) )).map((e, i) => false) //判断是否已经发出对应数据包的请求
        scope.dynamicLoading()//加载和预加载
        scope.start2()//遮挡剔除和视锥剔除
    }
    initSocket(socketURL){
        var scope=this
        var socket = io.connect(socketURL,{transports:['websocket','xhr-polling','jsonp-polling']})
        socket.on('channel1',  data=> {
            console.log(data)
        })
        socket.on('list',  message=> {
            // console.log(data)
            scope.visualList[parseInt(message.index)]=message.data0
            scope.prePoint=Math.random()//接下来进行加载
        })
        //socket.emit('message', {"test":123})
        return socket
    }
    request(posIndex){
        if(!this.socket)
            return this.request0_flask(posIndex)//this.request0_flask({"index":index})
        var index=posIndex[3]
        if(!this.visualList_request[index]){
            this.socket.emit(
                'index', 
                index
            )
            this.visualList_request[index]=true//已经完成了请求
        }
    }
    request0_flask(posIndex){
        var scope=this
        var index=posIndex[3]
        if(!this.visualList_request[index]){
            // var str=JSON.stringify(data)
            var sendData=index
            var oReq = new XMLHttpRequest();
            oReq.open("GET", "http://localhost:5000"+"?text="+sendData+"&sceneName=huayi_113", true);
            oReq.responseType = "arraybuffer";
            oReq.onload = function () {//接收数据
                var unitArray=new Uint8Array(oReq.response) //网络传输基于unit8Array
                var str=String.fromCharCode.apply(null,unitArray)
                // console.log(str)
                // console.log(JSON.parse(str))
                var message=JSON.parse(str)
                scope.visualList[parseInt(message.index)]=message.data0
                scope.prePoint=Math.random()//接下来进行加载
            }
            oReq.send(JSON.stringify({ 'type':'test'}));//发送请求

            this.visualList_request[index]=true//已经完成了请求
        }

        
      }
    dynamicLoading(){//用于加载和预加载
        var scope=this
		var first=true
		setInterval(()=>{
					var point0=window.c.position.x+","+window.c.position.y+","+window.c.position.z
                    if(this.prePoint===point0){//如果视点没有移动
						if(first){//如果是第一次
                            var list_data=this.getList()
                            if(list_data){
                                var directs=scope.getDirect()
                                var list2=[]
                                for(var i=0;i<5;i++){//不进行遮挡判断
                                    var direct=directs[i]+1
                                    var list=list_data[direct]
                                    for(var j=0;j<list.length;j++)
                                        if(!window.meshes[list[j]])
                                            list2.push(list[j])        
                                }
                                if(list2.length>0)
                                    scope.loading(list2)
                            }
							first=false
						}
					}else {//如果视点发生了移动
						scope.prePoint=point0
						first=true
					}
		},200)
		console.log("开始动态加载资源")
    }
    start2(){//用于渲染的遮挡剔除
        var scope=this
        var prePoint2_rot=""
        
		function setInterval0(){
            requestAnimationFrame(setInterval0)
            var point0=window.c.position.x+","+window.c.position.y+","+window.c.position.z
            var point0_rot=window.c.rotation.x+","+window.c.rotation.y+","+window.c.rotation.z
            if(scope.prePoint2!==point0||prePoint2_rot!=point0_rot){//如果视点位置或方向变化就进行剔除
                // scope.cullingFrustum()
                var list_data=scope.getList()
                if(list_data){//如果知道此刻的可见度列表
                    for(var i in window.meshes){
                        window.meshes[i].visible=false
                        // window.meshes[i].Obscured=true//被遮挡，不可见
                    }
                    var directs=scope.getDirect()
                    for(var i=0;i<5;i++){//遮挡剔除
                        var direct=directs[i]+1
                        var list=list_data[direct]
                        for(var j=0;j<list.length;j++){
                            var mesh0=window.meshes[list[j]]
                            if(mesh0)mesh0.visible=true
                        }
                    }
                    var count=0
                    for(var i in window.meshes){
                        if(window.meshes[i].visible)count++
                    }
                    // console.log(count)

                }//if(list_data)
                scope.displayShell()
            }
            scope.prePoint2=point0 
            prePoint2_rot=point0_rot
		}setInterval0()
		console.log("开始进行遮挡剔除")  
    }
    displayShell(){
        if(true){//if(this.border){//始终展示外壳
            for(var i=0;i<this.list_shell.length;i++){
                var index=this.list_shell[i]
                var mesh=window.meshes[index]
                if(mesh)mesh.visible=true
            }
        }
    }
    getDirect(){
        var d=window.c.getWorldDirection()
        var d0={x: 0, y: 0, z: -1}  //  //[0,0,0]
        var d1={x: 0, y: 1, z: 0}   //上//[Math.PI/2,0,0]
        var d2={x: 0, y: 0, z: 1}   //  //[Math.PI,0,0]
        var d3={x: 0, y: -1, z: 0}  //下//[Math.PI*1.5,0,0]
        var d4={x: -1, y: 0, z: 0}  //  //[0,Math.PI/2,0]
        var d5={x: 1, y: 0, z: 0}   //  //[0,-Math.PI/2,0]
        var getMul=(a,b)=>{return a.x*b.x+a.y*b.y+a.z*b.z}
        var angle=[
            getMul(d,d0),getMul(d,d1),getMul(d,d2),getMul(d,d3),getMul(d,d4),getMul(d,d5)
        ]
        var min=0,max=0
        for (var i=1;i<6;i++){
            if(angle[i]>angle[max])max=i
            if(angle[i]<angle[min])min=i
        }

        return selectSort(angle)//{max:max,min:min}
        function selectSort(array) {//>,>,> 降序排序
            var array2=[0,1,2,3,4,5]
            const len = 6//array.length
            let temp
            let minIndex
            for (let i = 0; i < len - 1; i++){ //逐个选出最大
              minIndex = i//
              for (let j = i + 1; j < len; j++) {
                if (array[j] >= array[minIndex]) {
                  minIndex = j//指向最大的元素
                }
              }// for (let j = i + 1; j < len; j++)
              temp = array[i]
              array[i] = array[minIndex]
              array[minIndex] = temp

              temp=array2[i]
              array2[i] = array2[minIndex]
              array2[minIndex] = temp
            }//for (let i = 0; i < len - 1; i++) 
            return array2
        }//function selectSort(array)
    }   
    getList(){
        var posIndex=this.getPosIndex(
            this.areaInf[0].min,
            this.areaInf[0].step,
            this.areaInf[0].max)
        var list=this.visualList[posIndex[3]]
        if(!list)this.request(posIndex)
        return list//[ posIndex ,this.visualList[posIndex[3]] ]
    }
    getPosIndex(min,step,max){
        var min,step,max
        var x=window.c.position.x
        var y=window.c.position.y
        var z=window.c.position.z
        if(x>max[0]||y>max[1]||z>max[2]||x<min[0]||y<min[1]||z<min[2]){
            this.border=true
            if(x>max[0])x=max[0]
            if(y>max[1])y=max[1]
            if(z>max[2])z=max[2]
            if(x<min[0])x=min[0]
            if(y<min[1])y=min[1]
            if(z<min[2])z=min[2]
        }else this.border=false

        
        
        var dl=[]
        for(var i=0;i<3;i++)
            dl.push(
                (max[i]-min[i])/step[i]
            )
        
        var xi=Math.round((x-min[0])/dl[0])
        var yi=Math.round((y-min[1])/dl[1])
        var zi=Math.round((z-min[2])/dl[2])
        window.pos=[
            xi*dl[0]+min[0],
            yi*dl[1]+min[1],
            zi*dl[2]+min[2]
        ]

        var s=step
        var index=xi*(s[1]+1)*(s[2]+1)+yi*(s[2]+1)+zi
        return [xi,yi,zi,index]
    } 
    loadJson(path,cb) {
        var request = new XMLHttpRequest();
        request.open("get", path);//请求方法,路径
        request.send(null);//不发送数据到服务器
        request.onload = function () {//XHR对象获取后
            if (request.status === 200) {//获取成功的状态码
                var str=request.responseText
                cb(JSON.parse(str),path)
            }
        }
    }
    cullingFrustum(){//视锥剔除
        if(!window.meshes)return
        if(!this.cullingFrustumNotFirstFlag){
            this.cullingFrustumNotFirstFlag=true
            return//跳过第一次的视锥剔除
        }//第一次的视锥剔除会出错，出错的原因现在还不清楚//出错原因可能是一帧无法完成全部包围球遮挡判断的计算 //出错的原因可能是初始数据包的解析问题
        
        var frustum = getFrustum(window.c)
        for(let i in window.meshes){//for(let i=0; i<window.meshes.length; i++){
            var m=window.meshes[i]
            if(!m.Obscured)
                m.visible=intersectSpheres(m.bounding_sph, frustum)
        }
        function getFrustum(camera){
            var frustum = new Frustum();
            frustum.setFromProjectionMatrix( new Matrix4().multiplyMatrices( camera.projectionMatrix, camera.matrixWorldInverse ) );
            return frustum;
        }
        function intersectSpheres(spheres, frustum){
            if(spheres)
            for(let i=0; i<spheres.length; i++)
                if(intersectSphere(spheres[i].center, spheres[i].radius, frustum))
                    return true
            return false
            function intersectSphere(center, radius, frustum) {
                const planes = frustum.planes;
                const negRadius = - radius;
                for(let i=0; i<planes.length; i++){
                    const distance = planes[ i ].distanceToPoint( center );//平面到点的距离，
                    if ( distance < negRadius ) //内正外负
                        return false;//不相交
                }
                return true;//相交
            }
        }
    }
    cullingFrustum1(mesh_id){//用于预加载的视锥剔除判断
        if(!window.meshes)return
        if(!this.bounding_sph)return
        var frustum = getFrustum(window.c)
        var bounding=this.bounding_sph[mesh_id]
        //console.log(frustum)
        //console.log(bounding)
        for(var i=0;i<bounding.c.length;i++){
            if(intersectSphere(bounding.c[i], bounding.r, frustum))
                return true//相交
        }
        return false//不相交

        function getFrustum(camera){
            var frustum = new Frustum();
            frustum.setFromProjectionMatrix( new Matrix4().multiplyMatrices( camera.projectionMatrix, camera.matrixWorldInverse ) );
            return frustum;
        }
        function intersectSphere(center, radius, frustum) {
            const planes = frustum.planes;
            const negRadius = - radius;
            for(let i=0; i<planes.length; i++){
                const distance = planes[ i ].distanceToPoint( center );//平面到点的距离，
                if ( distance < negRadius ) //内正外负
                    return false;//不相交
            }
            return true;//相交
        }
    }
    cullingFrustum1_2(mesh_id){//用于预加载的视锥剔除判断
        if(!window.meshes)return
        if(!this.bounding_sph)return
        var frustum = getFrustum(window.c)
        var bounding=this.bounding_sph[mesh_id]
        //console.log(frustum)
        //console.log(bounding)
        for(var i=0;i<bounding.c.length;i++){
            if(intersectSphere(bounding.c[i], bounding.r, frustum))
                return true//相交
        }
        return false//不相交

        function getFrustum(camera){
            var frustum = new Frustum();
            frustum.setFromProjectionMatrix( new Matrix4().multiplyMatrices( camera.projectionMatrix, camera.matrixWorldInverse ) );
            return frustum;
        }
        function intersectSphere(center, radius, frustum) {//上下左右前(远)后(近)
            getSpace(frustum,1,1)
            function getSpace(frustum,a1,a2){
                return [
                    [1,1,1,1],
                    [1,1,1,1],
                    [1,1,1,1],
                    [1,1,1,1],
                    [1,1,1,1],
                    1
                ]
            }

            var position=window.c.position
            if(center.x*position.x+center.y*position.y+center.z*position.z>Math.pow(frustum[4].constant-frustum[5].constant,2))
                return false
            const planes = frustum.planes;
            if ( planes[5].distanceToPoint( center ) < - radius ) //内正外负
                    return false;//不相交
            
            return true;//相交
        }
    }
}
