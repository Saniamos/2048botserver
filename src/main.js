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
    game.finished = Math.random() > 0.95;
    let {newState, newScore} = move(direction, game.state)
    game.state = newState;
    game.score = game.score + newScore;
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

app.ws('/overview/games', (ws, req) => {
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

function occupiedFields (state) {
  return state.map((e, i) => e != 0 ? i : -1).filter(e => e !== -1);
}

// TODO: implement rotation and then use the same code for all cases with different rotations
function move (direction, state) {
  let newScore = 0
  let newState = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

  switch (direction) {
    case 'left':
      for (let i = 0; i < 4; i += 1) {
        let row = state.filter((_, j) => i * 4 <= j && j <= (i+1) * 4)
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
          newState[i + j] = row[j]
        }
      }
      return {newState, newScore}
    case 'right':
      for (let i = 0; i < 4; i += 1) {
        let row = state.filter((_, j) => i * 4 <= j && j <= (i+1) * 4)
        row = row.filter(e => e != 0)
        for (let z = row.length-1; z > 0 ; z -= 1) {
          if (row[z] == row[z - 1]) {
            row[z] = row[z] * 2;
            newScore += row[z]; 
            row[z - 1] = 0;
          }
        }
        row = row.filter(e => e != 0)
        for (let j = 0; j < row.length; j += 1) {
          newState[i + 3 - j] = row.reverse()[j]
        }
      }
      return {newState, newScore}
    case 'up':
      for (let i = 0; i < 4; i += 1) {
        let col = state.filter((_, j) => j % 4 == i)
        col = col.filter(e => e != 0)
        for (let z = 0; z < col.length -1 ; z += 1) {
          if (col[z] == col[z + 1]) {
            col[z] = col[z] * 2;
            newScore += col[z]; 
            col[z + 1] = 0;
          }
        }
        col = col.filter(e => e != 0)
        for (let j = 0; j < col.length; j += 1) {
          newState[i + j * 4] = col[j]
        }
      }
      return {newState, newScore}
    case 'down':
      for (let i = 0; i < 4; i += 1) {
        let col = state.filter((_, j) => j % 4 == i)
        col = col.filter(e => e != 0)
        for (let z = col.length -1; z > 0; z -= 1) {
          if (col[z] == col[z - 1]) {
            col[z] = col[z] * 2;
            newScore += col[z]; 
            col[z - 1] = 0;
          }
        }
        col = col.filter(e => e != 0)
        for (let j = 0; j < col.length; j += 1) {
          newState[i + (12 - 4 * j)] = col.reverse()[j]
        }
      }
      return {newState, newScore}
    default: 
      console.log('Unknown direction', direction);
    return [state, 0]
  }
}

function rotateBoard(board, size) {
  let newBoard = []
  for (let i = 0; i < board.length; i += 1) {

  }
  return newBoard
}