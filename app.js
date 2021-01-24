const express = require('express')
const ws = require('ws');
const fs = require('fs');
const path = require('path');
const logger = require('morgan');


const app = express()
const port = 3000


app.use(logger('dev'));

const rules = require('./lib/game')
const ObeservableStorage = require('./lib/state');

let storedGames = []
const dataStoragePath = './games.json';
if (fs.existsSync(dataStoragePath)) {
  storedGames = JSON.parse(fs.readFileSync(dataStoragePath))
  if (!Array.isArray(storedGames)) {
    console.log('Wrong type in json, found: ', typeof(storedGames))
    storedGames = []
  }
}
const games = new ObeservableStorage(storedGames);


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})


// === Game Routes =====================
app.get('/game/start', (req, res) => {
  let game = rules.createGame(req.query.name)
  let id = games.add(game);
  res.send(JSON.stringify({id, ...game}))
})

app.get('/game/:id/move', (req, res) => {
  let direction = req.query.direction;
  let id = req.params.id;
  let game = games.get(id);

  if (!game.finished) {
    let {newState, newScore} = rules.move(direction, game.state)
    game.state = newState;
    game.score = game.score + newScore;
    game.finished = rules.checkFinished(game.state)
    games.udpate(id, game)
  }
  console.log(id, direction, game.score, game.finished);
  res.send(JSON.stringify(game))
})

app.get('/game/:id/data', (req, res) => {
  let id = req.params.id;
  let game = games.get(id);
  res.send(JSON.stringify(game))
})

// === Play Sites =================================

app.get('/game/:id', function(req, res) {
  res.sendFile(path.join(__dirname + '/pages/play.html'));
});


app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname + '/pages/overview.html'));
});


// === Overview API =====================
const wss = new ws.Server({ port: 3001 });


function wsSend (socket, msg, payload) {
  socket.send(JSON.stringify({msg, payload}))
}

function setupListeners(socket, fn) {
  console.log('Setting up listeners')

  games.on('add', fn)
  games.on('change', fn)

  socket.on('close', () => {
    console.log('Cleaning listeners')
    games.removeListener('add', fn);
    games.removeListener('change', fn);
  })
  return true;
}

wss.on('connection', function connection(socket) {
  let allgames = false;
  let singlegame = false;

  socket.on('message', (e) => {
    try {
      const {msg, options} = JSON.parse(e);
      let fn = () => {};
      console.log(msg, options)
      switch (msg) {
        case 'allgames': 
          fn = () => wsSend(socket, 'allgames', games.getall())
          if (!allgames) {
            allgames = setupListeners(socket, fn)
            fn();
          }
          break;
        case 'singlegame':
          fn = ({id}) => {
            // if (id === options.id) {
              let leaderboard = games.getall().map(e => ({score: e.score, name: e.name})).sort((a, b) => b.score - a.score).slice(0, 11)
              wsSend(socket, 'singlegame', {game: games.get(options.id), leaderboard: leaderboard})
            // }
          }
          if (!singlegame) {
            singlegame = setupListeners(socket, fn)
            fn({id: options.id})
          }
          break;
        default: 
          console.log('Unknown message: ', msg)
      }
    } catch (error) {
      console.log(error)
      console.log('Error while handling message', e)
    }
  })

  wsSend(socket, 'service?')
});

// TODO: consider using the standard structure 
app.use('/', express.static(path.join(__dirname, 'public')))



// === handle closing ========================================
// adapted from https://stackoverflow.com/questions/14031763/doing-a-cleanup-action-just-before-node-js-exits

function exitHandler (options, exitCode) {
  fs.writeFileSync(dataStoragePath, JSON.stringify(games.getall()))
  if (exitCode || exitCode === 0) console.log(exitCode);
  if (options.exit) process.exit();
}

//do something when app is closing
process.on('exit', exitHandler.bind(null));

//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {exit:true}));

// catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', exitHandler.bind(null, {exit:true}));
process.on('SIGUSR2', exitHandler.bind(null, {exit:true}));

//catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, {exit:true}));