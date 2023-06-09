const notesRouter = require('express').Router()
const Note = require('../models/note')

// Get all notes
notesRouter.get('/', async (request, response) => {
  // Note.find({})
  //   .then(notes => response.json(notes))
  //   .catch(error => next(error))
  const notes = await Note.find({})
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

  const newNote = new Note({
    content: body.content,
    important: body.important || false,
  })

  const savedNote = await newNote.save()
  response.status(201).json(savedNote)

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