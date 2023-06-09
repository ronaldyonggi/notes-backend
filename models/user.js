const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  name: String,
  passwordHash: String,
  notes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Note'
    }
  ]
})

userSchema.plugin(uniqueValidator)

// Transform userSchema format
userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    // Transform _id to id
    returnedObject.id = returnedObject._id.toString()

    // Exclude _id field

    // Exclude __v field
    delete returnedObject._id
    delete returnedObject.__v

    // passwordHash should not be revealed, so exclude passwordHash field
    delete returnedObject.passwordHash
  }
})

const User = mongoose.model('User', userSchema)
module.exports = User