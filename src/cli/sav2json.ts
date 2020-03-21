#!/usr/bin/env node
import * as fs from 'fs';
import program from 'commander';
import { Sav2JsonTransform } from '../Sav2JsonTransform';
import * as profiler from 'v8-profiler-next';
import { Transform } from 'stream';

let sourceValue: string | undefined;
let targetValue: string | undefined;

function quitWithError(message: any): void {
  console.error(message);
  process.exit(1);
}

program
  .description(
    'Converts Satisfactory save games (.sav) into a more readable format (.json)'
  )
  .arguments('<source> <target>')
  .option('-t, --time', 'time program')
  .option('-p --profile', 'export profile as sav2json.cpuprofile')
  .action((source, target) => {
    sourceValue = source;
    targetValue = target;
  })
  .parse(process.argv);

if (sourceValue === undefined) {
  program.outputHelp();
  quitWithError('No source file specified.');
} else if (targetValue === undefined) {
  program.outputHelp();
  quitWithError('No target file specified.');
} else {
  if (program.time) {
    console.time('readFile');
  }

  if (program.profile) {
    profiler.startProfiling('probe', true);
  }

  const opts = { highWaterMark: 1024 * 512 };
  const stream = fs.createReadStream(sourceValue, opts);
  const outStream = fs.createWriteStream(targetValue, opts);
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

  const stringifyTransform = new Transform({
    objectMode: true,
    transform(chunk, encoding, cb): void {
      this.push(JSON.stringify(chunk));
      cb();
    },
    flush(cb): void {
      cb();
    },
  });

  stream
    .pipe(sav2json)
    .pipe(stringifyTransform)
    .pipe(outStream)
    .on('finish', () => {
      if (program.time) {
        console.timeEnd('sav2json');
        //console.time('writeFile');
      }

      if (program.profile) {
        const profile = profiler.stopProfiling('probe');
        profile.export((error: any, result: any) => {
          console.log('Profile stored.');
          fs.writeFileSync('sav2json.cpuprofile', result);
          profile.delete();
          process.exit();
        });
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
}
