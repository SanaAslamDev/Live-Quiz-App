import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import socket from '../socket';
import './HostSession.css';

function HostSession() {
  const { roomCode } = useParams();
  const [participants, setParticipants] = useState([]);
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [correctOptionIndex, setCorrectOptionIndex] = useState(null);
  const [quizEnded, setQuizEnded] = useState(false);
  const [finalLeaderboard, setFinalLeaderboard] = useState([]);

  useEffect(() => {
    socket.emit('host_join_room', { roomCode });

    const handleParticipantUpdate = (updatedParticipants) => {
      setParticipants(updatedParticipants);
    };

    const handleQuestionStarted = (questionData) => {
      setQuizStarted(true);
      setCurrentQuestion(questionData);
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
    socket.on('question_started', handleQuestionStarted);
    socket.on('answer_revealed', handleAnswerRevealed);
    socket.on('quiz_ended', handleQuizEnded);

    return () => {
      socket.off('participant_update', handleParticipantUpdate);
      socket.off('question_started', handleQuestionStarted);
      socket.off('answer_revealed', handleAnswerRevealed);
      socket.off('quiz_ended', handleQuizEnded);
    };
  }, [roomCode]);

  const handleBeginQuiz = () => {
    socket.emit('start_quiz', { roomCode });
  };

  const handleRevealAnswer = () => {
    socket.emit('reveal_answer', {
      roomCode,
      questionIndex: currentQuestion.questionIndex,
    });
  };

  const handleNextQuestion = () => {
    socket.emit('next_question', { roomCode });
  };

  if (quizEnded) {
  return (
    <div className="page">
      <div className="eyebrow">Final Results</div>
      <h1 className="room-code neon-cyan glitch-in" style={{ fontSize: '2.5rem' }}>Quiz Over!</h1>
      <div className="section-label" style={{ marginTop: '2rem' }}>Final Leaderboard</div>
      <div className="leaderboard-list" style={{ maxWidth: 420, width: '100%' }}>
        {finalLeaderboard.map((p, index) => (
          <div key={p.id} className="leaderboard-row" style={{ animationDelay: `${index * 0.1}s` }}>
            <span>#{index + 1} {p.display_name}</span>
            <span className="neon-amber" style={{ fontWeight: 600 }}>{p.score} pts</span>
          </div>
        ))}
      </div>
    </div>
  );
}

return (
  <div className="page">
    <div className="eyebrow">Room Code</div>
    <h1 className="room-code neon-cyan neon-flicker glitch-in">{roomCode}</h1>

    {!quizStarted && (
      <>
        <p className="hint">Share this code with participants to join.</p>
        <div className="section-label">Players Joined</div>
        <div className="player-list">
          {participants.length === 0 ? (
            <p>Waiting for players...</p>
          ) : (
            participants.map((p, i) => (
              <div key={p.id} className="player-chip" style={{ animationDelay: `${i * 0.08}s` }}>
                {p.display_name}
              </div>
            ))
          )}
        </div>
        <button className="btn-primary" onClick={handleBeginQuiz} disabled={participants.length === 0}>
          Begin Quiz
        </button>
      </>
    )}

    {quizStarted && currentQuestion && !revealed && (
      <div className="question-panel fade-slide-in">
        <div className="question-meta">
          Question {currentQuestion.questionIndex + 1} of {currentQuestion.totalQuestions}
        </div>
        <h2 className="question-text">{currentQuestion.questionText}</h2>
        <ul className="option-list">
          {currentQuestion.options.map((option, index) => (
            <li key={index}>{option}</li>
          ))}
        </ul>
        <button className="btn-primary" onClick={handleRevealAnswer}>Reveal Answer</button>
      </div>
    )}

    {revealed && (
      <div className="question-panel fade-slide-in">
        <div className="section-label">Correct Answer</div>
        <h2 className="correct-answer neon-green">
          {currentQuestion.options[correctOptionIndex]}
        </h2>
        <div className="section-label">Leaderboard</div>
        <div className="leaderboard-list">
          {leaderboard.map((p, index) => (
            <div key={p.id} className="leaderboard-row" style={{ animationDelay: `${index * 0.08}s` }}>
              <span>{p.display_name}</span>
              <span className="neon-amber" style={{ fontWeight: 600 }}>{p.score} pts</span>
            </div>
          ))}
        </div>
        <button className="btn-primary" onClick={handleNextQuestion}>Next Question</button>
      </div>
    )}
  </div>
);
}

export default HostSession;