const User = require("../models/user");

const getFullName = (firstName, lastName) => {
  return firstName + " " + lastName;
};

const getUserFromDP = async (fun) => {
  const users = await User.find();
  const userId = users[0]._id.toString();
  const request = { params: { id: userId } };
  const user = await fun(request);

  return user, userId;
};

const clearDB = async (t, user) => {
  t.teardown(async () => {
    await User.deleteMany({
      age: user.age,
    });
  });
};

module.exports = {
  getFullName,
  getUserFromDP,
  clearDB,
};
