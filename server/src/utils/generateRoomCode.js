const characters =
"ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";


function generateRoomCode(length = 6){

    let code = "";


    for(let i = 0; i < length; i++){

        const index = Math.floor(

            Math.random()

            *

            characters.length

        );


        code += characters[index];

    }


    return code;

}


module.exports = generateRoomCode;