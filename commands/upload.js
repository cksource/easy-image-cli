/*
 Copyright (c) 2016-2018, CKSource - Frederico Knabben. All rights reserved.
 */

'use strict';

const CliProgress = require( 'cli-progress' );

const fs = require( 'fs' );
const Path = require( 'path' );

const AuthHelpers = require( './../helpers/authhelpers' );
const RequestHelpers = require( './../helpers/requesthelpers' );

const ALLOWED_IMAGES_FORMATS = [ 'png', 'jpeg', 'jpg', 'bmp', 'tiff', 'webp', 'gif' ];

/**
 * CLI method which allows to upload images to easy-image
 */
class UploadCommand {
	/**
	 * @param {Object} cmd
	 * @param {String} cmd.path
	 * @param {String} cmd.environment
	 * @param {String} cmd.key
	 * @param {String} cmd.uploadUrl
	 * @param {String} cmd.tokenUrl
	 * @param {String} cmd.output
	 */
	constructor( cmd ) {
		const { path, environment, key, uploadUrl, tokenUrl, output } = cmd;

		/**
		 * @type {String}
		 * @private
		 */
		this._path = path;

		/**
		 * @type {String}
		 * @private
		 */
		this._uploadUrl = uploadUrl;

		/**
		 * @type {String}
		 * @private
		 */
		this._environment = environment;

		/**
		 * @type {String}
		 * @private
		 */
		this._accessKey = key;

		/**
		 * @type {String}
		 * @private
		 */
		this._tokenUrl = tokenUrl;

		/**
		 * @type {String}
		 * @private
		 */
		this._output = output;

		if ( !fs.existsSync( this._path ) ) {
			throw new Error( 'Path doesn\'t exist.' );
		}

		if ( !this._uploadUrl ) {
			throw new Error( 'Upload url must be provided.' );
		}

		if ( !this._tokenUrl && !this._accessKey ) {
			throw new Error( 'Token or accessKey must be provided.' );
		}

		if ( !this._tokenUrl && key && !this._environment ) {
			throw new Error( 'Environment must be provided.' );
		}
	}

	/**
	 * Generates list of files and uploads them to easy-image.
	 *
	 * @return {Promise.<Object>}
	 */
	async execute() {
		const token = await AuthHelpers.createToken( this._environment, this._accessKey, this._tokenUrl );

		let files = [];

		if ( fs.lstatSync( this._path ).isFile() ) {
			files.push( this._path );
		}

		if ( fs.lstatSync( this._path ).isDirectory() ) {
			files = _scanDirectorySync( this._path );
		}

		files = files.filter( file => {
			return _validateImageFormat( file );
		} );

		const result = {};

		const progress = new CliProgress.Bar( {}, CliProgress.Presets.shades_classic );

		progress.start( files.length, 0 );

		for ( let [ index, filePath ] of files.entries() ) {
			result[ filePath ] = await this._upload( filePath, token, this._uploadUrl );
			progress.update( index + 1 );
		}

		progress.stop();

		if ( this._output ) {
			_saveToJSONFile( result, this._output );
		}

		return result;
	}

	/**
	 * Uploads file to easy image.
	 *
	 * @param {String} filePath
	 * @param {String} token
	 * @param {String} uploadUrl
	 * @return {Promise.<Object>}
	 * @private
	 */
	async _upload( filePath, token, uploadUrl ) {
		const { data, statusCode } = await RequestHelpers.post( uploadUrl, { fileName: filePath, authorization: token } );

		if ( statusCode >= 400 ) {
			const error = JSON.parse( data.toString() );
			throw new Error( error.message );
		}

		return JSON.parse( data.toString() );
	}
}

module.exports = UploadCommand;

/**
 * Returns list of all images in directory and subdirectories
 *
 * @param {String} path
 * @param {Array.<String>} [fileList]
 * @return {Array.<String>}
 * @private
 */
function _scanDirectorySync( path, fileList = [] ) {
	path = `${ Path.normalize( path ) }/`;

	for ( const file of fs.readdirSync( path ) ) {
		if ( file.startsWith( '.' ) ) {
			continue;
		}

		const resolvedFilePath = Path.join( path, file );

		if ( fs.statSync( resolvedFilePath ).isDirectory() ) {
			fileList = _scanDirectorySync( resolvedFilePath, fileList );
		} else {
			fileList.push( resolvedFilePath );
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
function _validateImageFormat( imagePath ) {
	const file = Path.parse( imagePath );

	return ALLOWED_IMAGES_FORMATS.includes( file.ext.toLowerCase().replace( '.', '' ) );
}

function _saveToJSONFile( data, filePath ) {
	const string = JSON.stringify( data, null, '\t' );
	fs.writeFileSync( filePath, string, 'utf8' );
}
