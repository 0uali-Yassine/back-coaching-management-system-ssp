const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    organization: { type: mongoose.Schema.Types.ObjectId, ref: "Organization" },
    roles: [{ type: String, enum: ["admin", "manager", "coach", "entrepreneur"] }]
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
