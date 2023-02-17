/* 1 - UserRole Table */
CREATE TABLE `UserRole` (
    `Id` BINARY(16) NOT NULL DEFAULT (UUID_TO_BIN(UUID(), TRUE)),
    `Description` VARCHAR(100) NOT NULL,
    CONSTRAINT `PK_UserRole_Id` PRIMARY KEY (`Id`)
) CHARACTER SET latin1;

    /* 1.1 - Seed UserRole Table */
INSERT INTO `UserRole` (`Description`) VALUES
('Technician'),
('Manager');

/* 2 - User Table */
CREATE TABLE `User` (
    `Id` BINARY(16) NOT NULL DEFAULT (UUID_TO_BIN(UUID(), TRUE)),
    `EmployeeNumber` INT(6) NOT NULL,
    `Name` VARCHAR(255) NOT NULL,
    `UserRoleId` BINARY(16) NOT NULL,
    CONSTRAINT `PK_User_Id` PRIMARY KEY (`Id`),
    CONSTRAINT `UQ_User_EmployeeNumber` UNIQUE (`EmployeeNumber`),
    CONSTRAINT `FK_User_Id_UserRole_Id` FOREIGN KEY (`UserRoleId`) REFERENCES `UserRole` (`Id`)
) CHARACTER SET latin1;

    /* 2.1 - Seed User Table */
INSERT INTO `User` (`EmployeeNumber`, `Name`, `UserRoleId`) VALUES
(240914, 'Clive Olive', (SELECT `Id` FROM `UserRole` WHERE `Description` = 'Technician')),
(679875, 'Patricia Bread', (SELECT `Id` FROM `UserRole` WHERE `Description` = 'Manager'));

/* Task Table */
CREATE TABLE `Task` (
    `Id` BINARY(16) NOT NULL DEFAULT (UUID_TO_BIN(UUID(), TRUE)),
    `Code` VARCHAR(16) NOT NULL,
    `Summary` VARCHAR(2500) NULL,
    `ClosedDate` TIMESTAMP NULL,
    `HasSensitiveData` BOOLEAN NOT NULL DEFAULT 0,
    `UserId` BINARY(16) NOT NULL,
    CONSTRAINT `PK_Task_Id` PRIMARY KEY (`Id`),
    CONSTRAINT `UQ_Task_Code` UNIQUE (`Code`),
    CONSTRAINT `FK_Task_UserId_User_Id` FOREIGN KEY (`UserId`) REFERENCES `User` (`Id`)
) CHARACTER SET latin1;

INSERT INTO `Task` (`Code`, `Summary`, `HasSensitiveData`, `UserId`) VALUES
('TR-1243', 'Take out the trash', 0, (SELECT `Id` FROM `User` WHERE `EmployeeNumber` = 240914)),
('HS-7812', 'Clean the gutter', 0, (SELECT `Id` FROM `User` WHERE `EmployeeNumber` = 240914)),
('CC-8899', 'Read comics', 1, (SELECT `Id` FROM `User` WHERE `EmployeeNumber` = 240914));