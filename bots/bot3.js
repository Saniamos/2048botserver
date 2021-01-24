
const rules = require('../lib/game');
const {play, pick_rand, calc_advance, directions} = require('./bot_helpers');

const server = 'http://localhost:3000';

const sleepTime = 20;

const turnsInAdvance = 6;
const name = `Bot: Sort - ${turnsInAdvance}`
// Strategy: try to sort the tiles into a corner


// === logic ===============

function score (state, score) {
  let nFields = state.filter(e => e !== 0).length
  // let sortBonus = state.reduce((prv, cur, i) => prv + i * Math.pow(cur, 1/4), 0);
  let sortBonus = state.reduce((prv, cur, i) => prv + i * cur, 0);
  // console.log(sortBonus, score, sortBonus / nFields)
  return sortBonus / nFields + score
}


function calc_mean_leaf_scores (states) {
  if (states.newState !== undefined) {
    return score(states.newState, states.newScore)
  }

  // TODO: eval different merge strategies
  // return directions.map(e => calc_mean_leaf_scores(states[e])).reduce((prv, cur) => prv + cur, 0)
  return directions.map(e => calc_mean_leaf_scores(states[e])).reduce((prv, cur) => prv > cur ? prv : cur, 0)
}

function pick_promising (state) {
  let futures = calc_advance({newState: state, newScore: 0}, turnsInAdvance)
  let scores = {}
  for (let dir of directions) {
    // TODO: find more elegant version to filter this
    if (!rules.stateUnChanged(state, rules.move_direction(dir, state).newState)) {
      scores[dir] = calc_mean_leaf_scores(futures[dir])
    }
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