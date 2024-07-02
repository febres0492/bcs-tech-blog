
// function to generate the movie card

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
        url: '/api/updatepassword',
        data: {email, token, newPassword},
        method: 'PUT'
    }).then((res) => {
        window.location.replace('/')
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
            url: '/api/user/update_password',
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

function queryDB(password, query) {
    $.ajax({
        url: 'api/user/db_query',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ password, query }),
        success: function(response) {
            console.log('response:', response.message, response.results)
        },
        error: function(xhr, status, error) {
            console.error('Error:', error)
        }
    });
}

function logout() {
    $.ajax({
        url: 'api/user/logout',
        type: 'POST',
        success: function(response) {
            console.log('response:', response)
            window.location.href='/'
        },
        error: function(xhr, status, error) {
            console.error('Error:', error)
        }
    });
}

function postBlog(ev) {
    ev.preventDefault()
    const title = $('#blog-form-title').val()
    const content = $('#blog-form-content').val()

    console.log('data', { title, content })

    $.ajax({
        url: 'api/blog',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ title, content }),
        success: function(response) {
            console.log('response:', response)
        },
        error: function(xhr, status, error) {
            console.error('Error:', error)
        }
    });
}

function getBlogs() {
    return $.ajax({
        url: 'api/blog',
        type: 'GET',
        success: function(response) {
            console.log('response:', response)
            return response
        },
        error: function(xhr, status, error) {
            console.error('Error:', error)
        }
    });
}

async function showBlogs() {
    const blogs = await getBlogs()

    const currUser = await getCurUser()

    console.log('currUser:', currUser)
    
    $('#blogs-container').empty();
    [...blogs].forEach(blog => {

        const isAuthor = currUser.id == blog.authorId

        $('#blogs-container').append(`
            <div class="blog-card border p-3" data-info="${blog}">
                <div class="d-flex jcsb bg-d2 p-2">
                    <h3 class="m-0">${blog.title}</h3>
                    <p class="m-0">By: ${blog.authorName}</p>
                </div>
                <p>${blog.content}</p>
                ${isAuthor && `<button class="btn btn-primary">Edit</button>` || ''}
                ${isAuthor && `<button class="btn btn-danger">Delete</button>` || ''}
                <button class="btn btn-info">Comment</button>
            </div>
        `)
    })
}

function getCurUser() {
    return $.ajax({
        url: 'api/user/current_user',
        type: 'GET',
        success: function(response) {
            console.log('response:', response)
            return response
        },
        error: function(xhr, status, error) {
            console.error('Error:', error)
        }
    });
}