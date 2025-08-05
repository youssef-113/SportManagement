<?php
header('Content-Type: application/json');

function respond($status, $message)
{
    header('Content-Type: application/json');
    echo json_encode(['status' => $status, 'message' => $message]);
    exit;
}
function getRole($uid, $conn){
        $sql = "SELECT role FROM users WHERE uid = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('i', $uid);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if($result->num_rows > 0){
            $row = $result->fetch_assoc();
            return $row['role'];
        } else {
            respond('error', 'Server issue, please contact admin');
        }
    }
function getUserID($conn){
    if(isset($_COOKIE['sessionID'])){
        $sessionID = $_COOKIE['sessionID'];
        $sql = "SELECT uid FROM session WHERE sessionID = ? AND isActive = 1 AND expiresAt > NOW()";
        $stmt = $conn -> prepare($sql);
        if (!$stmt) {
            respond('error', 'Server error (prep stmt failed)');
        }
        $stmt -> bind_param('s' , $sessionID );
        $stmt -> execute();
        $result = $stmt -> get_result();
        if($result -> num_rows > 0){
            $row = $result -> fetch_assoc();
            $uid = $row['uid'];
            return $uid;
        }else {
            setcookie('sessionID', '', time() - 3600, '/');
            respond('error', 'session expired or invalid, please log in');
        }
    }
    else{
        respond('error', 'login required please login');
    }

}

?>