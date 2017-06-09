#!/usr/bin/env node
'use strict';

const
  program = require('commander'),
  start = require('../server.js');


  program
    //.usage('[options] <repositoryPath> <projectName>')
    .usage('[options]')
    .description('Swagger server with Faker integration from CLI')
    .version(require('../package').version)
    .option('-p, --port <port>', 'The server port number or socket name');

program.parse(process.argv);

var config = require('../config/config');

/*// Show help if no options were given
if (program.rawArgs.length < 3) {
  program.help();
}*/

start(config.git.repo, config.project.name, program);
