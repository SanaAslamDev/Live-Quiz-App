import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

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

  return (
    <div>
      <h1>Create a Quiz</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Quiz title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button type="submit">Create Quiz</button>
      </form>

      <h2>Your Quizzes</h2>
      <ul>
        {quizzes.map((quiz) => (
          <li key={quiz.id}>
            <Link to={`/quiz/${quiz.id}`}>{quiz.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default QuizList;