// const constraints = { video: true, audio: true };
// async function playVideoFromCamera() {
//   try {
//     const stream = await navigator.mediaDevices.getUserMedia(constraints);
//     console.log(stream.getTracks());
//     const videoElement = document.getElementById("localVideo");
//     console.log(stream);
//     videoElement.srcObject = stream;
//   } catch (error) {
//     console.error("Error opening video camera.", error);
//   }
// }

// async function stopVideoFromCamera() {
//   try {
//     let stream = await navigator.mediaDevices.getUserMedia(constraints);
//     // console.log(stream);

//     stream.getTracks().forEach(function (track) {
//       console.log(track);
//       track.stop();
//     });
//     stream = null;
//   } catch (error) {
//     console.error(error);
//   }
// }

const name = document.getElementById("name");
const button = document.getElementById("button");
const mute = document.getElementById("muted");
const onVideo = document.getElementById("turn-on-video");

// mute.addEventListener("click", toggleMute);

button.addEventListener("click", function () {
  const participentName = name.value;

  const token =
    "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiIsImN0eSI6InR3aWxpby1mcGE7dj0xIn0.eyJqdGkiOiJTSzBlODcyZDg5ZmI0ZTlkY2M0MDAyOTA2MDhjYTQ0NTA5LTE2ODgxMzMwMzYiLCJpc3MiOiJTSzBlODcyZDg5ZmI0ZTlkY2M0MDAyOTA2MDhjYTQ0NTA5Iiwic3ViIjoiQUM3NWFhMjc5NDRiYTY5YWEyMDU2NGI0Y2Q0Nzk5YTJlMCIsImV4cCI6MTY4ODEzNjYzNiwiZ3JhbnRzIjp7ImlkZW50aXR5IjoiZmVuaWwiLCJ2aWRlbyI6eyJyb29tIjoiZGVtb3Jvb20ifX19.bW74xOGlczVeScYjxusta4-M0xEZ6qn3IxjpFqiGVw8";

  Twilio.Video.createLocalTracks({
    audio: true, // get audio
    video: { width: 640 }, // get video
  }).then((localTracks) => {
    // play video and audio on display

    localVideoTrack = localTracks.find((track) => track.kind === "video"); // find video track
    localAudioTrack = localTracks.find((track) => track.kind === "audio"); // find audio track

    const localVideoElement = localVideoTrack.attach(); // to attact video element
    document.body.appendChild(localVideoElement); // render video in body
    
    return Twilio.Video.connect(token, {
      // connect room or not
      name: participentName,
      tracks: localTracks,
    }).then((room) => {
      console.log(`Successfully join room ${room.name}`);

      // room.on("participantConnected", (participant) => {
      //   console.log(`A remote participent Connected: ${participant}`);
      // }),
      (err) => {
        console.log(`Unable to connect Room : ${err.message}`);
      };
    });
  });
});

mute.addEventListener("click", () => {
  if (localAudioTrack) {
    if (localAudioTrack.isEnabled) {
      localAudioTrack.disable();
      console.log(localAudioTrack);
      mute.textContent = "Unmute";
    } else {
      localAudioTrack.enable();
      console.log(localAudioTrack);
      mute.textContent = "Mute";
    }
  }
});

onVideo.addEventListener("click", () => {
  if (localVideoTrack) {
    if (localVideoTrack.isEnabled) {
      localVideoTrack.disable();
      console.log(localVideoTrack);
      onVideo.textContent = "Video On";
    } else {
      localVideoTrack.enable();
      console.log(localVideoTrack);
      onVideo.textContent = "Video Off";
    }
  }
});
