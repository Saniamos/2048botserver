
const rules = require('./game');
const {play, pick_rand} = require('./bot_helpers');

const server = 'http://localhost:3000';
const directions = ['left', 'up', 'right', 'down'];

const sleepTime = 100;

const turnsInAdvance = 2;
const name = `Bot: FS - ${turnsInAdvance}`
// Strategy: calc x turns in advance and then pick highest score for next move



// === logic ===============

// returns nested structure: {left: {left: {newState, newScore}, right: {} ...} ...}
function calc_advance (state, future = 1) {
  if (future < 1) {
    return state;
  }

  let states = {}
  
  for (let dir of directions) {
    let {newState, newScore} = rules.move(dir, state.newState)
    states[dir] = {newScore: newScore + state.newScore, newState}
    if (future > 1) {
      states[dir] = calc_advance(states[dir], future - 1)
    }
  }
  return states
}

function calc_mean_leaf_scores (states) {
  if (states.newScore !== undefined) {
    return states.newScore
  }

  return directions.reduce((prv, cur) => prv + calc_mean_leaf_scores(states[cur]), 0)
}


function pick_promising (state) {
  let futures = calc_advance({newState: state, newScore: 0}, turnsInAdvance)
  let scores = {}
  for (let dir of directions) {
    scores[dir] = calc_mean_leaf_scores(futures[dir])
  }

  let highest = Math.max.apply(undefined, Object.values(scores))
  let options = []
  for (let dir of directions) {
    if (scores[dir] === highest) {
      options.push(dir)
    }
  }
  return pick_rand(options)
}


// === start ===============

play(server, name, pick_promising, sleepTime)