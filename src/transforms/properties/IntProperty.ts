import { Archive } from '../../Archive';
import { Property } from '../../types';

export default function transformIntProperty(
    ar: Archive, property: Property) {
    ar.transformAssertNullByte(false); // Tag.HasPropertyGuid
    ar.transformInt(property, 'value');
}
