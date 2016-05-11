# Description
This module is a wrapper for mplayer started in slave mode [(see documentation)](http://www.mplayerhq.hu/DOCS/tech/slave.txt).
It ensures that an instance of mplayer is always running in background ready for playback.

**You need mplayer installed on your system for it to work properly!**

See the [Changelog](#changelog) section for all breaking changes which may cause issues if you've updated the module.

# Installation

    npm install mplayer

# Usage

Start off with instantiating the client

```javascript
var MPlayer = require('mplayer');

var player = new MPlayer();
```

You may want to pass in an object with options allowing for better debugging

* *verbose* (Boolean): `true`, `false` - if set to true all player events will be logged to console
* *debug* (Boolean): `true`, `false` - log mplayer `stdout`, `stderr` streams directly to console, along with everything written to `stdin` stream

or passing additional options to the spawned mplayer instance

* *args* (String|Array): - list of additional parameters which will be passed to the command line mplayer instance (see mplayer manual for more details)

After this you will have access to all player methods and events.
The player instance uses node's native [EventEmitter](https://nodejs.org/api/events.html#events_class_events_eventemitter) for events management.

## Methods
* **setOptions**(< Object > options) - loops through the options object and uses mplayer `set_property` function to set them for the currently running instance

`options` is an object with one or more key value pairs, determining which parameters should be set, see the last section
of [slave mode documentation](http://www.mplayerhq.hu/DOCS/tech/slave.txt) for the list of possible parameters and values

Example:
```javascript
player.setOptions({
    cache: 128,
    cacheMin: 1
});
```

* **openFile**(< String > file, [ Object ] options)

`file` is the location of the file you want to open either in your filesystem or on the web

`options` is an object passed to the **setOptions** method right before opening the file

Example:
```javascript
player.openFile('/Users/noodny/Downloads/sample-video.avi');
```

* **openPlaylist**(< String > file, [ Object ] options)

`file` is the location of the playlist file you want to open either in your filesystem or on the web

`options` is an object passed to the **setOptions** method right before opening the file

Example:
```javascript
player.openPlaylist('http://www.radio.com/radio-stream.pls', {
    cache: 128,
    cacheMin: 1
});
```

* **play**( )
* **pause**( )
* **stop**( )
* **seek**(< Number > seconds) - seek to a specific second
* **seekPercent**(< Number > percent ) - seek to a percent position of a file
* **volume**(< Number > percent ) - set volume to a given percentage
* **mute**( ) - toggle mute
* **fullscreen**( ) - toggle fullscreen
* **hideSubtitles**( )
* **showSubtitles**( )
* **cycleSubtitles**( ) - change to the next subtitles file in the file directory
* **speedUpSubtitles**( )
* **slowDownSubtitles**( )
* **adjustSubtitles**(< Number > seconds) - adjust the subtitles timing by +/- seconds
* **adjustAudio**(< Number > seconds) - adjust the audio timing by +/- seconds

## Events

* **ready** - triggered only once when mplayer process is started
* **time** < Number > seconds - triggered every ~30ms
* **start** - triggered once an asset playback has started
* **play** - triggered when playback is resumed
* **pause** - triggered when playback is paused
* **stop** - triggered when an asset has finished playing
* **status** < Object > status - triggered whenever player status changes
The `status` object has the following properties:
```javascript
{
    muted: Boolean,
    playing: Boolean,
    volume: Number, // percent
    duration: Number, // seconds
    fullscreen: Boolean,
    subtitles: Boolean,
    filename: String,
    title: String // currently playing stream title - valid only for radio streams
}
```

## Example
The following example will set up a player instance, open a radio stream and set it's volume to 50% after 1 second,
while logging the player status event output to the console:

```
var MPlayer = require('mplayer');

var player = new MPlayer();

player.on('start', console.log.bind(this, 'playback started'));
player.on('status', console.log);

player.openPlaylist('http://www.miastomuzyki.pl/n/rmfclassic.pls', {
    cache: 128,
    cacheMin: 1
});

setTimeout(player.volume.bind(player, 50), 1000);
```
# Changelog
### 2.1.0
* Allow for passing additional arguments to the spawned mplayer instance [Thanks @efernandesng](https://github.com/noodny/mplayer/pull/3)

### 2.0.1
* Add documentation
* Add quotes to the filename [Thanks @hugo-agbonon](https://github.com/noodny/mplayer/pull/2)

### 2.0.0
* Change the `open` method to `openFile` and `openPlaylist`
* Add `verbose` and `debug` constructor options

### 1.0.0
* Emit play/pause events

### 0.0.3, 0.0.4
* Remove stdout console logs

### 0.0.2
* Proxy events to the object exported from module

# TODO
* Methods chaining
* Throttle time event down to once per second
* Defer methods resolving after actual player action
