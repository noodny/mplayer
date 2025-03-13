const assert = require("assert");
const { describe, it, beforeEach, mock } = require("node:test");
const MPlayer = require("../lib/player");

describe("player", () => {
    describe("status", () => {
        it("should initially have the default values", () => {
            const player = new MPlayer();
            assert.deepEqual(player.status, {
                duration: 0,
                fullscreen: false,
                subtitles: false,
                filename: null,
                title: null,
            });
            player.destroy();
        });

        it("should be updated with new values when using setStatus", () => {
            const player = new MPlayer();
            player.setStatus({
                duration: 100,
                fullscreen: true,
                subtitles: true,
                filename: "test.mp4",
                title: "Test",
            });
            assert.deepEqual(player.status, {
                duration: 100,
                fullscreen: true,
                subtitles: true,
                filename: "test.mp4",
                title: "Test",
            });
            player.destroy();
        });

        it("should be updated with defaults when using setStatus and nothing is passed in", () => {
            const player = new MPlayer();
            player.setStatus();
            assert.deepEqual(player.status, {
                duration: 0,
                fullscreen: false,
                subtitles: false,
                filename: null,
                title: null,
            });
            player.destroy();
        });
    });

    describe("process", () => {
        beforeEach(() => {
            mock.module("child_process", {
                namedExports: {
                    spawn: mock.fn(() => ({
                        on: () => {},
                        kill: () => {},
                    })),
                },
            });
        });
        it("should spawn a new instance of mplayer", () => {
            const player = new MPlayer();
            assert(player.instance);
            player.destroy();
        });
    });
});
