import { BrowserRouter, Routes, Route } from 'react-router-dom';
import QuizList from './pages/QuizList';
import QuizDetail from './pages/QuizDetail';
import JoinSession from './pages/JoinSession';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<QuizList />} />
        <Route path="/quiz/:id" element={<QuizDetail />} />
        <Route path="/join" element={<JoinSession />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;