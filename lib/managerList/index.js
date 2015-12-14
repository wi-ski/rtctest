var sysLog = require("sysLog");

module.exports = function ManagerList(managerSize) {
  this.managerSize = managerSize || 3;
  this.length = 0;
  this.storage = {}; //stores manager socke.id and number of connections each manager currently has.
  /*
   * Configurable pleb data
   *  
   * @return {object} object - Client side pleb configuration data object
   */
  function plebData(plebId, manId) {
    return {
      plebId: plebId,
      managerId: manId
    };
  }

  /*
   * Configurable Storage entry data
   * 
   * @param {socket} socket - The Socket of the manager
   * @return {object} object - The storage entry containing the socket and a collection of plebs (Unique user ids)
   */
  this.newManagerEntry = function (socket) {
      var newManEntry = {
        socket: socket,
        plebs: []
      };
      this.storage[socket.id] = newManEntry;
      socket.emit("Manager_Setup", {
        managerId: socket.id
      });
      sysLog("New Manager Created, id: " + socket.id);
      this.length++;
    }
    /*
     * Takes a socket and determines if it would become a new manager or the pleb of a manager.  Stores the socket at key `socket.id`
     * 
     * @param {object} socket - The Socket representing the would be Manager or Pleb
     * @param {string} userId - unique identifier for the user.  Only really utilized if new user becomes pleb and is pushed into a manager's pleb collection.
     * 
     */
  this.introduce = function (socket) {
      if (socket.id in this.storage) throw new Error("SocketId already in use by other manager");
      if (!this.length) { //if nobody is currently a manager, meaning no users are connected
        this.newManagerEntry(socket); // returns {socket:socket, plebs:[]};
        return this;
      }
      for (var managerId in this.storage) {
        if (this.storage[managerId].plebs.length < this.managerSize) {
          socket.emit("Pleb_Setup", plebData(socket.id, managerId));
          sysLog("New Pleb Created for manager " + managerId + ". Plebs: " + this.storage[managerId].plebs);
          return this;
        }
      }
      debugger;
      this.newManagerEntry(socket)
      return this;
    }
    /*
     * Takes a manager's socket id and a corresponding plebId and removes the pleb from the manager's pleb collection
     * 
     * @param {string} managerId - The id representing the manager's socket id
     * @param {string} plebId - unique identifier for the pleb
     * 
     */
  this.removePleb = function (managerId, plebId) {
      var storage = this.storage;
      var manager = storage[managerId];
      var plebIndex = manager.plebs.indexOf(plebId);
      if (!managerId || !plebId) return sysLog("Proper params for removePleb reqd, provided: ", arguments);
      if (!manager) return sysLog("This is wierd, the managerId wasn't found in the managerList", managerId);
      if (plebIndex === -1) return sysLog("This is wierd, the plebId wasn't found in the manager's pleb collection", plebId);
      manager.plebs.splice(plebIndex, 1);
      sysLog("Pleb: " + plebId + " removed from Manager: " + managerId);
      return this;
    }
    /*
     * Takes a manager's socket id and a removes it from the manager list
     *
     * @param {string} managerId - The id representing the manager's socket id
     * 
     */
  this.removeManager = function (managerId) {
      if (!managerId) {
        sysLog("No manger id provided in `removemanager`");
        return this;
      }
      if (!this.storage[managerId]) {
        sysLog("This is wierd, the managerId wasn't found in the managerList");
        return this;
      }
      delete this.storage[managerId];
      this.length--;
      sysLog("Manager: " + managerId + " removed from managerList.");
      return this;
    }
    /*
     * Called by a manager connection to toggle a connection's manConfirmed status to true;
     *
     * @param {string} plebSocketId - The id representing the plebs's socket id in the pending connections object.
     * 
     */
  this.plebRecieved = function (managerId, plebSocketId) {
    this.storage[managerId].plebs.push(plebSocketId);
  }
}