import { DataBuffer } from '../DataBuffer';
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

export default function transformProperty(buffer: DataBuffer, property: Property, toSav: boolean) {
    buffer.transformString(property, 'type', toSav);
    buffer.transformBufferStart(toSav, false);
    buffer.transformInt(property, 'index', false);
    switch (property.type) {
        case 'IntProperty':
            transformIntProperty(buffer, property, toSav);
            break;
        case 'BoolProperty':
            transformBoolProperty(buffer, property, toSav);
            break;
        case 'FloatProperty':
            transformFloatProperty(buffer, property, toSav);
            break;
        case 'StrProperty':
        case 'NameProperty':
            transformStringProperty(buffer, property, toSav);
            break;
        case 'TextProperty':
            transformTextProperty(buffer, property, toSav);
            break;
        case 'ByteProperty':
            transformByteProperty(buffer, property, toSav);
            break;
        case 'EnumProperty':
            transformEnumProperty(buffer, property, toSav);
            break;
        case 'ObjectProperty':
            transformObjectProperty(buffer, property, toSav);
            break;
        case 'StructProperty':
            transformStructProperty(buffer, property, toSav);
            break;
        case 'ArrayProperty':
            transformArrayProperty(buffer, property, toSav);
            break;
        case 'MapProperty':
            transformMapProperty(buffer, property, toSav);
            break;
        default:
            //console.log(buffer.readHex(32));
            throw Error(`Unkown property type ${property.type}`);
    }
    buffer.transformBufferEnd(toSav);
    //console.log('property', property);
}
