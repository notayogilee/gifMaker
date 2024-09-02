const videoElement = document.getElementById("video");
const gifElement = document.getElementById("recordedGif");
const editedGifElement = document.getElementById("editedGif");
const downloadLink = document.getElementById("downloadLink");

const startRecording = async () => {
  // Request access to the camera
  stream = await navigator.mediaDevices.getUserMedia({ video: true });
  // Assign the stream to the video element's source
  videoElement.srcObject = stream;

  gifshot.createGIF(
    {
      gifWidth: 200,
      gifHeight: 200,
      sampleInterval: 10,
      numFrames: 10, // number of frames used in gif - this will increase time
      interval: 0.1, // higher increase speed
      frameDuration: 1,
      offset: 100,
      text: "Lee's GIF!!",
      progressCallback: function (captureProgress) {
        console.log(`progress: ${captureProgress}`);

        if (captureProgress === 1) {
          if (stream) {
            // Stop all tracks in the stream
            stream.getTracks().forEach((track) => track.stop());
            console.log("Stream stopped");
          }
        }
      },
      completeCallback: function () {
        console.log("completed");
      },
      saveRenderingContexts: true,
    },
    function (obj) {
      if (!obj.error) {
        var image = obj.image,
          animatedImage = document.createElement("img");
        animatedImage.src = image;
        animatedImage.id = "animatedImage";
        gifElement.appendChild(animatedImage);
      }
    }
  );
};

const editGif = () => {};

const downloadGif = () => {
  const animatedImageElement = document.getElementById("animatedImage");
  const gifURL = animatedImageElement.src;
  // extract base64 data
  const base64Data = gifURL.split(",")[1];

  // Convert to blob object
  const binaryString = atob(base64Data);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);

  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  const blob = new Blob([bytes], { type: "image/gif" });

  downloadLink.href = URL.createObjectURL(blob);
  downloadLink.download = "image.gif"; // Name of the downloaded file
};
