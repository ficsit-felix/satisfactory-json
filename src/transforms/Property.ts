import { Archive } from '../Archive';
import { Property } from '../types';
import transformIntProperty from './properties/IntProperty';
import transformBoolProperty from './properties/BoolProperty';
import transformFloatProperty from './properties/FloatProperty';
import transformStringProperty from './properties/StringProperty';
import transformTextProperty from './properties/TextProperty';
import transformByteProperty from './properties/ByteProperty';
import transformEnumProperty from './properties/EnumProperty';
import transformObjectProperty from './properties/ObjectProperty';
import transformMapProperty from './properties/MapProperty';
import transformArrayProperty from './properties/ArrayProperty';
import transformStructProperty from './properties/StructProperty';

// compare to FPropertyTag
export default function transformProperty(ar: Archive, property: Property) {
    ar.transformString(property, 'type'); // Tag.Type
    ar.transformBufferStart(false); // Tag.Size
    ar.transformInt(property, 'index', false); // Tag.ArrayIndex
    switch (property.type) {
        case 'IntProperty':
            transformIntProperty(ar, property);
            break;
        case 'BoolProperty':
            transformBoolProperty(ar, property);
            break;
        case 'FloatProperty':
            transformFloatProperty(ar, property);
            break;
        case 'StrProperty':
        case 'NameProperty':
            transformStringProperty(ar, property);
            break;
        case 'TextProperty':
            transformTextProperty(ar, property);
            break;
        case 'ByteProperty':
            transformByteProperty(ar, property);
            break;
        case 'EnumProperty':
            transformEnumProperty(ar, property);
            break;
        case 'ObjectProperty':
            transformObjectProperty(ar, property);
            break;
        case 'StructProperty':
            transformStructProperty(ar, property);
            break;
        case 'ArrayProperty':
            transformArrayProperty(ar, property);
            break;
        case 'MapProperty':
            transformMapProperty(ar, property);
            break;
        default:
            // console.log(buffer.readHex(32));
            throw Error(`Unkown property type ${property.type}`);
    }
    ar.transformBufferEnd();
    // console.log('property', property);
}
