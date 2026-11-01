import { io } from "socket.io-client";


const socket = io(

"http://localhost:5000",

{

autoConnect:false

}

);



export function connectSocket(){

    if(!socket.connected){

        socket.connect();

    }

}



export default socket;