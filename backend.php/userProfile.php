<?php

    require_once 'db.php';
    require_once 'utils.php';
    $uid = getUserID($conn);
    $role = getRole($conn, $uid);

    if (!$_GET['uid']) {
        respond('error', 'user ID is a required field', 400);
    }

    $uid = $_GET['uid'];

    /////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////// GET PROFILE ////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////

    function getPlayerProfile($conn, $uid) {
        $stmt = $conn->prepare("SELECT * FROM players p INNER JOIN users u ON u.uid = p.uid WHERE u.uid = ?");
        $stmt->bind_param("i", $uid);
        $stmt->execute();
        $res = $stmt->get_result();
        $row = $res->fetch_assoc();
        respond("success", $row, 200);
    }

    function getTrainingManagementProfile($conn, $uid) {
        $stmt = $conn->prepare("SELECT * FROM trainingmanagement t INNER JOIN users u ON u.uid = t.uid WHERE u.uid = ?");
        $stmt->bind_param("i", $uid);
        $stmt->execute();
        $res = $stmt->get_result();
        $row = $res->fetch_assoc();
        respond("success", $row, 200);
    }

    function getMedicalStaffProfile($conn, $uid) {
        $stmt = $conn->prepare("SELECT * FROM medicalstaff m INNER JOIN users u ON u.uid = m.uid WHERE u.uid = ?");
        $stmt->bind_param("i", $uid);
        $stmt->execute();
        $res = $stmt->get_result();
        $row = $res->fetch_assoc();
        respond("success", $row, 200);
    }

    function getAdminProfile($conn, $uid) {
        $stmt = $conn->prepare("SELECT * FROM admin a INNER JOIN users u ON u.uid = a.uid WHERE u.uid = ?");
        $stmt->bind_param("i", $uid);
        $stmt->execute();
        $res = $stmt->get_result();
        $row = $res->fetch_assoc();
        respond("success", $row, 200);
    }



    /////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////// UPDATE PROFILE /////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////

    function updatePlayerProfile($conn, $uid, $input) {
        try {
            if (!ctype_digit((string)$uid)) {
                respond("error", "Invalid user ID", 400);
            }

            // Fields that can be updated from both user and players table
            $userFields = ['email','pass','status','phoneNumber'];
            $playerFields = ['emergencyContact', 'playerHeight', 'playerWeight', 'sport', 'teamID', 'position', 'joinDate', 'contractStart', 'contractEnd'];

            $userUpdates = [];
            $userValues = [];

            foreach ($userFields as $field) {
                if (isset($input[$field])) {
                    $userUpdates[] = "$field = ?";
                    $userValues[] = $input[$field];
                }
            }

            $playerUpdates = [];
            $playerValues = [];

            foreach ($playerFields as $field) {
                if (isset($input[$field])) {
                    $playerUpdates[] = "$field = ?";
                    $playerValues[] = $input[$field];
                }
            }

            if (empty($userUpdates) && empty($playerUpdates)) {
                respond("error", "No valid fields to update", 400);
            }

            $conn->begin_transaction();

            if (!empty($userUpdates)) {
                $sql = "UPDATE users SET " . implode(', ', $userUpdates) . " WHERE uid = ?";
                $stmt = $conn->prepare($sql);
                if (!$stmt) {
                    $conn->rollback();
                    respond("error", "Failed to prepare user update", 500);
                }

                $types = str_repeat('s', count($userValues)) . 'i';
                $userValues[] = (int)$uid;
                $stmt->bind_param($types, ...$userValues);

                if (!$stmt->execute()) {
                    $conn->rollback();
                    respond("error", "Failed to execute user update", 500);
                }
            }

            if (!empty($playerUpdates)) {
                $sql = "UPDATE players SET " . implode(', ', $playerUpdates) . " WHERE uid = ?";
                $stmt = $conn->prepare($sql);
                if (!$stmt) {
                    $conn->rollback();
                    respond("error", "Failed to prepare player update", 500);
                }

                $types = str_repeat('s', count($playerValues)) . 'i';
                $playerValues[] = (int)$uid;
                $stmt->bind_param($types, ...$playerValues);

                if (!$stmt->execute()) {
                    $conn->rollback();
                    respond("error", "Failed to execute player update", 500);
                }
            }

            $conn->commit();
            respond("success", "Player profile updated successfully", 200);

        } catch (Exception $e) {
            $conn->rollback();
            respond("error", "Server error: " . $e->getMessage(), 500);
        }
    }


    function updateMedicalStaffProfile($conn, $uid, $input) {
    try {
            if (!ctype_digit((string)$uid)) {
                respond("error", "Invalid user ID", 400);
            }

            // Fields that can be updated from both user and medicalstaff tables
            $userFields = ['email','pass','status','phoneNumber'];
            $staffFields = ['major', 'specialization', 'yearsOfExp'];

            $userUpdates = [];
            $userValues = [];

            foreach ($userFields as $field) {
                if (isset($input[$field])) {
                    $userUpdates[] = "$field = ?";
                    $userValues[] = $input[$field];
                }
            }

            $staffUpdates = [];
            $staffValues = [];

            foreach ($staffFields as $field) {
                if (isset($input[$field])) {
                    $staffUpdates[] = "$field = ?";
                    $staffValues[] = $input[$field];
                }
            }

            if (empty($userUpdates) && empty($staffUpdates)) {
                respond("error", "No valid fields to update", 400);
            }

            $conn->begin_transaction();

            if (!empty($userUpdates)) {
                $sql = "UPDATE users SET " . implode(', ', $userUpdates) . " WHERE uid = ?";
                $stmt = $conn->prepare($sql);
                if (!$stmt) {
                    $conn->rollback();
                    respond("error", "Failed to prepare user update", 500);
                }

                $types = str_repeat('s', count($userValues)) . 'i';
                $userValues[] = (int)$uid;
                $stmt->bind_param($types, ...$userValues);

                if (!$stmt->execute()) {
                    $conn->rollback();
                    respond("error", "Failed to execute user update", 500);
                }
            }

            if (!empty($staffUpdates)) {
                $sql = "UPDATE medicalstaff SET " . implode(', ', $staffUpdates) . " WHERE uid = ?";
                $stmt = $conn->prepare($sql);
                if (!$stmt) {
                    $conn->rollback();
                    respond("error", "Failed to prepare medical staff update", 500);
                }

                $types = str_repeat('s', count($staffValues)) . 'i';
                $staffValues[] = (int)$uid;
                $stmt->bind_param($types, ...$staffValues);

                if (!$stmt->execute()) {
                    $conn->rollback();
                    respond("error", "Failed to execute medical staff update", 500);
                }
            }

            $conn->commit();
            respond("success", "Medical staff profile updated successfully", 200);

        } catch (Exception $e) {
            $conn->rollback();
            respond("error", "Server error: " . $e->getMessage(), 500);
        }
    }

    function updateTrainingManagementProfile($conn, $uid, $input) {
        try {
            if (!ctype_digit((string)$uid)) {
                respond("error", "Invalid user ID", 400);
            }

            
            $userFields = ['email','pass','status','phoneNumber'];
            $trainingFields = ['specialization', 'jobTitle', 'experienceLevel'];

            $userUpdates = [];
            $userValues = [];

            foreach ($userFields as $field) {
                if (isset($input[$field])) {
                    $userUpdates[] = "$field = ?";
                    $userValues[] = $input[$field];
                }
            }

            $trainingUpdates = [];
            $trainingValues = [];

            foreach ($trainingFields as $field) {
                if (isset($input[$field])) {
                    $trainingUpdates[] = "$field = ?";
                    $trainingValues[] = $input[$field];
                }
            }

            if (empty($userUpdates) && empty($trainingUpdates)) {
                respond("error", "No valid fields to update", 400);
            }

            $conn->begin_transaction();

            if (!empty($userUpdates)) {
                $sql = "UPDATE users SET " . implode(', ', $userUpdates) . " WHERE uid = ?";
                $stmt = $conn->prepare($sql);
                if (!$stmt) {
                    $conn->rollback();
                    respond("error", "Failed to prepare user update", 500);
                }

                $types = str_repeat('s', count($userValues)) . 'i';
                $userValues[] = (int)$uid;
                $stmt->bind_param($types, ...$userValues);

                if (!$stmt->execute()) {
                    $conn->rollback();
                    respond("error", "Failed to execute user update", 500);
                }
            }

            if (!empty($trainingUpdates)) {
                $sql = "UPDATE trainingmanagement SET " . implode(', ', $trainingUpdates) . " WHERE uid = ?";
                $stmt = $conn->prepare($sql);
                if (!$stmt) {
                    $conn->rollback();
                    respond("error", "Failed to prepare training management update", 500);
                }

                $types = str_repeat('s', count($trainingValues)) . 'i';
                $trainingValues[] = (int)$uid;
                $stmt->bind_param($types, ...$trainingValues);

                if (!$stmt->execute()) {
                    $conn->rollback();
                    respond("error", "Failed to execute training management update", 500);
                }
            }

            $conn->commit();
            respond("success", "Training management profile updated successfully", 200);

        } catch (Exception $e) {
            $conn->rollback();
            respond("error", "Server error: " . $e->getMessage(), 500);
        }
    }






    
    $method = $_SERVER['REQUEST_METHOD'];

    try {
        switch ($method) {
            case 'GET':

                switch (strtolower($role)) {
                    case 'player':
                        getPlayerProfile($conn, $uid);
                        break;
                    case 'medicalstaff':
                        getMedicalStaffProfile($conn, $uid);
                        break;
                    case 'trainingmanagement':
                        getTrainingManagementProfile($conn, $uid);
                        break;
                    case 'admin':
                        getAdminProfile($conn, $uid);
                        break;
                    default:
                        respond('error', 'Invalid role', 400);
                }
                break;
            case 'PUT':
                $input = json_decode(file_get_contents("php://input"), true);
                if (json_last_error() !== JSON_ERROR_NONE) {
                    respond("error", "Invalid JSON", 400);
                }

                switch (strtolower($role)) {
                    case 'player':
                        updatePlayerProfile($conn, $uid, $input);
                        break;
                    case 'medicalstaff':
                        updateMedicalStaffProfile($conn, $uid, $input);
                        break;
                    case 'trainingmanagement':
                        updateTrainingManagementProfile($conn, $uid, $input);
                        break;
                    default:
                        respond("error", "Unsupported role for update", 400);
                }
                break;
            default:
                respond('error', 'unsupported request type', 400);
        }
    } catch (Exception $e) {
        respond('error', 'Fatal error: ' . $e->getMessage(), 500);
    }

?>