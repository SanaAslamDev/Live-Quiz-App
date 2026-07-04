
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import QuizList from './pages/QuizList';
import QuizDetail from './pages/QuizDetail';



function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<QuizList />} />
        <Route path="/quiz/:id" element={<QuizDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;