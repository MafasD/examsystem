const express = require('express');
const router = express.Router();
const Exam = require('../models/exam');
const Question = require('../models/question');

 // Get all questions and display them in a form with checkboxes
router.get('/', async (req, res) => {
  const questions = await Question.find();
  res.render('createExams', { questions });
});

// New Exam Route
router.get('/new', async (req, res) => {
  const questions = await Question.find();
  res.render('exams/new', { question: questions,  exam: new Exam() })
})

// Create a new exam with the selected questions
router.post('/', async (req, res) => {
  // Get the selected question ids from the request body
  const selectedQuestions = req.body.questions;
  const exam = new Exam({
    name: req.body.name,
    questions: selectedQuestions,
  });
  const newExam = await exam.save()
  res.redirect(`/exams/${newExam.id}`); //This redirects to a page where we can check the exam information after creating the exam (basically show exam page)
});


module.exports = router;
