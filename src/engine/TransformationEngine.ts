import { SaveGame } from '../types';
import { ReadArchive, WriteArchive } from './Archive';
import { Builder, functionCommands } from './Builder';
import { Command, Context, LoopBodyCommand } from './commands';
import {
  transformHeader,
  transformActorOrComponent
} from '../transforms/transform';
import { transformEntity, transformProperties } from '../transforms/Entity';
import { transformProperty } from '../transforms/Property';
import { transformExtra } from '../transforms/Extra';
import { transformPowerLine } from '../transforms/extras/PowerLine';
import { transformCircuitSubsystem } from '../transforms/extras/CircuitSubsystem';
import { transformGameMode } from '../transforms/extras/GameMode';
import { transformGameState } from '../transforms/extras/GameState';
import { transformPlayerState } from '../transforms/extras/PlayerState';
import { transformVehicle } from '../transforms/extras/Vehicle';
import { transformConveyorBelt } from '../transforms/extras/ConveyorBelt';
import { transformTrain } from '../transforms/extras/Train';
import { transformIntProperty } from '../transforms/properties/IntProperty';
import { transformBoolProperty } from '../transforms/properties/BoolProperty';
import { transformFloatProperty } from '../transforms/properties/FloatProperty';
import { transformStringProperty } from '../transforms/properties/StringProperty';
import {
  transformTextProperty,
  transformFText
} from '../transforms/properties/TextProperty';
import { transformByteProperty } from '../transforms/properties/ByteProperty';
import { transformEnumProperty } from '../transforms/properties/EnumProperty';
import { transformObjectProperty } from '../transforms/properties/ObjectProperty';
import { transformStructProperty } from '../transforms/properties/StructProperty';
import { transformArrayProperty } from '../transforms/properties/ArrayProperty';
import { transformMapProperty } from '../transforms/properties/MapProperty';
import { transformSetProperty } from '../transforms/properties/SetProperty';
import { transformInt64Property } from '../transforms/properties/Int64Property';

interface StackFrame {
  commands: Command[];
  currentCommand: number;
  ctx: Context;
}

function registerFunction(
  functionName: RegisteredFunction,
  rulesFunction: (builder: Builder) => void
): void {
  const builder = new Builder();
  rulesFunction(builder);
  functionCommands[functionName] = builder.getCommands();
}

export enum RegisteredFunction {
  transformHeader = 'transformHeader',
  transformActorOrComponent = 'transformActorOrComponent',
  transformEntity = 'transformEntity',
  transformProperties = 'transformProperties',
  transformProperty = 'transformProperty',
  transformExtra = 'transformExtra',
  transformPowerLine = 'transformPowerLine',
  transformCircuitSubsystem = 'transformCircuitSubsystem',
  transformGameMode = 'transformGameMode',
  transformGameState = 'transformGameState',
  transformPlayerState = 'transformPlayerState',
  transformVehicle = 'transformVehicle',
  transformConveyorBelt = 'transformConveyorBelt',
  transformTrain = 'transformTrain',
  transformIntProperty = 'transformIntProperty',
  transformBoolProperty = 'transformBoolProperty',
  transformFloatProperty = 'transformFloatProperty',
  transformStringProperty = 'transformStringProperty',
  transformTextProperty = 'transformTextProperty',
  transformByteProperty = 'transformByteProperty',
  transformEnumProperty = 'transformEnumProperty',
  transformObjectProperty = 'transformObjectProperty',
  transformStructProperty = 'transformStructProperty',
  transformArrayProperty = 'transformArrayProperty',
  transformMapProperty = 'transformMapProperty',
  transformFText = 'transformFText',
  transformSetProperty = 'transformSetProperty',
  transformInt64Property = 'transformInt64Property'
}

export class TransformationEngine {
  private commands: Command[];
  private isLoading = false;
  private stack: StackFrame[] = [];
  /**
   * Bytes needed before next command can be fulfilled
   */
  private needBytes = 0;
  private buffers: Buffer[] = [];
  private bufferedBytes = 0;
  private bytesRead = 0;
  private startCompressionCallback: (buffer: Buffer) => void;

  private saveGame: any;

  constructor(
    rulesFunction: (builder: Builder) => void,
    startCompressionCallback: (buffer: Buffer) => void
  ) {
    this.startCompressionCallback = startCompressionCallback;
    const builder = new Builder();

    // build the rules
    rulesFunction(builder);
    this.commands = builder.getCommands();

    // build functions
    registerFunction(RegisteredFunction.transformHeader, transformHeader);
    registerFunction(
      RegisteredFunction.transformActorOrComponent,
      transformActorOrComponent
    );
    registerFunction(RegisteredFunction.transformEntity, transformEntity);
    registerFunction(
      RegisteredFunction.transformProperties,
      transformProperties
    );
    registerFunction(RegisteredFunction.transformProperty, transformProperty);
    registerFunction(RegisteredFunction.transformExtra, transformExtra);
    registerFunction(RegisteredFunction.transformPowerLine, transformPowerLine);
    registerFunction(
      RegisteredFunction.transformCircuitSubsystem,
      transformCircuitSubsystem
    );
    registerFunction(RegisteredFunction.transformGameMode, transformGameMode);
    registerFunction(RegisteredFunction.transformGameState, transformGameState);
    registerFunction(
      RegisteredFunction.transformPlayerState,
      transformPlayerState
    );
    registerFunction(RegisteredFunction.transformVehicle, transformVehicle);
    registerFunction(
      RegisteredFunction.transformConveyorBelt,
      transformConveyorBelt
    );
    registerFunction(RegisteredFunction.transformTrain, transformTrain);
    registerFunction(
      RegisteredFunction.transformIntProperty,
      transformIntProperty
    );
    registerFunction(
      RegisteredFunction.transformBoolProperty,
      transformBoolProperty
    );
    registerFunction(
      RegisteredFunction.transformFloatProperty,
      transformFloatProperty
    );
    registerFunction(
      RegisteredFunction.transformStringProperty,
      transformStringProperty
    );
    registerFunction(
      RegisteredFunction.transformTextProperty,
      transformTextProperty
    );
    registerFunction(
      RegisteredFunction.transformByteProperty,
      transformByteProperty
    );
    registerFunction(
      RegisteredFunction.transformEnumProperty,
      transformEnumProperty
    );
    registerFunction(
      RegisteredFunction.transformObjectProperty,
      transformObjectProperty
    );
    registerFunction(
      RegisteredFunction.transformStructProperty,
      transformStructProperty
    );
    registerFunction(
      RegisteredFunction.transformArrayProperty,
      transformArrayProperty
    );
    registerFunction(
      RegisteredFunction.transformMapProperty,
      transformMapProperty
    );
    registerFunction(RegisteredFunction.transformFText, transformFText);
    registerFunction(
      RegisteredFunction.transformSetProperty,
      transformSetProperty
    );
    registerFunction(
      RegisteredFunction.transformInt64Property,
      transformInt64Property
    );
    //console.log('commands', inspect(this.commands, false, 10));
  }

  prepare(isLoading: boolean): void {
    this.isLoading = isLoading;
  }

  transformRead(buffer: Buffer): void {
    this.bufferedBytes += buffer.length;
    if (this.bufferedBytes < this.needBytes) {
      //console.log(`still missing ${this.needBytes - this.bufferedBytes} bytes`);
      this.buffers.push(buffer);
      // need to read more
      return;
    }

    if (this.buffers.length > 0) {
      // concatenate all the buffers
      this.buffers.push(buffer);
      buffer = Buffer.concat(this.buffers);
      this.buffers = [];
    }
    this.needBytes = 0;

    const chunk = new ReadArchive(buffer, this.bytesRead);

    if (this.stack.length === 0) {
      //console.info('Starting program...');
      // Stack empty: Begin of program or something went wrong

      const saveGame = {};

      this.saveGame = saveGame;

      const frame = {
        commands: this.commands,
        currentCommand: 0,
        ctx: {
          obj: saveGame,
          tmp: {},
          locals: {},
          isLoading: this.isLoading,
          path: 'saveGame'
        }
      };
      this.stack.push(frame);
    }

    for (; ;) {
      // get current stack frame
      const frame = this.stack[this.stack.length - 1];
      if (frame.currentCommand >= frame.commands.length) {
        // move one stack frame up
        this.stack.pop();
        if (this.stack.length === 0) {
          //console.warn('No more stack frames');
          //throw new Error('EOW');
          // End of program?
          break;
        }

        continue;
      }

      const cmd = frame.commands[frame.currentCommand];
      //console.log('executing', cmd);
      const needBytes = cmd.exec(
        frame.ctx,
        chunk,
        commands => {
          //        console.log(frame.ctx.vars);
          /* const vars = {
           _length: frame.ctx.vars._length,
           _index: frame.ctx.vars._index,
           _name: frame.ctx.vars._name,
           _entryCount: frame.ctx.vars._entryCount,
           _tagSize: frame.ctx.vars._tagSize,
           _type: frame.ctx.vars._type,
           _keyTransform: frame.ctx.vars._keyTransform,
           _valueTransform: frame.ctx.vars._valueTransform,
           _withNames: frame.ctx.vars._withNames,
           _className: frame.ctx.vars._className,
           _itemCount: frame.ctx.vars._itemCount,
           _childCount: frame.ctx.vars._childCount,
         };*/

          // create new stack frame
          this.stack.push({
            commands,
            currentCommand: 0,
            ctx: /*frame.ctx*/ {
              obj: frame.ctx.obj,
              tmp: frame.ctx.tmp, //Object.assign({}, frame.ctx.vars), // shallow copy the variables so that the old ones still will be there when the stack is popped
              locals: {},
              parent: frame.ctx.parent,
              isLoading: frame.ctx.isLoading,
              path: frame.ctx.path
            }
          });
        },
        () => {
          // Pop the stack to the previous loop command
          let frame = this.stack.pop();

          while (
            frame !== undefined &&
            !(frame.commands[frame.currentCommand] instanceof LoopBodyCommand)
          ) {
            frame = this.stack.pop();
          }
          if (frame === undefined) {
            throw new Error('No LoopCommand found on stack that can be broken');
          }
          // move command pointer after the loop command
          frame.currentCommand++;
          this.stack.push(frame);
        }
      );
      if (needBytes > 0) {
        // This command needs more bytes to successfully execute

        /*console.log(chunk.cursor);
        console.log('---------------------------');
        console.error(`Need ${needBytes} more bytes.`);
        console.log(frame.ctx.vars);*/
        this.needBytes = needBytes;
        // pass bytesRead to next chunk
        this.bytesRead = chunk.getBytesRead();

        // put remaining bytes into buffer for next iteration
        this.buffers = [chunk.getRemaining()];
        break;
      } else if (needBytes === -1) {
        // -1 indicates that the command pointer should not advance
      } else if (needBytes === 0 || needBytes === -3) {
        frame.currentCommand++;
      } else if (needBytes === -2) {
        // -2 indicates turning on compression
        frame.currentCommand++;
        this.buffers = [];
        this.needBytes = 0;
        this.startCompressionCallback(chunk.getRemaining());
        return;
      }

      //console.log(frame.ctx);
    }
    //console.log(saveGame);
  }

  private writeArchive?: WriteArchive;

  public getWriteArchive(): WriteArchive | undefined {
    return this.writeArchive;
  }

  // return true if writing the save file is not finished
  transformWrite(saveGame: SaveGame): boolean {
    const ar = this.writeArchive ? this.writeArchive : new WriteArchive();
    this.writeArchive = ar;

    if (this.stack.length === 0) {
      //console.info('Starting program...');
      // Stack empty: Begin of program or something went wrong

      this.saveGame = saveGame;

      const frame = {
        commands: this.commands,
        currentCommand: 0,
        ctx: {
          obj: saveGame,
          tmp: {},
          locals: {},
          isLoading: this.isLoading,
          path: 'saveGame'
        }
      };
      this.stack.push(frame);
    }

    for (; ;) {
      // get current stack frame
      const frame = this.stack[this.stack.length - 1];
      if (frame.currentCommand >= frame.commands.length) {
        // move one stack frame up
        this.stack.pop();
        if (this.stack.length === 0) {
          console.warn('No more stack frames');
          //throw new Error('EOW');
          // End of program?
          break;
        }

        continue;
      }

      const cmd = frame.commands[frame.currentCommand];
      //console.log('executing', cmd);
      const needBytes = cmd.exec(
        frame.ctx,
        ar,
        commands => {
          //        console.log(frame.ctx.vars);
          /* const vars = {
           _length: frame.ctx.vars._length,
           _index: frame.ctx.vars._index,
           _name: frame.ctx.vars._name,
           _entryCount: frame.ctx.vars._entryCount,
           _tagSize: frame.ctx.vars._tagSize,
           _type: frame.ctx.vars._type,
           _keyTransform: frame.ctx.vars._keyTransform,
           _valueTransform: frame.ctx.vars._valueTransform,
           _withNames: frame.ctx.vars._withNames,
           _className: frame.ctx.vars._className,
           _itemCount: frame.ctx.vars._itemCount,
           _childCount: frame.ctx.vars._childCount,
         };*/

          // create new stack frame
          this.stack.push({
            commands,
            currentCommand: 0,
            ctx: /*frame.ctx*/ {
              obj: frame.ctx.obj,
              tmp: frame.ctx.tmp, //Object.assign({}, frame.ctx.vars), // shallow copy the variables so that the old ones still will be there when the stack is popped
              locals: {},
              parent: frame.ctx.parent,
              isLoading: frame.ctx.isLoading,
              path: frame.ctx.path
            }
          });
        },
        () => {
          // Pop the stack to the previous loop command
          let frame = this.stack.pop();

          while (
            frame !== undefined &&
            !(frame.commands[frame.currentCommand] instanceof LoopBodyCommand)
          ) {
            frame = this.stack.pop();
          }
          if (frame === undefined) {
            throw new Error('No LoopCommand found on stack that can be broken');
          }
          // move command pointer after the loop command
          frame.currentCommand++;
          this.stack.push(frame);
        }
      );
      if (needBytes > 0) {
        // This command has filled a chunk

        // this command actually finished
        frame.currentCommand++;
        return true;
      } else if (needBytes === -1) {
        // -1 indicates that the command pointer should not advance
      } else if (needBytes === 0) {
        frame.currentCommand++;
      } else if (needBytes === -2) {
        // -2 indicates turning on compression
        frame.currentCommand++;
        this.startCompressionCallback(this.writeArchive.getHeaderChunk());
        //this.writeArchive.writeInt(0, true);
        return true;
      } else if (needBytes === -3) {
        // end of the save game
        return false;
      }

      //console.log(frame.ctx);
    }
    //console.log(saveGame);
    return true;
  }

  getSaveGame(): any {
    return this.saveGame;
  }

  end(callback: (error?: Error | undefined) => void): void {
    if (this.needBytes !== 0) {
      callback(new Error(`Missing ${this.needBytes} bytes`));
    } else {
      // TODO check for spare bytes
      callback();
    }
  }
}
