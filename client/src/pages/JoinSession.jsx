import { useState } from 'react';
import socket from '../socket';

function JoinSession() {
  const [roomCode, setRoomCode] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [joined, setJoined] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [error, setError] = useState('');

  const handleJoin = (e) => {
    e.preventDefault();
    setError('');
    socket.emit('join_room', { roomCode, displayName });
  };

  socket.on('participant_update', (updatedParticipants) => {
    setParticipants(updatedParticipants);
    setJoined(true);
  });

  socket.on('join_error', ({ error }) => {
    setError(error);
  });

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