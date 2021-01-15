const express = require('express')
const ws = require('ws');

const rules = require('./game')
const ObeservableStorage = require('./state')


const app = express()
const port = 3000

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

// TODO: make sure to save this somewhere as well
const games = new ObeservableStorage();


// === Game Routes =====================
app.get('/game/start', (req, res) => {
  let game = rules.createGame(req.query.name)
  let id = games.add(game);
  res.send(JSON.stringify({id, ...game}))
})

app.get('/game/:id/move', (req, res) => {
  let direction = req.query.direction;
  let id = req.params.id;
  let game = games.get(id);

  if (!game.finished) {
    // game.finished = Math.random() > 0.95;
    let {newState, newScore} = rules.move(direction, game.state)
    if (!rules.stateChanged(game.state, newState)) {
      game.state = rules.addTile(newState);
    } 
    game.score = game.score + newScore;
    game.finished = rules.checkFinished(game.state)
    games.udpate(id, game)
  }
  console.log(id, direction, game.score, game.finished);
  res.send(JSON.stringify({id, ...game}))
})

app.get('/game/:id', (req, res) => {
  let id = req.params.id;
  let game = games.get(id);
  res.send(JSON.stringify({id, ...game}))
})


// === Overview API =====================
const wss = new ws.Server({ port: 3001 });

wss.on('connection', function connection(socket) {
  let sendAll = () => socket.send(JSON.stringify(games.getall()))
  
  sendAll()

  games.on('add', sendAll)
  games.on('change', sendAll)

  socket.on('close', () => {
    games.removeListener('add', sendAll);
    games.removeListener('change', sendAll);
  })
});

app.use('/overview', express.static('public'))

