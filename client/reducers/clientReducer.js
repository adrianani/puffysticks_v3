import $ from 'jquery';

const clientReducer = (state = {}, action) => {
    switch (action.type) {
        case 'UPDATE_CLIENT':
            return $.extend(true, {}, state, action.client);
        default:
            return state;
    }

};

export default clientReducer;