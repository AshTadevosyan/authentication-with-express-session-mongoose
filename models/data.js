const mongoose = require("mongoose");
const myDatabase = mongoose.connection;
const mySchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});
var user = mongoose.model('users', mySchema);


module.exports = user;