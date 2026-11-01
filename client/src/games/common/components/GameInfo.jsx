
import './GameInfo.css';

function GameInfo({ title, symbol, turn }) {
    const showPlayerInfo = symbol !== undefined || turn !== undefined;

    return (
        <header className="game-info">
            <div className="game-title-container">
                <h1 className="game-title" title={title}>
                    {title}
                </h1>
            </div>

            {showPlayerInfo && (
                <div className="info-row">
                    {symbol !== undefined && (
                        <div className="info-badge">
                            You are:
                            <span className={symbol === 'X' ? 'x' : 'o'}>
                                {' '}{symbol}
                            </span>
                        </div>
                    )}

                    {turn !== undefined && (
                        <div className="info-badge">
                            Turn:
                            <span className={turn === 'X' ? 'x' : 'o'}>
                                {' '}{turn}
                            </span>
                        </div>
                    )}
                </div>
            )}
        </header>
    );
}

export default GameInfo;
