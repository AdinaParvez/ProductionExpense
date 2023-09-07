const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const dotenv = require('dotenv')
const colors = require('colors')
const connectDb = require('./config/connectDb')
const path = require('path')

//config dot env file
dotenv.config()

//database call
connectDb()
//rest object
const app=express()

//middlewares
app.use(morgan('dev'))
app.use(express.json())
app.use(cors())

//user routes
app.use('/api/v1/users', require('./routes/userRoute'))
//transaction routes
app.use('/api/v1/transactions', require('./routes/transactionRoute'))

// Serve static files (e.g., Excel files) from a directory
app.use(express.static(__dirname + '/public'));

 //static files
 app.use(express.static(path.join(__dirname, './client/build')))

 app.get('*', function(req,res){
     res.sendFile(path.join(__dirname, './client/build/index.html'))
 })


//port
const PORT = 8080 || process.env.PORT

//listen server
app.listen(PORT, ()=>{
    console.log(`Server running on port ${PORT}`)
})