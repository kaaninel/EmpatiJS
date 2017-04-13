
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

const DefineObjPrototype = function(k, f){
  Object.defineProperty(Object.prototype, k, {
      value: f,
      enumerable: false,
  });
}

DefineObjPrototype('forEach', function(f){
  for(let i in this) if(this.hasOwnProperty(i)) f(this[i], i);
});
DefineObjPrototype('Map', function(f){
  const O = {}
  for(let i in this) if(this.hasOwnProperty(i)) O[i] = f(this[i], i);
  return O;
});

DefineObjPrototype('Filter', function(f){
  const O = {};
  for(let i in this) if(this.hasOwnProperty(i) && f(this[i], i)) O[i] = this[i];
  return O;
});

DefineObjPrototype('map', function(f){
  for(let i in this) if(this.hasOwnProperty(i)) this[i] = f(this[i], i);
});

DefineObjPrototype('filter', function(f){
  for(let i in this) if(this.hasOwnProperty(i) && !f(this[i], i)) delete this[i];
});

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
    let children = tp.children.concat(template.children);
    Object.assign(tmpl, tp);
    Object.assign(tmpl, template);
    tmpl.tag = tp.tag;
    tmpl.children = children;
    template = tmpl;
    template.isRoot = true;
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
      
    }
    if(!iR)
      this.Observer = {
        Callbacks: [],
        Listener: {},
        Observe: (v, cb)=>{
          if(typeof v === 'function'){
            const args = ParamNames(v);
            console.log(args,this);
            Root.Observer.Callbacks.push(function(){
              cb(v.apply(Root,args.map(x=>Root.Cache[x])));
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
    this.Root.Observer.Callbacks.forEach(x=> x());
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
          this.Root.Observer.Observe(v,
            x => this.Dom.childNodes[0].nodeValue = x );
          break;
        case 'children':
          v.map(x=>new CustomEmpatiElement(x,this.Root))
          .forEach(x=>this.Dom.appendChild(x.Dom));
          break;
        case 'style':
          if(v.$) this.Dom.className = v.$;
          else if(v.length) this.Dom.className = v.map(x=>x.$).join(" ");
          else v.forEach((x,y)=> this.Dom.style[y] = x);
          break;
        case 'tag':
          break;
        case 'value':
          const args = this.Root.Observer.Observe(v, x => this.Dom.value = x );
          this.Dom.addEventListener(template.trigger||'change', 
            x => {x = x.target.value;args.forEach(w => this.Root[w] = x)});
          args.forEach(w => this.Root.Cache[w] = this.Dom.value);
          break;
        case 'attr':
          v.forEach((x,y)=>{
            this.Root.Observer.Observe(x, 
              r => this.Dom.setAttribute(y,r));
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

const Style = function(){
  let id = -1;
  return function(o,ps){
    const cc = x => x.replace(/([A-Z])/g, (x)=> "-"+ x.toLowerCase());
    const a = [];
    for(let i in o)
      a.push(cc(i) + ":" + o[i].toString());
    const ruls = a.join(';');
    id++;
    const style = ".c"+id+(ps||"")+" { " + ruls + " } ";
    empatiDom.StyleSheet.insertRule(style, id);
    return new Proxy({Orgin:o, Cv: a, C: style, Id: id}, {
      get: (t, n) => {
        if(n == "$") return "c" + t.Id;
        return t.Orgin[n];
      },
      set: (t, n, v) => {
        t.Orgin[n] = v;
        empatiDom.StyleSheet.cssRules[t.Id].style[n] = v;
        return v;
      }
    });
  }
}()

const empatiDom = {
  Include: function(map){
    return Promise.all(map.map(x=>{
      if(x[0] in Templates) return Promise.resolve();
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
  AppendTemplate: function(file, a){
    a = a || document.body;
    window.EmpatiJS.Ajax(file, undefined, true).then(
      x=> {
        a.appendChild(this.Create(x).Dom);
      });
  },
  StyleSheet: (function() {
    const style = document.createElement("style");
    style.appendChild(document.createTextNode(""));
    document.head.appendChild(style);
    return style.sheet;
  })(),
  Style
}

if('EmpatiJS' in window) window.EmpatiJS.Dom = empatiDom;
else throw "Initialize EmpatiJS first";

