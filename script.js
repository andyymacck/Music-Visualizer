// Document elements
const canvas = document.getElementById('canvas1');
const file = document.getElementById('fileupload');
const ctx = canvas.getContext('2d');
const musicPlayer = document.getElementById('musicPlayer');
const visualizationTypeSelect = document.getElementById("visualizationType");
const startScreenCaptureButton = document.getElementById("startScreenCapture");
const stopScreenCaptureButton = document.getElementById("stopScreenCapture");

// Global variables
let audioContext, audioSource, analyser, bufferLength, dataArray, activated = false;
let screenStream, screenAudioSource, screenAnalyser;
let x, barHeight = 3, barWidth = 4, visualizationType = "circular";

// Set canvas to browser window size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Styling
ctx.shadowOffsetX = 12;
ctx.shadowOffsetY = 10;
ctx.shadowBlur = 7;
ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';

// Visualization type change
visualizationTypeSelect.addEventListener("change", function () {
  visualizationType = this.value;
  console.log(`Visualization changed to: ${visualizationType}`);
});

// Handle music play/pause for uploaded audio
musicPlayer.addEventListener('play', () => startVisualizer("file"));
musicPlayer.addEventListener('pause', stopVisualizer);

// File upload handling
file.addEventListener('change', function () {
  const files = this.files;
  if (files.length > 0) {
    musicPlayer.src = URL.createObjectURL(files[0]);
    musicPlayer.load();
  }
});

// Screen capture buttons
startScreenCaptureButton.addEventListener('click', startScreenCapture);
stopScreenCaptureButton.addEventListener('click', stopScreenCapture);

// Start screen capture
async function startScreenCapture() {
  try {
    screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
    startVisualizer("screen");
    stopScreenCaptureButton.disabled = false;
    startScreenCaptureButton.disabled = true;
  } catch (err) {
    console.error("Error starting screen capture:", err);
  }
}

// Stop screen capture
function stopScreenCapture() {
  if (screenStream) {
    const tracks = screenStream.getTracks();
    tracks.forEach(track => track.stop());
    screenStream = null;
    stopVisualizer();
    stopScreenCaptureButton.disabled = true;
    startScreenCaptureButton.disabled = false;
  }
}

// Start visualizer
function startVisualizer(sourceType) {
  if (!audioContext) {
    audioContext = new AudioContext();
  }

  analyser = audioContext.createAnalyser();
  analyser.fftSize = 128;
  bufferLength = analyser.frequencyBinCount;
  dataArray = new Uint8Array(bufferLength);

  if (sourceType === "file") {
    if (!audioSource) {
      audioSource = audioContext.createMediaElementSource(musicPlayer);
      audioSource.connect(analyser);
      analyser.connect(audioContext.destination);
    }
  } else if (sourceType === "screen") {
    const audioTracks = screenStream.getAudioTracks();
    if (audioTracks.length > 0) {
      screenAudioSource = audioContext.createMediaStreamSource(screenStream);
      screenAudioSource.connect(analyser);
    }
  }

  activated = true;
  animate();
}

// Stop visualizer
function stopVisualizer() {
  activated = false;
}

// Animation loop
function animate() {
  if (!activated) return;
  x = 0;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  analyser.getByteFrequencyData(dataArray);

  switch (visualizationType) {
    case "circular":
      drawCircular(bufferLength, x, barWidth, barHeight, dataArray);
      break;
    case "bars":
      drawBars(bufferLength, x, barWidth, barHeight, dataArray);
      break;
    case "radial":
      drawRadial(bufferLength, x, barWidth, barHeight, dataArray);
      break;
    case "waveform":
      drawWaveform(bufferLength, dataArray);
      break;
  }

  requestAnimationFrame(animate);
}

// Visualization methods
function drawCircular(bufferLength, x, barWidth, barHeight, dataArray) {
  for (let i = 0; i < bufferLength; i++) {
    barHeight = dataArray[i] * 2.5;
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(i * (Math.PI * 2 / bufferLength));
    const hue = 120 + i * 0.05;
    ctx.fillStyle = `hsl(${hue}, 85%, 50%)`;
    ctx.beginPath();
    ctx.arc(35, barHeight / 2, barHeight / 2, 0, Math.PI / 4);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
}

function drawBars(bufferLength, x, barWidth, barHeight, dataArray) {
  for (let i = 0; i < bufferLength; i++) {
    barHeight = dataArray[i] * 2;
    ctx.fillStyle = `hsl(${i * 2}, 100%, 50%)`;
    ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
    x += barWidth + 1;
  }
}

function drawRadial(bufferLength, x, barWidth, barHeight, dataArray) {
  for (let i = 0; i < bufferLength; i++) {
    barHeight = dataArray[i] * 2.5;
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((i * Math.PI * 2) / bufferLength);
    const hue = 120 + i * 0.5;
    ctx.fillStyle = `hsl(${hue}, 85%, 50%)`;
    ctx.fillRect(0, 0, barWidth, barHeight);
    ctx.restore();
  }
}

function drawWaveform(bufferLength, dataArray) {
  ctx.beginPath();
  ctx.moveTo(0, canvas.height / 2);
  for (let i = 0; i < bufferLength; i++) {
    const y = (dataArray[i] / 255) * canvas.height;
    ctx.lineTo((i / bufferLength) * canvas.width, y);
  }
  ctx.strokeStyle = "white";
  ctx.lineWidth = 2;
  ctx.stroke();
}

