
const {play, pick_rand, calc_advance, directions} = require('./bot_helpers');

const server = 'http://localhost:3000';

const sleepTime = 100;

const turnsInAdvance = 3;
const name = `Bot: FS - ${turnsInAdvance}`
// Strategy: calc x turns in advance and then pick highest score for next move



// === logic ===============

function score (_, score) {
  return score
}

function calc_mean_leaf_scores (states) {
  if (states.newState !== undefined) {
    return score(states.newState, states.newScore)
  }

  return directions.map(e => calc_mean_leaf_scores(states[e])).reduce((prv, cur) => prv + cur, 0)
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