import { Archive, SavingArchive, LoadingArchive } from '../../Archive';
import { MapProperty, Property } from '../../types';
import transformProperty from '../Property';

export default function transformMapProperty(
    ar: Archive, property: MapProperty) {

    if (ar.isLoading()) {
        property.value = {
            keyType: '',
            valueType: '',
            values: []
        };
    }
    ar.transformString(property.value.keyType, false); // Tag.InnerType
    ar.transformString(property.value.valueType, false); // Tag.ValueType
    ar.transformAssertNullByte(false); // Tag.HasPropertyGuid
    const nullInt = { value: 0 };
    ar.transformInt(nullInt.value);
    if (nullInt.value !== 0) {
        throw Error(`Not 0, but ${nullInt.value}`);
    }

    const count = { count: property.value.values.length };
    ar.transformInt(count.count);

    for (let i = 0; i < count.count; i++) {
        if (ar.isLoading()) {
            property.value.values[i] = { key: '', value: '' };
        }

        // transform key
        switch (property.value.keyType) {
            case 'IntProperty':
                ar.transformInt(property.value.values[i].key);
                break;
            case 'ObjectProperty':
                if (ar.isLoading()) {
                    property.value.values[i].key = {};
                }
                ar.transformString(property.value.values[i].key.levelName);
                ar.transformString(property.value.values[i].key.pathName);
                break;
            default:
                throw new Error('Unimplemented key type `' + property.value.keyType
                    + '` in MapProperty `' + property.name + '`');
        }

        // transform value
        switch (property.value.valueType) {
            case 'StructProperty':
                if (ar.isSaving()) {
                    const sar = ar as SavingArchive;
                    for (const element of property.value.values[i].value) {
                        ar.transformString(element.name); // Tag.Name
                        transformProperty(ar, element);
                    }
                    sar.writeLengthPrefixedString('None'); // end of properties
                } else {
                    const props: Property[] = [];
                    while (true) {
                        const innerProperty: Property = {
                            name: '',
                            type: '',
                            index: 0,
                            value: ''
                        };
                        ar.transformString(innerProperty.name); // Tag.Name
                        if (innerProperty.name === 'None') {
                            break; // end of properties
                        }

                        transformProperty(ar, innerProperty);
                        props.push(innerProperty);
                    }
                    property.value.values[i].value = props;
                }
                break;
            case 'ByteProperty':
                ar.transformByte(property.value.values[i].value);
                break;
            default:
                throw new Error('Unimplemented value type `' + property.value.valueType
                    + '` in MapProperty `' + property.name + '`');
        }
    }
}
