// script.js

const img = new Image(); // used to load image from <input> and draw to canvas
const canvas = document.querySelector("#user-image");
const canvasContext = canvas.getContext('2d');
const imageInput = document.querySelector('#image-input');
const submitButton = document.querySelector('button[type="submit"]');
const clearButton = document.querySelector('button[type="reset"]');
const readButton = document.querySelector('button[type="button"]');
const formObj = document.querySelector('#generate-meme');
const textTop = document.querySelector('#text-top');
const textBottom = document.querySelector('#text-bottom');
const voiceSelector = document.querySelector('#voice-selection')
const noneOption = document.querySelector('#voice-selection').children[0];
const volumeImage = document.querySelector('#volume-group img');
const volumeInput = document.querySelector('#volume-group input');
const synth = window.speechSynthesis;
let voices = [];

// Fires whenever the img object loads a new image (such as with img.src =)
img.addEventListener('load', () => {
  // TODO
  //clear canvas and set background
  canvasContext.clearRect(0, 0, canvas.width, canvas.height);
  canvasContext.fillStyle = "black";
  canvasContext.fillRect(0, 0, canvas.width, canvas.height);


  //draw image
  let dimensions = getDimmensions(canvas.width, canvas.height, img.width, img.height);
  canvasContext.drawImage(img, dimensions['startX'], dimensions['startY'], dimensions['width'], dimensions['height']);

  //toggle buttons
  submitButton.disabled = false;
  clearButton.disabled = true;
  readButton.disabled = true;


  // Some helpful tips:
  // - Fill the whole Canvas with black first to add borders on non-square images, then draw on top
  // - Clear the form when a new image is selected
  // - If you draw the image to canvas here, it will update as soon as a new image is selected
});

/**
 * Takes in the dimensions of the canvas and the new image, then calculates the new
 * dimensions of the image so that it fits perfectly into the Canvas and maintains aspect ratio
 * @param {number} canvasWidth Width of the canvas element to insert image into
 * @param {number} canvasHeight Height of the canvas element to insert image into
 * @param {number} imageWidth Width of the new user submitted image
 * @param {number} imageHeight Height of the new user submitted image
 * @returns {Object} An object containing four properties: The newly calculated width and height,
 * and also the starting X and starting Y coordinate to be used when you draw the new image to the
 * Canvas. These coordinates align with the top left of the image.
 */
function getDimmensions(canvasWidth, canvasHeight, imageWidth, imageHeight) {
  let aspectRatio, height, width, startX, startY;

  // Get the aspect ratio, used so the picture always fits inside the canvas
  aspectRatio = imageWidth / imageHeight;

  // If the apsect ratio is less than 1 it's a verical image
  if (aspectRatio < 1) {
    // Height is the max possible given the canvas
    height = canvasHeight;
    // Width is then proportional given the height and aspect ratio
    width = canvasHeight * aspectRatio;
    // Start the Y at the top since it's max height, but center the width
    startY = 0;
    startX = (canvasWidth - width) / 2;
    // This is for horizontal images now
  } else {
    // Width is the maximum width possible given the canvas
    width = canvasWidth;
    // Height is then proportional given the width and aspect ratio
    height = canvasWidth / aspectRatio;
    // Start the X at the very left since it's max width, but center the height
    startX = 0;
    startY = (canvasHeight - height) / 2;
  }

  return { 'width': width, 'height': height, 'startX': startX, 'startY': startY }
}


//Set up voice
window.onload = setupVoiceIfExist;

imageInput.addEventListener('change', ()=>{
  let imgFile = imageInput.files[0];
  img.src = URL.createObjectURL(imgFile);
  img.alt = parseFileName(imageInput.value);
});

formObj.addEventListener('submit', (event)=>{
  event.preventDefault();

  drawCustomText(textTop.value, textBottom.value);

  //toggle buttons
  submitButton.disabled = true;
  clearButton.disabled = false;
  readButton.disabled = false;
});

clearButton.addEventListener('click', ()=>{
  canvasContext.clearRect(0, 0, canvas.width, canvas.height);

  //toggle buttons
  submitButton.disabled = false;
  clearButton.disabled = true;
  readButton.disabled = true;
});

readButton.addEventListener('click', ()=>{
  const utter = new SpeechSynthesisUtterance(textTop.value + " " + textBottom.value);
  utter.voice = voices[voiceSelector.selectedIndex];
  console.log(volumeInput.value);
  utter.volume = volumeInput.value/100;
  synth.speak(utter);
});

volumeInput.addEventListener('input', ()=>{
   if(volumeInput.value >= 67) {
    volumeImage.src = "icons/volume-level-3.svg";
  } else if(volumeInput.value >= 34) {
    volumeImage.src = "icons/volume-level-2.svg";
  } else if(volumeInput.value >= 1) {
    volumeImage.src = "icons/volume-level-1.svg";
  } else {
    volumeImage.src = "icons/volume-level-0.svg";
  }
});



/*
  Helpers
 */

function setupVoiceIfExist() {
  voices = synth.getVoices();
  if (voices.length > 0) {
    voiceSelector.removeChild(noneOption);
    for(let i = 0; i < voices.length; i++) {
      let option = document.createElement('option');
      option.textContent = voices[i].name + ' (' + voices[i].lang + ')';

      if(voices[i].default) {
        option.textContent += ' -- DEFAULT';
      }

      option.setAttribute('data-lang', voices[i].lang);
      option.setAttribute('data-name', voices[i].name);
      voiceSelector.appendChild(option);
    }
    voiceSelector.disabled = false;
  } 
}

function drawCustomText(topText, bottomText) {

  const fontSize = 40;
  canvasContext.font = fontSize + 'px Arial';
  canvasContext.fillStyle = '#FFFFFF';

  const topMeasure = canvasContext.measureText(topText);
  const bottomMeasure = canvasContext.measureText(bottomText);

  const textTop1 = fontSize;
  const textTop2 = canvas.height - fontSize/2;
  const textLeft1 = (canvas.width-topMeasure.width)/2.0;
  const textLeft2 = (canvas.width-bottomMeasure.width)/2.0;

  canvasContext.strokeStyle = "#000000";
  canvasContext.strokeText(topText, textLeft1, textTop1);
  canvasContext.fillText(topText, textLeft1, textTop1);
  canvasContext.strokeText(bottomText, textLeft2, textTop2);
  canvasContext.fillText(bottomText, textLeft2, textTop2);
}

function parseFileName(pathStr) {
  let lastDelimiterIndex = pathStr.lastIndexOf('\\') == -1 ? pathStr.lastIndexOf('/') : pathStr.lastIndexOf('\\');
  return pathStr.substring(lastDelimiterIndex+1);
}
