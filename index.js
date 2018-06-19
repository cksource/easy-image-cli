#!/usr/bin/env node

/*
 Copyright (c) 2016-2018, CKSource - Frederico Knabben. All rights reserved.
 */

'use strict';

const colors = require( 'colors' );

const app = require( 'commander' );

const UploadCommand = require( './commands/upload' );

app.command( 'upload <filePath> <uploadUrl>' )
	.description( 'Uploads files to system' )
	.option( '-e, --environment <environment>', 'Environment id' )
	.option( '-k, --key <key>', 'Access key' )
	.option( '-t, --tokenUrl <url>', 'Token URL' )
	.option( '-o, --output <path>', 'Path to the file where result should be saved' )
	.action( async ( filePath, uploadUrl, cmd ) => {
		try {
			const upload = new UploadCommand( filePath, uploadUrl, cmd );

			const { result, errors } = await upload.execute();
			_printDataToStdOut( result, '========= Addresses ========= \n' );

			for ( const error of errors ) {
				_printError( error.message );
			}
		} catch ( error ) {
			_printError( error.message );
		}
	} );

app.action( () => app.commands[ 0 ].help() );

app.parse( process.argv );

if ( !app.args.length ) {
	app.commands[ 0 ].help();
}

/**
 * Prints error in console.
 *
 * @param {String} message
 * @private
 */
function _printError( message ) {
	process.stderr.write( colors.red( message ) + '\n' );
}

/**
 * Prints object to stdout.
 *
 * @param {Object} data
 * @param {String} [description='']
 * @private
 */
function _printDataToStdOut( data, description = '' ) {
	process.stderr.write( colors.green( description ) );
	process.stdout.write( `${ JSON.stringify( data, null, '\t' ) }${'\n'}` );
}
