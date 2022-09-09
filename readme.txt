http://www.shxt3d.com:1012/
-----------------------------------------------------
http://localhost:3000/?scene=KaiLiNan&useP2P=true&onlyP2P=true

http://localhost:3000/?scene=KaiLiNan&useP2P=true
http://localhost:3000/?scene=KaiLiNan&useP2P=true&onlyP2P=true&needDetection=true
http://100.66.196.213:3000/?scene=KaiLiNan&useP2P=true
http://100.66.196.213:8082/?scene=KaiLiNan&useP2P=true&onlyP2P=true&needDetection=true
-----------------------------------------------
目前可以做的优化：
  高延迟原因(改为单线性就没有这个问题了)
  初始包打包(似乎不是很需要)
  大构件简化
  有一些时候会出现通信错误(远程访问时没有遇到这个问题)
  分块计算可见度
  用安宁的完全状态的模型进行处理



可见度计算现在最重要的问题是准确性，现在准确性看起来非常差的可能原因：
	采样间距过大
	遮挡方向设置错误
	...

单方向效果测试：
1767, 25, -1619（边缘）
  0
  1
  2正确
  3正确
  4
  5正确
1789, 17, -1597（内部）
  0正确
  1正确
  2正确
  3?
  4存在误差
  5存在误差
结论：结果是正确的，误差可能是没有完成加载导致的

遮挡剔除判断
1789, 17, -1597（内部）
  基本正确，但存在误差



----------------------代码说明----------------------
SLMLoader.js :
  加载zip压缩包
    SLMSceneParser.load()
  模型资源的解析
	loadScene()#可以用于控制整个场景的变换
	loadScene()中的scope.sceneMgr.PushSceneTask最终会调用InstanceNode
  实例化还原
	InstanceNode()
  解析从压缩包中解析出来的模型资源
	new GLTFLoaderEx(loadingManager)
viewer.js:
  可以设置光照效果
----------------------资源说明----------------------
structdesc.json：#对应拆分后gltf文件的个数 #材质的个数
    数组
    元素为数组对应mesh(同一种材质的所有构件)(第k个元素对应output.glb中的mesh_0_k)
    mesh的结构信息也用数组表示，每个单元表示一个构件
    示例：{i: 1, n: "0", c: 12, s: 0}
        i：构件编号
        n：实例组名？
        c：构件中的三角面个数
        s：构件对应的在mesh对象中三角面的起始编号

smatrix.json   #形状的个数
    每个键值对对应一个实例化对象
    id对应编号 ：编号在解析渲染的时候没有什么作用
    it对应矩阵 ：矩阵用于实例化

----------------------资源说明----------------------
function loadSubZip (url, back) {//assets\models\SAM_Review_1\output1.zip
	var loader=new LoadingManager()
	new Promise( function( resolve, reject ) {
		//加载资源压缩包
		new ZipLoader().load( url).then( ( zip )=>{//解析压缩包
			loader.setURLModifier( zip.urlResolver );//装载资源
			resolve({//查看文件是否存在？以及路径
				fileUrl: zip.find( /\.(gltf|glb)$/i )[0]
			});
		} );
	} ).then( function ( configJson ) {
		new GLTFLoaderEx(loader).load(configJson.fileUrl, (gltf) => {//解析模型资源
			if(back)back(gltf)
		});
	} );
}




new Color(
    ((c & 0xff0000) >> 16)/255.,
    ((c & 0x00ff00) >> 8)/255.,
    (c & 0x0000ff)/255.
)})
