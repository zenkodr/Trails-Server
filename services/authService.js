const User = require("../db").User;
const jwt = require("jsonwebtoken");
const argon2 = require("argon2");
const { CustomError } = require("../handlers/errorHandlers");
const { Op } = require("sequelize");

exports.generateJWT = (user) => {
  const data = {
    id: user.id,
    username: user.username,
    email: user.email,
  };

  const secret = Buffer.from(process.env.JWT_SECRET, "base64");
  const expiration = "4h";

  return jwt.sign({ data }, secret, {
    expiresIn: expiration,
  });
};

exports.signupUser = async (email, username, password) => {
  const existingCredentials = await User.findOne({
    where: { [Op.or]: [{ email: email }, { username: username }] },
  });

  if (existingCredentials) {
    throw new CustomError("auth.existingCredentials", "SignupError", 401);
  } else {
    const hash = await argon2.hash(password);

    const newUser = {
      username,
      email,
      password: hash,
    };

    // Store user in db
    const createdUser = await User.create(newUser);

    if (createdUser) {
      //   emailHandler.sendEmail({
      //     subject: "Welcome to the Challenge Board!",
      //     filename: "signupEmail",
      //     user: {
      //       username,
      //       email,
      //     },
      //   });

      const jwt = this.generateJWT(createdUser);

      const userData = {
        id: createdUser.id,
        username: createdUser.username,
        email: createdUser.email,
        role: createdUser.role,
      };

      return { jwt, userData };
    } else {
      throw new CustomError("auth.failedSignup", "SignupError", 401);
    }
  }
};

exports.loginUser = async (email, password) => {
  const userRecord = await User.findOne({ where: { email: email } });

  if (!userRecord) {
    // Handle login failure
    throw new CustomError("auth.invalidCredentials", "LoginError", 403);
  } else {
    const correctPassword = await argon2.verify(userRecord.password, password);

    // Handle incorrect password
    if (!correctPassword) {
      throw new CustomError("auth.invalidCredentials", "LoginError", 401);
    }

    const jwt = this.generateJWT(userRecord);

    const userData = {
      id: userRecord.id,
      username: userRecord.username,
      email: userRecord.email,
    };

    return {
      jwt,
      userData,
    };
  }
};
