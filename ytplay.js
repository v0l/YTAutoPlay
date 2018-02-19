// V1.0.0 - Youtube subscriptions auto-play
// 2018-02-19
//
// ABOUT:
//		This script is designed to play all unwatched videos that are loaded on the page
//		It is most usefull for people who have a lot of music channel subscriptions and want to keep up to date
//
// INSTRUCTIONS:
//		Open 'My Subscriptions' on youtube.com
//		Create a bookmark with the following url: javascript:(function(){ var x = document.createElement('script'); x.src = 'https://raw.githubusercontent.com/v0l/YTAutoPlay/master/ytplay.js'; document.getElementsByTagName('body')[0].appendChild(x); }());
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
//		V1.0.0	(2018-02-19) * Recode for current Polymer youtube

(function() {
	this.pagesLoaded = 0;
	this.loadPagesMax = 10;
	this.loadMoreTrigger = 3;
	this.playerWidth = window.innerWidth / 2;
	this.playerHeight = (window.innerHeight / 2) + 44;
	this.VideoQueue = [];
	this.VideoElementTag = document.querySelector('ytd-button-renderer.ytd-menu-renderer[disabled]').data.tooltip === 'Grid' ? 'ytd-grid-video-renderer' : 'ytd-video-renderer';
	
	this.Init = function() {		
		document.querySelector('ytd-section-list-renderer').addEventListener('yt-next-continuation-data-updated', this.LoadMoreCompleted.bind(this));
		this.CollectVids();
	};
	
	this.CollectVids = function() {
		var vids = document.querySelectorAll(this.VideoElementTag);
		var lmt = 0;
		
		for(var x = 0; x < vids.length; x++) {
			var vd = vids[x].data;
			if(!vd.isWatched) {
				lmt = 0;
				this.VideoQueue.push(vd.videoId);
			} else {
				lmt++;
			}
			
			if(lmt >= this.loadMoreTrigger){
				console.log("No more will be loaded, reached threshold " + this.loadMoreTrigger + " videos watched in a row");
				this.StartPlayer();
				break;
			}
		}
		if(this.pagesLoaded < this.loadPagesMax) {
			if(lmt < this.loadMoreTrigger) {
				this.LoadMore();
			}
		} else {
			this.StartPlayer();
			console.log("No more will be loaded, reached threshold loadPagesMax");
		}
	};
	
	this.LoadMoreCompleted = function(ev) {
		setTimeout(function() {
			this.pagesLoaded++;
			this.CollectVids();
		}.bind(this), 100);
	};
	
	this.LoadMore = function() {
		console.log("Loading page: " + this.pagesLoaded);
		document.querySelector("yt-next-continuation").trigger();
	};
	
	this.StartPlayer = function() {
		this.CreateOverlay();
		this.tickInterval = setInterval(this.Tick.bind(this), 1000);
	};
	
	this.Tick = function() {
		var pl = this.GetPlayer();
		var state = pl.getProgressState();
		
		if(state.current >= state.duration){
			this.GetPlayer().loadVideoById(this.VideoQueue.pop());
			this.UpdateStatus();
		}
	};
	
	this.GetPlayer = function(){
		return this.player.contentDocument.querySelector('#player').firstChild;
	};
	
	this.UpdateStatus = function() {
		this.Status.innerHTML = this.VideoQueue.length + " videos left";
	};
	
	this.CreateOverlay = function(){
		//Container
		var pl = document.createElement('div');
		pl.id = 'sapPlayer';
		pl.style.width = this.playerWidth + "px";
		pl.style.height = this.playerHeight + "px";
		pl.style.top = "0px";
		pl.style.marginLeft = ((window.innerWidth / 2) - (this.playerWidth / 2)) + "px";
		pl.style.marginRight = "auto";
		pl.style.marginTop = ((window.innerHeight / 2) - (this.playerHeight / 2)) + "px";
		pl.style.position = "fixed";
		pl.style.border = "1px solid #888";
		pl.style.borderRadius = "5px";
		pl.style.zIndex = "9999999999";
		pl.style.backgroundColor = "rgba(0,0,0,0.8)";
		pl.style.padding = "10px";
		pl.style.color = "#fff";
		
		//Skip
		var sk = document.createElement('div');
		sk.style.backgroundImage = "url('https://raw.githubusercontent.com/google/material-design-icons/master/navigation/1x_web/ic_chevron_right_white_24dp.png')";
		sk.style.width = "24px";
		sk.style.height = "24px";
		sk.style.float = "left";
		sk.onclick = function() { 
			this.GetPlayer().loadVideoById(this.VideoQueue.pop());
			this.UpdateStatus();
		}.bind(this);
		
		pl.appendChild(sk);

		//status
		this.Status = document.createElement('div');
		this.Status.style.float = "left";
		this.Status.style.lineHeight = "24px";
		pl.appendChild(this.Status);
		
		this.player = document.createElement('iframe');
		this.player.style.width = this.playerWidth + "px";
		this.player.style.height = (this.playerHeight - 34) + "px";
		this.player.style.border = "none";
		this.player.src = "https://www.youtube.com/embed/" + this.VideoQueue.pop() + "?autoplay=1&enablejsapi=1";
		pl.appendChild(this.player);
		
		this.UpdateStatus();
		
		document.querySelector('body').appendChild(pl);
	};
	
	this.Init();
})();