const express = require("express");
require("./db/mongoose");
const cors = require('cors');
const userRouter=require("./router/userRouter")
const taskRouter=require("./router/taskRouter")


const app = express();

app.use(express.json());
app.use(cors)
app.use(userRouter);
app.use(taskRouter);

module.exports=app;