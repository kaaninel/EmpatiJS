const fs = require('fs');
const express = require('express');
const app = express();

function ReadDir(...arr){
  arr.forEach(x=> {
    app.use('/'+x, express.static(x))
    app.get('/'+x,(req,res)=> 
      fs.readdir(x, (e,i) => res.send(i.map(
        x=>x.substr(0,x.length-3)))))
    }
  )
}

function Publish(...arr){
  arr.forEach(x=> 
    app.get('/'+x,(req,res)=> 
      res.sendFile(__dirname + "/" + x))
  )
}

ReadDir("plugins", "elements", "layouts", "themes");
Publish("empati.js", "index.html", "manifest.json");

app.get('*',(req,res)=>{
  res.sendFile(__dirname + '/index.html');
});


app.listen(8080);