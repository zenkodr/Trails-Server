const express = require("express");
const router = express.Router();
const seedController = require("../controllers/seedController");
const { errorWrapper } = require("../handlers/errorHandlers");

router.get("/combined", seedController.getCombinedTrails);
router.get("/biking", errorWrapper(seedController.getBikingByState));
router.get("/hiking", errorWrapper(seedController.getHikingByState));

module.exports = router;