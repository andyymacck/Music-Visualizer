// Document elements.
const canvas = document.getElementById('canvas1');
const file = document.getElementById('fileupload');
const ctx = canvas.getContext('2d');
const musicPlayer = document.getElementById('musicPlayer');
const playButton = document.getElementById('playButton');

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
  startVisualizer();
})

musicPlayer.addEventListener('pause', function(){
  stopVisualizer();
})

function startVisualizer(){
  // Using AudioContext we make an audioSource from musicPlayer. Doing this disconnects audio. We also make an analyser.
  audioContext = audioContext || new AudioContext();
  audioSource = audioSource || audioContext.createMediaElementSource(musicPlayer);
  analyser = analyser || audioContext.createAnalyser();
  
  // Note about: analyser = analyser || audioContext.createAnalyser();
  // Basically ||  means if analyser is undefined, use the next thing. We use this because if it's already set, it would break things to try it again, so we just leave it as is.
  
  // Then we setup the analyser to get the variables from that we need later.
  bufferLength = analyser.frequencyBinCount;
  dataArray = new Uint8Array(bufferLength);
  analyser.fftSize = 128;
  
  // Now we route our disconnected audio stream. First to the analyser and from there back to the output of the audioContext.
  audioSource.connect(analyser);
  analyser.connect(audioContext.destination);
  
  
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

//seperate event listener for ability to change audio files

file.addEventListener('change', function(){
  console.log(this.files);
  const files = this.files;
  const musicPlayer = document.getElementById('musicPlayer');
  musicPlayer.src = URL.createObjectURL(files[0]);
  musicPlayer.load();
})

  
// controls specific visual characteristics, in this instance is set for a spiral vortex

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
