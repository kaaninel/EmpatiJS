
/*
*  EmpatiJS 
*  Empati Lab
*  Author: Necati Kaan INEL 
*/

"use strict";

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

const constr = document => ({
  $: new Proxy(function(){},{
    get: function(t, p){
      return document.getElementById(p);
    },
    apply: function(t, thi, args){
      const x = args[0];
      return x[0] == '#' ? document.getElementById(x.substr(1)) : document.querySelector(x)
    }
  }),
  $$: x => document.querySelectorAll(x),
  Ajax: async (x, z, y) => {
    const xhttp = new XMLHttpRequest();
    const G = typeof z === 'undefined';
    xhttp.open(G ? "GET" : "POST", x);
    xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    return new Promise(function(res,rej){
      xhttp.onloadend = function () {
        let r;
        window.asdf = xhttp;
        if (xhttp.getResponseHeader("Content-Type").indexOf("application/json") > -1) r = JSON.parse(xhttp.responseText);
        else if (xhttp.getResponseHeader("Content-Type").indexOf("application/javascript") > -1 && y) r = eval("async ()=>{"+xhttp.responseText+"}")();
        else r = xhttp.responseText;
        res(r);
      }
      xhttp.onerror = function(e){rej(e)}
      if (G) xhttp.send();
      else xhttp.send(JSON.stringify(z));
    })
  },
  Elements: x => Array.from(_E.$$(x)),
  Events: (x, y, f) => (typeof x == "string" ? _E.Elements(x) : [x]).forEach(x => { x.addEventListener(y, f.bind(_E, x), false) }),
  Event: new Proxy({}, {
    get: (t, name) => new Proxy({}, {
      set: function (t, n, v) { return document.getElementById(name).addEventListener(n, v) }
    })
  }),
  Text: new Proxy({}, {
    get: function (t, n) { return _E.Elements(n).map(x => x.innerText.trim()).join(' '); },
    set: function (t, n, v) { _E.Elements(n).forEach(x=> x.innerText = v); }
  }),
  Include: async function(map){
    if(map == "*") {
      map = await window.EmpatiJS.Ajax('/plugins');
      map = map.map(x=>[x, "plugins/"+x+'.js']);
    }
    return Promise.all(map.map(x=>{
      if(x[0] in this) return Promise.resolve();
      return window.EmpatiJS.Ajax(x[1], undefined, true)
    }));
  }
})

const _E = window.EmpatiJS = window._ = constr(document);
_E._constr = constr;
