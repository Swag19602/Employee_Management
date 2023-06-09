const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const employeeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  company: {
    type: String,
    required: true,
  },
  position: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },
  phone: {
    type: Number,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  confirmPass: {
    type: String,
    required: false,
  },
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
});
employeeSchema.methods.generateAuthToken = async function() {
  try {
    const token = jwt.sign({ _id: this._id.toString() }, "swag");
    console.log(token)
    this.tokens = this.tokens.concat({ token: token });
    await this.save();
    return token;
  } catch (error) {}
};

employeeSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
    this.confirmPass = undefined;
  }
  next();
});
const Employees = new mongoose.model("Employees", employeeSchema);
module.exports = Employees;
