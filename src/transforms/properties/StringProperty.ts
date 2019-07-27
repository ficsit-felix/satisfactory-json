import { Archive } from '../../Archive';
import { StringProperty } from '../../types';

export default function transformStringProperty(
    ar: Archive, property: StringProperty) {
    ar.transformAssertNullByte(false); // Tag.HasPropertyGuid
    ar.transformString(property.value);
}
