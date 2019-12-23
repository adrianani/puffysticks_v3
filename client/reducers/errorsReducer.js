import uuid from 'uuid';

const errorsReducer = (state = [], action) => {
    switch (action.type) {
        case 'ADD_ERROR':
            if (!action.error) return state;
            let errors = !Array.isArray(action.error) ? [action.error] : action.error;
            return [
                ...state,
                ...(errors.map((err) => {
                    return {
                        id : uuid.v1(),
                        ...err
                    }
                }))
            ];
        case 'REMOVE_ERROR':
            let errIndex = state.findIndex(e => e.id === action.id);
            if (errIndex < 0) return state;
            state.splice(errIndex, 1);
            return [...state];
        default : return state;
    }
}

export default errorsReducer;