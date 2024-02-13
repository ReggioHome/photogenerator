// adjust padding after uploading a pic
// Function to call after a picture is uploaded and processed
function adjustMainPadding() {
  document.querySelector("main").style.paddingTop = "200px"; // Adjust this value to the header's height
  console.log("padding adjusted");
}

document.getElementById("file").addEventListener("change", function (event) {
  adjustMainPadding();

  var imagePreview = document.getElementById("imagePreview");
  var files = event.target.files; // FileList object
  f = files[0];
  console.log(files[0]);

  var reader = new FileReader();

  // Closure to capture the file information.
  reader.onload = (function (theFile) {
    return function (e) {
      // Render thumbnail.
      var span = document.createElement("span");
      span.innerHTML = [
        '<img class="thumb" src="',
        e.target.result,
        '" title="',
        escape(theFile.name),
        '"/>',
      ].join("");
      imagePreview.insertBefore(span, null);
    };
  })(f);

  // Read in the image file as a data URL.
  reader.readAsDataURL(f);

  var button = document.querySelector(".generate-button");
  button.style.display = "block"; // Make the button take up space
});

// do animation while waiting
document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("uploadForm");
  form.addEventListener("submit", function () {
    // Show loading animation
    document.getElementById("loadingAnimationId").style.display = "block";
  });
});

// //// recording
// let mediaRecorder;
// let audioChunks = [];

// // Access the user's microphone
// navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
//   mediaRecorder = new MediaRecorder(stream);
//   mediaRecorder.ondataavailable = (event) => {
//     audioChunks.push(event.data);
//   };
//   mediaRecorder.onstop = () => {
//     const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
//     const audioUrl = URL.createObjectURL(audioBlob);
//     const audio = document.getElementById("audioPlayback");
//     audio.src = audioUrl;
//     audio.hidden = false;
//     document.getElementById("resetRecord").disabled = false;
//     document.getElementById("uploadRecord").disabled = false;
//   };
// });

// // Start recording
// document.getElementById("startRecord").addEventListener("click", () => {
//   mediaRecorder.start();
//   audioChunks = [];
//   document.getElementById("startRecord").disabled = true;
//   document.getElementById("stopRecord").disabled = false;
// });

// // Stop recording
// document.getElementById("stopRecord").addEventListener("click", () => {
//   mediaRecorder.stop();
//   document.getElementById("startRecord").disabled = false;
//   document.getElementById("stopRecord").disabled = true;
// });

// // Reset recording
// document.getElementById("resetRecord").addEventListener("click", () => {
//   document.getElementById("audioPlayback").hidden = true;
//   document.getElementById("resetRecord").disabled = true;
//   document.getElementById("uploadRecord").disabled = true;
// });

// // Upload recording
// document.getElementById("uploadRecord").addEventListener("click", () => {
//   const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
//   const formData = new FormData();
//   formData.append("audioFile", audioBlob, "recording.wav");

//   // call the endpoint
//   fetch("/upload-audio", {
//     method: "POST",
//     body: formData,
//   })
//     .then((response) => response.json())
//     .then((data) => {
//       console.log(data);
//       // Handle the transcribed text here
//       if (data.success) {
//         alert(`Transcribed Text: ${data.description}`);
//         // Construct a URL with query parameters
//         const queryParams = `image_url=${encodeURIComponent(
//           data.image_url
//         )}&description=${encodeURIComponent(data.description)}`;
//         window.location.href = `/result?${queryParams}`; // Redirect
//       }
//     })
//     .catch((error) => console.error("Error:", error));
// });

//// new recording script because ios cannot handle mediarecorder
let recorder;
let audioStream;

// Function to initialize recording
function initRecording() {
  navigator.mediaDevices
    .getUserMedia({ audio: true })
    .then((stream) => {
      audioStream = stream;
      // Create a new instance of RecordRTC with the audio stream
      recorder = RecordRTC(stream, {
        type: "audio",
        mimeType: "audio/wav", // Specify desired output format
        recorderType: RecordRTC.StereoAudioRecorder, // For broader compatibility
        numberOfAudioChannels: 1, // Mono audio
        desiredSampRate: 16000, // Optional: Specify sample rate
      });
    })
    .catch((error) => {
      console.error("Error accessing the microphone:", error);
    });
}

document.getElementById("startRecord").addEventListener("click", () => {
  if (recorder) {
    recorder.startRecording();
    document.getElementById("startRecord").disabled = true;
    document.getElementById("stopRecord").disabled = false;
  } else {
    console.log("Recorder not initialized");
  }
});

document.getElementById("stopRecord").addEventListener("click", () => {
  if (recorder) {
    recorder.stopRecording(() => {
      let blob = recorder.getBlob();
      let audioUrl = URL.createObjectURL(blob);
      document.getElementById("audioPlayback").src = audioUrl;
      document.getElementById("audioPlayback").hidden = false;
      document.getElementById("resetRecord").disabled = false;
      document.getElementById("uploadRecord").disabled = false;

      // To reset the recorder for the next recording
      // recorder.reset();
      // audioStream.getTracks().forEach((track) => track.stop()); // Optional: Stop the audio stream

      // The rest of your code for handling the recorded audio
    });

    document.getElementById("startRecord").disabled = true;
    document.getElementById("stopRecord").disabled = true;
  }
});

// Assuming recorder is your RecordRTC instance
document.getElementById("uploadRecord").addEventListener("click", () => {
  if (recorder && recorder.getBlob()) {
    const audioBlob = recorder.getBlob(); // Get the recorded blob directly from RecordRTC
    const formData = new FormData();
    formData.append("audioFile", audioBlob, "recording.wav"); // Append the blob to FormData

    // Call the endpoint
    fetch("/upload-audio", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        // Handle the response here
        if (data.success) {
          alert(`Transcribed Text: ${data.description}`);
          // Construct a URL with query parameters
          const queryParams = `image_url=${encodeURIComponent(
            data.image_url
          )}&description=${encodeURIComponent(data.description)}`;
          window.location.href = `/result?${queryParams}`; // Redirect
        }
      })
      .catch((error) => console.error("Error:", error));
  } else {
    console.log("Recorder not initialized or recording not stopped.");
  }
});

// Call initRecording to set up
initRecording();

//// end recording
