const express = require('express');
const router = express.Router();

// Tasks routes
router.get('/:code?', (request, response) => {
    const employeeId = request.query.employeeId;

    if (employeeId == null || employeeId == undefined) {
        response.status(400).send({ error: "employeeId cannot be empty" })
    }

    const taskCode = request.params.code;

    response.send({
        "op": "GET",
        "params": {
            "employeeId": employeeId,
            "taskCode": taskCode ?? "empty"
        }
    });
});

router.post('/', (request, response) => {
    const employeeId = request.query.employeeId;

    if (employeeId == null || employeeId == undefined) {
        response.status(400).send({ error: "employeeId cannot be empty" })
    }

    const task = request.body;

    response.send({
        "op": "POST",
        "params": {
            "employeeId": employeeId,
            "body": task
        }
    });
});

router.patch('/:code', (request, response) => {
    const employeeId = request.query.employeeId;

    if (employeeId == null || employeeId == undefined) {
        response.status(400).send({ error: "employeeId cannot be empty" })
    }

    const taskCode = request.params.code;
    const taskToUpdate = request.body;

    response.send({
        "op": "PATCH",
        "params": {
            "employeeId": employeeId,
            "taskCode": taskCode,
            "body": taskToUpdate
        }
    });
});

router.delete("/:code", (request, response) => {
    const employeeId = request.query.employeeId;

    if (employeeId == null || employeeId == undefined) {
        response.status(400).send({ error: "employeeId cannot be empty" })
    }
    
    const taskCode = request.params.code;

    response.send({
        "op": "DELETE",
        "params": {
            "employeeId": employeeId,
            "taskCode": taskCode
        }
    });
});


module.exports = router;