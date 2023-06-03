const express = require('express');
const router = express.Router();
const Exam = require('../models/exam');
const Question = require('../models/question');
const User = require('../models/user');
const passport = require('passport')

//All exams Route
router.get('/', async (req, res) => {
  let searchOptions = {}
  if (req.query.name != null && req.query.name !== '') {
    searchOptions.name = new RegExp(req.query.name, 'i')
  }
  try {
    const exams = await Exam.find(searchOptions)
    res.render('exams', {
      exams: exams,
      searchOptions: req.query
    })
  } catch {
    res.redirect('/')
  }
})

  
//View/Show exam
router.get('/:id', async (req, res) => {
    try {
      const exam = await Exam.findById(req.params.id)
                             .populate('questions')
                             .exec()
      res.render('exams/show', { exam: exam })
    } catch {
      res.redirect('/')
    }
  })


//Get edit view
router.get('/:id/edit', async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id)
    const questions = await Question.find()
    res.render('exams/edit', { exam: exam, questions: questions })
  } catch {
    res.redirect('/exams')
  }
})

//Edit route
router.put('/:id', async (req, res) => {
  let exam;
  try {
    exam = await Exam.findById(req.params.id);
    exam.name = req.body.name;
    exam.questions = req.body.questions;

    await exam.save();
    res.redirect(`/exams/${exam.id}`);
  } catch (error) {
    if (exam == null) {
      res.redirect('/');
    } else {
      res.render('exams/edit', {
        exam: exam,
        errorMessage: 'Error updating exam',
      });
    }
  }
});

  //Delete route
  router.delete('/:id', async (req, res) => {
    let exam
    try {
      exam = await Exam.findById(req.params.id)
      await exam.remove()
      res.redirect('/exams')
    } catch {
      if (exam == null) {
        res.redirect('/')
      } else {
        res.redirect(`/exams/${exam.id}`)
      }
    }
  })


//Take-exam route
router.get('/:id/take', async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id).populate('questions');
    res.render('exams/take-exam', { exam });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

//This function checks if user is logged in
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login'); // Redirect to the login page if not logged in
}

//This is the submit exam route, the ensureAunthenticated function will send the user to login page, if user is not logged in when submitting an exam.
router.post('/:id/submit', ensureAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id;
    const examId = req.params.id;
    const exam = await Exam.findById(examId).populate('questions');

    let totalPoints = 0;

    // Iterate over the questions and compare selected options with correct answers
    exam.questions.forEach((question, index) => {
      const selectedOptionIndex = parseInt(req.body[`answer${index}`], 10);
      const adjustedAnswerIndex = question.answerIndex + -1; //Subtract 1 from AnswerIndex, so that it won't be too confusing for the user when creating a question.
      if (!isNaN(selectedOptionIndex) && selectedOptionIndex === adjustedAnswerIndex) {  // So instead of 0 = 1st option, 1 = 2nd etc. it will now be 1 = 1st option etc.
        totalPoints += 1;
      }
    });

    await User.findByIdAndUpdate(userId, { $inc: { score: totalPoints } });

    res.render('exams/submit-exam', { totalPoints });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

  module.exports = router