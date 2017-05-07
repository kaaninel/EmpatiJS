const fs = require('fs');
const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require("socket.io")(server);

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

const store = {}

io.on("connection", s => {
  console.log("Connected!");
  s.on('get', (x) => s.emit('set|'+x, store[x]))
  s.on('set', (x,y) => {store[x] = y;})
})

server.listen(8080, () => console.log(":8080 Online!"));