var v = document.querySelectorAll('.yt-lockup-thumbnail .contains-addto');
var lk = ""; for(var x=0;x<v.length;x++) { lk += v[x].childNodes[0].href + "<br/>"; }

var bg = document.createElement("div");
bg.style.position = "fixed";
bg.style.top = "0px";
bg.style.backgroundColor = "rgba(0,0,0,0.8)";
bg.style.width = "100%";
bg.style.height = "100%"
bg.style.zIndex = "99999999999";
bg.onclick = function() { bg.parentNode.removeChild(bg); }

var tx = document.createElement("div");
tx.style.width = "50%";
tx.style.backgroundColor = "#fff";
tx.style.margin = "10px";
tx.style.marginLeft = "auto";
tx.style.marginRight = "auto";
tx.style.padding = "10px";
tx.style.borderRadius = "4px";
tx.innerHTML = lk;

bg.appendChild(tx);
document.documentElement.appendChild(bg);