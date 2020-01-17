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

    static slugify = (string) => {
        const a = 'àáâäæãåāăąçćčđďèéêëēėęěğǵḧîïíīįìłḿñńǹňôöòóœøōõőṕŕřßśšşșťțûüùúūǘůűųẃẍÿýžźż·/_,:;'
        const b = 'aaaaaaaaaacccddeeeeeeeegghiiiiiilmnnnnoooooooooprrsssssttuuuuuuuuuwxyyzzz------'
        const p = new RegExp(a.split('').join('|'), 'g')

        return string.toString().toLowerCase()
            .replace(/\s+/g, '-') // Replace spaces with -
            .replace(p, c => b.charAt(a.indexOf(c))) // Replace special characters
            .replace(/&/g, '-and-') // Replace & with 'and'
            .replace(/[^\w\-]+/g, '') // Remove all non-word characters
            .replace(/\-\-+/g, '-') // Replace multiple - with single -
            .replace(/^-+/, '') // Trim - from start of text
            .replace(/-+$/, '') // Trim - from end of text
    }
}