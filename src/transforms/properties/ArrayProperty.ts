import { DataBuffer } from '../../DataBuffer';
import { Property } from '../../types';
import transformProperty from '../Property';

export default function transformArrayProperty(
    buffer: DataBuffer, property: Property, toSav: boolean) {
    if (!toSav) {
        property.value = {
            values: []
        };
    }
    buffer.transformString(property.value, 'type', toSav, false);
    buffer.transformAssertNullByte(toSav, false);
    const itemCount = { count: property.value.values.length };
    buffer.transformInt(itemCount, 'count', toSav);

    switch (property.value.type) {
        case 'IntProperty':
            for (let i = 0; i < itemCount.count; i++) {
                buffer.transformInt(property.value.values, i, toSav);
            }
            break;
        case 'ByteProperty':
            for (let i = 0; i < itemCount.count; i++) {
                buffer.transformByte(property.value.values, i, toSav);
            }
            break;
        case 'ObjectProperty':
            for (let i = 0; i < itemCount.count; i++) {
                if (!toSav) {
                    property.value.values[i] = {};
                }
                buffer.transformString(property.value.values[i], 'levelName', toSav);
                buffer.transformString(property.value.values[i], 'pathName', toSav);
            }
            break;
        case 'StructProperty':
            buffer.transformString(property, 'structName', toSav);
            buffer.transformString(property, 'structType', toSav);
            buffer.transformBufferStart(toSav, false);
            const zero = {zero: 0};
            buffer.transformInt(zero, 'zero', toSav, false);
            if (zero.zero !== 0) {
                throw new Error(`Not zero, but ${zero.zero}`);
            }
            buffer.transformString(property, 'structInnerType', toSav);
            buffer.transformHex(property.value, 'unknown', 16, toSav, false);
            buffer.transformAssertNullByte(toSav, false);

            // TODO find a better way to make this bidirectional?
            if (toSav) {
                for (const prop of property.value.values) {
                    const obj = prop;
                    for (const innerProp of obj.properties) {
                        buffer.transformString(innerProp, 'name', toSav);
                        transformProperty(buffer, innerProp, toSav);
                    }
                    buffer.writeLengthPrefixedString('None'); // end of properties
                }

            } else {
                for (let j = 0; j < itemCount.count; j++) {
                    const props: Property[] = [];
                    while (true) {
                        const innerProperty: Property = {
                            name: '',
                            type: '',
                            index: 0,
                            value: ''
                        };
                        buffer.transformString(innerProperty, 'name', toSav);
                        if (innerProperty.name === 'None') {
                            break; // end of properties
                        }
                       // console.log(property);
                        // console.log('building...',innerProperty.name,j);
                        transformProperty(buffer, innerProperty, toSav);
                        props.push(innerProperty);
                    }
                    property.value.values.push({
                        properties: props
                    });
                }
            }

            buffer.transformBufferEnd(toSav);
            break;
        default:
            throw Error(`Unknown array type: ${property.value.type}`);
            break;
    }
}
