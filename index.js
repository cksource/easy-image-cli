#!/usr/bin/env node

/*
 Copyright (c) 2016-2018, CKSource - Frederico Knabben. All rights reserved.
 */

'use strict';

const colors = require( 'colors' );

const app = require( 'commander' );

const UploadCommand = require( './commands/upload' );

app.command( 'upload <filePath> <uploadUrl>' )
	.description( `Uploads images from your drive to the Easy Image service.

  One of the following options must be provided:
    * Token URL
    * (or) Environment ID and Access Key.

  The correct values of Environment ID and Access Key can be found in the 
  CKEditor Ecosystem dashboard: https://dashboard.ckeditor.com. 
  As a token URL you may use the development token URL, also available in the dashboard.

  Examples:

  easy-image-cli upload ./images/ https://XXX.cke-cs.com/easyimage/upload/ -t http://example.com/token/ --output images.json

  OR

  easy-image-cli upload ./images/ https://XXX.cke-cs.com/easyimage/upload/ -e FsBgSO -k dGaXSA9uTlAs --output images.json` )
	.option( '-e, --environment <environment>', 'Environment ID' )
	.option( '-k, --key <key>', 'Secret key' )
	.option( '-t, --tokenUrl <url>', 'Token URL' )
	.option( '-o, --output <path>', 'Path to the file where result should be saved' )
	.action( async ( filePath, uploadUrl, cmd ) => {
		try {
			const upload = new UploadCommand( filePath, uploadUrl, cmd );

			const { result, errors } = await upload.execute();
			if ( Object.keys( result ).length === 0 ) {
				process.stdout.write( 'No images were uploaded.\n' );
			}
			else {
				_printDataToStdOut( result, '========= The URLs to uploaded images ========= \n' );
			}

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
