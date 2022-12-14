import { Viewer } from './viewer.js';//import { Viewer } from './viewerSampling';//决定是进行正常加载展示，还是进行可见度采样
// if(!window.loadSubZip3_worker0)window.loadSubZip3_worker0=new Worker("../lib/myWorker/loadSubZip.js")//决定是否使用双线程的方式加载
class App
{
  constructor (el) 
  {
    console.log("version:000")
    this.el = el;
    this.viewer = null;
    this.viewerEl = null;

    if (this.viewer) this.viewer.clear();

    var parseUrlParams = function()
    {
      var urlParams = window.location.href;
      var vars = {};
      var parts = urlParams.replace(/[?&]+([^=&]+)=([^&]*)/gi,
          function (m, key, value) {
              vars[key] = decodeURIComponent(value);
          });
          
      return vars;
    }

    var paramJson = parseUrlParams();

    this.createViewer(paramJson);
    
    // this.viewer.load([{
    //   url:'assets/models/huayirvm0616-0.zip', 
    //   tag: 1
    // }])
    this.viewer.load([])//加载数组中的数据包并开启渐进式加载

  }

  createViewer(paramJson) 
  {
    this.viewerEl = document.createElement('div');
    this.viewerEl.classList.add('viewer');
    this.el.appendChild(this.viewerEl);
    this.viewer = new Viewer(this.viewerEl, {
      baked: paramJson['baked'],
    });
    return this.viewer;
  }
}

var app = null;
document.addEventListener('DOMContentLoaded', () => {

  app = new App(document.body);

});
