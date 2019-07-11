#!/usr/bin/env node
import * as fs from 'fs';
import * as program from 'commander';

import { Json2Sav } from '../json2sav';
import { json2sav } from '../transform';

let sourceValue: string | undefined;
let targetValue: string | undefined;

function quitWithError(message: any) {
  console.error(message);
  process.exit(1);
}

program
  .description('Converts from the more readable format (.json) ' +
    'back to a Satisfactory save game (.sav)')
  .arguments('<source> <target>')
  .action((source, target) => {
    sourceValue = source;
    targetValue = target;
  })
  .parse(process.argv);

if (sourceValue === undefined) {
  program.outputHelp();
  quitWithError('No source file specified.');
}

if (targetValue === undefined) {
  program.outputHelp();
  quitWithError('No target file specified.');
}

fs.readFile(sourceValue!, 'utf8', (error, data) => {
  if (error) {
    quitWithError(error);
  }
  const json = JSON.parse(data);
//  const json2sav = new Json2Sav(json);
//  const output = json2sav.transform();
  const output = json2sav(json);

  fs.writeFile(targetValue!, output, 'binary', (error2) => {
    if (error2) {
      quitWithError(error2);
    }
    console.log('Converted ' + sourceValue + ' to ' + targetValue);
  });
});
