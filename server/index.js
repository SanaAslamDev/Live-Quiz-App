const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');


const pool = require('./db');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:5173',
  },
});
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());



io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('join_room', async ({ roomCode, displayName }) => {
    try {
      const sessionResult = await pool.query(
        'SELECT * FROM sessions WHERE room_code = $1',
        [roomCode]
      );

      if (sessionResult.rows.length === 0) {
        socket.emit('join_error', { error: 'Room not found' });
        return;
      }

      const session = sessionResult.rows[0];

      const participantResult = await pool.query(
        `INSERT INTO participants (session_id, display_name)
         VALUES ($1, $2) RETURNING *`,
        [session.id, displayName]
      );

      socket.join(roomCode);

      const allParticipants = await pool.query(
        'SELECT * FROM participants WHERE session_id = $1',
        [session.id]
      );

      io.to(roomCode).emit('participant_update', allParticipants.rows);

    } catch (err) {
      console.error(err);
      socket.emit('join_error', { error: 'Something went wrong' });
    }
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
  });
});

app.get('/', (req, res) => {
  res.send('Quiz app server is running!');
});

app.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ success: true, time: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/quizzes', async (req, res) => {
  try {
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, error: 'Title is required' });
    }

    const result = await pool.query(
      'INSERT INTO quizzes (title) VALUES ($1) RETURNING *',
      [title]
    );

    res.status(201).json({ success: true, quiz: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/quizzes', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM quizzes ORDER BY created_at DESC');
    res.json({ success: true, quizzes: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/quizzes/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const quizResult = await pool.query('SELECT * FROM quizzes WHERE id = $1', [id]);

    if (quizResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Quiz not found' });
    }

    const questionsResult = await pool.query(
      'SELECT * FROM questions WHERE quiz_id = $1 ORDER BY order_index ASC',
      [id]
    );

    res.json({
      success: true,
      quiz: quizResult.rows[0],
      questions: questionsResult.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/quizzes/:id/questions', async (req, res) => {
  try {
    const { id } = req.params;
    const { question_text, options, correct_option_index } = req.body;

    if (!question_text || !options || correct_option_index === undefined) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const countResult = await pool.query(
      'SELECT COUNT(*) FROM questions WHERE quiz_id = $1',
      [id]
    );
    const nextOrderIndex = parseInt(countResult.rows[0].count);

    const result = await pool.query(
      `INSERT INTO questions (quiz_id, question_text, options, correct_option_index, order_index)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [id, question_text, JSON.stringify(options), correct_option_index, nextOrderIndex]
    );

    res.status(201).json({ success: true, question: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});


function generateRoomCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

app.post('/api/sessions', async (req, res) => {
  try {
    const { quiz_id } = req.body;

    if (!quiz_id) {
      return res.status(400).json({ success: false, error: 'quiz_id is required' });
    }

    const roomCode = generateRoomCode();

    const result = await pool.query(
      `INSERT INTO sessions (quiz_id, room_code, status)
       VALUES ($1, $2, 'waiting') RETURNING *`,
      [quiz_id, roomCode]
    );

    res.status(201).json({ success: true, session: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

httpServer.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});