/*
 Copyright (c) 2016-2018, CKSource - Frederico Knabben. All rights reserved.
 */

'use strict';

const colors = require( 'colors' );

const app = require( 'commander' );

const UploadCommand = require( './commands/upload' );

app.command( 'upload' )
	.description( 'Uploads files to system' )
	.option( '-p, --path <filePath>', 'Path to file or directory' )
	.option( '-e, --environment <environment>', 'Environment id' )
	.option( '-k, --key <key>', 'Access key' )
	.option( '-u, --uploadUrl <url>', 'Upload URL' )
	.option( '-t, --tokenUrl <url>', 'Token URL' )
	.option( '-o, --output <path>', 'Path to the file where result should be saved' )
	.action( async cmd => {
		try {
			const upload = new UploadCommand( cmd );

			const result = await upload.execute();
			_printDataToStdOut( result, '========= Addresses ========= \n' );
		} catch ( error ) {
			_printError( error.message );
		}
	} );

app.action( () => console.error(
	colors.red( '----------\nEasyImage CLI\n----------\nCommand doesn\'t exist. \nCheck --help for list of commands.\n' )
) );

app.parse( process.argv );

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
	process.stdout.write( `${colors.green( description )}${JSON.stringify( data, null, '\t' )}${'\n'}` );
}
