import './TicTacToeBoard.css';

function Square({

value,

onClick

}){

return(

<button

className={

`ttt-square ${

value==="X"

?

"ttt-x"

:

value==="O"

?

"ttt-o"

:

""

}`

}

onClick={onClick}

>

{value}

</button>

);

}

export default Square;