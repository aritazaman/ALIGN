const statusDiv = document.getElementById("status");
const angleText = document.getElementById("angle");

statusDiv.textContent = "Waiting for posture data...";
statusDiv.className = "waiting";

const socket = new WebSocket("ws://localhost:8080");

// socket.onmessage = function(event) {
//   const data = event.data;

//   if (data === "good") {
//     statusDiv.textContent = "Good Posture";
//     statusDiv.className = "good";
//   } else if (data === "slouch") {
//     statusDiv.textContent = "Bad Posture";
//     statusDiv.className = "bad";
//   } else {
//     // If Arduino sends angle numbers later
//     angleText.textContent = "Angle: " + data;
//   }
// };

socket.onmessage = function(event) {
  const data = event.data.trim().toLowerCase(); // trim whitespace and lowercase

  if (data.includes("good")) {
    statusDiv.textContent = "Good Posture";
    statusDiv.className = "good";
  } else if (data.includes("slouch")) {
    statusDiv.textContent = "Fix Your Posture";
    statusDiv.className = "bad";
  } else {
    // Optional: show angle if Arduino sends a number
    angleText.textContent = "Angle: " + data;
  }
};

