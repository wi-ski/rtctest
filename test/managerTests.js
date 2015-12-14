// TODO: TEST pending connections object


var expect = require('chai').expect;

var ManagerList = require("managerList");

function Socket(id) { //this is really just a stand in atm - children of managers will actually not have an open socket to mother
  this.id = id;
  this.emit = function (event, data) {
    emissions.push({
      event: event,
      data: data
    });
  }
}


beforeEach(function () {
  managerList = new ManagerList(3);
  emissions = [];
});

describe('ManagerList', function () {

  it('It should make a new Manager if nobody is in the list.', function () {
    managerList.introduce(new Socket(1));
    expect(managerList.length).to.equal(1);
    expect(managerList.storage[1].plebs.length).to.equal(0);
  });

  it('It should recieve new plebs and place them into a Managers Collection', function () {
    managerList.introduce(new Socket(1)); //first man
    managerList.plebRecieved(1, 2);
    managerList.plebRecieved(1, 3);
    managerList.plebRecieved(1, 4);
    expect(managerList.length).to.equal(1);
    expect(managerList.storage[1].plebs.length).to.equal(3);
    expect(managerList.storage[1].plebs[0]).to.equal(2);
    expect(managerList.storage[1].plebs[1]).to.equal(3);
    expect(managerList.storage[1].plebs[2]).to.equal(4);
    //new manager, shouldn't have any plebs
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
    managerList.plebRecieved(1, 2);
    managerList.plebRecieved(1, 3);
    managerList.plebRecieved(1, 4);
    expect(managerList.storage[1].plebs.length).to.equal(3);
    managerList.removePleb(1, 2);
    expect(managerList.storage[1].plebs.length).to.equal(2);
  });

  it('It should remove the correct plebs from managers', function () {
    managerList.introduce(new Socket(1));
    managerList.plebRecieved(1, 2);
    managerList.removePleb(1, 2);
    expect(managerList.storage[1].plebs.indexOf(2)).to.equal(-1);
  })

});