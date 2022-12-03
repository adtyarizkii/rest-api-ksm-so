'use strict'

const fs = require('fs')

function ControllerLoader() { }

ControllerLoader.loadToAppFromPath = function (app, controllerPath) {

    fs.readdirSync(controllerPath).forEach(function (objectName) {
        const objectPath = controllerPath + '/' + objectName;
        const objectStats = fs.lstatSync(objectPath);

        if (ControllerLoader._isSystemObject(objectName)) {
            return;
        }

        if (objectStats.isFile()) {
            require(objectPath)(app);
        } else if (objectStats.isDirectory()) {
            ControllerLoader.loadToAppFromPath(app, objectPath);
        }
    });
};

ControllerLoader._isSystemObject = function (objectName) {
    return objectName.indexOf('.') === 0;
};

module.exports = ControllerLoader;
