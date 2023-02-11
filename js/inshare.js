class ItemInfo {
  constructor(
    isSend,
    id,
    file,
    status,
    ajaxObj,
    coverID,
    sizeID,
    progressId,
    percentId,
    compId,
    cloundId,
    totalSize,
    currentSize
  ) {
    this.isSend = isSend;
    this.id = id;
    this.file = file;
    this.status = status;
    this.ajaxObj = ajaxObj;
    this.coverID = coverID;
    this.sizeID = sizeID;
    this.progressId = progressId;
    this.percentId = percentId;
    this.compId = compId;
    this.cloudId = cloundId;
    this.totalSize = totalSize;
    this.currentSize = currentSize;
  }
}
class MyFile {
  constructor(size, name, id, g_id, type) {
    this.size = size;
    this.name = name;
    this.id = id;
    this.g_id = g_id;
    this.type = type;
  }
}
let sendItemInfo = [];
let recItemInfo = [];
let baseUrl = "http://" + document.domain + ":" + window.location.port;
let currentTab = "send";
function getEmptyView() {
  return (
    "<div id='empty' style='margin-top: 133px'>" +
    "<div style='margin: 0 auto;width: fit-content;height: 120px;text-align: center'>" +
    "<div>" +
    "<img src='common/empty' id='empty_img'>" +
    "</div>" +
    "<label style='color: #8287a4;font-size: 28px;text-align: center'>No task.</label>" +
    "</div>" +
    "</div>"
  );
}
function ajaxUpload(
  url,
  itemInfo,
  funcInProgress,
  funcSuccess,
  funcFail,
  funcAbort
) {
  let oAjax = new XMLHttpRequest();
  itemInfo.ajaxObj = oAjax;
  let formData = new FormData();
  formData.append("file", itemInfo.file);
  oAjax.onreadystatechange = function () {
    if (oAjax.readyState == 4) {
      if (oAjax.status == 200) {
        funcSuccess(itemInfo, oAjax.responseText, oAjax);
      } else {
        funcFail(itemInfo, oAjax.status, oAjax);
      }
    }
  };
  oAjax.open("POST", url, true);
  oAjax.upload.onprogress = function (event) {
    onProgressChanged(itemInfo, oAjax, event.loaded, event.total);
  };
  oAjax.setRequestHeader("item_id", itemInfo.id);
  oAjax.setRequestHeader("status", itemInfo.status);
  oAjax.onerror = function () {
    funcAbort(itemInfo, oAjax);
  };
  oAjax.send(formData);
  oAjax.onabort = function () {
    funcAbort(itemInfo, oAjax);
  };
  itemInfo.status = 2;
}
function selectFileFromPc() {
  let input_file = document.getElementById("input_file");
  input_file.click();
}
function getSizeStr(size) {
  if (size < 1024) {
    return size + "B";
  }
  if (size < 1024 * 1024) {
    return (size / 1024).toFixed(2) + "KB";
  }
  if (size < 1024 * 1024 * 1024) {
    return (size / 1024 / 1024).toFixed(2) + "MB";
  }
  return (size / 1024 / 1024 / 1024).toFixed(2) + "GB";
}
let onProgressChanged = function (itemInfo, oAjax, progress, total) {
  try {
    if (itemInfo.status == -4) {
      oAjax.abort();
      return;
    }
    itemInfo.currentSize = progress;
    itemInfo.totalSize = total;
    document.getElementById(itemInfo.sizeID).innerHTML =
      getSizeStr(progress) + "/" + getSizeStr(total);
    if (total != 0) {
      document.getElementById(itemInfo.percentId).innerHTML =
        ((progress / total) * 100).toFixed(0) + "%";
    } else {
      document.getElementById(itemInfo.percentId).innerHTML = "0%";
    }
    let progressElement = document.getElementById(itemInfo.progressId);
    progressElement.style.width = (progress / total) * 100 + "%";
  } catch (e) {
    console.log(e.toString());
  }
};
let doViewRefresh = function (itemInfo, message, oAjax) {
  try {
    let element = document.getElementById(itemInfo.coverID);
    element.src = baseUrl + "/img/" + itemInfo.id;
    document
      .getElementById(itemInfo.percentId)
      .parentNode.parentNode.parentNode.remove();
    document.getElementById(itemInfo.sizeID).parentNode.style.marginTop = "2px";
    let statusIcon = document.getElementById(itemInfo.compId);
    if (itemInfo.status == -2 || itemInfo.status == -4) {
      statusIcon.src = baseUrl + "/common/error";
    } else if (itemInfo.status == -1) {
      statusIcon.src = baseUrl + "/common/comp";
      if (!itemInfo.isSend) {
        let elementById = document.getElementById(itemInfo.cloudId);
        elementById.style.visibility = "visible";
        elementById.parentNode.href =
          baseUrl +
          "/get/download_url?g_id=" +
          itemInfo.file.g_id +
          "&id=" +
          itemInfo.id;
      }
    }
    statusIcon.style.visibility = "visible";
    if (itemInfo.file.type == 1 && itemInfo.status == -1) {
      document.getElementById(itemInfo.sizeID).innerHTML = getSizeStr(
        itemInfo.file.size
      );
    }
  } catch (e) {
    console.log(e.toString());
  }
};
let onFail = function (itemInfo, code, oAjax) {
  itemInfo.status = -2;
  try {
    document
      .getElementById(itemInfo.percentId)
      .parentNode.parentNode.parentNode.remove();
    document.getElementById(itemInfo.sizeID).parentNode.style.marginTop = "2px";
    let elementById = document.getElementById(itemInfo.compId);
    elementById.src = baseUrl + "/common/error";
    elementById.style.visibility = "visible";
    oAjax.abort();
  } catch (e) {
    console.log(e.toString());
  }
  console.log("failed!!!!!!!!!!!!!!!!!!!!!!!!");
  console.log(code);
};
function sendCancelItem(item) {
  let request = new XMLHttpRequest();
  request.open("GET", baseUrl + "/cancel_item", true);
  request.onreadystatechange = function () {
    if (request.readyState == 4) {
      if (request.status == 200) {
        console.log("cancel ok ");
      } else {
        console.log("cancel error");
      }
    }
  };
  request.setRequestHeader("item_id", item.id);
  if (item.file.g_id != null && item.file.g_id != undefined) {
    request.setRequestHeader("g_id", item.file.g_id);
  }
  request.send(null);
}
function cancelUpload(data) {
  let element = document.getElementById(data.id);
  element.parentNode.parentNode.parentNode.parentNode.remove();
  let container = document.getElementById("container");
  if (container.childElementCount == 0) {
    container.innerHTML = getEmptyView();
  }
  for (let i = 0; i < sendItemInfo.length; i++) {
    let id = sendItemInfo[i].id;
    if (data.id == id) {
      try {
        sendItemInfo[i].ajaxObj.abort();
      } catch (e) {
        sendCancelItem(sendItemInfo[i]);
      }
      sendItemInfo[i].status = -4;
      sendItemInfo.splice(i, 1);
      break;
    }
  }
  for (let i = 0; i < recItemInfo.length; i++) {
    let recId = recItemInfo[i].id;
    if (data.id == recId) {
      try {
        recItemInfo[i].ajaxObj.abort();
      } catch (e) {
        sendCancelItem(recItemInfo[i]);
      }
      recItemInfo[i].status = -4;
      recItemInfo.splice(i, 1);
      break;
    }
  }
}
function getRandomId() {
  return Math.random().toString(33);
}
function generateChildItemView(itemInfo) {
  let file = itemInfo.file;
  return (
    "<div style='padding-top:10px;padding-bottom:10px;display: flex;width: 100%'>" +
    "<div style='width: 70px;height: 70px;margin-left: 20px'>" +
    "<img src='" +
    baseUrl +
    "/img/cover' width='70px' height='70px' id='" +
    itemInfo.coverID +
    "'>" +
    "</div>" +
    "<div style='width: 100%;margin-left: 31px;margin-right: 24px'>" +
    "<div style='margin-top: 0;width: 100%'>" +
    "<p style='width:100%;max-width:300px;display: block;text-overflow: ellipsis;overflow: hidden;white-space: nowrap;margin-bottom:3px;font-size: 24px;color: #fff'>" +
    file.name +
    "</p>" +
    "<div style='display: flex;width: 100%'>" +
    "<label id='" +
    itemInfo.sizeID +
    "' style='color: #A8BBCA;font-size: 18px;width: 100%'>" +
    file.size +
    "</label>" +
    "<a>" +
    "<img src='common/cloud' height='20' width='20' style='float:right;margin-right:16px;visibility: hidden' id='" +
    itemInfo.cloudId +
    "'>" +
    "</a>" +
    "<img src='common/comp' height='20' width='20' style='visibility: hidden' id='" +
    itemInfo.compId +
    "'>" +
    "</div>" +
    "</div>" +
    "<div style='display: flex;width: 100%'>" +
    "<div style='width: 100%'>" +
    "<div style='width: 70%;margin-top: 1px;display: flex'>" +
    "<div style='background: #d9d8d8;width: 100%;height: 6px;margin-top: 5px'>" +
    "<div style='height: 6px;width:0px;background: #05cd4c' id='" +
    itemInfo.progressId +
    "'>" +
    "</div>" +
    "</div>" +
    "<label id='" +
    itemInfo.percentId +
    "' style='margin-left: 20px;margin-top: -3px;color: white'></label>" +
    "</div>" +
    "</div>" +
    "<div><img src='common/download' id='" +
    itemInfo.id +
    "' onclick='cancelUpload(this)' width='20px;' height='20px' style='margin-left: 10px'>" +
    "</div>" +
    "</div>" +
    "</div>" +
    "</div>"
  );
}
function onDropFinished(event) {
  event.stopPropagation();
  event.preventDefault();
  let selectFile = document.getElementById("select_file");
  selectFile.style.background = "rgba(249,249,249,0.1)";
  let length = event.dataTransfer.files.length;
  uploadFiles(event.dataTransfer.files);
}
function ondragOverTop(event) {
  event.stopPropagation();
  event.preventDefault();
  event.dataTransfer.dropEffect = "copy";
}
function onDragEnterZone(event) {
  let selectFile = document.getElementById("select_file");
  selectFile.style.background = "rgba(249,249,249,0.5)";
}
function onDragExitZone(event) {
  let selectFile = document.getElementById("select_file");
  selectFile.style.background = "rgba(249,249,249,0.1)";
}
function uploadFiles(files) {
  let mContainer = document.getElementById("container");
  if (sendItemInfo.length == 0 && currentTab == "send") {
    mContainer.innerHTML = getEmptyView();
  }
  let tempList = [];
  for (let i = 0; i < files.length; i++) {
    let itemInfo = new ItemInfo(
      true,
      getRandomId(),
      files[i],
      1,
      null,
      getRandomId(),
      getRandomId(),
      getRandomId(),
      getRandomId(),
      getRandomId(),
      getRandomId(),
      files[i].size,
      0
    );
    sendItemInfo.push(itemInfo);
    tempList.push(itemInfo);
  }
  if (currentTab == "send") {
    for (let tem of tempList) {
      if (document.getElementById("empty") != null) {
        mContainer.innerHTML = null;
      }
      let child = generateChildItemView(tem);
      mContainer.innerHTML += child;
      document.getElementById(tem.sizeID).innerHTML =
        getSizeStr(tem.currentSize) + "/" + getSizeStr(tem.totalSize);
      if (tem.totalSize != 0) {
        document.getElementById(tem.percentId).innerHTML =
          ((tem.currentSize / tem.totalSize) * 100).toFixed(0) + "%";
      } else {
        document.getElementById(tem.percentId).innerHTML = "0%";
      }
    }
  }
  if (currentTab == "rec") {
    let count = getCurrentIdleCount(sendItemInfo);
    console.log(count);
    setViewVisibility("dot_hint_send", true, files.length);
  }
  sendFileListInfo(tempList);
}
function onFilesGet() {
  let input_file = document.getElementById("input_file");
  let files = input_file.files;
  uploadFiles(files);
}
function sendFileListInfo(itemInfoList) {
  if (itemInfoList.length == 0) return;
  let result = [];
  for (let i = 0; i < itemInfoList.length; i++) {
    let file = itemInfoList[i].file;
    result.push(
      '{"name": "' + file.name + '"',
      '"id": "' + itemInfoList[i].id + '"',
      '"size": "' + file.size + '"}'
    );
  }
  let oAjax = new XMLHttpRequest();
  oAjax.onreadystatechange = function () {
    if (oAjax.readyState == 4) {
      if (oAjax.status == 200) {
        console.log("upload file list success!");
        let isTransferring = false;
        for (let item of sendItemInfo) {
          if (item.status == 2) {
            isTransferring = true;
            break;
          }
        }
        if (!isTransferring) {
          uploadSequentiallyAsync();
        }
      } else {
        console.log("upload file list failed!");
      }
    }
  };
  oAjax.open("POST", baseUrl + "/list_info", true);
  oAjax.send("[" + result.toString() + "]_end_");
}
function onAbort(itemInfo, oAjax) {
  itemInfo.status = -4;
  let sendItem = getSendItem();
  if (sendItem == null) return;
  ajaxUpload(baseUrl, sendItem, onProgressChanged, onSuccess, onFail, onAbort);
}
function onSuccess(itemInfo, message, oAjax) {
  itemInfo.status = -1;
  doViewRefresh(itemInfo, message, oAjax);
  let sendItem = getSendItem();
  if (sendItem == null) return;
  ajaxUpload(baseUrl, sendItem, onProgressChanged, onSuccess, onFail, onAbort);
}
function uploadSequentiallyAsync() {
  let sendItem = getSendItem();
  if (sendItem == null) return;
  ajaxUpload(baseUrl, sendItem, onProgressChanged, onSuccess, onFail, onAbort);
}
function getSendItem() {
  for (let item of sendItemInfo) {
    if (item.status == 1) {
      return item;
    }
  }
  return null;
}
function onSendClick() {
  currentTab = "send";
  let sendTab = document.getElementById("send_tab");
  if (sendTab.style.color == "white") {
    return;
  }
  setViewVisibility("dot_hint_send", false, 0);
  sendTab.style.background = "rgba(249, 249, 249, 0.1)";
  sendTab.style.color = "#ffffff";
  let receiveTab = document.getElementById("receive_tab");
  receiveTab.style.background = "#171b30";
  receiveTab.style.color = "#808087";
  let mContainer = document.getElementById("container");
  mContainer.innerHTML = null;
  for (let info of sendItemInfo) {
    let childItem = generateChildItemView(info);
    mContainer.innerHTML += childItem;
    document.getElementById(info.sizeID).innerHTML =
      getSizeStr(info.currentSize) + "/" + getSizeStr(info.totalSize);
    if (info.totalSize != 0) {
      document.getElementById(info.percentId).innerHTML =
        ((info.currentSize / info.totalSize) * 100).toFixed(0) + "%";
    } else {
      document.getElementById(info.percentId).innerHTML = "0%";
    }
    if (
      info.currentSize == info.totalSize ||
      info.status == -2 ||
      info.status == -1 ||
      info.status == -4
    ) {
      doViewRefresh(info, null, info.ajaxObj);
    }
  }
  if (sendItemInfo.length == 0) {
    mContainer.innerHTML = getEmptyView();
  }
}
function setViewVisibility(id, visible, count) {
  document.getElementById(id).style.visibility = visible ? "visible" : "hidden";
  if (visible) {
    document.getElementById(id).innerHTML =
      Number.parseInt(document.getElementById(id).innerHTML) + count;
  } else {
    document.getElementById(id).innerHTML = 0;
  }
}
function getDownloadHelpHint() {
  return (
    "<div id='help_hint' style='width: 94.75%;height: auto;padding-top:9px;padding-bottom:9px;background: rgba(50,55,84,1);margin-left: 20px;margin-right: 30px;border-radius: 2px;display: flex;align-items: center'>" +
    "<div style='display: flex;align-items: center'>" +
    "<img src='" +
    baseUrl +
    "/common/hint_icon' width='16px' height='16px' style='margin-left: 10px'>" +
    "</div>" +
    "<label style='color: #A8BBCA;margin-left: 8px;font-size: 12px'>The received files will be saved in the download storage path of the browser, you can check the storage path in the browser settings.</label>" +
    "</div>"
  );
}
function onRecClick() {
  if (currentTab == "rec") {
    return;
  }
  setViewVisibility("dot_hint", false, 0);
  currentTab = "rec";
  let sendTab = document.getElementById("send_tab");
  sendTab.style.background = "#171b30";
  sendTab.style.color = "#808087";
  let receiveTab = document.getElementById("receive_tab");
  receiveTab.style.background = "rgba(249, 249, 249, 0.1)";
  receiveTab.style.color = "#ffffff";
  let mContainer = document.getElementById("container");
  mContainer.innerHTML = null;
  mContainer.innerHTML += getDownloadHelpHint();
  for (let info of recItemInfo) {
    let childItem = generateChildItemView(info);
    mContainer.innerHTML += childItem;
    document.getElementById(info.sizeID).innerHTML =
      getSizeStr(info.currentSize) + "/" + getSizeStr(info.totalSize);
    if (info.totalSize != 0) {
      document.getElementById(info.percentId).innerHTML =
        ((info.currentSize / info.totalSize) * 100).toFixed(0) + "%";
    } else {
      document.getElementById(info.percentId).innerHTML = "0%";
    }
    if (
      info.currentSize == info.totalSize ||
      info.status == -2 ||
      info.status == -1 ||
      info.status == -4
    ) {
      doViewRefresh(info, null, info.ajaxObj);
    }
  }
  if (recItemInfo.length == 0) {
    mContainer.innerHTML = getEmptyView();
  }
}
let messageGet = true;
function getDownloadInfo() {
  if (!messageGet) {
    return;
  }
  messageGet = false;
  setInterval(function () {
    let oAjax = new XMLHttpRequest();
    oAjax.onreadystatechange = function () {
      if (oAjax.readyState == 4) {
        if (oAjax.status == 200) {
          console.log(oAjax.responseText);
          let result = JSON.parse(oAjax.responseText);
          let temp = [];
          for (let i = 0; i < result.length; i++) {
            let contains = false;
            for (let recItemInfoElement of recItemInfo) {
              if (recItemInfoElement.id == result[i].id) {
                contains = true;
                break;
              }
            }
            if (contains) {
              continue;
            }
            let myFile = new MyFile(
              result[i].size,
              result[i].name,
              result[i].id,
              result[i].g_id,
              result[i].type
            );
            let itemInfo = new ItemInfo(
              false,
              result[i].id,
              myFile,
              1,
              null,
              getRandomId(),
              getRandomId(),
              getRandomId(),
              getRandomId(),
              getRandomId(),
              getRandomId(),
              result[i].size,
              0
            );
            recItemInfo.push(itemInfo);
            temp.push(itemInfo);
          }
          startDownloadSequentially();
          if (currentTab == "rec") {
            let mContainer = document.getElementById("container");
            if (recItemInfo.length == 0) {
              mContainer.innerHTML = getEmptyView();
            }
            for (let item of temp) {
              if (document.getElementById("empty") != null) {
                mContainer.innerHTML = null;
              }
              if (document.getElementById("help_hint") == null) {
                mContainer.innerHTML += getDownloadHelpHint();
              }
              mContainer.innerHTML += generateChildItemView(item);
              document.getElementById(item.sizeID).innerHTML =
                getSizeStr(item.currentSize) + "/" + getSizeStr(item.totalSize);
              if (item.totalSize != 0) {
                document.getElementById(item.percentId).innerHTML =
                  ((item.currentSize / item.totalSize) * 100).toFixed(0) + "%";
              } else {
                document.getElementById(item.percentId).innerHTML = "0%";
              }
            }
          } else {
            if (temp.length > 0) {
              let count = getCurrentIdleCount(recItemInfo);
              setViewVisibility("dot_hint", true, temp.length);
            }
          }
        } else {
          console.log("error getDownload info");
        }
        messageGet = true;
      }
    };
    let url = baseUrl + "/get/download_info";
    oAjax.open("GET", url, true);
    oAjax.send(null);
  }, 1000);
}
function getCurrentIdleCount(list) {
  let count = 0;
  for (let item of list) {
    if (item.status !== -1 && item.status !== -2 && item.status !== -4) {
      count++;
    }
  }
  return count;
}
function getNextDownloadItem() {
  for (let item of recItemInfo) {
    if (item.status == 1) {
      return item;
    }
  }
  return null;
}
function downloadSuccess(item) {
  item.status = -1;
  doViewRefresh(item, null, item.ajaxObj);
}
function downloadError(itemInfo) {
  itemInfo.status = -2;
  document
    .getElementById(itemInfo.percentId)
    .parentNode.parentNode.parentNode.remove();
  let elementById = document.getElementById(itemInfo.compId);
  elementById.src = baseUrl + "/common/error";
  elementById.style.visibility = "visible";
  document.getElementById(itemInfo.sizeID).parentNode.style.marginTop = "2px";
}
function downloadProgress(progress, total, item) {
  try {
    item.currentSize = progress;
    document.getElementById(item.sizeID).innerHTML =
      getSizeStr(progress) + "/" + getSizeStr(total);
    if (total != 0) {
      document.getElementById(item.percentId).innerHTML =
        ((progress / total) * 100).toFixed(0) + "%";
    } else {
      document.getElementById(item.percentId).innerHTML = "0%";
    }
    let elementById = document.getElementById(item.progressId);
    elementById.style.width = ((progress / total) * 100).toFixed(0) + "%";
  } catch (e) {
    console.log(e.toString());
  }
}
function downloadAbort(item) {
  try {
    item.status = -4;
    item.ajaxObj.abort();
  } catch (e) {}
}
function downloadFromUrl(downloadAjax) {
  let blob = downloadAjax.response;
  let fileName = downloadAjax.getResponseHeader("name");
  fileName = decodeURI(fileName);
  fileName = fileName ? fileName : new Date().getMilliseconds().toString();
  let uri = window.URL.createObjectURL(blob);
  let link = document.createElement("a");
  link.download = fileName;
  link.href = uri;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
function startDownloadSequentially() {
  let downloadItem = getNextDownloadItem();
  if (downloadItem == null) {
    return;
  }
  for (let i = 0; i < recItemInfo.length; i++) {
    if (recItemInfo[i].status == 2) {
      return;
    }
  }
  downloadItem.status = 2;
  let downloadAjax = new XMLHttpRequest();
  downloadItem.ajaxObj = downloadAjax;
  downloadAjax.onload = function () {
    downloadFromUrl(downloadAjax);
  };
  downloadAjax.onprogress = function (event) {
    if (downloadItem.status == -4) {
      downloadAjax.abort();
      return;
    }
    if (downloadItem.file.type == 1) {
      downloadProgress(event.loaded, downloadItem.file.size, downloadItem);
    } else {
      downloadProgress(event.loaded, event.total, downloadItem);
    }
  };
  downloadAjax.onreadystatechange = function () {
    if (downloadAjax.readyState == 4) {
      console.log("type: " + downloadItem.file.type);
      console.log("status: " + downloadAjax.status);
      if (
        downloadAjax.status == 200 &&
        downloadItem.currentSize == downloadItem.totalSize
      ) {
        downloadSuccess(downloadItem);
      } else {
        if (downloadItem.file.type == 1) {
          downloadSuccess(downloadItem);
          return;
        }
        downloadError(downloadItem);
      }
    }
  };
  downloadAjax.onabort = function () {
    downloadAbort(downloadItem);
  };
  downloadAjax.responseType = "blob";
  downloadAjax.open("GET", baseUrl + "/get/download_item", true);
  downloadAjax.setRequestHeader("item_id", downloadItem.id);
  downloadAjax.setRequestHeader("g_id", downloadItem.file.g_id);
  downloadAjax.setRequestHeader("status", downloadItem.status);
  downloadAjax.send(null);
}
window.onload = function () {
  let topLabel = document.getElementById("topSendlabel");
  let width = Number.parseFloat(topLabel.offsetWidth);
  let topLabel_1 = document.getElementById("topSendlabel_2");
  let width_1 = Number.parseFloat(topLabel_1.offsetWidth);
  let topLabel_2 = document.getElementById("topSendlabel_3");
  let width_2 = Number.parseFloat(topLabel_2.offsetWidth);
  let topLabel_3 = document.getElementById("upload_img");
  let width_3 = Number.parseFloat(topLabel_3.offsetWidth);
  let parentWidth = Number.parseFloat(topLabel.parentNode.style.width);
  topLabel.style.marginLeft = (parentWidth - width) / 2 + "px";
  topLabel_1.style.marginLeft = (parentWidth - width_1) / 2 + "px";
  topLabel_2.style.marginLeft = (parentWidth - width_2) / 2 + "px";
  topLabel_3.style.marginLeft = (parentWidth - width_3) / 2 + "px";
  let selectFile = document.getElementById("select_file");
  selectFile.addEventListener("dragover", ondragOverTop);
  selectFile.addEventListener("drop", onDropFinished);
  selectFile.addEventListener("dragenter", onDragEnterZone);
  selectFile.addEventListener("dragleave", onDragExitZone);
  let uploadImg = document.getElementById("upload_img");
  uploadImg.src = baseUrl + "/common/upload";
  document.getElementById("logo").src = baseUrl + "/favicon.ico";
  document.getElementById("container").innerHTML = getEmptyView();
  let doc = document.getElementById("empty_img");
  doc.src = baseUrl + "/common/empty";
  getDownloadInfo();
};
