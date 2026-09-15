const express = require("express");
const router = express.Router();

const {
  getMyFamily,
  createFamily,
  joinFamily,
  leaveFamily,
  removeMember,
  deleteFamily,
  setFamilyBudget,
} = require("../controllers/familyController");

const { verifytoken } = require("../middlewares/verifyToken");

router.get("/", verifytoken, getMyFamily);
router.post("/", verifytoken, createFamily);
router.post("/join", verifytoken, joinFamily);
router.post("/leave", verifytoken, leaveFamily);
router.post("/remove", verifytoken, removeMember);
router.delete("/", verifytoken, deleteFamily);
router.put("/budget", verifytoken, setFamilyBudget);

module.exports = router;
