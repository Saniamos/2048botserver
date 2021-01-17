
const request = require('request');
const rules = require('./game');

const server = 'http://localhost:3000';
const directions = ['left', 'up', 'right', 'down'];

const sleepTime = 100;

const turnsInAdvance = 4;
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

function pick_rand(arr) {
  return arr[Math.floor(Math.random() * Math.floor(arr.length))];
}

// === bot ===============
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

async function move (id, direction) {
  let game = await get(`${server}/game/${id}/move?direction=${direction}`)
  return game; 
}

async function start (name) {
  let game = await get(`${server}/game/start?name=${name}`)
  return {id: game.id, game};
} 


async function play() {
  var {id, game} = await start(name)
  while (game.finished === false) {
    let direction = pick_promising(game.state);
    game = await move(id, direction)
    await sleep(sleepTime);
  }
}


play()