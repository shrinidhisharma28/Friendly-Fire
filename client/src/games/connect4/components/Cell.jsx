import './Connect4Board.css';

function Cell({

    value,

    onClick

}){

    let colorClass="";

    if(value==="R"){

        colorClass="connect-red";

    }

    else if(value==="Y"){

        colorClass="connect-yellow";

    }

    return(

        <div

            className={`connect-cell ${colorClass}`}

            onClick={onClick}

        />

    );

}

export default Cell;