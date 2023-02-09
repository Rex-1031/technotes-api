const rateLimit = require('express-rate-limit')

const { logEvents } = require('./logger')


const loginLimiter = rateLimit({
    windowMs: 60*1000,
    max: 5,
    message:
        { mesage: 'Too many login attempts fomr this IP, please try again after a 60 second pause'},
    handler: (req,res,next, options) =>{
        logEvents(`Too Many Requests: ${options.message.message}\t${req.method}\t${req.url}\t${req.headers.origin}`, 'error.log')
        res.status(options.statusCode).send(options.message)
    },
    standardHeaders: true,
    legacyHeaders: false
})

module.exports = loginLimiter