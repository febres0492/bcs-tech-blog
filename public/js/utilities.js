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
        // console.log(err)
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
                <button type="button" class="submit-btn btn btn-sm btn-primary">Submit</button>
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
            // console.log('response:', response.message, response.results)
        },
        error: function(xhr, status, error) {
            console.error('Error:', error)
        }
    });
}

async function login(event) {

    // console.log('login')

    event.preventDefault()

    const email = $('#email-login').val().trim()
    const password = $('#password-login').val().trim()

    if(!email || !password){
        showMessageInModal('Please enter email and password')
        return
    }

    $.ajax({
        url: 'api/user/login',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ email, password }),
        success: function(response) {
            // console.log('response:', response)
            sessionStorage.setItem('currUser', JSON.stringify(response.user));
            window.location.href='/'
        },
        error: function(xhr, status, error) {
            console.error('Error:', error)
            showMessageInModal(error.responseJSON.message)
        }
    })
}

function logout() {

    // console.log('logout')
    sessionStorage.removeItem('currUser');

    $.ajax({
        url: 'api/user/logout',
        type: 'POST',
        success: function(response) {
            // console.log('response:', response)
            window.location.href='/'
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
            // console.log('response:', response)
            return response
        },
        error: function(xhr, status, error) {
            console.error('Error:', error)
        }
    });
}

function addBlogCardId(blog) {
    blog.cardId = `blog_${blog.authorName[0]}${blog.authorId}_${blog.id}`
    blog.comments = blog.comments?.map(comment => {
        return {...comment, blogCardId: blog.cardId}
    }) || []
    return blog
}

function addCommentCardId(comment) {
    comment.cardId = `comment_${comment.commentCreatorName[0]}${comment.commentCreatorId}_${comment.id}`
    return comment
}

function getBlogById(blogId) {
    return $.ajax({
        url: `api/blog/${blogId}`,
        type: 'GET',
        success: function(response) {
            // console.log('response:', response)
            return response
        },
        error: function(xhr, status, error) {
            console.error('Error:', error)
        }
    });
}

function getBlogCardTemplate(obj) {

    const blog = localBlogsData[obj.cardId]
    const isAuthor = obj.isAuthor || false
    const objStr = JSON.stringify(obj).replace(/"/g, "'")

    return `
        <div id="${blog.cardId}" class="blog-card border p-3 mb-3">
            <div class="d-flex jcsb p-2">
                <h3 class="blog-title m-0">${blog.title}</h3>
                <p class="m-0">By: ${blog.authorName}</p>
                <p class="m-0">Created: ${new Date(blog.createdAt).toLocaleString()}</p>
            </div>
            <hr>
            <p class="blog-content">${blog.content}</p>
            <hr>
            <div class="d-flex jcsb">
                <p class="m-0">Comments: ${blog.comments?.length || 0}</p>
                <p class="m-0">Last Updated: ${new Date(blog.updatedAt).toLocaleString()}</p>
            </div>
            <div class="comments-container">
                ${blog.comments?.map(comment => getCommentTemplate(comment)).join('') || ''}
            </div>
            ${isAuthor ? `<button class="btn btn-sm btn-primary" onclick="showEditBlogForm(${objStr})">Edit</button>` : ''}
            ${isAuthor ? `<button class="btn btn-sm btn-danger" onclick="sendDeleteBlogRequest(${objStr})">Delete</button>` : ''}
            <button class="btn btn-sm btn-info" onclick="showCommentForm(${objStr})">Comment</button>
        </div>
    `
}

function prependBlog(blog) {

    // console.log('prependBlog ------------- :', blog)
    const cardId = `${blog.authorName[0]}${blog.authorId}_${blog.id}`
    blog.cardId = cardId
    localBlogsData[cardId] = blog
    $('#blogs-container').prepend( getBlogCardTemplate({ cardId, isAuthor: true }) )
}

async function renderBlogs() {
    const blogs = [...await getBlogs()].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    localBlogsData = {}
    
    $('#blogs-container').empty();
    blogs.forEach(blog => renderBlogCard(blog, false) )
}

function getCommentTemplate(comment) {
    const currUser = JSON.parse(sessionStorage.getItem('currUser')) || {}
    const isBlogAuthor = currUser.id == comment.blogPostCreatorId
    const iscomentCreator = currUser.id == comment.commentCreatorId
    const objStr = JSON.stringify(comment).replace(/"/g, "'")

    return `
        <div id="${comment.cardId}" class="comment-card border p-3 mb-3 rounded">
            <div class="d-flex jcsb">
                <p class="m-0">By: ${comment.commentCreatorName}</p>
                <p class="m-0">Created: ${new Date(comment.createdAt).toLocaleString()}</p>
            </div>
            <p class="comment-text m-0">${comment.commentText}</p>
            ${iscomentCreator ? `<button class="btn btn-sm btn-info" onclick="showEditCommentForm(${objStr})">Edit</button>` : ''}
            ${(isBlogAuthor || iscomentCreator) ? `<button class="btn btn-sm btn-danger" onclick="sendDeleteCommentRequest(${objStr})">Delete</button>` : ''}
        </div>
    `
}

function getCurUser() {

    if (sessionStorage.currUser) {
        return sessionStorage.currUser
    }
    return $.ajax({
        url: 'api/user/current_user',
        type: 'GET',
        success: function(response) {
            // console.log('response:', response)
            sessionStorage.currUser = response
            return response
        },
        error: function(xhr, status, error) {
            console.error('Error:', error)
        }
    });
}

async function showPostBlogForm() {
    // console.log('showPostBlogForm')
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
                <button type="button" class="submit-btn btn btn-sm btn-primary" onclick="sendPostBlogRequest(event)">Submit</button>
            </form>
        </div>
    `)

    $('#bs-modal').modal('show')
}

async function showEditBlogForm(obj) {

    obj = typeof obj == 'string' ?  JSON.parse(obj.replace(/'/g, '"')) : obj

    const blog = localBlogsData[obj.cardId]
    const title = $(`#${obj.cardId}`).find('.blog-title').text()
    const content = $(`#${obj.cardId}`).find('.blog-content').text()

    const objStr = JSON.stringify(blog).replace(/"/g, "'")

    $('.modal-header').html(` <div class="d-flex"> <h3 cl>Edit Blog Post</h3> </div> `)
    $('.modal-body').empty()
    $('.modal-body').html(`
        <div class="col-12 py-2">
            <form id="edit-blog-form">
                <div class="form-group tal">
                    <label for="edit-blog-form-title">Title</label>
                    <input type="text" class="form-control" id="edit-blog-form-title" value="${title}" required>
                </div>
                <div class="form-group tal">
                    <label for="edit-blog-form-content">Content</label>
                    <textarea id="edit-blog-form-content" class="form-control" required rows="3">${content}</textarea>
                </div>
                <button type="button" class="submit-btn btn btn-sm btn-primary" onclick="sendEditBlogRequest(${objStr})">Submit</button>
            </form>
        </div>
    `)

    $('#bs-modal').modal('show')
}

function updateBlogCard(obj) {
    const blogCard = $(`#${obj.cardId}`)

    // console.log('obj:', obj, blogCard)

    blogCard.find('.blog-title').text(obj.title)
    blogCard.find('.blog-content').text(obj.content)
}

function showCommentForm(cardId) {

    // checking if user is logged in
    if (!sessionStorage.currUser) {
        $('.modal-body').empty()
        $('.modal-body').html(`
            <div class="col-12 py-2">
                <h3>Please login to comment</h3>
                <button class="btn btn-sm btn-primary" onclick="window.location.href='/login'">Login</button>
            </div>
        `)
        $('#bs-modal').modal('show')
        return
    }

    const objStr = JSON.stringify(cardId).replace(/"/g, "'")

    $('.modal-header').html(` <div class="d-flex"> <h3 cl>Leave a Comment</h3> </div> `)
    $('.modal-body').empty()
    $('.modal-body').html(`
        <div class="col-12 py-2">
            <form id="comment-form">
                <div class="form-group tal">
                    <textarea id="comment-form-content" class="form-control" required rows="3" placeholder="Comment"></textarea>
                </div>
                <button type="button" class="submit-btn btn-sm btn btn-primary" onclick="sendCommentRequest(${objStr})">Submit</button>
            </form>
        </div>
    `)

    $('#bs-modal').modal('show')

    // console.log('data', sessionStorage)
}

function showEditCommentForm(obj) {
    obj = typeof obj == 'string' ?  JSON.parse(obj.replace(/'/g, '"')) : obj
    // console.log('showEditCommentForm:', obj)

    const objStr = JSON.stringify(obj).replace(/"/g, "'")

    $('.modal-header').html(` <div class="d-flex"> <h3 cl>Edit Comment</h3> </div> `)
    $('.modal-body').empty()
    $('.modal-body').html(`
        <div class="col-12 py-2">
            <form id="edit-comment-form">
                <div class="form-group tal">
                    <textarea id="edit-comment-form-content" class="form-control" required rows="3" placeholder="Comment">${obj.commentText}</textarea>
                </div>
                <button type="button" class="submit-btn btn btn-sm btn-primary" onclick="sendEditCommentRequest(${objStr})">Submit</button>
            </form>
        </div>
    `)

    $('#bs-modal').modal('show')
}

function updateCommentCard(obj) {
    $(`#${obj.cardId}`).find('.comment-text').text(obj.commentText)
}

function sendResetEmail(e){
    e.preventDefault()
    const email = document.querySelector('#email-login').value
    $.ajax({
        url: 'api/token/email_token',
        data: { email: email},
        method: 'POST'
    }).then((res) => {
        // console.log(res)
        window.location.replace('/passwordresetform')
    }).catch(err => {
        // console.log(err)
        showMessageInModal(err.responseJSON.message)
    })
}

function sendPostBlogRequest(ev) {
    ev.preventDefault()
    const form = $(ev.target).closest('form')
    const title = form.find('.form-control[name="title"]').val()
    const content = form.find('.form-control[name="content"]').val()

    // console.log('data', { title, content })

    // hiding modal
    $('#bs-modal').modal('hide')

    $.ajax({
        url: 'api/blog',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ title, content }),
        success: function(blog) {
            // console.log('new blog:', blog)
            prependBlog(blog)
        },
        error: function(xhr, status, error) {
            console.error('Error:', error)
        }
    });
}

function sendDeleteBlogRequest(obj) {

    obj = typeof obj == 'string' ?  JSON.parse(obj.replace(/'/g, '"')) : obj

    // console.log('sendDeleteBlogReq:', obj)
    const blog = localBlogsData[obj.cardId]

    $.ajax({
        url: `api/blog/${blog.id}`,
        type: 'DELETE',
        success: function(response) {
            // console.log('response:', response)
            $(`#${obj.cardId}`).remove()
        },
        error: function(xhr, status, error) {
            console.error('Error:', error)
        }
    });
}

function sendEditBlogRequest(obj) {

    obj = typeof obj == 'string' ?  JSON.parse(obj.replace(/'/g, '"')) : obj

    // console.log('obj--------', obj)

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
            // console.log('response:', response)
            response.cardId = obj.cardId
            updateBlogCard(response)
            $('#bs-modal').modal('hide')
        },
        error: function(xhr, status, error) {
            console.error('Error:', error)
        }
    });
}

function sendCommentRequest(obj) {

    obj = typeof obj == 'string' ?  JSON.parse(obj.replace(/'/g, '"')) : obj
    const blog = localBlogsData[obj.cardId]
    
    const data = {
        blogPostId: blog.id,
        blogPostCreatorId: blog.authorId,
        commentText: $('#comment-form-content').val(),
        commentCreatorId: JSON.parse(sessionStorage.currUser).id,
        commentCreatorName: JSON.parse(sessionStorage.currUser).name,
    }

    console.log('sendCommentReq', obj, blog, data)

    $.ajax({
        url: `api/comment/`,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(data),
        success: function(response) {
            response.cardId = obj.cardId
            $('#bs-modal').modal('hide')
            
            response.cardId = obj.cardId
            renderBlogCard(response)
        },
        error: function(xhr, status, error) {
            console.error('Error:', error)
        }
    });
}

function sendDeleteCommentRequest(obj) {
    obj = typeof obj == 'string' ?  JSON.parse(obj.replace(/'/g, '"')) : obj

    $.ajax({
        url: `api/comment/${obj.id}`,
        type: 'DELETE',
        data: JSON.stringify({ id: obj.id, }),
        success: function(response) {
            response.cardId = obj.cardId
            renderBlogCard(response)
        },
        error: function(xhr, status, error) {
            console.error('Error:', error)
        }
    });
}

function sendEditCommentRequest(obj) {
    obj = typeof obj == 'string' ?  JSON.parse(obj.replace(/'/g, '"')) : obj
    obj.commentText = $('#edit-comment-form-content').val()
    // console.log('sendEditCommentReq:', obj)

    $.ajax({
        url: `api/comment/${obj.id}`,
        type: 'PUT',
        contentType: 'application/json',
        data: JSON.stringify(obj),
        success: function(response) {
            $('#bs-modal').modal('hide')
            // console.log('sendEditCommentReq response:', response)
            response.cardId = obj.cardId
            renderBlogCard(response)
        },
        error: function(xhr, status, error) {
            console.error('Error:', error)
        }
    });
}

function renderBlogCard(blog, isUpdate=true) {
    // console.log('renderBlogCard:', blog)

    if(isUpdate && !blog.cardId) {
        console.error('Error: blog.cardId is missing')
        return
    }

    const currUser = JSON.parse(sessionStorage.getItem('currUser')) || {}
    const isAuthor = currUser.id == blog.authorId
    blog = addBlogCardId(blog)
    blog.comments = blog.comments.map(addCommentCardId)
    localBlogsData[blog.cardId] = blog

    const blogCardExists = $(`#${blog.cardId}`).length > 0

    // console.log('blogCardExists:', $(`#${blog.cardId}`))

    if (blogCardExists) {
        // console.log('exit: blogCardExists:', blog.cardId)
        $(`#${blog.cardId}`).replaceWith( getBlogCardTemplate({ cardId: blog.cardId, isAuthor }) )
    } else {
        // console.log('Does not Exists:', blog.cardId)
        $('#blogs-container').prepend( getBlogCardTemplate({ cardId: blog.cardId, isAuthor }) )
    }
}