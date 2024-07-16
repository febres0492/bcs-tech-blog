function capFirt(str) { return str.charAt(0).toUpperCase() + str.slice(1) }

function showMessageInModal(message) {
    S('.modal-body').empty();
    S('.modal-body').html(`
        <div class="col-12 py-2 jcc">
            <h3>${message}</h3>
        </div>
    `)
    S('#bs-modal').modal('show'); 
}

const  backBtnStr = `
    <div class="d-flex">
        <button class="btn btn-sm btn-info" onclick="window.location.href='/'"> <<< Home</button>
    </div>
`

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
        url: '/api/user/updatepassword',
        data: {email, token, newPassword},
        method: 'PUT'
    }).then((res) => {
        window.location.replace('/')
    }).catch(err => {
        console.log(err)
        showMessageInModal(err.responseJSON.message)
    })
}

function loadPasswordForm(e){
    e.preventDefault()
    S('.modal-header').empty();
    S('.modal-body').empty();
    S('.modal-body').html(`
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

    S('#bs-modal').modal('show')

    S('.submit-btn').on('click', ()=>{

        S('.modal-header').empty();

        const currentPassword = document.querySelector('#current-password').value
        const newPassword = document.querySelector('#new-password').value
        const repeatNewPassword = document.querySelector('#repeat-new-password').value
    
        if(newPassword!=repeatNewPassword){
            S('.modal-header').empty();
            S('.modal-header').html(`<h4 class="modal-title text-warning">New Password and Repeat Password do not match!</h4>`)
            return
        }

        $.ajax({
            url: '/api/user/update_password',
            data: {currentPassword, newPassword, 'email': S('#email').text()},
            method: 'PUT'
        }).then((res) => {
            showMessageInModal('Password Updated!')
        }).catch(err => {
            setTimeout(() => {
                S('.modal-header').empty();
                S('.modal-header').html(`<h4 class="modal-title text-warning">${err.responseJSON.message}</h4>`)
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

async function login(event) {

    // if target is input tag
    if(event.target?.tagName == 'INPUT' && event.key != 'Enter'){ return }

    event.preventDefault()

    const email = S('#email-login').val().trim()
    const password = S('#password-login').val().trim()

    console.log('email  password:', email, password)

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
            window.location.href='/'
        },
        error: function(xhr, status, error) {
            showMessageInModal(xhr.responseJSON.message)
        }
    })
}

function logout() {

    $.ajax({
        url: 'api/user/logout',
        type: 'POST',
        success: function(response) {
            window.location.href='/'
        },
        error: function(xhr, status, error) {
            console.error('Error:', error)
        }
    });
}

async function searchInput(ev) {

    // if target is input tag
    if(ev.target?.tagName == 'INPUT' && ev.key != 'Enter'){ 
        return 
    }

    ev.preventDefault()

    S('#blogs-container').empty()
    S('#blogs-container').append(`
        <div class="d-flex flex-column py-3" style="--g:3;">
            <div class="" style="--left:0;">${backBtnStr}</div>
            <h2 class="text-center m-0">Search Results</h2>
        </div>
    `)
    const search = S('#searchBar').val()
    const res = await sendBlogQuerySearch(search)
    renderBlogs(res)
}

function sendBlogQuerySearch(search) {
    return $.ajax({
        url: `api/blog/search/${search}`,
        type: 'GET',
        dataType: 'json',
        success: function(response) {
            return response
        },
        error: function(xhr, status, error) {
            console.error('Error:', error)
        }
    });
}

function getBlogs(obj) {
    obj = typeof obj == 'string' ?  JSON.parse(obj.replace(/'/g, '"')) : obj
    
    return $.ajax({
        url: 'api/blog',
        type: 'GET',
        data: obj,
        success: function(blogs) {
            blogs = [...blogs]
            blogs = blogs.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
            return blogs
        },
        error: function(xhr, status, error) {
            console.error('Error:', xhr)
        }
    });
}

function getUserBlogs () {
    return $.ajax({
        url: 'api/blog',
        type: 'GET',
        data: { getUserBlogs: true,  },
        success: function(response) {
            return response
        },
        error: function(xhr, status, error) {
            console.error('Error:', xhr)
        }
    });
}

function addingBlogCardId(blog) {
    blog.cardId = `blog-${blog.authorName[0]}${blog.authorId}-${blog.id}`
    blog.blog_comments = blog.blog_comments?.map(comment => {
        return {...comment, blogCardId: blog.cardId}
    }) || []
    return blog
}

function addingCommentCardId(comment) {
    comment.cardId = `${comment.blogCardId}_comment-${comment.id}`
    return comment
}

function getBlogById(blogId) {
    return $.ajax({
        url: `api/blog/id/${blogId}`,
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

function getPartialBlogCardTemplate(obj){
    const blog = localBlogsData[obj.cardId]
    const objStr = JSON.stringify({cardId:blog.cardId}).replace(/"/g, "'")

    return `
        <div id="${blog.cardId}" class="blog-card bg-l1 rounded p-3 mb-3 pointer ani" style="--hover-scale:1.02;" onclick="loadBlog(${objStr})">
            <div class="d-flex flex-column flex-sm-row jcsb" style="--g:2;">
                <div class="d-flex flex-column" >
                    <h3 class="blog-title m-0 mr-auto">${blog.title || "No Title"}</h3>
                    <p class="comments-count m-0">Comments: ${blog.blog_comments?.length || 0}</p>
                </div>
                <div class="d-flex flex-column">
                    <p class="m-0">By: ${blog.authorName}</p>
                    <p class="m-0">${new Date(blog.createdAt).toLocaleString()}</p>
                </div>
            </div>
        </div>
    `
}

function getBlogCardTemplate(obj) {

    const blog = localBlogsData[obj.cardId]
    const objStr = JSON.stringify(obj).replace(/"/g, "'")

    // const datetime = new Date(blog.createdAt).toLocaleString().split(',')
    const datetime = formatDateTime(blog.createdAt)

    return `
        <div id="${blog.cardId}" class="blog-card rounded bg-l1 p-3 mb-3">
            <div class="rounded p-2 px-3 bg-l1">
                <p class="blog-content m-0 pre-wrap">${blog.content}</p>
            </div>
            <div class="df jcsb p-0 py-2" style="--gx:8; --gy:1; --ch-m:0;">
                <p>By: ${blog.authorName}</p>
                <p>Creadted: ${datetime.dateTime}</p>
                <p>Last Updated: ${formatDateTime(blog.updatedAt).dateTime}</p>
            </div>
            <hr>
            <div class="d-flex jcsb pb-2">
                <p class="m-0">Comments: ${blog.blog_comments?.length || 0}</p>
            </div>
            <div class="comments-container"></div>
            <hr>
            <button class="btn btn-sm btn-info" onclick="showCommentForm(${objStr})">Comment</button>
        </div>
    `
}

function prependBlog(blog) {

    const cardId = `${blog.authorName[0]}${blog.authorId}_${blog.id}`
    blog.cardId = cardId
    localBlogsData[cardId] = blog
    S('#blogs-container').prepend( getBlogCardTemplate({ cardId, isAuthor: true }) )
}

async function renderBlogs(blogs) {
    localBlogsData = {}
    blogs = blogs || await getBlogs()
    
    if(blogs.length == 0){
        S('#blogs-container').append(`
            <div class="d-flex jcc aic rel py-3">
                <h2 class="text-center m-0">No Blogs Found</h2>
            </div>
        `)
        return
    }
    blogs.forEach(renderPartialBlogCard)
}

function S(el){
    const val = el
    el = $(el)
    if(el.length == 0){ 
        throw new Error(`Element ${val} not found`) 
    }
    return el
}

function formatDateTime(datetime) {
    console.log('datetime:', datetime)
    const options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true 
    }
    const dateTime = new Date(datetime).toLocaleDateString('en-US', options)
    const date = dateTime.split(', ')[0]
    const time = dateTime.split(', ')[1]
    return { dateTime, date, time }
}

async function getCommentTemplate(comment) {

    const currUser = await getCurUser()
    const isBlogAuthor = currUser.id == comment.blogPostCreatorId
    const iscomentCreator = currUser.id == comment.commentCreatorId
    const objStr = JSON.stringify({cardId:comment.cardId, iscomentCreator: iscomentCreator}).replace(/"/g, "'")
    const isNotDeleted = !comment.commentText.includes('Deleted by')
    const isDisabled = !isNotDeleted ? 'bg-ac2' : ''

    const datetime = formatDateTime(comment.createdAt)

    const str = `
        <div id="${comment.cardId}" class="comment-card pt-1 px-2 pb-2 mb-3 rounded bg-d2 ${isDisabled ? 'text-secondary' : ''}">
            <div class="d-flex jcsb flex-column flex-sm-row">
                <p class="m-0 fg">By: ${comment.commentCreatorName}</p>
                <div class="df" style="--g:2">
                    <p class="m-0">${datetime.date}</p>
                    <p class="m-0">${datetime.time}</p>
                </div>
            </div>
            <p class="comment-text m-0 pre-wrap px-1 bg-d2">${comment.commentText}</p>

            ${ isNotDeleted && (iscomentCreator || isBlogAuthor) ? 
                `<div class="dropright dropmenu">
                    <button class="btn btn-sm dropbtn dropdown-toggle bg-d2 text-white">Options</button>
                    <div class="dropdown-content rounded bg-d2" style="--top:0; --left:100%;">
                        <div class="d-flex flex-column px-2 bg-d2 py-2" style="--g:2;">
                            ${iscomentCreator ? `<button class="btn btn-sm btn-info" onclick="showEditCommentForm(${objStr})">Edit</button>` : ''}
                            ${(isBlogAuthor || iscomentCreator) ? `<button class="btn btn-sm btn-danger" onclick="showDeleteConfirmation(${objStr})">Delete</button>` : ''}
                        </div>
                    </div>
                </div>` : ''
            }
        </div>
    `
    return str
}

function getCurUser() {

    if(userData.id != null){
        return userData
    } else {
        return $.ajax({
            url: 'api/user/current_user',
            type: 'GET',
            success: function(response) {
                userData = response
                $('.account-btn').text(response.name)
                return response
            },
            error: function(xhr, status, error) {
                console.error('Error:', error)
            }
        });
    }

}

async function showPostBlogForm() { 

    if(loginRequired()){ return }

    S('.modal-header').html(` <div class="d-flex"> <h3>Create Blog Post</h3> </div> `)
    S('.modal-body').empty()
    S('.modal-body').html(`
        <div class="col-12 py-2">
            <form id="create-blog-form">
                <div class="form-group tal">
                    <label for="create-blog-form-title">Title</label>
                    <p class="text-warning title-req float-right"></p>
                    <input type="text" class="form-control title-input" placeholder="Blog Title" required>
                </div>
                <div class="form-group tal">
                    <label for="create-blog-form-content">Content</label>
                    <p class="text-warning content-req float-right"></p>
                    <textarea class="form-control content-input" required rows="10" placeholder="Blog Content"></textarea>
                </div>
                <button type="button" class="submit-btn btn btn-sm btn-primary" onclick="sendPostBlogRequest(event)">Submit</button>
            </form>
        </div>
    `)

    S('.modal-dialog').css('max-width', 'min(90vw, 800px)')

    S('#bs-modal').modal('show')
}

async function hideModal() { 
    S('#bs-modal').modal('hide')
    setTimeout(() =>  S('.modal-dialog').css('max-width', '500px'), 1000)
}

async function showEditBlogForm(obj) {

    obj = typeof obj == 'string' ?  JSON.parse(obj.replace(/'/g, '"')) : obj

    const blog = localBlogsData[obj.cardId]
    const content = blog.content

    const objStr = JSON.stringify(blog).replace(/"/g, "'")

    S('.modal-header').html(` <div class="d-flex"> <h3>Edit Blog Post</h3> </div> `)
    S('.modal-body').empty()
    S('.modal-body').html(`
        <div class="col-12 py-2">
            <form id="edit-blog-form">
                <div class="form-group tal">
                    <label for="edit-blog-form-title">Title</label>
                    <p class="text-warning title-req float-right"></p>
                    <input type="text" class="form-control" id="edit-blog-form-title" value="${blog.title}" required>
                </div>
                <div class="form-group tal">
                    <label for="edit-blog-form-content">Content</label>
                    <p class="text-warning content-req float-right"></p>
                    <textarea id="edit-blog-form-content" class="form-control" required rows="20">${content}</textarea>
                </div>
                <button type="button" class="submit-btn btn btn-sm btn-primary" onclick="sendEditBlogRequest(${objStr})">Submit</button>
            </form>
        </div>
    `)

    S('.modal-dialog').css('max-width', 'min(90vw, 1000px)')

    S('#bs-modal').modal('show')
}

// create a function to let the user know that they have to login to comment
function loginRequired() {
    // checking if user is logged in
    const currUser = getCurUser()
    if (!currUser.id) {
        S('.modal-body').empty()
        S('.modal-body').html(`
            <div class="col-12 py-2">
                <h3>Please</h3>
                <button class="btn btn-sm btn-primary" onclick="window.location.href='/login'">Login</button>
                <h3>or</h3>
                <button class="btn btn-sm btn-primary" onclick="window.location.href='/signup'">Create Account</button>
            </div>
        `)
        S('#bs-modal').modal('show')
        return true
    }
     return false
}

function showCommentForm(cardId) {

    if(loginRequired()){ return }

    const objStr = JSON.stringify(cardId).replace(/"/g, "'")

    S('.modal-header').html(` <div class="d-flex"> <h3>Leave a Comment</h3> </div> `)
    S('.modal-body').empty()
    S('.modal-body').html(`
        <div class="col-12 py-2">
            <form id="comment-form">
                <div class="form-group tal">
                    <textarea id="comment-form-content" class="form-control" required rows="6" placeholder="Comment"></textarea>
                </div>
                <button type="button" class="submit-btn btn-sm btn btn-primary mb-2" onclick="sendCommentRequest(${objStr})">Submit</button>
                <p class="m-0 text-secondary">Comments can be deleted by the Blog Post Creator</p>
            </form>
        </div>
    `)

    S('#bs-modal').modal('show')
}

function showEditCommentForm(obj) {
    obj = typeof obj == 'string' ?  JSON.parse(obj.replace(/'/g, '"')) : obj
    console.log('showEditCommentForm:', obj)

    const commentText = S(`#${obj.cardId}`).find('.comment-text').text()

    const objStr = JSON.stringify({ cardId: obj.cardId }).replace(/"/g, "'")

    S('.modal-header').html(` <div class="d-flex"> <h3>Edit Comment</h3> </div> `)
    S('.modal-body').empty()
    S('.modal-body').html(`
        <div class="col-12 py-2">
            <form id="edit-comment-form">
                <div class="form-group tal">
                    <textarea id="edit-comment-form-content" class="form-control" required rows="3" placeholder="Comment">${commentText}</textarea>
                </div>
                <button type="button" class="submit-btn btn btn-sm btn-primary" onclick="sendEditCommentRequest(${objStr})">Submit</button>
            </form>
        </div>
    `)

    S('#bs-modal').modal('show')
}

function updateCommentCard(obj) {
    S(`#${obj.cardId}`).find('.comment-text').text(obj.commentText)
}

function sendResetEmail(e){
    e.preventDefault()
    const email = document.querySelector('#email-login').value
    $.ajax({
        url: 'api/valtoken/email_token',
        data: { email: email},
        method: 'POST'
    }).then((res) => {
        // console.log(res)
        window.location.replace('/passwordresetform')
    }).catch(err => {
        console.log(err)
        showMessageInModal(err.responseJSON.message)
    })
}

function sendPostBlogRequest(ev) {
    ev.preventDefault()
    const form = S(ev.target).closest('form')
    const title = form.find('.title-input').val()
    const content = form.find('.content-input').val() 

    if(noInput({title, content})) {return}

    hideModal()

    $.ajax({
        url: 'api/blog/create',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ title, content }),
        success: function(blog) {
            S('#blogs-container').empty()
            loadBlog(blog, {isNewBlog: true})
        },
        error: function(xhr, status, error) {
            console.error('Error:', error)
        }
    });
}

function sendDeleteBlogRequest(obj) {

    obj = typeof obj == 'string' ?  JSON.parse(obj.replace(/'/g, '"')) : obj
        const blog = localBlogsData[obj.cardId]

    $.ajax({
        url: `api/blog/id/${blog.id}`,
        type: 'DELETE',
        success: function(response) {
            hideModal()
            loadDashboard()
        },
        error: function(xhr, status, error) {
            console.error('Error:', error)
        }
    });
}

function sendEditBlogRequest(obj) {

    obj = typeof obj == 'string' ?  JSON.parse(obj.replace(/'/g, '"')) : obj

    const title = S('#edit-blog-form-title').val()
    const content = S('#edit-blog-form-content').val()

    if(noInput({title, content})) {return}

    const data = {
        'id': obj.id,
        title,
        content
    }

    $.ajax({
        url: `api/blog/id/${obj.id}`,
        type: 'PUT',
        contentType: 'application/json',
        data: JSON.stringify(data),
        success: function(response) {
            response.cardId = obj.cardId
            updateBlogCard(response)
            hideModal()
        },
        error: function(xhr, status, error) {
            console.error('Error:', error)
        }
    });
}

function noInput(obj){
    let error = false
    if(obj.title.length == 0){
        S('.title-req').text('Title is required')
        error = true
    }
    if(obj.content.length == 0){
        S('.content-req').text('Content is required')
        error = true
    }
    return error
}

async function sendCommentRequest(obj) {

    obj = typeof obj == 'string' ?  JSON.parse(obj.replace(/'/g, '"')) : obj
    const blog = localBlogsData[obj.cardId]

    const data = {
        blogPostId: blog.id,
        blogPostCreatorId: blog.authorId,
        commentText: S('#comment-form-content').val(),
        getBlog: true
    }


    $.ajax({
        url: `api/comment/`,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(data),
        success: async function(response) {
            response.cardId = obj.cardId
            hideModal()
            localBlogsData[obj.cardId] = response
            loadBlog(response)
        },
        error: function(xhr, status, error) {
            console.error('Error:', error)
        }
    });
}

async function sendDeleteCommentRequest(obj) {
    obj = typeof obj == 'string' ?  JSON.parse(obj.replace(/'/g, '"')) : obj

    const blogCardId = obj.cardId.split('_')[0]
    const blog = localBlogsData[blogCardId]
    const comment = blog.blog_comments.find(comment => comment.cardId == obj.cardId)
    const currUser = getCurUser()
    const isCommentCreator = currUser.id == comment.commentCreatorId
    const whoIsDeleting = isCommentCreator ? 'Comment Creator' : 'Blogpost Creator'
    obj.commentText = `Deleted by ${whoIsDeleting}`

    await sendEditCommentRequest(obj)
    loadBlog({cardId: blogCardId})
}

function sendEditCommentRequest(obj) {
    obj = typeof obj == 'string' ?  JSON.parse(obj.replace(/'/g, '"')) : obj

    const blogCardId = obj.cardId.split('_')[0]
    const comment = localBlogsData[blogCardId].blog_comments.find(comment => comment.cardId == obj.cardId)
    comment.commentText = obj.commentText || S('#edit-comment-form-content').val()

    return $.ajax({
        url: `api/comment/${comment.id}`,
        type: 'PUT',
        contentType: 'application/json',
        data: JSON.stringify(comment),
        success: function(response) {
            console.log('response:', response)
            hideModal()
            S(`#${obj.cardId}`).find('.comment-text').text(response.commentText)
            return response
        },
        error: function(xhr, status, error) {
            console.error('Error:', error)
        }
    });
}

function renderPartialBlogCard(blog) {
    blog = addingBlogCardId(blog)
    localBlogsData[blog.cardId] = blog
    S('#blogs-container').append( getPartialBlogCardTemplate({ cardId: blog.cardId }) )
}

function loadAllBlogs() {
    S('#searchBar').val('')
    S('#blogs-container').empty()
    S('#blogs-container').append(`
        <div class="d-flex jcsb aic rel py-3">
            <h2 class="text-center m-0">All Blogs</h2>
            <button class="btn btn-sm btn-primary" onclick="showPostBlogForm()">Create Blog</button>
        </div>
    `)
    renderBlogs()
}

async function loadDashboard(){

    if(loginRequired()){ return }

    S('#searchBar').val('')
    S('#blogs-container').empty()
    S('#blogs-container').append(`
        <div class="d-flex jcsb aic rel py-3">
            <h2 class="text-center m-0">My Blogs</h2>
            <button class="btn btn-sm btn-primary" onclick="showPostBlogForm()">Create Blog</button>
        </div>
    `)

    const userBlogs = await getBlogs({ getUserBlogs: true })
    renderBlogs(userBlogs)
}

async function loadBlog(obj, vals){
    obj = typeof obj == 'string' ?  JSON.parse(obj.replace(/'/g, '"')) : obj
    
    if(vals?.isNewBlog){
        obj = addingBlogCardId(obj)
        localBlogsData[obj.cardId] = obj
    }
    const blog = localBlogsData[obj.cardId]
    const currUser = await getCurUser()
    const isAuthor = currUser.id == blog.authorId

    const objStr = JSON.stringify({cardId: obj.cardId}).replace(/"/g, "'")

    S('#blogs-container').empty()
    S('#blogs-container').append(`
        <div class="df jcsb aic rel py-3">
            <div class="" style="--left:0;">${backBtnStr}</div>
            ${isAuthor ? `
                <div class="" style="--right:0;">
                    <div class="dropdown dropmenu">
                        <button class="btn btn-sm dropbtn dropdown-toggle bg-d2 text-white">
                            Options
                        </button>
                        <div class="dropdown-content rounded bg-ac1" style="--right:0;">
                            <div class="d-flex flex-column px-2 bg-d2 py-2" style="--g:2;">
                                <button class="btn btn-sm btn-info" onclick="showEditBlogForm(${objStr})">
                                    Edit
                                </button>
                                <button class="btn btn-sm btn-danger" onclick="showDeleteConfirmation(${objStr})">
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ` : ''}
        </div>
        <h2 class="text-center mb-3 blog-title">${blog.title || 'No Title'}</h2>
    `)
    renderBlogCard(blog)
}

function showDeleteConfirmation(obj) {
    obj = typeof obj == 'string' ?  JSON.parse(obj.replace(/'/g, '"')) : obj
    
    const isComment = obj.cardId.includes('comment')
    const objStr = JSON.stringify(obj).replace(/"/g, "'")
    const deleteFunc = isComment ? `sendDeleteCommentRequest(${objStr})` : `sendDeleteBlogRequest(${objStr})`

    S('.modal-header').html(` <div class="d-flex"> <h3>Confirmation</h3> </div> `)
    S('.modal-body').empty()
    S('.modal-body').html(`
        <div class="col-12 py-2 d-flex flex-column jcc">
            <h3>Delete?</h3>
            <div class="d-flex" style="--g:3;" >
                <button type="button" class="btn btn-sm btn-danger fg" 
                    onclick="${deleteFunc}"
                    >Yes
                </button> <button type="button" class="btn btn-sm btn-primary fg" onclick="hideModal()"
                    >No
                </button>
            </div>
        </div>
    `)

    S('#bs-modal').modal('show')
}

function renderBlogCard(blog) {
    
    const currUser = getCurUser()
    const isAuthor = currUser.id == blog.authorId

    blog = addingBlogCardId(blog)
    localBlogsData[blog.cardId] = blog

    S('#blogs-container').append( getBlogCardTemplate({ cardId: blog.cardId, isAuthor }))

    // sorting comments by date
    blog.blog_comments.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    blog.blog_comments.forEach(addComment)
}

function updateBlogCard(blog) {
    console.log('updateBlogCard:', blog)
    localBlogsData[blog.cardId] = blog
    S('.blog-title').text(blog.title)
    S(`#${blog.cardId}`).find('.blog-content').html(blog.content)
}

async function addComment(comment) {
    comment = addingCommentCardId(comment)

    // checking if the comment is already in the localBlogsData
    const isCommentInLocalData = localBlogsData[comment.blogCardId].blog_comments.some(c => c.id == comment.id)

    if(!isCommentInLocalData){ 
        localBlogsData[comment.blogCardId].blog_comments.push(comment)
    }

    const commentHtml = await getCommentTemplate(comment)

    S(`#${comment.blogCardId}`).find('.comments-container').append( commentHtml )
    $('.comments-count').text(`Comments: ${localBlogsData[comment.blogCardId].blog_comments.length}`)
}

function loadSettingsPage(){
    if(loginRequired()){ return }
    window.location.href='/user_settings'
}