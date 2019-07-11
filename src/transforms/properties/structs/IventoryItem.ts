import { DataBuffer } from '../../../DataBuffer';
import { Property } from '../../../types';
import transformProperty from '../../Property';
export function transformInventoryItem(buffer: DataBuffer, property: Property, toSav: boolean) {
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
    }
    else {
        const props: Property[] = [];
        const property2: Property = {
            name: '',
            type: '',
            index: 0,
            value: ''
        };
        buffer.transformString(property2, 'name', toSav);
        if (property2.name === 'None') {
            return; // end of properties
        }
        transformProperty(buffer, property2, toSav);
        // can't consume null here because it is needed by the entaingling struct
        props.push(property2);
        property.value.properties = props;
    }
}
