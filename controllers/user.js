const User = require("../models/user");
const jwt = require("jsonwebtoken"); // import the jwt library
const bcrypt = require("bcrypt"); // import bcrypt

module.exports = {
  create,
  login,
};

async function create(req, res) {
  console.log(req.body);
  try {
    // NOTE: here we are storing a plaintext password. VERY VERY DANGEROUS. We will replace this in a second:
    const hashedPassword = await bcrypt.hash(
      req.body.password,
      parseInt(process.env.SALT_ROUNDS)
    );

    const user = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
    });

    // creating a jwt:
    // the first parameter specifies what we want to put into the token (in this case, our user document)
    // the second parameter is a "secret" code. This lets our server verify if an incoming jwt is legit or not.
    // the third paramater defines the time period in whuch a token remains in effect
    const token = jwt.sign({ user }, process.env.SECRET, { expiresIn: "24h" });
    res.status(200).json(token); // send it to the frontend
  } catch (err) {
    console.log(err)
    res.status(400).json(err);
  }
}

async function login(req, res) {
  try {
    const user = await User.findOne({ email: req.body.email });
    // check password. if it's bad throw an error.
    if (!(await bcrypt.compare(req.body.password, user.password)))
      throw new Error();

    // if we got to this line, password is ok. give user a new token.
    const token = jwt.sign({ user }, process.env.SECRET, { expiresIn: "24h" });
    res.status(200).json(token);
  } catch {
    // for security reasons we purposely do not tell
    // a user where they went wrong while
    // trying to login
    res.status(400).json("Bad Credentials");
  }
}
