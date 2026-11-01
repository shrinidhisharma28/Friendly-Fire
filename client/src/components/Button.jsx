import './Button.css';

function Button({

    children,

    onClick,

    variant="primary",

    type="button",

    disabled=false

}){

    return(

        <button

            className={`btn ${variant}`}

            onClick={onClick}

            type={type}

            disabled={disabled}

        >

            {children}

        </button>

    );

}

export default Button;