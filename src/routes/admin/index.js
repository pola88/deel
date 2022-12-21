const express = require('express')
const bestProfession = require('./best_profession')
const bestClient = require('./best_client')

const adminRouter = express.Router()

adminRouter.use(bestProfession)
adminRouter.use(bestClient)

module.exports = adminRouter;