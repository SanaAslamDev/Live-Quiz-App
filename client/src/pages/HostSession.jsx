import { useState } from 'react';
import { useParams } from 'react-router-dom';
import socket from '../socket';

function HostSession() {
  const { roomCode } = useParams();
  const [participants, setParticipants] = useState([]);

  socket.emit('join_room', { roomCode, displayName: 'HOST' });

  socket.on('participant_update', (updatedParticipants) => {
    setParticipants(updatedParticipants.filter((p) => p.display_name !== 'HOST'));
  });

  return (
    <div>
      <h1>Room Code</h1>
      <h2>{roomCode}</h2>
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
    </div>
  );
}

export default HostSession;