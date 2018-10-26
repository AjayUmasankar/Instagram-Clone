// importing named exports we use brackets
import { createPostTile, createStaticPostTile, createViewPostTile, uploadImage, createElement } from './helpers.js';

// when importing 'default' exports, use below syntax
import API from './api.js';

const api  = new API();


// Username is registered with password password
// greg username, greg password
// Username follows greg


// Constructs home page
function homePage() {
	const header = document.getElementsByClassName("banner")[0];
	// removing 'flex' attribute for header and making it a table-cell
	header.style.display = 'table-cell';

	const largeFeed = document.getElementById('large-feed');
	largeFeed.innerHTML = "";
	// creating a basic static feed as an example 
	const staticFeed = api.getStaticFeed();
	staticFeed
	.then(posts => {
	    posts.reduce((parent, post) => {

	        parent.appendChild(createStaticPostTile(post));
	        
	        return parent;

	    }, largeFeed)
	});


	// username text box
	const username = createElement('INPUT', "", {type: 'text', id: 'username', value: 'Username'});
	header.appendChild(username);
	// password text box
	const password = createElement('INPUT', "", {type: 'text', id: 'password', value: 'password'});
	header.appendChild(password);
	// login icon
	const loginIcon = createElement('li', "Login", {id: 'loginIcon', class: 'nav-item'});
	header.appendChild(loginIcon);
	// new line
	header.appendChild(document.createElement("br"));
	// name text box
	const name = createElement('INPUT', "", {type: 'text', id: 'name', value: 'name'});
	header.appendChild(name);
	// email text box
	const email = createElement('INPUT', "", {type: 'text', id: 'email', value: 'email'});
	header.appendChild(email);
	// signup icon
	const registerIcon = createElement('li', "Register", {id: 'registerIcon', class: 'nav-item'});
	header.appendChild(registerIcon);
	// post icon
	var postIcon = document.getElementsByClassName("nav-item")[1];
	postIcon.innerText = "Post";

	// Adding functions to login/signup
	loginIcon.addEventListener('click', function() {login()});
	registerIcon.addEventListener('click', function() {signup()});
	postIcon.addEventListener('click', function() {getImage()});

	// reading in a file
	const input = document.querySelector('input[type="file"]');
	input.addEventListener('change', uploadImage);
};


// Creates the user profile page (only available when logged in)
async function userProfile() {
	const currentUser = await getCurrentUser();
	console.log(currentUser);	
	const largeFeed = document.getElementById('large-feed');
	largeFeed.innerHTML = "";

	// Username as title, userid, username, email, followers as description
	const section = createElement('section', null, { class: 'post' });
    section.appendChild(createElement('h2', currentUser.username, { class: 'post-title' }));
    section.appendChild(createElement('p', `Your id: ${currentUser.id}`, {class: 'post-desc'}));
    section.appendChild(createElement('p', `Your email: ${currentUser.email}`, {class: 'post-desc'}));
    section.appendChild(createElement('p', `Your name: ${currentUser.name}`, {class: 'post-desc'}));
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
    console.log(posts);
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



    largeFeed.appendChild(section);
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
	window.alert(followResult.message);
 
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
	console.log(signupResult);
	if (signupResult.hasOwnProperty("token")) {
		window.alert(`Signup successful`);
	} else {
		window.alert(signupResult.message);
	}
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
			// adding follow icon 
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
		const listButtons = document.getElementsByClassName('toggleList');
		for (var i = 0; i < listButtons.length; i++) {
			listButtons[i].addEventListener('click', toggleList);
		}

		// add event listeners to show each individual that commented on the post
		const commentBoxes = document.getElementsByClassName('commentBox');
		for (var i = 0; i < commentBoxes.length; i++) {
			commentBoxes[i].addEventListener('keypress', function (e) {
			    var key = e.which || e.keyCode;
			    if (key === 13) { // 13 is enter
			      	commentPost(e);
			    }
			})
		}

	});
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

	window.alert(`Comment status: ${commentResult.message}`);
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
function likePost(event) {
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
	return currentUser;
}

homePage();


 //    var promises = [];

	// for(i=0;i<5;i+){
	//     promises.push(doSomeAsyncStuff());
	// }

	// Promise.all(promises)
 //    .then(() => {
 //        for(i=0;i<5;i++){
 //            doSomeStuffOnlyWhenTheAsyncStuffIsFinish();    
 //        }
 //    })
 //    .catch((e) => {
 //        // handle errors here
 //    });