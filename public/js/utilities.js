
// function to generate the movie cards
function renderMovies(res)  {

    $('#main-content').append(`
        <div class="col-12 py-2 px-3 tac">
            <span class="horizontal-divider"></span>
            <h3 class="movie-header" style="--fvw:1;">Movies</h3>
        </div>
        <div class="col-12 py-2 px-0">
            <div id="movies" class="row"></div>
        </div>
    `)

    if (!res.results.length) {
        $('.movie-header').text(`No Movies Found`)
        return
    }

    const items = [...res.results]
    items.forEach(item => {
        const imgUrl = item.poster_path ? `https://image.tmdb.org/t/p/w500/${item.poster_path}` : '/img/placeholder.png'
        let description = item.overview || item.title;
        $('#movies').append(`
            <div class="card col-12 col-sm-4 col-lg-3 col-xl-2 p-3 mb-3" data-description="${description}">
                <div class="card-item">
                    <h4 class="card-title">${item.title || 'Unknown'}</h4>
                    <div class="rel description-box">
                        <img src="${imgUrl}" alt="Book cover for ${item.title || 'unknown'}">
                        <img class="info-icon" src="/img/info-icon.png" alt="info icon for ${item.title} image">
                        <div class="overlay scroll-bar df jcc">
                            <p class="text description">${description}</p>
                        </div>
                    </div>
                    <button class="btn btn-primary result-item" onclick="saveItem(this,'movie')">Add to Favorite</button> 
                    <a class="action-btn btn border text-white" target="_blank" href="https://www.justwatch.com/us/search?q=${item.title}" class="btn btn-secondary">Watch Movie</a>
                </div>
            </div>
        `)
    })
}

function renderBooks(response) {

    $('#main-content').append(`
        <div class="col-12 py-2 px-3 tac">
            <span class="horizontal-divider"></span>
            <h3 class="book-header" style="--fvw:1;">Books</h3>
        </div>
        <div class="col-12 py-2 px-0">
            <div id="books" class="row"></div>
        </div>
    `)

    if (!response.items.length) {
        $('.book-header').text(`No Movies Found`)
        return
    }

    const container = document.getElementById('books')
    container.innerHTML = ''

    for (var i = 0; i < response.items.length; i++) {
        let item = response.items[i]
        let viewUrl = item.volumeInfo.previewLink

        let bookImg1 = item.volumeInfo?.imageLinks?.thumbnail || '/img/placeholder.png';
        let description = item.volumeInfo?.description || item.volumeInfo?.title;
        container.innerHTML += `
            <div class="card col-12 col-sm-4 col-lg-3 col-xl-2 p-3 mb-3" data-description="${description}">
                <div class="card-item">
                    <h4 class="card-title">${item.volumeInfo.title}</h4>
                    <div class="rel description-box">
                        <img src="${bookImg1}" alt="Book cover for ${item.volumeInfo.title || 'unknown'}">
                        <img class="info-icon" src="/img/info-icon.png" alt="info icon for ${item.volumeInfo.title} image">
                        <div class="overlay scroll-bar df jcc">
                            <p class="text">${description}</p>
                        </div>
                    </div>
                    <button class="btn btn-primary result-item" onclick="saveItem(this,'book')">Add to Favorite</button> 
                    <a class="action-btn btn border text-white" target="_blank" href="${viewUrl}" class="btn btn-secondary">Read Book</a>
                </div>
            </div>
        `
    }
}

async function saveItem (element, type) {
    
    const description = $(element).closest('.card').attr('data-description')
    const itemName = $(element).closest('.card').find('.card-title').text();
    const imgUrl =  $(element).closest('.card').find('img')[0].attributes.src.nodeValue
    const actionBtnStr = $(element).closest('.card').find('.action-btn').prop('outerHTML')
    const data = { "description": description, "actionBtnStr": actionBtnStr}

    const isSaved = await saveToFavorite({
        itemType: type,
        itemName: itemName,
        itemData: data,
        itemImg: imgUrl
    })

    if (!isSaved) { return }
    $(element).text('Saved')
    $(element).attr('disabled', true)
}

function saveToFavorite(obj) {
    const requiredKeys = ['itemType', 'itemName', 'itemData']

    // checking if obj has all keys
    const keys = Object.keys(obj)
    requiredKeys.forEach(key => {
        if (!keys.includes(key)) {
            console.error(`saveToFavorite obj is missing ${key} key`)
            return
        }
    })

    return $.ajax({
        url: 'api/users/addFavorite',
        data: obj,
        method: 'POST'
    }).then((res) => {
        console.log('saveToFavorite', res)
        return true
    }).catch(err => {
        console.log(err)
        return false
    })
}

function getFavorites(type = 'all') {
    return $.ajax({
        url: `api/users/getFavorites?type=${type}`,
        method: 'GET',
        contentType: 'application/json'
    }).then((res) => {
        console.log('getFavorites', res);
        return res;
    }).catch(err => console.log(err));
}

function deleteFavorite(btn, id ) {
    $.ajax({
        url: 'api/users/deleteFavorite',
        data: { itemId: id},
        method: 'DELETE'
    }).then((res) => {
        btn.closest('.card').remove()

        const cards = $('#main-content').find('.card').length
        if (!cards) {
            $('#main-content').html(`
                <div class="col-12 py-2 jcc tac">
                    <span class="horizontal-divider"></span>
                    <h3 style="--fvw:1; --mt:3;">No Favorites Saved</h3>
                </div>
            `)
        }
        
    }).catch(err => console.log(err))
}

function renderFavorites(items) {

    $('#main-content').empty()
    $('#main-content').append(`
        <div class="col-12 py-2 px-3 tac">
            <span class="horizontal-divider"></span>
            <h3 class="fav-header" style="--fvw:1; --mt:3;">Favorites</h3>
        </div>
        <div class="col-12 py-2 px-0">
            <div id="fav-container" class="row"></div>
        </div>
    `)

    if (!items.length) {
        $('.fav-header').text(`No Favorites Saved`)
        return
    }

    items.forEach((item, i) => {
        const { id, itemType, itemName, itemData } = item
        const actionBtnStr = jsonParser(itemData, 'actionBtnStr', '<button class="btn border text-white disabled">Not Available</button>')
        const description = jsonParser(itemData, 'description', itemName)
        $('#fav-container').append(`
            <div class="card col-12 col-sm-4 col-lg-3 col-xl-2 p-3 mb-3">
                <div class="card-item">
                    <h4>${itemName || 'Undefined'}</h4>
                    <div class="rel description-box">
                        <img src="${item.itemImg}" alt="Cover for ${item.itemImg}">
                        <img class="info-icon" src="/img/info-icon.png" alt="info icon for ${item.itemImg} image">
                        <div class="overlay scroll-bar df jcc">
                            <p class="text">${description}</p>
                        </div>
                    </div>
                    ${actionBtnStr}
                    <button class="btn btn-secondary" onclick="deleteFavorite(this, ${id})">Remove</button>
                </div>
            </div>
        `)
    })
}

async function handleBtn(btn){
    const items = await getFavorites(btn.value)
    $('#searchBar').val('')
    renderFavorites(items)
}

function getPreviousSearchesFromCookies() {
    return $.ajax({
        url: 'api/users/get_prev_searches',
        method: 'GET'
    }).then((res) => {
        return [...res.searches]
    }).catch(err => console.log(err))
}

async function showPreviousSearchDropdown() {
    const searches = await getPreviousSearchesFromCookies()
    if (searches.length == 0) { return }

    $('#prev-search-dropdown').empty()
    searches.forEach(search => {
        $('#prev-search-dropdown').append(`
            <button type="button" class="text-white bg-d1 border-secondary btn btn-sm" onclick="searcher('${search}')">${search}</button>
        `)
    })
}

async function searcher(queryParams) {
    if( queryParams.length == 0 ) {return} 
    try {
        const { movieData, bookData } = await $.ajax({
            url: 'api/external',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ query: queryParams.trim() })
        }).catch(err => console.log(err) )

        $('#prev-search-dropdown').empty()
        $('#searchBar').val(queryParams)
        $('#main-content').empty();
        $('#main-content').html(`
            <div class="col-12 pt-4 jcc d-flex aic">
                <h3 class="m-0">Search Results for:</h3>
                <p class="m-0 h3 ml-2 p-1 px-2 rounded bg-d2">${queryParams}</p>
            </div>
        `)

        renderMovies(movieData)
        renderBooks(bookData)
    } catch (err) {
        console.error('searcher', err)
    }
}

function searchInput(e) {
    const query = document.querySelector('#searchBar').value
    if (e.key && e.key === 'Enter') { 
        e.preventDefault()
        searcher(query)
    }
}

function searchBtn(e) {
    e.preventDefault()
    const query = document.querySelector('#searchBar').value
    searcher(query)
}

function showMessageInModal(message) {
    $('.modal-body').empty();
    $('.modal-body').html(`
        <div class="col-12 py-2 jcc">
            <h3>${message}</h3>
        </div>
    `)
    $('#exampleModal').modal('show'); 
}

function sendResetEmail(e){
    e.preventDefault()
    const email = document.querySelector('#email-login').value
    $.ajax({
        url: 'api/token/email_token',
        data: { email: email},
        method: 'POST'
    }).then((res) => {
        console.log(res)
        window.location.replace('/passwordresetform')
    }).catch(err => {
        console.log(err)
        showMessageInModal(err.responseJSON.message)
    })
}

function updatePassword(e){
    e.preventDefault()
    const email = document.querySelector('#email').value
    const token = document.querySelector('#validation-input').value
    const newPassword = document.querySelector('#new-password').value
    const repeatNewPassword = document.querySelector('#repeat-new-password').value

    // checking if any of the fields are empty
    if([token, newPassword, repeatNewPassword].some(item => item.length === 0)){
        showMessageInModal('Missing value')
    }
    // checking if the new password and repeat password match
    if(newPassword!=repeatNewPassword){
        showMessageInModal('Passwords dont match!')
    }

    $.ajax({
        url: '/updatepassword',
        data: {email, token, newPassword},
        method: 'PUT'
    }).then((res) => {
        window.location.replace('/login')
    }).catch(err => {
        showMessageInModal(err.responseJSON.message)
        console.log(err)
    })
}

function loadPasswordForm(e){
    e.preventDefault()
    $('.modal-header').empty();
    $('.modal-body').empty();
    $('.modal-body').html(`
        <div class="col-12 py-2 jcc">
            <h3>Reset Password</h3>
            <form id="reset-password-form">
                <div class="form-group ">
                    <label for="current-password">Current Password</label>
                    <input type="password" class="form-control" id="current-password" placeholder="Enter current password" required>
                </div>
                <div class="form-group ">
                    <label for="new-password">New Password</label>
                    <input type="password" class="form-control" id="new-password" placeholder="Enter new password" required>
                </div>
                <div class="form-group ">
                    <label for="repeat-new-password">Repeat New Password</label>
                    <input type="password" class="form-control" id="repeat-new-password" placeholder="Repeat new password" required>
                </div>
                <button type="button" class="submit-btn btn btn-primary">Submit</button>
            </form>
        </div>
    `)

    $('#exampleModal').modal('show')

    $('.submit-btn').on('click', ()=>{

        $('.modal-header').empty();

        const currentPassword = document.querySelector('#current-password').value
        const newPassword = document.querySelector('#new-password').value
        const repeatNewPassword = document.querySelector('#repeat-new-password').value
    
        if(newPassword!=repeatNewPassword){
            $('.modal-header').empty();
            $('.modal-header').html(`<h4 class="modal-title text-warning">New Password and Repeat Password do not match!</h4>`)
            return
        }

        $.ajax({
            url: '/api/users/update_password',
            data: {currentPassword, newPassword, 'email': $('#email').text()},
            method: 'PUT'
        }).then((res) => {
            showMessageInModal('Password Updated!')
        }).catch(err => {
            setTimeout(() => {
                $('.modal-header').empty();
                $('.modal-header').html(`<h4 class="modal-title text-warning">${err.responseJSON.message}</h4>`)
            }, 1000)
            
        })
    })
}

function jsonParser(jsonStr, key, fallback) {
    try {
        return JSON.parse(jsonStr)[key]
    } catch (err) {
        return fallback
    }
}

function resetDB(password) {
    $.ajax({
        url: 'api/users/reset_db',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ password }),
        success: function(response) {
            console.log(response.message)
            alert( `table dropped successfully`)
        },
        error: function(xhr, status, error) {
            console.error('Error:', error)
        }
    });
}