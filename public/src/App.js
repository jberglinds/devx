/* global Demo, React, ReactDOM */

let recentUpdate = false

let socket = io('10.48.12.61:8080').connect()
socket.on('connect', () => {
	console.log('Ready')
})

function connectToStation(id) {
		socket.emit('join', {
			radio: id,
		})
}

function addTrackChangedListener(callback) {
	socket.on('track-change', (req) => callback(req))
}

function addPausedListener(callback) {
	socket.on('pause', (req) => callback(req))
}

function addResumedListener(callback) {
	socket.on('resume', (req) => callback(req))
}

function sendPaused() {
	if (recentUpdate) {
		socket.emit('pause', {})
		console.log('Sending pause on socket')
		window.setTimeout(() => {
			recentUpdate = false
		}, 500)
	}
}

function sendResumed() {
	if (recentUpdate) {
		socket.emit('resume', {})
		console.log('Sending resume on socket')
		window.setTimeout(() => {
			recentUpdate = false
		}, 500)
	}
}

function sendNewTrack(uri) {
	socket.emit('track-change', uri)
}


/**
 * (C) 2017 Spotify AB
 */

/********************************
 ********************************
 ******** REACT CLASSES *********
 ********************************
 ********************************/

var Authorize = React.createClass({
  render () {
    return (
      <div className="screen">
        <button className="btn btn-lg btn-primary" onClick={Demo.sendToLogin}>Log in with Spotify</button>
      </div>
    );
  }
});

var ConnectPlayer = React.createClass({
  listenForFocusOnWebPlayer() {
    let _this = this;
    let stateHandlerCallback = (state) => {
			if (state.paused)
				sendPaused()
			else
				sendResumed()

      console.log("Currently Playing", state);
      _this.stateHandler(state);
    };

    // Call once when connected
    Demo.WebPlaybackSDK.getCurrentState().then(stateHandlerCallback);
		connectToStation('testing');
		addPausedListener((req) => {
			Demo.WebPlaybackSDK.pause();
		})
		addResumedListener((req) => {
			Demo.WebPlaybackSDK.resume();
		})

    // When a change is made
    Demo.WebPlaybackSDK.on("player_state_changed", stateHandlerCallback);

    // Poll status every 0.1 seconds
    // This is just to improve the UI for the progress bar
    // setInterval(() => {
    //   Demo.WebPlaybackSDK.getCurrentState().then(stateHandlerCallback);
    //
    // }, 100);
  },
  waitingToStart() {
    let player_name = Demo.WebPlaybackSDK._options.name;

    return (
      <div className="screen screen-connect-player">
        <div className="icon grid-loading-icon">
          <span className="visually-hidden">Loading</span>
        </div>
        <br />
        <h1>Select <span className="spotify-green">{player_name}</span> on Spotify Connect ...</h1>
      </div>
    );
  },
  stateHandler(state) {
    if (state === null) {
      ReactDOM.render(this.waitingToStart(), document.getElementById('screen'));
    } else {
      ReactDOM.render(
        <Player state={state} />,
        document.getElementById('screen')
      );
    }
  },
  render() {
    this.listenForFocusOnWebPlayer(); // Start waiting to hear back from Demo.WebPlaybackSDK
    Demo.transferPlayback();          // Transfer playback to SDK (via Connect Web API over HTTP)
    return this.waitingToStart();     // Render a waiting screen
  }
});

var PlayerError = React.createClass({
  render () {
    return (
      <div className="screen screen-error">
        <div className="alert alert-danger">
          <h3>{this.props.heading}</h3>
          <p>{this.props.message}</p>
        </div>
      </div>
    );
  }
});

var Player = React.createClass({
  current_track() {
    return this.props.state.track_window.current_track;
  },
  render() {
    let track = this.current_track();
    let image = track.album.images[2];

    return (
      <div className="screen screen-player">
        <div className="player">
          <div className="row">
            <div className="col-sm-3">
              <PlayerAlbumArt image_url={image.url} />
            </div>
            <div className="col-sm-9">
              <PlayerProgress state={this.props.state} showPosition={true} showDuration={true} />
              <PlayerTrack track={track} />
              <PlayerArtists artists={track.artists} />
              <PlayerControls state={this.props.state} />
            </div>
          </div>
        </div>

        <PlayerBackgroundAlbumArt image_url={image.url} />
      </div>
    );
  }
});

var PlayerProgress = React.createClass({
  parseTime (seconds) {
    seconds = seconds / 1000;
    return [
        parseInt(seconds / 60 % 60),
        parseInt(seconds % 60)
    ].join(":").replace(/\b(\d)\b/g, "0$1");
  },
  renderPosition () {
    if (this.props.showPosition === true) {
      return (<span className="position">{this.parseTime(this.props.state.position)}</span>);
    } else {
      return null;
    }
  },
  renderDuration () {
    if (this.props.showDuration === true) {
      return (<span className="duration">{this.parseTime(this.props.state.duration)}</span>);
    } else {
      return null;
    }
  },
  render () {
    let progress_perc    = (this.props.state.position / this.props.state.duration) * 100;
    let styles           = {'width': progress_perc + '%'};

    return (
      <div className="player player-progress">
        {this.renderPosition()}
        <span className="progress-bar" style={styles}></span>
        {this.renderDuration()}
      </div>
    );
  }
});

var PlayerAlbumArt = React.createClass({
  render () {
    return (
      <div className="player player-album-art">
        <img src={this.props.image_url} />
      </div>
    );
  }
});

var PlayerTrack = React.createClass({
  parseTrackName () {
    return this.props.track.name.split("(feat")[0];
  },
  render () {
    return (<h1 className="player player-track">{this.parseTrackName()}</h1>);
  }
});

var PlayerAlbum = React.createClass({
  parseAlbumName () {
    return this.props.track.name.split("(feat")[0];
  },
  render () {
    return (<h1 className="player player-track">{this.parseTrackName()}</h1>);
  }
});

var PlayerArtists = React.createClass({
  renderArtists () {
    return this.props.artists.map((artist) => {
      return (<li>{artist.name}</li>);
    });
  },
  render () {
    return (<ul className="player player-artists">{this.renderArtists()}</ul>);
  }
});

var PlayerControls = React.createClass({
  resume() {
    Demo.WebPlaybackSDK.resume();
  },
  pause() {
    Demo.WebPlaybackSDK.pause();
  },
  previousTrack() {
    Demo.WebPlaybackSDK.previousTrack();
  },
  nextTrack() {
    Demo.WebPlaybackSDK.nextTrack();
  },
   mute() {
     Demo.WebPlaybackSDK.setVolume(0);
   },
   setVolumeToMax() {
     Demo.WebPlaybackSDK.setVolume(1);
   },
   reverse15Seconds() {
     let position_ms = this.props.state.position - (15 * 1000);
     Demo.WebPlaybackSDK.seek(position_ms);
   },
   skip15Seconds() {
     let position_ms = this.props.state.position + (15 * 1000);
     Demo.WebPlaybackSDK.seek(position_ms);
   },
   startFromBeginning() {
     Demo.WebPlaybackSDK.seek(0);
   },
  renderPlayOrPause() {
    if (this.props.state.paused === true) {
      return (<li><a onClick={this.resume} className="fa fa-play"></a></li>);
    } else {
      return (<li><a onClick={this.pause} className="fa fa-pause"></a></li>);
    }
  },
  render () {
    let track_id = this.props.state.track_window.current_track.id;
    let track_url = "https://open.spotify.com/track/" + track_id;

    // Checks whether the user is a host or listerner and returns the button configuration
    if (Demo.is_host) {
      return (
          <ul className="player player-controls">
            <li><a onClick={this.previousTrack} className="fa fa-fast-backward"></a></li>
            <li><a onClick={this.mute} className="fa fa-chevron-circle-left "></a></li>
            <li><a onClick={this.startFromBeginning} className="fa fa-repeat "></a></li>
          {this.renderPlayOrPause()}
            <li><a onClick={this.skip15Seconds} className="fa fa-chevron-circle-right "></a></li>
            <li><a onClick={this.nextTrack} className="fa fa-fast-forward"></a></li>
            <li><a onClick={this.mute} className="fa fa-volume-off"></a></li>
            <li><a onClick={this.setVolumeToMax} className="fa fa-volume-up "></a></li>
          </ul>
      );
    }
    return (
      <ul className="player player-controls">
        <li><a onClick={this.mute} className="fa fa-chevron-circle-left "></a></li>
      </ul>
    );
  }
});

var PlayerBackgroundAlbumArt = React.createClass({
  render() {
    let style = {
      backgroundImage: `url(${this.props.image_url})`,
      backgroundSize: '200% auto',
      backgroundPosition: 'center center'
    };

    return (<div className="screen screen-player-album-art" style={style}></div>);
  }
});

/********************************
 ********************************
 **** RENDER OUR APPLICATION ****
 ********************************
 ********************************/

if (Demo.isAccessToken() === false) {
  ReactDOM.render(<Authorize />, document.getElementById('screen'));
}

Demo.onSpotifyPlayerConnected = (data) => {
  ReactDOM.render(<ConnectPlayer />, document.getElementById('screen'));
};

Demo.onSpotifyUserSessionExpires = () => {
  Demo.WebPlaybackSDK.disconnect(); // Disconnect the player

  ReactDOM.render(
    <div>
      <PlayerError
        heading="Session expired."
        message="Playback sessions only last 60 minutes. Refresh for new session." />
      <Authorize />
    </div>,
    document.getElementById('screen')
  );
};

Demo.renderWebPlaybackSDKError = (title, e) => {
  ReactDOM.render(
    <PlayerError heading={title} message={e} />,
    document.getElementById('screen')
  );
};
