const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });
console.log("WebSocket server running on ws://localhost:8080");

// Find Arduino by looking for "COM" port that contains "USB" or "CH340"
async function findArduinoPort() {
  const ports = await SerialPort.list();
  // Filter ports: ignore Bluetooth, find USB-SERIAL CH340
  const arduinoPort = ports.find(p => p.path.includes('COM') && (p.path === 'COM11' || (p.friendlyName && p.friendlyName.includes('CH340'))));
  
  if (!arduinoPort) {
    console.log("All ports found:", ports); // debug output
    throw new Error("Arduino not found! Make sure it's connected and IDE Serial Monitor is closed.");
  }

  console.log("Found Arduino on port:", arduinoPort.path);
  return arduinoPort.path;
}

async function startServer() {
  try {
    const portPath = await findArduinoPort(); // Should now return COM12
    const port = new SerialPort({ path: portPath, baudRate: 9600 });
    const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

    let latestPosture = "unknown";

    parser.on('data', (line) => {
      console.log("From Arduino:", line);

      if (line.includes("SLOUCH")) latestPosture = "slouch";
      else if (line.includes("GOOD")) latestPosture = "good";
      else latestPosture = line; // optional: send raw angle

      // Broadcast to all connected WebSocket clients
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(latestPosture);
        }
      });
    });

  } catch (err) {
    console.error("Error:", err.message);
  }
}

startServer();
