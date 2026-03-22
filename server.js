const express = require("express");
const app = express();
const dotenv = require("dotenv");
dotenv.config();

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const rideRoutes = require("./routes/rideRoutes");
const errorMiddleware = require("./middlewares/errorMiddleware");

//Server Port
const PORT = 5000;
// Connect DataBase
connectDB();

app.use(express.json());

app.get("/", (req, res) => {
  res.send({
    success: true,
    message: "Route is working.Test something else.",
  });
});

//Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/rides", rideRoutes);
app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`Server running successfully on ${PORT}`);
});
