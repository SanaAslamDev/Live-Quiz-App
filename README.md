# Live Quiz App

A real-time multiplayer quiz application, similar to Kahoot. Hosts create quizzes with multiple-choice questions, start a live session, and participants join using a room code to play together in real time.

This project is being built step by step as a learning project, focused on real-time features using Socket.IO alongside a standard full-stack REST setup.

## Features (so far)

- Create quizzes with a title
- Add multiple-choice questions to a quiz (with a marked correct answer)
- View all created quizzes
- View a single quiz and its questions
- Real-time connection between client and server via Socket.IO

## Features (in progress)

- Host can start a live session and get a room code
- Participants can join a session using the room code
- Live participant list on the host's screen
- Live quiz gameplay (question broadcast, answer submission, scoring, leaderboard)

## Tech Stack

**Frontend**
- React (Vite)
- React Router
- Socket.IO Client

**Backend**
- Node.js
- Express
- Socket.IO
- PostgreSQL (via the `pg` package)

## Project Structure
