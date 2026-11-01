import {useState} from 'react';

import {games} from '../data/games';

import './Lobbypage.css';
import Navbar from '../components/Navbar';
import SearchBar from '../components/SearchBar';
import GameCard from '../components/GameCard';
import ColorBends from '../components/ColorBendsbg';

function LobbyPage(){

    const [search,setSearch]=useState("");


    const filteredGames=

        games.filter(

            game=>

                game.name

                .toLowerCase()

                .includes(

                    search.toLowerCase()

                )

        );


    return(

        <>

            <ColorBends
                intensity={0.7}
            />

            <Navbar/>


            <div className="page">


                <h1 className="page-title">

                    Game Lobby

                </h1>


                <p className="subtitle">

                    Choose a game and challenge your friends

                </p>


                <div className="search-wrapper">


                    <SearchBar

                        search={search}

                        setSearch={setSearch}

                    />


                </div>



                {

                    filteredGames.length===0


                    ?


                    <h2 className="empty-message">

                        No Games Found

                    </h2>


                    :


                    <div className="games-grid">


                        {

                            filteredGames.map(

                                game=>

                                (

                                    <GameCard

                                        key={game.id}

                                        game={game}

                                    />

                                )

                            )

                        }


                    </div>

                }


            </div>


        </>

    );

}


export default LobbyPage;