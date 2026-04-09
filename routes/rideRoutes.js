const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");

const {
  getAllRides,
  bookRide,
  cancelRide,
  myBookings,
  myRides,
  searchRides,
  createRide,
  editRide,
} = require("../controllers/rideController");

// Public Routes
router.get("/", getAllRides);
router.get("/search", searchRides);

// Protected Routes
router.post("/create", authMiddleware, createRide);
router.post("/book/:rideId", authMiddleware, bookRide);
router.post("/cancel/:rideId", authMiddleware, cancelRide);
router.patch("/edit/:rideId", authMiddleware, editRide);
router.get("/mybookings", authMiddleware, myBookings);
router.get("/myrides", authMiddleware, myRides);

module.exports = router;
