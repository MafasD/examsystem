const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  //firstName: { type: String },
  //lastName: { type: String },
  score: { type: Number, default: 0 }, // User's score in exams, currently it basically works like this: oldscore += newscore, so it just adds all completed examscores together
  //role: { type: String, enum: ['student', 'teacher', 'admin'], default: 'student' } // Role type (for example: student, teacher or admin)
});

// Method to verify the password
userSchema.methods.verifyPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
  }; 

const User = mongoose.model('User', userSchema);

module.exports = User;
