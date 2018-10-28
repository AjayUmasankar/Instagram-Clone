/* returns an empty array of size max */
export const range = (max) => Array(max).fill(null);

/* returns a randomInteger */
export const randomInteger = (max = 1) => Math.floor(Math.random()*max);

/* returns a randomHexString */
const randomHex = () => randomInteger(256).toString(16);

/* returns a randomColor */
export const randomColor = () => '#'+range(3).map(randomHex).join('');

/**
 * You don't have to use this but it may or may not simplify element creation
 * 
 * @param {string}  tag     The HTML element desired
 * @param {any}     data    Any textContent, data associated with the element
 * @param {object}  options Any further HTML attributes specified
 */
export function createElement(tag, data, options = {}) {
    const el = document.createElement(tag);
    el.textContent = data;
   
    // Sets the attributes in the options object to the element
    return Object.entries(options).reduce(
        (element, [field, value]) => {
            element.setAttribute(field, value);
            return element;
        }, el);
}



// used for user pages, removes likeButton, deleteButton and comments
export function createViewPostTile(post) {
    var section = createElement('section', null, { class: 'post', id:post.id });


    // The post description text
    section.appendChild(createElement('p', post.meta.description_text, {class: 'post-desc'}));

    // The image itself
    section.appendChild(createElement('img', null, 
        { src: 'data:image/png;base64,'+post.src, alt: post.meta.description_text, class: 'post-image' }));


    // Like button
    section.appendChild(createElement('li', "Click to Like", {class: "nav-item likeButton", }));// follow icon
  
    // Number of likes/who liked this post
    const likeElement = createElement('p', `${post.meta.likes.length} likes`, {class: 'post-desc', style: 'display:none'});
    var list = createElement('div', null, {class:"list"});
    post.meta.likes.map(userID => list.appendChild(createElement('li', `${userID}`, {class:"userID"})));
    likeElement.appendChild(list);
    list.hidden = false;
    section.appendChild(likeElement);


    // How many comments the post has
    const commentElement = createElement('p', `${post.comments.length} comments`, {class: 'post-desc'})
    list = createElement('div', null, {class:"list"});
    post.comments.map(comment => {
        const author = comment.author;
        const published = comment.published;
        const authorComment = comment.comment;
        list.appendChild(createElement('li', `${author}: ${authorComment}`, {class:"comment"}));
    });
    commentElement.appendChild(list);
    list.hidden = false;
    section.appendChild(commentElement);

    // when it was posted
    const date = new Date(parseInt(post.meta.published)*1000);
    var curYear = date.getFullYear();
    var curMonth = date.getMonth();
    var curDate = date.getDate();
    var curHour = date.getHours();
    var curMinute = date.getMinutes();
    var curSecond = date.getSeconds();
    var reqTime = curDate;
    reqTime += "/" + curMonth;
    reqTime += "/" + curYear + " ";
    reqTime += curHour + ":";
    if (curMinute.toString().length == 1) {
        reqTime += "0" + curMinute + ":";
    } else {
        reqTime += curMinute + ":";
    }

    if (curSecond.toString().length == 1) {
        reqTime += "0" + curSecond;
    } else {
        reqTime += curSecond;
    }
    section.appendChild(createElement('p', reqTime, {class: 'post-desc'}));
    return section;

}

export function createStaticPostTile(post) {
     const section = createElement('section', null, { class: 'post' });
    // who the post was made by
    section.appendChild(createElement('h2', post.meta.author, { class: 'post-title' }));
    // description of post
    section.appendChild(createElement('p', post.meta.description_text, {class: 'post-desc'}));
    // The image itself
    section.appendChild(createElement('img', null, 
        { src: '/images/'+post.src, alt: post.meta.description_text, class: 'post-image' }));
    // How many likes it has (or none)
    section.appendChild(createElement('p', `${post.meta.likes.length} likes`, {class: 'post-desc'}));

    // How many comments the post has
    section.appendChild(createElement('p', `${post.meta.comments.length} comments`, {class: 'post-desc'}));
    // when it was posted
    section.appendChild(createElement('p', post.meta.published, {class: 'post-desc'}));
    return section
}

// Given an input element of type=file, grab the data uploaded for use
export function uploadImage(event) {
    const [ file ] = event.target.files;

    const validFileTypes = [ 'image/jpeg', 'image/png', 'image/jpg' ]
    const valid = validFileTypes.find(type => type === file.type);

    // bad data, let's walk away
    if (!valid)
        return false;
    
    // if we get here we have a valid image
    const reader = new FileReader();
    
    reader.onload = (e) => {
        // do something with the data result
        const dataURL = e.target.result;
        const image = createElement('img', null, { src: dataURL });
        document.body.appendChild(image);
    };

    // this returns a base64 image
    return reader.readAsDataURL(file);
}


/* 
    Reminder about localStorage
    window.localStorage.setItem('AUTH_KEY', someKey);
    window.localStorage.getItem('AUTH_KEY');
    localStorage.clear()
*/
export function checkStore(key) {
    if (window.localStorage)
        return window.localStorage.getItem(key)
    else
        return null

}