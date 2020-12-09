import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlay,
  faPause,
  faAngleLeft,
  faAngleRight,
  faRandom,
  faRedo,
  faVolumeMute,
  faVolumeUp,
} from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";

const Player = ({
  songs,
  setSongs,
  currentSong,
  setCurrentSong,
  isPlaying,
  setIsPlaying,
  audioRef,
}) => {
  //state
  const [songInfo, setSongInfo] = useState({
    currentTime: 0,
    duration: 0,
    volume: 0,
    animationPercentage: 0,
  });
  const [activeVolume, setActiveVolume] = useState(true);

  const [isShuffle, setIsShuffle] = useState(false);
  useEffect(() => {
    if (isShuffle) {
      ManageShuffle();
    } else {
      setShuffleArray([]);
    }
  }, [isShuffle]);

  const [isRepeat, setIsRepeat] = useState(false);
  const [shuffleArray, setShuffleArray] = useState([]);

  useEffect(() => {
    if (shuffleArray.length === 0 && isShuffle) {
      ManageShuffle();
    }
  }, [shuffleArray]);

  const activeLibraryHandler = (nextPrev) => {
    const newSongs = songs.map((song) => {
      if (song.id === nextPrev.id) {
        return {
          ...song,
          active: true,
        };
      } else {
        return {
          ...song,
          active: false,
        };
      }
    });
    setSongs(newSongs);
  };

  //Event Handler
  const playSongPlayer = () => {
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(!isPlaying);
    } else {
      audioRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const timeUpdateHandler = (e) => {
    const current = e.target.currentTime;
    const duration = e.target.duration;
    //calculate a percentage
    const roundedCurrent = Math.round(current);
    const roundedDuration = Math.round(duration);
    const animation = Math.round((roundedCurrent / roundedDuration) * 100);

    setSongInfo({
      ...songInfo,
      currentTime: current,
      duration,
      volume: e.target.volume,
      animationPercentage: animation,
    });
  };

  const getTime = (time) => {
    return (
      Math.floor(time / 60) + ":" + ("0" + Math.floor(time % 60)).slice(-2)
    );
  };

  const skipTrackHandler = async (direction) => {
    if (isRepeat) {
      audioRef.current.currentTime = 0;
      setSongInfo({
        ...songInfo,
        currentTime: 0,
        animationPercentage: 0,
      });
      if (isPlaying) audioRef.current.play();
      return;
    }
    if (isShuffle) {
      let newSongIndex = shuffleArray[shuffleArray.length - 1];
      let temporaryArray = shuffleArray.filter(
        (index) => index !== newSongIndex
      );
      setShuffleArray(temporaryArray);
      await setCurrentSong(songs[newSongIndex]);
      activeLibraryHandler(songs[newSongIndex]);
    } else {
      let currentIndex = songs.findIndex((song) => song.id === currentSong.id);
      if (direction === "skip-forward") {
        await setCurrentSong(songs[(currentIndex + 1) % songs.length]);
        activeLibraryHandler(songs[(currentIndex + 1) % songs.length]);
      }
      if (direction === "skip-back") {
        let possibleNewIndex = (currentIndex - 1) % songs.length;
        if (possibleNewIndex === -1) {
          await setCurrentSong(songs[songs.length - 1]);
          activeLibraryHandler(songs[songs.length - 1]);
        } else {
          await setCurrentSong(songs[possibleNewIndex]);
          activeLibraryHandler(songs[possibleNewIndex]);
        }
      }
    }
    if (isPlaying) audioRef.current.play();
  };

  const dragHandler = (e) => {
    audioRef.current.currentTime = e.target.value;
    setSongInfo({ ...songInfo, currentTime: e.target.value });
  };

  const tractAnim = {
    transform: `translateX(${songInfo.animationPercentage}%)`,
  };

  const songEndHandler = async () => {
    if (isRepeat) {
      if (isPlaying) audioRef.current.play();
      return;
    }
    if (isShuffle) {
      let newSongIndex = shuffleArray[shuffleArray.length - 1];
      let temporaryArray = shuffleArray.filter(
        (index) => index !== newSongIndex
      );
      setShuffleArray(temporaryArray);
      await setCurrentSong(songs[newSongIndex]);
      activeLibraryHandler(songs[newSongIndex]);
    } else {
      let currentIndex = songs.findIndex((song) => song.id === currentSong.id);
      await setCurrentSong(songs[(currentIndex + 1) % songs.length]);
      activeLibraryHandler(songs[(currentIndex + 1) % songs.length]);
    }
    if (isPlaying) audioRef.current.play();
  };

  const ManageShuffle = () => {
    let temporaryArray = [];
    while (temporaryArray.length < songs.length) {
      const songIndex = Math.floor(Math.random() * songs.length);
      if (temporaryArray.indexOf(songIndex) === -1)
        temporaryArray.push(songIndex);
    }
    let currentIndex = songs.findIndex((song) => song.id === currentSong.id);
    temporaryArray = temporaryArray.filter((index) => index !== currentIndex);
    setShuffleArray(temporaryArray);
  };

  const shuffleTrackHandler = () => {
    setIsShuffle(!isShuffle);
  };

  const RepeatTrackHandler = () => {
    setIsRepeat(!isRepeat);
  };

  const changeVolume = (e) => {
    let value = e.target.value;
    audioRef.current.volume = value;
    setSongInfo({ ...songInfo, volume: value });
  };

  // const muteUp = () =>{

  // }

  return (
    <div className="player">
      <div className="time-control">
        <p>{getTime(songInfo.currentTime)}</p>
        <div
          style={{
            background: `linear-gradient(to right, ${currentSong.color[0]},${currentSong.color[1]})`,
          }}
          className="track"
        >
          <input
            min={0}
            type="range"
            max={songInfo.duration || 0}
            onChange={dragHandler}
            value={songInfo.currentTime}
          />
          <div className="animate-track" style={tractAnim}></div>
        </div>

        <p>{songInfo.duration ? getTime(songInfo.duration) : "0:00"}</p>
      </div>
      <div className="play-control">
        <FontAwesomeIcon
          onClick={shuffleTrackHandler}
          icon={faRandom}
          className={isShuffle ? "shuffle" : ""}
          size="1x"
        />
        <FontAwesomeIcon
          onClick={() => skipTrackHandler("skip-back")}
          className="skip-back"
          icon={faAngleLeft}
          size="2x"
        />
        <FontAwesomeIcon
          onClick={playSongPlayer}
          className="play"
          icon={isPlaying ? faPause : faPlay}
          size="2x"
        />
        <FontAwesomeIcon
          onClick={() => skipTrackHandler("skip-forward")}
          className="skip-forward"
          icon={faAngleRight}
          size="2x"
        />
        <FontAwesomeIcon
          onClick={RepeatTrackHandler}
          icon={faRedo}
          className={isRepeat ? "auto-repeat" : ""}
          size="1x"
        />
      </div>
      <div className="volume-control">
        <FontAwesomeIcon
          onClick={() => setActiveVolume(!activeVolume)}
          className="volume"
          icon={activeVolume ? faVolumeUp : faVolumeMute}
          size="lg"
        />
        <input
          onChange={changeVolume}
          value={songInfo.volume}
          max="1"
          min="0"
          step="0.01"
          type="range"
        />
      </div>
      <audio
        onTimeUpdate={timeUpdateHandler}
        onLoadedMetadata={timeUpdateHandler}
        ref={audioRef}
        src={currentSong.audio}
        onEnded={songEndHandler}
      ></audio>
    </div>
  );
};

export default Player;
