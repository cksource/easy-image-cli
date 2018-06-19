/*
 Copyright (c) 2016-2018, CKSource - Frederico Knabben. All rights reserved.
 */

'use strict';

const RequestHelpers = require( './requesthelpers' );

const jwt = require( 'jsonwebtoken' );

/**
 * Methods used to authenticate user.
 */
class AuthHelpers {
	/**
	 * @param {String} [environmentId]
	 * @param {String} [accessKey]
	 * @param {String} [tokenUrl]
	 * @returns {Promise.<String>}
	 */
	static async createToken( environmentId, accessKey, tokenUrl ) {
		if ( accessKey ) {
			return jwt.sign( { iss: environmentId }, accessKey, { algorithm: 'HS256' } )
		}

		return await this._getTokenFromTokenUrl( tokenUrl );
	}

	/**
	 * Sends request and returns token.
	 *
	 * @param {String} tokenUrl
	 * @return {Promise.<String>}
	 * @private
	 */
	static async _getTokenFromTokenUrl( tokenUrl ) {
		let { data, statusCode } = await RequestHelpers.get( tokenUrl, {} );

		if ( statusCode >= 400 && statusCode < 500 ) {
			const response = JSON.parse( data );

			throw new Error( `Fetching token from url error: "${response.message}"` );
		}

		if ( statusCode >= 500 ) {
			throw new Error( 'Token URL is invalid.' );
		}

		return data.toString();
	}
}

module.exports = AuthHelpers;
