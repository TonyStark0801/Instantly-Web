
var spanGet = document.getElementsByClassName("close")[0];
var spanScan = document.getElementById("modalSpan");
var modalGet = document.getElementById("modalGet");
var modalScan = document.getElementById("modalScan");

$(document).ready(function(){
  $("input[type='file']").change(function(){
    var files = $(this)[0].files;
    console.log("File selected!");
  });
});
// When the user clicks on <span> (x), close the modal
spanGet.onclick = function () {
  modalGet.style.display = "none";
  $("#qrcode").empty();
};
spanScan.onclick = function () {
  modalScan.style.display = "none";
  // $("#qr-reader").empty();
};
// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
  if (event.target == modalGet) {
    modalGet.style.display = "none";
    $("#qrcode").empty();
  } else if (event.target == modalScan) {
    modalScan.style.display = "none";
    // $("#qr-reader").empty();
  }
};

$("#copy").click(function (e) {
  $("#room_id").select();
  document.execCommand("copy");
});

$("#getQR").click(function (e) {
  console.log("qrcode room_id " + $("#room_id").val());
  qrcode = new QRCode("qrcode", {
    text: $("#room_id").val(),
    width: 256,
    height: 256,
    colorDark: "#000000",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.H,
  });
  // Get the modal
  modalGet.style.display = "block";
});

$("#scanQR").click(function (e) {
  var html5QrcodeScanner = new Html5QrcodeScanner(
    "qr-reader",
    { fps: 10, qrbox: 250 }
  );
  html5QrcodeScanner.render(onScanSuccess);
  console.log("scanqr");
  // Get the modal
  modalScan.style.display = "block";
});

function onScanSuccess(decodedText, decodedResult) {
  console.log(`Code scanned = ${decodedText}`, decodedResult);
  html5QrcodeScanner.clear();
}




