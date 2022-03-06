
const rules = require('../lib/game');
const {play, pick_biased, calc_advance} = require('./bot_helpers');

const server = 'http://localhost:3000';

// we specifically define this order for the bias
const directions = ['left', 'up', 'right', 'down'];

const sleepTime = 100;

const turnsInAdvance = 6;
const name = `Bot: Combo - ${turnsInAdvance}`
// Strategy: try to sort the tiles into the upper left corner, by scoring based on how close they are to sorted, with the higher tiles being more important


function print_board(state) {
  for (var i = 0; i < 4; i += 1) {
    console.log(...state.slice(i * 4, i * 4 + 4))
  }
}

// === logic ===============
function score (state, score) {
  let sorted = [...state].sort((a, b) => b - a)
  let nFields = state.filter(e => e !== 0).length
  let mx = Math.max.apply(undefined, state)
  let comb = true
  let sortBonus = state.reduce((prv, cur, i) => {
    comb = comb && cur === sorted[i]
    if (comb) {
      return prv + cur
    }
    return prv
  }, 0);
  let res = sortBonus * score

  // console.log('======')
  // print_board(state)
  // console.log('---')
  // console.log(res, sortBonus, score, nFields)
  return res
}


function calc_mean_leaf_scores (states) {
  if (states.newState !== undefined) {
    return score(states.newState, states.newScore)
  }
  return directions.map(e => calc_mean_leaf_scores(states[e])).reduce((prv, cur) => prv + cur, 0)
  // return directions.map(e => calc_mean_leaf_scores(states[e])).reduce((prv, cur) => prv > cur ? prv : cur, 0)
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

  let { direction } = pick_biased(options);
  return {direction, calcs: 4 ** turnsInAdvance}
}


// === start ===============

play(server, name, pick_promising, sleepTime)