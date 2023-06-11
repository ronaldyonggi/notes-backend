const jwt = require('jsonwebtoken')
const notesRouter = require('express').Router()
const Note = require('../models/note')
const User = require('../models/user')

// Retrieve token
const getTokenFrom = request => {
  const authorization = request.get('authorization')

  // If authorization exists, replace the Bearer string with empty string
  if (authorization && authorization.startsWith('Bearer ')) {
    return authorization.replace('Bearer ', '')
  }
  return null
}

// Get all notes
notesRouter.get('/', async (request, response) => {
  const notes = await Note
    .find({})
    .populate('user', {
      username: 1,
      name: 1
    })
  response.json(notes)
})

// Get specific notes
notesRouter.get('/:id', async (request, response) => {
  const note = await Note.findById(request.params.id)
  if (note) response.json(note)
  else response.status(404).end()
})

// Create a new note
notesRouter.post('/', async (request, response) => {
  const body = request.body

  // Verify the token obtained from request header with the env.SECRET string
  const decodedToken = jwt.verify(getTokenFrom(request), process.env.SECRET)
  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token invalid' })
  }

  const user = await User.findById(decodedToken.id)

  const newNote = new Note({
    content: body.content,
    important: body.important || false,
    user: user.id
  })

  const savedNote = await newNote.save()

  // Append to the user's notes array
  user.notes = user.notes.concat(savedNote._id)

  // Save the user state to DB as well
  await user.save()
  // Save
  response.json(savedNote)

})

// Delete a note
notesRouter.delete('/:id', async (request, response) => {
  await Note.findByIdAndRemove(request.params.id)
  response.status(204).end()
})

// Toggle a note's importance
notesRouter.put('/:id', (request, response, next) => {
  const body = request.body

  const updatedNote = {
    content: body.content,
    important: body.important
  }

  Note.findByIdAndUpdate(request.params.id, updatedNote, {
    new: true,
    runValidators: true,
    context: 'query'
  })
    .then(toggledNote => response.json(toggledNote))
    .catch(error => next(error))
})

module.exports = notesRouter