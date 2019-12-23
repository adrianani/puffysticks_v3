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