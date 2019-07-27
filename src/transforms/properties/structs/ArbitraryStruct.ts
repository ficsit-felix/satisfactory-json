import { Archive, SavingArchive } from '../../../Archive';
import { Property } from '../../../types';
import transformProperty from '../../Property';
export function transformArbitraryStruct(ar: Archive, property: Property) {
    if (ar.isSaving()) {
        for (const property2 of property.value.properties) {
            ar._String(property2, 'name'); // Tag.Name
            transformProperty(ar, property2);
        }
        (ar as SavingArchive).writeLengthPrefixedString('None'); // end of properties
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
            ar._String(property2, 'name'); // Tag.Name
            if (property2.name === 'None') {
                break; // end of properties
            }
            transformProperty(ar, property2);
            property.value.properties.push(property2);
        }
    }
}
