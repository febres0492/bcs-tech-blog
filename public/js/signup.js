
$('#signup-form').on('submit', function(event) {
    event.preventDefault()
    const name = $('#name-signup').val().trim()
    const lastname = $('#last-name-signup').val().trim()
    const name_lastname = name + ' ' + lastname
    const email = $('#email-signup').val().trim()
    const password = $('#password-signup').val().trim()
    const repeatPassword = $('#repeat-password-signup').val().trim()



    if (password !== repeatPassword) {
        showMessageInModal('Passwords do not match')
        return
    }
    if (name_lastname && email && password) {
        $.ajax({
            url: '/api/user/signup',
            data: { name_lastname, email, password },
            method: 'POST'
        }).then((res) => {
            console.log('res', res)
            window.location.replace('/')
        }).catch(err => {
            if(err.responseJSON.name === 'SequelizeValidationError'){
            showMessageInModal(err.responseJSON.errors[0].message)
            }else{
            showMessageInModal(err.responseJSON.message);
            }
        })
    }
})
