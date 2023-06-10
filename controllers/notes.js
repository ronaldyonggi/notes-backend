const notesRouter = require('express').Router()
const Note = require('../models/note')
const User = require('../models/user')

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

  // Make sure the userId from the request belongs to an existing user in the DB
  const user = await User.findById(body.userId)

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