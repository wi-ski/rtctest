var SpeakEasy = {
  ManagerInfo: {
    pleb_RTC_ids: {}
  },
  PlebInfo: {},
  userState: "", //pleb or manager


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