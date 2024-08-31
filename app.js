const videoElement = document.getElementById("video");
const videoSection = document.getElementById("videoSection");
const startBtn = document.getElementById("captureStart");
const stopBtn = document.getElementById("captureStop");
const recordedVideoElement = document.getElementById("recordedVideo");
const recordedVideoSection = document.getElementById("recordedVideoSection");
const downloadLink = document.getElementById("downloadLink");
const speedElement = document.getElementById("playbackSpeed");
const initialSpeedLabel = document.getElementById("initialSpeed");
const initialLengthLabel = document.getElementById("initialLength");
const videoStartElement = document.getElementById("videoStart");
const videoEndElement = document.getElementById("videoEnd");
const createGifBtn = document.getElementById("originalVideo");
const generateNewVideoBtn = document.getElementById("editedVideo");
const recordedGif = document.getElementById("recordedGif");

initialSpeedLabel.innerText = speedElement.value;

let mediaRecorder;
let fullVideoURL;
let videoURL;
let recordedChunks = [];
let videoLength = 0;
let videoStartTime = 0;
let videoEndTime = videoLength;
let videoLengthTimer;
let stream = null;
let blob;
let gif;

startBtn.addEventListener("click", async () => {
  try {
    // Request access to the camera
    stream = await navigator.mediaDevices.getUserMedia({ video: true });
    // Assign the stream to the video element's source
    videoElement.srcObject = stream;

    // Initialize the recorder
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.ondataavailable = handleDataAvailable;
    mediaRecorder.onstop = handleStop;

    videoLength = 0;

    // Start recording session
    mediaRecorder.start();
    console.log("Recording...");

    videoLengthTimer = setInterval(() => {
      // max length of video clip is 10s
      if (videoLength < 9.9) {
        videoLength += 0.1;
      } else {
        stopRecording();
      }
    }, 100);

    startBtn.disabled = true;
    setTimeout(() => {
      stopBtn.disabled = false;
    }, 1000);
  } catch (error) {
    console.error("Error accessing the camera: ", error);
    Alert("Cannot access the camera.");
  }
});

speedElement.addEventListener("input", (event) => {
  recordedVideoElement.playbackRate = event.target.value;
  initialSpeedLabel.innerText = event.target.value;
  hasVideoEdit();
});

videoStartElement.addEventListener("input", (event) => {
  videoStartTime = event.target.value;
  recordedVideoElement.currentTime = videoStartTime;
});

videoStartElement.addEventListener("mouseup", () => {
  videoURL = `${fullVideoURL}#t=${videoStartTime},${videoEndTime}`;
  recordedVideoElement.src = videoURL;
  hasVideoEdit();
});

videoEndElement.addEventListener("input", (event) => {
  videoEndTime = event.target.value;
  recordedVideoElement.currentTime = videoEndTime;
});

videoEndElement.addEventListener("mouseup", () => {
  videoURL = `${fullVideoURL}#t=${videoStartTime},${videoEndTime}`;
  recordedVideoElement.src = videoURL;
  hasVideoEdit();
});

const stopRecording = () => {
  clearInterval(videoLengthTimer);
  mediaRecorder.stop();
  console.log(
    `Stopped recording. Video length is ${+videoLength.toFixed(1)}s...`
  );

  startBtn.disabled = false;
  stopBtn.disabled = true;
  videoSection.style.display = "none";
  recordedVideoSection.style.display = "flex";
  // downloadLink.style.display = "block";

  videoLength = +videoLength.toFixed(1);
  videoEndTime = videoLength;

  initialLengthLabel.innerText = `${videoLength} seconds`;
  videoStartElement.setAttribute("max", videoLength);
  videoEndElement.setAttribute("max", videoLength);
  videoEndElement.setAttribute("value", videoLength);

  stopStream();
};

// Stop the camera stream
const stopStream = () => {
  if (stream) {
    // Stop all tracks in the stream
    stream.getTracks().forEach((track) => track.stop());
    console.log("Stream stopped");
  }
};

const handleDataAvailable = (event) => {
  if (event.data.size > 0) {
    recordedChunks.push(event.data);
  }
};

const handleStop = () => {
  blob = new Blob(recordedChunks, {
    type: "video/webm",
  });

  recordedChunks = [];

  fullVideoURL = URL.createObjectURL(blob);
  recordedVideoElement.src = fullVideoURL;
  recordedVideoElement.muted = true;
  videoURL = fullVideoURL;

  // downloadLink.href = videoURL;
  // downloadLink.style.display = "block";
};

const hasVideoEdit = () => {
  generateNewVideoBtn.removeAttribute("disabled");
  createGifBtn.setAttribute("disabled", true);
};

const generateGif = () => {
  recordedVideoElement.currentTime = 0;

  // let gifLoading = fetch(
  //   "https://cdn.jsdelivr.net/npm/gif.js@0.2.0/dist/gif.worker.js"
  // ).then((response) => {
  //   if (!response.ok) throw new Error("Network response was not OK");
  //   return response.blob();
  // });

  const gif = new GIF({
    workers: 2,
    quality: 10,
  });

  console.log(gif);

  const captureFrame = () => {
    gif.addFrame(recordedVideoElement, { copy: true, delay: 200 });
    if (recordedVideoElement.currentTime < videoEndTime) {
      console.log("copy");
      recordedVideoElement.currentTime += 0.1;
      requestAnimationFrame(captureFrame);
    } else {
      console.log("render");
      gif.render();
      const gifURL = URL.createObjectURL(blob);
      recordedGif.src = gifURL;
      recordedGif.style.display = "block";
      downloadLink.href = gifURL;
      downloadLink.download = "recorded-video.gif";
      downloadLink.style.display = "block";

      return gif;
    }
  };
  captureFrame();

  function finishGif(blob) {
    console.log("finished");
    const gifURL = URL.createObjectURL(blob);
    recordedGif.src = gifURL;
    recordedGif.style.display = "block";
    downloadLink.href = gifURL;
    downloadLink.download = "recorded-video.gif";
    downloadLink.style.display = "block";
    console.log(recordedGif);
    return gif;
  }

  gif.on("finished", (blob) => {
    window.open(URL.createObjectURL(blob));
    finishGif(blob);
  });

  // gif.on("finished", (blob) => {
  //   console.log("finished");
  //   const gifURL = URL.createObjectURL(blob);
  //   recordedGif.src = gifURL;
  //   recordedGif.style.display = "block";
  //   downloadLink.href = gifURL;
  //   downloadLink.download = "recorded-video.gif";
  //   downloadLink.style.display = "block";
  //   console.log(recordedGif);
  //   return gif;
  // });
};
