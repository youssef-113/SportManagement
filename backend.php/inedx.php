<?php
// File: api/index.php
require_once '../User.php';
require_once '../ActivityLogger.php';
require_once '../vendor/autoload.php'; // For JWT library

// Handle CORS
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Get request method and URI
$method = $_SERVER['REQUEST_METHOD'];
$requestUri = $_SERVER['REQUEST_URI'];
$endpoint = parse_url($requestUri, PHP_URL_PATH);

// Remove base path if needed
$basePath = '/api';
if (strpos($endpoint, $basePath) === 0) {
    $endpoint = substr($endpoint, strlen($basePath));
}

// Get request data
$requestData = json_decode(file_get_contents('php://input'), true);

// Initialize classes
$user = new User();
$activityLogger = new ActivityLogger();

// Authenticate requests (except login)
$authToken = null;
if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
    $authToken = str_replace('Bearer ', '', $_SERVER['HTTP_AUTHORIZATION']);
}

// Route requests
try {
    switch ($endpoint) {
        case '/login':
            if ($method === 'POST') {
                $email = $requestData['email'] ?? '';
                $password = $requestData['password'] ?? '';
                
                $authResult = $user->authenticate($email, $password);
                
                if ($authResult) {
                    // Log login activity
                    $activityLogger->logActivity($authResult['user']['uid'], 'login', 'User logged in');
                    
                    echo json_encode([
                        'success' => true,
                        'user' => $authResult['user'],
                        'token' => $authResult['token']
                    ]);
                } else {
                    http_response_code(401);
                    echo json_encode(['success' => false, 'message' => 'Invalid credentials']);
                }
            } else {
                http_response_code(405);
                echo json_encode(['success' => false, 'message' => 'Method not allowed']);
            }
            break;
            
        case '/user/profile':
            if ($authToken) {
                $decoded = $user->validateToken($authToken);
                
                if (!$decoded) {
                    http_response_code(401);
                    echo json_encode(['success' => false, 'message' => 'Invalid token']);
                    exit;
                }
                
                $userId = $decoded['sub'];
                
                if ($method === 'GET') {
                    $profile = $user->getUserProfile($userId);
                    
                    if ($profile) {
                        echo json_encode(['success' => true, 'profile' => $profile]);
                    } else {
                        http_response_code(404);
                        echo json_encode(['success' => false, 'message' => 'User not found']);
                    }
                } elseif ($method === 'PUT') {
                    $success = $user->updateUserProfile($userId, $requestData);
                    
                    if ($success) {
                        // Log profile update
                        $activityLogger->logActivity($userId, 'profile_update', 'Profile information updated');
                        
                        echo json_encode(['success' => true, 'message' => 'Profile updated successfully']);
                    } else {
                        http_response_code(400);
                        echo json_encode(['success' => false, 'message' => 'Failed to update profile']);
                    }
                } else {
                    http_response_code(405);
                    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
                }
            } else {
                http_response_code(401);
                echo json_encode(['success' => false, 'message' => 'Authorization required']);
            }
            break;
            
        case '/user/change-password':
            if ($authToken) {
                $decoded = $user->validateToken($authToken);
                
                if (!$decoded) {
                    http_response_code(401);
                    echo json_encode(['success' => false, 'message' => 'Invalid token']);
                    exit;
                }
                
                $userId = $decoded['sub'];
                
                if ($method === 'POST') {
                    $currentPassword = $requestData['current_password'] ?? '';
                    $newPassword = $requestData['new_password'] ?? '';
                    
                    $success = $user->changePassword($userId, $currentPassword, $newPassword);
                    
                    if ($success) {
                        // Log password change
                        $activityLogger->logActivity($userId, 'password_change', 'Password updated');
                        
                        echo json_encode(['success' => true, 'message' => 'Password changed successfully']);
                    } else {
                        http_response_code(400);
                        echo json_encode(['success' => false, 'message' => 'Failed to change password']);
                    }
                } else {
                    http_response_code(405);
                    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
                }
            } else {
                http_response_code(401);
                echo json_encode(['success' => false, 'message' => 'Authorization required']);
            }
            break;
            
        case '/user/avatar':
            if ($authToken) {
                $decoded = $user->validateToken($authToken);
                
                if (!$decoded) {
                    http_response_code(401);
                    echo json_encode(['success' => false, 'message' => 'Invalid token']);
                    exit;
                }
                
                $userId = $decoded['sub'];
                
                if ($method === 'POST') {
                    // Handle file upload
                    if (isset($_FILES['avatar']) && $_FILES['avatar']['error'] === UPLOAD_ERR_OK) {
                        $uploadDir = '../uploads/avatars/';
                        $fileName = $userId . '_' . time() . '_' . basename($_FILES['avatar']['name']);
                        $targetPath = $uploadDir . $fileName;
                        
                        // Create directory if not exists
                        if (!file_exists($uploadDir)) {
                            mkdir($uploadDir, 0777, true);
                        }
                        
                        // Move uploaded file
                        if (move_uploaded_file($_FILES['avatar']['tmp_name'], $targetPath)) {
                            $success = $user->updateAvatar($userId, $targetPath);
                            
                            if ($success) {
                                // Log avatar update
                                $activityLogger->logActivity($userId, 'avatar_upload', 'Profile picture updated');
                                
                                echo json_encode([
                                    'success' => true,
                                    'message' => 'Avatar uploaded successfully',
                                    'avatar_url' => $targetPath
                                ]);
                            } else {
                                unlink($targetPath); // Remove uploaded file
                                http_response_code(500);
                                echo json_encode(['success' => false, 'message' => 'Failed to update avatar in database']);
                            }
                        } else {
                            http_response_code(500);
                            echo json_encode(['success' => false, 'message' => 'Failed to upload file']);
                        }
                    } else {
                        http_response_code(400);
                        echo json_encode(['success' => false, 'message' => 'No file uploaded or upload error']);
                    }
                } else {
                    http_response_code(405);
                    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
                }
            } else {
                http_response_code(401);
                echo json_encode(['success' => false, 'message' => 'Authorization required']);
            }
            break;
            
        case '/user/activity':
            if ($authToken) {
                $decoded = $user->validateToken($authToken);
                
                if (!$decoded) {
                    http_response_code(401);
                    echo json_encode(['success' => false, 'message' => 'Invalid token']);
                    exit;
                }
                
                $userId = $decoded['sub'];
                
                if ($method === 'GET') {
                    $activities = $user->getActivityLog($userId);
                    echo json_encode(['success' => true, 'activities' => $activities]);
                } else {
                    http_response_code(405);
                    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
                }
            } else {
                http_response_code(401);
                echo json_encode(['success' => false, 'message' => 'Authorization required']);
            }
            break;
            
        case '/user/sessions/terminate-all':
            if ($authToken) {
                $decoded = $user->validateToken($authToken);
                
                if (!$decoded) {
                    http_response_code(401);
                    echo json_encode(['success' => false, 'message' => 'Invalid token']);
                    exit;
                }
                
                $userId = $decoded['sub'];
                
                if ($method === 'POST') {
                    $success = $user->terminateAllSessions($userId);
                    
                    if ($success) {
                        // Log session termination
                        $activityLogger->logActivity($userId, 'session_termination', 'All other sessions terminated');
                        
                        echo json_encode(['success' => true, 'message' => 'All other sessions terminated']);
                    } else {
                        http_response_code(500);
                        echo json_encode(['success' => false, 'message' => 'Failed to terminate sessions']);
                    }
                } else {
                    http_response_code(405);
                    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
                }
            } else {
                http_response_code(401);
                echo json_encode(['success' => false, 'message' => 'Authorization required']);
            }
            break;
            
        case '/user/delete':
            if ($authToken) {
                $decoded = $user->validateToken($authToken);
                
                if (!$decoded) {
                    http_response_code(401);
                    echo json_encode(['success' => false, 'message' => 'Invalid token']);
                    exit;
                }
                
                $userId = $decoded['sub'];
                $confirmation = $requestData['confirmation'] ?? '';
                
                if ($method === 'POST') {
                    if ($confirmation === 'DELETE') {
                        $success = $user->deleteAccount($userId);
                        
                        if ($success) {
                            echo json_encode(['success' => true, 'message' => 'Account deleted successfully']);
                        } else {
                            http_response_code(500);
                            echo json_encode(['success' => false, 'message' => 'Failed to delete account']);
                        }
                    } else {
                        http_response_code(400);
                        echo json_encode(['success' => false, 'message' => 'Confirmation text is incorrect']);
                    }
                } else {
                    http_response_code(405);
                    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
                }
            } else {
                http_response_code(401);
                echo json_encode(['success' => false, 'message' => 'Authorization required']);
            }
            break;
            
        default:
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Endpoint not found']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Internal server error',
        'error' => $e->getMessage()
    ]);
}
?>