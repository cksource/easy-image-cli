/*
 Copyright (c) 2016-2018, CKSource - Frederico Knabben. All rights reserved.
 */

'use strict';

const fs = require('fs');
const Path = require('path');
const colors = require('colors');

const AuthHelpers = require('./../helpers/authhelpers');
const RequestHelpers = require('./../helpers/requesthelpers');

const ALLOWED_IMAGES_FORMATS = ['png', 'jpeg', 'jpg', 'bmp', 'tiff', 'webp', 'gif'];

/**
 * CLI method which allows to upload images to easy-image
 */
class UploadCommand {
    /**
     * Processes cli command.
     *
     * @param {CMD} cmd
     * @return {Promise}
     */
    static async process(cmd) {
        const {path, environment, key, uploadUrl, tokenUrl} = cmd;

        if (!fs.existsSync(path)) {
            _printError('Path doesn\'t exist.');

            return null;
        }

        if (!uploadUrl) {
            _printError('Upload url must be provided.');

            return null;
        }

        if (!tokenUrl && !key) {
            _printError('Token or accessKey must be provided.');

            return null;
        }

        if (!tokenUrl && key && !environment) {
            _printError('Environment must be provided.');

            return null;
        }

        const token = await AuthHelpers.createToken(environment, key, tokenUrl);

        let result = {};

        if (fs.lstatSync(path).isFile()) {
            try {
                result[path] = await UploadCommand._processFile(path, token, uploadUrl);
            } catch (error) {
                _printError(`An external error occurred: ${ error.message }`);

                return null;
            }
        }

        if (fs.lstatSync(path).isDirectory()) {
            try {
                result = await UploadCommand._processDirectory(path, token, uploadUrl);
            } catch (error) {
                _printError(`An error occurred: ${ error.message }`);

                return null;
            }
        }

        return _printDataToStdOut(result);
    }

    /**
     * Sends single file to easy image.
     *
     * @param {String} filePath
     * @param {String} token
     * @param {String} uploadUrl
     * @return {Promise.<Object>}
     * @private
     */
    static async _processFile(filePath, token, uploadUrl) {
        const {data, statusCode} = await RequestHelpers.post(uploadUrl, {fileName: filePath, authorization: token});

        if (statusCode >= 400) {
            const error = JSON.parse(data.toString());
            throw new Error(error.message);
        }

        return JSON.parse(data.toString());
    }

    /**
     * Sends all images from directory and subdirectories to easy image.
     *
     * @param {String} directoryPath
     * @param {String} token
     * @param {String} uploadUrl
     * @return {Promise.<Object>}
     * @private
     */
    static async _processDirectory(directoryPath, token, uploadUrl) {
        const path = `${ Path.normalize(directoryPath) }/`;

        const files = [];

        _scanDirectorySync(path, files);

        const result = {};

        for (const filePath of files) {
            result[filePath] = await this._processFile(filePath, token, uploadUrl);
        }

        return result;
    }
}

module.exports = UploadCommand.process;

/**
 * Returns list of all images in directory and subdirectories
 *
 * @param {String} path
 * @param {Array.<String>} [fileList=[]]
 * @return {Array.<String>}
 * @private
 */
function _scanDirectorySync(path, fileList = []) {
    for (const file of fs.readdirSync(path)) {
        if (file.startsWith('.')) {
            continue;
        }

        const resolvedFilePath = Path.join(path, file);

        if (fs.statSync(resolvedFilePath).isDirectory()) {
            fileList = _scanDirectorySync(resolvedFilePath, fileList);
        } else if (_validateImageFormat(resolvedFilePath)) {
            fileList.push(resolvedFilePath);
        }
    }

    return fileList;
}

/**
 * Returns true if extension of file is supported by easy image and false if not.
 *
 * @param {String} imagePath
 * @return {Boolean}
 * @private
 */
function _validateImageFormat(imagePath) {
    const file = Path.parse(imagePath);

    if (!ALLOWED_IMAGES_FORMATS.includes(file.ext.toLowerCase().replace('.', ''))) {
        process.stderr.write(colors.yellow(`File "${ file.base }" was skipped because format "${ file.ext }" is not supported.`));

        return false;
    }

    return true;
}

/**
 * Prints object to stdout.
 *
 * @param {Object} data
 * @private
 */
function _printDataToStdOut(data) {
    process.stdout.write( JSON.stringify(data, null, '\t') + '\n');
}

/**
 * Prints error in console.
 *
 * @param {String} message
 * @private
 */
function _printError(message) {
    process.stderr.write(colors.red(message));
}
