const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User=require('../../src/models/user')
const Task=require('../../src/models/task')


const userTestId = new mongoose.Types.ObjectId();
const userTest = {
  _id: userTestId,
  name: "Sanjay",
  email: "sanjay@gmail.com",
  password: "Sanjay@123",
  tokens: [
    {
      token: jwt.sign({ _id: userTestId }, process.env.JWT),
    },
  ],
};

const userTestId2 = new mongoose.Types.ObjectId();
const userTest2 = {
  _id: userTestId2,
  name: "Sanjay",
  email: "sanjay2@gmail.com",
  password: "Sanjay@123",
  tokens: [
    {
      token: jwt.sign({ _id: userTestId2 }, process.env.JWT),
    },
  ],
};

const taskOne={
    _id:new mongoose.Types.ObjectId(),
    description:'first',
    owner:userTestId
}

const taskTwo={
    _id:new mongoose.Types.ObjectId(),
    description:'second',
    owner:userTestId
}

const taskThree={
    _id:new mongoose.Types.ObjectId(),
    description:'three',
    owner:userTestId2
}

const setUpDatabase = async () => {
  await User.deleteMany();
  await Task.deleteMany();

  await new User(userTest).save();
  await new User(userTest2).save();
  await new Task(taskOne).save();
  await new Task(taskTwo).save();
  await new Task(taskThree).save();
};

module.exports = {
  userTest,
  userTestId,
  userTest2,
  userTestId2,
  setUpDatabase,
  taskOne,
  taskTwo,
  taskThree
};
