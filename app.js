const express=require("express")
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const connectDB = require("./config/db");
const Joi = require('joi');
const helmet = require("helmet")
const cors = require("cors")
const { notFound, errorHandler } = require('../Velora/middlewares/errors');
const path = require("path");
const planRoutes = require("./routes/plan");
const paymentRoutes = require("./routes/payment");
const userPlanRoutes=require("./routes/userPlan");



require("./jobs/reminderJob");

dotenv.config();



//init
const app=express()
app.set("view engine", "ejs"); //set view engine to ejs
app.use(express.json()); //middleware to parse JSON request body
app.use(express.urlencoded({ extended: false })); //middleware to parse URL-encoded request body

app.use(cors())
//connect mongoose
connectDB();
//routes
app.use(
    "/uploads",
    express.static(path.join(__dirname, "uploads"))
);
app.use("/auth",require("./routes/auth"))
app.use("/subscription",require("./routes/subscriptions"))
app.use("/bill",require("../Velora/routes/bills"))
app.use("/expenses",require("../Velora/routes/expenses"))
app.use("/installment",require("../Velora/routes/installments"))
app.use("/goal",require("./routes/goal"))
app.use("/dashboard",require("../Velora/routes/dashboard"))
app.use("/plans",planRoutes);
app.use("/user-plan",userPlanRoutes);
app.use("/payment", paymentRoutes);

app.use(notFound)
app.use(errorHandler)

















const port=process.env.PORT ||7000;



app.listen(port, () => {
  console.log(`Server is running in ${process.env.NODE_ENV} mode on port ${port} http://localhost:${port}`);
})

