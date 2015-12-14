var SpeakEasy = {
  socket: null,

  ManagerInfo: {
    oldSocketId: '',
    managerStatus: true,
    plebs: {}
  },
  PlebInfo: {
    oldSocketId: '',
    plebStatus: false
  },

  resetState: function () {
    //also need to reset RTC connections if manager
    this.ManagerInfo.managerStatus = false;
    this.ManagerInfo.pleb_RTC_ids = {};
    this.PlebInfo.plebStatus = false;
  },


  joinRoomInject: function (configObj) {
    //if manager, socket emit to server that pleb has joined
    //if pleb, socket emit to server that has connected to manager
    console.log("joinRoomInject INJECT FIRED");
  },

  sendMessageInject: function (messageObj, channelObj) {
    console.log("sendMessageInject INJECT FIRED");
  },

  leaveEventInject: function (userid, autoCloseEntireSession) {
    //if manager, emit to server that pleb disconnected
    //if pleb, reconnect to server?
    console.log("leaveEventInject INJECT FIRED");



  }
}