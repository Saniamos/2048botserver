const express = require('express')
const app = express()
const port = 3000

const expressWs = require('express-ws')(app);
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

const ObeservableStorage = require('./state');
// TODO: make sure to save this somewhere as well
const games = new ObeservableStorage();

// === Game API =====================

games.on('add', ({id, item}) => console.log('add', id));
games.on('change', ({id, item}) => console.log('change', id));


app.get('/game/start', (req, res) => {
  let game = createGame(req.query.name)
  let id = games.add(game);
  res.send(JSON.stringify({id, ...game}))
})

app.get('/game/:id/move', (req, res) => {
  let direction = req.query.direction;
  let id = req.params.id;
  let game = games.get(id);

  if (!game.finished) {
    // game.finished = Math.random() > 0.95;
    let {newState, newScore} = move(direction, game.state)
    game.state = addTile(newState);
    game.score = game.score + newScore;
    game.finished = checkFinished(game.state)
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

app.use('/overview', express.static('public'))

app.ws('/api/overview', (ws, req) => {
  let sendAll = () => ws.send(JSON.stringify(games.getall()))
  
  sendAll()

  games.on('add', sendAll)
  games.on('change', sendAll)

  ws.on('close', () => {
    games.removeListener('add', sendAll);
    games.removeListener('change', sendAll);
  })
});


// === Game Rules =====================

function emptyTiles (state) {
  return state.map((e, i) => e == 0 ? i : -1).filter(e => e !== -1);
}

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

function addTile (state) {
  let emptyIdx = emptyTiles(state)
  id = emptyIdx[getRandomInt(emptyIdx.length - 1)]
  state[id] = Math.random() > 0.9 ? 4 : 2;
  return state;
}

function createGame (name) {
  let game = {
    name: name,
    state: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    finished: false,
    score: 0
  }
  game.state = addTile(game.state)
  game.state = addTile(game.state)

  return game;
}


function move (direction, state) {
  switch (direction) {
    case 'left':
      return moveLeft(state)
    case 'right':
      state = rotate16Board(state)
      state = rotate16Board(state)
      var {newState, newScore} = moveLeft(state)
      newState = rotate16Board(newState)
      newState = rotate16Board(newState)
      return {newState, newScore}
    case 'up':
      state = rotate16Board(state)
      state = rotate16Board(state)
      state = rotate16Board(state)
      var {newState, newScore} = moveLeft(state)
      newState = rotate16Board(newState)
      return {newState, newScore}
    case 'down':
      state = rotate16Board(state)
      var {newState, newScore} = moveLeft(state)
      newState = rotate16Board(newState)
      newState = rotate16Board(newState)
      newState = rotate16Board(newState)
      return {newState, newScore}
    default: 
      console.log('Unknown direction', direction);
    return {newState: state, newScore:0}
  }
}

function moveLeft(state) {
  // TODO: there must be a more elegant version of this...
  let newScore = 0
  let newState = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

  for (let i = 0; i < 4; i += 1) {
    let row = state.filter((_, j) => i * 4 <= j && j < (i+1) * 4)
    row = row.filter(e => e != 0)
    for (let z = 0; z < row.length -1 ; z += 1) {
      if (row[z] == row[z + 1]) {
        row[z] = row[z] * 2;
        newScore += row[z]; 
        row[z + 1] = 0;
      }
    }
    row = row.filter(e => e != 0)
    for (let j = 0; j < row.length; j += 1) {
      newState[i * 4 + j] = row[j]
    }
  }
  return {newState, newScore}
}

function rotate16Board(board) {
  if (board.length != 16) {
    throw new Error('Wrong boardsize')
  }
  let indx = [12, 8, 4, 0, 13, 9, 5, 1, 14, 10, 6, 2, 15, 11, 7, 3]
  return indx.map(e => board[e]);
}

function hasTwoEqualNeighbors (state) {
  return (state
    .map((e, i) => e === state[i + 1])
    .filter((e, i) => i % 4 !== 3 && e).length > 0)
}

function checkFinished (state) {
  return !(state.filter(e => e === 0).length > 0
    || hasTwoEqualNeighbors(state) 
    || hasTwoEqualNeighbors(rotate16Board(state)));
}