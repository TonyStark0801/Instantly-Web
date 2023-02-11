import { mypeerid, connectPeer } from './peerConnection.js';

const peers_list = [];

var usersRef = database.ref("users/rooms/" + room_id + "/users");
usersRef.on("value", (snap) => {
  snap.forEach(function (childSnapshot) {
    var childKey = childSnapshot.key;
    var childData = childSnapshot.val();
    console.log(childKey);
    if (!peers_list.includes(childKey) && childKey != mypeerid) {
      $(".waiting-area").hide();
      $(".drop-area").show();
      //new user
      $("list").append('<p id="' + childKey + '">' + childKey + " </p>");
      peers_list.push(childKey);

      connectPeer(childKey);
    } 
  });
});

usersRef.on("child_removed", (data) => {
  console.log("Removed:" + data.key);
  $("#" + data.key).remove();
});


export function ManageOnlineOffline(peer_id){
    // any time that connectionsRef's value is null (i.e. has no children) I am offline
    var roomsRef = firebase.database().ref('users/rooms/'+room_id+'/users/'+peer_id);
    
    var connectedRef = firebase.database().ref('.info/connected');
    connectedRef.on('value', (snap) => {
      if (snap.val() === true) {
    
    
        // We're connected (or reconnected)! Do anything here that should happen only if online (or on reconnect)
        var con = roomsRef.push();
    
        // When I disconnect, remove this device
        con.onDisconnect().remove();
    
        // Add this device to my connections list
        // this value could contain info about the device or a timestamp too
        con.set(true);
    
         
      }
    });
    
    }