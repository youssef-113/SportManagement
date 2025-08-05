<?php
/**
 * dashboard.php
 * 
 * Main dashboard that connects login with schedule and attendance systems
 * Provides role-based access to different modules
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

// Start session for CSRF protection
session_start();

// Generate CSRF token if not exists
if (!isset($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    $_SESSION['csrf_token_time'] = time();
}

try {
    // Authenticate user
    $user_id = getUserID($conn);
    $role = getRole($user_id, $conn);
    
    // Get user details
    $userDetails = getUserRoleAndTable($user_id, $conn);
    
    // Initialize modules
    $schedule = new Schedule();
    $attendance = new Attendance($user_id, $role);
    
    // Get dashboard data based on role
    $dashboardData = getDashboardData($user_id, $role, $schedule, $attendance);
    
} catch (Exception $e) {
    // Redirect to login if authentication fails
    header('Location: login.html?error=' . urlencode('Please log in to access the dashboard'));
    exit;
}

function getDashboardData($user_id, $role, $schedule, $attendance) {
    $data = [
        'user' => [
            'id' => $user_id,
            'role' => $role,
            'role_display' => getUserRoleName($role)
        ],
        'schedule' => [],
        'attendance' => [],
        'permissions' => getPermissions($role)
    ];
    
    try {
        // Get schedule data based on role
        switch ($role) {
            case 'player':
                $playerId = getPlayerId($user_id);
                if ($playerId) {
                    $teamId = getPlayerTeamId($playerId);
                    if ($teamId) {
                        $data['schedule'] = $schedule->getWeeklySchedule($teamId, $user_id, date('Y-m-d'));
                        $data['attendance'] = $attendance->getAttendance(['page' => 1, 'perPage' => 5]);
                    }
                }
                break;
                
            case 'coach':
                $teamId = getCoachTeamId($user_id);
                if ($teamId) {
                    $data['schedule'] = $schedule->getWeeklySchedule($teamId, $user_id, date('Y-m-d'));
                    $data['attendance'] = $attendance->getAttendance(['page' => 1, 'perPage' => 10]);
                }
                break;
                
            case 'manager':
                // Managers can see all schedules and attendance
                $data['schedule'] = $schedule->getAllSchedules(['limit' => 10]);
                $data['attendance'] = $attendance->getAttendance(['page' => 1, 'perPage' => 10]);
                break;
                
            case 'medicalStaff':
                // Medical staff see their assigned schedules
                $data['schedule'] = $schedule->getMedicalStaffSchedule($user_id, date('Y-m-d'));
                break;
        }
        
    } catch (Exception $e) {
        // Log error but don't break dashboard
        error_log("Dashboard data error for user $user_id: " . $e->getMessage());
    }
    
    return $data;
}

function getPermissions($role) {
    $permissions = [
        'player' => [
            'view_own_schedule' => true,
            'view_own_attendance' => true,
            'mark_attendance' => true,
            'create_schedule' => false,
            'edit_schedule' => false,
            'delete_schedule' => false,
            'approve_attendance' => false
        ],
        'coach' => [
            'view_team_schedule' => true,
            'view_team_attendance' => true,
            'create_schedule' => true,
            'edit_schedule' => true,
            'delete_own_schedule' => true,
            'mark_attendance' => true,
            'view_attendance_reports' => true,
            'approve_attendance' => false
        ],
        'manager' => [
            'view_all_schedules' => true,
            'view_all_attendance' => true,
            'create_schedule' => true,
            'edit_schedule' => true,
            'delete_schedule' => true,
            'approve_attendance' => true,
            'view_reports' => true,
            'manage_users' => true
        ],
        'medicalStaff' => [
            'view_assigned_schedule' => true,
            'create_medical_schedule' => true,
            'edit_medical_schedule' => true,
            'view_medical_reports' => true
        ]
    ];
    
    return $permissions[$role] ?? [];
}

// Helper functions for getting user-specific IDs
function getPlayerId($user_id) {
    global $conn;
    $stmt = $conn->prepare("SELECT uid FROM players WHERE uid = ?");
    if ($stmt) {
        $stmt->bind_param('i', $user_id);
        $stmt->execute();
        $result = $stmt->get_result();
        if ($row = $result->fetch_assoc()) {
            return $row['uid'];
        }
    }
    return null;
}

function getPlayerTeamId($player_id) {
    global $conn;
    $stmt = $conn->prepare("SELECT teamID FROM players WHERE uid = ?");
    if ($stmt) {
        $stmt->bind_param('i', $player_id);
        $stmt->execute();
        $result = $stmt->get_result();
        if ($row = $result->fetch_assoc()) {
            return $row['teamID'];
        }
    }
    return null;
}

function getCoachTeamId($user_id) {
    global $conn;
    $stmt = $conn->prepare("SELECT teamID FROM trainingManagement WHERE uid = ? AND jobTitle = 'coach'");
    if ($stmt) {
        $stmt->bind_param('i', $user_id);
        $stmt->execute();
        $result = $stmt->get_result();
        if ($row = $result->fetch_assoc()) {
            return $row['teamID'];
        }
    }
    return null;
}

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sports Management Dashboard</title>
    <meta name="csrf-token" content="<?php echo htmlspecialchars($_SESSION['csrf_token'], ENT_QUOTES, 'UTF-8'); ?>">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: #333;
        }
        
        .dashboard-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .header {
            background: rgba(255, 255, 255, 0.95);
            padding: 20px;
            border-radius: 15px;
            margin-bottom: 30px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            backdrop-filter: blur(10px);
        }
        
        .header h1 {
            color: #4a5568;
            margin-bottom: 10px;
        }
        
        .user-info {
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
        }
        
        .user-details {
            display: flex;
            align-items: center;
            gap: 15px;
        }
        
        .role-badge {
            background: #4299e1;
            color: white;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 0.9em;
            font-weight: 500;
        }
        
        .logout-btn {
            background: #e53e3e;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            text-decoration: none;
            font-weight: 500;
            transition: background 0.3s;
        }
        
        .logout-btn:hover {
            background: #c53030;
        }
        
        .dashboard-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
            gap: 30px;
            margin-bottom: 30px;
        }
        
        .module-card {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 15px;
            padding: 25px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            backdrop-filter: blur(10px);
        }
        
        .module-card h2 {
            color: #2d3748;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .module-icon {
            width: 24px;
            height: 24px;
            background: #4299e1;
            border-radius: 50%;
            display: inline-block;
        }
        
        .quick-actions {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
            flex-wrap: wrap;
        }
        
        .action-btn {
            background: #4299e1;
            color: white;
            padding: 8px 16px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            text-decoration: none;
            font-size: 0.9em;
            transition: background 0.3s;
        }
        
        .action-btn:hover {
            background: #3182ce;
        }
        
        .action-btn.secondary {
            background: #718096;
        }
        
        .action-btn.secondary:hover {
            background: #4a5568;
        }
        
        .data-list {
            max-height: 300px;
            overflow-y: auto;
        }
        
        .data-item {
            padding: 12px;
            border-bottom: 1px solid #e2e8f0;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .data-item:last-child {
            border-bottom: none;
        }
        
        .item-title {
            font-weight: 500;
            color: #2d3748;
        }
        
        .item-meta {
            font-size: 0.9em;
            color: #718096;
        }
        
        .status-badge {
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 0.8em;
            font-weight: 500;
        }
        
        .status-present {
            background: #c6f6d5;
            color: #22543d;
        }
        
        .status-absent {
            background: #fed7d7;
            color: #742a2a;
        }
        
        .status-pending {
            background: #feebc8;
            color: #7b341e;
        }
        
        .no-data {
            text-align: center;
            color: #718096;
            padding: 40px 20px;
        }
        
        @media (max-width: 768px) {
            .dashboard-grid {
                grid-template-columns: 1fr;
            }
            
            .user-info {
                flex-direction: column;
                gap: 15px;
                align-items: flex-start;
            }
            
            .quick-actions {
                justify-content: center;
            }
        }
    </style>
</head>
<body>
    <div class="dashboard-container">
        <div class="header">
            <h1>Sports Management Dashboard</h1>
            <div class="user-info">
                <div class="user-details">
                    <span>Welcome, <strong>User #<?php echo htmlspecialchars($user_id, ENT_QUOTES, 'UTF-8'); ?></strong></span>
                    <span class="role-badge"><?php echo htmlspecialchars($dashboardData['user']['role_display'], ENT_QUOTES, 'UTF-8'); ?></span>
                </div>
                <a href="logout.php" class="logout-btn">Logout</a>
            </div>
        </div>
        
        <div class="dashboard-grid">
            <!-- Schedule Module -->
            <div class="module-card">
                <h2><span class="module-icon"></span>Schedule Management</h2>
                
                <div class="quick-actions">
                    <?php if ($dashboardData['permissions']['create_schedule'] ?? false): ?>
                        <a href="editSchedule.php" class="action-btn">Create Event</a>
                    <?php endif; ?>
                    <a href="viewSchedule.php" class="action-btn secondary">View Schedule</a>
                </div>
                
                <div class="data-list">
                    <?php if (!empty($dashboardData['schedule'])): ?>
                        <?php foreach (array_slice($dashboardData['schedule'], 0, 5) as $event): ?>
                            <div class="data-item">
                                <div>
                                    <div class="item-title"><?php echo htmlspecialchars($event['title'], ENT_QUOTES, 'UTF-8'); ?></div>
                                    <div class="item-meta">
                                        <?php echo htmlspecialchars($event['eventDate'], ENT_QUOTES, 'UTF-8'); ?> 
                                        at <?php echo htmlspecialchars($event['startTime'], ENT_QUOTES, 'UTF-8'); ?>
                                    </div>
                                </div>
                                <div class="item-meta"><?php echo htmlspecialchars($event['eventType'], ENT_QUOTES, 'UTF-8'); ?></div>
                            </div>
                        <?php endforeach; ?>
                    <?php else: ?>
                        <div class="no-data">No upcoming events</div>
                    <?php endif; ?>
                </div>
            </div>
            
            <!-- Attendance Module -->
            <div class="module-card">
                <h2><span class="module-icon"></span>Attendance Management</h2>
                
                <div class="quick-actions">
                    <?php if ($dashboardData['permissions']['mark_attendance'] ?? false): ?>
                        <a href="attend.php" class="action-btn">Mark Attendance</a>
                    <?php endif; ?>
                    <?php if ($dashboardData['permissions']['view_attendance_reports'] ?? false): ?>
                        <a href="attendanceReport.php" class="action-btn secondary">View Reports</a>
                    <?php endif; ?>
                </div>
                
                <div class="data-list">
                    <?php if (!empty($dashboardData['attendance']['data'])): ?>
                        <?php foreach (array_slice($dashboardData['attendance']['data'], 0, 5) as $record): ?>
                            <div class="data-item">
                                <div>
                                    <div class="item-title"><?php echo htmlspecialchars($record['fullName'] ?? 'Unknown', ENT_QUOTES, 'UTF-8'); ?></div>
                                    <div class="item-meta">
                                        <?php echo htmlspecialchars($record['title'] ?? 'Event', ENT_QUOTES, 'UTF-8'); ?> - 
                                        <?php echo htmlspecialchars($record['attendance_date'], ENT_QUOTES, 'UTF-8'); ?>
                                    </div>
                                </div>
                                <span class="status-badge status-<?php echo strtolower($record['status']); ?>">
                                    <?php echo htmlspecialchars(ucfirst($record['status']), ENT_QUOTES, 'UTF-8'); ?>
                                </span>
                            </div>
                        <?php endforeach; ?>
                    <?php else: ?>
                        <div class="no-data">No attendance records</div>
                    <?php endif; ?>
                </div>
            </div>
        </div>
        
        <?php if ($role === 'manager'): ?>
        <div class="module-card">
            <h2><span class="module-icon"></span>Management Tools</h2>
            <div class="quick-actions">
                <a href="userManagement.php" class="action-btn">Manage Users</a>
                <a href="teamManagement.php" class="action-btn">Manage Teams</a>
                <a href="reports.php" class="action-btn secondary">View Reports</a>
                <a href="settings.php" class="action-btn secondary">System Settings</a>
            </div>
        </div>
        <?php endif; ?>
    </div>
    
    <script>
        // Add CSRF token to all forms
        document.addEventListener('DOMContentLoaded', function() {
            const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
            
            // Add CSRF token to all forms
            const forms = document.querySelectorAll('form');
            forms.forEach(form => {
                if (!form.querySelector('input[name="csrf_token"]')) {
                    const csrfInput = document.createElement('input');
                    csrfInput.type = 'hidden';
                    csrfInput.name = 'csrf_token';
                    csrfInput.value = csrfToken;
                    form.appendChild(csrfInput);
                }
            });
            
            // Auto-refresh dashboard data every 5 minutes
            setInterval(() => {
                location.reload();
            }, 300000);
        });
    </script>
</body>
</html>
