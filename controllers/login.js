const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const loginRouter = require('express').Router()
const User = require('../models/user')

// Login user
loginRouter.post('/', async (request, response) => {
  const { username, password } = request.body

  // Check if the username exists
  const user = await User.findOne({ username })

  // If username exists, check if password is correct
  const passwordCorrect = user === null
    ? false
    : await bcrypt.compare(password, user.passwordHash)

  // Throw error if wrong username or password
  if (! (user && passwordCorrect)) {
    return response.status(401).json({
      error: 'invalid username or password'
    })
  }

  // Create a user object for token creation purposes
  const userForToken = {
    username: user.username,
    id: user._id
  }

  // Create a token using the created user object above
  const token = jwt.sign(userForToken, process.env.SECRET, { expiresIn: 60 * 60 })

  response
    .status(200)
    .send({
      token,
      username: user.username,
      name: user.name
    })

})

module.exports = loginRouter