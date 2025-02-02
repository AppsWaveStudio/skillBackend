const express = require("express");
const { updateTasks } = require("../controller/updatetasks");

const routerUpdateTask = express.Router();

routerUpdateTask.put("/posts/:id/tasks", updateTasks);

module.exports = routerUpdateTask;
