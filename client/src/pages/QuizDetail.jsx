import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

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
      const response = await fetch(`http://localhost:3001/api/quizzes/${id}`);
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
    const response = await fetch('http://localhost:3001/api/sessions', {
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
    const response = await fetch(`http://localhost:3001/api/quizzes/${id}/questions`, {
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
    return <p>Loading...</p>;
  }

  return (
    <div>
      <Link to="/">← Back to all quizzes</Link>
      <h1>{quiz.title}</h1>
      <button onClick={handleStartSession}>Start Session</button>

      <h2>Questions</h2>
      {questions.length === 0 ? (
        <p>No questions yet.</p>
      ) : (
        <ul>
          {questions.map((q) => (
            <li key={q.id}>{q.question_text}</li>
          ))}
        </ul>
      )}

      <h2>Add a Question</h2>
      <form onSubmit={handleAddQuestion}>
        <input
          type="text"
          placeholder="Question text"
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
        />

        {options.map((option, index) => (
          <div key={index}>
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
            <label>
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

        <button type="submit">Add Question</button>
      </form>
    </div>
  );
}

export default QuizDetail;