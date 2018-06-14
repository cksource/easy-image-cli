/*
 Copyright (c) 2016-2018, CKSource - Frederico Knabben. All rights reserved.
 */

'use strict';

const colors = require('colors');

const app = require('commander');

const uploadCommand = require('./commands/upload');

app.command('upload')
    .description('Uploads files to system')
    .option('-p, --path <filePath>', 'Path to file or directory')
    .option('-e, --environment <environment>', 'Environment id')
    .option('-k, --key <key>', 'Access key')
    .option('-u, --uploadUrl <url>', 'Upload URL')
    .option('-t, --tokenUrl <url>', 'Token URL')
    .action(uploadCommand);

app.action(() => console.error(
    colors.red('----------\nEasyImage CLI\n----------\nCommand doesn\'t exist. \nCheck --help for list of commands.\n')
));

app.parse(process.argv);
