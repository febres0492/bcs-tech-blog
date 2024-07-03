
// function to generate the movie card

function capFirt(str) { return str.charAt(0).toUpperCase() + str.slice(1) }

function showMessageInModal(message) {
    $('.modal-body').empty();
    $('.modal-body').html(`
        <div class="col-12 py-2 jcc">
            <h3>${message}</h3>
        </div>
    `)
    $('#bs-modal').modal('show'); 
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

    $('#bs-modal').modal('show')

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

function sendPostBlogReq(ev) {
    ev.preventDefault()
    const form = $(ev.target).closest('form')
    const title = form.find('.form-control[name="title"]').val()
    const content = form.find('.form-control[name="content"]').val()

    console.log('data', { title, content })

    // hiding modal
    $('#bs-modal').modal('hide')

    $.ajax({
        url: 'api/blog',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ title, content }),
        success: function(blog) {
            console.log('new blog:', blog)
            prependBlog(blog)
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

function getBlogById(blogId) {
    return $.ajax({
        url: `api/blog/${blogId}`,
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

function getBlogCardTemplate(obj) {

    const { blog, cardId } = obj

    console.log('getBlogCardTemplate:', obj)
    const blogStr = JSON.stringify(blog).replace(/"/g, "'")
    const isAuthor = obj.isAuthor || false

    return `
        <div id="${cardId}" class="blog-card border p-3" data-info="${blog}">
            <div class="d-flex jcsb bg-d2 p-2">
                <h3 class="blog-title m-0">${blog.title}</h3>
                <p class="m-0">By: ${blog.authorName}</p>
            </div>
            <p class="blog-content">${blog.content}</p>
            ${isAuthor && `<button class="btn btn-primary" onclick="showEditBlogForm(${blogStr})">Edit</button>` || ''}
            ${isAuthor && `<button class="btn btn-danger" onclick="sendDeleteBlogReq(${blogStr})">Delete</button>` || ''}
            <button class="btn btn-info" onclick="showCommentForm(${blog.id})">Comment</button>
        </div>
    `
}

function prependBlog(blog) {

    console.log('prependBlog ------------- :', blog)
    const cardId = `${blog.authorName[0]}${blog.authorId}_${blog.id}`
    blog.cardId = cardId
    $('#blogs-container').prepend( getBlogCardTemplate({ blog, cardId, isAuthor: true }) )
}

async function renderBlogs() {
    const blogs = await getBlogs()

    const currUser = await getCurUser()

    console.log('currUser:', currUser)
    
    $('#blogs-container').empty();
    [...blogs].reverse().forEach(blog => {

        const isAuthor = currUser.id == blog.authorId
        const cardId = `${blog.authorName[0]}${blog.authorId}_${blog.id}`
        blog.cardId = cardId
        const blogStr = JSON.stringify(blog).replace(/"/g, "'")

        $('#blogs-container').append( getBlogCardTemplate({ blog, cardId, isAuthor, blogStr }) )

    })
}

function sendDeleteBlogReq(obj) {

    obj = typeof obj == 'string' ?  JSON.parse(obj.replace(/'/g, '"')) : obj

    $.ajax({
        url: `api/blog/${obj.id}`,
        type: 'DELETE',
        success: function(response) {
            console.log('response:', response)
            $(`#${obj.cardId}`).remove()
        },
        error: function(xhr, status, error) {
            console.error('Error:', error)
        }
    });
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

async function showPostBlogForm() {
    console.log('showPostBlogForm')
    $('.modal-header').html(` <div class="d-flex"> <h3 cl>Create Blog Post</h3> </div> `)
    $('.modal-body').empty()
    $('.modal-body').html(`
        <div class="col-12 py-2">
            <form id="create-blog-form">
                <div class="form-group tal">
                    <label for="create-blog-form-title">Title</label>
                    <input type="text" class="form-control" name="title" placeholder="Blog Title" required>
                </div>
                <div class="form-group tal">
                    <label for="create-blog-form-content">Content</label>
                    <textarea class="form-control" name="content" required rows="3" placeholder="Blog Content"></textarea>
                </div>
                <button type="button" class="submit-btn btn btn-primary" onclick="sendPostBlogReq(event)">Submit</button>
            </form>
        </div>
    `)

    $('#bs-modal').modal('show')
}

async function showEditBlogForm(obj) {

    const data = typeof obj == 'string' ?  JSON.parse(obj.replace(/'/g, '"')) : obj

    console.log('showEditBlogForm:', data)

    if (!data.id) { return showMessageInModal('Blog not found!') }

    let blogData = await getBlogById(data.id)

    if (!blogData) { return showMessageInModal('Blog not found!') }

    const blogStr = JSON.stringify(data).replace(/"/g, "'")

    console.log('blog --->:', data)

    $('.modal-header').html(` <div class="d-flex"> <h3 cl>Edit Blog Post</h3> </div> `)
    $('.modal-body').empty()
    $('.modal-body').html(`
        <div class="col-12 py-2">
            <form id="edit-blog-form">
                <div class="form-group tal">
                    <label for="edit-blog-form-title">Title</label>
                    <input type="text" class="form-control" id="edit-blog-form-title" value="${data.title}" required>
                </div>
                <div class="form-group tal">
                    <label for="edit-blog-form-content">Content</label>
                    <textarea id="edit-blog-form-content" class="form-control" required rows="3">${data.content}</textarea>
                </div>
                <button type="button" class="submit-btn btn btn-primary" onclick="sendEditBlogReq(${blogStr})">Submit</button>
            </form>
        </div>
    `)

    $('#bs-modal').modal('show')
}

function sendEditBlogReq(obj) {

    obj = typeof obj == 'string' ?  JSON.parse(obj.replace(/'/g, '"')) : obj

    console.log('obj--------', obj)

    const data = {
        id: obj.id,
        title: $('#edit-blog-form-title').val(),
        content: $('#edit-blog-form-content').val()
    }

    $.ajax({
        url: `api/blog/${obj.id}`,
        type: 'PUT',
        contentType: 'application/json',
        data: JSON.stringify(data),
        success: function(response) {
            console.log('response:', response)
            response.cardId = obj.cardId
            updateBlogCard(response)
            $('#bs-modal').modal('hide')
        },
        error: function(xhr, status, error) {
            console.error('Error:', error)
        }
    });
}

function updateBlogCard(obj) {
    const blogCard = $(`#${obj.cardId}`)

    console.log('obj:', obj, blogCard)

    blogCard.find('.blog-title').text(obj.title)
    blogCard.find('.blog-content').text(obj.content)
}