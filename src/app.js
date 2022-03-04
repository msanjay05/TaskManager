const express = require("express");
const cors=require('cors')
require("./db/mongoose");
const userRouter=require("./router/userRouter")
const taskRouter=require("./router/taskRouter")


const app = express();

app.use(express.json());
app.use(cors())
app.use(userRouter);
app.use(taskRouter);

module.exports=app;