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
  let {newState, newScore} = move_direction(direction, state);
  if (!stateChanged(state, newState)) {
    newState = addTile(newState);
  } 
  return {newState, newScore}
}

function move_direction (direction, state) {
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

function stateChanged (state, newState) {
  return state.reduce((prv, cur, id) => prv && cur === newState[id], true)
}

module.exports = {
  emptyTiles: emptyTiles,
  getRandomInt: getRandomInt,
  addTile: addTile,
  createGame: createGame,
  move: move,
  moveLeft: moveLeft,
  rotate16Board: rotate16Board,
  hasTwoEqualNeighbors: hasTwoEqualNeighbors,
  checkFinished: checkFinished,
  stateChanged: stateChanged
}