import './Connect4Board.css';

import Cell from './Cell';

function Board({

    board,

    makeMove

}){

    return(

        <div className="connect-board">

            {

                board.map(

                    (row,rowIndex)=>

                        row.map(

                            (cell,columnIndex)=>(

                                <Cell

                                    key={`${rowIndex}-${columnIndex}`}

                                    value={cell}

                                    onClick={()=>makeMove(columnIndex)}

                                />

                            )

                        )

                )

            }

        </div>

    );

}

export default Board;