import { DataBuffer } from '../../DataBuffer';
import { Property } from '../../types';
import transformProperty from '../Property';

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
            buffer.transformFloat(property.value, 'x', toSav);
            buffer.transformFloat(property.value, 'y', toSav);
            buffer.transformFloat(property.value, 'z', toSav);
            break;
        case 'Box':
            if (!toSav) {
                property.value.min = {};
                property.value.max = {};
            }
            buffer.transformFloat(property.value.min, 0, toSav);
            buffer.transformFloat(property.value.min, 1, toSav);
            buffer.transformFloat(property.value.min, 2, toSav);
            buffer.transformFloat(property.value.max, 0, toSav);
            buffer.transformFloat(property.value.max, 1, toSav);
            buffer.transformFloat(property.value.max, 2, toSav);
            buffer.transformByte(property.value, 'isValid', toSav);
            break;
        case 'Color':
            buffer.transformByte(property.value, 'b', toSav);
            buffer.transformByte(property.value, 'g', toSav);
            buffer.transformByte(property.value, 'r', toSav);
            buffer.transformByte(property.value, 'a', toSav);
            break;
        case 'LinearColor':
            buffer.transformFloat(property.value, 'r', toSav);
            buffer.transformFloat(property.value, 'g', toSav);
            buffer.transformFloat(property.value, 'b', toSav);
            buffer.transformFloat(property.value, 'a', toSav);
            break;
        case 'Quat':
            buffer.transformFloat(property.value, 'r', toSav);
            buffer.transformFloat(property.value, 'g', toSav);
            buffer.transformFloat(property.value, 'b', toSav);
            buffer.transformFloat(property.value, 'a', toSav);
            break;
        case 'InventoryItem':
            buffer.transformString(property.value, 'unk1', toSav, false);
            buffer.transformString(property.value, 'itemName', toSav);
            buffer.transformString(property.value, 'levelName', toSav);
            buffer.transformString(property.value, 'pathName', toSav);
            if (toSav) {
                const oldval = buffer.buffers[buffer.buffers.length - 1]
                    .length;

                buffer.transformString(property.value.properties[0], 'name', toSav);
                transformProperty(buffer, property.value.properties[0], toSav);
                // Dirty hack to make in this one case the inner property
                // only take up 4 bytes
                buffer.buffers[buffer.buffers.length - 1].length =
                    oldval + 4;
            } else {
                const props: Property[] = [];
                const property2: Property = {
                    name: '',
                    type: '',
                    index: 0,
                    value: ''
                };
                buffer.transformString(property2, 'name', toSav);
                if (property2.name === 'None') {
                    break; // end of properties
                }

                transformProperty(buffer, property2, toSav);

                // can't consume null here because it is needed by the entaingling struct
                props.push(property2);
                property.value.properties = props;
            }
            break;
        case 'RailroadTrackPosition':
            buffer.transformString(property.value, 'levelName', toSav);
            buffer.transformString(property.value, 'pathName', toSav);
            buffer.transformFloat(property.value, 'offset', toSav);
            buffer.transformFloat(property.value, 'forward', toSav);
            break;
        case 'TimerHandle':
            buffer.transformString(property.value, 'handle', toSav);
            break;
        case 'Transform':
        case 'RemovedInstanceArray':
        case 'InventoryStack':
        case 'ProjectileData':
            if (toSav) {
                for (const property2 of property.value.properties) {
                    buffer.transformString(property2, 'name', toSav);
                    transformProperty(buffer, property2, toSav);
                }
                buffer.writeLengthPrefixedString('None'); // end of properties
            } else {
                property.value.properties = [];
                // read properties
                while (true) {
                    const property2: Property = {
                        name: '',
                        type: '',
                        index: 0,
                        value: ''
                    };
                    buffer.transformString(property2, 'name', toSav);
                    if (property2.name === 'None') {
                        break; // end of properties
                    }

                    transformProperty(buffer, property2, toSav);
                    property.value.properties.push(property2);

                }
            }

            break;
        default:
            throw new Error(`Unknown struct type ${property.value.type}`)
    }
}
