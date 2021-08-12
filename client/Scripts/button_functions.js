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
    document.getElementById('settings').style.display = "none";
    document.getElementById('game').style.display = "grid";
}

// Quit Game Button
function funcQuitGame() {
    location.reload();
}
