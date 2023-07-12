const token = document.getElementById("token");
const button = document.getElementById("button");
// const disconnected = document.getElementById('disconnected');

button.addEventListener("click", () => {
  const roomToken = token.value;

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

      // for video

      const newButton = document.createElement("button");
      newButton.textContent = "Video On";
      document.body.appendChild(newButton);

      newButton.addEventListener("click", () => {

        document.body.removeChild(newButton);
        document.body.appendChild(videobtn);

        Twilio.Video.createLocalVideoTrack().then((track) => {
          console.log("track", track);

          const localMediaContainer = document.getElementById("local-media");
          localMediaContainer?.appendChild(track.attach());

          room.localParticipant.publishTrack(track);
         
        });
      });

      const videobtn = document.createElement("button");
      videobtn.textContent = "Video Off";

      videobtn.addEventListener("click", () => {

        document.body.removeChild(videobtn);
        document.body.appendChild(newButton);

        room.localParticipant.videoTracks.forEach((publication) => {
          publication.track.stop();
          publication.unpublish();

          publication.track.detach().forEach(function (mediaElement) {
            mediaElement.remove();
        });
      });
    });

      // for audio
      const audioButton = document.createElement("button");
      audioButton.textContent = "Audio On";
      document.body.appendChild(audioButton);
      

      audioButton.addEventListener("click", () => {
        document.body.removeChild(audioButton)
        document.body.appendChild(audiobtn);

        Twilio.Video.createLocalAudioTrack().then((track) => {
          room.localParticipant.publishTrack(track);
          
        });
      });

      const audiobtn = document.createElement("button");
      audiobtn.textContent = "Audio Off";
      
      audiobtn.addEventListener("click", () => {

        document.body.removeChild(audiobtn);
        document.body.appendChild(audioButton);


        room.localParticipant.audioTracks.forEach((publication) => {
          publication.track.stop();
          publication.unpublish();
         console.log(publication.track)
        });
      });



      // remote participant
      room.on("trackSubscribed", () => {
        console.log("trackSubscribed");
        room.participants.forEach((participant) => {
          participant.tracks.forEach((publication) => {
            console.log(publication.track.kind);
            if (publication.track) {
              const localMediaContainer =
                document.getElementById("remote-media-div");
              localMediaContainer.appendChild(publication.track.attach());
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
      // const disconnected = document.createElement("button");
      // disconnected.textContent = "disconnected";
      // // document.body.appendChild(disconnected);

      // disconnected.addEventListener("click", () => {
      //   console.log(room);
      //   room.on("disconnected", (room) => {
      //     // Detach the local media elements
      //     room.localParticipant.tracks.forEach((publication) => {
      //       const attachedElements = publication.track.detach();
      //       attachedElements.forEach((element) => element.remove());
      //     });
      //   });

      //   document.body.removeChild(disconnected);
      //   document.body.removeChild(videobtn);
      //   document.body.removeChild(videobtn);
      //   // To disconnect from a Room
      //   room.disconnect();
      //   console.log("disconnected to the room");
      // });
    })
    .catch((error) => {
      console.log(`Unable to connect to Room: ${error.message}`);
    });
});
