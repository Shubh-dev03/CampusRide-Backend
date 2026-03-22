const asyncHandler = require("../middlewares/asyncHandler");
const Ride = require("../models/rideModel");
const CustomError = require("../utils/customsError");

// # Ride Creation
const createRide = asyncHandler(async (req, res) => {
  const { from, to, rideTime, rideFare, availableSeats } = req.body;

  //Basic Validation
  if (!from || !to || !rideTime || !rideFare || availableSeats === null) {
    throw new CustomError("All fields are required", 400);
  }
  //Check if ride already exists at the same time
  const existingRide = await Ride.findOne({ driver: req.userId, rideTime });

  if (existingRide) {
    throw new CustomError("Ride already exists at this time", 400);
  }

  //Create new ride
  const newRide = await Ride.create({
    driver,
    from,
    to,
    rideTime,
    rideFare,
    availableSeats,
    passengers: [],
  });
  res.status(201).json({
    success: true,
    message: "Ride Created Successfully!",
    data: newRide,
  });
});

// # Show Rides with available seats
const getAllRides = async (req, res) => {
  try {
    const rides = await Ride.find({ availableSeats: { $gt: 0 } });

    res.status(200).json({
      success: true,
      message: "Rides fetched successfully",
      data: rides,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error fetching rides.",
    });
  }
};

// # Book Ride Controller
const bookRide = asyncHandler(async (req, res) => {
  const { rideId } = req.params;

  const ride = await Ride.findById(rideId);

  // Ride Exists?
  if (!ride) {
    throw new CustomError("Ride not found", 404);
  }
  // Driver can't book own ride
  if (ride.driver.toString() === req.userId) {
    throw new CustomError("You cannot book your own ride", 400);
  }
  //Seats Available
  if (ride.availableSeats <= 0) {
    throw new CustomError("No seats available", 404);
  }
  // Already Booked
  const alreadyBooked = ride.passengers.some(
    (id) => id.toString() === req.userId,
  );

  if (alreadyBooked) {
    throw new CustomError("You already booked this ride", 400);
  }

  //Add passenger
  ride.passengers.push(req.userId);

  //Reduce passenger
  ride.availableSeats -= 1;
  //Save
  await ride.save();

  res.status(200).json({
    success: true,
    message: "Ride booked Successfully",
    data: ride,
  });
});

// # Cancel Ride Controller
const cancelRide = asyncHandler(async (req, res) => {
  const { rideId } = req.params;
  const ride = await Ride.findById(rideId);

  if (!ride) {
    throw new CustomError("Ride does not exist", 404);
  }
  const isPassenger = ride.passengers.some(
    (id) => id.toString() === req.userId,
  );
  if (!isPassenger) {
    throw new CustomError("You have not booked this ride.", 400);
  }
  // Remove userId from passenger list
  ride.passengers = ride.passengers.filter(
    (id) => id.toString() !== req.userId,
  );
  // Increase Seat
  ride.availableSeats += 1;
  //Save
  await ride.save();
  res.status(200).json({
    success: true,
    message: "Ride cancelled successfully!!",
    data: ride,
  });
});

// # MyBookings
const myBookings = async (req, res) => {
  try {
    const userId = req.userId;

    const rides = await Ride.find({
      passengers: userId,
    });

    if (rides.length === 0) {
      return res.status(200).json({
        succes: true,
        message: "No Bookings found",
        data: [],
      });
    }

    res.status(200).json({
      success: true,
      message: "Your Bookings :",
      data: rides,
    });
  } catch (error) {
    console.log("CustomError is :", error);
    res.status(500).json({
      success: false,
      message: "MyBookings API failed.",
    });
  }
};

// # Display MyRides
const myRides = async (req, res) => {
  try {
    const userId = req.userId;

    const rides = await Ride.find({
      driver: userId,
    }).populate("passengers", "name email");

    if (rides.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No rides Posted",
        data: [],
      });
    }
    res.status(200).json({
      success: true,
      message: "Your rides:",
      data: rides,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch Rides.",
    });
  }
};

// Filter Rides
const searchRides = async (req, res) => {
  try {
    const { from, to, rideTime } = req.query;
    let query = {};

    //Build query
    if (from) {
      query.from = new RegExp(from.trim(), "i");
    }
    if (to) {
      query.to = new RegExp(to.trim(), "i");
    }
    if (rideTime) {
      query.rideTime = rideTime;
    }
    //Only show rides with seats
    query.availableSeats = { $gt: 0 };

    const rides = await Ride.find(query);
    console.log("Query : ", req.query);

    res.status(200).json({
      success: true,
      message: "Filtered Rides",
      count: rides.length,
      data: rides,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Search filter API failed",
    });
  }
};

module.exports = {
  createRide,
  getAllRides,
  bookRide,
  cancelRide,
  myBookings,
  myRides,
  searchRides,
};
