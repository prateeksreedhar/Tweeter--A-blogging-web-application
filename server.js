var express = require('express');
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
var bodyParser = require('body-parser');
var bcrypt = require('bcryptjs');
var jwt = require('jwt-simple');
var app = express();

var JWT_SECRET = 'tweetertweet';
var db = null;
MongoClient.connect("mongodb://localhost:27017/tweeter", function(err, dbConn){
	if(!err){
		console.log("We are connected");
		db = dbConn;
	}
});

app.use(express.static('public'));

app.use(bodyParser.json());


app.get('/tweets', function(req, res, next){

	db.collection('tweets', function(err, tweetsCollection){
		tweetsCollection.find().toArray(function(err, tweets) {
			console.log(tweets);
			return res.json(tweets);
		});
	});
});

app.post('/tweets', function(req, res, next){

	var token = req.headers.authorization;
	var user = jwt.decode(token, JWT_SECRET);
	console.log("token = " + token);

	db.collection('tweets', function(err, tweetsCollection){
		var newTweet = {
			text: req.body.newMeow,
			user: user._id,
			username: user.username
		};

		tweetsCollection.insert(newTweet, {w:1}, function(err) {
			
			return res.send();
		});
	});

});

app.put('/tweets/remove', function(req, res, next){

	var token = req.headers.authorization;
	var user = jwt.decode(token, JWT_SECRET);

	db.collection('tweets', function(err, tweetsCollection){
		var tweetId = req.body.meow._id;
 
		meowsCollection.remove({_id: ObjectId(tweetId), user: user._id}, {w:1}, function(err) {
			
			return res.send();
		});
	});
});

app.post('/users', function(req, res, next){

	db.collection('users', function(err, usersCollection){

		bcrypt.genSalt(10, function(err, salt){
			bcrypt.hash(req.body.password, salt, function(err, hash){
				var newUser = {username: req.body.username,
				password: hash
			};

			usersCollection.insert(newUser, {w:1}, function(err) {
			
				return res.send();
			});
			});
		});		
	});
});

//Sign In 
app.put('/users/signin', function(req, res, next){

	db.collection('users', function(err, usersCollection){

		usersCollection.findOne({username: req.body.username}, function(err, user) {
			
			bcrypt.compare(req.body.password, user.password, function(err, result){
				if(result){
					var myToken = jwt.encode(user, JWT_SECRET);
					return res.json({token: myToken});
				}else{
					return res.status(400).send();
				}
			});
		});
	});
});

app.listen(3000, function(){
	console.log('Example app listening on port 3000!');
});
