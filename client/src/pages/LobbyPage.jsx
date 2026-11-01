import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Input from '../components/Input';
import ColorBends from '../components/ColorBends';
import './JoinPage.css';

function JoinPage() {
    const [username, setUsername] = useState("");
    const navigate = useNavigate();

    function handleContinue() {
        if (username.trim() === "") return;
        sessionStorage.setItem("username", username);
        navigate("/");
    }

    return (
        <>
            <ColorBends colors={["#F97316"]} speed={0.4} intensity={1.5} noise={0} rotation={-55} autoRotate={-3} />
            <div className="join-container">
                <div className="join-content">
                    <p className="join-label">MULTIPLAYER GAMING PLATFORM</p>
                    <h1 className="join-title">Friendly Fire</h1>
                    <p className="join-subtitle">Play • Compete • Have Fun</p>
                    <p className="join-text">Choose a username to begin</p>
                    <div className="join-input">
                        <Input
                            placeholder="Username"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            onKeyDown={e => { if (e.key === "Enter") handleContinue(); }}
                        />
                    </div>
                    <Button onClick={handleContinue}>Continue</Button>
                    <p className="join-footer">3 Games Available • React • Socket.io</p>
                </div>
            </div>
        </>
    );
}

export default JoinPage;
