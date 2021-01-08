const express = require('express')
const app = express()
const port = 3000

const games = [];


app.get('/start', (req, res) => {
  let id = games.push(createGame(req.query.name)) - 1;
  games[id].id = id
  res.send(JSON.stringify(games[id]))
})

app.get('/move/:id', (req, res) => {
  let direction = req.query.direction;
  if (req.params.id > games.length) {
    console.log('tried to acces old game')
  } else {
    let game = games[req.params.id];

    if (!game.finished) {
      game.finished = Math.random() > 0.9;
      let {newState, newScore} = move(direction, game.state)
      game.state = newState;
      game.score = game.score + newScore;
    }
    console.log(game.id, direction, game.score, game.finished);
    res.send(JSON.stringify(game))
  }
})

app.get('/game/:id', (req, res) => {
  if (req.params.id > games.length) {
    console.log('tried to acces old game')
  } else {
    let game = games[req.params.id];
    res.send(JSON.stringify(game))
  }
})

// todo: subscribe? 
app.use('/overview', express.static('public'))

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})


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
        for (let z = row.length - 1; z > 0 ; z -= 1) {
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