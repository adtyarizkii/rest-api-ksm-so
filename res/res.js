'use strict'

exports.ok = (values, status, res) => {
    const data = {
        'status': status,
        'values': values
    };
    res.json(data)
    res.end()
}