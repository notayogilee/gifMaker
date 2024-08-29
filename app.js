const videoElement = document.getElementById("video");
const videoSection = document.getElementById("videoSection");
const startBtn = document.getElementById("captureStart");
const stopBtn = document.getElementById("captureStop");
const recordedVideoElement = document.getElementById("recordedVideo");
const recordedVideoSection = document.getElementById("recordedVideoSection");
const downloadLink = document.getElementById("downloadLink");
const speedElement = document.getElementById("playbackSpeed");
const currentSpeedLabel = document.getElementById("currentSpeed");

currentSpeedLabel.innerText = speedElement.value;

let mediaRecorder;
let recordedChunks = [];
let videoLength = 0;
let videoLengthTimer;
let stream = null;

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
    stopBtn.disabled = false;
  } catch (error) {
    console.error("Error accessing the camera: ", error);
    Alert("Cannot access the camera.");
  }
});

speedElement.addEventListener("input", (event) => {
  recordedVideoElement.playbackRate = event.target.value;
  currentSpeedLabel.innerText = event.target.value;
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
  downloadLink.style.display = "block";
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
  const blob = new Blob(recordedChunks, {
    type: "video/webm",
  });

  recordedChunks = [];

  const videoURL = URL.createObjectURL(blob);
  recordedVideoElement.src = videoURL;
  downloadLink.href = videoURL;
  downloadLink.style.display = "block";
};
