const mongoose = require("mongoose");

mongoose
  .connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/googlebooks", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

const db = mongoose.connection;

db.on("error", (err) => {
  console.error("MongoDB error:", err);
});

db.once("open", () => {
  console.log("Connected to MongoDB!");
});

module.exports = db;
