const express = require("express");
const cookieParser = require("cookie-parser");
const cron = require("node-cron");
const cors = require("cors");
require("dotenv").config();
const usersRouter = require("./routes/usersRouter");
const { errorHandler } = require("./middlewares/errorMiddleware");
const geminiAIRouter = require("./routes/geminiAIRouter");
const razorpayRouter = require("./routes/razorpayRouter");
const User = require("./models/User");
require("./utils/connectDb")();


const app = express();
const PORT = process.env.PORT || 8090;

//cron for the trial period : run every single
//Cron for the trial period : run every single
cron.schedule("0 0 * * * *", async () => {
  console.log("This task runs every second");
  try {
    //get the current date
    const today = new Date();
    const updatedUser = await User.updateMany(
      {
        trialActive: true,
        trialExpires: { $lt: today },
      },
      {
        trialActive: false,
        subscriptionPlan: "Free",
        monthlyRequestCount: 5,
      }
    );
    console.log(updatedUser);
  } catch (error) {
    console.log(error);
  }
});

//Cron for the Free plan: run at the end of every month
cron.schedule("0 0 1 * * *", async () => {
  try {
    //get the current date
    const today = new Date();
    await User.updateMany(
      {
        subscriptionPlan: "Free",
       
      },
      {
        monthlyRequestCount: 0,
      }
    );
  } catch (error) {
    console.log(error);
  }
});

//Cron for the Basic plan: run at the end of every month
cron.schedule("0 0 1 * * *", async () => {
  try {
    //get the current date
    const today = new Date();
    await User.updateMany(
      {
        subscriptionPlan: "Basic",
        nextBillingDate: { $lt: today },
      },
      {
        monthlyRequestCount: 0,
      }
    );
  } catch (error) {
    console.log(error);
  }
});

//Cron for the Premium plan: run at the end of every month
cron.schedule("0 0 1 * * *", async () => {
  try {
    //get the current date
    const today = new Date();
    await User.updateMany(
      {
        subscriptionPlan: "Premium",
        nextBillingDate: { $lt: today },
      },
      {
        monthlyRequestCount: 0,
      }
    );
  } catch (error) {
    console.log(error);
  }
});


//----middlewares----
app.use(express.json()); //pass incoming json data
app.use(cookieParser()); //pass the cookie automatically



app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'], // Allow multiple origins
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use((req, res, next) => {
  //console.log("Auth Header:", req.headers.authorization);
  next();
});

  


//----Routes

app.use("/api/v1/users", usersRouter);
app.use("/api/v1/gemini", geminiAIRouter);
app.use("/api/v1/razorpay", razorpayRouter);

//-----Error Handler middleware
app.use(errorHandler);
//start the server
app.listen(PORT, console.log(`Server is running on port ${PORT}`));









