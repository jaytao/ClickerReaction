import "./App.css";
import React, { useState, useEffect, useRef } from "react";
import boxes from "./boxes";
import Box from "./Box";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faVolumeUp, faVolumeMute } from "@fortawesome/free-solid-svg-icons";

import clickSound from "./sounds/boop.wav";

function App() {
  const timeLimit = 15 * 1000;
  const [squares, setSquares] = useState(boxes);
  const [score, setScore] = useState(0);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [highestScore, setHighestScore] = useState(0);
  const [shortestTime, setShortestTime] = useState(Number.MAX_SAFE_INTEGER);
  const [timeElapsed, setTimeElapsed] = useState(0);

  const [isSoundEnabled, setIsSoundEnabled] = useState(false);
  const clickSoundAudio = useRef(null);

  let timerInterval = null;
  let runnerInterval = null;
  let endTimerTimeout = null;
  let speedMultiplier = 10;
  let intervalCounter = 0;
  let intervalThreshold = 0;

  let startTime = null;

  useEffect(() => {
    clickSoundAudio.current = new Audio(clickSound);
  }, []);

  function toggle(id) {
    squares[id].on = !squares[id].on;
  }
  const squareElements = squares.map((square) => (
    <Box
      id={square.id}
      on={square.on}
      toggle={() => handleButtonClick(square.id, square.on)}
    />
  ));

  function startEvents() {
    squares.forEach((box) => {
      box.on = false;
    });
    setTimeElapsed(0); // Reset timer
    setIsGameStarted(true);
    setGameOver(false); // Reset game over state
    setScore(0); // Reset score counter
    runnerInterval = setInterval(runInterval, 100);
    timerInterval = setInterval(timeInterval, 1);
    endTimerTimeout = setTimeout(() => {
      // sometimes it doesn't end exactly at timeLimit, off by like 2-3 ms
      setTimeElapsed(timeLimit);
      endGame();
    }, timeLimit);
    console.log(`run ${runnerInterval} time ${timerInterval}`);
    intervalCounter = 0;
    intervalThreshold = intervalCounter + speedMultiplier;
    startTime = Date.now();
  }

  function endGame() {
    setGameOver(true);
    console.log(`stop: run ${runnerInterval} time ${timerInterval}`);
    clearInterval(runnerInterval);
    clearInterval(timerInterval);
    clearTimeout(endTimerTimeout);
    if (timeElapsed < shortestTime && score >= 50) {
      setShortestTime(timeElapsed);
    }
    console.log(`${highestScore} ${score}`);
    setHighestScore((currHighest) => Math.max(currHighest, score));
  }

  function runInterval() {
    if (intervalCounter === intervalThreshold) {
      const unToggled = squares.filter((obj) => !obj.on);
      const randomIndex =
        unToggled[Math.floor(Math.random() * unToggled.length)].id;
      toggle(randomIndex);

      // checking for all squares being toggled
      if (squares.every((square) => square.on)) {
        endGame();
      }

      // adjusting speed
      if (speedMultiplier >= 4 && score % 5 === 0) {
        speedMultiplier -= 1;
      }

      intervalThreshold = intervalCounter + speedMultiplier;
    }

    intervalCounter += 1;
  }

  function timeInterval() {
    setTimeElapsed(Date.now() - startTime);
  }

  function handleButtonClick(id, isOn) {
    if (isOn && !gameOver) {
      toggle(id);
      setScore((score) => score + 1);
      if (isSoundEnabled) {
        let audioClone = clickSoundAudio.current.cloneNode(); // Allow multiple sounds to play at once
        audioClone.play();
      }
    }
  }

  useEffect(() => {
    if (score === 50) {
      endGame();
    }
  }, [score]);

  const formatTime = (time) => {
    const milliseconds = Math.floor(time % 1000);
    const seconds = Math.floor(time / 1000);

    return `${seconds}.${
      milliseconds < 10
        ? "00" + milliseconds
        : milliseconds < 100
        ? "0" + milliseconds
        : milliseconds
    }`;
  };

  return (
    <div className="App">
      <header className="App-header">
        <a className="textDiv">
          A click-based reaction game, inspired by ones used by professional
          athletes to test reflexes.
          <br></br>
          <br></br>
          <strong>How to play? </strong>
          Click green buttons before the grid fills up. Avoid wrong squares for
          minus points. The game will speed up so be quick.
        </a>
      </header>
      <br></br>
      <body className="bodyDiv">
        <div className="gamePanel">
          <div className="scorePanel">
            <span>Current Score: {score}</span>
            <span>Highest Score: {highestScore}</span>
          </div>
          {gameOver && <div className="gameOver">GAME OVER</div>}
          <div>
            <div onClick={() => setIsSoundEnabled((prevState) => !prevState)}>
              {isSoundEnabled ? (
                <FontAwesomeIcon icon={faVolumeUp} />
              ) : (
                <FontAwesomeIcon icon={faVolumeMute} />
              )}
            </div>
          </div>
          <button onClick={startEvents} className="startButton">
            Click to Start
          </button>
        </div>

        <div>{squareElements}</div>

        <div className="stopWatch">
          <span>Elapsed time to 50-pts: {formatTime(timeElapsed)}</span>
          <span>
            <div>
              Shortest time:{" "}
              {shortestTime === Number.MAX_SAFE_INTEGER
                ? "N/A"
                : formatTime(shortestTime)}
            </div>
          </span>
        </div>
      </body>
      {gameOver && <div className="gameOverMobile">GAME OVER</div>}
    </div>
  );
}

export default App;
