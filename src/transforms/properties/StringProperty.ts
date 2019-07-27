import { Archive } from '../../Archive';
import { Property } from '../../types';

export default function transformStringProperty(
    ar: Archive, property: Property) {
    ar.transformAssertNullByte(false); // Tag.HasPropertyGuid
    ar._String(property, 'value');
}
