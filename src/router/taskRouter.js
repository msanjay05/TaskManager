const express = require("express");
const auth = require("../middleware/auth");
const Task = require("../models/task");
const router = new express.Router();


// create task
router.post("/tasks", auth, async (req, res) => {
  // const task = new Task(req.body);
  const task = new Task({
    ...req.body,
    owner: req.user._id,
  });
  try {
    await task.save();
    res.status(201).send(task);
  } catch (e) {
    res.status(400).send(e);
  }
});


// queryparams=  completed,skip,limit,sortby,orderby
router.get("/tasks", auth, async (req, res) => {
  const match = {};
  const sort={};
  if (req.query.completed) {
    match.completed = req.query.completed === "true";
  }
  if(req.query.sortBy)
  {
    const sortBy=req.query.sortBy;
    let orderBy=-1;
    if(req.query.orderBy)
    {
      if(req.query.orderBy==='asc')
        orderBy=1;
      else
        orderBy=-1
    }
    sort[sortBy]=orderBy;
  }
  try {
    // const tasks = await Task.find({owner:req.user._id});
    await req.user.populate({
      path: "userTasks",
      match,
      options:{
        limit:parseInt(req.query.limit),
        skip:parseInt(req.query.skip),
        sort
      }
    });
    if (req.user.userTasks.length === 0) {
      return res.status(400).send({ error: "No task found for user" });
    }
    res.send({tasks:req.user.userTasks,total:req.user.userTasks.length});
  } catch (e) {
    res.status(500).send(e);
  }
});

router.get("/tasks/:id", auth, async (req, res) => {
  const _id = req.params.id;
  try {
    // const task = await Task.findById(_id);
    const task = await Task.findOne({ _id, owner: req.user._id });
    if (!task) {
      return res.status(400).send({ error: "Id not found" });
    }
    res.send(task);
  } catch (e) {
    res.status(500).send(e);
  }
});

router.patch("/tasks/:id", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["description", "completed"];
  const isAllowed = updates.every((update) => {
    return allowedUpdates.includes(update);
  });
  if (!isAllowed) {
    return res.status(400).send({ error: "Field doesn't eexist" });
  }
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });
    if (!task) {
      return res.status(400).send({ error: "Id not found" });
    }
    updates.forEach((update) => {
      task[update] = req.body[update];
    });
    await task.save();
    res.send(task);
  } catch (e) {
    res.status(500).send(e);
  }
});

router.delete("/tasks/:id", auth, async (req, res) => {
  const _id = req.params.id;
  try {
    const task = await Task.findOneAndDelete({ _id, owner: req.user._id });
    if (!task) {
      return res.status(400).send({ error: "Id not found" });
    }
    res.send(task);
  } catch (e) {
    res.status(500).send(e);
  }
});

module.exports = router;
