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

    this.player.once('ready', function() {
        this.emit('ready');
    }.bind(this));

    this.player.on('statuschange', function(status) {
        this.status = _.extend(this.status, status);
        this.emit('status', this.status);
    }.bind(this));

    this.player.on('playstart', function() {
        this.emit('start');
    }.bind(this));

    this.player.on('playstop', function() {
        this.emit('stop')
    }.bind(this));

    var pauseTimeout,
        paused = false;

    this.player.on('timechange', function(time) {
        clearTimeout(pauseTimeout);
        pauseTimeout = setTimeout(function() {
            paused = true;
            this.status.playing = false;
            this.emit('pause');
        }.bind(this), 100);
        if(paused) {
            paused = false;
            this.status.playing = true;
            this.emit('play')
        }
        this.status.position = time;
        this.emit('time', time);
    }.bind(this));
};

MPlayer.prototype = _.extend({
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
}, EventEmitter);

module.exports = MPlayer;
