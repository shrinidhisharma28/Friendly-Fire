
import { useState } from "react";
import { useParams } from "react-router-dom";

import socket from "../../../services/socket";
import Loading from "../../../components/Loading";
import Button from "../../../components/Button";

import useGameSocket from "../../common/hooks/useGameSocket";

import GuessBoard from "../components/GuessBoard";
import OpponentProgress from "../components/OpponentProgress";
import WordEntry from "../components/WordEntry";
import WordleKeyboard from "../components/WordleKeyboard";
import WordleResult from "../components/WordleResult";

import "./WordlePage.css";

const STATUS_PRIORITY = {
    correct: 3,
    present: 2,
    absent: 1
};

function WordlePage() {
    const { roomId } = useParams();

    const {
        room,
        leaveRoom,
        moveError
    } = useGameSocket(roomId);

    const [word, setWord] = useState("");

    if (!room || !room.gameState) {
        return <Loading />;
    }

    const game = room.gameState;
    const mySocketId = socket.id;

    const currentPlayer = room.players.find(
        player => player.socketId === mySocketId
    );

    const opponent = room.players.find(
        player => player.socketId !== mySocketId
    );

    const isWaitingForPlayers = room.players.length < 2;
    const isWaitingForSecrets = game.phase === "waiting_for_secrets";
    const isGuessing = game.phase === "guessing";
    const isCompleted = game.phase === "completed";

    const ownGuesses = game.ownGuesses || [];

    const opponentProgress = game.opponentProgress || {
        attemptsUsed: 0,
        finished: false,
        solved: false
    };

    const ownSecretLocked = Boolean(game.ownSecretLocked);
    const opponentSecretLocked = Boolean(game.opponentSecretLocked);

    const canSubmitSecret =
        isWaitingForSecrets &&
        !ownSecretLocked &&
        !isWaitingForPlayers;

    const canSubmitGuess =
        isGuessing &&
        !isCompleted &&
        ownGuesses.length < 5;

    const canSubmit = canSubmitSecret || canSubmitGuess;

    const keyboardStatuses = {};

    ownGuesses.forEach(guess => {
        guess.word.split("").forEach((letter, index) => {
            const normalizedLetter = letter.toUpperCase();
            const status = guess.feedback[index];

            if (!STATUS_PRIORITY[status]) {
                return;
            }

            const currentStatus = keyboardStatuses[normalizedLetter];

            if (
                !currentStatus ||
                STATUS_PRIORITY[status] > STATUS_PRIORITY[currentStatus]
            ) {
                keyboardStatuses[normalizedLetter] = status;
            }
        });
    });

    function submitWord() {
        const normalizedWord = word.trim().toLowerCase();

        if (!canSubmit || !/^[a-z]{5}$/.test(normalizedWord)) {
            return;
        }

        socket.emit("make-move", {
            roomId,
            payload: {
                type: canSubmitSecret ? "submit_secret" : "submit_guess",
                word: normalizedWord
            }
        });

        setWord("");
    }

    function handleKeyPress(letter) {
        if (!canSubmit) {
            return;
        }

        setWord(previous => {
            if (previous.length >= 5) {
                return previous;
            }

            return previous + letter.toLowerCase();
        });
    }

    function handleBackspace() {
        if (!canSubmit) {
            return;
        }

        setWord(previous => previous.slice(0, -1));
    }

    function getStatusMessage() {
        if (isWaitingForPlayers) {
            return "Waiting for another player...";
        }

        if (isWaitingForSecrets) {
            if (ownSecretLocked && !opponentSecretLocked) {
                return "Your word is locked. Waiting for your opponent.";
            }

            if (!ownSecretLocked && opponentSecretLocked) {
                return "Your opponent has locked their word. Choose yours.";
            }

            return "Choose your five-letter secret word.";
        }

        if (isGuessing) {
            if (ownGuesses.length === 5) {
                return "You have finished. Waiting for your opponent.";
            }

            return "Guess your opponent's secret word.";
        }

        return "Both players have finished.";
    }

    return (
        <main className="wordle-page">
            <header className="wordle-header">
                <h1>Wordle Duel</h1>

                <span className="wordle-player-name">
                    {currentPlayer?.username || "You"}
                    <span className="wordle-versus"> vs </span>
                    {opponent?.username || "Opponent"}
                </span>
            </header>

            <section className="wordle-game-layout">
                <section className="wordle-opponent-panel">
                    <div className="wordle-panel-heading">
                        <div>
                            <span className="wordle-section-label">
                                OPPONENT
                            </span>
                            <h2>Progress</h2>
                        </div>

                        <span className="wordle-attempt-count">
                            {opponentProgress.attemptsUsed}/5
                        </span>
                    </div>

                    <OpponentProgress
                        attemptsUsed={opponentProgress.attemptsUsed}
                        finished={opponentProgress.finished}
                        solved={opponentProgress.solved}
                    />

                    <p className="wordle-status-message">
                        {getStatusMessage()}
                    </p>
                </section>

                <section className="wordle-main-panel">
                    <div className="wordle-panel-heading">
                        <div>
                            <span className="wordle-section-label">
                                YOUR BOARD
                            </span>
                            <h2>
                                {canSubmitSecret
                                    ? "Choose your secret word"
                                    : "Guess the word"}
                            </h2>
                        </div>

                        <span className="wordle-attempt-count">
                            {ownGuesses.length}/5
                        </span>
                    </div>

                    <GuessBoard guesses={ownGuesses} />

                    {moveError && (
                        <div className="wordle-error" role="alert">
                            {moveError}
                        </div>
                    )}

                    {!isCompleted && (
                        <>
                            <WordEntry
                                value={word}
                                onChange={setWord}
                                onSubmit={submitWord}
                                disabled={!canSubmit}
                                submitLabel={
                                    canSubmitSecret
                                        ? "Lock Word"
                                        : "Submit Guess"
                                }
                                placeholder={
                                    canSubmitSecret
                                        ? "Choose your secret word"
                                        : "Enter your guess"
                                }
                                hint="Five letters. Accepted dictionary words only."
                            />

                            <WordleKeyboard
                                letterStatuses={keyboardStatuses}
                                onKeyPress={handleKeyPress}
                                onBackspace={handleBackspace}
                                onEnter={submitWord}
                                disabled={!canSubmit}
                            />
                        </>
                    )}

                    {ownSecretLocked && isWaitingForSecrets && (
                        <p className="wordle-locked-message">
                            Secret word locked. Waiting for your opponent.
                        </p>
                    )}

                    {isCompleted && (
                        <WordleResult
                            result={game.ownResult}
                            mySocketId={mySocketId}
                            opponentSocketId={opponent?.socketId}
                        />
                    )}
                </section>
            </section>

            <footer className="wordle-footer">
                <Button
                    variant="danger"
                    onClick={leaveRoom}
                >
                    Leave Room
                </Button>
            </footer>
        </main>
    );
}

export default WordlePage;
