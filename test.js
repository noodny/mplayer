var MPlayer = require(__dirname + '/index.js');

var Player = new MPlayer({
    verbose: false,
    debug: false
});

Player.openPlaylist('http://www.miastomuzyki.pl/n/rmfclassic.pls', {
    cache: 128,
    cacheMin: 1
});
