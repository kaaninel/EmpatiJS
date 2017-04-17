
const Style = function(){
  let gid = 0;
  return function(o,key){
    if(o.$) return o;
    const id = gid++;
    const cc = x => x.replace(/([A-Z])/g, (x)=> "-"+ x.toLowerCase());
    const a = [];
    let SC = "";
    let md = "@media ";
    for(let i in o){
      switch(i){
        case "$": 
          SC += typeof o[i] == "string" ? EmpatiJS.Theme.Styles[o[i]] :
             o[i].map(x=> EmpatiJS.Theme.Styles[x].$ ).join(' ');
          break;
        case "$$":
          EmpatiJS.Theme.Styles[o[i]].$ = "c" + id; 
          break;
        case "_":
          break;
        case "media":
          md += o[i];
          break;
        default: 
          if(o[i] in EmpatiJS.Theme.Rules) o[i] = EmpatiJS.Theme.Rules[o[i]];
          a.push(cc(i) + ":" + o[i].toString());
          break;
      }
    }
    const ruls = a.join(';');
    let style = ".c"+id+(o._||"")+" { " + ruls + " } ";
    if(o.media) style = md + " { " + style + " } ";
    EmpatiJS.Theme.StyleSheet.insertRule(style, id);
    if(o.$_) SC += ' ' + EmpatiJS.Theme.AppendStyles(o.$_, key).join(' ');
    return new Proxy({Orgin:o, SubClass: SC, Id: id}, {
      get: (t, n) => {
        if(n == "$") return "c" + t.Id + t.SubClass;
        return t.Orgin[n];
      },
      set: (t, n, v) => {
        if(v in EmpatiJS.Theme.Rules) v = EmpatiJS.Theme.Rules[v];
        t.Orgin[n] = v;
        if(n == "$") t.SubClass += " " + (typeof v == "string" ? v : v.$);
        else EmpatiJS.Theme.StyleSheet.cssRules[t.Id].style[n] = v;
        return v;
      }
    });
  }
}()

EmpatiJS.Theme = {
  Styles:{},
  Rules:{},
  AppendStyles: function(o, k = ""){
      o.forEach((x,y)=>{this.Styles[k+y] = Style(x,k+y)});
      return Object.keys(o).map(x=> this.Styles[k+x].$);
  },
  StyleSheet: (function() {
    const style = document.createElement("style");
    style.appendChild(document.createTextNode(""));
    document.head.appendChild(style);
    return style.sheet;
  })(),
  Style
}
