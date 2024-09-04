const videoElement = document.getElementById("video");
const recordSection = document.getElementById("videoSection");
const originalGifSection = document.getElementById("recordedVideoSection");
const gifElement = document.getElementById("recordedGif");
const editedGifElement = document.getElementById("editedGif");
const downloadLink = document.getElementById("downloadLink");
const gifText = document.getElementById("gifText");

let savedRenderingContexts = null;
let textYinit = false;
let textYmid = false;
let textYend = true;
let topHasText = false;
let middleHasText = false;
let bottomHasText = false;

const getTextPlacement = () => {
  textYinit = document.getElementById("top").checked;
  textYmid = document.getElementById("middle").checked;
  textYend = document.getElementById("bottom").checked;

  return textYend ? "bottom" : textYinit ? "top" : "middle";
};

const startRecording = async () => {
  console.log("start");
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
        // hide record section
        recordSection.classList.add("d-none");
        originalGifSection.classList.remove("d-none");

        // Save the rendering contexts for later use
        console.log(obj);
        savedRenderingContexts = obj.savedRenderingContexts;

        var image = obj.image,
          animatedImage = document.createElement("img");
        animatedImage.src = image;
        animatedImage.id = "animatedImage";
        gifElement.appendChild(animatedImage);
      }
    }
  );
};

const editGif = () => {
  // Get text
  const text = gifText.value;

  // Get text position
  const textPosition = getTextPlacement();

  console.log("new gif", savedRenderingContexts);

  if (savedRenderingContexts && text) {
    let modifiedFrames = savedRenderingContexts.map(function (
      imageData,
      index
    ) {
      // Create a temporary canvas to draw the ImageData and add text
      let canvas = document.createElement("canvas");
      canvas.width = imageData.width;
      canvas.height = imageData.height;
      let context = canvas.getContext("2d");

      // Draw the original ImageData onto the canvas
      context.putImageData(imageData, 0, 0);

      console.log(imageData, imageData.width, text.length * 16);

      // Add the text to the frame if middle
      if (textPosition === "middle") {
        context.font = "16px Roboto";
        context.fillStyle = "white";
        context.fillText(
          text,
          (imageData.width - text.length * 6) / 2,
          (imageData.height - 16) / 2
        );
      }

      // Return the modified frame as a data URL
      return canvas.toDataURL();
    });

    // Re-create the GIF with the modified frames
    gifshot.createGIF(
      {
        gifWidth: 200,
        gifHeight: 200,
        saveRenderingContexts: !topHasText || !middleHasText || !bottomHasText, // No need to save contexts again
        images: modifiedFrames, // Use modified frames
        text: textPosition === "middle" ? "" : text,
        textBaseline: textPosition,
      },
      function (newObj) {
        if (!newObj.error) {
          // Append the modified GIF to the document
          var finalGif = document.createElement("img");
          finalGif.src = newObj.image;
          document.getElementById("result").innerHTML = ""; // Clear previous result
          document.getElementById("result").appendChild(finalGif);
        }
      }
    );
  }
};

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
