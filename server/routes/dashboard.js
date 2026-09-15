const express = require("express");
const router = express.Router();

const { getDashboard, getMonthlySeries } = require("../controllers/dashboardController");
const { verifytoken,verifyAuthorization}=require('../middlewares/verifyToken');




router.get("/", verifytoken,getDashboard);

router.get("/monthly", verifytoken, getMonthlySeries);

module.exports = router;