// Lifeline Enable / Disable Radio Buttons
function funcLifelineEnable() {
    document.getElementById('ll_Skills').style.display = "block";

    document.getElementById('ll_5050').checked = true;
    document.getElementById('ll_skip').checked = true;

    document.getElementById('ll_Cooldown').value = 10;
}
function funcLifelineDisable() {
    document.getElementById('ll_Skills').style.display = "none";

    document.getElementById('ll_5050').checked = false;
    document.getElementById('ll_skip').checked = false;
}

// Start Game Button
function funcStartGame() {
    // Switch to Game tab
    document.getElementById('settings').style.display = "none";
    document.getElementById('game').style.display = "grid";

    // MAL Username
    var MAListToUse = document.getElementById('MAList').value;

    // Watchtypes
    var listWatchtypes = [];
    if (document.getElementById('wt_Watching').checked) listWatchtypes.push('watching');
    if (document.getElementById('wt_Completed').checked) listWatchtypes.push('completed');
    if (document.getElementById('wt_OnHold').checked) listWatchtypes.push('onhold');
    if (document.getElementById('wt_Dropped').checked) listWatchtypes.push('dropped');
    if (document.getElementById('wt_PTW').checked) listWatchtypes.push('ptw');

    // # of Questions to Setup
    var numOfQuestions = document.getElementById('numQuestions').value;

    // Send packet of MAL Username, Watchtypes, and # of Quqestions to server
    socket.emit('start', {
        MALuser: MAListToUse,
        watchtypes: listWatchtypes,
        numOfQuestions: numOfQuestions
    });

    /*
    socket.on('portrait', function(data) {
        document.getElementById('').src = data.img;
    });
    */
}

// Quit Game Button
function funcQuitGame() {
    location.reload();
}
