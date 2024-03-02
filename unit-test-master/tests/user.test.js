const it = require("ava").default;
const descripe = require("ava").describe;

const chai = require("chai");
var expect = chai.expect;
const startDB = require("../helpers/DB");
const { MongoMemoryServer } = require("mongodb-memory-server");
const {
  addUser,
  getUsers,
  getSingleUser,
  deleteUser,
  updateUser,
} = require("../controllers/user");
const sinon = require("sinon");
const utils = require("../helpers/utils");
const User = require("../models/user");
const { default: mongoose } = require("mongoose");
const log = require("console").log;

it.before(async (t) => {
  t.context.mongod = await MongoMemoryServer.create();
  process.env.MONGOURI = t.context.mongod.getUri("itiUnitTesting");
  await startDB();
});

it.after(async (t) => {
  //   await t.context.mongod.stop({ doCleanUp: true });
  mongoose.disconnect();
  t.context.mongod.stop();
});

// it.beforeEach(async () => {
//   // Create test users and save them to the in-memory database
//   const testUser1 = new User({
//     age: 23,
//   });
//   const testUser2 = new User({
//     age: 24,
//   });
//   await testUser1.save();
//   await testUser2.save();
// });

// it.afterEach(async () => {
//   // Remove all users after each test
//   await User.deleteMany({});
// });

it("should create one user", async (t) => {
  // setup
  const fullName = "menna hamdy";
  const request = {
    body: {
      firstName: "menna",
      lastName: "hamdy",
      age: 3,
      job: "developer",
    },
  };
  expectedResult = {
    fullName,
    age: 3,
    job: "developer",
  };
  // exercise
  // sinon.stub(utils, 'getFullName').returns(fullName);
  const stub1 = sinon.stub(utils, "getFullName").callsFake((fname, lname) => {
    expect(fname).to.be.equal(request.body.firstName);
    expect(lname).to.be.equal(request.body.lastName);
    return fullName;
  });
  t.teardown(async () => {
    await User.deleteMany({
      fullName: request.body.fullName,
    });
    stub1.restore();
  });
  const actualResult = await addUser(request);
  // verify
  expect(actualResult._doc).to.deep.equal({
    _id: actualResult._id,
    __v: actualResult.__v,
    ...expectedResult,
  });
  const users = await User.find({
    fullName,
  }).lean();
  expect(users).to.have.length(1);
  expect(users[0]).to.deep.equal({
    _id: actualResult._id,
    __v: actualResult.__v,
    ...expectedResult,
  });
  t.pass();
});

// Get Users test case
it("should return an array with the same length and has ID", async (t) => {
  const request = {};
  const reply = { code: sinon.stub(), send: sinon.stub() };
  const testUser1 = new User({ age: 12 });
  const testUser2 = new User({ age: 5 });
  await testUser1.save();
  await testUser2.save();

  const expectedUsers = await User.find();
  const actualResult = await getUsers(request);
  // console.log(actualResult);
  for (let user of actualResult) {
    expect(user).to.have.property("_id");
  }
  //   const users = await getUsers(request, reply);
  expect(actualResult).to.have.length(expectedUsers.length);
  //   expect(reply.send).to.({ users: [] });

  t.pass();
});

it("Get should throw an error", async (t) => {
  const request = {};
  const testUser1 = new User({ age: 12 });
  const testUser2 = new User({ age: 5 });
  await testUser1.save();
  await testUser2.save();

  sinon.stub(User, "find").rejects(new Error("Database error"));

  try {
    await getUsers(request);
    t.fail("Expected an error to be thrown");
  } catch (error) {
    expect(error.message).to.equal("Database error");
  } finally {
    User.find.restore();
  }
  // tear down
  await utils.clearDB(t, testUser1);
  await utils.clearDB(t, testUser2);
  t.pass();
});

// Get Single user
it("should return a single user", async (t) => {
  const testUser1 = new User({
    age: 23,
  });
  await testUser1.save();

  const users = await User.find();
  const userId = users[0]._id.toString();
  const request = { params: { id: userId } };
  const user = await getSingleUser(request);

  // test cases
  expect(user._id.toString()).to.be.equal(userId);
  expect(user).to.have.property("_id");
  expect(Object.keys(user).length).to.be.equal(3);

  // tear down
  await utils.clearDB(t, testUser1);

  t.pass();
});

// Delte test case
it("should return the deleted user", async (t) => {
  const testUser1 = new User({
    age: 23,
  });
  await testUser1.save();

  const users = await User.find();
  const userId = users[0]._id.toString();
  const request = { params: { id: userId } };
  const user = await deleteUser(request);

  expect(user._id.toString()).to.be.equal(userId);

  // tear down
  await utils.clearDB(t, testUser1);

  t.pass();
});

// Update User
it("Should return the updated user", async (t) => {
  const testUser1 = new User({
    age: 23,
  });
  await testUser1.save();

  const users = await User.find();
  const userId = users[0]._id.toString();
  const request = { body: { age: 59 }, params: { id: userId } };
  const actualResult = await updateUser(request);

  // test cases
  expect(actualResult.age).to.be.equal(request.body.age);
  expect(actualResult._id.toString()).to.be.equal(userId);

  // tear down
  await utils.clearDB(t, testUser1);

  t.pass();
});

it("should throw error on update", async (t) => {
  const testUser1 = new User({ age: 12 });
  const testUser2 = new User({ age: 5 });
  await testUser1.save();
  await testUser2.save();

  const users = await User.find();
  const userId = users[0]._id.toString();
  const request = { body: { age: 59 }, params: { id: userId } };

  // fake the function
  sinon.stub(User, "findByIdAndUpdate").rejects(new Error("Database error"));

  // try to throw an error
  try {
    await updateUser(request);
    t.fail("Expected an error to be thrown");
  } catch (error) {
    expect(error.message).to.equal("Database error");
  } finally {
    User.findByIdAndUpdate.restore(); // return function to original state
  }

  // teardown
  await utils.clearDB(t, testUser1);
  await utils.clearDB(t, testUser2);

  t.pass();
});
