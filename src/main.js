const express = require('express')
const app = express()
const port = 3000



app.get('/', (req, res) => {
  res.send(JSON.stringify({id: 1, state: [[0, 0, 0, 2], [0, 0, 2, 0], [0, 0, 0, 0], [0, 0, 0, 0]], score: 0, won: false}))
})

app.get('/startgame', (req, res) => {
    
})

app.get('/move/{id}', (req, res) => {
    
})

// todo: subscribe? 

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})