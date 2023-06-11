const logger = require('./logger')

// Request logging middleware
const requestLogger = (request, response, next) => {
  logger.info(`Method: ${request.method}`)
  logger.info(`Path: ${request.path}`)
  logger.info(`Body: ${request.body}`)
  logger.info('---')
  next()
}

// Unknown endpoint middleware
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

// Error handler middleware
const errorHandler = (error, request, response, next) => {
  logger.error(error.message)

  switch (error.name) {
    case 'CastError':
      return response.status(400).send({ error: 'id format is not valid!' })
    case 'ValidationError':
      return response.status(400).json({ error: error.message })
    case 'JsonWebTokenError':
      return response.status(400).json({ error: error.message })
  }

  next(error)
}

module.exports = {
  requestLogger,
  unknownEndpoint,
  errorHandler
}