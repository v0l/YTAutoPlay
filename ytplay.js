// V0.4.8 - Youtube smart playlist
// 2016-11-24
//
// ABOUT:
//		This script is designed to play all unwatched videos that are loaded on the page
//		It is most usefull for people who have a lot of music channel subscriptions and want to keep up to date
//		For suggestions and bug reports please email kieran at harkin dot me
//
// INSTRUCTIONS:
//		Open 'My Subscriptions' on youtube.com
//		Create a bookmark with the following url: javascript:(function(){ var x = document.createElement('script'); x.src = 'https://raw.githubusercontent.com/KieranH92/helpers/master/ytplay.js'; document.getElementsByTagName('body')[0].appendChild(x); }());
//		Click the new bookmark
//
// CHANGELOG:
//		V0.1 	(2014-11-19) * Initial version.
//		V0.2 	(2015-01-13) * Fixed youtube changing HTML to add a class to denote watched status.
//		V0.3 	(2015-02-03) * Changed to use object YTPlay.
//						  	 * Removed dependency on jQuery all native Javascript now.
//						  	 * Added extra functionality (play/pause/prev)
//						  	 * Switched to inline div with iFrame player instead of popout window.
//		V0.4 	(2015-02-04) * Removed timer for song switching.
//						  	 * Added youtube iFrame API for video state change.
//						  	 * Added automatic video loading.
//						  	 * Added status label on window.
//						  	 * Set window size to 1/2 screen size.
//		V0.4.1	(2015-02-04) * Fixed bug with loadMore not loading if less than 1 page of videos not watched.
//		V0.4.2	(2015-02-16) * Fixed bug with load more button max.
//		V0.4.3	(2015-04-16) * Class name for videos changed
//		V0.4.4	(2015-04-29) * Added video link to window
//		V0.4.5	(2015-11-04) * Added video count to video title
//		V0.4.6	(2015-11-18) * Fixed icon links
//		V0.4.7	(2015-12-14) * Added null check for ytplayer in tick function
//							 * Removed iframe url change, used build in playVideo function
//		V0.4.8	(2016-11-24) * Changed youtube watched marker class

var YTPlay = {
	vidClass: "yt-lockup-thumbnail contains-addto",
	cvid: 0,
	vids: [],
	tmLength: null,
	tmEnd: null,
	pauseTime: 5,
	blockPlayer: true,
	loadAll: false,
	paused: false,
	maxVids: 100,
	watchThreshold: 3,
	playerWidth: window.innerWidth / 2,
	playerHeight: (window.innerHeight / 2) + 44,
	
	getPlayer: function() {
		var ytplayer_window = document.getElementById("playerFrame").contentWindow;
		return ytplayer_window.yt !== undefined ? ytplayer_window.yt.player.getPlayerByElement(ytplayer_window.player) : null;
	},
	paseTime: function(sec){
		var mins = Math.floor(sec / 60.0);
		var secs = Math.floor(sec % 60);
		
		return mins + ":" + (secs < 10 ? '0' + secs : secs)
	},
	tick: function() {
		var ytplayer = YTPlay.getPlayer();
		if(ytplayer !== undefined && ytplayer !== null)
		{
			var state = ytplayer.getProgressState();
			var data = ytplayer.getVideoData();
			
			if(state.current >= state.duration){
				YTPlay.next();
			}else{
				YTPlay.status("Now playing: <a href=\"https://www.youtube.com/watch?v=" + data.video_id + "\" target=\"_blank\">" + (data.title.length > 50 ? data.title.substring(0,50) + "..." : data.title) + " (" + YTPlay.paseTime(state.current) + " / " + YTPlay.paseTime(state.duration) + ")</a> <small>(" + YTPlay.cvid + "/" + YTPlay.vids.length + ")</small>");
			}
		}
	},
	loadMore: function(){
		var thumbs = document.getElementsByClassName(YTPlay.vidClass);
		var idx = 0;
		for(var t_i = 0; t_i < thumbs.length; t_i++){
			if(YTPlay.loadAll){
				idx = thumbs.length < YTPlay.maxVids ? 0 : YTPlay.watchThreshold;
			}else {
				if(thumbs[t_i].getAttribute("class").indexOf('contains-percent-duration-watched') >= 0){
					idx++;
					
					if(idx >= YTPlay.watchThreshold){
						break;
					}
				}else{
					idx = 0;
				}
			}
		}

		if(idx <= YTPlay.watchThreshold - 1){
			YTPlay.status("Loading more videos... (" + thumbs.length + ")");
			var btns = document.getElementsByClassName('load-more-button');
			if(btns.length > 0){
				btns[0].click();
				setTimeout(YTPlay.loadMore,1000);
			}else{
				YTPlay.initDone();
			}
		}else {
			YTPlay.initDone();
		}
	},
	skip: function(){
		
		YTPlay.next();
	},
	pause: function(){
		//Change button styles
		var btn = document.getElementById("pauseButton");
		btn.style.backgroundImage = "url('https://raw.githubusercontent.com/google/material-design-icons/master/av/1x_web/ic_play_arrow_white_24dp.png')";
		btn.onclick = function() { YTPlay.resume(); };
		
		YTPlay.paused = true;
		YTPlay.getPlayer().pauseVideo();
	},
	resume: function(){
		if(YTPlay.paused){
			//Change button styles
			var btn = document.getElementById("pauseButton");
			btn.style.backgroundImage = "url('https://raw.githubusercontent.com/google/material-design-icons/master/av/1x_web/ic_pause_white_24dp.png')";
			btn.onclick  = function() { YTPlay.pause(); };
			
			YTPlay.paused = false;
			YTPlay.getPlayer().playVideo();
		}else{
			YTPlay.status("Can't resume if the video was never paused");
		}
	},
	prev: function() {
		if(YTPlay.cvid + 2 >= YTPlay.vids.length){
			YTPlay.status("Can't go back any further, please load more videos to go back further");
		}else {
			YTPlay.cvid+=2;
			YTPlay.skip();
		}
	},
	next: function(){
		if(YTPlay.cvid >= 0){
			var v = YTPlay.vids[YTPlay.cvid];
			
			var btn = document.getElementById("pauseButton");
			btn.style.backgroundImage = "url('https://raw.githubusercontent.com/google/material-design-icons/master/av/1x_web/ic_pause_white_24dp.png')";
			btn.onclick  = function() { YTPlay.pause(); };
			
			var pl = YTPlay.getPlayer();
			if(pl === null){
				document.getElementById("playerFrame").src = "https://www.youtube.com/embed/" + v + "?autoplay=1&controls=0&enablejsapi=1";
			}else{
				YTPlay.getPlayer().loadVideoById(v);
			}
			
			YTPlay.cvid--;
		}else{
			YTPlay.status("All vids watched - removing embedded controls");
			YTPlay.close();
		}
	},
	status: function(msg){
		var st = document.getElementById('statusLabel');
		if(st != null) {
			st.innerHTML = msg;
		}
	},
	close: function() {
		var div = document.getElementById("playControls");
		div.parentNode.removeChild(div);
	},
	initIFramePlayWindow: function() {
		if(YTPlay.blockPlayer){
			var gl = document.createElement('div');
			gl.style.width = YTPlay.playerWidth + "px";
			gl.style.height = (YTPlay.playerHeight - 34) + "px";
			gl.style.marginTop = "34px";
			gl.style.position = "absolute";
			document.getElementById('playControls').appendChild(gl);
		}
		var player = document.createElement('iframe');
		player.style.width = YTPlay.playerWidth + "px";
		player.style.height = (YTPlay.playerHeight - 34) + "px";
		player.id = "playerFrame";
		player.frameborder = "0";
		player.src = "";
		
		document.getElementById('playControls').appendChild(player);
	},
	initPlayControls: function() {
		//Container
		var pl = document.createElement('div');
		pl.id = 'playControls';
		pl.style.width = YTPlay.playerWidth + "px";
		pl.style.height = YTPlay.playerHeight + "px";
		pl.style.top = "0px";
		pl.style.marginLeft = ((window.innerWidth / 2) - (YTPlay.playerWidth / 2)) + "px";
		pl.style.marginRight = "auto";
		pl.style.marginTop = ((window.innerHeight / 2) - (YTPlay.playerHeight / 2)) + "px";
		pl.style.position = "fixed";
		pl.style.border = "1px solid #888";
		pl.style.borderRadius = "5px";
		pl.style.zIndex = "9999999999";
		pl.style.backgroundColor = "rgba(0,0,0,0.8)";
		pl.style.padding = "10px";
		pl.style.color = "#fff";
		
		//Prev
		var pr = document.createElement('div');
		pr.style.backgroundImage = "url('https://raw.githubusercontent.com/google/material-design-icons/master/navigation/1x_web/ic_chevron_left_white_24dp.png')";
		pr.style.width = "24px";
		pr.style.height = "24px";
		pr.style.float = "left";
		pr.style.marginBottom = "10px";
		pr.onclick = function() { YTPlay.prev(); };
		pl.appendChild(pr);
		
		//Pause
		var ps = document.createElement('div');
		ps.id = "pauseButton";
		ps.style.backgroundImage = "url('https://raw.githubusercontent.com/google/material-design-icons/master/av/1x_web/ic_play_arrow_white_24dp.png')";
		ps.style.width = "24px";
		ps.style.height = "24px";
		ps.style.float = "left";
		ps.onclick = function() { YTPlay.pause(); };
		pl.appendChild(ps);
		
		//Skip
		var sk = document.createElement('div');
		sk.style.backgroundImage = "url('https://raw.githubusercontent.com/google/material-design-icons/master/navigation/1x_web/ic_chevron_right_white_24dp.png')";
		sk.style.width = "24px";
		sk.style.height = "24px";
		sk.style.float = "left";
		sk.onclick = function() { YTPlay.next(); };
		pl.appendChild(sk);
		
		//status
		var st = document.createElement('b');
		st.id = "statusLabel";
		st.style.float = "left";
		st.style.lineHeight = "24px";
		pl.appendChild(st);
		
		document.getElementsByTagName('body')[0].appendChild(pl);
	},
	init: function(){
		YTPlay.initPlayControls();
		YTPlay.loadMore();
	},
	initDone: function() {
		var thumbs = document.getElementsByClassName(YTPlay.vidClass);
		for(var t_i = 0; t_i < thumbs.length; t_i++){
			if(thumbs[t_i].getAttribute("class").indexOf('watched') < 0 || YTPlay.loadAll){
				var v = thumbs[t_i].firstChild.getAttribute("href");
				var v_c = v.substring(v.indexOf('?')+3);
				YTPlay.status("Adding vid: " + v_c);
				YTPlay.vids[YTPlay.vids.length] = v_c;
			}
		}
		
		if(YTPlay.vids.length > 0){
			YTPlay.cvid = YTPlay.vids.length - 1;
			YTPlay.initIFramePlayWindow();
			YTPlay.next();
			setInterval(YTPlay.tick,1000);
		}else{
			alert("No videos to watch!");
			YTPlay.close();
		}
	}
};
YTPlay.init();
