

-- USERS TABLE (centralized user table for all roles)
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
    role ENUM('player', 'trainingManagement', 'medicalStaff', 'coach', 'manager', 'admin') NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME DEFAULT NULL,
    status ENUM('Active', 'notActive') DEFAULT 'Active'
);

-- PLAYER TABLE
CREATE TABLE players (
    uid INT(11) AUTO_INCREMENT PRIMARY KEY,
    emergencyContact VARCHAR(20),
    playerHeight INT(11),
    playerWeight INT(11),
    sport ENUM('football', 'basketball', 'tennis', 'other') NOT NULL,
    teamID INT(11),
    position VARCHAR(100),
    joinDate DATE,
    contractStart DATE,
    contractEnd DATE,
    currStatus ENUM('active', 'injured', 'suspended', 'retired') DEFAULT 'active',
    pinnedComment TEXT,
    averageRating DECIMAL(3,2),
    FOREIGN KEY (uid) REFERENCES users(uid) ON DELETE CASCADE,
    FOREIGN KEY (teamID) REFERENCES teams(teamID) ON DELETE SET NULL
);

-- MEDICAL STAFF TABLE
CREATE TABLE medicalStaff (
    uid INT(11) AUTO_INCREMENT PRIMARY KEY,
    major VARCHAR(50),
    specialization VARCHAR(100),
    yearsOfExp INT,
);

-- TRAINING MANAGEMENT
CREATE TABLE trainingManagement (
    uid INT NOT NULL UNIQUE,
    jobDescription VARCHAR(50),
    jobTitle VARCHAR(50) NOT NULL,
    specialization VARCHAR(100),
    yearsOfExp INT
);

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

-- MEDICAL REPORTS
CREATE TABLE medicalReports (
    reportID INT PRIMARY KEY AUTO_INCREMENT,
    playerID INT NOT NULL,
    medicalStaffID INT,
    reportDate DATE NOT NULL,
    diagnosis TEXT,
    treatment TEXT,
    followUpDate DATE,
    followUpUpdate TEXT,
    doctorNotes TEXT,
    reportStatus ENUM('Pending', 'In Progress', 'Completed') DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- TEAMS
CREATE TABLE teams (
    teamID INT PRIMARY KEY AUTO_INCREMENT,
    teamName VARCHAR(100) NOT NULL,
    sport ENUM('Football', 'Basketball', 'Tennis', 'Other') NOT NULL,
    teamRank INT,
    coachID INT
);

-- TRAINING SESSIONS
CREATE TABLE trainingSession (
    sessionID INT PRIMARY KEY AUTO_INCREMENT,
    teamID INT NOT NULL,
    sport ENUM('Football', 'Basketball', 'Tennis', 'Other') NOT NULL,
    trainingDate DATE NOT NULL,
    trainingLocation VARCHAR(100),
    trainingDescription TEXT
);

-- DRILLS
CREATE TABLE drills (
    drillID INT PRIMARY KEY AUTO_INCREMENT,
    drillName VARCHAR(250),
    drillType VARCHAR(250),
    createdBy INT,
    drillDescription TEXT,
    notes TEXT,
    videoLink VARCHAR(250),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- TRAINING SESSION DRILLS
CREATE TABLE trainingSessionDrills (
    sessionID INT NOT NULL,
    drillID INT NOT NULL,
    PRIMARY KEY (sessionID, drillID)
);

-- USER ACTIVITY LOGS
CREATE TABLE userActivityLogs (
    logID INT PRIMARY KEY AUTO_INCREMENT,
    userID INT NOT NULL,
    userRole ENUM('player', 'medicalStaff', 'manager', 'coach', 'trainingManagement', 'admin') NOT NULL,
    actionType ENUM('PROFILE_VIEW', 'PROFILE_UPDATE', 'PASSWORD_CHANGE', 'LOGIN', 'LOGOUT') NOT NULL,
    actionDetails JSON,
    ipAddress VARCHAR(45) NOT NULL,
    userAgent VARCHAR(255),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SESSIONS
CREATE TABLE sessions (
    sessionID VARCHAR(128) PRIMARY KEY,
    uid INT NOT NULL,
    token VARCHAR(128) NOT NULL,
    expiresAt DATETIME NOT NULL,
    isActive TINYINT(1) DEFAULT 1,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- FEEDBACK
CREATE TABLE feedback (
    feedbackID INT PRIMARY KEY AUTO_INCREMENT,
    userID INT,
    feedback TEXT,
    rating DECIMAL(3, 2),
    email VARCHAR(100),
    phoneNumber VARCHAR(20)
);

-- ANNOUNCEMENTS
CREATE TABLE announcements (
    announcementID INT PRIMARY KEY AUTO_INCREMENT,
    createdBy INT,
    title VARCHAR(100) NOT NULL,
    targetAudience ENUM('Player','MedicalStaff','TrainingManager','BoardMember','All') NOT NULL,
    message TEXT,
    sport ENUM('Football', 'Basketball', 'Tennis', 'Other') NOT NULL,
    isImportant BOOLEAN DEFAULT FALSE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- CHATS
CREATE TABLE chats (
    chatID INT PRIMARY KEY AUTO_INCREMENT,
    senderID INT,
    receiverID INT,
    message TEXT,
    sentAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- NOTIFICATIONS
CREATE TABLE notifications (
    notificationID INT PRIMARY KEY AUTO_INCREMENT,
    userID INT,
    message TEXT,
    isRead BOOLEAN DEFAULT FALSE,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
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

Create TABLE  changeTraining (
    changeTrainingID INT PRIMARY KEY AUTO_INCREMENT,
    userID INT NOT NULL,
    trainingID INT NOT NULL,
    changeDate DATE NOT NULL,
    changeStatus ENUM('Pending', 'Approved', 'Rejected') NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE  editePlayer (
    userID INT NOT NULL,
    playerID INT NOT NULL,
    teamID INT NOT NULL,
    teamName Varchar(100) Not Null,
    editeDate DATE NOT NULL,
    editeStatus ENUM('Pending', 'Approved', 'Rejected') NOT NULL,
);
CREATE TABLE playerFeedback (
    FeedbackID INT Not NULL,
    playerID INT NOT NULL,
    comment TEXT,
    date DATE NOT NULL,
    rating DECIMAL(3, 2),
);

CREATE TABLE midecalCheckups (
    checkupID INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    playerID INT NOT NULL,
    doctorID INT NOT NULL,
    type ENUM('routine checkup', 'injury assessment', 'recovery evaluation') NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    duration INT(11) NOT NULL,
    location ENUM('clinic 1', 'clinic 2', 'clinic 3') NOT NULL,
    bloodPressure VARCHAR(10) DEFAULT NULL,
    heartRate INT(11) DEFAULT NULL,
    temperature FLOAT DEFAULT NULL,
    weight FLOAT DEFAULT NULL,
    chiefComplaint TEXT DEFAULT NULL,
    physicalFindings TEXT DEFAULT NULL,
    assessment TEXT DEFAULT NULL,
    recommendations TEXT DEFAULT NULL,
    notes TEXT DEFAULT NULL,
    status ENUM('scheduled', 'completed', 'canceled') DEFAULT 'scheduled',
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
);

-- ✅ Total Tables: 26
