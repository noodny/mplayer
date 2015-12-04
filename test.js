var MPlayer = require('./index.js');

var player = new MPlayer({
    debug: true
});

player.on('start', console.log.bind(this, 'playback started'));
player.on('status', console.log);


player.openPlaylist('http://www.miastomuzyki.pl/n/rmfclassic.pls', {
    cache: 128,
    cacheMin: 1
});

setTimeout(player.volume.bind(player, 50), 1000);

