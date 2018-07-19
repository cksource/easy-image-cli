/*
 Copyright (c) 2016-2018, CKSource - Frederico Knabben. All rights reserved.
 */

'use strict';

const { Bar: ProgressBar, Presets: CliProgressPresets } = require( 'cli-progress' );

const fs = require( 'fs' );
const Path = require( 'path' );

const AuthHelpers = require( './../helpers/authhelpers' );
const RequestHelpers = require( './../helpers/requesthelpers' );

const ALLOWED_IMAGES_FORMATS = [ 'png', 'jpeg', 'jpg', 'bmp', 'tiff', 'webp', 'gif' ];
const MAX_IMAGE_SIZE = 100000000;

/**
 * CLI method which allows to upload images to the Easy Image service in the cloud.
 */
class UploadCommand {
	/**
	 * @param {String} path
	 * @param {String} uploadUrl
	 * @param {Object} args
	 * @param {String} args.environment
	 * @param {String} args.key
	 * @param {String} args.tokenUrl
	 * @param {String} args.output
	 */
	constructor( path, uploadUrl, args ) {
		const { environment, key, tokenUrl, output } = args;

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

		if ( !!this._path && !fs.existsSync( this._path ) ) {
			throw new Error( `The path doesn't exist: ${ this._path }` );
		}

		if ( !this._tokenUrl && !this._accessKey ) {
			throw new Error( `The Token URL or the combination of Environment ID and Secret key must be provided.` );
		}

		if ( !this._tokenUrl && this._accessKey && !this._environment ) {
			throw new Error( `The Environment ID must be provided.` );
		}
	}

	/**
	 * Generates the list of files and uploads them the Easy Image service in the cloud.
	 *
	 * @return {Promise.<Object>}
	 */
	async execute() {
		const token = await AuthHelpers.createToken( this._environment, this._accessKey, this._tokenUrl );

		const errors = [];
		let files = [];

		if ( fs.lstatSync( this._path ).isFile() ) {
			files.push( this._path );
		}

		if ( fs.lstatSync( this._path ).isDirectory() ) {
			files = _scanDirectorySync( this._path );
		}

		files = files.filter( file => {
			if ( _validateImage( file ) ) {
				return true;
			} else {
				errors.push( new Error( `Invalid file format or the file is too big: ${ file }` ) );

				return false;
			}
		} );

		const result = {};

		const progress = new ProgressBar( {}, CliProgressPresets.shades_classic );

		progress.start( files.length, 0 );

		for ( let [ index, filePath ] of files.entries() ) {
			try {
				result[ filePath ] = await this._upload( filePath, token, this._uploadUrl );
				progress.update( index + 1 );
			} catch ( error ) {
				errors.push( new Error( `${ error.message}: ${ filePath}` ) )
			}
		}

		progress.stop();

		if ( this._output ) {
			_saveToJSONFile( result, this._output );
		}

		return { result, errors };
	}

	/**
	 * Uploads file to the Easy Image service.
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
 * Returns the list of all images in directory and subdirectories
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
 * Returns true if the extension of a file is supported by the Easy Image service and the size of a file does not exceed service limits.
 *
 * @param {String} imagePath
 * @return {Boolean}
 * @private
 */
function _validateImage( imagePath ) {
	const file = Path.parse( imagePath );

	const { size: fileSize } = fs.statSync( imagePath );

	if ( fileSize > MAX_IMAGE_SIZE ) {
		return false;
	}

	return ALLOWED_IMAGES_FORMATS.includes( file.ext.toLowerCase().replace( '.', '' ) );
}

function _saveToJSONFile( data, filePath ) {
	const string = JSON.stringify( data, null, '\t' );
	fs.writeFileSync( filePath, string, 'utf8' );
}
