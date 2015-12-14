// <script src="/reliable-signaler/signaler.js"></script>

function initReliableSignaler(channel) {

  if (!channel) throw '"channel" argument is required.';

  function initSocket() { //all the handlers!
    SpeakEasy.resetState();
    console.log("Init socket")
    SpeakEasy.socket = io.connect('/', {
      reconnect: false
    });

    SpeakEasy.socket.on('error', function () {
      socket.isHavingError = true;
      initSocket();
    });

    SpeakEasy.socket.on('connect', function () {
      SpeakEasy.socket.emit("establish_role");
      console.log("Socket Conn with mother established");
    });

    SpeakEasy.socket.on('disconnect', function () {
      if (SpeakEasy.PlebInfo.plebStatus === true) {
        // SpeakEasy.socket = null;
        return console.log("Pleb status established with manager and socket disconnected");
      }
      SpeakEasy.socket.isHavingError = true;
      console.log("Socket disconnected for unexpected reason, trying re-init socket")
      initSocket(); //if not pleb, means was manager or hadn't been established yet.  Reconnect
    });

    SpeakEasy.socket.on('Manager_Setup', function (data) {
      console.log("MANAGER SETUP", data);
      channel.userid = data.managerId;
      channel.transmitRoomOnce = true;
      channel.open(data.managerId);
      SpeakEasy.ManagerInfo.managerStatus = true;
      SpeakEasy.ManagerInfo.managerId = data.managerId;
    });

    SpeakEasy.socket.on('Pleb_Setup', function (data) {
      console.log("PLEB SETUP", data);
      channel.connect(data.managerId);
      channel.join({
        id: data.managerId,
        owner: data.managerId
      });
      SpeakEasy.PlebInfo.plebStatus = true;
      SpeakEasy.PlebInfo.oldPlebSocketId = data.plebId;
    });

    SpeakEasy.socket.on('message', function (data) {
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
    if (SpeakEasy.socket.isHavingError) {
      initSocket();
    }
  }
  //============================================================================== Connection error handling!!!!!
  var onMessageCallbacks = {};
  channel.openSignalingChannel = function (config) {
    var channel = config.channel || this.channel || 'default-channel';
    onMessageCallbacks[channel] = config.onmessage;
    if (config.onopen) setTimeout(config.onopen, 1);
    return {
      send: function (message) {
        SpeakEasy.socket.emit('message', {
          sender: channel.userid,
          channel: channel,
          message: message
        });
      },
      channel: channel
    };
  };

  channel.onmessage = function (data, rtcId) {
    console.log("Channel on message event", data, rtcId)
    if (data.isPleb_initiation && SpeakEasy.ManagerInfo.managerStatus) { //check to see if is pleb connection intiation
      console.log("man_pleb_handshake_confirm", data);
      SpeakEasy.ManagerInfo.plebs[rtcId] = {
        oldSocketId: data.plebSocketId
      };
      return SpeakEasy.socket.emit("Pleb_Recieved", data.plebSocketId);
    }
  };

  channel.onleave = function (rtcId) {
    var plebSocketId = SpeakEasy.ManagerInfo.plebs[rtcId].oldSocketId;
    if (SpeakEasy.ManagerInfo.managerStatus) {
      SpeakEasy.socket.emit('Pleb_Lost', plebSocketId);
    }
  }

  channel.onopen = function (userid, dataChannel) {
    document.getElementById('input-text-chat').disabled = false;
    if (SpeakEasy.PlebInfo.plebStatus) {
      console.log("Pleb connection event to manager fired");
      channel.send({ //send message to manager to complete initial handshake
        isPleb_initiation: true,
        plebSocketId: SpeakEasy.PlebInfo.oldPlebSocketId
      })
    }
  };
}