import { Actor, ArrayProperty, Component, Entity,
    Property, SaveGame, StructProperty, TextProperty } from './types';

// TODO find a way to optimize this more!
interface OutputBufferBuffer {
    bytes: string;
    length: number;
}
class OutputBuffer {
    public bytes: string = '';
    public buffers: OutputBufferBuffer[] = [];

    // constructor() { }

    public write(bytes: string, count = true) {
        if (this.buffers.length === 0) {
            this.bytes += bytes;
        } else {
            this.buffers[this.buffers.length - 1].bytes += bytes;
            if (count) {
                this.buffers[this.buffers.length - 1].length += bytes.length;
            }
        }
    }

    public addBuffer() {
        this.buffers.push({ bytes: '', length: 0 });
    }

    public endBufferAndWriteSize() {
        const buffer = this.buffers[this.buffers.length - 1];
        this.buffers.pop(); // remove last element
        this.writeInt(buffer.length);
        this.write(buffer.bytes); // TODO check if correct
        return buffer.length;
    }

    public writeInt(value: number, count = true) {
        const buffer = Buffer.alloc(4);
        buffer.writeInt32LE(value, 0);
        this.write(buffer.toString('binary'), count);
    }

    public writeLong(value: string) {
        this.writeHex(value);
    }

    public writeByte(value: number, count = true) {
        this.write(String.fromCharCode(value), count);
    }

    public writeFloat(value: number) {
        const buffer = Buffer.alloc(4);
        buffer.writeFloatLE(value, 0);
        this.write(buffer.toString('binary'));
    }

    public writeHex(value: string, count = true) {
        const buffer = Buffer.from(value, 'hex');
        this.write(buffer.toString('binary'), count);
    }

    // https://stackoverflow.com/a/14313213
    public isASCII(str: string): boolean {
        return /^[\x00-\x7F]*$/.test(str);
    }

    // https://stackoverflow.com/a/24391376
    public encodeUTF16LE(text: string) {
        const byteArray = new Uint8Array(text.length * 2);
        for (let i = 0; i < text.length; i++) {
            byteArray[i * 2] = text.charCodeAt(i) & 0xff;
            byteArray[i * 2 + 1] = (text.charCodeAt(i) >> 8) & 0xff;
        }

        return String.fromCharCode.apply(String, byteArray as any);
    }

    public writeLengthPrefixedString(value: string, count = true) {
        if (value.length === 0) {
            this.writeInt(0, count);
        } else {
            if (this.isASCII(value)) {
                this.writeInt(value.length + 1, count);
                this.write(value, count);
                this.writeByte(0, count);
            } else {
                this.writeInt(-value.length - 1, count);
                this.write(this.encodeUTF16LE(value));
                this.writeByte(0, count);
                this.writeByte(0, count);
            }
        }
    }
}

export class Json2Sav {
    public uuid?: string;
    public hadError = false;
    public buffer: OutputBuffer;
    public saveJson: SaveGame;
    constructor(saveJson: SaveGame) {
        this.saveJson = saveJson;
        this.buffer = new OutputBuffer();
    }

    public transform() {
        try {
            const saveJson = this.saveJson;
            // console.log(json);
            if (saveJson) {
            }

            // Header
            this.buffer.writeInt(saveJson.saveHeaderType);
            this.buffer.writeInt(saveJson.saveVersion);
            this.buffer.writeInt(saveJson.buildVersion);
            this.buffer.writeLengthPrefixedString(saveJson.mapName);
            this.buffer.writeLengthPrefixedString(saveJson.mapOptions);
            this.buffer.writeLengthPrefixedString(saveJson.sessionName);
            this.buffer.writeInt(saveJson.playDurationSeconds);
            this.buffer.writeLong(saveJson.saveDateTime);
            if (saveJson.saveHeaderType > 4) {
                this.buffer.writeByte(saveJson.sessionVisibility);
            }

            this.buffer.writeInt(saveJson.actors.length + saveJson.components.length);

            for (const obj of saveJson.actors) {
                this.buffer.writeInt(obj.type);
                this.writeActor(obj);
            }

            for (const obj of saveJson.components) {
                this.buffer.writeInt(obj.type);
                this.writeComponent(obj);
            }

            this.buffer.writeInt(saveJson.actors.length + saveJson.components.length);
            for (const obj of saveJson.actors) {
                this.writeEntity(obj.entity, true, obj.className);
            }

            for (const obj of saveJson.components) {
                this.writeEntity(obj.entity, false, obj.className);
            }

            this.buffer.writeInt(saveJson.collected.length);
            for (const obj of saveJson.collected) {
                this.buffer.writeLengthPrefixedString(obj.levelName);
                this.buffer.writeLengthPrefixedString(obj.pathName);
            }

            this.buffer.writeHex(saveJson.missing);
            // const response = Buffer.from(this.buffer.bytes);

            return this.buffer.bytes;
            /*this.response.writeHead(200, {
                        'Content-Type': 'application/octet-stream',
                        'Content-Length': response.byteLength
                    });
                    this.response.end(response, 'binary');*/
        } catch (e) {
            console.error(e.stack);
            this.error(e.message);
        }
    }

    public writeActor(obj: Actor) {
        this.buffer.writeLengthPrefixedString(obj.className);
        this.buffer.writeLengthPrefixedString(obj.levelName);
        this.buffer.writeLengthPrefixedString(obj.pathName);
        this.buffer.writeInt(obj.needTransform);
        this.buffer.writeFloat(obj.transform.rotation[0]);
        this.buffer.writeFloat(obj.transform.rotation[1]);
        this.buffer.writeFloat(obj.transform.rotation[2]);
        this.buffer.writeFloat(obj.transform.rotation[3]);
        this.buffer.writeFloat(obj.transform.translation[0]);
        this.buffer.writeFloat(obj.transform.translation[1]);
        this.buffer.writeFloat(obj.transform.translation[2]);
        this.buffer.writeFloat(obj.transform.scale3d[0]);
        this.buffer.writeFloat(obj.transform.scale3d[1]);
        this.buffer.writeFloat(obj.transform.scale3d[2]);
        this.buffer.writeInt(obj.wasPlacedInLevel);
    }

    public writeComponent(obj: Component) {
        this.buffer.writeLengthPrefixedString(obj.className);
        this.buffer.writeLengthPrefixedString(obj.levelName);
        this.buffer.writeLengthPrefixedString(obj.pathName);
        this.buffer.writeLengthPrefixedString(obj.outerPathName);
    }

    public writeEntity(entity: Entity, withNames: boolean, className: string) {
        this.buffer.addBuffer(); // size will be written at this place later
        if (withNames) {
            this.buffer.writeLengthPrefixedString(entity.levelName!);
            this.buffer.writeLengthPrefixedString(entity.pathName!);
            this.buffer.writeInt(entity.children!.length);
            for (const child of entity.children!) {
                this.buffer.writeLengthPrefixedString(child.levelName);
                this.buffer.writeLengthPrefixedString(child.pathName);
            }
        }
        for (const property of entity.properties) {
            this.writeProperty(property);
        }

        this.writeNone();
        this.buffer.writeInt(0); // extra object count?

        this.writeExtra(entity, className);

        if (entity.missing !== undefined) {
            this.buffer.writeHex(entity.missing);
        }
        this.buffer.endBufferAndWriteSize();
    }

    public writeNone() {
        this.buffer.writeLengthPrefixedString('None');
    }

    public writeProperty(property: Property) {
        this.buffer.writeLengthPrefixedString(property.name);
        const type = property.type;
        this.buffer.writeLengthPrefixedString(property.type);
        this.buffer.addBuffer();
        this.buffer.writeInt(property.index, false);
        switch (type) {
            case 'IntProperty':
                this.buffer.writeByte(0, false);
                this.buffer.writeInt(property.value);
                break;
            case 'BoolProperty':
                this.buffer.writeByte(property.value, false);
                this.buffer.writeByte(0, false);
                break;
            case 'FloatProperty':
                this.buffer.writeByte(0, false);
                this.buffer.writeFloat(property.value);
                break;
            case 'StrProperty':
            case 'NameProperty':
                this.buffer.writeByte(0, false);
                this.buffer.writeLengthPrefixedString(property.value);
                break;
            case 'TextProperty':
                const textProperty = property as TextProperty;
                this.buffer.writeByte(0, false);
                this.buffer.writeInt(textProperty.unknown1);
                this.buffer.writeByte(textProperty.unknown2);
                this.buffer.writeInt(textProperty.unknown3);
                this.buffer.writeLengthPrefixedString(textProperty.unknown4);
                this.buffer.writeLengthPrefixedString(textProperty.value);
                break;
            case 'ByteProperty':
                this.buffer.writeLengthPrefixedString(property.value.unk1, false);
                if (property.value.unk1 === 'None') {
                    this.buffer.writeByte(0, false);
                    this.buffer.writeByte(property.value.unk2);
                } else {
                    this.buffer.writeByte(0, false);
                    this.buffer.writeLengthPrefixedString(property.value.unk2);
                }
                break;

            case 'EnumProperty':
                this.buffer.writeLengthPrefixedString(property.value.enum, false);
                this.buffer.writeByte(0, false);
                this.buffer.writeLengthPrefixedString(property.value.value);
                break;

            case 'ObjectProperty':
                this.buffer.writeByte(0, false);
                this.buffer.writeLengthPrefixedString(property.value.levelName);
                this.buffer.writeLengthPrefixedString(property.value.pathName);
                break;

            case 'StructProperty': {
                const structProperty = property as StructProperty;
                this.buffer.writeLengthPrefixedString(structProperty.value.type, false);
                this.buffer.writeHex(structProperty.structUnknown, false);

                const structType = structProperty.value.type;
                switch (structType) {
                    case 'Vector':
                    case 'Rotator':
                        this.buffer.writeFloat(property.value.x);
                        this.buffer.writeFloat(property.value.y);
                        this.buffer.writeFloat(property.value.z);
                        break;
                    case 'Box':
                        this.buffer.writeFloat(property.value.min[0]);
                        this.buffer.writeFloat(property.value.min[1]);
                        this.buffer.writeFloat(property.value.min[2]);
                        this.buffer.writeFloat(property.value.max[0]);
                        this.buffer.writeFloat(property.value.max[1]);
                        this.buffer.writeFloat(property.value.max[2]);
                        this.buffer.writeByte(property.value.isValid);
                        break;
                    case 'Color':
                        this.buffer.writeByte(property.value.b);
                        this.buffer.writeByte(property.value.g);
                        this.buffer.writeByte(property.value.r);
                        this.buffer.writeByte(property.value.a);
                        break;
                    case 'LinearColor':
                        this.buffer.writeFloat(property.value.r);
                        this.buffer.writeFloat(property.value.g);
                        this.buffer.writeFloat(property.value.b);
                        this.buffer.writeFloat(property.value.a);
                        break;
                    case 'Transform':
                        for (const prop of property.value.properties) {
                            this.writeProperty(prop);
                        }
                        this.writeNone();
                        break;
                    case 'Quat':
                        this.buffer.writeFloat(property.value.a);
                        this.buffer.writeFloat(property.value.b);
                        this.buffer.writeFloat(property.value.c);
                        this.buffer.writeFloat(property.value.d);
                        break;
                    case 'RemovedInstanceArray':
                    case 'InventoryStack':
                        for (const prop of property.value.properties) {
                            this.writeProperty(prop);
                        }
                        this.writeNone();
                        break;
                    case 'InventoryItem':
                        this.buffer.writeLengthPrefixedString(property.value.unk1, false);
                        this.buffer.writeLengthPrefixedString(property.value.itemName);
                        this.buffer.writeLengthPrefixedString(property.value.levelName);
                        this.buffer.writeLengthPrefixedString(property.value.pathName);
                        const oldval = this.buffer.buffers[this.buffer.buffers.length - 1]
                            .length;
                        this.writeProperty(property.value.properties[0]);
                        // Dirty hack to make in this one case the inner property
                        // only take up 4 bytes
                        this.buffer.buffers[this.buffer.buffers.length - 1].length =
                            oldval + 4;
                        break;
                    case 'RailroadTrackPosition':
                        this.buffer.writeLengthPrefixedString(property.value.levelName);
                        this.buffer.writeLengthPrefixedString(property.value.pathName);
                        this.buffer.writeFloat(property.value.offset);
                        this.buffer.writeFloat(property.value.forward);
                        break;
                    case 'TimerHandle':
                        this.buffer.writeLengthPrefixedString(property.value.handle);
                        break;
                }
                break;
            }
            case 'ArrayProperty':
                const itemType = property.value.type;
                this.buffer.writeLengthPrefixedString(itemType, false);
                this.buffer.writeByte(0, false);
                this.buffer.writeInt(property.value.values.length);
                switch (itemType) {
                    case 'IntProperty':
                        for (const prop of property.value.values) {
                            this.buffer.writeInt(prop);
                        }
                        break;
                    case 'ByteProperty':
                        for (const prop of property.value.values) {
                            this.buffer.writeByte(prop);
                        }
                        break;
                    case 'ObjectProperty':
                        for (const prop of property.value.values) {
                            const obj = prop;
                            this.buffer.writeLengthPrefixedString(obj.levelName);
                            this.buffer.writeLengthPrefixedString(obj.pathName);
                        }
                        break;
                    case 'StructProperty':
                        const arrayProperty = property as ArrayProperty;
                        this.buffer.writeLengthPrefixedString(arrayProperty.structName!);
                        this.buffer.writeLengthPrefixedString(arrayProperty.structType!);
                        this.buffer.addBuffer();
                        this.buffer.writeInt(0, false);
                        this.buffer.writeLengthPrefixedString(
                            arrayProperty.structInnerType!,
                            false
                        );
                        this.buffer.writeHex(arrayProperty.structUnknown!, false);
                        for (const prop of property.value.values) {
                            const obj = prop;
                            for (const innerProp of obj.properties) {
                                this.writeProperty(innerProp);
                            }
                            this.writeNone();
                        }
                        this.buffer.endBufferAndWriteSize();
                        break;
                    default:
                        this.error('Unknown array type: ' + itemType);
                        break;
                }
                break;
            case 'MapProperty':
                this.buffer.writeLengthPrefixedString(property.value.name, false);
                this.buffer.writeLengthPrefixedString(property.value.type, false);
                this.buffer.writeByte(0, false);
                this.buffer.writeInt(0); // for some reason this counts towards the length

                const keys = Object.keys(property.value.values);
                this.buffer.writeInt(keys.length);
                for (const key of keys) {
                    // (let [key, value] of property.value.values) {
                    const value = property.value.values[key];
                    this.buffer.writeInt(+key); // parse key to int
                    for (const element of value) {
                        this.writeProperty(element);
                    }
                    this.writeNone();
                }

                break;
            default:
                this.error('Unknown property type ' + type);
        }
        this.buffer.endBufferAndWriteSize();
    }

    public writeExtra(entity: Entity, className: string) {
        switch (className) {
            case '/Game/FactoryGame/Buildable/Factory/PowerLine/Build_PowerLine.Build_PowerLine_C':
                this.writePowerLineExtra(entity);
                break;
             case '/Game/FactoryGame/-Shared/Blueprint/BP_CircuitSubsystem.BP_CircuitSubsystem_C':
                this.writeCircuitSubsystemExtra(entity);
                break;
            case '/Game/FactoryGame/-Shared/Blueprint/BP_GameMode.BP_GameMode_C':
                this.writeGameModeExtra(entity);
                break;
            case '/Game/FactoryGame/-Shared/Blueprint/BP_GameState.BP_GameState_C':
                this.writeGameStateExtra(entity);
                break;
            case '/Game/FactoryGame/-Shared/Blueprint/BP_RailroadSubsystem.BP_RailroadSubsystem_C':
                this.writeRailroadSubsystemExtra(entity);
                break;
            case '/Game/FactoryGame/Character/Player/BP_PlayerState.BP_PlayerState_C':
                this.writePlayerStateExtra(entity);
                break;
            case '/Game/FactoryGame/Buildable/Vehicle/Tractor/BP_Tractor.BP_Tractor_C':
            case '/Game/FactoryGame/Buildable/Vehicle/Truck/BP_Truck.BP_Truck_C':
            case '/Game/FactoryGame/Buildable/Vehicle/Explorer/BP_Explorer.BP_Explorer_C':
                this.writeVehicleExtra(entity);
                break;
            case '/Game/FactoryGame/Buildable/Factory/ConveyorBeltMk1/Build_ConveyorBeltMk1.Build_ConveyorBeltMk1_C':
            case '/Game/FactoryGame/Buildable/Factory/ConveyorBeltMk2/Build_ConveyorBeltMk2.Build_ConveyorBeltMk2_C':
            case '/Game/FactoryGame/Buildable/Factory/ConveyorBeltMk3/Build_ConveyorBeltMk3.Build_ConveyorBeltMk3_C':
            case '/Game/FactoryGame/Buildable/Factory/ConveyorBeltMk4/Build_ConveyorBeltMk4.Build_ConveyorBeltMk4_C':
            case '/Game/FactoryGame/Buildable/Factory/ConveyorBeltMk5/Build_ConveyorBeltMk5.Build_ConveyorBeltMk5_C':
            case '/Game/FactoryGame/Buildable/Factory/ConveyorBeltMk6/Build_ConveyorBeltMk6.Build_ConveyorBeltMk6_C':
            case '/Game/FactoryGame/Buildable/Factory/ConveyorLiftMk1/Build_ConveyorLiftMk1.Build_ConveyorLiftMk1_C':
            case '/Game/FactoryGame/Buildable/Factory/ConveyorLiftMk2/Build_ConveyorLiftMk2.Build_ConveyorLiftMk2_C':
            case '/Game/FactoryGame/Buildable/Factory/ConveyorLiftMk3/Build_ConveyorLiftMk3.Build_ConveyorLiftMk3_C':
            case '/Game/FactoryGame/Buildable/Factory/ConveyorLiftMk4/Build_ConveyorLiftMk4.Build_ConveyorLiftMk4_C':
                this.writeConveyorBeltExtra(entity);
                break;
        }
    }

    private writePowerLineExtra(entity: Entity) {
        this.buffer.writeLengthPrefixedString(entity.extra.sourceLevelName);
        this.buffer.writeLengthPrefixedString(entity.extra.sourcePathName);
        this.buffer.writeLengthPrefixedString(entity.extra.targetLevelName);
        this.buffer.writeLengthPrefixedString(entity.extra.targetPathName);
    }

    private writeCircuitSubsystemExtra(entity: Entity) {
        this.buffer.writeInt(entity.extra.circuits.length);
        for (const circuit of entity.extra.circuits) {
            this.buffer.writeHex(circuit.unknown);
            this.buffer.writeLengthPrefixedString(circuit.levelName);
            this.buffer.writeLengthPrefixedString(circuit.pathName);
        }
    }

    private writeGameModeExtra(entity: Entity) {
        this.buffer.writeInt(entity.extra.objects.length);
        for (const object of entity.extra.objects) {
            this.buffer.writeLengthPrefixedString(object.levelName);
            this.buffer.writeLengthPrefixedString(object.pathName);
        }
    }

    private writeGameStateExtra(entity: Entity) {
        this.buffer.writeInt(entity.extra.objects.length);
        for (const object of entity.extra.objects) {
            this.buffer.writeLengthPrefixedString(object.levelName);
            this.buffer.writeLengthPrefixedString(object.pathName);
        }
    }

    private writeRailroadSubsystemExtra(entity: Entity) {
        this.buffer.writeInt(entity.extra.trains.length);
        for (const train of entity.extra.trains) {
            this.buffer.writeHex(train.unkown);
            this.buffer.writeLengthPrefixedString(train.levelName);
            this.buffer.writeLengthPrefixedString(train.pathName);
            this.buffer.writeLengthPrefixedString(train.levelSecond);
            this.buffer.writeLengthPrefixedString(train.pathSecond);
            this.buffer.writeLengthPrefixedString(train.levelTimetable);
            this.buffer.writeLengthPrefixedString(train.pathTimetable);
        }
    }

    private writePlayerStateExtra(entity: Entity) {
        this.buffer.writeHex(entity.extra.unknown);
    }

    private writeVehicleExtra(entity: Entity) {
        this.buffer.writeInt(entity.extra.objects.count);
        for (const object of entity.extra.objects) {
            this.buffer.writeLengthPrefixedString(object.name);
            this.buffer.writeHex(object.unknown);
        }
    }

    private writeConveyorBeltExtra(entity: Entity) {
        this.buffer.writeInt(entity.extra.items.count);
        for (const item of entity.extra.items) {
            this.buffer.writeHex(item.unknown1);
            this.buffer.writeLengthPrefixedString(item.name);
            this.buffer.writeHex(item.unknown2);
        }
    }

    private error(message: string) {
        console.trace('error: ' + message);
        if (this.uuid) {
            console.error('uuid: ' + this.uuid);
        }
        if (!this.hadError) {
            // we cannot send two error messages
            /*this.response.send(JSON.stringify({
                        type: 'error',
                        uuid: this.uuid,
                        text: message
                    }));*/
            // TODO
        }
        this.hadError = true;
        throw new Error(message);
    }
}