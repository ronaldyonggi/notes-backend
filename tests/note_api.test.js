const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)
const Note = require('../models/note')


beforeEach(async () => {
  await Note.deleteMany({}) // clear up the DB

  // helper.initialNotes.forEach(async note => {
  //   let noteObject = new Note(note)
  //   await noteObject.save()
  // })
  const noteObjects = helper.initialNotes.map(note => new Note(note))
  const promiseArray = noteObjects.map(note => note.save())
  await Promise.all(promiseArray)
})

describe('fetching note/notes', () => {

  test('notes are returned as json', async () => {
    await api
      .get('/api/notes')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  }, 100000)

  test('all notes are returned', async () => {
    const response = await api.get('/api/notes')

    expect (response.body).toHaveLength(helper.initialNotes.length)
  })

  test('a specific note is within the returned notes', async () => {
    const response = await api.get('/api/notes')

    const contents = response.body.map(r => r.content)
    expect(contents).toContain('Browser can execute only JavaScript')
  })

  test('a specific note can be viewed through its id', async () => {
    const notesAtStart = await helper.notesInDb()
    const noteToView = notesAtStart[0]

    const resultNote = await api
      .get(`/api/notes/${noteToView.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(resultNote.body).toEqual(noteToView)
  })
})


describe('adding a new note', () => {

  test('a valid note can be added', async () => {
    const newNote = {
      content: 'async/await simplifies making async calls',
      important: true
    }

    await api
      .post('/api/notes')
      .send(newNote)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    // Retrieve all notes
    const notesAtEnd = await helper.notesInDb()

    // Retrieve an array of only the notes' contents
    const contents = notesAtEnd.map(n => n.content)

    expect(notesAtEnd).toHaveLength(helper.initialNotes.length + 1)
    expect(contents).toContain('async/await simplifies making async calls')
  })

  test('note without content is not added', async () => {
    const newNote = {
      important: true
    }

    await api
      .post('/api/notes')
      .send(newNote)
      .expect(400)

    const notesAtEnd = await helper.notesInDb()

    expect(notesAtEnd).toHaveLength(helper.initialNotes.length)
  })
})

describe('deleting a note', () => {
  test('a note can be deleted', async () => {
    const notesAtStart = await helper.notesInDb()
    const noteToDelete = notesAtStart[0]

    await api
      .delete(`/api/notes/${noteToDelete.id}`)
      .expect(204)

    const notesAtEnd = await helper.notesInDb()

    expect(notesAtEnd).toHaveLength(helper.initialNotes.length - 1)

    // Check that the state of the notes at the end doesn't contain the deleted note
    const contents = notesAtEnd.map(note => note.content)
    expect(contents).not.toContain(noteToDelete.content)
  })
})

afterAll(async () => {
  await mongoose.connection.close()
})