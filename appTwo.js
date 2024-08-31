const videoElement = document.getElementById("video");
const videoSection = document.getElementById("videoSection");
const startBtn = document.getElementById("captureStart");
const stopBtn = document.getElementById("captureStop");
const recordedVideoElement = document.getElementById("recordedVideo");
const recordedVideoSection = document.getElementById("recordedVideoSection");
const imageSection = document.getElementById("images");
// const downloadLink = document.getElementById("downloadLink");
// const speedElement = document.getElementById("playbackSpeed");
// const initialSpeedLabel = document.getElementById("initialSpeed");
// const initialLengthLabel = document.getElementById("initialLength");
// const videoStartElement = document.getElementById("videoStart");
// const videoEndElement = document.getElementById("videoEnd");
// const createGifBtn = document.getElementById("originalVideo");
// const generateNewVideoBtn = document.getElementById("editedVideo");
// const recordedGif = document.getElementById("recordedGif");

// initialSpeedLabel.innerText = speedElement.value;

// let mediaRecorder;
// let fullVideoURL;
// let videoURL;
// let recordedChunks = [];
// let videoLength = 0;
// let videoStartTime = 0;
// let videoEndTime = videoLength;
// let videoLengthTimer;
// let stream = null;
// let blob;
let gif;
let video;
let stream;
let frameCaptureIntervalId;
const images = [];
const frames = [];

// Access user camera for stream capture
const startVideoStream = async () => {
  stream = await navigator.mediaDevices.getUserMedia({ video: true });
  // Assign the stream to the video element's source
  videoElement.srcObject = stream;
  return stream;
};

// Capture frames at interval and store in array
const captureFrames = (stream, interval = 100) => {
  video = document.createElement("video");
  video.srcObject = stream;
  video.play();

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  gif = new GIF({
    workers: 2,
    quality: 10,
  });

  // wait until video is ready
  video.addEventListener("loadedmetadata", () => {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const capture = () => {
      // draw current video frame onto canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const frameData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      //   if (frameData.data.length > 0) {
      //     gif.addFrame(frameData, { delay: interval });
      //   } else {
      //     console.error("Empty frame data detected.");
      //   }

      // convert canvas to data URL image
      const dataURL = canvas.toDataURL("image/png");

      // store image in array
      images.push(dataURL);
      frames.push(frameData);
    };

    // capture frames at specific interval
    frameCaptureIntervalId = setInterval(capture, interval);
  });
};

const startRecording = async () => {
  stream = await startVideoStream();
  captureFrames(stream, 100);
  startBtn.disabled = true;
  setTimeout(() => {
    stopBtn.disabled = false;
  }, 1000);
};

const stopRecording = () => {
  console.log("stop");
  clearInterval(frameCaptureIntervalId);
  video.pause();
  video.srcObject = null;
  stream.getTracks().forEach((track) => track.stop());
  //   gif.on("error", (e) => {
  //     console.log("error: ", e);
  //   });
  // Render the GIF

  gif.addFrame(document.createElement("canvas"), { delay: 200 });
  gif.on("finished", function (blob) {
    console.log("finished");
    const url = URL.createObjectURL(blob);
    const img = document.createElement("img");
    img.src = url;
    imageSection.appendChild(img); // Display the GIF
  });

  gif.on("progress", function (p) {
    console.log("Progress:", Math.round(p * 100) + "%");
  });

  gif.on("start", function () {
    console.log("GIF rendering started...");
  });

  gif.on("abort", function () {
    console.log("GIF rendering aborted.");
  });

  gif.on("error", function (err) {
    console.error("GIF rendering error:", err);
  });

  console.log("render");
  gif.render();
  //   window.open(URL.createObjectURL(blob));
  //   displayImages(images);
};

const displayImages = (images) => {
  images.forEach((img) => {
    const imgElement = document.createElement("img");
    imgElement.src = img;
    imgElement.width = "200";
    imgElement.height = "150";
    imageSection.appendChild(imgElement);
  });
};
