import { DataBuffer } from '../../DataBuffer';
import { Property } from '../../types';
import { transformVector } from './structs/Vector';
import { transformTimerHandle } from './structs/TimerHandle';
import { transformRailroadTrackPosition } from './structs/RailroadTrackPosition';
import { transformQuat } from './structs/Quat';
import { transformLinearColor } from './structs/LinearColor';
import { transformColor } from './structs/Color';
import { transformInventoryItem } from './structs/IventoryItem';
import { transformArbitraryStruct } from './structs/ArbitraryStruct';
import { transformBox } from './structs/Box';

export default function transformStructProperty(
    buffer: DataBuffer, property: Property, toSav: boolean) {
    if (!toSav) {
        property.value = {};
    }
    buffer.transformString(property.value, 'type', toSav);

    const zero = { zero: 0 };
    for (let i = 0; i < 4; i++) {
        buffer.transformInt(zero, 'zero', toSav, false);
        if (zero.zero !== 0) {
            throw new Error(`Not zero, but ${zero.zero}`);
        }
    }
    buffer.transformAssertNullByte(toSav, false);

    switch (property.value.type) {
        case 'Vector':
        case 'Rotator':
            transformVector(buffer, property, toSav);
            break;
        case 'Box':
            transformBox(buffer, property, toSav);
            break;
        case 'Color':
            transformColor(buffer, property, toSav);
            break;
        case 'LinearColor':
            transformLinearColor(buffer, property, toSav);
            break;
        case 'Quat':
            transformQuat(buffer, property, toSav);
            break;
        case 'InventoryItem':
            transformInventoryItem(buffer, property, toSav);
            break;
        case 'RailroadTrackPosition':
            transformRailroadTrackPosition(buffer, property, toSav);
            break;
        case 'TimerHandle':
            transformTimerHandle(buffer, property, toSav);
            break;
        case 'Transform':
        case 'RemovedInstanceArray':
        case 'InventoryStack':
        case 'ProjectileData':
            transformArbitraryStruct(buffer, property, toSav);
            break;
        default:
            throw new Error(`Unknown struct type ${property.value.type}`);
    }
}

