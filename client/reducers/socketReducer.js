const socketReducer = (state = {}, action) => {

    switch (action.type) {
        case 'UPDATE_SOCKET':
            return action.socket;
        default:
            return state;
    }

};

export default socketReducer;