<?php
$con = mysqli_connect( 'localhost', 'root', '', 'wordpress' );

// Check connection
if ( mysqli_connect_errno() ) {
	echo "Failed to connect to MySQL: " . mysqli_connect_error();
}
$query = "SELECT * FROM test_posts AS ps WHERE 1=1 AND ps.post_type = 'post' AND (ps.post_status = 'publish' OR ps.post_status = 'private') ORDER BY ps.post_date DESC LIMIT 0, 10";

// Perform queries 
$results = mysqli_query( $con, $query );

$rows = array();
while ( $row = $results->fetch_assoc() ) {
	$rows[] = $row['post_title'];
}

print_r( json_encode( $rows ) );

mysqli_close( $con );