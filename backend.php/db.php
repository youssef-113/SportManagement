<?php

$conn = new mysqli('localhost', 'root', '', 'sports_manage');

if($conn -> connect_error){
    die("connection failed: " . $conn -> connect_error);
}
?>