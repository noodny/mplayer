const { spawn } = require("node:child_process");
const { EventEmitter } = require("node:events");
const {
    PLAYER_EVENT_READY,
    PLAYER_EVENT_PLAY_START,
    PLAYER_EVENT_PLAY_STOP,
    PLAYER_EVENT_STATUS_CHANGE,
    PLAYER_EVENT_TIME_CHANGE,
} = require("../consts");

const defaultArgs = [
    "-msglevel", // -msglevel help
    "global=6",
    "-msglevel",
    "cplayer=4",
    "-idle",
    "-slave",
    /*
    Makes MPlayer wait idly instead of quitting when there is no
    file to play.  Mostly useful in slave mode where MPlayer can
    be controlled through input commands. 
     */
    // "-fs", // full screen
    // "-nofs", // no full screen
    "-noborder",
];

const statusDefaults = {
    duration: 0,
    fullscreen: false,
    subtitles: false,
    filename: null,
    title: null,
};

class Player extends EventEmitter {
    constructor(options = {}) {
        super();
        this.options = options;
        this.spawn();
    }

    options = {};
    /**
     * @type PlayerStatus
     */
    status = { ...statusDefaults };
    instance = undefined;

    spawn() {
        let args = [];

        if (typeof this.options.args === "string") {
            args = this.options.args.split(" ");
        } else if (Array.isArray(this.options.args)) {
            args = this.options.args;
        }

        const instance = spawn("mplayer", defaultArgs.concat(args));

        this.setStatus();

        const startTime = Date.now();

        instance.stdout.on("data", this.onData.bind(this));
        instance.stderr.on("data", this.onError.bind(this));

        instance.on(
            "exit",
            function () {
                if (typeof this.instance === "undefined") {
                    process.exit(0);
                }
                if (Date.now() - startTime < 3000) {
                    // Process is erroring too close to start up, abort.
                    process.exit(1);
                }
                this.debugLog("mplayer process exited, restarting...");
                this.emit(PLAYER_EVENT_PLAY_STOP);
                this.spawn();
            }.bind(this)
        );

        this.instance = instance;
    }

    cmd(command, args = []) {
        if (typeof args.length === "undefined") {
            args = [args];
        }
        if (this.options.debug) {
            console.log(">>>> COMMAND: " + command, args);
        }
        this.instance.stdin.write([command].concat(args).join(" ") + "\n");
    }

    getStatus() {
        this.cmd("get_time_length");
        this.cmd("get_vo_fullscreen");
        this.cmd("get_sub_visibility");
    }

    setStatus(status) {
        if (status) {
            this.status = {
                ...statusDefaults,
                ...this.status,
                ...status,
            };
        } else {
            this.status = { ...statusDefaults };
        }

        this.emit(PLAYER_EVENT_STATUS_CHANGE, this.status);
    }

    resetStatus() {
        this.setStatus();
    }

    /**
     *
     * @param {Buffer} data
     */
    onData(data) {
        data = data.toString();

        if (this.options.debug) {
            console.log("stdout: " + data);
        }

        if (data.indexOf("MPlayer") === 0) {
            this.emit(PLAYER_EVENT_READY);
            this.resetStatus();
        }

        if (data.indexOf("StreamTitle") !== -1) {
            this.setStatus({
                title: data.match(/StreamTitle='([^']*)'/)[1],
            });
        }

        if (data.indexOf("Playing ") !== -1) {
            const file = data.match(/Playing\s(.+?)\.\s/)[1];
            this.resetStatus();
            this.setStatus({
                filename: file,
            });
            this.getStatus();
        }

        if (data.indexOf("Starting playback...") !== -1) {
            this.emit(PLAYER_EVENT_PLAY_START);
        }

        if (data.indexOf("EOF code:") > -1) {
            let codeStart, code;

            codeStart = data.indexOf("code:") + 5;
            code = data.substr(codeStart, 2).trim();
            code = parseInt(code, 10);

            this.emit(PLAYER_EVENT_PLAY_STOP, code);
            this.resetStatus();
        }

        if (data.indexOf("A:") === 0) {
            let timeStart, timeEnd, time;

            if (data.indexOf(" V:") !== -1) {
                timeStart = data.indexOf(" V:") + 3;
                timeEnd = data.indexOf(" A-V:");
            } else {
                timeStart = data.indexOf("A:") + 2;
                timeEnd = data.indexOf(" (");
            }

            time = data.substring(timeStart, timeEnd).trim();

            this.emit(PLAYER_EVENT_TIME_CHANGE, time);
        }

        if (
            data.indexOf("ANS_LENGTH") !== -1 &&
            data.indexOf("ANS_VO_FULLSCREEN") !== -1 &&
            data.indexOf("ANS_SUB_VISIBILITY") !== -1
        ) {
            this.setStatus({
                duration: parseFloat(data.match(/ANS_LENGTH=([0-9\.]*)/)[1]),
                fullscreen:
                    parseInt(data.match(/ANS_VO_FULLSCREEN=([01])/)[1]) === 1,
                subtitles:
                    parseInt(data.match(/ANS_SUB_VISIBILITY=([01])/)[1]) === 1,
            });
        }
    }

    onError(error) {
        this.debugLog("stderr: " + error);
    }

    debugLog(message) {
        if (this.options.debug) {
            console.log(message);
        }
    }

    destroy() {
        const process = this.instance;
        this.instance = undefined;
        process.kill("SIGKILL");
    }
}

module.exports = Player;
