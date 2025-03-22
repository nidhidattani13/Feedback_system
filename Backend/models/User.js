const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    enrollment: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    cgpa: { type: Number },
    sgpa: { type: Number },
    semester: { type: Number },
});

module.exports = mongoose.model("User", userSchema);
