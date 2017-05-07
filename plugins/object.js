
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
