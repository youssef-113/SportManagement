<?php
/**
 * AUTH HANDLER API
 * 
 * Centralized API for schedule and attendance operations with authentication.
 * 
 * ENDPOINTS:
 * - GET /authHandler.php?action=userinfo - Get user info
 * - POST /authHandler.php?module=schedule&action=create - Create event
 * - POST /authHandler.php?module=schedule&action=update - Update event
 * - GET /authHandler.php?module=schedule&action=delete&id={id} - Delete event
 * - GET /authHandler.php?module=schedule&action=view&team_id={id}&start_date={date} - View schedule
 * - POST /authHandler.php?module=attendance&action=mark - Mark attendance
 * - GET /authHandler.php?module=attendance&action=view - View attendance
 * - GET /authHandler.php?module=attendance&action=approve&id={id} - Approve attendance (managers only)
 * 
 * AUTHENTICATION: Requires valid session cookie
 * PERMISSIONS: Role-based (player/coach/manager/medicalStaff)
 */

// Security headers
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-CSRF-Token");
header("Access-Control-Allow-Credentials: true");
header("X-Content-Type-Options: nosniff");
header("X-Frame-Options: DENY");
header("Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; frame-ancestors 'none';");
header("Strict-Transport-Security: max-age=31536000; includeSubDomains");
header("Referrer-Policy: no-referrer-when-downgrade");
header("X-XSS-Protection: 1; mode=block");
header("Feature-Policy: geolocation 'none'; microphone 'none'; camera 'none'");

require_once 'db.php';
require_once 'utils.php';
require_once 'schedule.php';
require_once 'attendance.php';
require_once 'scheduleControll.php';
require_once 'attendanceControll.php';

class AuthHandler {
    private $conn;
    private $user_id;
    private $role;
    private $scheduleController;
    private $attendanceController;
    
    public function __construct() {
        global $conn;
        $this->conn = $conn;
        
        // Authenticate user
        $this->user_id = getUserID($this->conn);
        $this->role = getRole($this->user_id, $this->conn);
        
        // Initialize controllers with authenticated user
        $this->scheduleController = new ScheduleController($this->user_id, $this->role);
        $this->attendanceController = new AttendanceController($this->user_id, $this->role);
    }
    
    public function handleRequest() {
        try {
            $action = $_GET['action'] ?? '';
            $module = $_GET['module'] ?? '';
            
            // Input validation
            $action = htmlspecialchars(trim($action), ENT_QUOTES, 'UTF-8');
            $module = htmlspecialchars(trim($module), ENT_QUOTES, 'UTF-8');
            
            if (empty($action) || empty($module)) {
                http_response_code(400);
                respond('error', 'Action and module parameters are required');
            }
            
            // Route to appropriate module
            switch ($module) {
                case 'schedule':
                    return $this->handleScheduleRequest($action);
                case 'attendance':
                    return $this->handleAttendanceRequest($action);
                default:
                    http_response_code(400);
                    respond('error', 'Invalid module specified');
            }
            
        } catch (Exception $e) {
            http_response_code(500);
            respond('error', 'Authentication error: ' . $e->getMessage());
        }
    }
    
    private function handleScheduleRequest($action) {
        switch ($action) {
            case 'create':
                if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                    http_response_code(405);
                    respond('error', 'POST method required');
                }
                return $this->scheduleController->createEvent($_POST);
                
            case 'update':
                if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                    http_response_code(405);
                    respond('error', 'POST method required');
                }
                return $this->scheduleController->updateEvent($_POST);
                
            case 'delete':
                $eventId = filter_var($_GET['id'] ?? 0, FILTER_VALIDATE_INT);
                if (!$eventId) {
                    http_response_code(400);
                    respond('error', 'Valid event ID required');
                }
                return $this->scheduleController->deleteEvent($eventId);
                
            case 'view':
                $teamId = filter_var($_GET['team_id'] ?? 0, FILTER_VALIDATE_INT);
                $startDate = $_GET['start_date'] ?? date('Y-m-d');
                return $this->scheduleController->getWeeklySchedule($teamId, $startDate);
                
            case 'list':
                $filters = [
                    'team_id' => filter_var($_GET['team_id'] ?? 0, FILTER_VALIDATE_INT),
                    'date_from' => $_GET['date_from'] ?? '',
                    'date_to' => $_GET['date_to'] ?? '',
                    'event_type' => $_GET['event_type'] ?? ''
                ];
                return $this->scheduleController->getSchedules($filters);
                
            default:
                http_response_code(400);
                respond('error', 'Invalid schedule action');
        }
    }
    
    private function handleAttendanceRequest($action) {
        switch ($action) {
            case 'mark':
                if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                    http_response_code(405);
                    respond('error', 'POST method required');
                }
                return $this->attendanceController->markAttendance($_POST);
                
            case 'update':
                if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                    http_response_code(405);
                    respond('error', 'POST method required');
                }
                return $this->attendanceController->updateAttendance($_POST);
                
            case 'approve':
                if ($this->role !== 'manager') {
                    http_response_code(403);
                    respond('error', 'Only managers can approve attendance');
                }
                $attendanceId = filter_var($_GET['id'] ?? 0, FILTER_VALIDATE_INT);
                if (!$attendanceId) {
                    http_response_code(400);
                    respond('error', 'Valid attendance ID required');
                }
                return $this->attendanceController->approveAttendance($attendanceId);
                
            case 'view':
                $filters = [
                    'schedule_id' => filter_var($_GET['schedule_id'] ?? 0, FILTER_VALIDATE_INT),
                    'date' => $_GET['date'] ?? '',
                    'search' => $_GET['search'] ?? '',
                    'page' => filter_var($_GET['page'] ?? 1, FILTER_VALIDATE_INT),
                    'perPage' => filter_var($_GET['perPage'] ?? 10, FILTER_VALIDATE_INT)
                ];
                return $this->attendanceController->getAttendance($filters);
                
            case 'report':
                if (!in_array($this->role, ['manager', 'coach'])) {
                    http_response_code(403);
                    respond('error', 'Access denied for attendance reports');
                }
                $filters = [
                    'team_id' => filter_var($_GET['team_id'] ?? 0, FILTER_VALIDATE_INT),
                    'date_from' => $_GET['date_from'] ?? '',
                    'date_to' => $_GET['date_to'] ?? '',
                    'player_id' => filter_var($_GET['player_id'] ?? 0, FILTER_VALIDATE_INT)
                ];
                return $this->attendanceController->getAttendanceReport($filters);
                
            default:
                http_response_code(400);
                respond('error', 'Invalid attendance action');
        }
    }
    
    public function getUserInfo() {
        return [
            'user_id' => $this->user_id,
            'role' => $this->role,
            'authenticated' => true
        ];
    }
    
    public function checkPermission($requiredRole) {
        $roleHierarchy = [
            'player' => 1,
            'coach' => 2,
            'medicalStaff' => 2,
            'trainingManagement' => 3,
            'manager' => 4
        ];
        
        $userLevel = $roleHierarchy[$this->role] ?? 0;
        $requiredLevel = $roleHierarchy[$requiredRole] ?? 5;
        
        return $userLevel >= $requiredLevel;
    }
}

// Handle the request if this file is accessed directly
if ($_SERVER['SCRIPT_NAME'] === '/backend.php/authHandler.php') {
    try {
        $authHandler = new AuthHandler();
        
        // Handle special info request
        if (($_GET['action'] ?? '') === 'userinfo') {
            respond('success', $authHandler->getUserInfo());
        }
        
        // Handle module requests
        $authHandler->handleRequest();
        
    } catch (Exception $e) {
        http_response_code(500);
        respond('error', 'Server error: ' . $e->getMessage());
    }
}
?>
