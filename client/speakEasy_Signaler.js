// <script src="/reliable-signaler/signaler.js"></script>

function initReliableSignaler(channel, socketURL) {
  var socket;

  if (!channel) throw '"channel" argument is required.';

  function initSocket() { //all the handlers!
    if (socket && channel && channel.isInitiator && channel.roomid) {
      socket.emit('keep-session', channel.roomid);
    }
    socket = io.connect(socketURL || '/');
    socket.on('error', function () {
      socket.isHavingError = true;
      initSocket();
    });

    socket.on('disconnect', function () {
      console.log("Socket DISConnect event fired")
        //if pleb and ManagerchannelEstablish === true, do nothing. Otherwise initsocket()
      socket.isHavingError = true;
      initSocket();
    });

    socket.on('connect', function () {
      socket.emit("establish_role", getRandomString()); //need to check for collisions
      console.log("Socket Connect event fired")
    });

    socket.on('Manager_Setup', function (data) {
      console.log("MANAGER SETUP", data);
      channel.userid = data.managerId;
      channel.transmitRoomOnce = true;
      channel.open(data.managerId);
      SpeakEasy.ManagerInfo.managerStatus = status;
      SpeakEasy.ManagerInfo.managerId = data.managerId;
    });

    socket.on('Pleb_Setup', function (data) {
      console.log("PLEB SETUP", data);
      channel.connect(data.managerId);
      channel.join({
        id: data.managerId,
        owner: data.managerId
      });
      SpeakEasy.PlebInfo.plebStatus = true;
      SpeakEasy.PlebInfo.socketId = data.plebId;
    });

    socket.on('message', function (data) {
      if (onMessageCallbacks[data.channel]) {
        onMessageCallbacks[data.channel](data.message);
      };
    });

  }
  initSocket();
  //============================================================================== Connection error handling!!!!!
  function listenEventHandler(eventName, eventHandler) {
    window.removeEventListener(eventName, eventHandler);
    window.addEventListener(eventName, eventHandler, false);
  }
  listenEventHandler('load', onLineOffLineHandler);
  listenEventHandler('online', onLineOffLineHandler);
  listenEventHandler('offline', onLineOffLineHandler);

  function onLineOffLineHandler() {
    if (!navigator.onLine) {
      return console.warn('Internet channel seems disconnected or having issues.');
    }
    // if socket.io was disconnected out of network issues...try a reconnect
    if (socket.isHavingError) {
      initSocket();
    }
  }
  //============================================================================== Connection error handling!!!!!
  var onMessageCallbacks = {};
  channel.onmessage = function (data) {
    if (data.isPleb_initiation) { //check to see if is pleb connection connection intiation
      return socket.emit("man_pleb_handshake_confirm", data)
    }
  }
}

channel.openSignalingChannel = function (config) {
  var channel = config.channel || this.channel || 'default-channel';
  onMessageCallbacks[channel] = config.onmessage;
  if (config.onopen) setTimeout(config.onopen, 1);
  return {
    send: function (message) {
      socket.emit('message', {
        sender: channel.userid,
        channel: channel,
        message: message
      });
    },
    channel: channel
  };
};
channel.onopen = function (userid, dataChannel) {
  console.log("=======FOFOFOFOFOFOFOFOFOFOFOFOFOFO++++++")
  if (SpeakEasy.PlebInfo.plebStatus === true) {
    return channel.send({ //send message to manager to complete initial handshake
      isPleb_initiation: true,
      plebSocketId: SpeakEasy.PlebInfo.socketId
    })
  }
  document.getElementById('input-text-chat').disabled = false;
  console.log("LocalDataChannel on open event in SIGNALER, (was in index htm;): ", userid, dataChannel);
};

function getRandomString() {
  if (window.crypto && window.crypto.getRandomValues && navigator.userAgent.indexOf('Safari') === -1) {
    var a = window.crypto.getRandomValues(new Uint32Array(3)),
      token = '';
    for (var i = 0, l = a.length; i < l; i++) {
      token += a[i].toString(36);
    }
    return token;
  } else {
    return (Math.random() * new Date().getTime()).toString(36).replace(/\./g, '');
  }
}

return {
  socket: socket,
  createNewRoomOnServer: function (roomid, successCallback) {
    // for reusability on failures & reconnect
    channel.roomid = roomid;
    channel.isInitiator = true;
    channel.userid = channel.userid || getRandomString();
    socket.emit('keep-in-server', roomid || channel.channel, successCallback || function () {});
  },
  getRoomFromServer: function (roomid, callback) {
    channel.userid = channel.userid || getRandomString();
    socket.emit('get-session-info', roomid, callback);
  }
};
}