import './Navbar.css';

function Navbar(){

    const username=

        sessionStorage.getItem(

            "username"

        )

        ||

        "Guest";


    return(

        <nav className="navbar">


            <h1 className="logo">

                Friendly Fire

            </h1>


            <div className="user">

                👤 {username}

            </div>


        </nav>

    );

}


export default Navbar;