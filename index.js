#!/usr/bin/env node

var client = require('spotify-node-applescript');
var cli = require('cli').enable('version');
var request = require('request');
var pkg = require('./package.json');


cli.setApp(pkg.name, pkg.version);

cli.parse(null, ['play', 'pause', 'next', 'previous', 'status','mute','unmute','up','down']);

function nowPlaying() {
	client.getTrack(function(err, track) {
		if (err || !track) cli.error(err);
		cli.info(track.name + " - " + track.artist);
	});
}

function parsePlayArg(arg, callback) {
	if (arg.toLowerCase().substring(0,8) == 'spotify:') return callback(null, arg);

	request('http://ws.spotify.com/search/1/track.json?q=' +  arg, function (err, res, body) {
		if (err) return callback(err);
		if (res.statusCode == 200) {
			callback(null, JSON.parse(body).tracks[0].href);
		} else {
			callback(res.statusCode);
		}
	});
}

cli.main(function (args, options) {
	if (cli.command == 'play') {
		if (cli.args.length) {
			parsePlayArg(cli.args.join(' '), function (err, url) {
				client.playTrack(url, function () {
					nowPlaying();
				});
			});

		} else {

			client.play(function () {
				nowPlaying();
			});

		}
	}

	if (cli.command == 'pause') {
		client.pause(function () {
			cli.ok('paused');
		});
	}

	if (cli.command == 'next') {
		client.next(function () {
			nowPlaying();
		});
	}

	if (cli.command == 'previous') {
		client.previous(function () {
			nowPlaying();
		});
	}

	if (cli.command == 'status') {
		client.getState(function (err, state) {
			if (err) return cli.error(err);
			cli.info(state.state);

			client.getTrack(function(err, track) {
				if (err) return cli.error(err);
				cli.info(track.name + " - " + track.artist);
				cli.progress(state.position / track.duration);
			});
		});
	}
	
	if(cli.command == 'mute') {
		client.muteVolume(function(err, state){
			if (err) return cli.error(err);
			cli.ok("muted!");
		})
	}
	
	if(cli.command == 'down') {
		client.volumeDown(function(err, state){
			if (err) return cli.error(err);
			cli.ok("volume down!");
		})
	}
	if(cli.command == 'up') {
		client.volumeUp(function(err, state){
			if (err) return cli.error(err);
			cli.ok("volume up!");
		})
	}

	if(cli.command == 'unmute') {
		client.unmuteVolume(function(err, state){
			if (err) return cli.error(err);
			cli.ok("un muted!");
		})
	}
});
