
const request = require('request');

const server = 'http://localhost:3000';
const directions = ['left', 'up', 'right', 'down'];

const sleepTime = 200;

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

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

async function play() {
  var {id, game} = await start('Bot: Random')
  while (game.finished === false) {
    let direction = directions[getRandomInt(4)];
    game = await move(id, direction)
    await sleep(sleepTime);
  }
}


play()