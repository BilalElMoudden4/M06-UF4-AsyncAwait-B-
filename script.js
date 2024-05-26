// Claus
const keys = {
    api_key: '09603d315aeed6b279f3069e1d78f485',
    session_id: '',
    account_id: ''
}

let moviesResult = document.getElementById("moviesResult");

let total_pages = 0;
let current_page = 1;
let current_query = '';

async function setFav(id, favBool) {
    try {
        const response = await fetch(`https://api.themoviedb.org/3/account/${keys.account_id}/favorite?api_key=${keys.api_key}&session_id=${keys.session_id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                media_type: 'movie',
                media_id: id,
                favorite: favBool
            })
        });

        const data = await response.json();

        console.log(`Movie ${id} marked as ${favBool}`);
        
        // Refresh favorites list
        showFavs();
    } catch (error) {
        console.error('Error setting favorite:', error);
    }
}

async function showFavs() {
    moviesResult.innerHTML = "";

    try {
        const response = await fetch(`https://api.themoviedb.org/3/account/${keys.account_id}/favorite/movies?api_key=${keys.api_key}&session_id=${keys.session_id}`);
        const data = await response.json();

        data.results.forEach(movie => {
            printMovie(movie, true, false);
        });
    } catch (error) {
        console.error('Error fetching favorites:', error);
    }
}

async function searchMovies(query, page = 1) {
    clearInput();
    removeActive();

    if (page === 1) {
        moviesResult.innerHTML = "";
    }

    try {
        const response = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${keys.api_key}&query=${query}&page=${page}`);
        const data = await response.json();

        total_pages = data.total_pages;
        current_page = data.page;
        current_query = query;

        data.results.forEach(movie => {
            printMovie(movie, false, false);
        });

        // Desactivar loading gif
        document.getElementById("loading").style.display = "none";

    } catch (error) {
        console.error('Error searching movies:', error);
    }
}

/* FUNCIONS D'INTERACCIÓ AMB EL DOM */

// Click Favorites
document.getElementById("showFavs").addEventListener("click", function() {
    removeActive();
    this.classList.add("active");

    showFavs();
});

// Click Watchlist
document.getElementById("showWatch").addEventListener("click", function() {
    removeActive();
    this.classList.add("active");

    // showWatch();
});

/* Funcions per detectar la cerca d'una pel·lícula */
// Intro a l'input
document.getElementById("search").addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        searchMovies(this.value);
    }
});

// Click a la lupa
document.querySelector(".searchBar i").addEventListener("click", () => searchMovies(document.getElementById("search").value));

// Netejar l'input
document.getElementById("search").addEventListener('click', () => clearInput());

function clearInput() {
    document.getElementById("search").value = "";
}

// Elimina l'atribut active del menú
function removeActive() {
    document.querySelectorAll(".menu li a").forEach(el => el.classList.remove("active"));
}

/* Funció per printar les pel·lícules */
function printMovie(movie, fav, watch) {
    let favIcon = fav ? 'iconActive' : 'iconNoActive';
    let watchIcon = watch ? 'iconActive' : 'iconNoActive';

    moviesResult.innerHTML += `
        <div class="movie">
            <img src="https://image.tmdb.org/t/p/original${movie.poster_path}">
            <h3>${movie.original_title}</h3>
            <div class="buttons">
                <a id="fav" onClick="setFav(${movie.id}, ${!fav})"><i class="fa-solid fa-heart ${favIcon}"></i></a>
                <a id="watch" onClick="setWatch(${movie.id}, ${!watch})"><i class="fa-solid fa-eye ${watchIcon}"></i></a>
            </div>
        </div>`;
}

window.addEventListener('scroll', () => {
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;

    if (scrollTop + clientHeight >= scrollHeight - 5 && current_page < total_pages) {
        current_page++;
        document.getElementById("loading").style.display = "block";
        searchMovies(current_query, current_page);
    }
});
