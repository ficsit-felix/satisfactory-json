#!/usr/bin/env node
import * as fs from 'fs';
import program from 'commander';

import * as profiler from 'v8-profiler-next';
import { Transform, TransformCallback } from 'stream';
import { Json2SavTransform } from '../Json2SavTransform';

let sourceValue: string | undefined;
let targetValue: string | undefined;

function quitWithError(message: any): void {
  console.error(message);
  process.exit(1);
}

program
  .description(
    'Converts from the more readable format (.json) ' +
      'back to a Satisfactory save game (.sav)'
  )
  .arguments('<source> <target>')
  .option('-t, --time', 'time program')
  .option('-p --profile', 'export profile as json2sav.cpuprofile')
  .action((source, target) => {
    sourceValue = source;
    targetValue = target;
  })
  .parse(process.argv);

const options = program.opts();

if (sourceValue === undefined) {
  program.outputHelp();
  quitWithError('No source file specified.');
} else if (targetValue === undefined) {
  program.outputHelp();
  quitWithError('No target file specified.');
} else {
  if (options.profile) {
    profiler.startProfiling('probe', true);
  }

  const opts = { highWaterMark: 1024 * 512 };
  const stream = fs.createReadStream(sourceValue, opts);
  const outStream = fs.createWriteStream(targetValue, opts);

  if (options.time) {
    console.time('json2sav');
  }

  const json2sav = new Json2SavTransform();

  class JSONparseTransform extends Transform {
    private buffers: Buffer[] = [];
    constructor() {
      super({
        readableObjectMode: true,
      });
    }

    _transform(chunk: Buffer, encoding: string, cb: TransformCallback): void {
      this.buffers.push(chunk);
      cb();
    }

    _flush(cb: TransformCallback): void {
      this.push(JSON.parse(Buffer.concat(this.buffers).toString('utf8')));
      cb();
    }
  }

  const parseTransform = new JSONparseTransform();

  stream
    .pipe(parseTransform)
    .pipe(json2sav)
    .pipe(outStream)
    .on('finish', () => {
      if (options.time) {
        console.timeEnd('json2sav');
      }

      if (options.profile) {
        const profile = profiler.stopProfiling('probe');
        profile.export((error: any, result: any) => {
          console.log('Profile stored.');
          fs.writeFileSync('json2sav.cpuprofile', result);
          profile.delete();
          process.exit();
        });
      }
    });
}
