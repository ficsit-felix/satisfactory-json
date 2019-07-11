import { DataBuffer } from '../../DataBuffer';
import { Property } from '../../types';
import transformProperty from '../Property';

export default function transformMapProperty(
    buffer: DataBuffer, property: Property, toSav: boolean) {

    if (!toSav) {
        property.value = {};
    }
    buffer.transformString(property.value, 'name', toSav, false);
    buffer.transformString(property.value, 'type', toSav, false);
    buffer.transformAssertNullByte(toSav, false);
    const nullInt = {value: 0};
    buffer.transformInt(nullInt, 'value', toSav);
    if (nullInt.value !== 0) {
        throw Error(`Not 0, but ${nullInt.value}`);
    }
    
    // TODO find a better way to make this bidirectional?
    if (toSav) {
        const keys = Object.keys(property.value.values);
        buffer.writeInt(keys.length);
        for (const key of keys) {
            // (let [key, value] of property.value.values) {
            const value = property.value.values[key];
            buffer.writeInt(+key); // parse key to int
            for (const element of value) {
                buffer.transformString(property, 'name', toSav);
                transformProperty(buffer, property, toSav);
            }
            buffer.writeLengthPrefixedString('None'); // end of properties
        }
    } else {
        const count = buffer.readInt();
        //console.log('counti', count);
        const mapValues: { [id: string]: Property[] } = {};
        for (let i = 0; i < count; i++) {
            const key = buffer.readInt();
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
    
                transformProperty(buffer, innerProperty, toSav);
                props.push(innerProperty);
               // console.log('inner', innerProperty);
            }
    
            mapValues[key] = props;
        }
        property.value.values = mapValues;

    }
}
