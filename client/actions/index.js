// registers the socket - receives a socket object or null (to unregister it)
export const updateSocket = (socket) => {
    return {
        type : 'UPDATE_SOCKET',
        socket
    }
};

export const updateClient = (client) => {
    return {
        type : 'UPDATE_CLIENT',
        client
    }
};

export const updateLang = lang => {
    return {
        type : 'UPDATE_LANG',
        lang
    }
};

export const addError = (error) => {
    return {
        type : 'ADD_ERROR',
        error
    }
};

export const removeError = (id) => {
    return {
        type : 'REMOVE_ERROR',
        id
    }
};

export const addIrreversibleConfirmation = ({accept, reject}) => {
    return {
        type : 'ADD_IRREVERSIBLE_CONFIRMATION',
        accept, reject
    }
}

export const removeModalMessage = (id) => {
    return {
        type : 'REMOVE_MODAL_MESSAGE',
        id
    }
}