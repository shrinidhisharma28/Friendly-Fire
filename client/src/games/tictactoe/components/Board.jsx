import './TicTacToeBoard.css';

import Square from './Square';

function Board({

board,

makeMove

}){

return(

<div className="ttt-board">

{

board.map(

(cell,index)=>

(

<Square

key={index}

value={cell}

onClick={()=>{

makeMove(index);

}}

>

</Square>

)

)

}

</div>

);

}

export default Board;