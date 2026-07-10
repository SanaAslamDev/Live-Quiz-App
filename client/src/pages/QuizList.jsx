import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './QuizList.css';

function QuizList() {
  const [title, setTitle] = useState('');
  const [quizzes, setQuizzes] = useState([]);

  const fetchQuizzes = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/quizzes');
      const data = await response.json();
      if (data.success) {
        setQuizzes(data.quizzes);
      }
    } catch (err) {
      console.error('Error fetching quizzes:', err);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3001/api/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });
      const data = await response.json();
      if (data.success) {
        setTitle('');
        fetchQuizzes();
      } else {
        console.error('Error creating quiz:', data.error);
      }
    } catch (err) {
      console.error('Network error:', err);
    }
  };

  const handleDelete = async (e, quizId) => {
  e.preventDefault();
  e.stopPropagation();

  if (!window.confirm('Delete this quiz? This cannot be undone.')) return;

  try {
    const response = await fetch(`http://localhost:3001/api/quizzes/${quizId}`, {
      method: 'DELETE',
    });
    const data = await response.json();
    if (data.success) {
      fetchQuizzes();
    }
  } catch (err) {
    console.error('Error deleting quiz:', err);
  }
};

  return (
    <div className="page">
      <div className="eyebrow">Quiz Builder</div>
   <h1 className="page-title neon-cyan glitch-in">Create a Quiz</h1>

      <form className="create-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Quiz title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button type="submit" className="btn-primary">Create</button>
      </form>

      <div className="quiz-section-label">Your Quizzes</div>
      <div className="quiz-list">
        {quizzes.length === 0 ? (
          <p className="empty-state">No quizzes yet — create your first one above.</p>
        ) : (
      quizzes.map((quiz, index) => (
  <Link
    key={quiz.id}
    to={`/quiz/${quiz.id}`}
    className="quiz-card"
    style={{ animationDelay: `${0.5 + index * 0.08}s` }}
  >
    <span className="quiz-card-title">{quiz.title}</span>
    <button className="btn-delete" onClick={(e) => handleDelete(e, quiz.id)}>
      ✕
    </button>
  </Link>
))
        )}
      </div>
    </div>
  );
}

export default QuizList;