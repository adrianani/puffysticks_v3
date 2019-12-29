import $ from 'jquery';

const langReducer = (state = {}, action) => {
    switch (action.type) {
        case 'UPDATE_LANG':
            return $.extend(true, {}, state, action.lang);
        default:
            return state;
    }

};

export default langReducer;