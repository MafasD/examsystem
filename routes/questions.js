const express = require('express')
const router = express.Router()
const Question = require('../models/question');
const Subject = require('../models/subject')

//Route for index page
router.get('/', async (req, res) => {
  let searchOptions = {}; //This is to make searchbar functional
  
  if (req.query.question != null && req.query.question !== '') {
    const escapedQuestion = escapeRegex(req.query.question);
    searchOptions.question = new RegExp(escapedQuestion, 'i');
  }
  
  if (req.query.subject != null && req.query.subject !== '') {
    searchOptions.subject = req.query.subject;
  }

  try {
    const questions = await Question.find(searchOptions).populate('subject');
    const subjects = await Subject.find();
    res.render('questions/index', {
      questions: questions,
      searchOptions: req.query,
      subjects: subjects
    });
  } catch {
    res.redirect('/');
  }
});

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');  //This makes all special characters searchable
}

//New Question Route
router.get('/new', async (req, res) => {
  const subjects = await Subject.find();
  res.render('questions/new', { subjects: subjects,  question: new Question() })
})

//Create Question Route
router.post('/', async (req, res) => {
  //const textArea = req.body.options; // get the text from the textarea
  //const optionArray = textArea.split('\n'); // split the text into an array
  //res.send(optionArray); // send the array as a response
  const question = new Question({
    question: req.body.question,
    subject: req.body.subject,
    //options: optionArray, 
    options: req.body.options.split('\n'),
      answerIndex: req.body.answerIndex
  })
  try {
    const newQuestion = await question.save()
    res.redirect(`questions/${newQuestion.id}`)
  } catch {
    res.render('questions/new', {
      question: question,
      errorMessage: 'Error creating Question'
    })
  }
})

//View/Show question
router.get('/:id', async (req, res) => {
  try {
    const question = await Question.findById(req.params.id).populate('subject')
   
    res.render('questions/show', {
      question: question,
    })
  } catch {
    res.redirect('/')
  }
})

//Edit Route
router.get('/:id/edit', async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
    const subjects = await Subject.find();
    res.render('questions/edit', { subjects: subjects, question: question })
  } catch {
    res.redirect('/questions')
  }
})
//Update changes Route
router.put('/:id', async (req, res) => {
  let question;
  try {
    question = await Question.findById(req.params.id);
    question.question = req.body.question;
    question.subject = req.body.subject;
    question.options = req.body.options.split('\n');
    question.answerIndex = req.body.answerIndex;

    await question.save();
    res.redirect(`/questions/${question.id}`);
  } catch (error) {
    if (question == null) {
      res.redirect('/');
    } else {
      res.render('questions/edit', {
        question: question,
        errorMessage: 'Error updating Question',
      });
    }
  }
});

//Delete Route
router.delete('/:id', async (req, res) => {
  let question
  try {
    question = await Question.findById(req.params.id)
    await question.remove()
    res.redirect('/questions')
  } catch {
    if (question == null) {
      res.redirect('/')
    } else {
      res.redirect(`/questions/${question.id}`)
    }
  }
})

module.exports = router