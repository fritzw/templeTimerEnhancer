// ==UserScript==
// @name       Guild Wars Temple Timer Enhancer
// @namespace  http://webering.eu/
// @version    0.1
// @description  Enhance the Guild Wars Temple dragon timers, especially add audio notifications.
// @include      http://guildwarstemple.com/apps/timers.php
// @copyright  2013, Fritz Webering
// ==/UserScript==

// Some helper functions
function reload() { window.location = location.href; }
function now() { return Math.round(new Date().getTime() / 1000); }
function playSound() { document.getElementById('audioplayer').play(); }

// Reload Page every 10 seconds
setTimeout(reload, 10000);

// Add audio player to page
var player = document.createElement("audio");
player.preload = 'auto';
player.id = 'audioplayer';
player.innerHTML = '<source src="http://blamestar.de/files/beep.ogg" type="audio/ogg" />'+
    '<source src="http://blamestar.de/files/beep.mp3" type="audio/mp3" />';
document.body.appendChild(player);


// Functions to determine the state of the timers
var isEventActive, isTimerExpired;

// Whether we are running the "App Timers" or the classic dragon timers
var classicMode = false;

if (!classicMode) {
	isTimerExpired = function(timerNumber) {
        var timer = document.getElementById('dragon' + timerNumber + 'timer');
        console.debug('dragon' + timerNumber + 'timer color: ' + timer.style.color);
        return timer.style.color == 'rgb(255, 255, 0)';
    };
    
    isEventActive = function(timerNumber) {
        var div = document.getElementById('e' + timerNumber);
        var active = div.getElementsByClassName('active_event')[0];
        console.debug('dragon' + timerNumber + 'timer active: ' + active.innerText);
        return Number(active.innerText) > 0;
    };
} else /* if (classicMode) */ {
    // TODO
}

// Check all timers
var i;
for (i = 1; i <= 12; i++) {
    var expired = isTimerExpired(i);
    var active = isEventActive(i);
    var play = 0;
    var rare_daily = document.getElementById('e' + i).getElementsByClassName('rare_opened').length > 0;
    
    // Reset values after 5 Hours
    if (now() - Number(GM_getValue('timer'+i+'timestamp')) > 60*60*10) {
        console.debug('timestamp for timer'+i+' expired');
        GM_setValue('timer'+i+'expired', 'false');
        GM_setValue('timer'+i+'active', 'false');
    }
	
	// Check if the timer just expired
    if (!rare_daily && GM_getValue('timer'+i+'expired') != 'true' && expired) {
        console.debug('timer'+i+' expired');
        GM_setValue('timer'+i+'expired', 'true');
        GM_setValue('timer'+i+'timestamp', String(now()));
 		// Beep once
       play = Math.max(play, 1);
    } else if (GM_getValue('timer'+i+'expired') == 'true' && !expired) {
        GM_setValue('timer'+i+'expired', 'false');
    }
    
	// Check if someone marked the event as active
    if (!rare_daily && GM_getValue('timer'+i+'active') != 'true' && active) {
        GM_setValue('timer'+i+'active', 'true');
        GM_setValue('timer'+i+'timestamp', String(now()));
		// Beep twice
        play = Math.max(play, 2);
    } else if (GM_getValue('timer'+i+'active') == 'true' && !active) {
        GM_setValue('timer'+i+'active', 'false');
    }
	
	// Play the beep sound once as many times as necessary
    for (play; play > 0; play--) {
        setTimeout(playSound, play * 1000);
    }
}
