<?php
include_once 'utils.php';
include_once 'db.php';
function logout($conn) {

    try {
        if (isset($_COOKIE['sessionID'])) {
            $sessionID = $_COOKIE['sessionID'];

            // check if the session exists and is active
            $sql = "SELECT * FROM sessions WHERE sessionID = ?";
            $stmt = $conn->prepare($sql);
            if (!$stmt) {
                http_response_code(500);
                respond("error", "Can't prepare SQL request, please contact admin.");
            }
            $stmt->bind_param('s', $sessionID);
            $stmt->execute();
            $result = $stmt->get_result();

            if ($result && $result->num_rows > 0) {
                $row = $result->fetch_assoc();
                if ((int)$row['isActive'] === 1) {
                    // mark the session as inactive
                    $sql = "UPDATE sessions SET isActive = 0 WHERE sessionID = ?";
                    $stmt = $conn->prepare($sql);
                    if (!$stmt) {
                        http_response_code(500);
                        respond("error", "Can't prepare SQL request for update, please contact admin.");
                    }
                    $stmt->bind_param('s', $sessionID);
                    $stmt->execute();

                    // delete cookies
                    setcookie('sessionID', '', time() - 3600, '/', '', true, true);

                    http_response_code(200);
                    respond('success', 'Logout successful.');
                } else {
                    http_response_code(400);
                    respond("error", "Session already inactive.");
                }
            } else {
                http_response_code(400);
                respond("error", "Invalid session.");
            }
        } else {
            http_response_code(400);
            respond("error", "User is not logged in.");
        }
    } catch (Exception $e) {
        http_response_code(500);
        respond("error", "An unexpected error occurred: " . $e->getMessage());
    }
}

logout($conn);
?>
