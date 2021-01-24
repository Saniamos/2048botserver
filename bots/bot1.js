
const {play, pick_rand, directions} = require('./bot_helpers');

const server = 'http://localhost:3000';

const sleepTime = 10;
const name = `Bot: Random`

// Strategy: just pick random

play(server, name, () => pick_rand(directions), sleepTime)