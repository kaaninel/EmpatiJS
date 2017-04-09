
/*
*  EmpatiJS 
*  Empati Lab
*  Author: Necati Kaan INEL 
*/

"use strict";

const _E = window.EmpatiJS = window._ = {
  $: new Proxy(function(){},{
    get: function(t, p){
      return document.getElementById(p);
    },
    apply: function(t, thi, args){
      const x = args.shift();
      return x[0] == '#' ? document.getElementById(x.substr(1)) : document.querySelector(x)
    }
  }),
  $$: x => document.querySelectorAll(x),
  Ajax: (x, z, y) => {
    const xhttp = new XMLHttpRequest();
    const G = typeof z === 'undefined';
    xhttp.open(G ? "GET" : "POST", x);
    xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    return new Promise(function(res,rej){
      xhttp.onloadend = function () {
        let r;
        if (xhttp.getResponseHeader("Content-Type") == "application/json") r = JSON.parse(xhttp.responseText);
        if (xhttp.getResponseHeader("Content-Type") == "application/javascript" && y) r = eval("()=>{"+xhttp.responseText+"}")();
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
    get: function (t, n) { return _E.Elements(n).map(x => x.innerText).join(' '); },
    set: function (t, n, v) { _E.Elements(n).forEach(x=> x.innerText = v); }
  })
}
