
/*
*  EmpatiJS
*  Empati Lab
*  Author: Necati Kaan INEL
*/

"use strict";

const COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
const DEFAULT_PARAMS = /=[^,]+/mg;
const FAT_ARROWS = /=>.*$/mg;

const ParamNames = function (fn) {
  let code = fn.toString()
    .replace(COMMENTS, '')
    .replace(FAT_ARROWS, '')
    .replace(DEFAULT_PARAMS, '');
  if(code.indexOf('(') > -1) code = code .slice(code.indexOf('(') + 1, code.indexOf(')'));
  const result = code.match(/([^\s,]+)/g);

  return result === null
    ? []
    : result;
}

const idGenenerator = function(){
  const counter = {};
  return function(tag){
    if(!(tag in counter)) counter[tag] = 0;
    return tag + "-" + counter[tag]++;
  }
}();

const templateRegulator = function(template){
  const Regulator = (alias,real) => {
    if(alias in template && !(real in template)) {
      template[real] = template[alias];
      delete template[alias];
    }
  }
  Regulator('_', 'tag');
  Regulator('$','children');
  if(!('tag' in template)) throw "Template must have a tag";
  if(!('id'  in template)) template.id = idGenenerator(template.tag);
  if(template.tag in Templates){
    let tmpl = {} 
    const tp = Templates[template.tag];
    if(!tp.children) return template;
    let children = tp.children.concat(template.children);
    Object.assign(tmpl, tp);
    Object.assign(tmpl, template);
    tmpl.tag = tp.tag;
    tmpl.children = children;
    template = tmpl;
    //template.isRoot = true;
  }
  return template;
}
const Templates = window.Templates = {}
const Elements = window.Elements = new Proxy({},{
  get: function(target, property, receiver) {
    return function(...x){
      let specs = { _: property };
      x.length && Object.assign(specs, x.shift());
      specs.$ = x;
      return specs;
    }
  }
});

class EmpatiElement{
  constructor(template, Root){
    let iR = typeof Root !== 'undefined';
    if(template.isRoot) iR = false; 
    Root = this.Root = iR ? Root : this;
    this.Cache = iR && 'Cache' in Root ? Root.Cache : {}
    this.Dom = document.createElement(template.tag);
    this.Template = template;
    this.Dom.appendChild(document.createTextNode(''));
    this.Dom.Root = Root;
    this.Dom.AppendTemplate = t => {
      const El = new CustomEmpatiElement(t, this.Root);
      const e = this.Dom.appendChild(El.Dom);
      El.Init();
      return e;
    }
    this.Clear = () => {
      while(this.Dom.firstChild)
        this.Dom.removeChild(this.Dom.firstChild);
    }
    this.Destroy = () => {
      this.Dom.remove();
    }
    if(!iR)
      this.Observer = {
        Callbacks: [],
        Listener: {},
        Observe: (e, v, cb)=>{
          if(typeof v === 'function'){
            const args = ParamNames(v);
            Root.Observer.Callbacks.push(function(){
              let a = v.apply(e, args.map(x=>Root.Cache[x]));
              if(!a.push) a = [a];
              cb.apply(e, a);
            });
            args.forEach(q => {
              if(!(q in Root.Cache))Root.Cache[q] = '';
              if(!(q in Root.Observer.Listener)){Root.Observer.Listener[q] = [];}
              Root.Observer.Listener[q].push(Root.Observer.Callbacks.length-1);
              if(!(q in Root) )Object.defineProperty(Root, q, {
                get: function () {
                  return Root.Cache[q];
                },
                set: function (y) {
                  Root.Cache[q] = y;
                  Root.Observer.Listener[q].forEach(
                    w=>Root.Observer.Callbacks[w]());
                }
              });
            });
            return args;
          }else { cb(v.toString()); return []; }
        }
      }
  }
  Init(){
    if(this.Root == this && !this.Initialized) {
      this.Root.Observer.Callbacks.forEach(x=> x());
      this.Initialized = true;
    }
    if(this.Dom.init) this.Dom.init.apply(this);
  }

}
class CustomEmpatiElement extends EmpatiElement{
  constructor(template, Root){
    template = templateRegulator(template);
    super(template,Root);
    template.forEach((v,k)=>{
      switch (k){
        case 'text':
          this.Root.Observer.Observe(this.Dom, v,
            x => this.Dom.childNodes[0].nodeValue = x );
          break;
        case 'children':
          v.map(x=>new CustomEmpatiElement(x,this.Root))
          .forEach(x=>this.Dom.appendChild(x.Dom));
          break;
        case 'style':
          if(typeof v == 'string') this.Dom.className = EmpatiJS.Theme.Styles[v].$;
          else if(v.$) this.Dom.className = v.$;
          else if(v.length) this.Dom.className = v.map(x=>x.$).join(" ");
          else v.forEach((x,y)=> this.Dom.style[y] = x);
          break;
        case 'tag':
          break;
        case 'value':
          const args = this.Root.Observer.Observe(this.Dom, v, x => this.Dom.value = x );
          const bf = qq => this.Dom.addEventListener(qq, 
            x => args.forEach(w => this.Root[w] = x.target.value));
          if(template.trigger)
            if(template.trigger.push) template.trigger.forEach(bf)
            else bf(template.trigger)
          else bf("change");
          args.forEach(w => this.Root.Cache[w] = this.Dom.value);
          break;
        case 'attr':
          v.forEach((x,y)=>{
            this.Root.Observer.Observe(this.Dom,x, 
              r => this.Dom.setAttribute(y,r));
          });
          break;
        case 'mod':
          v.forEach((x)=>{
            const args = ParamNames(x);
            this.Root.Observer.Observe(this.Dom, eval("("+ args + ")=>[" + args + "]"), x);
          });
          break;
        default:
          this.Dom[k] = v;
          break;
      }
    });
    this.Init();
  }
}

const empatiDom = {
  Include: async function(map){
    if(map == "*") {
      map = await window.EmpatiJS.Ajax('/elements');
      map = map.map(x=>[x, "elements/"+x+'.js']);
    }
    return Promise.all(map.map(x=>{
      if(x[0] in Templates) return Promise.resolve();
      Templates[x[0]] = {};
      return window.EmpatiJS.Ajax(x[1], undefined, true)
        .then( y => this.Register(y,x[0]) );
      }));
  },
  Register: function(x, n){
    Templates[n] = templateRegulator(x);
  },
  Create: function(x,r){
    x.isRoot = true;
    const e = new CustomEmpatiElement(x,r);
    return e;
  },
  AppendLayout: async function(file, a){
    a = a || document.body;
    x = await window.EmpatiJS.Ajax(file, undefined, true);
    a.appendChild(this.Create(x).Dom);
  },
  AppendTemplate: async function(x, a){
    a = a || document.body;
    a.appendChild(this.Create(x).Dom);
  }
}

if('EmpatiJS' in window) window.EmpatiJS.Dom = empatiDom;
else throw "Initialize EmpatiJS first";

