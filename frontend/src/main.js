// importing named exports we use brackets
import { createPostTile, createStaticPostTile, uploadImage, createElement } from './helpers.js';

// when importing 'default' exports, use below syntax
import API from './api.js';

const api  = new API();


// Username is registered with password password
// greg username, greg password
// Username follows greg



function homePage() {
	// we can use this single api request multiple times
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



	// Creating LOGIN/REGISTER text boxes and icons
	// username text box
	const header = document.getElementsByClassName("banner")[0];
	var username = document.createElement("INPUT");
	username.setAttribute("type", "text");
	username.setAttribute("value", "Username");
	username.setAttribute("id", "username");
	header.appendChild(username);

	// password text box
	var password = document.createElement("INPUT");
	password.setAttribute("type", "text");
	password.setAttribute("value", "password");
	password.setAttribute("id", "password");
	header.appendChild(password);


	// login icon
	var loginIcon = document.createElement("li");
	loginIcon.innerText = "Login";
	loginIcon.classList.toggle('nav-item');
	loginIcon.setAttribute("id", "loginIcon");
	header.appendChild(loginIcon);

	// new line
	header.appendChild(document.createElement("br"));

	// name text box
	var name = document.createElement("INPUT");
	name.setAttribute("type", "text");
	name.setAttribute("value", "name");
	name.setAttribute("id", "name");
	header.appendChild(name);

	// email text box
	var email = document.createElement("INPUT");
	email.setAttribute("type", "text");
	email.setAttribute("value", "email");
	email.setAttribute("id", "email");
	header.appendChild(email);



	// signup icon
	var registerIcon = document.createElement("li");
	registerIcon.innerText = "Register";
	registerIcon.classList.toggle('nav-item');
	registerIcon.setAttribute("id", "registerIcon");
	header.appendChild(registerIcon);



	// post icon
	var postIcon = document.getElementsByClassName("nav-item")[1];
	postIcon.innerText = "Post";

	// Adding functions to login/signup
	loginIcon.addEventListener('click', function() {login()});
	registerIcon.addEventListener('click', function() {signup()});

	postIcon.addEventListener('click', function() {getImage()});

	// removing 'flex' attribute temporarily for header
	header.style.display = 'table-cell';

	// Testing out posting on current user
	const input = document.querySelector('input[type="file"]');
	//input.addEventListener('change', uploadImage);
};



// Posts the uploaded image, after getImage is successful
async function postImage(base64) {
	const user = document.getElementById('username').value;
	const token = localStorage.getItem("token");
	const description = "not yet implemented";
	const base64nometa = base64.substring(22, base64.length);
	console.log(base64nometa);
	const body = { "description_text": `${description}`, "src": `${base64nometa}` };
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
	console.log(postResult);
}

// Gets an uploaded image if there is one, else returns false
async function getImage() {
	const files = document.getElementsByTagName("input")[0].files;
	if (files.length < 1) {
		console.log("No files");
		return false;
	}
	const file = files[0];
    const validFileTypes = [ 'image/jpeg', 'image/png', 'image/jpg' ]
    const valid = validFileTypes.find(type => type === file.type);
    // bad data, let's walk away
    if (!valid)  {
    	console.log("Not jpeg, png, or jpg");
        return false;
    }

    const reader = new FileReader();
    reader.onload = function() {
        postImage(reader.result);
    };
    reader.readAsDataURL(file);

}



async function follow() {
	const user = document.getElementById('username').value;
	const token = localStorage.getItem("token");
	console.log(token);


	const options = {
						method: "PUT",
						headers: {'Authorization': `Token ${token}`},
					}
	const followResult = await api.makeAPIRequest(`user/follow?username=${user}`, options);
	window.alert(followResult.message);
 
}

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
	console.log(signupResult);
	window.alert(signupResult.message);
}

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
		console.log(user, "is registered with password", password);
		const largefeed = document.getElementById('large-feed');
		largefeed.innerHTML = "";
		localStorage.setItem("token", loginResult.token);
		
		// This if statement is only activated on the first login since we remove 
		// the name email and registerIcon fields
		var name = document.getElementById("name");
		var email = document.getElementById("email");
		var registerIcon = document.getElementById("registerIcon");
		if (name && email && registerIcon) {
		

			// adding follow icon and 
			const username = document.getElementById('username');
			var followIcon = document.createElement("li");
			followIcon.innerText = "Follow";
			followIcon.classList.toggle('nav-item');
			header.insertBefore(followIcon, username.nextSibling);
			followIcon.addEventListener('click', function() {follow()});
			

			// add a user profile button (to the right of the login icon)
			const loginIcon = document.getElementById('loginIcon');
			var profileIcon = document.createElement("div");
			profileIcon.innerText = "Profile";
			profileIcon.classList.toggle('nav-item');
			profileIcon.setAttribute("id", "profileIcon");
			profileIcon.style.float = "right";
			header.insertBefore(profileIcon, loginIcon.nextSibling);
			profileIcon.addEventListener('click', function() {userProfile()})

			// removing name, email and register fields
			header.removeChild(name);
			header.removeChild(email);
			header.removeChild(registerIcon);
		}
	} else {
		window.alert(loginResult.message);
		return false;
	}

	// Create current user feed
	getFeed()
	.then(posts => {
		// add posts with likes/comments/time published/like button;
		const postsArray = posts.posts;
		console.log(postsArray);
	    postsArray.reduce((parent, post) => {
	        parent.appendChild(createPostTile(post));
	        return parent;
	    }, document.getElementById('large-feed'))
	})
	.then(function() {
		// add event listeners to like buttons
		const likeButtons = document.getElementsByClassName('likeButton');
		for (var i = 0; i < likeButtons.length; i++) {
			likeButtons[i].addEventListener('click', likePost);
		}

		// add event listeners to show each individual who liked the post
		const expandLikeButtons = document.getElementsByClassName('expandLikes');
		for (var i = 0; i < expandLikeButtons.length; i++) {
			expandLikeButtons[i].addEventListener('click', toggleList);
		}

		// add event listeners to comment buttons
		const expandCommentButtons = document.getElementsByClassName('expandComments');
		for (var i = 0; i < expandCommentButtons.length; i++) {
			expandCommentButtons[i].addEventListener('click', toggleList);
		}

		// add event listeners to show each individual that commented on the post
		const commentButtons = document.getElementsByClassName('commentButton');
		for (var i = 0; i < commentButtons.length; i++) {
			commentButtons[i].addEventListener('keypress', function (e) {
			    var key = e.which || e.keyCode;
			    if (key === 13) { // 13 is enter
			      	commentPost(e);
			    }
			})
		}

	});
}

async function userProfile() {
	const currentUser = await getCurrentUser();
	console.log(currentUser);	
	const largeFeed = document.getElementById('large-feed');
	largeFeed.innerHTML = "";

	section = createElement('section', null, { class: 'post' });
    section.appendChild(createElement('h2', currentUser.username, { class: 'post-title' }));
    section.appendChild(createElement('p', currentUser.id, {class: 'post-desc'}));

    // users that we follow
    const followingElement = createElement('p', `${currentUser.following.length} following`, {class: 'post-desc'});
    const expandFollowing = createElement('i', "expand_more", {class:"material-icons expandLikes"});
    const followingList = createElement('div', null, {id:"followingList"});
    currentUser.following.map(userID => followingList.appendChild(createElement('li', `${userID}`, {class:"userID"})));
    followingElement.appendChild(expandFollowing);
    followingElement.appendChild(followingList);
    followingList.hidden = false;
    section.appendChild(followingElement);

}

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
	return currentUser;
}

async function commentPost(event) {
	const parentNode = event.target.parentNode;
	const id = parentNode.id;
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
	const commentList = parentNode.getElementsByClassName('commentList')[0];
	commentList.appendChild(createElement('li', `${username}: ${comment}`, {class:"comment"}));

	window.alert(`Comment status: ${commentResult.message}`);
}


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



function likePost(event) {
	//console.log(event);
	//console.log(event.target);
	//console.log(event.target.parentNode);
	//console.log(event.target.parentNode.id);
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
	const likeResult = api.makeAPIRequest(`post/like?id=${id}`, options);
}


// Gets current user's feed
async function getFeed() {
	const token = localStorage.getItem("token");
	const options = {
						method: "GET",
						headers: 
								{
									'Authorization': `Token ${token}`, 
									"Content-Type": "application/json"
								},
					}
	const feedResult = await api.makeAPIRequest("user/feed", options);
	return feedResult;
}

homePage();