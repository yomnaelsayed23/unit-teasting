const utils = require("../helpers/utils");
const User = require("../models/user");
const mongoose = require("mongoose");

const addUser = async (request, reply) => {
  try {
    const userBody = request.body;

    userBody.fullName = utils.getFullName(
      userBody.firstName,
      userBody.lastName
    ); // test getfull name
    delete userBody.firstName;
    delete userBody.lastName;
    const user = new User(userBody);
    const addedUser = await user.save();
    return addedUser;
  } catch (error) {
    throw new Error(error.message);
  }
};

// getUsers
const getUsers = async (request, reply) => {
  try {
    const users = await User.find();
    return users;
  } catch (error) {
    throw new Error(error.message);
  }
};
// getSingleUser
const getSingleUser = async (request, reply) => {
  const users = await User.find();
  // const id = Number(request.params.id);
  // const mongoId = new mongoose.Types.ObjectId(id);
  // const user = await User.findOne({ id });
  const id = request.params.id.toString();
  const user = users.find((user) => user._id == id);
  if (!user) return reply.code(404).send({ error: "User not found" });

  return user;
};

// deleteUser
const deleteUser = async (request, reply) => {
  const id = request.params.id;
  const users = await User.find();
  const user = users.find((user) => user._id == id);
  const mongoId = new mongoose.Types.ObjectId(user._id);

  const deletedUser = await User.findByIdAndDelete(mongoId);
  if (!deletedUser) return reply.code(404).send({ error: "User not found" });

  return deletedUser;
};

// bonus : validation, updateUser
const updateUser = async (request, reply) => {
  const id = request.params.id;
  const body = request.body;
  // const users = await User.find();
  // const user = users.find((user) => user._id == id);
  // const mongoId = new mongoose.Types.ObjectId(user._id);

  const updatedUser = await User.findByIdAndUpdate(id, body, { new: true });
  if (!updatedUser) return reply.code(404).send({ error: "User not found" });

  return updatedUser;
};

module.exports = {
  addUser,
  getUsers,
  getSingleUser,
  deleteUser,
  updateUser,
};
