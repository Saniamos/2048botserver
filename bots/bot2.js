
// imports (no need to change)
const rules = require('../lib/game');
const {play, pick_rand, calc_advance, directions} = require('./bot_helpers');

// server adress (no need to change)
const server = 'http://localhost:3000';

// timout between movements
const sleepTime = 100;

// number of turns the bot should consider in advance
// CAUTION: all possible paths are calculated: sum_i 4^n-i, where n the number of turns and i from 0 to n
// ie 3 turns will need to calc: 4^3 + 4^2 + 4^1 
// 3-5 is a reasonable number, 10 already takes quite long to calc
const turnsInAdvance = 3;
// Name of the bot in the overview
const name = `Bot: FS - ${turnsInAdvance}`



// Strategy: calc x turns in advance and then pick highest score for next move


// === logic ===============

// THIS function is where the strategy / choices are made and that you want to change
// the score function takes a field and a score and needs to return an integer
// the field is implemented in a 1dim array of size 16
// the score represents the gained points (same as for user) in this path of the search graph
// the returned integer determines how good position is scored and used to determine the best next move
function score (_, score) {
  return score
}

// recursively traverses the search tree (no need to change)
// scores each leaf node (field + gained score) and collapses the score into the initial movement direction
function calc_mean_leaf_scores (states) {
  if (states.newState !== undefined) {
    return score(states.newState, states.newScore)
  }

  // one could try and use a different mergeing strategy here
  // as of know (prv + cur) the sum is used, ie the path is chosen, where the sum of scores of all possible fields is the highest
  return directions.map(e => calc_mean_leaf_scores(states[e])).reduce((prv, cur) => prv + cur, 0)
}

// function doing the picking (no need to change)
// builds all possibilities for up to turnsInAdvance (also spawns new random tile, <- this is not the same as the server will spawn)
// then folds all scores using the scoring and calc leaf functions
// only considers those options, where the state changes
// then picks the best scored one
// if two strategies have the same score, pick random (could be changed to favor a certain direction (ie chose left over right in 90% of cases or similar))
function pick_promising (state) {
  let states, comps = calc_advance({newState: state, newScore: 0}, turnsInAdvance)
  let scores = {}
  for (let dir of directions) {
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

  let { direction } = pick_rand(options);
  return {direction, calcs: comps}
}


// === start ===============
// start the bot
// server adress, bot name, function that takes a state and returns a direction, time between movements
play(server, name, pick_promising, sleepTime)