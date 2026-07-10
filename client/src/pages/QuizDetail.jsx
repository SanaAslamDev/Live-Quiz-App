import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import './QuizDetail.css';
const API_URL = import.meta.env.VITE_API_URL;

function QuizDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctIndex, setCorrectIndex] = useState(0);

  const fetchQuizDetail = async () => {
    try {
      const response = await fetch(`${API_URL}/api/quizzes/${id}`);
      const data = await response.json();
      if (data.success) {
        setQuiz(data.quiz);
        setQuestions(data.questions);
      }
    } catch (err) {
      console.error('Error fetching quiz detail:', err);
    }
  };



const handleStartSession = async () => {
  try {
   const response = await fetch(`${API_URL}/api/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quiz_id: id }),
    });

    const data = await response.json();

    if (data.success) {
      navigate(`/host/${data.session.room_code}`);
    } else {
      console.error('Error starting session:', data.error);
    }
  } catch (err) {
    console.error('Network error:', err);
  }
};

  const handleAddQuestion = async (e) => {
  e.preventDefault();

  try {
    const response = await fetch(`${API_URL}/api/quizzes/${id}/questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question_text: questionText,
        options: options,
        correct_option_index: correctIndex,
      }),
    });

    const data = await response.json();

    if (data.success) {
      setQuestionText('');
      setOptions(['', '', '', '']);
      setCorrectIndex(0);
      fetchQuizDetail();
    } else {
      console.error('Error adding question:', data.error);
    }
  } catch (err) {
    console.error('Network error:', err);
  }
};
  useEffect(() => {
    fetchQuizDetail();
  }, [id]);

  if (!quiz) {
  return <p style={{ padding: '2rem', color: 'var(--muted)' }}>Loading...</p>;
}

return (
  <div className="page">
    <Link to="/" className="back-link">← Back to all quizzes</Link>

    <div className="quiz-title-row">
      <h1 className="neon-cyan">{quiz.title}</h1>
      <button className="btn-start" onClick={handleStartSession}>
        Start Session
      </button>
    </div>

    <div className="section">
      <div className="section-label">Questions</div>
      {questions.length === 0 ? (
        <p>No questions yet — add one below.</p>
      ) : (
        questions.map((q) => (
          <div key={q.id} className="question-card fade-slide-in">
            {q.question_text}
          </div>
        ))
      )}
    </div>

    <div className="section">
      <div className="section-label">Add a Question</div>
      <form className="add-question-form" onSubmit={handleAddQuestion}>
        <input
          type="text"
          placeholder="Question text"
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
        />
        {options.map((option, index) => (
          <div className="option-row" key={index}>
            <input
              type="text"
              placeholder={`Option ${index + 1}`}
              value={option}
              onChange={(e) => {
                const newOptions = [...options];
                newOptions[index] = e.target.value;
                setOptions(newOptions);
              }}
            />
            <label className="correct-label">
              <input
                type="radio"
                name="correctOption"
                checked={correctIndex === index}
                onChange={() => setCorrectIndex(index)}
              />
              Correct
            </label>
          </div>
        ))}
        <button type="submit" className="btn-add">Add Question</button>
      </form>
    </div>
  </div>
);
}

export default QuizDetail;