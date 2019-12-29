import uuid from 'uuid';

const modalMessagesReducer = (state = [], action) => {
    switch (action.type) {
        case 'ADD_IRREVERSIBLE_CONFIRMATION':
            return [...state, {id : uuid.v1(), type : 'irreversible_confirmation', accept : action.accept, reject : action.reject}];
        case 'REMOVE_MODAL_MESSAGE':
            let i = state.findIndex(e => e.id === action.id);
            if (i < 0) return state;
            state.splice(i, 1);
            return [...state];
        default : return state;
    }
}

export default modalMessagesReducer;