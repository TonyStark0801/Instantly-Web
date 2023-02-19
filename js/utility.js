var $modalGet = $("#modalGet");
var $dropzone = $('#drop-zone');
var qrcode;
$(document).ready(function(){
  $("input[type='file']").change(function(){
    var files = $(this)[0].files;
    handleToast(files);
  });
});
$modalGet.on('hidden.bs.modal', function (e) {
  $("#qrcode").empty();
});

$("#copy").click(function (e) {
  $("#room_id").select();
  document.execCommand("copy");
});

$("#getQR").click(function (e) {
  qrcode = new QRCode("qrcode", {
    text: $("#room_id").val(),
    width: 256,
    height: 256,
    colorDark: "#000000",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.H,
  });
  $modalGet.modal();
});

function handleToast(files) {
  if (files.length == 1) {
    $(".toast-body").html("file selected!");
  } else {
    $(".toast-body").html("No file selected!");
  }
  const toast = new bootstrap.Toast($('#sendFileToast'));
  toast.show();
}

$dropzone.on("dragover", function(e) {
  e.preventDefault();
  e.stopPropagation();
  dropzone.classList.add('dragover');
  console.log("File(s) in drop zone");
});

$dropzone.on('drop', function(e) {
  e.preventDefault();
  e.stopPropagation();
  dropzone.classList.remove('dragover');
  var files = e.dataTransfer.files;
  handleToast(files);
});

