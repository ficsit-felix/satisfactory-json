import { Archive } from '../Archive';
import {
    Property,
    ByteProperty,
    IntProperty,
    BoolProperty,
    FloatProperty,
    StringProperty,
    TextProperty, EnumProperty, ObjectProperty, StructProperty, ArrayProperty, MapProperty
} from '../types';
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
    ar.transformString(property.type); // Tag.Type
    ar.transformBufferStart(false); // Tag.Size
    ar.transformInt(property.index, false); // Tag.ArrayIndex
    switch (property.type) {
        case 'IntProperty':
            transformIntProperty(ar, property as IntProperty);
            break;
        case 'BoolProperty':
            transformBoolProperty(ar, property as BoolProperty);
            break;
        case 'FloatProperty':
            transformFloatProperty(ar, property as FloatProperty);
            break;
        case 'StrProperty':
        case 'NameProperty':
            transformStringProperty(ar, property as StringProperty);
            break;
        case 'TextProperty':
            transformTextProperty(ar, property as TextProperty);
            break;
        case 'ByteProperty':
            transformByteProperty(ar, property as ByteProperty);
            break;
        case 'EnumProperty':
            transformEnumProperty(ar, property as EnumProperty);
            break;
        case 'ObjectProperty':
            transformObjectProperty(ar, property as ObjectProperty);
            break;
        case 'StructProperty':
            transformStructProperty(ar, property as StructProperty);
            break;
        case 'ArrayProperty':
            transformArrayProperty(ar, property as ArrayProperty);
            break;
        case 'MapProperty':
            transformMapProperty(ar, property as MapProperty);
            break;
        default:
            throw Error(`Unkown property type ${property.type}`);
    }
    ar.transformBufferEnd();
}
