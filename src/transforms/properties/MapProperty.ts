import { Archive, SavingArchive, LoadingArchive } from '../../Archive';
import { MapProperty, Property } from '../../types';
import transformProperty from '../Property';

export default function transformMapProperty(
    ar: Archive, property: MapProperty) {

    if (ar.isLoading()) {
        property.value = {};
    }
    ar.transformString(property.value.name, false); // Tag.InnerType
    ar.transformString(property.value.type, false); // Tag.ValueType
    ar.transformAssertNullByte(false); // Tag.HasPropertyGuid
    const nullInt = { value: 0 };
    ar.transformInt(nullInt.value);
    if (nullInt.value !== 0) {
        throw Error(`Not 0, but ${nullInt.value}`);
    }

    // TODO find a better way to make this bidirectional?
    if (ar.isSaving()) {
        const sar = ar as SavingArchive;
        const keys = Object.keys(property.value.values);
        sar.writeInt(keys.length);
        for (const key of keys) {
            const value = property.value.values[key];
            sar.writeInt(+key); // parse key to int
            for (const element of value) {
                ar.transformString(element.name); // Tag.Name
                transformProperty(ar, element);
            }
            sar.writeLengthPrefixedString('None'); // end of properties
        }
    } else {
        const lar = ar as LoadingArchive;
        const count = lar.readInt();
        // console.log('counti', count);
        const mapValues: { [id: string]: Property[] } = {};
        for (let i = 0; i < count; i++) {
            const key = lar.readInt();
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
                // console.log('inner', innerProperty);
            }

            mapValues[key] = props;
        }
        property.value.values = mapValues;

    }
}
