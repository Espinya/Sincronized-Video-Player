const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const port = 8000;
var status = "off";
var counting = 0;
var refTime = new Date();
var continueTime = 0;
var fileName = "";
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname + '/index.html'));
})
app.use(express.static(path.join(__dirname, 'images')));
app.get('/video/:videoName', function(req, res) {
  let path = 'videos/' + req.params.videoName + '.mp4';
  let stat = fs.statSync(path);
  let fileSize = stat.size;
  let range = req.headers.range;
  if (range == undefined) return res.sendStatus(416);
  let parts = range.replace("bytes=", "").split("-");
  let start = parseInt(parts[0], 10);
  let end = parts[1] ? parseInt(parts[1], 10) : fileSize-1;
  if(start >= fileSize) {
    res.status(416).send('Requested range not satisfiable\n'+start+' >= '+fileSize);
    return;
  }
  let chunksize = (end-start)+1;
  let file = fs.createReadStream(path, {start, end});
  let head = {
    'Content-Range': 'bytes '+ start +'-'+ end + '/'+ fileSize,
    'Accept-Ranges': 'bytes',
    'Content-Length': chunksize,
    'Content-Type': 'video/mp4',
  }
  res.writeHead(206, head);
  file.pipe(res);
})
app.listen(port, function () {
  console.log('Server running: Port ' + port.toString());

})
app.get('/status', function(req, res) {
  if (counting == 0) res.send(status  + ";" + (continueTime).toString() + ";" + fileName);
  else {
    res.send(status  + ";" + ((new Date() - refTime)/1000 + continueTime).toString() + ";" + fileName);
  }
})
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
var recursiveAsyncReadLine = function () {
  rl.question('', function (answer) {
    answerFunction(answer);
    recursiveAsyncReadLine(); 
  });
};
recursiveAsyncReadLine()
const answerFunction = function (answer) {
  let data = answer.split(" ");
  switch(data[0]){
    case '!playwithtrailer':
      fileName = trailer;
      status = "play"
      counting = 1;
      countingTime = 0;
      setTimeout(() => {
        fileName = data[1];
        counting = 1;
        countingTime = 0;
      }, 1200);
    break;
    case '!setvideo':
      if(fs.existsSync("videos/" + data[1] + '.mp4')){
        fileName = data[1];
        status = "stop";
        counting = 0;
        countingTime = 0;
        console.log("Change success.")
        break;
      }
      console.log("File not found.")
      break;
    case '!time':
        console.log("time: " + (((new Date() - refTime)/1000 + continueTime)/60).toString() + ":" + (((new Date() - refTime)/1000 + continueTime)%60));
        break;
    case '!settime':
      let timeset = data[1].split(":");
      console.log(timeset);
      continueTime = parseInt(timeset[0], 10)*60 + parseInt(timeset[1], 10);
      console.log(continueTime);
      refTime = new Date();
      break;
    case '!play':
      if (fileName == "") {
        console.log("Select video file.");
        break;
      }
      refTime = new Date();
      counting = 1;
      status = "play";
      break;
    case '!stop':
      continueTime = (new Date() - refTime)/1000 + continueTime;
      counting = 0;
      status = "stop";
      break;
    default:{
      console.log("error")
    }
  }
  console.log("ok")
}

