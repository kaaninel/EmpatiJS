const e = Elements;

const init = async function(){
    const map = await window.EmpatiJS.Ajax('/layouts');
    map.forEach(x=>{this.Dom.routes["/"+x] = x});
    this.Dom.navigate(window.location.pathname);
};

const navigate = async function(r){
    this.Root.route = r;
    const ro = this.routes[r];
    console.log(ro, r, this.routes);
    await EmpatiJS.Dom.Include([[ro, "layouts/"+ro+'.js']])
    window.history.pushState(null, null, r);
    const tpl = e[ro]();
    while (this.firstChild) 
        this.removeChild(this.firstChild);
    this.AppendTemplate(tpl);
};

return  e.div({
    attr:{route: route => route },
    id: "router",
    routes: {
        '/' : 'index'
    }, 
    navigate,
    style: "FullBleed",
    init
});