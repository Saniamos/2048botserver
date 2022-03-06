const { json } = require('express/lib/response');
const request = require('request');
const rules = require('../lib/game')

const directions = ['left', 'up', 'right', 'down'];

function get(url) {
  return new Promise((resolve, reject) => {
    request(url, (error, response, body) => {
      if (error) reject(error);
      if (response.statusCode != 200) {
        reject('Invalid status code <' + response.statusCode + '>');
      }
      resolve(JSON.parse(body));
    });
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function move (server, id, direction) {
  let game = await get(`${server}/game/${id}/move?direction=${direction}`)
  return game; 
}

async function start (server, name) {
  let game = await get(`${server}/game/start?name=${name}`)
  return {id: game.id, game};
} 

function pick_rand(arr) {
  // TODO: is this truly equal?
  return {direction: arr[Math.floor(Math.random() * arr.length)], calcs: 1};
}

// picks the first entries with higher prob than the others
// always halfs probability with each index passed
function pick_biased (arr) {
  return {direction: arr.filter((_, i) => i + 1 === arr.length || Math.random() < 0.5)[0], calcs: 1};
}

async function play(server, name, pick_fn, sleepTime=100) {
  var moves = 0;
  var comps = 0;

  var {id, game} = await start(server, name)
  while (game.finished === false) {
    let {direction, calcs} = pick_fn(game.state);
    game = await move(server, id, direction);
    moves += 1
    comps += calcs
    await sleep(sleepTime);
  }

  console.log(`${name} - Score/Calc: ${game.score / comps}, Calc/Move: ${comps / moves} (Score: ${game.score}, Calcs: ${comps}, Moves: ${moves})`)
  return {moves, comps, game}
}

// returns nested structure: {left: {left: {newState, newScore}, right: {} ...} ...}
// TODO: if the state does not change just link to the neighours
// TODO: consider averaging several computations per choice (to average the random new tile position influcence)
function calc_advance (state, future = 1) {
  if (future < 1) {
    return {states: state, comps: 0};
  }

  let states = {}
  let comps = 4
  
  for (let dir of directions) {
    let {newState, newScore} = rules.move(dir, state.newState)
    states[dir] = {newScore: newScore + state.newScore, newState}
    if (future > 1) {
      let rec = calc_advance(states[dir], future - 1)
      states[dir] = rec.states
      comps += rec.comps
    }
  }
  return {states: states, comps: comps}
}

function state_to_index(state){
  return JSON.stringify(state) // TODO: hash instead
}

function calc_advance_cache(state, future = 1, cache={}) {
  if (future < 1) {
    return {states: state, comps: 0};
  }

  let states = {}
  let comps = 0
  
  for (let dir of directions) {
    let move_ret;

    state_str = state_to_index(state.newState)

    if (cache[state_str] !== undefined && cache[state_str][dir] !== undefined) {
      // Important: this only holds if the score is purely based on the numbers that are combined, no combos etc
      move_ret = cache[state_str][dir]
    } else {
      move_ret = rules.move(dir, state.newState)
      comps += 1
    }

    let {newState, newScore} = move_ret
    states[dir] = {newScore: newScore + state.newScore, newState}
    cache[state_str] = {...cache[state_str], [dir]: states[dir]}

    if (future > 1) {
      let rec = calc_advance_cache(states[dir], future - 1, cache)
      states[dir] = rec.states
      comps += rec.comps
    }
  }
  return {states: states, comps: comps}
}

module.exports = {
  get: get,
  play: play,
  sleep: sleep,
  move: move,
  start: start,
  pick_rand: pick_rand,
  pick_biased: pick_biased,
  calc_advance: calc_advance,
  calc_advance_cache: calc_advance_cache,
  directions: directions
}