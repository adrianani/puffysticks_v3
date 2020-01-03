import store from "../store";

export default class Util {
    static formatDate = (date, showTime = false) => {
        let d = new Date(date);
        let options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hourCycle : 'h24' };
        if (showTime) {
            options.hour = `2-digit`;
            options.minute = `2-digit`;
            options.second = `2-digit`;
        }
        return d.toLocaleDateString(
            store.getState().lang.getWord("js_locale"),
            options
            );
    }

    static getArticleImage = (imageObject, type = "") => {
        if (type !== "") type = `_${type}`
        return `imgs${imageObject.processed ? `` : `/temp`}/${imageObject._id}${type}${imageObject.ext}`;
    }
}