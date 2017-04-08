
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


Object.prototype.forEach = function(f){
  for(let i in this) if(this.hasOwnProperty(i)) f(this[i], i);
}

Object.prototype.Map = function(f){
  const O = {}
  for(let i in this) if(this.hasOwnProperty(i)) O[i] = f(this[i], i);
  return O;
}

Object.prototype.Filter = function(f){
  const O = {};
  for(let i in this) if(this.hasOwnProperty(i) && f(this[i], i)) O[i] = this[i];
  return O;
}

Object.prototype.map = function(f){
  for(let i in this) if(this.hasOwnProperty(i)) this[i] = f(this[i], i);
}

Object.prototype.filter = function(f){
  for(let i in this) if(this.hasOwnProperty(i) && !f(this[i], i)) delete this[i];
}

const idGenenerator = function(){
  const counter = {};
  return function(tag){
    if(!(tag in counter)) counter[tag] = 0;
    return tag + "-" + counter[tag]++;
  }
}();

const templateRegulator = function(template){
  console.log(typeof template,template)
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
    const iR = typeof Root !== 'undefined';
    Root = this.Root = iR ? Root : this;
    const Self = this;
    this.Cache = iR && 'Cache' in Root ? Root.Cache : {}
    this.Template = template;
    if(template.tag in Templates)
      this.Dom = Templates[template.tag].Dom;
    else
      this.Dom = document.createElement(template.tag);
    this.Dom.appendChild(document.createTextNode(''));
    this.Dom.Root = Root;
    if(!iR)
      this.Observer = {
        Callbacks: [],
        Listener: {},
        Observe: (v, cb)=>{
          if(typeof v === 'function'){
            const args = ParamNames(v);
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
          v.forEach((x,y)=> this.Dom.style[y] = x);
          break;
        case 'tag':
          break;
        case 'id':
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
  }
}

const R = new CustomEmpatiElement({_:"input",attr:{type:"hidden"},id:"Root"});

const empatiDom = {
  Include: function(map){
    return Promise.all(map.map(x=>
      window.EmpatiJS.Ajax(x[1], undefined, true)
        .then(
          y => this.Register(y,x[0])
        )));
  },
  Register: function(x,n){
    const e = new CustomEmpatiElement(x);
    e.Init();
    console.log(e);
    if(n)Templates[n] = (e);
    return e;
  },
  AppendTemplate: function(file, a){
    a = a || document.body;
    window.EmpatiJS.Ajax(file, undefined, true).then(
      x=> {
        a.appendChild(this.Register(x).Dom);
      });
  }
}

if('EmpatiJS' in window) window.EmpatiJS.Dom = empatiDom;
else throw "Initialize EmpatiJS first";

