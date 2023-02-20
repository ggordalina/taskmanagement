/* 1 - UserRole Table */
CREATE TABLE UserRole (
    Id BINARY(16) NOT NULL DEFAULT (UUID_TO_BIN(UUID(), TRUE)),
    Description VARCHAR(100) NOT NULL,
    CONSTRAINT PK_UserRole_Id PRIMARY KEY (Id)
) CHARACTER SET latin1;

    /* 1.1 - Seed UserRole Table */
INSERT INTO UserRole (Description) VALUES
('Technician'),
('Manager');

/* 2 - User Table */
CREATE TABLE User (
    Id BINARY(16) NOT NULL DEFAULT (UUID_TO_BIN(UUID(), TRUE)),
    EmployeeNumber INT(6) NOT NULL,
    Name VARCHAR(255) NOT NULL,
    UserRoleId BINARY(16) NOT NULL,
    CONSTRAINT PK_User_Id PRIMARY KEY (Id),
    CONSTRAINT UQ_User_EmployeeNumber UNIQUE (EmployeeNumber),
    CONSTRAINT FK_User_Id_UserRole_Id FOREIGN KEY (UserRoleId) REFERENCES UserRole (Id)
) CHARACTER SET latin1;

    /* 2.1 - Seed User Table */
INSERT INTO User (EmployeeNumber, Name, UserRoleId) VALUES
(240914, 'Popeye Spinach', (SELECT Id FROM UserRole WHERE Description = 'Technician')),
(330142, 'Brad Bread', (SELECT Id FROM UserRole WHERE Description = 'Technician')),
(854102, 'Post Alone', (SELECT Id FROM UserRole WHERE Description = 'Technician')),
(679875, 'Ms. Happen', (SELECT Id FROM UserRole WHERE Description = 'Manager')),
(952105, 'Wheely Cheese', (SELECT Id FROM UserRole WHERE Description = 'Manager'));

/* 3 - Task Table */
CREATE TABLE Task (
    Id BINARY(16) NOT NULL DEFAULT (UUID_TO_BIN(UUID(), TRUE)),
    Code VARCHAR(16) NOT NULL,
    Summary VARCHAR(2500) NULL,
    ClosedDate TIMESTAMP NULL,
    HasSensitiveData BOOLEAN NOT NULL DEFAULT 0,
    UserId BINARY(16) NOT NULL,
    CONSTRAINT PK_Task_Id PRIMARY KEY (Id),
    CONSTRAINT UQ_Task_Code UNIQUE (Code),
    CONSTRAINT FK_Task_UserId_User_Id FOREIGN KEY (UserId) REFERENCES User (Id)
) CHARACTER SET latin1;

    /* 3.1 - Seed Task Table */
INSERT INTO Task (Code, Summary, HasSensitiveData, UserId) VALUES
('HS-1243', 'Take out the trash', 0, (SELECT Id FROM User WHERE EmployeeNumber = 240914)),
('HS-7812', 'Clean the gutter', 0, (SELECT Id FROM User WHERE EmployeeNumber = 240914)),
('HS-8452', 'Mow the lawn', 1, (SELECT Id FROM User WHERE EmployeeNumber = 240914)),
('CS-4582', 'User is unable to save form because of a bug. A literal bug inside the computer.', 0, (SELECT Id FROM User WHERE EmployeeNumber = 854102)),
('CS-8452', 'URGENT!!! FIX PRINTER!!! NOW!!!', 0, (SELECT Id FROM User WHERE EmployeeNumber = 854102)),
('TR-2021', 'Sleep 10 hours', 1, (SELECT Id FROM User WHERE EmployeeNumber = 330142)),
('TR-8899', 'Read comics', 0, (SELECT Id FROM User WHERE EmployeeNumber = 330142));