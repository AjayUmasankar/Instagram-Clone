// change this when you integrate with the real API, or when u start using the dev server
const API_URL = 'http://127.0.0.1:5000'
const STATIC_API_URL = 'http://localhost:8080/data'

const getJSON = (path, options) => 
    fetch(path, options)
        .then(res => res.json())
        .catch(err => console.warn(`API_ERROR: ${err.message}`));

/**
 * This is a sample class API which you may base your code on.
 * You don't have to do this as a class.
 */
export default class API {

    /**
     * Defaults to teh API URL
     * @param {string} url 
     */
    constructor(url = API_URL, staticurl = STATIC_API_URL) {
        this.url = url;
        this.staticurl = staticurl;
    } 

    makeAPIRequest(path, options) {
        return getJSON(`${this.url}/${path}`, options);
    }

    /**
     * @returns feed array in json format
     */
    getDummyFeed(options) {
        return this.makeAPIRequest('dummy/user/feed', options);
    }

    getFeed(options) {
        return this.makeAPIRequest('user/feed', options);
    }




    makeStaticAPIRequest(path, options) {
        return getJSON(`${this.staticurl}/${path}`, options);
    }

    getStaticFeed() {
        return this.makeStaticAPIRequest('feed.json');
    }
}
