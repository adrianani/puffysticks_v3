import store from '../store';

export default class Lang {

    constructor() {
        this.socket = store.getState().socket;
        this.langId = localStorage.getItem("langId") || undefined;
        this.dictionary = {};

        this.update = () => {
            store.dispatch({type : 'UPDATE_LANG', lang : this});
        }

        this.update();
    }

    init = () => {
        this.socket.emit(`get dictionary`, {langId : this.langId}, ({res}) => {
            console.log({res});
            this.dictionary = res;
            this.update();
        });
    }

    getWord = key => {
        if (this.dictionary[key] !== undefined) return this.dictionary[[key]];

        // this.socket.emit(`get lang words`,
        //     {keys : [key], langid : this.langId},
        //     ({success, res, errors}) => {
        //         if (success) {
        //             this.dictionary[key] = res[key];
        //             this.update();
        //         }
        //     }
        //     );

        return key.toUpperCase();
    }

}