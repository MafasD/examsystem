const express = require('express')
const router = express.Router()
const Subject = require('../models/subject')
const Question = require('../models/question')

//All Subjects Route
router.get('/', async (req, res) => {
  let searchOptions = {}
  if (req.query.type != null && req.query.type !== '') {
    searchOptions.type = new RegExp(req.query.type, 'i')
  }
  try {
    const subjects = await Subject.find(searchOptions)
    res.render('subjects/index', {
      subjects: subjects,
      searchOptions: req.query
    })
  } catch {
    res.redirect('/')
  }
})

//New Subject Route
router.get('/new', (req, res) => {
  res.render('subjects/new', { subject: new Subject() })
})

//Create Subject Route
router.post('/', async (req, res) => {
  const subject = new Subject({
    type: req.body.type
  })
  try {
    const newAuthor = await subject.save()
    res.redirect(`subjects/${newAuthor.id}`)
  } catch {
    res.render('subjects/new', {
      subject: subject,
      errorMessage: 'Error creating Subject'
    })
  }
})
//View Route
router.get('/:id', async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id)
    res.render('subjects/show', {
      subject: subject,
    })
  } catch {
    res.redirect('/')
  }
})
//Edit Route
router.get('/:id/edit', async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id)
    res.render('subjects/edit', { subject: subject })
  } catch {
    res.redirect('/subjects')
  }
})
//Update edit changes
router.put('/:id', async (req, res) => {
  let subject
  try {
    subject = await Subject.findById(req.params.id)
    subject.type = req.body.type
    await subject.save()
    res.redirect(`/subjects/${subject.id}`)
  } catch {
    if (subject == null) {
      res.redirect('/')
    } else {
      res.render('subjects/edit', {
        subject: subject,
        errorMessage: 'Error updating Subject'
      })
    }
  }
})

//Delete Route, that will only delete the subject
/*
router.delete('/:id', async (req, res) => {
  let subject
  try {
    subject = await Subject.findById(req.params.id)
    await subject.remove()
    res.redirect('/subjects')
  } catch {
    if (subject == null) {
      res.redirect('/')
    } else {
      res.redirect(`/subjects/${subject.id}`)
    }
  }
})
*/

// Delete Route, that will delete the selected subject, and also all questions related to it.
router.delete('/:id', async (req, res) => {
  let subject;
  try {
    subject = await Subject.findById(req.params.id);
    await subject.remove();
    //Delete related questions with the deleted subject type
    await Question.deleteMany({ subject: subject.id });
    res.redirect('/subjects');
  } catch (error) {
    if (subject == null) {
      res.redirect('/');
    } else {
      res.redirect(`/subjects/${subject.id}`);
    }
  }
});

module.exports = router