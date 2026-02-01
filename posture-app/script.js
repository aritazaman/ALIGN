const ctx = document.getElementById("postureChart").getContext("2d");


const postureChart = new Chart(ctx, {
  type: "line",
  data: {
    labels: [],
    datasets: [{
      label: "Y-Axis Acceleration (AY)",
      data: [],
      borderColor: "#6b1e58",
      backgroundColor: "rgba(107, 30, 88, 0.1)",
      borderWidth: 2,
      tension: 0.25,
      pointRadius: 0
    }]
  },
  options: {
    animation: false,
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        title: {
          display: true,
          text: "Time"
        }
        
      },
      y: {
        title: {
          display: true,
          text: "AY Value"
        }
      }
    }
  }
});

const statusDiv = document.getElementById("status");
// const angleText = document.getElementById("angle");

let lastPosture = "good";
let lastAlertTime = 0; 
let sessionActive = true;



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

const endSessionBtn = document.getElementById("endSessionBtn");

endSessionBtn.addEventListener("click", () => {
  sessionActive = false;
  endSessionBtn.textContent = "Session Ended";
  endSessionBtn.disabled = true;
});



statusDiv.textContent = "Waiting for posture data...";
statusDiv.className = "waiting";

const socket = new WebSocket("ws://localhost:8080");

function addAYPoint(ay) {
  if (!sessionActive) return; // stops updating if session ended

  const timeLabel = new Date().toLocaleTimeString();

  // Add the new point
  postureChart.data.labels.push(timeLabel);
  postureChart.data.datasets[0].data.push(ay);

  // DON'T remove old points — we want all data to stay

  postureChart.update();
}



socket.onmessage = function(event) {
  let currentPosture = lastPosture; 

  const raw = event.data;

  // Example: "AY:15234,STATUS:GOOD"
  const parts = raw.split(",");
  const ayValue = parseInt(parts[0].split(":")[1]);
  const status = parts[1].split(":")[1];
  addAYPoint(ayValue);

  
  if (status === "GOOD") {
  statusDiv.textContent = "Good Posture";
  statusDiv.className = "good";
  currentPosture = "good";
}

  else if (status === "SLOUCH") {
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
  }

  lastPosture = currentPosture;

  
};

