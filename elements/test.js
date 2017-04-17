const e = Elements;

await window.EmpatiJS.Dom.Include([
    ['datagrid', 'elements/datagrid.js']
]);

const datasource = [
    {Id: 1, Name: "Kaan", Surname:"İnel"},
    {Id: 2, Name: "Hüseyin", Surname:"Akbaş"},
    {Id: 3, Name: "Emre", Surname:"Keskin"},
    {Id: 4, Name: "Emre", Surname:"Keskin", Gender: "F"}
];

const style = EmpatiJS.Theme.Style({
    backgroundColor: "#ccc"
});

return e.div({style},
    e.datagrid({datasource})
);