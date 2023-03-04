// Document elements.
const canvas = document.getElementById('canvas1');
const file = document.getElementById('fileupload');
const ctx = canvas.getContext('2d');
const musicPlayer = document.getElementById('musicPlayer');
const playButton = document.getElementById('playButton');
const videoElem = document.getElementById("video");

const logElem = document.getElementById("log");
const startElem = document.getElementById("start");
const stopElem = document.getElementById("stop");


// Global variables,
let audioSource;
let analyser;
let x;
let barHeight = 3;
const barWidth = 4;
let activated = false;

// Set canvas to browser window size.
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Styling
ctx.shadowOffSetX = 12;
ctx.shadowOffSetY = 10;
ctx.shadowBlur = 7;
ctx.shadowColor = 7;

let audioContext, bufferLength, dataArray;

musicPlayer.addEventListener('play', function(){
  startVisualizerFromScreen();
})

musicPlayer.addEventListener('pause', function(){
  stopVisualizer();
})

const displayMediaOptions = {
  video: {
    displaySurface: "window"
  },
  audio: false
};

// Set event listeners for the start and stop buttons
startElem.addEventListener("click", (_evt) => {
  console.log("startclick");
  startVisualizerFromScreen();

  console.log("startcapture()");
}, false);

stopElem.addEventListener("click", (_evt) => {
  console.log("stopclick");
  stopCapture();
  console.log("stopcapture()");
}, false);

async function startCapture() {
  logElem.innerHTML = "";
  try {
    videoElem.srcObject = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
    dumpOptionsInfo();
  } catch (err) {
    console.error(`Error: ${err}`);
  }
}


function dumpOptionsInfo() {
  const videoTrack = videoElem.srcObject.getVideoTracks()[0];

  console.info("Track settings:");
  console.info(JSON.stringify(videoTrack.getSettings(), null, 2));
  console.info("Track constraints:");
  console.info(JSON.stringify(videoTrack.getConstraints(), null, 2));
}


async function startVisualizerFromScreen(){
  
  audioContext = audioContext || new AudioContext();
  audioSource = audioSource || audioContext.createMediaElementSource(musicPlayer);
  analyser = analyser || audioContext.createAnalyser();
  let desktopStream = await navigator.mediaDevices.getDisplayMedia({ video:true, audio: true });
  
  bufferLength = analyser.frequencyBinCount;
  dataArray = new Uint8Array(bufferLength);
  analyser.fftSize = 128;

 
  const source1 = audioContext.createMediaStreamSource(desktopStream);
  const captureGain = audioContext.createGain();
  captureGain.gain.value = 0.7;
  source1.connect(analyser);

  
  activated = true; 
  console.log('StartVisualizer');
  animate(); // Start animation.
}

function stopVisualizer(){
  activated = false;
}

function animate(){
  x = 0;
  ctx.clearRect(0,0, canvas.width, canvas.height);
  analyser.getByteFrequencyData(dataArray);
  drawVisualiser(bufferLength, x, barWidth, barHeight, dataArray);
  
  console.log("animate");
  if(activated){
    requestAnimationFrame(animate);
  }
   
}

file.addEventListener('change', function(){
  console.log(this.files);
  const files = this.files;
  const musicPlayer = document.getElementById('musicPlayer');
  musicPlayer.src = URL.createObjectURL(files[0]);
  musicPlayer.load();
})


function drawVisualiser(bufferLength, x, barWidth, barHeight, dataArray){
  for (let i = 0; i< bufferLength; i++){
    barHeight = dataArray[i] * 2.5;
    ctx.save();
    ctx.translate(canvas.width/2, canvas.height/2);
    ctx.rotate(i * 4.184);
    const hue = 120 + i * 0.05;
    ctx.fillStyle = 'hsl(' + hue + ',85%, 50%)';
    ctx.beginPath();
    ctx.arc(35, barHeight/2, barHeight/2, 0, Math.PI/ 4);
    ctx.fill();
    ctx.stroke();
    x += barWidth;
    ctx.restore();
  }
}
