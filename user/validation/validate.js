export const exists = ({...values}) => {
    let errors = [];
    for(let value in values){
        console.log(values)
        if(values[value] === undefined || values[value] === null){
            errors[errors.length] = {field: value, message: `${value} is required!`}
        }
    }
    return errors.length ? errors : false;
    // checking whether any given value is not null or undefined
}

export const validateName = (name) => {
    const validValue = /^[A-Za-z\s]+$/;
    return validValue.test(name) && name.length > 2 && name.length < 20;
    // name must not null and not undefined
    // name should only have alphabet letters and spaces
    // name must have a length of above 2 and below 20
}

export const validateUsername = (username) => {
    console.log(username)
    const validValue = /^[A-Za-z0-9]*$/;
    return validValue.test(username) && username.length < 16 && username.length > 3;
    // username must exist
    // username must be aplhanumeric without spaces
    // username must have a length less than 16
}

export const validateMobile = (mobile) => {
    const validValue = /^[0-9]*$/;
    return true
    return mobile.length === 10 && validValue.test(mobile);
    // mobile must exist and only be number;
}

export const validatePassword = (password) => {
    const validValue = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{6,}$/;
    return validValue.test(password);
    // password must exist and shouldn't contain spaces
}

export const validateEmail = (email) => {
    const validValue = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    return validValue.test(email);
    // email must exist and should be valid
}

export const validateBio = (bio) => {
    return (bio.length < 101 && bio.split(/\r\n|\r|\n/).length < 6);
}

export const validate = ({...values}) => {
    let errors = []
    if(values.name || values.name === ''){
        if(!validateName(values.name)){
            errors[errors.length] = {field: 'name', message: 'Name is not valid!'};
        }
    }
    if(values.username || values.username === ''){
        if(!validateUsername(values.username)){
            errors[errors.length] = {field: 'username', message: 'Username is not valid!'};
        }
    }
    if(values.email || values.email === ''){
        if(!validateEmail(values.email)){
            errors[errors.length] = {field: 'email', message: 'Email is not valid!'};
        }
    }
    if(values.mobile || values.mobile === 0){
        if(!validateMobile(values.mobile)){
            errors[errors.length] = {field: 'mobile', message: 'Mobile is not valid!'};
        }
    }
    if(values.password || values.password === ''){
        if(!validatePassword(values.password)){
        errors[errors.length] = {field: 'password', message: 'Make password stronger!'};
        }
    }
    return errors.length ? errors : false;
}

export const validatePost = (chats) => {
    if(!chats || !chats.length){
        return {status: false, message: "Chats are required!"}
    }
    if(chats.length > 6){
        return {status: true, message: "Maximum 6 messages allowed! (unselect messages)"}
    }
    let string = ''
    chats.forEach((message) => {
        string += message.content
    })
    if(string.length > 501){
        return {status: false, message: "Maximum 500 characters allowed! (unselect messages)"}
    }
    return {status: true}
}