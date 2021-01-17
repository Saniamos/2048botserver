const request = require('request');

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
  return arr[Math.floor(Math.random() * Math.floor(arr.length))];
}

async function play(server, name, pick_fn, sleepTime=100) {
  var {id, game} = await start(server, name)
  while (game.finished === false) {
    let direction = pick_fn(game.state);
    game = await move(server, id, direction)
    await sleep(sleepTime);
  }
}

module.exports = {
  get: get,
  play: play,
  sleep: sleep,
  move: move,
  start: start,
  pick_rand: pick_rand
}