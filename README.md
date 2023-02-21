# Task Management 
Are you looking for a tool that allows you to monitor your employees work? Well, install __Task Management__ on your machine and be a manager!    
Are you a employee and what to hide what you really do during working hours to your employer? This is just the app for you! Just flag your tasks with sensitive content and no one besides you can see it!

#

## Features
- List your - or your technicians - tasks
- Create a new task 
- Update your task, or just close it
- Delete other technicians' tasks

## Tech Stack
- Node
- ExpressJs
- MySQL
- MQTT (Mosquitto)
- Jest

## Requirements
- Node >=16.9.0

## How to run
1. Create your `.env` file with the following variables: (see below for example)
- `DATABASE_HOST`: Database host's location
- `DATABASE_PORT`: Database exposed port
- `DATABASE_ROOT_PASSWORD`: Database root password
- `DATABASE_USER`: Application user for database access
- `DATABASE_PASSWORD`: Application user's password
- `MQ_BROKER_USERNAME`: Message broker user
- `MQ_BROKER_PASSWORD`: Message brokser user's password  
```
DATABASE_HOST=mysql
DATABASE_PORT=3306
DATABASE_ROOT_PASSWORD=root
DATABASE_USER=sword
DATABASE_PASSWORD=health
MQ_BROKER_USERNAME=taskmanager
MQ_BROKER_PASSWORD=super_safe
```
2. Run `docker-compose up -d` to create the database and the application
3. Your application is ready on `http://127.0.0.1:3000`

### Notes:
- The above example of user/password credentials pair for the message broker is the one used in the file `/mosquitto/password.txt`. 

## Testing
Tests done with Jest.   
Just run `npm test`.

# Routes
- `GET /?employeeId={emploeeNumber}` - List tasks
- `GET /{task.code}?employeeId={emploeeNumber}` - Get Task
- `POST /?employeeId={emploeeNumber}` - Create Task
- `PATCH /{task.code}?employeeId={emploeeNumber}` - Update Task
- `PATCH /{task.code}/close?employeeId={emploeeNumber}` - Sets `task.closedDate¨
- `DELETE /{task.code}?employeeId={emploeeNumber}` - Delete Task

# Current DB migration file content
### Users
| Name           | Role    | Emploeey N#  |
|:---------------|:--------|-------------:|
| Wheely Cheese  | Manager | 952105       |
| Ms. Happen     | Manager | 679875       |
| Popeye Spinach | Tech    | 240914       |
| Brad Bread     | Tech    | 330142       |
| Post Alone     | Tech    | 854102       |

### Tasks
| Code | Summary | HasSensitiveData | Belongs to |
|:----|:----|:----|:----|
| HS-1243 | Take out the trash | False | Popeye Spinach |
| HS-7812 | Clean the gutter   | False | Popeye Spinach |
| HS-8452 | Mow the lawn       | True  | Popeye Spinach |
| CS-4582 | User is unable to save form because of a bug. A literal bug inside the computer. | False | Post Alone |
| CS-8452 | URGENT!!! FIX PRINTER!!! NOW!!! | False | Post Alone |
| TR-2021 | Sleep 10 hours | True  | Brad Bread |
| TR-8899 | Read comics    | False | Brad Bread |
