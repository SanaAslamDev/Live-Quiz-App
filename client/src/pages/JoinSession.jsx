import { useState, useEffect } from 'react';
import socket from '../socket';
import './JoinSession.css';

function JoinSession() {
  const [roomCode, setRoomCode] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [joined, setJoined] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [error, setError] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [correctOptionIndex, setCorrectOptionIndex] = useState(null);
  const [quizEnded, setQuizEnded] = useState(false);
  const [finalLeaderboard, setFinalLeaderboard] = useState([]);

  useEffect(() => {
    const handleParticipantUpdate = (updatedParticipants) => {
      setParticipants(updatedParticipants);
      setJoined(true);
    };

    const handleJoinError = ({ error }) => {
      setError(error);
    };

    const handleQuestionStarted = (questionData) => {
      setCurrentQuestion(questionData);
      setSelectedOption(null);
      setHasAnswered(false);
      setRevealed(false);
    };

    const handleAnswerRevealed = ({ correctOptionIndex, leaderboard }) => {
      setRevealed(true);
      setCorrectOptionIndex(correctOptionIndex);
      setLeaderboard(leaderboard);
    };

    const handleQuizEnded = ({ finalLeaderboard }) => {
      setQuizEnded(true);
      setFinalLeaderboard(finalLeaderboard);
    };

    socket.on('participant_update', handleParticipantUpdate);
    socket.on('join_error', handleJoinError);
    socket.on('question_started', handleQuestionStarted);
    socket.on('answer_revealed', handleAnswerRevealed);
    socket.on('quiz_ended', handleQuizEnded);

    return () => {
      socket.off('participant_update', handleParticipantUpdate);
      socket.off('join_error', handleJoinError);
      socket.off('question_started', handleQuestionStarted);
      socket.off('answer_revealed', handleAnswerRevealed);
      socket.off('quiz_ended', handleQuizEnded);
    };
  }, []);

  const handleJoin = (e) => {
    e.preventDefault();
    setError('');
    socket.emit('join_room', { roomCode, displayName });
  };

  const handleSelectOption = (index) => {
    if (hasAnswered) return;
    setSelectedOption(index);
    setHasAnswered(true);
    socket.emit('submit_answer', {
      roomCode,
      questionIndex: currentQuestion.questionIndex,
      selectedOption: index,
    });
  };

  if (quizEnded) {
    return (
      <div className="page">
        <div className="section-label">Final Results</div>
        <h1 className="result-heading neon-magenta glitch-in">Quiz Over!</h1>
        <div className="player-list" style={{ marginTop: '1.5rem' }}>
          {finalLeaderboard.map((p, index) => (
            <div key={p.id} className="player-chip" style={{ animationDelay: `${index * 0.1}s` }}>
              #{index + 1} — {p.display_name} — {p.score} pts
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (revealed && currentQuestion) {
    const wasCorrect = selectedOption === correctOptionIndex;
    return (
      <div className="page">
        <div className="question-panel fade-slide-in">
          <h2 className={`result-heading ${wasCorrect ? 'neon-green' : 'neon-red'}`}>
            {wasCorrect ? 'Correct! 🎉' : 'Not quite!'}
          </h2>
          <p>The correct answer was: {currentQuestion.options[correctOptionIndex]}</p>
          <div className="section-label">Leaderboard</div>
          <div className="player-list" style={{ margin: '0 auto' }}>
            {leaderboard.map((p, index) => (
              <div key={p.id} className="player-chip" style={{ animationDelay: `${index * 0.08}s` }}>
                {p.display_name} — {p.score} pts
              </div>
            ))}
          </div>
          <p className="waiting-text">Waiting for the host to continue...</p>
        </div>
      </div>
    );
  }

  if (joined && currentQuestion) {
    return (
      <div className="page">
        <div className="question-panel fade-slide-in">
          <div className="question-meta">
            Question {currentQuestion.questionIndex + 1} of {currentQuestion.totalQuestions}
          </div>
          <h2 className="question-text">{currentQuestion.questionText}</h2>
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              className={`answer-btn ${selectedOption === index ? 'selected' : ''}`}
              onClick={() => handleSelectOption(index)}
              disabled={hasAnswered}
            >
              {option}
            </button>
          ))}
          {hasAnswered && <p className="waiting-text">Answer submitted! Waiting for others...</p>}
        </div>
      </div>
    );
  }

  if (joined) {
    return (
      <div className="page">
        <h1 className="neon-magenta glitch-in">You're in!</h1>
        <p>Waiting for the host to start the quiz...</p>
        <div className="section-label">Players in this room</div>
        <div className="player-list">
          {participants.map((p, i) => (
            <div key={p.id} className="player-chip" style={{ animationDelay: `${i * 0.08}s` }}>
              {p.display_name}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="section-label">Join a Quiz</div>
      <h1 className="neon-magenta glitch-in">Enter Room</h1>
      <form className="join-form" onSubmit={handleJoin}>
        <input
          type="text"
          placeholder="Room code"
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value)}
        />
        <input
          type="text"
          placeholder="Your name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />
        <button type="submit" className="btn-join">Join</button>
      </form>
      {error && <p className="error-text">{error}</p>}
    </div>
  );
}

export default JoinSession;