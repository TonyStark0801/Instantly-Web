import { conn } from './peerConnection.js';

function sendMsg(msg) {
  console.log("[sending]", msg);
  conn.send(msg);
}

let file_size;
let file_name;
$("#sendFileBtn").click(function () {
  var file = document.getElementById("file-input").files[0];
  file_name = file.name;
  file_size = file.size;
  sliceandsend(file);
});

function sliceandsend(file) {
  const fileSize = file.size;
  const name = file.name;
  const mime = file.type;
  const chunkSize = 64 * 1024; // bytes
  let offset = 0;
  function readchunk(_first) {
    var data = {}; // data object to transmit over data channel
    data.file_name = file_name;
    data.file_size = file_size;
    var r = new FileReader();
    var blob = file.slice(offset, chunkSize + offset);
    r.onload = function (evt) {
      if (!evt.target.error) {
        offset += chunkSize;
        if (offset >= fileSize) {
          data.message = evt.target.result;
          data.last = true;
          data.mime = mime;
          conn.send(data);
          console.log(evt.target.result);
          console.log("Done reading file " + name + " " + mime);
          return;
        } else {
          data.message = evt.target.result;
          data.last = false;
          data.mime = mime;
          conn.send(data);
        }
      } else {
        console.log("Read error: " + evt.target.error);
        return;
      }
      readchunk();
    };
    r.readAsArrayBuffer(blob);
  }
  readchunk(Math.ceil(fileSize / chunkSize));
}

var receivedSize = 0;
var recProgress = 0;
var arrayToStoreChunks = [];
var counterBytes = 0;

export function handleData(data) {
  receivedSize += data.message.byteLength;
  counterBytes = counterBytes + receivedSize;
  recProgress = (receivedSize / data.file_size) * 100;
  recProgress = parseFloat(recProgress + "").toFixed(2);
  if (!data.last) {
      $('.stats-area').text(recProgress + "%");
  }
  arrayToStoreChunks.push(data.message); // pushing chunks in array
  if (recProgress > 0) {
    var sdata = {};
    sdata.type = "progress_info";
    sdata.msg = recProgress;
    sendMsg(sdata);
  }
  if (data.last) {
    $('.stats-area').text("Done!");
    setTimeout(function () {
      var sdata = {};
      sdata.type = "progress_info";
      sdata.msg = 100;
      sendMsg(sdata);
    }, 100);

    const received = new Blob(arrayToStoreChunks);
    downloadBuffer(URL.createObjectURL(received), data.file_name);
    arrayToStoreChunks = []; // resetting array
    recProgress = receivedSize = 0;
  }
}

function downloadBuffer(fileUrl, fileName) {
  const link = document.createElement('a');
  link.href = fileUrl;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(fileUrl);
  link.remove();
}