// TODO: TEST pending connections object


var chai = require('chai');
var spies = require('chai-spies');
chai.use(spies);
var expect = require('chai').expect;

var ManagerList = require("managerList");

function Socket(id) { //this is really just a stand in atm - children of managers will actually not have an open socket to mother
  this.id = id;
  this.emit = function (event, data) {
    emissions.push({
      event: event,
      data: data
    });
  };
  this.disconnect = function () {
    disconnects.push(this.id);
  }
}


beforeEach(function () {
  managerList = new ManagerList(3);
  emissions = [];
  disconnects = [];
  chai.spy.on(managerList, 'emit', 'disconnect');
});

describe('ManagerList', function () {

  it('It should make a new Manager if nobody is in the list.', function () {
    managerList.introduce(new Socket(1));
    expect(managerList.length).to.equal(1);
    expect(managerList.storage[1].plebs.length).to.equal(0);
  });
  it('Manager should have a pending array', function () {
    managerList.introduce(new Socket(1));
    expect(managerList.storage[1].pending).to.be.instanceof(Array);
  });

  it('It should `introduce` new plebs and place them in a managers pending array', function () {
    managerList.introduce(new Socket(1)); //first man
    var pleb2 = new Socket(2);
    managerList.introduce(pleb2);
    expect(managerList.storage[1].pending[0].socket.id).to.equal(2);
  });

  it('It should recieve new plebs and place them into a Managers Collection', function () {
    managerList.introduce(new Socket(1)); //first man
    expect(managerList.length).to.equal(1);
    var pleb2 = new Socket(2);
    managerList.introduce(pleb2);
    managerList.plebRecieved(1, 2);
    expect(managerList.storage[1].plebs.length).to.equal(1);
  });

  it('It should decrease the length of the list when a manager is removed', function () {
    managerList.introduce(new Socket(1));
    expect(managerList.removeManager(1).length).to.equal(0);
  });

  it('Its length should not go lower than 0', function () {
    expect(managerList.removeManager(1).length).to.equal(0);
  });

  it('It should remove plebs from managers', function () {
    managerList.introduce(new Socket(1));
    var pleb2 = new Socket(2);
    var pleb3 = new Socket(3);
    var pleb4 = new Socket(4);
    managerList.introduce(pleb2);
    managerList.introduce(pleb3);
    managerList.introduce(pleb4);
    managerList.plebRecieved(1, 2);
    managerList.plebRecieved(1, 3);
    managerList.plebRecieved(1, 4);
    expect(managerList.storage[1].plebs.length).to.equal(3);
    managerList.removePleb(1, 2);
    expect(managerList.storage[1].plebs.length).to.equal(2);
  });

  it('It should remove the correct plebs from managers', function () {
    managerList.introduce(new Socket(1));
    var pleb2 = new Socket(2);
    managerList.introduce(pleb2);
    managerList.plebRecieved(1, 2);
    managerList.removePleb(1, 2);
    expect(managerList.storage[1].plebs.indexOf(2)).to.equal(-1);
  })

  it('Generate a new manager when the first manager is full', function () {
    managerList.introduce(new Socket(1));
    var pleb2 = new Socket(2);
    var pleb3 = new Socket(3);
    var pleb4 = new Socket(4);
    var newManager = new Socket(4); //new manager
    managerList.introduce(pleb2);
    managerList.introduce(pleb3);
    managerList.introduce(pleb4);
    managerList.plebRecieved(1, 2);
    managerList.plebRecieved(1, 3);
    managerList.plebRecieved(1, 4);
    managerList.introduce(newManager);
    expect(managerList.length).to.equal(2);
  });

  it('Should return false when introducing pleb not in pending list', function () {
    managerList.introduce(new Socket(1));
    var pleb2 = new Socket(2);
    var resp = managerList.plebRecieved(1, 2);
    expect(resp).to.equal(false);
  });

  it('Generate a new manager when the first manager is full', function () {
    managerList.introduce(new Socket(1));
    var pleb2 = new Socket(2);
    var pleb3 = new Socket(3);
    var pleb4 = new Socket(4);
    var newManager = new Socket(5); //new manager
    var pleb6 = new Socket(6);
    var pleb7 = new Socket(7);
    managerList.introduce(pleb2);
    managerList.introduce(pleb3);
    managerList.introduce(pleb4);
    managerList.plebRecieved(1, 2);
    managerList.plebRecieved(1, 3);
    managerList.plebRecieved(1, 4);
    expect(managerList.storage[1].plebs.length).to.equal(3)
    managerList.introduce(newManager);
    expect(managerList.length).to.equal(2);
    managerList.introduce(pleb6);
    managerList.introduce(pleb7);
    managerList.plebRecieved(5, 6);
    managerList.plebRecieved(5, 7);
    expect(managerList.storage[5].plebs.length).to.equal(2);
  });

  it('Should generate a new manager when a managers pending and current pleb list sum a value equal to the max', function () {
    managerList.introduce(new Socket(1));
    var pleb2 = new Socket(2);
    var pleb3 = new Socket(3);
    var pleb4 = new Socket(4);
    managerList.introduce(pleb2);
    managerList.introduce(pleb3);
    managerList.introduce(pleb4);
    managerList.introduce(new Socket(5));
    expect(managerList.length).to.equal(2);
    var pleb6 = new Socket(6);
    managerList.plebRecieved(1, 2);
    managerList.introduce(pleb6);
    expect(managerList.length).to.equal(2);
    expect(managerList.storage[1].plebs.length).to.equal(1);
  });

});