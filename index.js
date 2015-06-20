var Player = require('./lib/player'),
    EventEmitter = require('events').EventEmitter.prototype,
    _ = require('lodash');

var MPlayer = function() {
    this.player = new Player();
    this.status = {
        muted: false,
        playing: false,
        volume: 0
    };

    this.player.on('ready', function() {
        console.log('ready')
    });

    this.player.on('statuschange', function(status) {
        this.status = _.extend(this.status, status);
    }.bind(this));

    this.player.on('playstart', function() {
        console.log('play start')
    });

    this.player.on('playstop', function() {
        console.log('play stop')
    });

    this.player.on('timechange', function(time) {
        this.status.position = time;
        //console.log('time change', time)
    }.bind(this));
};

MPlayer.prototype = {
    open: function(file) {
        this.player.cmd('loadfile', [file]);
        this.playing = true;
        this.status.playing = true;
        this.status.volume = 100;
        // set volume to 100%
        this.player.cmd('volume', [100, 1]);
    },
    play: function() {
        if(!this.status.playing) {
            this.player.cmd('pause');
            this.status.playing = true;
        }
    },
    pause: function() {
        if(this.status.playing) {
            this.player.cmd('pause');
            this.status.playing = false;
        }
    },
    stop: function() {
        this.player.cmd('stop');
    },
    seek: function(seconds) {
        this.player.cmd('seek', [seconds, 2]);
    },
    seekPercent: function(percent) {
        this.player.cmd('seek', [percent, 1]);
    },
    volume: function(percent) {
        this.status.volume = percent;
        this.player.cmd('volume', [percent, 1]);
    },
    mute: function() {
        this.status.muted = !this.status.muted;
        this.player.cmd('mute');
    },
    fullscreen: function() {
        this.status.fullscreen = !this.status.fullscreen;
        this.player.cmd('vo_fullscreen');
    },
    hideSubtitles: function() {
        this.player.cmd('sub_visibility', [-1]);
    },
    showSubtitles: function() {
        this.player.cmd('sub_visibility', [1]);
    },
    cycleSubtitles: function() {
        this.player.cmd('sub_select');
    },
    speedUpSubtitles: function() {
        this.player.cmd('sub_step', [1]);
    },
    slowDownSubtitles: function() {
        this.player.cmd('sub_step', [-1]);
    },
    adjustSubtitles: function(seconds) {
        this.player.cmd('sub_delay', [seconds]);
    },
    adjustAudio: function(seconds) {
        this.player.cmd('audio_delay', [seconds]);
    }
};

module.exports = MPlayer;