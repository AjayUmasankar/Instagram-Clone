// importing named exports we use brackets
import { createPostTile, createStaticPostTile, createViewPostTile, uploadImage, createElement } from './helpers.js';


// talk about live comments, infinite scroll, user pages/profiles, url fragmentation
// rock rock, food food, username password


// when importing 'default' exports, use below syntax
import API from './api.js';

const api  = new API();


var fed = 0;
const largefeed = document.getElementById('large-feed');
const header = document.getElementsByClassName("banner")[0];
header.style.display = 'table-cell';

// creates a file uploader element and adds a post button
const nav_item = document.getElementsByClassName('nav-item')[0];
const fileInput = createElement('input', "", {type: 'file', id: 'fileInput'});
nav_item.appendChild(fileInput);
var postButton = document.getElementsByClassName("nav-item")[1];
postButton.innerText = "Post";
postButton.addEventListener('click', function() {getImage()});


// username text box
const username = createElement('INPUT', "", {type: 'text', id: 'username', value: 'username'});
header.appendChild(username);
// follow button (hidden until login)
const followButton = createElement('button', "Follow", {id: 'followButton', class: 'nav-item', style: 'display:none'});
header.appendChild(followButton);
// password text box
const password = createElement('INPUT', "", {type: 'text', id: 'password', value: 'password'});
header.appendChild(password);
// login icon
const loginButton = createElement('button', "Login", {id: 'loginButton', class: 'nav-item'});
header.appendChild(loginButton);
// feed button (hidden until login)
const feedButton = createElement('button', "Feed", {id: 'feedButton', class: 'nav-item', style: 'float:right; visibility:hidden'});
header.appendChild(feedButton);
// user profile button (hidden until login)
const profileButton = createElement('button', "Profile", {id: 'profileButton', class: 'nav-item', style: 'float:right; visibility:hidden'});
header.appendChild(profileButton);
// new line
header.appendChild(document.createElement("br"));
// name text box
const name = createElement('INPUT', "", {type: 'text', id: 'name', value: 'name'});
header.appendChild(name);
// email text box
const email = createElement('INPUT', "", {type: 'text', id: 'email', value: 'email'});
header.appendChild(email);
// signup icon
const registerButton = createElement('button', "Register", {id: 'registerButton', class: 'nav-item'});
header.appendChild(registerButton);
// update profile icon
const updateButton = createElement('button', "Update Info", {id: 'updateButton', class: 'nav-item', style: 'float:right; visibility:hidden'});
header.appendChild(updateButton);

// add event listeners for profile feed and follow buttons
feedButton.addEventListener('click', function() {createUserFeed()});
profileButton.addEventListener('click', async function() {createUserProfile(await getCurrentUser())})
followButton.addEventListener('click', function() {follow()});
updateButton.addEventListener('click', function() {updateUser()})
// Adding event listeners to login/signup
loginButton.addEventListener('click', function() {login()});
registerButton.addEventListener('click', function() {signup()});
startingPage();

// Creates a static feed from subset0 data if no valid localstorage token
// else creates a page with requested info depending on URL
async function startingPage() {
	const currentUser = await getCurrentUser();
	const fragment = window.location.hash;

	if (fragment == "") {
		// create a basic static feed
		const largeFeed = document.getElementById('large-feed');
		largeFeed.innerHTML = "";
		const staticFeed = api.getStaticFeed();
		staticFeed
		.then(posts => {
		    posts.reduce((parent, post) => {
		        parent.appendChild(createStaticPostTile(post));
		        return parent;
		    }, largeFeed)
		});
		return;
	} 

	// previous token used to login user
	if (fragment == "#profile=me") {
		loginSetup();
		createUserProfile(await getCurrentUser());
	} else if (fragment == "#feed") {
		loginSetup();
		createUserFeed();
	} else if (fragment.startsWith("#profile=")) {
		const targetUser = fragment.substring(9);
		createUserPage(targetUser);
	}
}


// Fetches the post with id id
async function getPost(id) {
	const token = localStorage.getItem("token");
	const options = {
						method: "GET",
						headers: 
								{
									'Authorization': `Token ${token}`, 
									"Content-Type": "application/json"
								},
					}
	const getPostResult = await api.makeAPIRequest(`post/?id=${id}`, options);
	if (!getPostResult.hasOwnProperty("id")) {
		window.alert(`get post failed`);
	} else {
		//window.alert(` has been liked`);
	}
	return getPostResult;
}



// Creates the user profile page 
async function createUserProfile(currentUser) {
	document.removeEventListener("scroll", delayGetNextPost); // stops infinite scroll
	//const currentUser = await getCurrentUser();
	console.log(currentUser);
	const largeFeed = document.getElementById('large-feed');
	largeFeed.innerHTML = "";

	// Username as title, userid, username, email, followers as description
	const section = createElement('section', null, { class: 'post' });
	largeFeed.appendChild(section);
    section.appendChild(createElement('h2', currentUser.username, { class: 'post-title' }));
    section.appendChild(createElement('p', `Id: ${currentUser.id}`, {class: 'post-desc'}));
    section.appendChild(createElement('p', `Email: ${currentUser.email}`, {class: 'post-desc'}));
    section.appendChild(createElement('p', `Name: ${currentUser.name}`, {class: 'post-desc'}));
    section.appendChild(createElement('p', `Followers: ${currentUser.followed_num}`, {class: 'post-desc'}));

    // users that we follow as description
    const followingElement = createElement('p', `${currentUser.following.length} following`, {class: 'post-desc'});
    const expandFollowing = createElement('i', "expand_more", {class:"material-icons toggleList"});
    const followingList = createElement('div', null, {id:"list"});
    currentUser.following.map(userID => followingList.appendChild(createElement('li', `${userID}`, {class:"userID"})));
    followingElement.appendChild(expandFollowing);
    followingElement.appendChild(followingList);
    followingList.hidden = false;
    section.appendChild(followingElement);

    // using list of user posts, get total no. of likes and comments.
    const posts = await getPosts(currentUser.posts);
    const likes = posts.map(post => post.meta.likes.length)
    	 .reduce((acc, likes) => {
    	 	acc += likes;
    	 	return acc;
    	 }, 0)

    const comments = posts.map(post => post.comments.length)
    	 .reduce((acc, comments) => {
    	 	acc += comments;
    	 	return acc;
    	 }, 0)

   	section.appendChild(createElement('p', `Total Likes: ${likes}`, {class: 'post-desc'}));
    section.appendChild(createElement('p', `Total Comments: ${comments}`, {class: 'post-desc'}));

    //  most liked post
   	if (posts.length > 0) {
   		const mostLiked = posts.reduce((previous, current) => {
	   		if (current.meta.likes.length > previous.meta.likes.length) {
	   			return current;
	   		} else {
	   			return previous;
	   		}
   		});
	   	section.appendChild(createElement('p', `Most liked post id: ${mostLiked.id} with ${mostLiked.meta.likes.length} likes`, {class: 'post-desc'}));
	    section.appendChild(createElement('p', `Post is shown below:`, {class:'post-desc'}));
	    section.appendChild(createViewPostTile(mostLiked));
   	}

}

// Gets the current user's feed (via local storage auth token)
async function createUserFeed() {
	const header = document.getElementsByClassName("banner")[0];
	const username = document.getElementById('username');
	const largefeed = document.getElementById('large-feed');
	largefeed.innerHTML = "";
	fed = 0; // How many posts have been fed already, to keep track of infinite scroll

	// // CAN ACTIVATE THIS IF WE WANT TO REMOVE REGISTER FIELDS 
	// // This if statement is only activated on the first login since we remove 
	// // the name email and registerButton fields
	// var name = document.getElementById("name");
	// var email = document.getElementById("email");
	// var registerButton = document.getElementById("registerButton");
	// if (name && email && registerButton) {
	// 	// removing name, email and register fields
	// 	header.removeChild(name);
	// 	header.removeChild(email);
	// 	header.removeChild(registerButton);
	// }

	// Create current user feed
	document.addEventListener("scroll", delayGetNextPost);
	await getNextPost();
}

// Creates the user page (basically a user profile + the user's posts)
async function createUserPage(user) {
	//console.log(user);
	console.log(user);
	const userDetails = await getUserByName(user);
	createUserProfile(userDetails);
	const posts = userDetails.posts;
	for (var i = posts.length-1; i >= 0 ; i--) {
		const post = await getPost(posts[i]);
		const postElement = createPostTile(post);
		addPostEventListeners(postElement);
		largefeed.appendChild(postElement);
	}
}

// This gets rid of spam inputs when you scroll and effectively triggers getNextPost()
// only once when nearing the end of the page.
var timer;
function delayGetNextPost() {
	if (timer) {
		clearTimeout(timer);
	}
	timer = setTimeout(getNextPost, 100);
}

async function getNextPost() {
    var lastDiv = document.getElementsByTagName("footer")[0];
    var lastDivOffset = lastDiv.offsetTop + lastDiv.clientHeight;
    var pageOffset = window.pageYOffset + window.innerHeight;

    if (pageOffset > lastDivOffset - 20) {
    	await getCurrentFeed().then(feed => feed.posts)
    	.then(posts => posts[0])
    	.then(post => {
    		const postElement = createPostTile(post);
    		largefeed.appendChild(postElement);
    		addPostEventListeners(postElement);
  
    	});
        // var newDiv = document.createElement("div");
        // newDiv.innerHTML = "my awesome new div";
        // lastDiv.appendChild(newDiv);
        setTimeout(getNextPost, 100);
    }
};

function addPostEventListeners(postElement){
	// add event listeners to like buttons
	const likeButton = postElement.getElementsByClassName('likeButton')[0];
	likeButton.addEventListener('click', likePost);

	// add event listeners to toggle show comments/likes
	const listButtons = postElement.getElementsByClassName('toggleList');
	for (var i = 0; i < listButtons.length; i++) {
		listButtons[i].addEventListener('click', toggleList);
	}

	// add event listeners to allow comments to be made
	const commentBox = postElement.getElementsByClassName('commentBox')[0];
	commentBox.addEventListener('keypress', function (e) {
	    var key = e.which || e.keyCode;
	    if (key === 13) { // 13 is enter
	      	commentPost(e);
	    }
	});

	const title = postElement.getElementsByClassName('post-title')[0]
	const poster = title.textContent;
	title.addEventListener('click', function() {getUserPage()});
}

function getUserPage() {
	//console.log(event.target);
	const postElement = event.target
	createUserPage(postElement.innerText);	//textcontent is the username of the poster
}





// Updates current user's details with contents of name, password and email text boxes
async function updateUser() {
	const token = localStorage.getItem("token");
	var body = { "email": email.value, "name": name.value, "password": password.value };
	var options =   {
					    headers: 
							{
								'Authorization': `Token ${token}`, 
								"Content-Type": "application/json"
							},
					    method: "PUT",
					    body: JSON.stringify(body),
					}

	const updateResult = await api.makeAPIRequest("user", options);
	console.log(updateResult);
	if (updateResult.msg == "success") {
		window.alert(`User details updated`);
	} else {
		window.alert(updateResult.msg);
	}
}


// adds functions that are only available to a logged in user (either via local stored 
// token or manually clicking login)
async function loginSetup() {
	// note: can either set style.display value or style.visibility
	// style.display makes the hidden element take up no space
	loginButton.style.display = 'none';
	followButton.style = '';
	feedButton.style.visibility = 'visible';
	profileButton.style.visibility = 'visible';
	updateButton.style.visibility = 'visible';
}

// Uses the username and password fields to attempt to login
async function login() {
	const password = document.getElementById('password').value;
	const user = document.getElementById('username').value;
	const header = document.getElementsByClassName("banner")[0];

	var body = { "username": user, "password": password};
	var options = 	{
							headers: { "Content-Type": "application/json" },
						    method: "POST",
						    body: JSON.stringify(body),
					}
	const loginResult = await api.makeAPIRequest("auth/login", options);
	


	if (loginResult.hasOwnProperty("token")) {
		// login successful, got token back
		localStorage.setItem("token", loginResult.token);
		// currently, a successful login means that you go straight to ur feed
		loginSetup();
		createUserFeed();
		console.log(`Logged in as ${user}`);
	} else {
		window.alert(loginResult.message);
		return false;
	}
}





// given a list of post ids, gives back an array of posts with their info
async function getPosts(postIds) {
	var posts = [];
	const token = localStorage.getItem("token");
	for (var i = 0; i < postIds.length; i++) {
		const options = {
						method: "GET",
						headers: 
								{
									'Authorization': `Token ${token}`, 
									"Content-Type": "application/json"
								},
					}

		const postResult = await api.makeAPIRequest(`post/?id=${postIds[i]}`, options);
		posts.push(postResult);
	}
	return posts;
}


// Posts the uploaded image, after getImage is successful
async function postImage(base64) {
	const user = document.getElementById('username').value;
	const token = localStorage.getItem("token");
	const description = "not yet implemented";
	const body = { "description_text": `${description}`, "src": `${base64}` };
	const options = {
						method: "POST",
						headers: 
								{
									'Authorization': `Token ${token}`, 
									"Content-Type": "application/json"
								},
						body: JSON.stringify(body),
					}

	const postResult = await api.makeAPIRequest("post", options);
	if (postResult.hasOwnProperty('post_id')) {
		window.alert(`Successfully posted`);
	} else {
		window.alert(`Failed to post`);
	}
	console.log(postResult);
}

// Gets an uploaded image if there is one, else returns false
async function getImage() {
	const files = document.getElementById("fileInput").files;
	console.log(files);
	if (files.length < 1) {
		console.log("No files");
		return false;
	}
	const file = files[0];
    const validFileTypes = [ 'image/jpeg', 'image/png', 'image/jpg' ]
    const valid = validFileTypes.find(type => type === file.type);
    console.log(valid);
    // bad data, let's walk away
    if (!valid)  {
    	console.log("Not jpeg, png, or jpg");
        return false;
    }

    const reader = new FileReader();
    reader.onload = function() {
    	const base64 = reader.result;
    	const base64nometa = base64.substring(valid.length+13);
    	console.log(base64);
		console.log(base64nometa);
        postImage(base64nometa);
    };
    reader.readAsDataURL(file);

}


// Follows the user specified in the Username textbox (follow button only available on login)
async function follow() {
	const user = document.getElementById('username').value;
	const token = localStorage.getItem("token");
	console.log(token);


	const options = {
						method: "PUT",
						headers: {'Authorization': `Token ${token}`},
					}
	const followResult = await api.makeAPIRequest(`user/follow?username=${user}`, options);
	if (followResult.message != "success") {
		window.alert(followResult.message);
	} else {
		window.alert(`${user} has been followed`);
	}
	// window.alert(followResult.message);
 
}

// Uses the four text box fields to create a new user (not available after logging in)
async function signup() {
	const user = document.getElementById('username').value;
	const name = document.getElementById('name').value;
	const password = document.getElementById('password').value;
	const email = document.getElementById('email').value;

	var body = { "username": user, "password": password, "email": email, "name": name};
	var options =   {
					    headers: { "Content-Type": 'application/json' },
					    method: "POST",
					    body: JSON.stringify(body),
					}

	const signupResult = await api.makeAPIRequest("auth/signup", options);
	//console.log(signupResult);
	if (signupResult.hasOwnProperty("token")) {
		window.alert(`Signup successful`);
	} else {
		window.alert(signupResult.message);
	}
}




// Pressing enter on a commentbox comments on that post as the logged in user 
// (only available when logged in)
async function commentPost(event) {
	const commentNode = event.target.parentNode;	// contains comment box, comment list, arrow icon
	const id = commentNode.parentNode.id;			// id of the post
	const comment = event.target.value;
	const token = localStorage.getItem("token");
	const published = new Date();

	// i think that whatever author name you put in here, it doesnt matter, as the backend uses the 
	// authorization token to deduce the user's username and uses that as author
	const author = await getCurrentUser().name;
	const body = { "author": `${author}`, "published": `${published}`, "comment": `${comment}` };
	const options = {
						method: "PUT",
						headers: 
								{
									'Authorization': `Token ${token}`, 
									"Content-Type": "application/json"
								},
						body: JSON.stringify(body),
					}

	const currentUser = await getCurrentUser(); 
	const username = currentUser.username;
	const commentResult = await api.makeAPIRequest(`post/comment?id=${id}`, options);
	const commentList = commentNode.getElementsByClassName('list')[0];
	commentList.appendChild(createElement('li', `${username}: ${comment}`, {class:"comment"}));

	window.alert(`Comment ${commentResult.message}`);
}

// Clicking on the arrow next to lists will toggle the hidden status of the list and 
// change icon of the arrow
function toggleList(event) {
	const parentNode = event.target.parentNode;
	const commentList = parentNode.getElementsByClassName('list')[0];
	if (commentList.hidden == true) {
		event.target.innerText = "expand_less";
		commentList.hidden = false;
	} else {
		event.target.innerText = "expand_more";
		commentList.hidden = true;
	}
}


// Likes the post as the logged in user (only available when logged in)
async function likePost(event) {
	const token = localStorage.getItem("token");
	const id = event.target.parentNode.id;
	const options = {
						method: "PUT",
						headers: 
								{
									'Authorization': `Token ${token}`, 
									"Content-Type": "application/json"
								},
					}
	const likeResult = await api.makeAPIRequest(`post/like?id=${id}`, options);
	if (likeResult.message != "success") {
		window.alert(likeResult.message);
	} else {
		window.alert(`Post has been liked`);
	}
}


// Gets user details by passing in user's name
async function getUserByName(username) {
	const token = localStorage.getItem("token");
	const options = {
						method: "GET",
						headers: 
								{
									'Authorization': `Token ${token}`,
									"Content-Type": "application/json"
								},
					}
	const user = await api.makeAPIRequest(`user/?username=${username}`, options);
	return user;
}

// Gets current user details
async function getCurrentUser() {
	const token = localStorage.getItem("token");
	const options = {
						method: "GET",
						headers: 
								{
									'Authorization': `Token ${token}`, 
									"Content-Type": "application/json"
								},
					}
	const currentUser = await api.makeAPIRequest("user", options);
	//const currentUser = getUser(token, "", "");
	return currentUser;
}


// Gets current user's feed
async function getCurrentFeed() {
	const token = localStorage.getItem("token");
	const options = {
						method: "GET",
						headers: 
								{
									'Authorization': `Token ${token}`, 
									"Content-Type": "application/json"
								},
					}
	const feedResult = await api.makeAPIRequest(`user/feed?p=${fed}&n=1`, options);
	fed += 1;
	return feedResult;
}


//const postButton = createElement<li class="nav-item"><input type="file"/></li>
//const fileInput = createElement('input', "", {type: 'file', id: 'fileInput', class: "nav-item"});
// const postButton = createElement('button', "Post", {type: 'file', id: 'postButton', class: "nav-item"});
// nav.appendChild(postButton);
//const description = createElement('INPUT', "", {type: 'text', id: 'description', value: 'description'});
// const input = document.querySelector('input[type="file"]');
// header.insertBefore(description, postButton.nextSibling);