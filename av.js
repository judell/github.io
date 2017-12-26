/*
examples:
  <span class="arrow" onclick="nudge('end','sec',1)">
  <span class="arrow" onclick="nudge('start','min',-1)">
*/
function nudge(boundary, unit, amount) {
  console.log('nudge', boundary, unit, amount);

  if ( boundary == 'start' && isStartLocked() ) {
    return;
  }

  if ( boundary == 'end' && isEndLocked() ) {
    return;
  }

  var targetId = boundary + unit;
  var boundaryValue = getFieldValue(targetId) + amount;
  setField(targetId, boundaryValue);

  if ( amount == -1 ) {
    if ( boundaryValue < 0  && unit == 'min') {
		setField(targetId, 0);
    }
    if ( boundaryValue < 0  && unit == 'sec') {
        setField(targetId, 59);
		var otherTargetId = boundary + 'min';
		var minutes = getFieldValue(otherTargetId);
		minutes -= 1;
        setField(otherTargetId, (minutes<0) ? 0 : minutes);
    }
  }

  if ( boundary == 'start' ) {
    console.log('nudge, playCurrentParams()');
    playCurrentParams();
  }
}

function getCurrentMinSec(player) {
  var currentMin = Math.floor(player.currentTime/60);
  var currentSec = Math.floor(player.currentTime) - (currentMin * 60);
  return {
    currentMin: currentMin,
    currentSec: currentSec,
  }
}

function getDuration(player) {
  return minutesAndSecondsFromSeconds(player.duration);
}

function getLockState() {
  return {
    startLocked: document.getElementById('startlocked').checked,
    endLocked: document.getElementById('endlocked').checked,
  }
}

function setLockState(id, isLocked) {
  console.log('setLockState', id, isLocked);
  document.getElementById(id).checked = isLocked;
  var controlsClass = ( id == 'startlocked' ) ? '.start-controls' : '.end-controls';
  console.log('controlsClass', controlsClass);
  document.querySelectorAll(controlsClass + ' .arrow').forEach(function(e) {
    e.style.color = isLocked ? "gray" : "black";
  })
}

function isStartLocked() {
  var { startLocked } = getLockState();
  return startLocked;
}

function isEndLocked() {
  var { endLocked } = getLockState();
  return endLocked;
}

function isBothLocked() {
  var {startLocked, endLocked } = getLockState();
  return ( startLocked === true && endLocked === true );
}

function changeControlsColor(checkboxId, controlsClass) {
  var checkbox = document.getElementById(checkboxId);
  document.querySelectorAll(controlsClass + ' .arrow').forEach(function(e) {
    e.style.color = checkbox.checked ? "gray" : "black";
  })
}

function getFieldValue(id, value) {
  var retVal = document.getElementById(id).value;
  if ( isNaN(retVal) ) {
    return retVal	  
  }
  else {
    return parseInt(retVal);
  }
}

function handleFieldChange() {
  updatePermalink();
  maybeShowPlayButton();
}

function getFieldValues() {
  var url = getFieldValue('url');

  var startmin = getFieldValue('startmin');
  startmin = parseNumber(startmin);

  var startsec = getFieldValue('startsec');
  startsec = parseNumber(startsec);

  var endmin = getFieldValue('endmin');
  endmin = parseNumber(endmin);

  var endsec = getFieldValue('endsec');
  endsec = parseNumber(endsec);

  var startlocked = document.getElementById('startlocked').checked;
  var endlocked = document.getElementById('endlocked').checked;

  return {
    url: url,
    startmin: startmin, 
	startsec: startsec,
    endmin: endmin, 
    endsec: endsec, 
    startlocked: startlocked,
    endlocked: endlocked,
  }
}

function setField(id, value) {
  document.getElementById(id).value = value;
}

function setFields(url, startmin, startsec, endmin, endsec, startlocked, endlocked) {
  document.getElementById('url').value = url;

  document.getElementById('startmin').value = startmin;
  document.getElementById('startsec').value = startsec;

  document.getElementById('endmin').value = endmin;
  document.getElementById('endsec').value = endsec;

  document.getElementById('startlocked').value = startlocked;
  document.getElementById('endlocked').value = endlocked;
}

function playCurrentParams() {
  updatePermalink();
  var { url, startmin, startsec, endmin, endsec } = getFieldValues();
  play(url, startmin, startsec, endmin, endsec);
}

function playIntro() {
  var { url, startmin, startsec, endmin, endsec } = getFieldValues();
  var t = minutesAndSecondsToSeconds(startmin, startsec);
  t += 3;
  var end = secondsToMinutesAndSeconds(t);
  play(url, startmin, startsec, end.min, end.sec, true);
}

function playOutro() {
  var { url, startmin, startsec, endmin, endsec } = getFieldValues();
  var t = minutesAndSecondsToSeconds(endmin, endsec);
  t -= 3;
  var start = secondsToMinutesAndSeconds(t);
  play(url, start.min, start.sec, endmin, endsec, true);
}

function maybeShowPlayButtons() {
  var playIntroButton = document.getElementById('play-clip-intro');
  var playClipButton = document.getElementById('play-clip-all');
  var playOutroButton = document.getElementById('play-clip-outro');
  var buttons = [playClipButton, playIntroButton, playOutroButton];

  buttons.forEach (function (b) {
    if ( isBothLocked() ) {
      b.style.visibility = 'hidden';
    }
    else {
      b.style.visibility = 'visible';
	}
  });
}

function updatePermalink() {
  var { url,
        startmin, 
        startsec,
        endmin, 
        endsec,
        startlocked,
        endlocked } = getFieldValues();

  var href = `${mode}.html?url=${url}&startmin=${startmin}&startsec=${startsec}&endmin=${endmin}&endsec=${endsec}`;

  document.getElementById('permalinkHref').href = href;

  document.getElementById('permalinkText').innerText = href;
}

function secondsToMinutesAndSeconds(seconds) {
  var min = parseInt(seconds / 60, 10);
  var sec = parseInt(seconds % 60);
  return { min, sec };
}

function minutesAndSecondsToSeconds(min, sec) {
  var seconds = (60 * min) + sec;
  return seconds;
}

function parseNumber (value) {
  return ( value == '' ) ? 0 : parseInt(value);
} 

function play(url, startmin, startsec, endmin, endsec, isIntro) {
  var container = document.getElementById('container');
  player = document.getElementById('player');
  player.remove();
  player = document.createElement(`${mode}`);
  player.id = "player";
  player.controls = "controls";
  player.autoplay = "autoplay";
  player.style["width"] = "100%";

  var source = source = document.createElement('source');
  source.id = 'source';
  source.src = url;

  player.appendChild(source);
  container.appendChild(player);

  var t = minutesAndSecondsToSeconds(startmin, startsec);
  player.currentTime = t;

  console.log(`url ${url}, startmin ${startmin}, startsec ${startsec}, endmin ${endmin}, endsec ${endsec}, t ${t}`);

  player.onseeked = function () {

    if ( ! isStartLocked() ) {
      adjustStart(player);
    }
    else {
      adjustEnd(player);
    }

    if ( endmin > 0 && endsec > 0 ) {
      player.ontimeupdate = function() {
        if ( player.currentTime > minutesAndSecondsToSeconds(endmin, endsec) ) {
          player.pause();
        }
	  }
    }

  }
}

function adjustStart(player) {

   if ( isStartLocked() ) {
    return;  
  }
  
  var { currentMin, currentSec } = getCurrentMinSec(player);
  document.getElementById('startmin').value = currentMin;
  document.getElementById('startsec').value = currentSec;
  updatePermalink();
}

function adjustEnd(player) {

  if ( isEndLocked() ) {
    return;  
  }

  console.log('player.currentTime', player.currentTime);
  var { startmin, startsec, endmin, endsec } = getFieldValues();
  var start = minutesAndSecondsToSeconds(startmin, startsec);

  var { currentMin, currentSec } = getCurrentMinSec(player);
  var current = minutesAndSecondsToSeconds(currentMin, currentSec);

  if ( current >= start ) {
    document.getElementById('endmin').value = currentMin;
    document.getElementById('endsec').value = currentSec;
  } 
  else {
    document.getElementById('endmin').value = startmin;
    document.getElementById('endsec').value = startsec;
    player.currentTime = current;
  }

  updatePermalink();
}

function gup(name, str) {
    if (! str) 
        str = window.location.href;
    else
        str = '?' + str;
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regexS = "[\\?&]" + name + "=([^&#]*)";
    var regex = new RegExp(regexS);
    var results = regex.exec(str);
    if (results == null)
        return "";
    else
        return results[1];
}

/// -------------

var urlLabel = `
<p class="url-label">
<span class="label">url&nbsp;</span> <input size="60" onchange="playCurrentParams();" id="url">
</p>`;

var params = `
<table>

<tr>
  <td class="label">start</td>
  <td class="start-controls">
    <div>
      <span class="unit">min</span> <input size="3" class="min-or-sec" onchange="handleFieldChange()" id="startmin"> <span class="arrow left-arrow" onclick="nudge('start','min',-1)">&#9664;</span> <span class="arrow" onclick="nudge('start','min',1)">&#9654;</span> 
    </div>
    <div>
      <span class="unit">sec</span> <input size="3" class="min-or-sec" onchange="handleFieldChange()" id="startsec"> <span class="arrow left-arrow" onclick="nudge('start','sec',-1)">&#9664;</span> <span class="arrow" onclick="nudge('start','sec',1)">&#9654;</span> 
    </div>
  </td> 
  <td><input id="startlocked" onchange="changeControlsColor('startlocked','.start-controls')" type="checkbox"> locked</td>
</tr>

<tr>
  <td class="label">end</td>
  <td class="end-controls">
    <div>
      <span class="unit">min</span> <input size="3" class="min-or-sec" onchange="handleFieldChange()" id="endmin"> <span class="arrow left-arrow" onclick="nudge('end','min',-1)">&#9664;</span> <span class="arrow" onclick="nudge('end','min',1)">&#9654;</span>
    </div>
    <div>
      <span class="unit">sec</span> <input size="3" class="min-or-sec" onchange="handleFieldChange()" id="endsec"> <span class="arrow left-arrow" onclick="nudge('end','sec',-1)">&#9664;</span> <span class="arrow" onclick="nudge('end','sec',1)">&#9654;</span>
    </div>
  </td> 
  <td><input id="endlocked" onchange="changeControlsColor('endlocked','.end-controls')" type="checkbox"> locked</td>
</tr>

</table>`;

var controls = `
<div id="controls" class="play-clip-controls-container">
<table width="100%">
<tr>
<td class="play-clip play-clip-intro">
<button onclick="playIntro()" id="play-clip-intro">play clip intro</button>
</td>
<td class="play-clip play-clip-all">
<button onclick="playCurrentParams()" id="play-clip-all">play clip</button>
</td>
<td class="play-clip play-clip-outro">
<button onclick="playOutro()" id="play-clip-outro">play clip outro</button>
</td>
</tr>
</table>
</div>
`;

var permalink = `
<div class="permalink">
<p>
<a id="permalinkHref" href="">link</a> to these settings
</p>
<p id="permalinkText"></p>
</div>
`;

document.getElementById('url-label').innerHTML = urlLabel;

document.getElementById('params').innerHTML = params;

document.getElementById('permalink').innerHTML = permalink;

document.getElementById('controls').innerHTML = controls;

var player = document.getElementById('player');

var url = gup('url');

var startmin = gup('startmin');
startmin = parseNumber(startmin);

var startsec = gup('startsec');
startsec = parseNumber(startsec);

var endmin = gup('endmin');
endmin = parseNumber(endmin);

var endsec = gup('endsec');
endsec = parseNumber(endsec);

setFields(url, startmin, startsec, endmin, endsec);

//startlocked = gup('startlocked') === 'true';
setLockState('startlocked', true);

//endlocked = gup('endlocked') === 'true';
setLockState('endlocked', true);


/*
 * wait for player to be ready to report duration, also wait for
 * doctitle to be adjusted, defer option to separate these concerns
 */
setTimeout( function() {

  // duration

  var { min, sec } = secondsToMinutesAndSeconds(player.duration);

  var endmin = getFieldValue('endmin');

  if (endmin == 0) {
      setField('endmin', min);
  }

  var endsec = getFieldValue('endsec');

  if (endsec == 0) {
      setField('endsec', sec);
  }

  // doctitle

  var re = new RegExp(/url=([^&]+)&startmin=([^&]+)&startsec=([^&]+)&endmin=([^&]+)&endsec=([^&]+)/);

  var match = re.exec(location.href);

  try {
    var newtitle = `${match[1]} from ${match[2]}:${match[3]} to ${match[4]}:${match[5]}`;
    var doctitle = document.querySelector('head title');
    var permalink = document.getElementById('permalinkText');
    doctitle.innerText = newtitle;
  }
  catch (e) {
  }
  
}, 500);

// adjust fields as playhead moves
setInterval( function() {

  maybeShowPlayButtons();

  updatePermalink();

  if ( isBothLocked() ) {
    return;
  }

  if ( ! isStartLocked() ) {
    adjustStart(player);
  }
  else {
//    adjustEnd(player);
  }

}, 250);

updatePermalink();

play(url, startmin, startsec, endmin, endsec);
player.pause();

