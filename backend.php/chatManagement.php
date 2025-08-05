<?php
//rewrite the chat file to be more and the same of the userProfile for walid typing 
    require_once 'db.php';
    require_once 'utils.php';
    $uid = getUserID($conn);
    $role = getRole($conn, $uid);
    // first 
    /////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////// GET CHATS ////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////

    function getDirectChats($conn, $uid) {
        // Get latest message for each conversation
        $stmt = $conn->prepare("
            SELECT 
                c1.chatID,
                IF(c1.senderID = ?, c1.receiverID, c1.senderID) as otherUserID,
                IF(c1.senderID = ?, receiver.fullName, sender.fullName) as otherUserName,
                IF(c1.senderID = ?, receiver.role, sender.role) as otherUserRole,
                c1.message as lastMessage,
                c1.sentAt as lastMessageTime,
                c1.senderID as lastMessageSenderID,
                sender.fullName as lastMessageSenderName
            FROM chats c1
            INNER JOIN users sender ON sender.uid = c1.senderID
            INNER JOIN users receiver ON receiver.uid = c1.receiverID
            WHERE (c1.senderID = ? OR c1.receiverID = ?)
            AND c1.sentAt = (
                SELECT MAX(c2.sentAt)
                FROM chats c2
                WHERE (c2.senderID = c1.senderID AND c2.receiverID = c1.receiverID)
                   OR (c2.senderID = c1.receiverID AND c2.receiverID = c1.senderID)
            )
            ORDER BY c1.sentAt DESC
        ");
        $stmt->bind_param("iiiii", $uid, $uid, $uid, $uid, $uid);
        $stmt->execute();
        $res = $stmt->get_result();
        $conversations = [];
        while ($row = $res->fetch_assoc()) {
            $conversations[] = $row;
        }
        respond("success", $conversations, 200);
    }

    function getChatHistory($conn, $uid, $otherUserID) {
        if (!ctype_digit((string)$otherUserID)) {
            respond("error", "Invalid other user ID", 400);
        }

        $stmt = $conn->prepare("
            SELECT c.*, 
                   sender.fullName as senderName, 
                   receiver.fullName as receiverName,
                   sender.role as senderRole,
                   receiver.role as receiverRole
            FROM chats c 
            INNER JOIN users sender ON sender.uid = c.senderID 
            INNER JOIN users receiver ON receiver.uid = c.receiverID 
            WHERE (c.senderID = ? AND c.receiverID = ?) 
               OR (c.senderID = ? AND c.receiverID = ?) 
            ORDER BY c.sentAt ASC
        ");
        $stmt->bind_param("iiii", $uid, $otherUserID, $otherUserID, $uid);
        $stmt->execute();
        $res = $stmt->get_result();
        $messages = [];
        while ($row = $res->fetch_assoc()) {
            $messages[] = $row;
        }
        respond("success", $messages, 200);
    }

    function getUserGroups($conn, $uid) {
        $stmt = $conn->prepare("
            SELECT cg.*, gm.role as memberRole, gm.joinedAt,
                   creator.fullName as creatorName
            FROM chatGroups cg 
            INNER JOIN groupMembers gm ON gm.groupID = cg.groupID 
            INNER JOIN users creator ON creator.uid = cg.createdBy
            WHERE gm.userID = ? AND cg.isDeleted = 0
            ORDER BY cg.createdAt DESC
        ");
        $stmt->bind_param("i", $uid);
        $stmt->execute();
        $res = $stmt->get_result();
        $groups = [];
        while ($row = $res->fetch_assoc()) {
            $groups[] = $row;
        }
        respond("success", $groups, 200);
    }

    function getGroupMembers($conn, $uid, $groupID) {
        if (!ctype_digit((string)$groupID)) {
            respond("error", "Invalid group ID", 400);
        }

        // Check if user is member of the group
        $checkStmt = $conn->prepare("SELECT 1 FROM groupMembers WHERE groupID = ? AND userID = ?");
        $checkStmt->bind_param("ii", $groupID, $uid);
        $checkStmt->execute();
        if ($checkStmt->get_result()->num_rows === 0) {
            respond("error", "Access denied: You are not a member of this group", 403);
        }

        $stmt = $conn->prepare("
            SELECT gm.*, u.fullName, u.email, u.role as userRole
            FROM groupMembers gm 
            INNER JOIN users u ON u.uid = gm.userID 
            WHERE gm.groupID = ?
            ORDER BY gm.joinedAt ASC
        ");
        $stmt->bind_param("i", $groupID);
        $stmt->execute();
        $res = $stmt->get_result();
        $members = [];
        while ($row = $res->fetch_assoc()) {
            $members[] = $row;
        }
        respond("success", $members, 200);
    }
    //sec 
    /////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////// SEND MESSAGES ////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////

    function sendDirectMessage($conn, $uid, $input) {
        try {
            if (!isset($input['receiverID']) || !isset($input['message'])) {
                respond("error", "Receiver ID and message are required", 400);
            }

            if (!ctype_digit((string)$input['receiverID'])) {
                respond("error", "Invalid receiver ID", 400);
            }

            $receiverID = (int)$input['receiverID'];
            $message = trim($input['message']);

            if (empty($message)) {
                respond("error", "Message cannot be empty", 400);
            }

            // Check if receiver exists
            $checkStmt = $conn->prepare("SELECT uid FROM users WHERE uid = ? AND status = 'Active'");
            $checkStmt->bind_param("i", $receiverID);
            $checkStmt->execute();
            if ($checkStmt->get_result()->num_rows === 0) {
                respond("error", "Receiver not found or inactive", 404);
            }

            $stmt = $conn->prepare("INSERT INTO chats (senderID, receiverID, message, sentAt) VALUES (?, ?, ?, NOW())");
            $stmt->bind_param("iis", $uid, $receiverID, $message);

            if ($stmt->execute()) {
                $chatID = $conn->insert_id;
                respond("success", ["chatID" => $chatID, "message" => "Message sent successfully"], 201);
            } else {
                respond("error", "Failed to send message", 500);
            }

        } catch (Exception $e) {
            respond("error", "Server error: " . $e->getMessage(), 500);
        }
    }
    //third 
    /////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////// GROUP MANAGEMENT //////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////

    function createGroup($conn, $uid, $input) {
        try {
            if (!isset($input['groupName'])) {
                respond("error", "Group name is required", 400);
            }

            $groupName = trim($input['groupName']);
            if (empty($groupName)) {
                respond("error", "Group name cannot be empty", 400);
            }

            $description = isset($input['description']) ? trim($input['description']) : null;
            $avatarUrl = isset($input['avatarUrl']) ? trim($input['avatarUrl']) : null;

            $conn->begin_transaction();

            // Create group
            $stmt = $conn->prepare("INSERT INTO chatGroups (groupName, createdBy, description, avatarUrl, createdAt) VALUES (?, ?, ?, ?, NOW())");
            $stmt->bind_param("siss", $groupName, $uid, $description, $avatarUrl);

            if (!$stmt->execute()) {
                $conn->rollback();
                respond("error", "Failed to create group", 500);
            }

            $groupID = $conn->insert_id;

            // Add creator as admin member
            $memberStmt = $conn->prepare("INSERT INTO groupMembers (groupID, userID, role, joinedAt) VALUES (?, ?, 'admin', NOW())");
            $memberStmt->bind_param("ii", $groupID, $uid);

            if (!$memberStmt->execute()) {
                $conn->rollback();
                respond("error", "Failed to add creator to group", 500);
            }

            $conn->commit();
            respond("success", ["groupID" => $groupID, "message" => "Group created successfully"], 201);

        } catch (Exception $e) {
            $conn->rollback();
            respond("error", "Server error: " . $e->getMessage(), 500);
        }
    }

    function addGroupMember($conn, $uid, $input) {
        try {
            if (!isset($input['groupID']) || !isset($input['userID'])) {
                respond("error", "Group ID and User ID are required", 400);
            }

            if (!ctype_digit((string)$input['groupID']) || !ctype_digit((string)$input['userID'])) {
                respond("error", "Invalid group ID or user ID", 400);
            }

            $groupID = (int)$input['groupID'];
            $userID = (int)$input['userID'];

            // Check if current user is admin of the group
            $adminStmt = $conn->prepare("SELECT 1 FROM groupMembers WHERE groupID = ? AND userID = ? AND role = 'admin'");
            $adminStmt->bind_param("ii", $groupID, $uid);
            $adminStmt->execute();
            if ($adminStmt->get_result()->num_rows === 0) {
                respond("error", "Access denied: Only group admins can add members", 403);
            }

            // Check if user exists and is active
            $userStmt = $conn->prepare("SELECT uid FROM users WHERE uid = ? AND status = 'Active'");
            $userStmt->bind_param("i", $userID);
            $userStmt->execute();
            if ($userStmt->get_result()->num_rows === 0) {
                respond("error", "User not found or inactive", 404);
            }

            // Check if user is already a member
            $memberStmt = $conn->prepare("SELECT 1 FROM groupMembers WHERE groupID = ? AND userID = ?");
            $memberStmt->bind_param("ii", $groupID, $userID);
            $memberStmt->execute();
            if ($memberStmt->get_result()->num_rows > 0) {
                respond("error", "User is already a member of this group", 409);
            }

            // Add member
            $addStmt = $conn->prepare("INSERT INTO groupMembers (groupID, userID, role, joinedAt) VALUES (?, ?, 'member', NOW())");
            $addStmt->bind_param("ii", $groupID, $userID);

            if ($addStmt->execute()) {
                respond("success", "Member added successfully", 201);
            } else {
                respond("error", "Failed to add member", 500);
            }

        } catch (Exception $e) {
            respond("error", "Server error: " . $e->getMessage(), 500);
        }
    }
    // fourth
    /////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////// REACTIONS & SEEN //////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////

    function addReaction($conn, $uid, $input) {
        try {
            if (!isset($input['chatID']) || !isset($input['emoji'])) {
                respond("error", "Chat ID and emoji are required", 400);
            }

            if (!ctype_digit((string)$input['chatID'])) {
                respond("error", "Invalid chat ID", 400);
            }

            $chatID = (int)$input['chatID'];
            $emoji = trim($input['emoji']);

            if (empty($emoji)) {
                respond("error", "Emoji cannot be empty", 400);
            }

            // Check if chat exists and user has access
            $chatStmt = $conn->prepare("SELECT 1 FROM chats WHERE chatID = ? AND (senderID = ? OR receiverID = ?)");
            $chatStmt->bind_param("iii", $chatID, $uid, $uid);
            $chatStmt->execute();
            if ($chatStmt->get_result()->num_rows === 0) {
                respond("error", "Chat not found or access denied", 404);
            }

            // Insert or update reaction (REPLACE handles duplicates)
            $stmt = $conn->prepare("REPLACE INTO reactions (chatID, userID, emoji, createdAt) VALUES (?, ?, ?, NOW())");
            $stmt->bind_param("iis", $chatID, $uid, $emoji);

            if ($stmt->execute()) {
                respond("success", "Reaction added successfully", 201);
            } else {
                respond("error", "Failed to add reaction", 500);
            }

        } catch (Exception $e) {
            respond("error", "Server error: " . $e->getMessage(), 500);
        }
    }

    function markMessageAsSeen($conn, $uid, $input) {
        try {
            if (!isset($input['chatID'])) {
                respond("error", "Chat ID is required", 400);
            }

            if (!ctype_digit((string)$input['chatID'])) {
                respond("error", "Invalid chat ID", 400);
            }

            $chatID = (int)$input['chatID'];

            // Check if chat exists and user has access
            $chatStmt = $conn->prepare("SELECT 1 FROM chats WHERE chatID = ? AND (senderID = ? OR receiverID = ?)");
            $chatStmt->bind_param("iii", $chatID, $uid, $uid);
            $chatStmt->execute();
            if ($chatStmt->get_result()->num_rows === 0) {
                respond("error", "Chat not found or access denied", 404);
            }

            // Insert or update seen status
            $stmt = $conn->prepare("REPLACE INTO seenMessages (userID, chatID, seenAt) VALUES (?, ?, NOW())");
            $stmt->bind_param("ii", $uid, $chatID);

            if ($stmt->execute()) {
                respond("success", "Message marked as seen", 200);
            } else {
                respond("error", "Failed to mark message as seen", 500);
            }

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
                        case 'direct-chats':
                            getDirectChats($conn, $uid);
                            break;
                        case 'chat-history':
                            if (!isset($_GET['otherUserID'])) {
                                respond('error', 'Other user ID is required', 400);
                            }
                            getChatHistory($conn, $uid, $_GET['otherUserID']);
                            break;
                        case 'user-groups':
                            getUserGroups($conn, $uid);
                            break;
                        case 'group-members':
                            if (!isset($_GET['groupID'])) {
                                respond('error', 'Group ID is required', 400);
                            }
                            getGroupMembers($conn, $uid, $_GET['groupID']);
                            break;
                        default:
                            respond('error', 'Invalid action', 400);
                    }
                } else {
                    // Default: get direct chats
                    getDirectChats($conn, $uid);
                }
                break;

            case 'POST':
                $input = json_decode(file_get_contents("php://input"), true);
                if (json_last_error() !== JSON_ERROR_NONE) {
                    respond("error", "Invalid JSON", 400);
                }

                if (isset($input['action'])) {
                    switch ($input['action']) {
                        case 'send-message':
                            sendDirectMessage($conn, $uid, $input);
                            break;
                        case 'create-group':
                            createGroup($conn, $uid, $input);
                            break;
                        case 'add-member':
                            addGroupMember($conn, $uid, $input);
                            break;
                        case 'add-reaction':
                            addReaction($conn, $uid, $input);
                            break;
                        case 'mark-seen':
                            markMessageAsSeen($conn, $uid, $input);
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
    
    CREATE TABLE chats (
    chatID INT PRIMARY KEY AUTO_INCREMENT,
    senderID INT,
    receiverID INT,
    message TEXT,
    sentAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- CHAT GROUPS
CREATE TABLE chatGroups (
    groupID INT PRIMARY KEY AUTO_INCREMENT,
    groupName VARCHAR(100) NOT NULL,
    createdBy INT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    isDeleted BOOLEAN DEFAULT 0,
    avatarUrl VARCHAR(255) DEFAULT NULL,
    description TEXT DEFAULT NULL
);

-- GROUP MEMBERS
CREATE TABLE groupMembers (
    groupID INT NOT NULL,
    userID INT NOT NULL,
    joinedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    role ENUM('member', 'admin') DEFAULT 'member',
    PRIMARY KEY (groupID, userID)
);

-- REACTIONS
CREATE TABLE reactions (
    reactionID INT PRIMARY KEY AUTO_INCREMENT,
    chatID INT NOT NULL,
    userID INT NOT NULL,
    emoji VARCHAR(10) NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_reaction (chatID, userID, emoji)
);

-- SEEN MESSAGES
CREATE TABLE seenMessages (
    seenID INT AUTO_INCREMENT PRIMARY KEY,
    userID INT NOT NULL,
    chatID INT NOT NULL,
    seenAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ADMIN ACTIONS
CREATE TABLE adminActions (
    actionID INT PRIMARY KEY AUTO_INCREMENT,
    adminID INT NOT NULL,
    actionType VARCHAR(50) NOT NULL,
    targetID INT NOT NULL,
    description TEXT,
    performedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
    */