// TODO: TEST pending connections object


var expect = require('chai').expect;

var ManagerList = require("../customModules/managerList.js");

function Socket(id) { //this is really just a stand in atm - children of managers will actually not have an open socket to mother
  this.id = id;
  this.emit = function () {
      console.log("Socket with id: " + this.id + " is emitting")
    }
    //customizable thing. - might swap for actual socket
}


beforeEach(function () {
  managerList = new ManagerList(3);
});

describe('ManagerList', function () {

  it('It should make a new Manager if nobody is in the list.', function () {
    managerList.introduce(new Socket(1));
    expect(managerList.length).to.equal(1);
    expect(managerList.storage[1].plebs.length).to.equal(0);
  });

  it('It should make a new Manager after three people have been introduce to a single manager (4 people added to list) and store the new plebs in the initial managers plebs', function () {
    managerList.introduce(new Socket(1), 6);
    managerList.introduce(new Socket(2), 7);
    managerList.introduce(new Socket(3), 8);
    managerList.introduce(new Socket(4), 9);
    managerList.introduce(new Socket(5), 10);
    expect(managerList.length).to.equal(2);
    expect(managerList.storage[1].plebs.length).to.equal(3);
    expect(managerList.storage[1].plebs[0]).to.equal(7);
    expect(managerList.storage[1].plebs[1]).to.equal(8);
    expect(managerList.storage[1].plebs[2]).to.equal(9);
    //new manager, shouldn't have any plebs
    expect(managerList.storage[5].plebs.length).to.equal(0);
  });

  it('It should make a new Manager after the previous manager\'s pleb list has been filled and then place new users into the manager\'s pleb list', function () {
    managerList.introduce(new Socket(1), 6);
    managerList.introduce(new Socket(2), 7);
    managerList.introduce(new Socket(3), 8);
    managerList.introduce(new Socket(4), 9);
    //manager with id 1 should have plebs with ids 7 8 9.
    managerList.introduce(new Socket(5), 10);
    managerList.introduce(new Socket(6), 11);
    managerList.introduce(new Socket(7), 12);
    //manager with id 5 should have plebs with ids 11 12.
    expect(managerList.length).to.equal(2);
    expect(managerList.storage[1].plebs.length).to.equal(3);
    expect(managerList.storage[1].plebs[0]).to.equal(7);
    expect(managerList.storage[1].plebs[1]).to.equal(8);
    expect(managerList.storage[1].plebs[2]).to.equal(9);
    expect(managerList.storage[5].plebs.length).to.equal(2);
    expect(managerList.storage[5].plebs[0]).to.equal(11);
    expect(managerList.storage[5].plebs[1]).to.equal(12);
  });

  it('It should decrease the length of the list when a manager is removed', function () {

    managerList.introduce(new Socket(1), 0);
    managerList.introduce(new Socket(2), 9);
    managerList.introduce(new Socket(3), 8);
    managerList.introduce(new Socket(4), 7);
    managerList.introduce(new Socket(5), 6);
    expect(managerList.length).to.equal(2);
    expect(managerList.removeManager(5).length).to.equal(1);
    expect(managerList.removeManager(1).length).to.equal(0);
    expect(managerList.removeManager(1).length).to.equal(0);
    expect(managerList.removeManager().length).to.equal(0);
  });

  it('Its length should not go lower than 0', function () {
    expect(managerList.removeManager().length).to.equal(0);
  });

  it('It should remove plebs from managers', function () {
    managerList.introduce(new Socket(1), 0);
    managerList.introduce(new Socket(2), 9);
    managerList.introduce(new Socket(3), 8);
    managerList.introduce(new Socket(4), 7);
    expect(managerList.length).to.equal(1);
    expect(managerList.storage[1].plebs.length).to.equal(3);
    expect(managerList.removePleb(1, 9).length).to.equal(0);
    expect(managerList.removeManager().length).to.equal(0);

  });
});