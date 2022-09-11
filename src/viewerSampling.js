window.SamplingOfVisibilityFlag=true//用于标记现在是可见度采样模式
import {
  Box3,
  DirectionalLight,
  PerspectiveCamera,
  Scene,
  Vector3,
  WebGLRendererEx,
  sRGBEncoding,
  Object3D,
  BufferGeometry,
  BufferAttribute,
  MeshBasicMaterial,
  Mesh,
  BoxHelper,
  Matrix4,
  BoxGeometry,
  CameraHelper,
  Color,
  Frustum,
  SphereGeometry
} from '../lib/three/build/three';

import Stats from '../lib/three/examples/jsm/libs/stats.module.js';
//import {OrbitControls} from '../lib/three/examples/jsm/controls/OrbitControls.js';
import {PlayerControl} from '../lib/myThree/PlayerControl.js';

import { GUI } from 'dat.gui';

import { SLMLoader } from '../lib/SLMLoader';

import{Panel} from "./Panel"
// import{DifferenceAnalyzer} from "./DifferenceAnalyzer.js"
export class Viewer 
{
  constructor (el, options) 
  {
    this.el = el;
    this.options = options;

    this.lights = [];
    this.content = null;

    this.gui = null;

    this.prevTime = 0;

    this.stats = new Stats();
    this.stats.dom.height = '48px';
    [].forEach.call(this.stats.dom.children, (child) => (child.style.display = ''));

    this.scene = new Scene();
    window.scene=this.scene
    console.log("scene:",this.scene)

    const fov = 60;
    this.defaultCamera = new PerspectiveCamera(60, 1, 0.1, 30000);//近视点过小会导致遮挡剔除错误
    window.c=this.defaultCamera
    //this.defaultCamera = new PerspectiveCamera(fov, el.clientWidth / el.clientHeight, 0.1, 700);
    this.activeCamera = this.defaultCamera;
    this.scene.add(this.defaultCamera);
    this.activeCamera.layers.enableAll();

    this.sceneEx = new Scene();
    this.sceneEx.add(this.defaultCamera);

    if(window.SamplingOfVisibilityFlag){
      this.renderer = window.renderer =new WebGLRendererEx({
        antialias: false,//关闭抗锯齿
        preserveDrawingBuffer: true});//将每一帧缓存到renderer.domElement中
        console.log("this.renderer",this.renderer)
      this.renderer.outputEncoding = sRGBEncoding;
      this.renderer.setClearColor(0xffffff);//(0xcccccc);
    }else{
      this.renderer = window.renderer = new WebGLRendererEx({antialias: true});
      this.renderer.setClearColor(0x56BCEF);//this.renderer.setClearColor(0xcccccc);
    }
    this.renderer.physicallyCorrectLights = true;
    this.renderer.outputEncoding = sRGBEncoding;
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(el.clientWidth, el.clientHeight);
    this.renderer.autoClear = false;

    new PlayerControl(this.activeCamera,new Vector3(0,0,0))
    //this.controls = new OrbitControls(this.defaultCamera, this.renderer.domElement);
    //this.controls.autoRotate = false;
    //this.controls.autoRotateSpeed = -10;
    //this.controls.screenSpacePanning = true;

    this.el.appendChild(this.renderer.domElement);

    this.slmLoader = new SLMLoader(
      {
        EnablePicking: true,
        renderer: this.renderer,
        scene: this.scene,
        sceneOccluder: this.scene,
        el: this.el,
        EnableCulling: true,
      }
    );

    this.showgui = true;

    if (this.showgui)
    {
      this.addGUI();
    }

    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
    //window.addEventListener('resize', this.resize.bind(this), false);
    //开始设置图片大小
    this.defaultCamera.aspect = 1;
    this.defaultCamera.updateProjectionMatrix();
    this.renderer.setSize(800, 800);
    //完成设置图片大小
    this.setupScene();

    /**************************************************************/

    new Panel()
  }

  animate(time)
  {
    requestAnimationFrame(this.animate);

    this.stats.update();

    this.render();

    this.prevTime = time;
  }

  render() 
  {
    this.slmLoader.render(this.activeCamera, this.sceneRootNodeEx ? this.sceneRootNodeEx.matrixWorld: null);

    this.renderer.clear();
    
    this.renderer.render(this.scene, this.activeCamera);

    this.renderer.render(this.sceneEx, this.activeCamera);
  }

  resize() 
  {
    const {clientHeight, clientWidth} = this.el.parentElement;

    this.defaultCamera.aspect = clientWidth / clientHeight;
    this.defaultCamera.updateProjectionMatrix();
    this.renderer.setSize(clientWidth, clientHeight);
  }

  load(scenes, finishCallback)
  {
    console.log("scenes",scenes)
    var scope = this;
    this.slmLoader.LoadScene(scenes, function(slmScene, _tag, bvhScene)
      {
        console.log('get scene: ' + _tag);

        console.log(slmScene);
        
        scope.addSceneModel(slmScene,_tag);
      }, function()
      {
        console.log('all scene loaded');

        if (finishCallback)
        {
          finishCallback();
        }
      }, function(slmScene, _tag)
      {
        console.log(slmScene);
        
      });
  }

  addSceneModel(sceneModel,tag)
  {
    if (!this.sceneRootNode)
    {
      this.sceneRootNode = new Object3D();
	    this.sceneRootNode2 = new Object3D();
      this.sceneRootNodeEx = new Object3D();

      this.scene.add(this.sceneRootNode);
	    this.scene.add(this.sceneRootNode2);
      this.sceneEx.add(this.sceneRootNodeEx);
    }

    if(tag==1)
    {
      console.log('tag  1');
      this.uniformScene(sceneModel, 50,this.sceneRootNode);
      this.uniformScene(sceneModel, 50,this.sceneRootNodeEx);

      //this.sceneRootNodeEx.position.x += 3.6;
      //this.sceneRootNodeEx.position.y += 8.8;
      //this.sceneRootNodeEx.scale.copy(this.sceneRootNode.scale);
      
      console.log(this.sceneRootNodeEx);

      this.sceneRootNode.add(sceneModel);
	  }
	  else if(tag==2)
    {
      this.uniformScene(sceneModel, 50,this.sceneRootNode2);
      this.sceneRootNode2.add(sceneModel);
	  }
  }

  uniformScene(sceneModel, _uniforSize, sceneRootNode)
  {
    // Uniform model
    var uniformSize = _uniforSize ? _uniforSize : 20;

    var objBox3 = new Box3().setFromObject(sceneModel);

    var centerOffset = new Vector3();
    centerOffset.x = -(objBox3.min.x + objBox3.max.x) * 0.5;
    centerOffset.y = -(objBox3.min.y + objBox3.max.y) * 0.5;
    centerOffset.z = -(objBox3.min.z + objBox3.max.z) * 0.5;

    var maxSize = Math.max((objBox3.max.x - objBox3.min.x), Math.max((objBox3.max.y - objBox3.min.y), (objBox3.max.z - objBox3.min.z)));
    var scale = uniformSize / maxSize;

    sceneRootNode.scale.x = scale;
    sceneRootNode.scale.y = scale;
    sceneRootNode.scale.z = scale;

    sceneRootNode.translateX(centerOffset.x * scale);
    sceneRootNode.translateY(centerOffset.y * scale);
    sceneRootNode.translateZ(centerOffset.z * scale);

    console.log(sceneRootNode);
  }

  setupScene() 
  {
    this.setCamera();

    this.addLights();

    window.content = this.content;
  }

  setCamera() 
  {
    //this.controls.reset();

    this.defaultCamera.position.copy(new Vector3(60.0, 0.0, 0.0));
    this.defaultCamera.lookAt(new Vector3());
    window.c=this.defaultCamera
    window.c.position.set(1849.562616502339, 69.33617617892469,  -1610.9347549670836)
    window.c.rotation.set(-1.585602892801581,  0.777187636188975,  1.5919084434849553)

    //this.controls.target = new Vector3(0.0, 0.0, 0.0);

    //this.controls.enabled = true;
    this.activeCamera = this.defaultCamera;

    //this.controls.saveState();
  }

  addLights ()
  {
    if (!this.options || !this.options.baked)
    {
      const directionalLight  = new DirectionalLight(0xFFFFFF, 3.5);
      directionalLight.position.set(0.5, 1.2, 0.5);
  
      this.scene.add(directionalLight);
    }
  }

  addGUI() 
  {
    const gui = this.gui = new GUI({autoPlace: false, width: 260, hideable: true});

    const perfFolder = gui.addFolder('Performance');
    const perfLi = document.createElement('li');
    this.stats.dom.style.position = 'static';
    perfLi.appendChild(this.stats.dom);
    perfLi.classList.add('gui-stats');
    perfFolder.__ul.appendChild( perfLi );

    const guiWrap = document.createElement('div');
    this.el.appendChild( guiWrap );
    guiWrap.classList.add('gui-wrap');
    guiWrap.appendChild(gui.domElement);
    gui.open();
  }
  SetComponentMatrix(componentKey,matrix){
	//  let componentID=this.slmLoader.GetElementPickingIdByKey(componentKey);
	  let componentID=componentKey;
	  if(componentID!=null){
		var mat0 = new Matrix4();
		mat0.multiply(this.slmLoader.GetElementMatrix(componentID)).multiply(this.slmLoader.GetElementGroupMatrix(componentID));
	
		var center = this.slmLoader.GetElementBoundsCenter(componentID);
		var trans0 = new Matrix4().makeTranslation(center.x, center.y, center.z);
		var rot = matrix;
		var trans1 = new Matrix4().makeTranslation(-center.x, -center.y, -center.z)
		
		var mat1 = new Matrix4();
		mat1.multiply(trans0).multiply(rot).multiply(trans1);
		
		var finalMat = new Matrix4();
		finalMat.multiply(mat1).multiply(mat0);

		var elemDesc = this.slmLoader.GetElementDesc(componentID);
		elemDesc.mesh.setInstanceMatrixAt(elemDesc.gId, elemDesc.iId, finalMat);
		elemDesc.mesh.instanceMatrices[elemDesc.gId].needsUpdate = true;
		console.log("设置构件变化矩阵成功");
	  }
	  else{
		console.log("设置构件变化矩阵失败,当前key值无效");
		return false;
	  }
  }
};

