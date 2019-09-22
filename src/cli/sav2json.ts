#!/usr/bin/env node
import * as fs from 'fs';
import program from 'commander';
import { Sav2JsonTransform } from '../Sav2JsonTransform';

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

if (program.time) {
  console.time('readFile');
}

const stream = fs.createReadStream(sourceValue!, { highWaterMark: 1024 * 1024 });
/*

fs.readFile(sourceValue!, 'binary', (error, data) => {
  if (error) {
    quitWithError(error);
  }
  const binaryData = Buffer.from(data, 'binary');*/

if (program.time) {
  console.timeEnd('readFile');
  console.time('sav2json');
}


const sav2json = new Sav2JsonTransform();

stream.pipe(sav2json).on('finish', () => {
  if (program.time) {
    console.timeEnd('sav2json');
    //console.time('writeFile');
  }
  /*const output = JSON.stringify(transformed);

  fs.writeFile(targetValue!, output, 'utf8', (error2) => {
    if (error2) {
      quitWithError(error2);
    }
    console.timeEnd('writeFile');
    console.log('Converted ' + sourceValue + ' to ' + targetValue);
  });*/
});
