import { Archive, LoadingArchive, SavingArchive } from '../../Archive';
import { Property } from '../../types';
import transformProperty from '../Property';

export default function transformArrayProperty(
    ar: Archive, property: Property) {
    if (ar.isLoading()) {
        property.value = {
            values: []
        };
    }
    ar.transformString(property.value, 'type', false); // Tag.InnerType
    ar.transformAssertNullByte(false);   // Tag.HasPropertyGuid
    const itemCount = { count: property.value.values.length };
    ar.transformInt(itemCount, 'count');

    switch (property.value.type) {
        case 'IntProperty':
            for (let i = 0; i < itemCount.count; i++) {
                ar.transformInt(property.value.values, i);
            }
            break;
        case 'ByteProperty':
            for (let i = 0; i < itemCount.count; i++) {
                ar.transformByte(property.value.values, i);
            }
            break;
        case 'EnumProperty':
            for (let i = 0; i < itemCount.count; i++) {
                ar.transformString(property.value.values, i);
            }
            break;
        case 'ObjectProperty':
            for (let i = 0; i < itemCount.count; i++) {
                if (ar.isLoading()) {
                    property.value.values[i] = {};
                }
                ar.transformString(property.value.values[i], 'levelName');
                ar.transformString(property.value.values[i], 'pathName');
            }
            break;
        case 'StructProperty':
            ar.transformString(property, 'structName');
            ar.transformString(property, 'structType');
            ar.transformBufferStart(false);
            const zero = { zero: 0 };
            ar.transformInt(zero, 'zero', false);
            if (zero.zero !== 0) {
                throw new Error(`Not zero, but ${zero.zero}`);
            }
            ar.transformString(property, 'structInnerType');
            ar.transformHex(property.value, 'unknown', 16, false);
            ar.transformAssertNullByte(false);

            // TODO find a better way to make this bidirectional?
            if (ar.isSaving()) {
                for (const prop of property.value.values) {
                    const obj = prop;
                    for (const innerProp of obj.properties) {
                        ar.transformString(innerProp, 'name'); // Tag.Name
                        transformProperty(ar, innerProp);
                    }
                    (ar as SavingArchive).writeLengthPrefixedString('None'); // end of properties
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
                        ar.transformString(innerProperty, 'name'); // Tag.Name
                        if (innerProperty.name === 'None') {
                            break; // end of properties
                        }
                        // console.log(property);
                        // console.log('building...',innerProperty.name,j);
                        transformProperty(ar, innerProperty);
                        props.push(innerProperty);
                    }
                    property.value.values.push({
                        properties: props
                    });
                }
            }

            ar.transformBufferEnd();
            break;
        default:
            throw Error(`Unknown array type: ${property.value.type}`);
            break;
    }
}
