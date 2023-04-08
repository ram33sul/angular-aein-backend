export const exists = ({...values}) => {
    let errors = [];
    for(let value in values){
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
    const validValue = /^[A-Za-z0-9]*$/;
    return validValue.test(username) && username.length < 16 && username.length > 3;
    // username must exist
    // username must be aplhanumeric without spaces
    // username must have a length less than 16
}

export const validateMobile = (mobile) => {
    const validValue = /^[0-9]*$/;
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

export const validate = ({...values}) => {
    let errors = []
    if(values.name){
        if(!validateName(values.name)){
            errors[errors.length] = {field: 'name', message: 'Name is not valid!'};
        }
    }
    if(values.username){
        if(!validateUsername(values.username)){
            errors[errors.length] = {field: 'username', message: 'Username is not valid!'};
        }
    }
    if(values.email){
        if(!validateEmail(values.email)){
            errors[errors.length] = {field: 'email', message: 'Email is not valid!'};
        }
    }
    if(values.mobile){
        if(!validateMobile(values.mobile)){
            errors[errors.length] = {field: 'mobile', message: 'Mobile is not valid!'};
        }
    }
    if(values.password){
        if(!validatePassword(values.password)){
        errors[errors.length] = {field: 'password', message: 'Make password stronger!'};
        }
    }
    return errors.length ? errors : false;
}