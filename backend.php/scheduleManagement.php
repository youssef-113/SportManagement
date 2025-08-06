<?php
//schedule management system with role-based access control
    require_once 'db.php';
    require_once 'utils.php';
    $uid = getUserID($conn);
    $role = getRole($conn, $uid);

    // first 
    /////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////// GET SCHEDULES ////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////

    function getAllSchedules($conn, $uid, $filters = []) {
        try {
            $sql = "
                SELECT s.*, 
                       creator.fullName as createdByName,
                       creator.role as createdByRole,
                       approver.fullName as approvedByName,
                       t.teamName,
                       ot.teamName as opponentTeamName
                FROM schedules s 
                INNER JOIN users creator ON creator.uid = s.createdBy 
                LEFT JOIN users approver ON approver.uid = s.approvedBy
                LEFT JOIN teams t ON t.teamID = s.teamID
                LEFT JOIN teams ot ON ot.teamID = s.opponentTeamID
                WHERE 1=1
            ";

            $params = [];
            $types = "";

            // Apply filters
            if (isset($filters['eventType']) && !empty($filters['eventType'])) {
                $sql .= " AND s.eventType = ?";
                $params[] = $filters['eventType'];
                $types .= "s";
            }

            if (isset($filters['teamID']) && !empty($filters['teamID'])) {
                if (ctype_digit((string)$filters['teamID'])) {
                    $sql .= " AND s.teamID = ?";
                    $params[] = (int)$filters['teamID'];
                    $types .= "i";
                }
            }

            if (isset($filters['eventStatus']) && !empty($filters['eventStatus'])) {
                $sql .= " AND s.EventStatus = ?";
                $params[] = $filters['eventStatus'];
                $types .= "s";
            }

            if (isset($filters['dateFrom']) && !empty($filters['dateFrom'])) {
                $sql .= " AND s.eventDate >= ?";
                $params[] = $filters['dateFrom'];
                $types .= "s";
            }

            if (isset($filters['dateTo']) && !empty($filters['dateTo'])) {
                $sql .= " AND s.eventDate <= ?";
                $params[] = $filters['dateTo'];
                $types .= "s";
            }

            $sql .= " ORDER BY s.eventDate ASC, s.startTime ASC";

            $stmt = $conn->prepare($sql);
            if (!empty($params)) {
                $stmt->bind_param($types, ...$params);
            }
            $stmt->execute();
            $res = $stmt->get_result();
            
            $schedules = [];
            while ($row = $res->fetch_assoc()) {
                $schedules[] = $row;
            }
            respond("success", $schedules, 200);

        } catch (Exception $e) {
            respond("error", "Server error: " . $e->getMessage(), 500);
        }
    }

    function getScheduleById($conn, $uid, $scheduleID) {
        try {
            if (!ctype_digit((string)$scheduleID)) {
                respond("error", "Invalid schedule ID", 400);
            }

            $stmt = $conn->prepare("
                SELECT s.*, 
                       creator.fullName as createdByName,
                       creator.role as createdByRole,
                       approver.fullName as approvedByName,
                       t.teamName,
                       ot.teamName as opponentTeamName
                FROM schedules s 
                INNER JOIN users creator ON creator.uid = s.createdBy 
                LEFT JOIN users approver ON approver.uid = s.approvedBy
                LEFT JOIN teams t ON t.teamID = s.teamID
                LEFT JOIN teams ot ON ot.teamID = s.opponentTeamID
                WHERE s.scheduleID = ?
            ");
            $stmt->bind_param("i", $scheduleID);
            $stmt->execute();
            $res = $stmt->get_result();
            $schedule = $res->fetch_assoc();
            
            if (!$schedule) {
                respond("error", "Schedule not found", 404);
            }

            respond("success", $schedule, 200);

        } catch (Exception $e) {
            respond("error", "Server error: " . $e->getMessage(), 500);
        }
    }

    function getSchedulesByTeam($conn, $uid, $teamID) {
        try {
            if (!ctype_digit((string)$teamID)) {
                respond("error", "Invalid team ID", 400);
            }

            $stmt = $conn->prepare("
                SELECT s.*, 
                       creator.fullName as createdByName,
                       creator.role as createdByRole,
                       approver.fullName as approvedByName,
                       t.teamName,
                       ot.teamName as opponentTeamName
                FROM schedules s 
                INNER JOIN users creator ON creator.uid = s.createdBy 
                LEFT JOIN users approver ON approver.uid = s.approvedBy
                LEFT JOIN teams t ON t.teamID = s.teamID
                LEFT JOIN teams ot ON ot.teamID = s.opponentTeamID
                WHERE s.teamID = ?
                ORDER BY s.eventDate ASC, s.startTime ASC
            ");
            $stmt->bind_param("i", $teamID);
            $stmt->execute();
            $res = $stmt->get_result();
            
            $schedules = [];
            while ($row = $res->fetch_assoc()) {
                $schedules[] = $row;
            }
            respond("success", $schedules, 200);

        } catch (Exception $e) {
            respond("error", "Server error: " . $e->getMessage(), 500);
        }
    }

    //sec 
    /////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////// CREATE SCHEDULE ///////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////

    function createSchedule($conn, $uid, $input) {
        try {
            $currentRole = getRole($conn, $uid);
            
            // Only admin and trainingManagement can create schedules
            if (!in_array(strtolower($currentRole), ['admin', 'trainingmanagement'])) {
                respond("error", "Access denied: Only admin and training management can create schedules", 403);
            }

            // Validate required fields
            $requiredFields = ['eventType', 'title', 'eventDate', 'startTime', 'endTime', 'dayOfWeek'];
            foreach ($requiredFields as $field) {
                if (!isset($input[$field]) || empty($input[$field])) {
                    respond("error", "Field '$field' is required", 400);
                }
            }

            // Validate enum values
            $validEventTypes = ['Training', 'Medical', 'Match', 'Meeting'];
            if (!in_array($input['eventType'], $validEventTypes)) {
                respond("error", "Invalid event type. Must be: " . implode(', ', $validEventTypes), 400);
            }

            $validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
            if (!in_array($input['dayOfWeek'], $validDays)) {
                respond("error", "Invalid day of week. Must be: " . implode(', ', $validDays), 400);
            }

            $validPriorities = ['Low', 'Medium', 'High'];
            $eventPriority = isset($input['eventPriority']) ? $input['eventPriority'] : 'Medium';
            if (!in_array($eventPriority, $validPriorities)) {
                respond("error", "Invalid event priority. Must be: " . implode(', ', $validPriorities), 400);
            }

            $validRecurrence = ['None', 'Daily', 'Weekly', 'Monthly'];
            $recurrencePattern = isset($input['recurrencePattern']) ? $input['recurrencePattern'] : 'None';
            if (!in_array($recurrencePattern, $validRecurrence)) {
                respond("error", "Invalid recurrence pattern. Must be: " . implode(', ', $validRecurrence), 400);
            }

            // Validate date and time format
            if (!DateTime::createFromFormat('Y-m-d', $input['eventDate'])) {
                respond("error", "Invalid date format. Use YYYY-MM-DD", 400);
            }

            if (!DateTime::createFromFormat('H:i:s', $input['startTime']) && !DateTime::createFromFormat('H:i', $input['startTime'])) {
                respond("error", "Invalid start time format. Use HH:MM:SS or HH:MM", 400);
            }

            if (!DateTime::createFromFormat('H:i:s', $input['endTime']) && !DateTime::createFromFormat('H:i', $input['endTime'])) {
                respond("error", "Invalid end time format. Use HH:MM:SS or HH:MM", 400);
            }

            // Validate team IDs if provided
            if (isset($input['teamID']) && !empty($input['teamID'])) {
                if (!ctype_digit((string)$input['teamID'])) {
                    respond("error", "Invalid team ID", 400);
                }
                // Check if team exists
                $teamStmt = $conn->prepare("SELECT teamID FROM teams WHERE teamID = ?");
                $teamStmt->bind_param("i", $input['teamID']);
                $teamStmt->execute();
                if ($teamStmt->get_result()->num_rows === 0) {
                    respond("error", "Team not found", 404);
                }
            }

            if (isset($input['opponentTeamID']) && !empty($input['opponentTeamID'])) {
                if (!ctype_digit((string)$input['opponentTeamID'])) {
                    respond("error", "Invalid opponent team ID", 400);
                }
                // Check if opponent team exists
                $opponentStmt = $conn->prepare("SELECT teamID FROM teams WHERE teamID = ?");
                $opponentStmt->bind_param("i", $input['opponentTeamID']);
                $opponentStmt->execute();
                if ($opponentStmt->get_result()->num_rows === 0) {
                    respond("error", "Opponent team not found", 404);
                }
            }

            // Prepare values for insertion
            $eventDescription = isset($input['eventDescription']) ? $input['eventDescription'] : null;
            $teamID = isset($input['teamID']) && !empty($input['teamID']) ? (int)$input['teamID'] : null;
            $opponentTeamID = isset($input['opponentTeamID']) && !empty($input['opponentTeamID']) ? (int)$input['opponentTeamID'] : null;
            $eventLocation = isset($input['eventLocation']) ? $input['eventLocation'] : null;
            $recurrenceEndDate = isset($input['recurrenceEndDate']) ? $input['recurrenceEndDate'] : null;

            // Simple insert statement
            $stmt = $conn->prepare("
                INSERT INTO schedules (
                    eventType, title, eventDescription, eventDate, startTime, endTime, 
                    dayOfWeek, teamID, opponentTeamID, createdBy, eventLocation, 
                    recurrencePattern, recurrenceEndDate, eventPriority, EventStatus, 
                    createdAt, updatedAt
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Scheduled', NOW(), NOW())
            ");

            // Bind parameters - much simpler approach
            $params = [
                $input['eventType'],
                $input['title'], 
                $eventDescription,
                $input['eventDate'],
                $input['startTime'],
                $input['endTime'],
                $input['dayOfWeek'],
                $teamID,
                $opponentTeamID,
                $uid,
                $eventLocation,
                $recurrencePattern,
                $recurrenceEndDate,
                $eventPriority
            ];
            
            $stmt->bind_param("sssssssiiissss", ...$params);

            if ($stmt->execute()) {
                $scheduleID = $conn->insert_id;
                respond("success", ["scheduleID" => $scheduleID, "message" => "Schedule created successfully"], 201);
            } else {
                respond("error", "Failed to create schedule", 500);
            }

        } catch (Exception $e) {
            respond("error", "Server error: " . $e->getMessage(), 500);
        }
    }

    //third 
    /////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////// UPDATE SCHEDULE ///////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////

    function updateSchedule($conn, $uid, $input) {
        try {
            $currentRole = getRole($conn, $uid);
            
            // Only admin and trainingManagement can update schedules
            if (!in_array(strtolower($currentRole), ['admin', 'trainingmanagement'])) {
                respond("error", "Access denied: Only admin and training management can update schedules", 403);
            }

            if (!isset($input['scheduleID'])) {
                respond("error", "Schedule ID is required", 400);
            }

            if (!ctype_digit((string)$input['scheduleID'])) {
                respond("error", "Invalid schedule ID", 400);
            }

            $scheduleID = (int)$input['scheduleID'];

            // Check if schedule exists
            $checkStmt = $conn->prepare("SELECT * FROM schedules WHERE scheduleID = ?");
            $checkStmt->bind_param("i", $scheduleID);
            $checkStmt->execute();
            $existing = $checkStmt->get_result()->fetch_assoc();
            
            if (!$existing) {
                respond("error", "Schedule not found", 404);
            }

            // Fields that can be updated
            $allowedFields = [
                'eventType', 'title', 'eventDescription', 'eventDate', 'startTime', 'endTime',
                'dayOfWeek', 'teamID', 'opponentTeamID', 'eventLocation', 'recurrencePattern',
                'recurrenceEndDate', 'eventPriority', 'EventStatus'
            ];

            $updates = [];
            $values = [];

            foreach ($allowedFields as $field) {
                if (isset($input[$field])) {
                    // Validate enum fields
                    if ($field === 'eventType') {
                        $validEventTypes = ['Training', 'Medical', 'Match', 'Meeting'];
                        if (!in_array($input[$field], $validEventTypes)) {
                            respond("error", "Invalid event type. Must be: " . implode(', ', $validEventTypes), 400);
                        }
                    }

                    if ($field === 'dayOfWeek') {
                        $validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
                        if (!in_array($input[$field], $validDays)) {
                            respond("error", "Invalid day of week. Must be: " . implode(', ', $validDays), 400);
                        }
                    }

                    if ($field === 'eventPriority') {
                        $validPriorities = ['Low', 'Medium', 'High'];
                        if (!in_array($input[$field], $validPriorities)) {
                            respond("error", "Invalid event priority. Must be: " . implode(', ', $validPriorities), 400);
                        }
                    }

                    if ($field === 'EventStatus') {
                        $validStatuses = ['Scheduled', 'Completed', 'Cancelled'];
                        if (!in_array($input[$field], $validStatuses)) {
                            respond("error", "Invalid event status. Must be: " . implode(', ', $validStatuses), 400);
                        }
                    }

                    if ($field === 'recurrencePattern') {
                        $validRecurrence = ['None', 'Daily', 'Weekly', 'Monthly'];
                        if (!in_array($input[$field], $validRecurrence)) {
                            respond("error", "Invalid recurrence pattern. Must be: " . implode(', ', $validRecurrence), 400);
                        }
                    }

                    // Validate team IDs
                    if (($field === 'teamID' || $field === 'opponentTeamID') && !empty($input[$field])) {
                        if (!ctype_digit((string)$input[$field])) {
                            respond("error", "Invalid $field", 400);
                        }
                        $teamStmt = $conn->prepare("SELECT teamID FROM teams WHERE teamID = ?");
                        $teamStmt->bind_param("i", $input[$field]);
                        $teamStmt->execute();
                        if ($teamStmt->get_result()->num_rows === 0) {
                            respond("error", "Team not found for $field", 404);
                        }
                    }

                    // Validate date format
                    if ($field === 'eventDate' || $field === 'recurrenceEndDate') {
                        if (!empty($input[$field]) && !DateTime::createFromFormat('Y-m-d', $input[$field])) {
                            respond("error", "Invalid date format for $field. Use YYYY-MM-DD", 400);
                        }
                    }

                    // Validate time format
                    if ($field === 'startTime' || $field === 'endTime') {
                        if (!DateTime::createFromFormat('H:i:s', $input[$field]) && !DateTime::createFromFormat('H:i', $input[$field])) {
                            respond("error", "Invalid time format for $field. Use HH:MM:SS or HH:MM", 400);
                        }
                    }

                    $updates[] = "$field = ?";
                    $values[] = $input[$field];
                }
            }

            if (empty($updates)) {
                respond("error", "No valid fields to update", 400);
            }

            // Add updatedAt timestamp
            $updates[] = "updatedAt = NOW()";

            $sql = "UPDATE schedules SET " . implode(', ', $updates) . " WHERE scheduleID = ?";
            $stmt = $conn->prepare($sql);
            
            $types = str_repeat('s', count($values)) . 'i';
            $values[] = $scheduleID;
            $stmt->bind_param($types, ...$values);

            if ($stmt->execute()) {
                respond("success", "Schedule updated successfully", 200);
            } else {
                respond("error", "Failed to update schedule", 500);
            }

        } catch (Exception $e) {
            respond("error", "Server error: " . $e->getMessage(), 500);
        }
    }

    // fourth
    /////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////// DELETE SCHEDULE ///////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////

    function deleteSchedule($conn, $uid, $scheduleID) {
        try {
            $currentRole = getRole($conn, $uid);
            
            // Only admin and trainingManagement can delete schedules
            if (!in_array(strtolower($currentRole), ['admin', 'trainingmanagement'])) {
                respond("error", "Access denied: Only admin and training management can delete schedules", 403);
            }

            if (!ctype_digit((string)$scheduleID)) {
                respond("error", "Invalid schedule ID", 400);
            }

            // Check if schedule exists
            $checkStmt = $conn->prepare("SELECT scheduleID, title FROM schedules WHERE scheduleID = ?");
            $checkStmt->bind_param("i", $scheduleID);
            $checkStmt->execute();
            $schedule = $checkStmt->get_result()->fetch_assoc();
            
            if (!$schedule) {
                respond("error", "Schedule not found", 404);
            }

            // Check if there are attendance records for this schedule
            $attendanceStmt = $conn->prepare("SELECT COUNT(*) as count FROM attendance WHERE scheduleID = ?");
            $attendanceStmt->bind_param("i", $scheduleID);
            $attendanceStmt->execute();
            $attendanceCount = $attendanceStmt->get_result()->fetch_assoc()['count'];

            if ($attendanceCount > 0) {
                respond("error", "Cannot delete schedule: Attendance records exist for this schedule", 409);
            }

            // Delete the schedule
            $stmt = $conn->prepare("DELETE FROM schedules WHERE scheduleID = ?");
            $stmt->bind_param("i", $scheduleID);

            if ($stmt->execute()) {
                // Log the action
                $logStmt = $conn->prepare("INSERT INTO adminActions (adminID, actionType, targetID, description, performedAt) VALUES (?, 'schedule_delete', ?, ?, NOW())");
                $description = "Deleted schedule: {$schedule['title']}";
                $logStmt->bind_param("iis", $uid, $scheduleID, $description);
                $logStmt->execute();

                respond("success", "Schedule deleted successfully", 200);
            } else {
                respond("error", "Failed to delete schedule", 500);
            }

        } catch (Exception $e) {
            respond("error", "Server error: " . $e->getMessage(), 500);
        }
    }

    // fifth
    /////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////// APPROVE SCHEDULE //////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////

    function approveSchedule($conn, $uid, $scheduleID) {
        try {
            $currentRole = getRole($conn, $uid);
            
            // Only admin can approve schedules
            if (strtolower($currentRole) !== 'admin') {
                respond("error", "Access denied: Only admin can approve schedules", 403);
            }

            if (!ctype_digit((string)$scheduleID)) {
                respond("error", "Invalid schedule ID", 400);
            }

            // Check if schedule exists and is not already approved
            $checkStmt = $conn->prepare("SELECT scheduleID, title, approvedBy FROM schedules WHERE scheduleID = ?");
            $checkStmt->bind_param("i", $scheduleID);
            $checkStmt->execute();
            $schedule = $checkStmt->get_result()->fetch_assoc();
            
            if (!$schedule) {
                respond("error", "Schedule not found", 404);
            }

            if ($schedule['approvedBy']) {
                respond("error", "Schedule is already approved", 409);
            }

            // Approve the schedule
            $stmt = $conn->prepare("UPDATE schedules SET approvedBy = ?, approvedAt = NOW() WHERE scheduleID = ?");
            $stmt->bind_param("ii", $uid, $scheduleID);

            if ($stmt->execute()) {
                // Log the action
                $logStmt = $conn->prepare("INSERT INTO adminActions (adminID, actionType, targetID, description, performedAt) VALUES (?, 'schedule_approve', ?, ?, NOW())");
                $description = "Approved schedule: {$schedule['title']}";
                $logStmt->bind_param("iis", $uid, $scheduleID, $description);
                $logStmt->execute();

                respond("success", "Schedule approved successfully", 200);
            } else {
                respond("error", "Failed to approve schedule", 500);
            }

        } catch (Exception $e) {
            respond("error", "Server error: " . $e->getMessage(), 500);
        }
    }

    //six
    /////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////// MAIN ROUTING //////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////

    $method = $_SERVER['REQUEST_METHOD'];

    try {
        switch ($method) {
            case 'GET':
                if (isset($_GET['action'])) {
                    switch ($_GET['action']) {
                        case 'all-schedules':
                            $filters = [];
                            if (isset($_GET['eventType'])) $filters['eventType'] = $_GET['eventType'];
                            if (isset($_GET['teamID'])) $filters['teamID'] = $_GET['teamID'];
                            if (isset($_GET['eventStatus'])) $filters['eventStatus'] = $_GET['eventStatus'];
                            if (isset($_GET['dateFrom'])) $filters['dateFrom'] = $_GET['dateFrom'];
                            if (isset($_GET['dateTo'])) $filters['dateTo'] = $_GET['dateTo'];
                            getAllSchedules($conn, $uid, $filters);
                            break;
                        case 'schedule-by-id':
                            if (!isset($_GET['scheduleID'])) {
                                respond('error', 'Schedule ID is required', 400);
                            }
                            getScheduleById($conn, $uid, $_GET['scheduleID']);
                            break;
                        case 'schedules-by-team':
                            if (!isset($_GET['teamID'])) {
                                respond('error', 'Team ID is required', 400);
                            }
                            getSchedulesByTeam($conn, $uid, $_GET['teamID']);
                            break;
                        default:
                            respond('error', 'Invalid action', 400);
                    }
                } else {
                    // Default: get all schedules
                    getAllSchedules($conn, $uid);
                }
                break;

            case 'POST':
                $input = json_decode(file_get_contents("php://input"), true);
                if (json_last_error() !== JSON_ERROR_NONE) {
                    respond("error", "Invalid JSON", 400);
                }

                if (isset($input['action'])) {
                    switch ($input['action']) {
                        case 'create-schedule':
                            createSchedule($conn, $uid, $input);
                            break;
                        case 'approve-schedule':
                            if (!isset($input['scheduleID'])) {
                                respond('error', 'Schedule ID is required', 400);
                            }
                            approveSchedule($conn, $uid, $input['scheduleID']);
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
                        case 'update-schedule':
                            updateSchedule($conn, $uid, $input);
                            break;
                        default:
                            respond('error', 'Invalid action', 400);
                    }
                } else {
                    respond('error', 'Action is required', 400);
                }
                break;

            case 'DELETE':
                if (isset($_GET['scheduleID'])) {
                    deleteSchedule($conn, $uid, $_GET['scheduleID']);
                } else {
                    respond('error', 'Schedule ID is required', 400);
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
    
    -- SCHEDULES
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

    -- TEAMS (for reference)
    CREATE TABLE teams (
        teamID INT PRIMARY KEY AUTO_INCREMENT,
        teamName VARCHAR(100) NOT NULL,
        sport ENUM('Football', 'Basketball', 'Tennis', 'Other') NOT NULL,
        teamRank INT,
        coachID INT
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
        role ENUM('player', 'trainingManagement', 'medicalStaff', 'admin') NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_login DATETIME DEFAULT NULL,
        status ENUM('Active', 'notActive') DEFAULT 'Active'
    );

    -- ATTENDANCE (for reference)
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
