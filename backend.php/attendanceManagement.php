<?php
//attendance management system with role-based access control
    require_once 'db.php';
    require_once 'utils.php';
    $uid = getUserID($conn);
    $role = getRole($conn, $uid);

    // first 
    /////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////// GET ATTENDANCE ////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////

    function getPlayerAttendance($conn, $uid, $playerID = null) {
        try {
            if ($playerID && !ctype_digit((string)$playerID)) {
                respond("error", "Invalid player ID", 400);
            }

            $sql = "
                SELECT a.*, 
                       p.fullName as playerName, 
                       u.fullName as recordedByName,
                       u.role as recordedByRole,
                       s.title as scheduleTitle,
                       s.eventType,
                       s.eventDate,
                       s.startTime,
                       s.endTime
                FROM attendance a 
                INNER JOIN users p ON p.uid = a.playerID 
                INNER JOIN users u ON u.uid = a.userID 
                INNER JOIN schedules s ON s.scheduleID = a.scheduleID
                WHERE 1=1
            ";

            $params = [];
            $types = "";

            if ($playerID) {
                $sql .= " AND a.playerID = ?";
                $params[] = $playerID;
                $types .= "i";
            }

            $sql .= " ORDER BY a.attendanceDate DESC, a.createdAt DESC";

            $stmt = $conn->prepare($sql);
            if (!empty($params)) {
                $stmt->bind_param($types, ...$params);
            }
            $stmt->execute();
            $res = $stmt->get_result();
            
            $attendance = [];
            while ($row = $res->fetch_assoc()) {
                $attendance[] = $row;
            }
            respond("success", $attendance, 200);

        } catch (Exception $e) {
            respond("error", "Server error: " . $e->getMessage(), 500);
        }
    }

    function getAttendanceBySchedule($conn, $uid, $scheduleID) {
        try {
            if (!ctype_digit((string)$scheduleID)) {
                respond("error", "Invalid schedule ID", 400);
            }

            $stmt = $conn->prepare("
                SELECT a.*, 
                       p.fullName as playerName, 
                       u.fullName as recordedByName,
                       u.role as recordedByRole,
                       s.title as scheduleTitle,
                       s.eventType,
                       s.eventDate
                FROM attendance a 
                INNER JOIN users p ON p.uid = a.playerID 
                INNER JOIN users u ON u.uid = a.userID 
                INNER JOIN schedules s ON s.scheduleID = a.scheduleID
                WHERE a.scheduleID = ?
                ORDER BY p.fullName ASC
            ");
            $stmt->bind_param("i", $scheduleID);
            $stmt->execute();
            $res = $stmt->get_result();
            
            $attendance = [];
            while ($row = $res->fetch_assoc()) {
                $attendance[] = $row;
            }
            respond("success", $attendance, 200);

        } catch (Exception $e) {
            respond("error", "Server error: " . $e->getMessage(), 500);
        }
    }

    function getAttendanceStats($conn, $uid, $playerID = null) {
        try {
            $sql = "
                SELECT 
                    COUNT(*) as totalRecords,
                    SUM(CASE WHEN attendanceStatus = 'Present' THEN 1 ELSE 0 END) as presentCount,
                    SUM(CASE WHEN attendanceStatus = 'Absent' THEN 1 ELSE 0 END) as absentCount,
                    SUM(CASE WHEN attendanceStatus = 'Late' THEN 1 ELSE 0 END) as lateCount,
                    ROUND((SUM(CASE WHEN attendanceStatus = 'Present' THEN 1 ELSE 0 END) / COUNT(*)) * 100, 2) as attendanceRate
                FROM attendance a
                WHERE 1=1
            ";

            $params = [];
            $types = "";

            if ($playerID) {
                if (!ctype_digit((string)$playerID)) {
                    respond("error", "Invalid player ID", 400);
                }
                $sql .= " AND a.playerID = ?";
                $params[] = $playerID;
                $types .= "i";
            }

            $stmt = $conn->prepare($sql);
            if (!empty($params)) {
                $stmt->bind_param($types, ...$params);
            }
            $stmt->execute();
            $res = $stmt->get_result();
            $stats = $res->fetch_assoc();
            
            respond("success", $stats, 200);

        } catch (Exception $e) {
            respond("error", "Server error: " . $e->getMessage(), 500);
        }
    }

    //sec 
    /////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////// RECORD ATTENDANCE /////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////

    function recordAttendance($conn, $uid, $input) {
        try {
            // Validate required fields
            if (!isset($input['playerID']) || !isset($input['scheduleID']) || !isset($input['attendanceStatus'])) {
                respond("error", "Player ID, Schedule ID, and Attendance Status are required", 400);
            }

            if (!ctype_digit((string)$input['playerID']) || !ctype_digit((string)$input['scheduleID'])) {
                respond("error", "Invalid player ID or schedule ID", 400);
            }

            $playerID = (int)$input['playerID'];
            $scheduleID = (int)$input['scheduleID'];
            $attendanceStatus = $input['attendanceStatus'];
            $attendanceDate = isset($input['attendanceDate']) ? $input['attendanceDate'] : date('Y-m-d');
            $notes = isset($input['notes']) ? trim($input['notes']) : null;

            // Validate attendance status
            $validStatuses = ['Present', 'Absent', 'Late'];
            if (!in_array($attendanceStatus, $validStatuses)) {
                respond("error", "Invalid attendance status. Must be: Present, Absent, or Late", 400);
            }

            // Check if player exists and is active
            $playerStmt = $conn->prepare("SELECT uid FROM users WHERE uid = ? AND role = 'player' AND status = 'Active'");
            $playerStmt->bind_param("i", $playerID);
            $playerStmt->execute();
            if ($playerStmt->get_result()->num_rows === 0) {
                respond("error", "Player not found or inactive", 404);
            }

            // Check if schedule exists
            $scheduleStmt = $conn->prepare("SELECT scheduleID FROM schedules WHERE scheduleID = ?");
            $scheduleStmt->bind_param("i", $scheduleID);
            $scheduleStmt->execute();
            if ($scheduleStmt->get_result()->num_rows === 0) {
                respond("error", "Schedule not found", 404);
            }

            // Check if attendance already recorded for this player and schedule
            $existingStmt = $conn->prepare("SELECT attendanceID FROM attendance WHERE playerID = ? AND scheduleID = ?");
            $existingStmt->bind_param("ii", $playerID, $scheduleID);
            $existingStmt->execute();
            if ($existingStmt->get_result()->num_rows > 0) {
                respond("error", "Attendance already recorded for this player and schedule", 409);
            }

            // Record attendance
            $stmt = $conn->prepare("INSERT INTO attendance (userID, playerID, scheduleID, attendanceDate, attendanceStatus, notes, createdAt) VALUES (?, ?, ?, ?, ?, ?, NOW())");
            $stmt->bind_param("iiisss", $uid, $playerID, $scheduleID, $attendanceDate, $attendanceStatus, $notes);

            if ($stmt->execute()) {
                $attendanceID = $conn->insert_id;
                respond("success", ["attendanceID" => $attendanceID, "message" => "Attendance recorded successfully"], 201);
            } else {
                respond("error", "Failed to record attendance", 500);
            }

        } catch (Exception $e) {
            respond("error", "Server error: " . $e->getMessage(), 500);
        }
    }

    //third 
    /////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////// UPDATE ATTENDANCE /////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////

    function updateAttendance($conn, $uid, $input) {
        try {
            if (!isset($input['attendanceID'])) {
                respond("error", "Attendance ID is required", 400);
            }

            if (!ctype_digit((string)$input['attendanceID'])) {
                respond("error", "Invalid attendance ID", 400);
            }

            $attendanceID = (int)$input['attendanceID'];

            // Check if attendance record exists
            $checkStmt = $conn->prepare("SELECT * FROM attendance WHERE attendanceID = ?");
            $checkStmt->bind_param("i", $attendanceID);
            $checkStmt->execute();
            $existing = $checkStmt->get_result()->fetch_assoc();
            
            if (!$existing) {
                respond("error", "Attendance record not found", 404);
            }

            // Fields that can be updated
            $allowedFields = ['attendanceStatus', 'notes', 'attendanceDate'];
            $updates = [];
            $values = [];

            foreach ($allowedFields as $field) {
                if (isset($input[$field])) {
                    if ($field === 'attendanceStatus') {
                        $validStatuses = ['Present', 'Absent', 'Late'];
                        if (!in_array($input[$field], $validStatuses)) {
                            respond("error", "Invalid attendance status. Must be: Present, Absent, or Late", 400);
                        }
                    }
                    $updates[] = "$field = ?";
                    $values[] = $input[$field];
                }
            }

            if (empty($updates)) {
                respond("error", "No valid fields to update", 400);
            }

            $sql = "UPDATE attendance SET " . implode(', ', $updates) . " WHERE attendanceID = ?";
            $stmt = $conn->prepare($sql);
            
            $types = str_repeat('s', count($values)) . 'i';
            $values[] = $attendanceID;
            $stmt->bind_param($types, ...$values);

            if ($stmt->execute()) {
                respond("success", "Attendance updated successfully", 200);
            } else {
                respond("error", "Failed to update attendance", 500);
            }

        } catch (Exception $e) {
            respond("error", "Server error: " . $e->getMessage(), 500);
        }
    }

    // fourth
    /////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////// USER STATUS MANAGEMENT ////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////

    function updateUserStatus($conn, $uid, $input) {
        try {
            $currentRole = getRole($conn, $uid);
            
            if (!isset($input['targetUserID']) || !isset($input['status'])) {
                respond("error", "Target User ID and status are required", 400);
            }

            if (!ctype_digit((string)$input['targetUserID'])) {
                respond("error", "Invalid target user ID", 400);
            }

            $targetUserID = (int)$input['targetUserID'];
            $newStatus = $input['status'];

            // Validate status
            $validStatuses = ['Active', 'notActive'];
            if (!in_array($newStatus, $validStatuses)) {
                respond("error", "Invalid status. Must be: Active or notActive", 400);
            }

            // Get target user info
            $targetStmt = $conn->prepare("SELECT uid, role, status, fullName FROM users WHERE uid = ?");
            $targetStmt->bind_param("i", $targetUserID);
            $targetStmt->execute();
            $targetUser = $targetStmt->get_result()->fetch_assoc();

            if (!$targetUser) {
                respond("error", "Target user not found", 404);
            }

            $targetRole = $targetUser['role'];

            // Role-based access control
            $canUpdate = false;
            $accessReason = "";

            switch (strtolower($currentRole)) {
                case 'admin':
                    // Admin can update anyone
                    $canUpdate = true;
                    $accessReason = "Admin access";
                    break;
                    

                case 'trainingmanagement':
                    // Coach can only update players
                    if ($targetRole === 'player') {
                        $canUpdate = true;
                        $accessReason = "Coach managing player";
                    }
                    break;
                    
                case 'medicalstaff':
                    // Medical staff can only update players
                    if ($targetRole === 'player') {
                        $canUpdate = true;
                        $accessReason = "Medical staff managing player";
                    }
                    break;
                    
                default:
                    $canUpdate = false;
            }

            if (!$canUpdate) {
                respond("error", "Access denied: You don't have permission to update this user's status", 403);
            }

            // Update user status
            $updateStmt = $conn->prepare("UPDATE users SET status = ? WHERE uid = ?");
            $updateStmt->bind_param("si", $newStatus, $targetUserID);

            if ($updateStmt->execute()) {
                // Log the action
                $logStmt = $conn->prepare("INSERT INTO adminActions (adminID, actionType, targetID, description, performedAt) VALUES (?, 'status_update', ?, ?, NOW())");
                $description = "Updated {$targetUser['fullName']} ({$targetRole}) status from {$targetUser['status']} to {$newStatus}. Reason: {$accessReason}";
                $logStmt->bind_param("iis", $uid, $targetUserID, $description);
                $logStmt->execute();

                respond("success", [
                    "message" => "User status updated successfully",
                    "targetUser" => $targetUser['fullName'],
                    "oldStatus" => $targetUser['status'],
                    "newStatus" => $newStatus
                ], 200);
            } else {
                respond("error", "Failed to update user status", 500);
            }

        } catch (Exception $e) {
            respond("error", "Server error: " . $e->getMessage(), 500);
        }
    }

    function getUsersByRole($conn, $uid, $targetRole = null) {
        try {
            $currentRole = getRole($conn, $uid);
            
            // Only admin, coach, and medical staff can view user lists
            if (!in_array(strtolower($currentRole), ['admin', 'trainingmanagement', 'medicalstaff'])) {
                respond("error", "Access denied: Insufficient permissions", 403);
            }

            $sql = "SELECT uid, fullName, email, role, status, createdAt, last_login FROM users WHERE 1=1";
            $params = [];
            $types = "";

            if ($targetRole) {
                $validRoles = ['player','trainingManagement', 'medicalStaff', 'admin'];
                if (!in_array($targetRole, $validRoles)) {
                    respond("error", "Invalid role specified", 400);
                }
                $sql .= " AND role = ?";
                $params[] = $targetRole;
                $types .= "s";
            }

            $sql .= " ORDER BY role ASC, fullName ASC";

            $stmt = $conn->prepare($sql);
            if (!empty($params)) {
                $stmt->bind_param($types, ...$params);
            }
            $stmt->execute();
            $res = $stmt->get_result();
            
            $users = [];
            while ($row = $res->fetch_assoc()) {
                $users[] = $row;
            }
            respond("success", $users, 200);

        } catch (Exception $e) {
            respond("error", "Server error: " . $e->getMessage(), 500);
        }
    }

    //five
    /////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////// MAIN ROUTING //////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////

    $method = $_SERVER['REQUEST_METHOD'];

    try {
        switch ($method) {
            case 'GET':
                if (isset($_GET['action'])) {
                    switch ($_GET['action']) {
                        case 'player-attendance':
                            $playerID = isset($_GET['playerID']) ? $_GET['playerID'] : null;
                            getPlayerAttendance($conn, $uid, $playerID);
                            break;
                        case 'schedule-attendance':
                            if (!isset($_GET['scheduleID'])) {
                                respond('error', 'Schedule ID is required', 400);
                            }
                            getAttendanceBySchedule($conn, $uid, $_GET['scheduleID']);
                            break;
                        case 'attendance-stats':
                            $playerID = isset($_GET['playerID']) ? $_GET['playerID'] : null;
                            getAttendanceStats($conn, $uid, $playerID);
                            break;
                        case 'users-by-role':
                            $targetRole = isset($_GET['role']) ? $_GET['role'] : null;
                            getUsersByRole($conn, $uid, $targetRole);
                            break;
                        default:
                            respond('error', 'Invalid action', 400);
                    }
                } else {
                    // Default: get all attendance records
                    getPlayerAttendance($conn, $uid);
                }
                break;

            case 'POST':
                $input = json_decode(file_get_contents("php://input"), true);
                if (json_last_error() !== JSON_ERROR_NONE) {
                    respond("error", "Invalid JSON", 400);
                }

                if (isset($input['action'])) {
                    switch ($input['action']) {
                        case 'record-attendance':
                            recordAttendance($conn, $uid, $input);
                            break;
                        case 'update-user-status':
                            updateUserStatus($conn, $uid, $input);
                            break;
                        default:
                            respond('error', 'Invalid action', 400);
                    }
                } else {
                    respond('error', 'Action is required', 400);
                }
                break;

            case 'PUT':
                $input = json_decode(file_get_contents("php://input"), true);
                if (json_last_error() !== JSON_ERROR_NONE) {
                    respond("error", "Invalid JSON", 400);
                }

                if (isset($input['action'])) {
                    switch ($input['action']) {
                        case 'update-attendance':
                            updateAttendance($conn, $uid, $input);
                            break;
                        default:
                            respond('error', 'Invalid action', 400);
                    }
                } else {
                    respond('error', 'Action is required', 400);
                }
                break;

            default:
                respond('error', 'Unsupported request method', 405);
        }
    } catch (Exception $e) {
        respond('error', 'Fatal error: ' . $e->getMessage(), 500);
    }

?>

/////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////// TABLES USED //////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////
    /*
    
    -- ATTENDANCE
    CREATE TABLE attendance (
        attendanceID INT PRIMARY KEY AUTO_INCREMENT,
        userID INT NOT NULL,
        playerID INT NOT NULL,
        scheduleID INT NOT NULL,
        attendanceDate DATE NOT NULL,
        notes TEXT,
        attendanceStatus ENUM('Present', 'Absent', 'Late') NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- USERS (for reference)
    CREATE TABLE users(
        uid INT AUTO_INCREMENT PRIMARY KEY,
        fullName VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        pass VARCHAR(255) NOT NULL,
        phoneNumber VARCHAR(20) DEFAULT NULL,
        gender ENUM('male', 'female') DEFAULT NULL,
        DOB DATE DEFAULT NULL,
        nationality VARCHAR(50) DEFAULT NULL,
        nationalID VARCHAR(50) DEFAULT NULL,
        role ENUM('player', 'trainingManagement', 'medicalStaff', 'manager', 'admin') NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_login DATETIME DEFAULT NULL,
        status ENUM('Active', 'notActive') DEFAULT 'Active'
    );

    -- SCHEDULES (for reference)
    CREATE TABLE schedules (
        scheduleID INT AUTO_INCREMENT PRIMARY KEY,
        eventType ENUM('Training', 'Medical', 'Match', 'Meeting') NOT NULL,
        title VARCHAR(100) NOT NULL,
        eventDescription TEXT,
        eventDate DATE NOT NULL,
        startTime TIME NOT NULL,
        endTime TIME NOT NULL,
        dayOfWeek ENUM('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday') NOT NULL,
        teamID INT,
        opponentTeamID INT,
        createdBy INT NOT NULL,
        eventLocation VARCHAR(100),
        recurrencePattern ENUM('None', 'Daily', 'Weekly', 'Monthly') DEFAULT 'None',
        recurrenceEndDate DATE,
        eventPriority ENUM('Low', 'Medium', 'High') DEFAULT 'Medium',
        approvedBy INT,
        approvedAt DATETIME,
        EventStatus ENUM('Scheduled', 'Completed', 'Cancelled') DEFAULT 'Scheduled',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

    -- ADMIN ACTIONS (for logging)
    CREATE TABLE adminActions (
        actionID INT PRIMARY KEY AUTO_INCREMENT,
        adminID INT NOT NULL,
        actionType VARCHAR(50) NOT NULL,
        targetID INT NOT NULL,
        description TEXT,
        performedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    */
