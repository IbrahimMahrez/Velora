const express = require("express");
const router = express.Router();

const { getDashboard } = require("../controllers/dashboardController");
const { verifytoken,verifyAuthorization}=require('../middlewares/verifyToken');




router.get("/", verifytoken,getDashboard);

module.exports = router;