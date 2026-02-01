const statusDiv = document.getElementById("status");
// const angleText = document.getElementById("angle");

let lastPosture = "good";
let lastAlertTime = 0; 


const alertSound = document.getElementById("chimeAudio");
const enableBtn = document.getElementById("enableSound");

let soundEnabled = false;

enableBtn.addEventListener("click", () => {
  alertSound.play().then(() => {

    alertSound.pause();
    alertSound.currentTime = 0;
    soundEnabled = true;
    enableBtn.style.display = "none";
  });
});


statusDiv.textContent = "Waiting for posture data...";
statusDiv.className = "waiting";

const socket = new WebSocket("ws://localhost:8080");

socket.onmessage = function(event) {
  const data = event.data.trim().toLowerCase(); // trim whitespace and lowercase
  let currentPosture = lastPosture; 
  
  if (data.includes("good")) {
    statusDiv.textContent = "Good Posture";
    statusDiv.className = "good";
    currentPosture = "good";

  } else if (data.includes("slouch")) {
    statusDiv.textContent = "Fix Your Posture";
    statusDiv.className = "bad";
    currentPosture = "bad";
  
    if (
      lastPosture === "good" &&
      soundEnabled &&
      Date.now() - lastAlertTime > 2000
    ) {
      alertSound.currentTime = 0;
      alertSound.play();
      lastAlertTime = Date.now();
    }



  } else {
    // Optional: show angle if Arduino sends a number
    // angleText.text
    // Content = "Angle: " + data;
  }

  lastPosture = currentPosture;

  
};

