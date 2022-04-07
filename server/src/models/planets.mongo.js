const mongoose = require('mongoose');

const planetSchema = new mongoose.Schema({
    keplerName: {
        type: String,
        required: true
    }
});

module.exports = new mongoose.model('Planet', planetSchema);