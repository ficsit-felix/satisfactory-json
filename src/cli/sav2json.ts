#!/usr/bin/env node
import * as fs from 'fs';
import * as program from 'commander';

import { sav2json } from '../transform';

let sourceValue: string | undefined;
let targetValue: string | undefined;

function quitWithError(message: any) {
  console.error(message);
  process.exit(1);
}

program
  .description('Converts Satisfactory save games (.sav) into a more readable format (.json)')
  .arguments('<source> <target>')
  .option('-t, --time', 'time program')
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

fs.readFile(sourceValue!, 'binary', (error, data) => {
  if (error) {
    quitWithError(error);
  }
  const binaryData = Buffer.from(data, 'binary');
  if (program.time) {
    console.time('sav2json');
  }
  const transformed = sav2json(binaryData);

  if (program.time) {
    console.timeEnd('sav2json');
  }
  const output = JSON.stringify(transformed);

  fs.writeFile(targetValue!, output, 'utf8', (error2) => {
    if (error2) {
      quitWithError(error2);
    }
    console.log('Converted ' + sourceValue + ' to ' + targetValue);
  });
});
