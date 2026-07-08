import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import socket from '../socket';

function HostSession() {
  const { roomCode } = useParams();
  const [participants, setParticipants] = useState([]);
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);

  useEffect(() => {
    socket.emit('host_join_room', { roomCode });

    const handleParticipantUpdate = (updatedParticipants) => {
      setParticipants(updatedParticipants);
    };

    const handleQuestionStarted = (questionData) => {
      setQuizStarted(true);
      setCurrentQuestion(questionData);
    };

    socket.on('participant_update', handleParticipantUpdate);
    socket.on('question_started', handleQuestionStarted);

    return () => {
      socket.off('participant_update', handleParticipantUpdate);
      socket.off('question_started', handleQuestionStarted);
    };
  }, [roomCode]);

  const handleBeginQuiz = () => {
    socket.emit('start_quiz', { roomCode });
  };

  return (
    <div>
      <h1>Room Code</h1>
      <h2>{roomCode}</h2>

      {!quizStarted && (
        <>
          <p>Share this code with participants to join.</p>
          <h3>Players joined:</h3>
          {participants.length === 0 ? (
            <p>Waiting for players...</p>
          ) : (
            <ul>
              {participants.map((p) => (
                <li key={p.id}>{p.display_name}</li>
              ))}
            </ul>
          )}
          <button onClick={handleBeginQuiz} disabled={participants.length === 0}>
            Begin Quiz
          </button>
        </>
      )}

      {quizStarted && currentQuestion && (
        <div>
          <p>Question {currentQuestion.questionIndex + 1} of {currentQuestion.totalQuestions}</p>
          <h2>{currentQuestion.questionText}</h2>
          <ul>
            {currentQuestion.options.map((option, index) => (
              <li key={index}>{option}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default HostSession;