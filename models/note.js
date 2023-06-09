const mongoose = require('mongoose')

const noteSchema = new mongoose.Schema({
  content: {
    type: String,
    minLength: 5,
    required: [true, 'no content is provided!']
  } ,
  important: {
    type: Boolean,
    required: true
  },
})

// Transform note schema formatting
noteSchema.set('toJSON', {
  transform: (document, returnedObject) => {

    // Transform _id field to id
    returnedObject.id = returnedObject._id.toString()

    // Exclude _id field
    delete returnedObject._id

    // exclude __v field
    delete returnedObject.__v
  }
})

const Note = mongoose.model('Note', noteSchema)
module.exports = Note
// module.exports = mongoose.model('Note', noteSchema)