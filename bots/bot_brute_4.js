
const res = require('express/lib/response');
const rules = require('../lib/game');
const {play, pick_biased, calc_advance, calc_advance_cache} = require('./bot_helpers');

const server = 'http://localhost:3000';

// we specifically define this order for the bias
const directions = ['left', 'up', 'right', 'down'];

const sleepTime = 100;

const turnsInAdvance = 4;
const name = `Bot: Neighbours - ${turnsInAdvance}`
// Strategy: try to sort the tiles into the upper left corner
// Tools: 
//    score branch by using score + position bonus
//    score position and abort <5 if neighbors in upper left are bad




function print_board(state) {
  for (var i = 0; i < 4; i += 1) {
    console.log(...state.slice(i * 4, i * 4 + 4))
  }
}

function neighours(state, i) {
  res = []
  if (i + 4 < 16) {
    res.append(state[i + 4])
  }
  if (i - 4 >= 0) {
    res.append(state[i - 4])
  }
  if (i % 4 + 1 == i + 1 % 4) {
    res.append(state[i + 1])
  }
  if (i % 4 - 1 == i - 1 % 4) {
    res.append(state[i - 1])
  }
  return res
}

// === logic ===============
function sort_bonus(state) {
  let sorted = [...state].sort((a, b) => b - a)
  // let nFields = state.filter(e => e !== 0).length
  // let mx = Math.max.apply(undefined, state)
  let comb = true
  let sortBonus = state.reduce((prv, cur, i) => {
    comb = comb && cur === sorted[i]
    if (comb) {
      return prv + cur
    }
    return prv
  }, 0);
  return sortBonus
}

function score_position(state) {
  return 100 * sort_bonus(state) / state.reduce((prv, cur) => prv + cur, 0)
}

function score (state, score) {
  return sort_bonus(state) + score
}


function calc_mean_leaf_scores (states) {
  if (states.newState !== undefined) {
    return score(states.newState, states.newScore)
  }
  return directions.map(e => calc_mean_leaf_scores(states[e])).reduce((prv, cur) => prv + cur, 0)
  // return directions.map(e => calc_mean_leaf_scores(states[e])).reduce((prv, cur) => prv > cur ? prv : cur, 0)
}

function pick_promising (state) {
  let {states, comps} = calc_advance_cache({newState: state, newScore: 0}, turnsInAdvance, score_position)
  // let {states, comps} = calc_advance({newState: state, newScore: 0}, turnsInAdvance)
  let scores = {}
  for (let dir of directions) {
    // TODO: find more elegant version to filter this
    if (!rules.stateUnChanged(state, rules.move_direction(dir, state).newState)) {
      scores[dir] = calc_mean_leaf_scores(states[dir])
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
  return {direction, calcs: comps}
}


// === start ===============

play(server, name, pick_promising, sleepTime)