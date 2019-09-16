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

  let keyTransformFunc: (ar: Archive, value: any) => void;
  let valueTransformFunc: (ar: Archive, value: any) => void;

  // set function to transform the keys based on the type
  switch (property.value.keyType) {
    case 'IntProperty':
      keyTransformFunc = transformIntPropertyKey;
      break;
    case 'ObjectProperty':
      keyTransformFunc = transformObjectPropertyKey;
      break;
    case 'StrProperty':
      keyTransformFunc = transformStringPropertyKey;
      break;
    default:
      throw new Error('Unimplemented key type `' + property.value.keyType
        + '` in MapProperty `' + property.name + '`');
  }

  // set function to transform the values based on the type
  switch (property.value.valueType) {
    case 'StructProperty':
      valueTransformFunc = transformStructPropertyValue;
      break;
    case 'ByteProperty':
      /*
      The following two maps both have the property.value.valueType ByteProperty.
      But in the first case the values are stored as bytes and in the second case they are
      stored as strings.

      UPROPERTY(VisibleAnywhere, SaveGame)
      TMap<FName, uint8> TestByteMap;

      UPROPERTY(VisibleAnywhere, SaveGame)
      TMap<FName, TEnumAsByte< EEnabled >> TestEnumAsByteMap;

      */

      let isEnum = false;
      if (ar.isSaving()) {
        if (property.value.values.length > 0) {
          isEnum = typeof property.value.values[0].value === 'string';
        }
      } else {
        // we need to determine whether the value is a string or just a byte
        if (count.count > 0) { // with 0 elements it does not matter
          isEnum = true;

          const lar = (ar as LoadingArchive);
          const bytesRead = lar.bytesRead;
          const cursor = lar.cursor;

          try {
            // peek key
            const tmp = { key: '' };
            keyTransformFunc(ar, tmp);

            // peek value (try string)
            const str = lar.readLengthPrefixedString();
            if (str.length > 512) {
              // heuristic in case the next key is magically again at a correct place
              throw new Error('enum values should not be that long');
            }

            // peek next key (if two or more elements)
            if (count.count > 1) {
              keyTransformFunc(ar, tmp);
            } else {
              // or peek string as name of the next property
              lar.readLengthPrefixedString();
            }

            // if we managed to get here, this is probably a enum as we managed to get a string for
            // the value correctly
          } catch (e) {
            // it failed, so it's probably a byte
            isEnum = false;
          }

          // reset cursor
          lar.bytesRead = bytesRead;
          lar.cursor = cursor;
        }
      }

      if (isEnum) {
        valueTransformFunc = transformEnumBytePropertyValue;
      } else {
        valueTransformFunc = transformBytePropertyValue;
      }

      break;
    default:
      throw new Error('Unimplemented value type `' + property.value.valueType
        + '` in MapProperty `' + property.name + '`');
  }

  for (let i = 0; i < count.count; i++) {
    if (ar.isLoading()) {
      property.value.values[i] = { key: '', value: '' };
    }

    // transform key
    keyTransformFunc(ar, property.value.values[i]);

    // transform value
    valueTransformFunc(ar, property.value.values[i]);
  }
}

function transformIntPropertyKey(ar: Archive, value: any) {
  ar.transformInt(value.key);
}

function transformObjectPropertyKey(ar: Archive, value: any) {
  if (ar.isLoading()) {
    value.key = {};
  }
  ar.transformString(value.key.levelName);
  ar.transformString(value.key.pathName);
}

function transformStringPropertyKey(ar: Archive, value: any) {
  ar.transformString(value.key);
}

function transformStructPropertyValue(ar: Archive, value: any) {
  if (ar.isSaving()) {
    const sar = ar as SavingArchive;
    for (const element of value.value) {
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
    value.value = props;
  }
}

function transformBytePropertyValue(ar: Archive, value: any) {
  ar.transformByte(value.value);
}

function transformEnumBytePropertyValue(ar: Archive, value: any) {
  ar.transformString(value.value);
}
