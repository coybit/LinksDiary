var userToken = document.location.search.slice(1);
document.location = 'http://localhost:3000/auth/twitter?clientToken=' + userToken;