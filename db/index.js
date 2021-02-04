"use strict";
//TODO: Add relationships
const Sequelize = require("sequelize");
const UserModel = require("./models/user.js");
const TrailModel = require("./models/trail");
const BookmarkModel = require("./models/bookmark");

const env = process.env.NODE_ENV || "development";

let sequelize;

// Environment config
if (env !== "production") {
  sequelize = new Sequelize(
    process.env.DATABASE,
    process.env.DATABASE_USER,
    process.env.DATABASE_PASSWORD,
    { dialect: "postgres", logging: false, pool: { max: 30000 } }
  );
} else {
  sequelize = new Sequelize(process.env.DATABASE_URL);
}

// Link models to db
const User = UserModel(sequelize, Sequelize);
const Trail = TrailModel(sequelize, Sequelize);
const Bookmark = BookmarkModel(sequelize, Sequelize);

// Relationships
User.hasMany(Trail);
User.hasMany(Bookmark);
Trail.belongsTo(User);
Trail.hasMany(Bookmark);
Bookmark.belongsTo(User);
Bookmark.belongsTo(Trail);

// Authenticate db and log connection/error
sequelize
  .authenticate()
  .then(() => console.log("Database connected..."))
  .catch((err) => console.log("Error:" + err));

module.exports = {
  sequelize,
  Sequelize,
  User,
  Trail,
  Bookmark,
};
