import { ManageOnlineOffline } from './firebaseSignalingServer.js';
import { handleData } from './fileHandling.js';

var call;
export var mypeerid;
export var conn;
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

var peer = new Peer();

peer.on("open", function (id) {
  console.log("My peer ID is: " + id);
  mypeerid = id;
  ManageOnlineOffline(id);
  $("#mypeerid").html(id);
});

export function connectPeer(peer_id) {
  console.log("connecting peer: " + peer_id);
  conn = peer.connect(peer_id, { reliable: true });
  conn.on("open", function () {
    conn.on("data", function (data) {
      console.log("Received", data);
    });
    console.log("serialization:", conn.serialization);
  });
}

peer.on("connection", function (conn) {
  console.log("incoming connection ");
  conn.on("data", function (data) {
    if (data.type == "progress_info") {
      console.log("Sent Data feedback", data.msg);
      if (data.msg === 100) {
      $('.stats-area').html("Done!");
      }
      else {
        $('.stats-area').html(data.msg + "%");
      }
    }
    if (data.file_name) {
      handleData(data);
    }
  });
});