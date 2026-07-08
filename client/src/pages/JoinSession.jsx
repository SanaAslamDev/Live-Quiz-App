import { useState, useEffect } from 'react';
import socket from '../socket';

function JoinSession() {
  const [roomCode, setRoomCode] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [joined, setJoined] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [error, setError] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [hasAnswered, setHasAnswered] = useState(false);

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
    };

    socket.on('participant_update', handleParticipantUpdate);
    socket.on('join_error', handleJoinError);
    socket.on('question_started', handleQuestionStarted);

    return () => {
      socket.off('participant_update', handleParticipantUpdate);
      socket.off('join_error', handleJoinError);
      socket.off('question_started', handleQuestionStarted);
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

  if (joined && currentQuestion) {
    return (
      <div>
        <p>Question {currentQuestion.questionIndex + 1} of {currentQuestion.totalQuestions}</p>
        <h2>{currentQuestion.questionText}</h2>
        <ul>
          {currentQuestion.options.map((option, index) => (
            <li key={index}>
              <button
                onClick={() => handleSelectOption(index)}
                disabled={hasAnswered}
                style={{
                  backgroundColor: selectedOption === index ? '#cce5ff' : 'white',
                }}
              >
                {option}
              </button>
            </li>
          ))}
        </ul>
        {hasAnswered && <p>Answer submitted! Waiting for others...</p>}
      </div>
    );
  }

  if (joined) {
    return (
      <div>
        <h1>You're in!</h1>
        <p>Waiting for the host to start the quiz...</p>
        <h3>Players in this room:</h3>
        <ul>
          {participants.map((p) => (
            <li key={p.id}>{p.display_name}</li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div>
      <h1>Join a Quiz</h1>
      <form onSubmit={handleJoin}>
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
        <button type="submit">Join</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

export default JoinSession;