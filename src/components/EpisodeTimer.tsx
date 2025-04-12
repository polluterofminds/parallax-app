import useEpisodeTimer from "../hooks/useEpisodeTimer";

function EpisodeTimer() {
  const { timeLeft, episode } = useEpisodeTimer();

  return (
    <div className="episode-timer">
      {timeLeft?.isOver ? (
        <div>Episode has ended!</div>
      ) : (
        <div>
          <h3>Time remaining in Episode {episode?.case_number}:</h3>
          <div className="countdown">
            <span>{timeLeft?.days}d </span>
            <span>{timeLeft?.hours}h </span>
            <span>{timeLeft?.minutes}m </span>
            <span>{timeLeft?.seconds}s</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default EpisodeTimer;
