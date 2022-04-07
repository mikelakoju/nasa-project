const { application } = require('express');
const express = require('express');

const { httpGetAllLaunches, httpAddNewLaunch, httpAbortLaunch } = require('./launches.controller');

const launchesRouter = express.Router();

// I specified the /launches in the app.js
// /planets/ ----> below points as such
launchesRouter.get('/', httpGetAllLaunches);
launchesRouter.post('/', httpAddNewLaunch);
launchesRouter.delete('/:id', httpAbortLaunch);

module.exports = launchesRouter;
