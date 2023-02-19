import { mypeerid, connectPeer } from './peerConnection.js';

const peers_list = [];
var usersRef = database.ref("users/rooms/" + room_id + "/users");
usersRef.on("value", (snap) => {
  snap.forEach(function (childSnapshot) {
    var childKey = childSnapshot.key;
    var childData = childSnapshot.val();
    console.log(childKey);
    if (!peers_list.includes(childKey) && childKey != mypeerid) {
      $(".waiting-area").parent().remove();
      $("#drop-zone").removeClass("hidden");
      $(".stats-area").removeClass("hidden");
      $("#peer2").html(childKey); // new user
      peers_list.push(childKey);
      connectPeer(childKey);
    } 
  });
});

usersRef.on("child_removed", (data) => {
  console.log("Removed:" + data.key);
  $("#" + data.key).remove();
  $("#peer2").html();
});

export function ManageOnlineOffline(peer_id){
    // any time that connectionsRef's value is null (i.e. has no children) I am offline
    var roomsRef = database.ref('users/rooms/'+room_id+'/users/'+peer_id);
    var connectedRef = firebase.database().ref('.info/connected');
    connectedRef.on('value', (snap) => {
      if (snap.val() === true) {
        // We're connected (or reconnected)!
        var con = roomsRef.push();
        con.onDisconnect().remove(); // When I disconnect, remove this device
        con.set(true);
      }
    });
}