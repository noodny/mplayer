const { EventEmitter } = require("node:events");
const Player = require("./lib/player");
const {
    PLAYER_EVENT_READY,
    PLAYER_EVENT_PLAY_START,
    PLAYER_EVENT_PLAY_STOP,
    PLAYER_EVENT_STATUS_CHANGE,
    PLAYER_EVENT_TIME_CHANGE,
} = require("./consts");

const defaultOptions = {
    verbose: false,
    debug: false,
};

const defaultStatus = {
    muted: false,
    playing: false,
    volume: 0,
};

class MPlayer extends EventEmitter {
    /**
     * @type {MPlayerOptions}
     */
    options = {};

    /**
     * @type {MPlayerStatus}
     */
    status = {};

    /**
     * @param {MPlayerOptions} options
     */
    constructor(options) {
        super();
        this.options = { ...defaultOptions, ...options };

        this.player = new Player({
            debug: this.options.debug,
            args: this.options.args,
        });

        this.status = {
            ...defaultStatus,
        };

        this.player.once(PLAYER_EVENT_READY, () => {
            this.log("player.ready");
            this.emit("ready");
        });

        this.player.on(PLAYER_EVENT_STATUS_CHANGE, (status) => {
            this.status = { ...this.status, ...status };
            this.log("player.status", this.status);
            this.emit("status", this.status);
        });

        this.player.on(PLAYER_EVENT_PLAY_START, () => {
            this.log("player.start");
            this.emit("start");
        });

        this.player.on(PLAYER_EVENT_PLAY_STOP, (code) => {
            this.log("player.stop", code);
            this.emit("stop", code);
        });

        let pauseTimeout;
        let paused = false;

        this.player.on(PLAYER_EVENT_TIME_CHANGE, (time) => {
            clearTimeout(pauseTimeout);

            // if no timechange event is triggered within 100ms, we assume the player is paused
            pauseTimeout = setTimeout(() => {
                paused = true;
                this.status.playing = false;
                this.emit("pause");
                this.log("player.pause");
            }, 100);

            if (paused) {
                paused = false;
                this.status.playing = true;
                this.emit("play");
                this.log("player.play");
            }

            this.status.position = time;
            this.emit("time", time);
            this.log("player.time", time);
        });
    }

    setOptions(options) {
        if (options && Object.keys(options).length) {
            options.forEach((value, key) =>
                this.player.cmd("set_property", [key, value])
            );
        }
    }

    openFile(file, options) {
        this.player.cmd("stop");

        this.setOptions(options);
        this.player.cmd("loadfile", [`"${file}"`]);

        this.status.playing = true;
    }

    openPlaylist(file, options) {
        this.player.cmd("stop");

        this.setOptions(options);
        this.player.cmd("loadlist", [`"${file}"`]);

        this.status.playing = true;
    }

    play() {
        if (!this.status.playing) {
            this.player.cmd("pause");
            this.status.playing = true;
        }
    }

    pause() {
        if (this.status.playing) {
            this.player.cmd("pause");
            this.status.playing = false;
        }
    }

    stop() {
        this.player.cmd("stop");
        this.status.playing = false;
    }

    next() {
        this.player.cmd("pt_step 1");
    }

    previous() {
        this.player.cmd("pt_step -1");
    }

    seek(seconds) {
        this.player.cmd("seek", [seconds, 2]);
    }

    seekPercent(percent) {
        this.player.cmd("seek", [percent, 1]);
    }

    volume(percent) {
        this.status.volume = percent;
        this.player.cmd("volume", [percent, 1]);
    }

    mute() {
        this.status.muted = !this.status.muted;
        this.player.cmd("mute");
    }

    fullscreen() {
        this.status.fullscreen = !this.status.fullscreen;
        this.player.cmd("vo_fullscreen");
    }

    hideSubtitles() {
        this.player.cmd("sub_visibility", [-1]);
    }

    showSubtitles() {
        this.player.cmd("sub_visibility", [1]);
    }

    cycleSubtitles() {
        this.player.cmd("sub_select");
    }

    speedUpSubtitles() {
        this.player.cmd("sub_step", [1]);
    }

    slowDownSubtitles() {
        this.player.cmd("sub_step", [-1]);
    }

    adjustSubtitles(seconds) {
        this.player.cmd("sub_delay", [seconds]);
    }

    adjustAudio(seconds) {
        this.player.cmd("audio_delay", [seconds]);
    }

    log(message) {
        if (this.options.verbose) {
            console.log(message);
        }
    }
}

module.exports = MPlayer;
