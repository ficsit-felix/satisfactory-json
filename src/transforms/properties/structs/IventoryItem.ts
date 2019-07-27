import { Archive, SavingArchive } from '../../../Archive';
import { Property } from '../../../types';
import transformProperty from '../../Property';
export function transformInventoryItem(ar: Archive, property: Property) {
    ar._String(property.value, 'unk1', false);
    ar._String(property.value, 'itemName');
    ar._String(property.value, 'levelName');
    ar._String(property.value, 'pathName');
    if (ar.isSaving()) {
        const sar = ar as SavingArchive;
        const oldval = sar.buffers[sar.buffers.length - 1]
            .length;
        ar._String(property.value.properties[0], 'name'); // Tag.Name
        transformProperty(ar, property.value.properties[0]);
        // Dirty hack to make in this one case the inner property
        // only take up 4 bytes
        sar.buffers[sar.buffers.length - 1].length =
            oldval + 4;
    } else {
        const props: Property[] = [];
        const property2: Property = {
            name: '',
            type: '',
            index: 0,
            value: ''
        };
        ar._String(property2, 'name'); // Tag.Name
        if (property2.name === 'None') {
            return; // end of properties
        }
        transformProperty(ar, property2);
        // can't consume null here because it is needed by the entaingling struct
        props.push(property2);
        property.value.properties = props;
    }
}
