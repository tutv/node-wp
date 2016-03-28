var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var md5 = require('md5');
var session = require('express-session');
var mysql = require('mysql');

var connection = mysql.createConnection({
	host    : 'localhost',
	user    : 'root',
	password: '',
	database: 'wordpress'
});

var config = {
	prefix: 'test_'
};

connection.connect(function (err) {
	if (!err) {
		console.log("Database is connected ...");
	} else {
		console.log("Error connecting database ...");
	}
});

app.get('/', function (req, res) {
	var query = "SELECT * FROM test_posts WHERE 1=1 AND test_posts.post_type = 'post' AND (test_posts.post_status = 'publish' OR test_posts.post_status = 'private') ORDER BY test_posts.post_date DESC LIMIT 0, 10";

	connection.query(query, function (err, rows, fields) {
		if (err) throw err;

		//res.json(rows);
		res.render('posts', {posts: rows});
	});
});

app.get('/post/:id', function (req, res) {
	var id = req.params.id;
	id = parseInt(id);

	if (isNaN(id)) {
		res.status(404).send('404 Not Found!');
		return;
	}

	var query = "SELECT * FROM test_posts WHERE 1=1 AND test_posts.ID=" + id + " AND (test_posts.post_status = 'publish' OR test_posts.post_status = 'private') ORDER BY test_posts.post_date DESC LIMIT 0, 10";
	connection.query(query, function (err, rows, fields) {
		if (err) throw err;

		if (rows.length == 0) {
			res.status(404).send('404 Not Found!');
			return;
		}

		var post = rows[0];
		res.render('post', {post: post});
	});
});

/**
 * Static file
 */
app.use(express.static(__dirname + '/public'));

/**
 * Set engine template
 */
app.set('view engine', 'jade');

app.set('views', __dirname + '/views');

http.listen(8001, function () {
	console.log('listening on localhost:8001');
});