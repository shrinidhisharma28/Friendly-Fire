import Input from './Input';

function SearchBar({

search,

setSearch

}){

return(

<Input

placeholder="🔍 Search Games"

value={search}

onChange={

e=>

setSearch(

e.target.value

)

}

/>

);

}

export default SearchBar;