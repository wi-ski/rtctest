module.exports = function ManagerList(managerSize) {

  /*
   * Configurable Storage entry data
   * 
   * @param {socket} socket - The Socket of the manager
   * @return {object} object - The storage entry containing the socket and a collection of plebs (Unique user ids)
   */
  function StorageEntry(socket) {
    return {
      socket: socket,
      plebs: []
    };
  }

  this.managerSize = managerSize || 3
  this.length = 0;
  this.storage = {}; //stores manager socke.id and number of connections each manager currently has.
  this.pendingConnections = {}; //stores the waiting to be confirmed connections by pleb socket.id(requires ok from pleb and manager)
  /*
   * Configurable manager data
   *  
   * @return {object} object - Client side manager configuration data object
   */
  this.managerData = function (managerId) {
      return {
        managerId: managerId
      };
    }
    /*
     * Configurable pleb data
     *  
     * @return {object} object - Client side pleb configuration data object
     */
  this.plebData = function (plebId, managerId) {
      return {
        plebId: plebId,
        managerId: managerId
      };
    }
    /*
     * Takes a socket and determines if it would become a new manager or the pleb of a manager.  Stores the socket at key `socket.id`
     * 
     * @param {object} socket - The Socket representing the would be Manager or Pleb
     * @param {string} userId - unique identifier for the user.  Only really utilized if new user becomes pleb and is pushed into a manager's pleb collection.
     * 
     */
  this.introduce = function (socket, userId) {
      var storage = this.storage;
      var pending = this.pendingConnections;
      if (socket.id in storage) throw new Error("Socket already in list");
      if (!this.length) { //if nobody is currently a manager, meaning no users are connected
        storage[socket.id] = new StorageEntry(socket); // returns {socket:socket, plebs:[]};
        socket.emit("Manager_Setup", this.managerData(socket.id));
        console.log("New Manager Created, id: ", socket.id);
        this.length++;
        return this;
      }

      for (var managerId in storage) { //find manager with space, add pleb
        if (storage[managerId].plebs.length < this.managerSize) {
          storage[managerId].plebs.push(userId);
          socket.emit("Pleb_Setup", this.plebData(socket.id, managerId));
          pending[socket.id] = { //needs to be confirmed by both manager and pleb..for reasons that might be unnecessary
            plebConfirmed: false,
            manConfirmed: false
          };
          console.log("New Pleb Created, id: ", storage[managerId].plebs);
          return this;
        }
      }
      storage[socket.id] = new StorageEntry(socket); //no managers have space, time for a new a manager
      socket.emit("Manager_Setup", this.managerData());
      console.log("New Manager Created, id: ", socket.id);
      this.length++;
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
      if (!managerId || !plebid) return console.log("Proper params for removePleb reqd");
      var manager = storage[managerId];
      if (!manager) return console.log("This is wierd, the managerId wasn't found in the managerList");
      var plebIndex = manager.plebs.indexOf(plebId);
      if (plebIndex === -1) return console.log("This is wierd, the plebId wasn't found in the manager's pleb collection");
      manager.plebs.splice(plebIndex, 1);
      console.log("Pleb: " + plebId + " remove from: " + managerId);
      return this;
    }
    /*
     * Takes a manager's socket id and a removes it from the manager list
     *
     * @param {string} managerId - The id representing the manager's socket id
     * 
     */
  this.removeManager = function (managerId) {
    var storage = this.storage;
    if (!managerId) {
      console.log("No manger id provided");
      return this;
    }
    var manager = storage[managerId];
    if (!manager) {
      console.log("This is wierd, the managerId wasn't found in the managerList");
      return this;
    }
    delete storage[managerId];
    this.length--;
    console.log("Manager: " + managerId + " removed from managerList.");
    return this;
  }
}