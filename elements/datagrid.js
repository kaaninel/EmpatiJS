const e = Elements;

const init = function(){
    const datas = this.Dom.datasource;
    let table = e.table();
    let thead = e.thead();
    //Header
    const keys = {};
    datas.forEach(x=>Object.keys(x).forEach(y=>{keys[y] = 1}));
    for(let key in keys)
        thead.$.push(e.th({text:key}));
    table.$.push(thead);
    const k = Object.keys(keys);
    //Data
    for(let key in datas){
        let row = e.tr();
        for(let el of k)
            row.$.push(e.td({text: datas[key][el]||"" }))
        table.$.push(row);
    }
    this.Dom.AppendTemplate(table);
    
};


return e.div({datasource:{}, init});