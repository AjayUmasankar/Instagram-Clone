// importing named exports we use brackets
import { createPostTile, uploadImage } from './helpers.js';

// when importing 'default' exports, use below syntax
import API from './api.js';

const api  = new API();

(async function() {
	// we can use this single api request multiple times
	const feedPromise = api.getFeed();


	feedPromise
	.then(posts => {
	    posts.reduce((parent, post) => {

	        parent.appendChild(createPostTile(post));
	        
	        return parent;

	    }, document.getElementById('large-feed'))
	});

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
	name.setAttribute("value", "name to register");
	name.setAttribute("id", "name");
	header.appendChild(name);

	// username icon
	var loginIcon = document.createElement("li");
	loginIcon.innerText = "Login";
	loginIcon.classList.toggle('nav-item');
	header.appendChild(loginIcon);

	// register icon
	var registerIcon = document.createElement("li");
	registerIcon.innerText = "Register";
	registerIcon.classList.toggle('nav-item');
	header.appendChild(registerIcon);

	// get user list from provided json file
	var users = await getUsersArray();
	console.log(users);

	loginIcon.addEventListener('click', function() {login(users)});
	registerIcon.addEventListener('click', function() {register(users)});
}());


function register(users) {
	const curUser = document.getElementById('username').value;
	const curUserName = document.getElementById('name').value;
	const usersLength = users.length;
	var registered = 0;
	for (var i =0; i < usersLength; i++) {
		if (users[i].username == curUser) {
			registered = 1;
		}
	}
	if (registered == 0) {
		var newUser = {}; // = {username:`${curUser}`};
		newUser.username = curUser;
		newUser.name = curUserName;
		newUser.id = usersLength+1;
		users.push(newUser);
		console.log("Registered ", users[i], users);
		//console.log(users[i]);
	} else {
		console.log("Already registered");
	}
}

function login(users) {
	var loginSuccess = 0;
	const curUser = document.getElementById('username').value;
	const usersLength = users.length;
	for (var i = 0; i < usersLength; i++) {
		if (users[i].username == curUser) {
			
			//console.log(" is registered");
			const largefeed = document.getElementById('large-feed');
			largefeed.innerHTML = "<p> Not Yet Implemented </p>";
			loginSuccess = 1;
		}
	}
	if (loginSuccess == 1) {
		console.log(curUser, "is being logged in");
	} else {
		console.log(curUser, "doesnt exist");
	}
}

async function getUsersArray() {
	return await getUsers();
}

async function getUsers() {
	const usersPromise = api.getUsers()
		.then(function(json) {
			return JSON.stringify(json);
		})
		.then(function(stringArray) {
			return JSON.parse(stringArray);
		})
		.then(function(users) {
			// 
			// console.log(curUser);
			// const usersLength = users.length;
			// for (var i = 0; i < usersLength; i++) {
			// 	if (users[i].username == curUser) {
			// 		console.log(users[i]);
			// 		console.log(" is registered");
			// 		const largefeed = document.getElementById('large-feed');
			// 		largefeed.innerHTML = "<p> Not Yet Implemented </p>";
			// 	}
			// }
			// we can get the og layout back by using the feedPromise loop above.
			return users;
		});
	return usersPromise;
}





//  Promise.all([feedPromise,usersPromise]).then(function(data) {
// 	const feed = data[0];
// 	const users = data[1];
// 	feed.reduce((parent, post) => {

//         parent.appendChild(createPostTile(post));
        
//         return parent;

//     }, document.getElementById('large-feed'))


// });