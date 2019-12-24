import store from '../store';

export default class Client {

    constructor() {
        this.socket = store.getState().socket;
        this.name = ``;
        this.id = null;

        this.update = () => {
            store.dispatch({type : 'UPDATE_CLIENT', client : this});
        }

        this.update();
    }

    refresh = () => {
        if (this.id === null) return;

        this.socket.emit(`get user info`, {userId : this.id}, ({success, res}) => {
           if (!success) {
               console.log(`failed to get user info for user id : ${this.id}`);
               return;
           }

           this.name = res.user.name;

           this.update();
        });
    }

    init = () => {
        this.id = localStorage.userId || null;
        this.hash = localStorage.userHash || null;

        if (this.id === null && this.hash === null) return;

        let data = {
            userId : this.id,
            userHash : this.hash
        };

        this.socket.emit(`register socket`, data, ({success}) => {
           if (!success) {
               this.logout();
               return;
           }

           this.refresh();
        });
    }

    login = ({userId, userHash}, cb = () => {}) => {
        localStorage.setItem(`userId`, userId);
        localStorage.setItem(`userHash`, userHash);

        this.init();

        cb();
    }

    logout = () => {
        localStorage.removeItem('userId');
        localStorage.removeItem('userHash');

        window.location.replace(`/`);
    }

    isLogged = () => {
        return (this.id !== null);
    }

}