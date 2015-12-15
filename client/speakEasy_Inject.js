var SpeakEasy = {
  LocalDataChannel: null,
  socket: null,

  ManagerInfo: {
    oldSocketId: '',
    managerStatus: true,
    plebs: {}
  },

  PlebInfo: {
    oldPlebSocketId: '',
    plebStatus: false
  },

  init: function () {
    this.LocalDataChannel = new SpeakEasyChannel();
    initSpeakEasySignaler(this, '/');
  },

  resetState: function () {
    this.ManagerInfo.managerStatus = false;
    this.ManagerInfo.pleb_RTC_ids = {};
    this.PlebInfo.plebStatus = false;
  },

  onMessageInject: function (data, rtcId) {
    var message = JSON.parse(data.message);
    if (message.isPleb_initiation && this.ManagerInfo.managerStatus) { //check to see if is pleb connection intiation
      this.ManagerInfo.plebs[rtcId] = {
        oldSocketId: message.plebSocketId
      };
      console.log("man_pleb_handshake_confirm", this.ManagerInfo.plebs);
      this.socket.emit("pc", message.plebSocketId);
    }
  },

  onLeaveInject: function (rtcId) {
    console.log("ON LEAVE INJECT FIRED", rtcId);
    if (this.ManagerInfo.managerStatus) {
      var plebSocketId = this.ManagerInfo.plebs[rtcId].oldSocketId;
      this.socket.emit('pleblost', plebSocketId);
      return delete this.ManagerInfo.plebs[rtcId];
    }
    this.init();
  },

  onOpenInject: function (userId) {
    console.log("ON OPEN INJECT FIRED", userId);
    if (this.PlebInfo.plebStatus) {
      console.log("Pleb connection event to manager fired");
      this.LocalDataChannel.send({ //send message to manager to complete initial handshake
        isPleb_initiation: true,
        plebSocketId: this.PlebInfo.oldPlebSocketId
      })
    }
  }

}