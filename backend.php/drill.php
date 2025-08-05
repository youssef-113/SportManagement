<?php
/**
 * @api {GET} /drills Get all drills or a specific drill by ID
 * @api {POST} /drills Create a new drill
 * @api {PUT} /drills?drillID={id} Update an existing drill
 * @api {DELETE} /drills?drillID={id} Delete a drill
 *
 * @apiName DrillsAPI
 * @apiGroup Drills
 *
 * @apiHeader {String} Content-Type=application/json
 * @apiHeader {String} Access-Control-Allow-Origin=*
 *
 * @apiParam (POST/PUT body) {String} drillName Name of the drill
 * @apiParam (POST/PUT body) {String} drillType Type/category of the drill
 * @apiParam (POST/PUT body) {String="easy","medium","hard"} difficulty Difficulty level
 * @apiParam (POST/PUT body) {String} drillDescription Description of the drill
 * @apiParam (POST/PUT body) {String} video_link Link to the drill video
 *
 * @apiSuccess {Boolean} success Indicates success state
 * @apiSuccess {Number} [drillID] Returned when a drill is created
 */

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type");

$host = "localhost";
$user = "root";
$pass = "";
$dbname = "sports_managment";

try {
    $conn = new mysqli($host, $user, $pass, $dbname);
    if ($conn->connect_error) {
        throw new Exception("DB connection failed");
    }
} catch (Exception $e) {
    http_response_code(500);
    respond("error", $e->getMessage());
    exit;
}

require_once 'utils.php';

try {
    $uid = getUserID($conn);
    $role = getRole($uid, $conn);
} catch (Exception $e) {
    http_response_code(401);
    respond("error", "Unauthorized: " . $e->getMessage());
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
$drillID = $_GET['drillID'] ?? null;

if ($method === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$input = json_decode(file_get_contents("php://input"), true);
if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    respond("error", "Invalid JSON format");
}

function clean($data) {
    return htmlspecialchars(strip_tags(trim($data)));
}

function getSpecificDrill($drillID, $conn) {
    try {
        $stmt = $conn->prepare("SELECT * FROM drills WHERE drillID = ?");
        $stmt->bind_param("i", $drillID);
        $stmt->execute();
        $res = $stmt->get_result();
        echo json_encode($res->fetch_assoc() ?: []);
    } catch (Exception $e) {
        http_response_code(500);
        respond("error", "Error fetching drill: " . $e->getMessage());
    }
}

function getAllDrills($conn) {
    try {
        $res = $conn->query("SELECT * FROM drills");
        $rows = [];
        while ($row = $res->fetch_assoc()) $rows[] = $row;
        echo json_encode($rows);
    } catch (Exception $e) {
        http_response_code(500);
        respond("error", "Error fetching drills: " . $e->getMessage());
    }
}

function addNewDrill($conn, $input, $uid) {
    try {
        if (!isset($uid)) {
            respond("error", "Missing user ID");
        }

        $drillName = clean($input['drillName'] ?? '');
        $drillType = clean($input['drillType'] ?? '');
        $createdBy = (int) $uid;
        $difficulty = clean($input['difficulty'] ?? '');
        $drillDescription = clean($input['drillDescription'] ?? '');
        $video_link = clean($input['video_link'] ?? '');

        if (!$drillName || !$drillType || !$drillDescription || !$video_link || !$difficulty) {
            respond("error", "Some input data for drills is missing or empty");
        }

        $validDifficulties = ['easy', 'medium', 'hard'];
        if (!in_array(strtolower($difficulty), $validDifficulties)) {
            respond("error", "Invalid difficulty level");
        }

        $stmt = $conn->prepare("INSERT INTO drills (drillName, drillType, createdBy, difficulty, drillDescription, video_link) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->bind_param("ssisss", $drillName, $drillType, $createdBy, $difficulty, $drillDescription, $video_link);
        $stmt->execute();

        echo json_encode(["success" => true, "drillID" => $stmt->insert_id]);
    } catch (Exception $e) {
        http_response_code(500);
        respond("error", "Failed to add drill: " . $e->getMessage());
    }
}

function editDrill($conn, $drillID, $input, $uid) {
    try {
        if (!isset($uid)) {
            respond("error", "Missing user ID");
        }

        $drillName = clean($input['drillName'] ?? '');
        $drillType = clean($input['drillType'] ?? '');
        $createdBy = (int) $uid;
        $difficulty = clean($input['difficulty'] ?? '');
        $drillDescription = clean($input['drillDescription'] ?? '');
        $video_link = clean($input['video_link'] ?? '');
        $notes = clean($input['notes'] ?? '');

        if (!$drillName || !$drillType || !$drillDescription || !$video_link || !$difficulty) {
            respond("error", "Some input data for drills is missing or empty");
        }

        $validDifficulties = ['easy', 'medium', 'hard'];
        if (!in_array(strtolower($difficulty), $validDifficulties)) {
            respond("error", "Invalid difficulty level");
        }

        $checkStmt = $conn->prepare("SELECT drillID FROM drills WHERE drillID = ?");
        $checkStmt->bind_param("i", $drillID);
        $checkStmt->execute();
        $checkResult = $checkStmt->get_result();

        if ($checkResult->num_rows === 0) {
            http_response_code(404);
            respond("error", "Drill not found.");
        }

        $stmt = $conn->prepare("UPDATE drills SET drillName=?, drillType=?, createdBy=?, drillDescription=?, notes=?, video_link=? WHERE drillID=?");
        $stmt->bind_param("ssisssi", $drillName, $drillType, $createdBy, $drillDescription, $notes, $video_link, $drillID);

        if ($stmt->execute()) {
            http_response_code(200);
            respond("success", "Drill updated successfully.");
        } else {
            http_response_code(500);
            respond("error", "Failed to update drill.");
        }
    } catch (Exception $e) {
        http_response_code(500);
        respond("error", "Error updating drill: " . $e->getMessage());
    }
}

function deleteDrill($conn, $drillID) {
    try {
        $stmt = $conn->prepare("DELETE FROM drills WHERE drillID = ?");
        $stmt->bind_param("i", $drillID);
        echo json_encode(["success" => $stmt->execute()]);
    } catch (Exception $e) {
        http_response_code(500);
        respond("error", "Error deleting drill: " . $e->getMessage());
    }
}

switch ($method) {
    case 'GET':
        if ($drillID) {
            getSpecificDrill($drillID, $conn);
        } else {
            getAllDrills($conn);
        }
        break;

    case 'POST':
        if (!$input) {
            http_response_code(400);
            respond("error", "Empty body");
        } else if (strtolower($role) === 'trainingmanagement') {
            addNewDrill($conn, $input, $uid);
        } else {
            respond("error", "Only training management can create a new drill, contact your coach for help");
        }
        break;

    case 'PUT':
        if (!$drillID || !$input) {
            http_response_code(400);
            respond("error", "Drill ID and body required");
        } else if (strtolower($role) === 'trainingmanagement') {
            editDrill($conn, $drillID, $input, $uid);
        } else {
            respond("error", "Only training management can edit a drill");
        }
        break;

    case 'DELETE':
        if (!$drillID) {
            http_response_code(400);
            echo json_encode(["error" => "ID required"]);
            exit;
        } else if (strtolower($role) === 'trainingmanagement') {
            deleteDrill($conn, $drillID);
        } else {
            respond("error", "Only training management can delete a drill");
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(["error" => "Method not allowed"]);
        break;
}

$conn->close();
