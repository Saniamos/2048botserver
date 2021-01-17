
const {play, pick_rand} = require('./bot_helpers');

const server = 'http://localhost:3000';
const directions = ['left', 'up', 'right', 'down'];

const sleepTime = 100;
const name = `Bot: Random`

// Strategy: just pick random

play(server, name, () => pick_rand(directions), sleepTime)