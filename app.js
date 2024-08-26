const videoElement = document.getElementById("video");
const startBtn = document.getElementById("captureStart");
const stopBtn = document.getElementById("captureStop");
const recordedVideoElement = document.getElementById("recordedVideo");
const downloadLink = document.getElementById("downloadLink");

let mediaRecorder;
let recordedChunks = [];

startBtn.addEventListener("click", async () => {
  try {
    // Request access to the camera
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    // Assign the stream to the video element's source
    videoElement.srcObject = stream;

    // Initialize the recorder
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.ondataavailable = handleDataAvailable;
    mediaRecorder.onstop = handleStop;

    // Start recording session
    mediaRecorder.start();
    console.log("Recording...");

    startBtn.disabled = true;
    stopBtn.disabled = false;
  } catch (error) {
    console.error("Error accessing the camera: ", error);
    Alert("Cannot access the camera.");
  }
});

const stopRecording = () => {
  mediaRecorder.stop();
  console.log("Stopped recording.");

  startBtn.disabled = false;
  stopBtn.disabled = true;
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
  downloadLink.style.display = block;
};
