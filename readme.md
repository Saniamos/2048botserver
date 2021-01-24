# 2048 Server + Bots

Express + Websocket framework to play 2048 and write bots for it.

Once the server is started you can view all currently running games on `localhost:3000`.
To play a game provide a name and click on start in the overview. 


## Up & Running
Make sure you have nodejs installed:
```node -v```
If not you can download it here (you'll probably want lts): https://nodejs.org/en/

Then install the dependencies in the cloned folder on your machine by running:
```npm install```

Finally start the server by either running the start.sh/bat or executing:
```node app.js```

That's it :-)


## Playing 2048
The goal of the game is to reach 2048 (or as high as you might come) by moving the tiles left, right, up or down. Doing so combines all tiles with the same value that "hit" each other during movement. 

Create a new game for yourself by going to `localhost:3000`, entering a name and clicking start.
You can do this on your mobile device or computer.
Then play by swiping on the field into the direction you want the tiles to move or use the arrow keys of your keyboard. 

Note, that due to the game running on the server, it is currently not possible to add animations on the client.


## Writing a Bot
You can and are incouraged to write bots and see them perform in real time on the overview page.
In the bots folder you'll already find a couple of bots. Bot2 is a straightforward and exentsively documented bot which you might want to use as template and just swap out the scoring function.

The server is based on http requests, so if js is not your thing feel free to use any other language to write your bots.

// TODO: add documentation on http interface


The provided bot framework handles communicating with the server and calculating turns in advance (if you choose to use this feature) for you. All you need to do is provide a scoring function or a function that returns a direction given the current field. Have a look at bot2 for an example with documentation.
Run these bots by navigating into bots and executing: 
```node bot2.js```


## Contributing