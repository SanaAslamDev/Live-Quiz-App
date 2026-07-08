import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import socket from '../socket';

function HostSession() {
  const { roomCode } = useParams();
  const [participants, setParticipants] = useState([]);

  useEffect(() => {
  socket.emit('host_join_room', { roomCode });

  const handleParticipantUpdate = (updatedParticipants) => {
    setParticipants(updatedParticipants);
  };

  socket.on('participant_update', handleParticipantUpdate);

  return () => {
    socket.off('participant_update', handleParticipantUpdate);
  };
}, [roomCode]);

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