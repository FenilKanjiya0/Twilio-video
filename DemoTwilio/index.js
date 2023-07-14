const token = document.getElementById("token");

function videoRoom() {
  const roomToken = token.value;

  const videoToggle = document.getElementById("videotoggle");
  const audiotoggle = document.getElementById("audiotoggle");
  const disconnected = document.getElementById("disconnected");
  const showDemo = document.getElementById('main-content');

  Twilio.Video.connect(roomToken, {
    name: "demoroom",
    audio: false,
    video: false,
  })
    .then((room) => {

      showDemo.classList.remove("main-content")

      // local user name
      const localUserName = document.getElementById("local-user-name");
      localUserName.innerHTML = room.localParticipant.identity;

      //remote user name
      room.participants.forEach((participant) => {
        const remoteUserName = document.getElementById("remote-user-name");
        remoteUserName.innerHTML = participant.identity;
      });

      // video streaming
      let isVideoChecked = false;
      videoToggle.addEventListener("click", () => {
        isVideoChecked = !isVideoChecked;

        if (isVideoChecked) {
          Twilio.Video.createLocalVideoTrack().then((localVideoTrack) => {
            console.log("track", localVideoTrack);

            const localMediaContainer = document.getElementById("local-track");
            const localVideo = localVideoTrack.attach();
            localVideo.style.width = "386px";
            if (localMediaContainer.children.length === 0) {
              localMediaContainer?.append(localVideo);
              room.localParticipant.publishTrack(localVideoTrack);
            }
          });
        } else {
          room.localParticipant.videoTracks.forEach((publication) => {
            publication.track.stop();
            publication.unpublish();

            publication.track.detach().forEach(function (mediaElement) {
              // console.log(mediaElement)
              mediaElement.remove();
            });
          });
        }
      });

      // for audio streaming
      let isAudioChecked = false;
      audiotoggle.addEventListener("click", () => {
        isAudioChecked = !isAudioChecked;
        if (isAudioChecked) {
          Twilio.Video.createLocalAudioTrack({ audio: true }).then(
            (localAudioTrack) => {
              room.localParticipant.publishTrack(localAudioTrack);
              console.log(localAudioTrack);
            }
          );
        } else {
          room.localParticipant.audioTracks.forEach((publication) => {
            publication.track.stop();
            publication.unpublish();
            console.log(publication.track);
          });
        }
      });

      //remote user

      room.on("trackSubscribed", () => {
        console.log("trackSubscribed");
        room.participants.forEach((participant) => {
          //  console.log(participant)
          participant.tracks.forEach((publication) => {
            console.log(publication);

            if (publication.track.kind === "audio") {

              const audiotrack = document.createElement("audio");
              audiotrack.appendChild(publication.track.attach());

            } else if (publication.track.kind === "video") {

              const remoteMediaContainer = document.getElementById("remote-media-div");
              const remoteVideo = publication.track.attach();
              remoteVideo.style.width = "486px";

              if (remoteMediaContainer.children.length === 0)
                remoteMediaContainer.appendChild(remoteVideo);
            }
          });
        });
      });

      room.on("trackUnsubscribed", function (track) {
        console.log("trackUnsubscribed");
        track.detach().forEach(function (mediaElement) {
          mediaElement.remove();
        });
      });

      // disconnected
      disconnected.addEventListener("click", () => {
        room.on("disconnected", (room) => {
          room.localParticipant.tracks.forEach((publication) => {
            const attachedElements = publication.track.detach();
            attachedElements.forEach((element) => element.remove());
          });
        });
        room.disconnect();
        console.log("disconnected to the room");
        window.location.reload();
      });
    })
    .catch((error) => {
      console.log(`can't connect to room ${error.message}`);
    });
}
