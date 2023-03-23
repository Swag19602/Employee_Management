const express = require("express");
const app = express();
const Employees = require("../src/models/employee");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const auth = require("./middleware/auth");
require("./db/conn");
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.post("/register", async (req, res) => {
  try {
    const registerObj = req.body;
    const password = registerObj.password;
    const confirm = registerObj.confirmPass;
    if (password === confirm) {
      const newEmployee = new Employees(registerObj);
      //middleware
      const token = await newEmployee.generateAuthToken();
      console.log(token);
      // saving the jwt token as cookies
      res.cookie("jwt", token, {
        maxAge: 90000,
        httpOnly: true,
        // secure: true
      });
      const employeeData = await newEmployee.save();
      res.status(201).send("Registration successful");
    } else {
      res.status(404).send("Password not matching");
    }
  } catch (error) {
    console.log(error);
  }
});
app.post("/login", async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const queryDetail = await Employees.findOne({ email: email });
    const isMatch = bcrypt.compare(password, queryDetail.password);
    //middleware
    const token = await queryDetail.generateAuthToken();
    console.log(token);
    // saving the jwt token as cookies
    res.cookie("jwt", token, {
      maxAge: 90000,
      httpOnly: true,
      // secure: true
    });
    if (!isMatch) {
      res.send("Enter connect password");
    } else if (isMatch) {
      res.send("LogIn Success");
    } else {
      res.status(404).send("Invalid Login Details");
    }
  } catch (error) {}
});

app.post("/logout", auth, async (req, res) => {
  try {
    console.log("this is req user", req.user);
    req.user.tokens = req.user.tokens.filter((token) => {
      return req.user.tokens != req.cookies.jwt;
    });
    req.user.save();
    res.clearCookie("jwt");
    res.send("You have been logged out");
  } catch (error) {
    res.status(404).send(error);
  }
});
app.post("/logoutAll", auth, async (req, res) => {
  try {
    res.clearCookie("jwt");
    req.user.tokens = [];
    await req.user.save();
    res.send("You have been logged out from all the devices");
  } catch (error) {
    res.status(404).send(error);
  }
});
app.get("/secret", auth, (req, res) => {
  console.log("The secret page cookie", req.cookies.jwt);
  res.send("secret");
});
app.get("/", (req, res) => {
  res.send("Hello world");
});

app.get("/employees", async (req, res) => {
  try {
    const employees = await Employees.find({}).sort({ phone: 1 });
    res.status(201).send(employees);
  } catch (e) {
    res.status(404).send(e);
  }
});
app.get("/employees/:email", async (req, res) => {
  try {
    const email = req.body.email;
    const queryDetail = await Employees.findOne({ email: email });
    res.status(201).send(queryDetail);
  } catch (error) {}
});
app.patch("/employees/:id", async (req, res) => {
  try {
    const id = req.body.id;
    const queryDetail = await Employees.findByIdAndUpdate(id, req.body);
    const queryDetail2 = await Employees.findById(id);
    res.status(201).send(queryDetail2);
  } catch (error) {}
});
app.delete("/employees/:id", async (req, res) => {
  try {
    const id = req.body.id;
    const queryDetail = await Employees.findByIdAndDelete(id);
    res.status(201).send(queryDetail2);
  } catch (error) {}
});

app.listen(PORT, (req, res) => {
  console.log(`server running on localhost:3000`);
});
