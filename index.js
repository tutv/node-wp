var express = require('express');
var app = express();
var http = require('http').Server(app);
var mysql = require('mysql');

var compress = require('compression');
var wp_config = require('./wp-config');

var connection = mysql.createConnection({
	host    : wp_config.host,
	user    : wp_config.user,
	password: wp_config.password,
	database: wp_config.database
});

var config = {
	prefix: wp_config.prefix
};

var table = {
	posts: config.prefix + 'posts'
};

app.use(compress());
app.enable('view cache');

/**
 * Connect database
 */
connection.connect(function (err) {
	if (!err) {
		console.log("Database is connected ...");
	} else {
		console.log(err);
		console.log("Error connecting database ...");
	}
});

/**
 * Paged
 */
app.get('/page/:id', function (req, res) {
	var id = req.params.id;
	id = parseInt(id);

	if (isNaN(id)) {
		res.status(404).send('404 Not Found!');
		return;
	}

	var title = wp_config.site_name + ' - ' + wp_config.site_tag_name + ' - Page ' + id;

	if (id === 1) {
		res.redirect('/');
	} else {
		var start_select = parseInt(id * 10);
		var query = "SELECT * FROM " + table.posts + " AS ps WHERE 1=1 AND ps.post_type = 'post' AND (ps.post_status = 'publish' OR ps.post_status = 'private') ORDER BY ps.post_date DESC LIMIT " + start_select + ", 10";

		connection.query(query, function (err, rows, fields) {
			if (err) throw err;

			/**
			 * Paging
			 */
			var next = id + 1;
			var back = id - 1;
			if (rows.length === 0) {
				next = false;
				back = 1;
			}
			if (rows.length < 10) {
				next = false;
			}

			res.render('posts', {cache: true, title: title, posts: rows, paged: {back: back, next: next}});
		});
	}
});

/**
 * Home
 */
app.get('/', function (req, res) {
	var title = wp_config.site_name + ' - ' + wp_config.site_tag_name;

	var query = "SELECT * FROM " + table.posts + " AS ps WHERE 1=1 AND ps.post_type = 'post' AND (ps.post_status = 'publish' OR ps.post_status = 'private') ORDER BY ps.post_date DESC LIMIT 0, 10";

	connection.query(query, function (err, rows, fields) {
		if (err) throw err;

		res.render('posts', {cache: true, title: title, posts: rows, paged: {back: false, next: 2}});
	});
});

/**
 * Test
 */
app.get('/test', function (req, res) {
	var title = wp_config.site_name + ' - ' + wp_config.site_tag_name;

	var query = "SELECT * FROM " + table.posts + " AS ps WHERE 1=1 AND ps.post_type = 'post' AND (ps.post_status = 'publish' OR ps.post_status = 'private') ORDER BY ps.post_date DESC LIMIT 0, 10";

	connection.query(query, function (err, rows, fields) {
		if (err) throw err;

		res.json(rows);
	});
});

/**
 * Post
 */
app.get('/post/:id', function (req, res) {
	var id = req.params.id;
	id = parseInt(id);

	if (isNaN(id)) {
		res.status(404).send('404 Not Found!');
		return;
	}

	var query = "SELECT * FROM " + table.posts + " AS ps WHERE 1=1 AND ps.ID=" + id + " AND (ps.post_status = 'publish' OR ps.post_status = 'private') ORDER BY ps.post_date DESC LIMIT 0, 10";
	connection.query(query, function (err, rows, fields) {
		if (err) throw err;

		if (rows.length == 0) {
			res.status(404).send('404 Not Found!');
			return;
		}

		var post = rows[0];

		var title = post.post_title + ' - ' + wp_config.site_name;
		res.render('post', {cache: true, title: title, post: post});
	});
});

/**
 * Static file
 */
var oneDay = 86400000;
app.use(express.static(__dirname + '/public', {maxAge: oneDay}));

/**
 * Set engine template
 */
app.set('view engine', 'jade');

app.set('views', __dirname + '/views');

http.listen(8001, function () {
	console.log('listening on localhost:8001');
});