const toggleFullscreen:TToggleFullScreen = (player) => {
    if (
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement
    ) {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    } else {
      if (player?.requestFullscreen) {
        player.requestFullscreen();
      } else if (player?.webkitRequestFullscreen) {
        player.webkitRequestFullscreen();
      } else if (player?.mozRequestFullScreen) {
        player.mozRequestFullScreen();
      } else if (player?.msRequestFullscreen) {
        player.msRequestFullscreen();
      }
    }
  };

export default { toggleFullscreen };
