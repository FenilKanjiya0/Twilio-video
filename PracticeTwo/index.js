const token = document.getElementById("token");

function roomBtn() {
  const roomToken = token.value;

  // disconnect button
  const disconnected = document.createElement("button");
  disconnected.textContent = "disconnected";
  disconnected.classList.add("btn", "btn-info", "m-3");
  document.body.appendChild(disconnected);

  // video button
  const newButton = document.createElement("button");
  newButton.textContent = "Video On";
  newButton.classList.add("btn", "btn-warning", "m-3");
  document.body.appendChild(newButton);

  const videobtn = document.createElement("button");
  videobtn.textContent = "Video Off";
  videobtn.classList.add("btn", "btn-danger", "m-3");

  //audio button
  const audioButton = document.createElement("button");
  audioButton.textContent = "Audio On";
  audioButton.classList.add("btn", "btn-warning", "m-3");
  document.body.appendChild(audioButton);

  const audiobtn = document.createElement("button");
  audiobtn.textContent = "Audio Off";
  audiobtn.classList.add("btn", "btn-danger", "m-3");

  Twilio.Video.connect(roomToken, {
    name: "demoroom",
    audio: false,
    video: false,
  })
    .then((room) => {
      console.log(`Successfully joined a Room: ${room}`);

      const localParticipant = room.localParticipant;
      console.log(`Local user "${localParticipant.identity}"`);

      room.on("participantConnected", (participant) => {
        console.log(
          `Remote Participant "${participant.identity}" join the room`
        );
      });

      room.on("participantDisconnected", (participant) => {
        console.log(
          `Participant "${participant.identity}" has disconnected from the Room`
        );
      });

      // for video streaming

      newButton.addEventListener("click", () => {
        document.body.removeChild(newButton);
        document.body.appendChild(videobtn);

        Twilio.Video.createLocalVideoTrack().then((localVideoTrack) => {
          console.log("track", localVideoTrack);

          const localMediaContainer = document.getElementById("local-media");
          localMediaContainer?.appendChild(localVideoTrack.attach());

          room.localParticipant.publishTrack(localVideoTrack);
        });
      });

      // video streaming stop and remove html element
      videobtn.addEventListener("click", () => {
        document.body.removeChild(videobtn);
        document.body.appendChild(newButton);

        room.localParticipant.videoTracks.forEach((publication) => {
          publication.track.stop();
          publication.unpublish();

          publication.track.detach().forEach(function (mediaElement) {
            // console.log(mediaElement)
            mediaElement.remove();
          });
        });
      });

      // for audio streaming
      audioButton.addEventListener("click", () => {
        document.body.removeChild(audioButton);
        document.body.appendChild(audiobtn);

        Twilio.Video.createLocalAudioTrack({ audio: true }).then(
          (localAudioTrack) => {
            room.localParticipant.publishTrack(localAudioTrack);
            console.log(localAudioTrack);
          }
        );
      });

      // audio streaming stop
      audiobtn.addEventListener("click", () => {
        document.body.removeChild(audiobtn);
        document.body.appendChild(audioButton);

        room.localParticipant.audioTracks.forEach((publication) => {
          publication.track.stop();
          publication.unpublish();
          console.log(publication.track);
        });
      });

      // remote participant
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
              console.log(localParticipant);
              const remoteMediaContainer =
                document.getElementById("remote-media-div");
              if (remoteMediaContainer.children.length === 0)
                remoteMediaContainer.appendChild(publication.track.attach());
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
      console.log(`Unable to connect to Room: ${error.message}`);
    });
}