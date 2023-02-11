import { ManageOnlineOffline } from './firebaseSignalingServer.js';
import { handleData } from './fileHandling.js';

var call;
export var mypeerid;
export var conn;

navigator.getUserMedia = navigator.getUserMedia ||
                        navigator.webkitGetUserMedia ||
                        navigator.mozGetUserMedia;

var peer = new Peer();

peer.on("open", function (id) {
  console.log("My peer ID is: " + id);

  ManageOnlineOffline(id);

  $("mypeerid").html(id);
  mypeerid = id;
  $(".after").show();
});

$("#callBtn").click(function () {
  var input_peerid = $("#input_peerid").val();
  connectPeer(input_peerid);
});

export function connectPeer(peer_id) {
  console.log("connecting peer: " + peer_id);

  conn = peer.connect(peer_id, { reliable: true });
  conn.on("open", function () {
    // Receive messages
    conn.on("data", function (data) {
      console.log("Received", data);
    });

    console.log("serialization:", conn.serialization);
  });
}

peer.on("connection", function (conn) {
  console.log("incoming connection ");

  conn.on("data", function (data) {
    // console.log(data)
    if (data.type == "progress_info") {
      console.log("Sent Data feedback", data);
      if (data.msg == 100) {
        $(".drop-area").show();
        $(".stats-area").hide();
      }
      $("#progress").html(data.msg + "%");
      $("#speed").html(data.speed + "");

      $(".progress-bar-fill").attr("style", "width:" + data.msg + "%");
    }
    if (data.file_name) {
      // console.log('[incoming] DATA', data.file_name+" mime:"+data.mime);
      handleData(data);
      $("#filename-text").html(data.file_name);
    }
  });
});
