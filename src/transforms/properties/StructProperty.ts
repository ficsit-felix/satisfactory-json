import { Archive } from '../../Archive';
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
    ar: Archive, property: Property) {
    if (ar.isLoading()) {
        property.value = {};
    }
    ar.transformString(property.value, 'type'); // Tag.StructName

    const zero = { zero: 0 };
    for (let i = 0; i < 4; i++) { // Tag.StructGuid
        ar.transformInt(zero, 'zero', false);
        if (zero.zero !== 0) {
            throw new Error(`Not zero, but ${zero.zero}`);
        }
    }
    ar.transformAssertNullByte(false); // Tag.HasPropertyGuid

    switch (property.value.type) {
        case 'Vector':
        case 'Rotator':
            transformVector(ar, property);
            break;
        case 'Box':
            transformBox(ar, property);
            break;
        case 'Color':
            transformColor(ar, property);
            break;
        case 'LinearColor':
            transformLinearColor(ar, property);
            break;
        case 'Quat':
            transformQuat(ar, property);
            break;
        case 'InventoryItem':
            transformInventoryItem(ar, property);
            break;
        case 'RailroadTrackPosition':
            transformRailroadTrackPosition(ar, property);
            break;
        case 'TimerHandle':
            transformTimerHandle(ar, property);
            break;
        case 'Transform':
        case 'RemovedInstanceArray':
        case 'InventoryStack':
        case 'ProjectileData':
            transformArbitraryStruct(ar, property);
            break;
        default:
            throw new Error(`Unknown struct type ${property.value.type}`);
    }
}
