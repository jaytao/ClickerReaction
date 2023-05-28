import './App.css';
import React, { useState, useEffect, useRef } from "react";
import boxes from "./boxes";
import Box from "./Box"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faVolumeUp, faVolumeMute } from "@fortawesome/free-solid-svg-icons";

import clickSound from './sounds/boop.wav';

function App() {

  const [squares, setSquares] = useState(boxes)
  const [score, setScore] = useState(0)
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [highestScore, setHighestScore] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [shortestTime, setShortestTime] = useState(Number.MAX_SAFE_INTEGER);

  const [isSoundEnabled, setIsSoundEnabled] = useState(false);
  const clickSoundAudio = useRef(null);

  useEffect(() => {
    clickSoundAudio.current = new Audio(clickSound);
  }, []);

  function toggle(id) {
    setSquares(prevSquares => {
        const newSquares = []
        for(let i = 0; i < prevSquares.length; i++) {
            const currentSquare = prevSquares[i]
            if(currentSquare.id === id) {
                const updatedSquare = {
                    ...currentSquare,
                    on: !currentSquare.on
                }
                newSquares.push(updatedSquare)
            } else {
                newSquares.push(currentSquare)
            }
        }
        return newSquares
    })
  }


  const squareElements = squares.map(square => (
    <Box 
        key={square.id} 
        id={square.id}
        on={square.on} 
        toggle={() => handleButtonClick(square.id, square.on)}
    />
  ))

  function startEvents(){
    clearSquares()
    setTimeElapsed(0) // Reset timer
    startGame()
    setGameOver(false); // Reset game over state
  }

  function startGame() {
    setIsGameStarted(true);
  }

  useEffect(() => {
    let timer;
    if (isGameStarted) {
      timer = setInterval(() => {
        setSquares(prevSquares => {
          const randomIndex = Math.floor(Math.random() * prevSquares.length);
          const updatedSquares = prevSquares.map((square, index) => ({
            ...square,
            on: index === randomIndex ? true : square.on
          }));
          // Check if all squares are on
          if(updatedSquares.every(square => square.on)) {
            setGameOver(true);
            clearInterval(timer);
          }
          return updatedSquares;
        });
      }, 1000 / speedMultiplier);
    }

    return () => {
      clearInterval(timer);
    };
  }, [isGameStarted, speedMultiplier]);


  function clearSquares() {
    const clearedSquares = squares.map(square => ({
      ...square,
      on: false
    }));
    setSquares(clearedSquares);
    setScore(0); // Reset score counter
    setSpeedMultiplier(1); // Reset speed multiplier
  }

  function handleButtonClick(id, isOn) {
    if (isSoundEnabled) {
      let audioClone = clickSoundAudio.current.cloneNode(); // Allow multiple sounds to play at once
      audioClone.play();
    }

    toggle(id);
    if (isOn) {
      const newScore = score + 1;
      setScore(newScore);
      if (newScore > highestScore) {
        setHighestScore(newScore);
      }
      if (newScore > 50 && newScore % 6 === 0 ){
        setSpeedMultiplier(prevMultiplier => prevMultiplier * 1.04);
      }
      if (newScore <= 50 && newScore > 20 && newScore % 3 === 0) {
        setSpeedMultiplier(prevMultiplier => prevMultiplier * 1.08);
      }
      if (newScore <= 20 && newScore % 3 === 0) {
        setSpeedMultiplier(prevMultiplier => prevMultiplier * 1.15);
      }
    } else {
      // Ensure score never falls below 0
      if (score > 4) {
        setScore(prevScore => prevScore - 5);
      } else {
        setScore(0);
      }
    }
  }

  useEffect(() => {
    let interval;
  
    if (isGameStarted) {
      const startTime = Date.now() - timeElapsed;
      interval = setInterval(() => {
        setTimeElapsed(Date.now() - startTime);
      }, 1);
    }
  
    if (score >= 50 || gameOver) {
      clearInterval(interval);
      if (timeElapsed < shortestTime) {
        setShortestTime(timeElapsed);
      }
    }
  
    return () => {
      clearInterval(interval);
    };
  }, [isGameStarted, score, gameOver, timeElapsed, shortestTime]);
  

  const formatTime = (time) => {
    const milliseconds = Math.floor((time % 1000) / 10);
    const seconds = Math.floor((time / 1000) % 60);
    const minutes = Math.floor((time / (1000 * 60)) % 60);
  
    return `${minutes}:${seconds < 10 ? '0' + seconds : seconds}.${milliseconds < 10 ? '0' + milliseconds : milliseconds}`;
  };

  return (
    <div className="App">
      <header className="App-header">
        <a className="textDiv">
          A click-based reaction game, inspired by ones used by professional athletes to test reflexes.
          <br></br><br></br>
          <strong>How to play? </strong>
          Click as many green buttons as possible before the grid fills up. The game will speed up so be quick. Pressing the wrong square gets minus points!
        </a>
      </header>
      <br></br>
      <body  className="bodyDiv">
        <div className="gamePanel">
          <div className="scorePanel">
            <span>Current Score: {score}</span>
            <span>Highest Score: {highestScore}</span> 
          </div>
          {gameOver && <div className="gameOver">GAME OVER</div>}
          <div>
            <div onClick={() => setIsSoundEnabled(prevState => !prevState)}>
              {isSoundEnabled ? (
                <FontAwesomeIcon icon={faVolumeUp} />
              ) : (
                <FontAwesomeIcon icon={faVolumeMute} />
              )}
            </div>
          </div>
          <button onClick={startEvents} className="startButton">Click to Start</button>
        </div>
        
        <div>{squareElements}</div>
        
        <div className="stopWatch">
          <span>Elapsed time to 50-pts: {formatTime(timeElapsed)}</span>
          <span><div>Shortest time: {shortestTime === Number.MAX_SAFE_INTEGER ? 'N/A' : formatTime(shortestTime)}</div></span>
        </div>
      </body>
      {gameOver && <div className="gameOverMobile">GAME OVER</div>}
    </div>
  );
}

export default App;

