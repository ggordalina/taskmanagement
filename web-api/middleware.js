const { getFormatedResponseBody, mapApplicationErrorToHttpStatusCode } = require('../utils/httpUtils');

const middleware = (userService) => {
    if (!userService) {
        throw new Error('user service cannot be empty.');
    }

    const verifyEmployee = async (request, response, next) => {
        const employeeId = request.query?.employeeId;

        if (!employeeId) {
            response.status(400).send(getFormatedResponseBody('employeeId cannot be empty', null));
            return;
        }

        try {
            const [error, currentUser] = await userService.get(employeeId);
            if (error) {
                response
                    .status(mapApplicationErrorToHttpStatusCode(error.exception))
                    .send(getFormatedResponseBody(error.content, null));
                return;
            }
            
            request.currentUser = currentUser;
            next();
        } catch (error) {
            response.status(500).send(getFormatedResponseBody(error, null));
        }
    };

    return { verifyEmployee };
}

module.exports = middleware;