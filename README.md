# Friendly-Fire

Classic games. Real-time competition. One place to play together.
Friendly-Fire is a real-time multiplayer gaming platform that brings
familiar, easy-to-play games into one shared online space. It is
designed for players who want to enjoy classic games with
friends---whether they are sitting next to each other or connecting from
different places.

No physical boards, no complicated setup, and no need to be in the same
room. Create a room, invite another player, choose a game, and let the
competition begin.

**1. Project Overview** 

Friendly-Fire aims to recreate the enjoyment of traditional multiplayer
games in a modern web-based environment. The platform provides a common
place where users can create or join game rooms and play through
interactive interfaces with real-time updates.

The project combines the simplicity of classic games with the
convenience of web technology. Instead of relying on physical boards or
manually tracking turns and scores, the platform manages game sessions,
player actions, and game-state updates digitally.

The system is designed around a modular game architecture so that
multiple games can share common platform services while retaining their
own rules and gameplay logic.

**2. Objectives** 

- Provide a single platform for playing familiar multiplayer games
  online.
- Allow users to create private game rooms and join existing rooms.
- Support real-time interaction between connected players.
- Maintain game-specific rules, turns, scores, and results on the
  server.
- Provide a consistent interface and room experience across different
  games.
- Make it easier to introduce additional games through a modular
  architecture.
- Demonstrate practical use of full-stack web development and
  event-driven communication.
  
**3. Key Features**

Room-Based Multiplayer
Players can create a room or join one using the room workflow. The
platform manages room membership and the transition from a waiting room
to an active game.
Real-Time Gameplay
Player actions are communicated through Socket.IO, allowing the
server to process moves and distribute updated game information to
connected players without requiring repeated page refreshes.
Multiple Classic Games
Friendly-Fire brings different styles of classic multiplayer gameplay
together. The current game set includes:
- Tic-Tac-Toe -- A turn-based strategy game played on a 3 × 3
  grid.
- Connect Four -- A tactical game in which players aim to connect
  four pieces in a row.
- Rock Paper Scissors -- A quick competitive game based on
  simultaneous choices and round results.
- Wordle Duel -- A head-to-head word challenge in which players
  set secret words and attempt to solve their opponent's word.
  
Game-Specific Rules and State
Each game has its own logic for validating moves, updating the game
state, and determining results. This keeps the rules of one game
separate from those of another.
Shared Player Experience
Common platform components and services help provide a consistent
experience for room navigation, game controls, loading states, and
leaving a game.
Extensible Game Architecture
The game registry and manager-based structure make it possible to add
new games without rebuilding the entire platform. A new game can
implement its own rules while using the existing room and communication
infrastructure.

**4. How It Works**

1. Enter the platform: A player opens Friendly-Fire and navigates
   to the game lobby.
2. Create or join a room: The player creates a room or joins an
   available room.
3. Wait for players: The room remains in its waiting state until
   the required number of players has joined.
4. Start the game: The host starts the game when the room is ready.
5. Play in real time: Player actions are sent to the backend,
   validated by the relevant game manager, and communicated to the
   players.
6. View the result: The game logic determines the outcome and the
   interface presents the result to the players.
The exact player limit and rules depend on the selected game.

**5.Technical Architecture**

Friendly-Fire follows a **client-server architecture**. The frontend handles presentation and user interaction, while the backend manages rooms, player actions, and authoritative game logic.

**Technology Stack**

| Layer | Technology | Responsibility |
|---|---|---|
| Frontend | React | Builds the interactive user interface and game screens. |
| Frontend Tooling | Vite | Provides the development server and production build process. |
| Backend Runtime | Node.js | Runs the server-side application. |
| Backend Framework | Express.js | Provides the HTTP server and backend application structure. |
| Real-Time Communication | Socket.IO | Handles room-based communication and real-time game events. |
| Game Logic | JavaScript Game Managers | Validates moves, updates game state, and determines game outcomes. |

**High-Level Communication Flow**

The following diagram illustrates how two players interact with the Friendly-Fire server during a multiplayer game session.

```text
 Player 1                 Friendly-Fire Server                 Player 2
    |                              |                              |
    |------ Create / Join Room --->|                              |
    |                              |<------ Join Room ------------|
    |                              |                              |
    |<------ Room Updates ---------|------- Room Updates -------->|
    |                              |                              |
    |--------- Game Action ------->|                              |
    |                              |                              |
    |                              | Validate using the           |
    |                              | selected game manager        |
    |                              |                              |
    |<-------- Game Update --------|-------- Game Update -------->|
    |                              |                              |
    |<----------- Result ----------|------------ Result --------->|
    |                              |                              |
```
   
**6. Modular Game Management**

The platform separates common multiplayer functionality from individual
game implementations.
- Game configuration: Stores game metadata and player limits.
- Game registry: Maps game identifiers to their corresponding game
  managers.
- Room management: Handles room creation, joining, starting,
  restarting, and player departure.
- Game service: Coordinates common game operations and delegates
  game-specific actions.
- Socket handlers: Receive client events, invoke backend
  operations, and send updates to the relevant players.
- Game managers: Implement each game's rules, state transitions,
  move validation, and result calculation.
This separation improves maintainability and makes the platform easier
to extend.

**7. Real-Time Communication and State Management**

Socket.IO is used to maintain communication between players and the
server during a game session. Events are used for operations such as
creating or joining rooms, starting games, submitting moves, receiving
game updates, and leaving rooms.

The backend is responsible for validating player actions and updating
the authoritative game state. This is important in multiplayer
applications: the browser should not be trusted to decide whether a move
is valid or who has won.

For games that contain private information, such as secret words in
Wordle Duel, sensitive state must remain on the server. Each player
should receive only the information they are allowed to see.

**8. Design Considerations**

- Separation of concerns: Shared platform services are kept
  separate from game-specific logic.
- Server-side validation: Moves and important game transitions are
  validated by the backend.
- Room isolation: Events and game updates are scoped to the
  relevant room and its players.
- Consistent user experience: Shared components reduce unnecessary
  differences between game screens.
- Extensibility: The registry-and-manager approach supports the
  addition of new games.
- Privacy: Player-specific information should not be exposed to
  other players through shared room data.
  
**9. Future Enhancements**
  
The architecture can be extended with features such as:
- Additional classic and party games.
- Spectator mode for selected games.
- Player profiles, statistics, and match history.
- Reconnection support for players who temporarily lose network
  connectivity.
- Improved matchmaking and public room discovery.
- In-game chat and reactions.
- Leaderboards, achievements, and tournaments.
- Stronger session management and abuse prevention.
- Responsive layouts and accessibility improvements.
These are proposed enhancements and should not be considered completed
features unless implemented.

**10. Conclusion**

Friendly-Fire turns familiar multiplayer games into accessible online
experiences. By combining room-based sessions, real-time communication,
and modular game logic, the platform allows players to compete and have
fun without needing a physical board or being in the same location.

Beyond entertainment, the project demonstrates the practical application
of full-stack development concepts, including client-server
communication, event-driven programming, state management, modular
architecture, and server-side validation.

Create a room. Bring your opponent. Pick a game. Let the friendly fire
begin.
