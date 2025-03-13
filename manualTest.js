const MPlayer = require('./index.js');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

(async() => {
    const player = new MPlayer({
        debug: true
    });
    
    player.on('start', console.log.bind(this, 'playback started'));
    player.on('status', console.log);

    await sleep(2000)
    
    
    player.openFile('/Users/krzysztof.jakubik/Downloads/BigBuckBunny_320x180.mp4');
    
    // player.openFile('http://stream.rcs.revma.com/ypqt40u0x1zuv');
    
    // setTimeout(player.volume.bind(player, 50), 1000);
    // setInterval(() => console.log(player.status), 1000)
    
    setTimeout(() => player.pause(), 3000)
    
    // setTimeout(() => player.play(), 6000)
})()
