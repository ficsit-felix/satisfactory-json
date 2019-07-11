import { DataBuffer } from '../../../DataBuffer';
import { Property } from '../../../types';
import transformProperty from '../../Property';
export function transformArbitraryStruct(buffer: DataBuffer, property: Property, toSav: boolean) {
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
}
