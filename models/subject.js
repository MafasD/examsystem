const mongoose = require('mongoose')

const subjectSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true
  }
})

module.exports = mongoose.model('Subject', subjectSchema)