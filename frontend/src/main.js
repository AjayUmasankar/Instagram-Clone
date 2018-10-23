// importing named exports we use brackets
import { createPostTile, uploadImage } from './helpers.js';

// when importing 'default' exports, use below syntax
import API from './api.js';

const api  = new API();


// Username is registered with password password
// greg username, greg password
// Username follows greg



(async function() {
	// we can use this single api request multiple times
	const staticFeed = api.getStaticFeed();
	staticFeed
	.then(posts => {
	    posts.reduce((parent, post) => {

	        parent.appendChild(createPostTile(post));
	        
	        return parent;

	    }, document.getElementById('large-feed'))
	});

	// const getDummyFeed = api.getDummyFeed(			
	// 						{
	// 						    headers: { "Content-Type": 'application/json' },
	// 						    method: "GET",
	// 						})
	// 					.then(data => console.log(data));


	// Potential example to upload an image
	const input = document.querySelector('input[type="file"]');

	input.addEventListener('change', uploadImage);


	// Creating LOGIN/REGISTER text boxes and icons
	// username text box
	const header = document.getElementsByClassName("banner")[0];
	var username = document.createElement("INPUT");
	username.setAttribute("type", "text");
	username.setAttribute("value", "Username");
	username.setAttribute("id", "username");
	header.appendChild(username);

	// name text box
	var name = document.createElement("INPUT");
	name.setAttribute("type", "text");
	name.setAttribute("value", "name");
	name.setAttribute("id", "name");
	header.appendChild(name);

	// password text box
	var password = document.createElement("INPUT");
	password.setAttribute("type", "text");
	password.setAttribute("value", "password");
	password.setAttribute("id", "password");
	header.appendChild(password);

	// email text box
	var email = document.createElement("INPUT");
	email.setAttribute("type", "text");
	email.setAttribute("value", "email");
	email.setAttribute("id", "email");
	header.appendChild(email);


	// login icon
	var loginIcon = document.createElement("li");
	loginIcon.innerText = "Login";
	loginIcon.classList.toggle('nav-item');
	header.appendChild(loginIcon);

	// signup icon
	var registerIcon = document.createElement("li");
	registerIcon.innerText = "Register";
	registerIcon.classList.toggle('nav-item');
	header.appendChild(registerIcon);

	// follow icon
	var followIcon = document.createElement("li");
	followIcon.innerText = "Follow";
	followIcon.classList.toggle('nav-item');
	header.appendChild(followIcon);

	// Adding functions to login/signup
	loginIcon.addEventListener('click', function() {login()});
	registerIcon.addEventListener('click', function() {signup()});
	followIcon.addEventListener('click', function() {follow()});

	// Testing out posting on current user
}());

async function follow() {
	const user = document.getElementById('username').value;
	const token = localStorage.getItem("token");
	console.log(token);


	const options = {
						method: "PUT",
						headers: {'Authorization': `Token ${token}`},
					}
	const followResult = await api.makeAPIRequest(`user/follow?username=${user}`, options);

 
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

	const signupPromise = api.makeAPIRequest("auth/signup", options);

}

async function login() {
	const password = document.getElementById('password').value;
	const user = document.getElementById('username').value;

	var body = { "username": user, "password": password};
	var options = 	{
							headers: { "Content-Type": "application/json" },
						    method: "POST",
						    body: JSON.stringify(body),
					}
	const loginResult = await api.makeAPIRequest("auth/login", options);

						//  await fetch("http://127.0.0.1:5000/auth/login", )
						// .then(data => data.json())					// becomes json
						// .then(json => JSON.stringify(json))			// becomes a string
						// .then(string => JSON.parse(string));		// becomes an object

	console.log(loginResult);
	if (loginResult.hasOwnProperty("token")) {
			// login successful, got token back
			console.log(user, "is registered with password", password);
			const largefeed = document.getElementById('large-feed');
			largefeed.innerHTML = "<p> Not Yet Implemented </p>";
			localStorage.setItem("token", loginResult.token);
			//console.log(JSON.parse(localStorage.getItem("tokenObj")));
	} else {
		console.log(user, "doesnt exist in database");
	}
}


// async function getUsers() {
// 	const usersPromise = api.getUsers()
// 		.then(function(json) {
// 			return JSON.stringify(json);
// 		})
// 		.then(function(stringArray) {
// 			return JSON.parse(stringArray);
// 		})
// 		.then(function(users) {
// 			// 
// 			// console.log(curUser);
// 			// const usersLength = users.length;
// 			// for (var i = 0; i < usersLength; i++) {
// 			// 	if (users[i].username == curUser) {
// 			// 		console.log(users[i]);
// 			// 		console.log(" is registered");
// 			// 		const largefeed = document.getElementById('large-feed');
// 			// 		largefeed.innerHTML = "<p> Not Yet Implemented </p>";
// 			// 	}
// 			// }
// 			// we can get the og layout back by using the feedPromise loop above.
// 			return users;
// 		});
// 	return usersPromise;
// }


//  Promise.all([feedPromise,usersPromise]).then(function(data) {
// 	const feed = data[0];
// 	const users = data[1];
// 	feed.reduce((parent, post) => {

//         parent.appendChild(createPostTile(post));
        
//         return parent;

//     }, document.getElementById('large-feed'))


// });