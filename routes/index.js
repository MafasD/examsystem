const express = require('express')
const router = express.Router()

//This just renders main page, nothing special on it
router.get('/', async (req, res) => {
  res.render('index')
})

module.exports = router