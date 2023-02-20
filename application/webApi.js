const connection = require('./utils/connection');
const logger = require('./utils/logger');
const TaskRepository = require('./respositories/taskRespository');
const UserRepository = require('./respositories/userRepository');
const UserRoleRepository = require('./respositories/userRoleRepository');
const TaskService = require('./services/taskService');
const UserService = require('./services/userService');
const Middleware = require('./middlewares/middleware');
const TasksApi = require('./controllers/tasksApi');

const webApi = (app) => {
    const log = logger();
    const taskService = TaskService(TaskRepository(connection), log);
    const userService = UserService(UserRepository(connection), UserRoleRepository(connection), log);
    const middleware = Middleware(userService);
    const tasksApi = TasksApi(taskService);

    // TODO: update log to receive context and update all places to use log

    app.use(middleware.verifyEmployee);

    app.get('/', tasksApi.list);
    app.get('/:code', tasksApi.get);
    app.post('/', tasksApi.post);
    app.patch('/:code', tasksApi.patch);
    app.patch('/:code/close', tasksApi.patchCloseDate);
    app.delete('/:code', tasksApi.remove);
};

module.exports = webApi;