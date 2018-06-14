/*
 Copyright (c) 2016-2018, CKSource - Frederico Knabben. All rights reserved.
 */

'use strict';

const FormData = require( 'form-data' );
const fs = require( 'fs' );
const https = require( 'https' );
const URL = require( 'url' );

/**
 * Methods which allows to make http requests.
 */
class RequestHelpers {
    /**
     * Creates GET request.
     *
     * @param {String} url
     * @param {Object} config
     * @param {String} config.authorization
     * @returns {Promise.<{statusCode: Number, data: Buffer}>}
     */
    static async get( url, config ) {
        const headers = {};

        if ( config.authorization ) {
            headers.Authorization = config.authorization;
        }

        const options = _createOptions( url, 'GET', headers );

        return await new Promise( resolve => {
            https.request( options, response => {
                const chunks = [];

                response.on( 'data', chunk => chunks.push( chunk ) );
                response.on( 'end', () => resolve( {
                    statusCode: response.statusCode,
                    data: Buffer.concat( chunks )
                } ) );
            } ).end();
        } );
    }

    /**
     * Creates POST request with file.
     *
     * @param {String} url
     * @param {Object} config
     * @param {String} config.fileName
     * @param {String} config.authorization
     * @param {Object} config.body
     * @returns {Promise.<{statusCode: Number, data: Buffer}>}
     */
    static async post( url, config ) {
        let headers = {};
        let form;
        if ( config.fileName ) {
            form = new FormData();
            form.append( 'file', fs.createReadStream( config.fileName ) );
            headers = form.getHeaders();
        }

        if ( config.authorization ) {
            headers.Authorization = config.authorization;
        }

        const options = _createOptions( url, 'POST', headers, config.body );

        return await new Promise( resolve => {
            const request = https.request( options, response => {
                const chunks = [];

                response.on( 'data', chunk => chunks.push( chunk ) );
                response.on( 'end', () => resolve( {
                    statusCode: response.statusCode,
                    data: Buffer.concat( chunks )
                } ) );
            } );

            if ( config.body ) {
                request.write( JSON.stringify( config.body ) );
            }

            if ( form ) {
                form.pipe( request );
            } else {
                request.end();
            }
        } );
    }
}

module.exports = RequestHelpers;

/**
 * @param {String} urlString
 * @param {String} method
 * @param {Object} headers
 * @param {Object} [body=null]
 * @private
 */
function _createOptions( urlString, method, headers, body = null ) {
    const url = URL.parse( urlString );
    const port = url.port || url.protocol === 'https:' ? 443 : 80;

    return {
        host: url.host,
        port,
        path: url.path,
        method,
        headers,
        rejectUnauthorized: false
    };
}
