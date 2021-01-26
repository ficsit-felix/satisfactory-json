export interface SaveGame {
  saveHeaderType: number;
  saveVersion: number;
  buildVersion: number;
  mapName: string;
  mapOptions: string;
  sessionName: string;
  playDurationSeconds: number;
  saveDateTime: string;
  sessionVisibility?: number;
  editorObjectVersion?: number;
  actors: Actor[];
  components: Component[];
  collected: ObjectReference[];
  missing: string;
}

export interface Actor {
  type: number;
  className: string;
  levelName: string;
  pathName: string;
  needTransform: number;
  transform: {
    rotation: number[];
    translation: number[];
    scale3d: number[];
  };
  wasPlacedInLevel: number;
  entity: Entity;
}

export interface Component {
  type: number;
  className: string;
  levelName: string;
  pathName: string;
  outerPathName: string;
  entity: Entity;
}

export interface Entity {
  levelName?: string;
  pathName?: string;
  children?: ObjectReference[];
  properties: Property[];
  missing?: string;
  extra?: any;
}

export interface ObjectReference {
  levelName: string;
  pathName: string;
}

export interface BaseProperty {
  name: string;
  type: string;
  index: number;
}

export interface IntProperty extends BaseProperty {
  value: number;
}

export interface BoolProperty extends BaseProperty {
  value: number;
}

export interface FloatProperty extends BaseProperty {
  value: number;
}

export interface StringProperty extends BaseProperty {
  value: string;
}

export interface NameProperty extends BaseProperty {
  value: string;
}

export interface TextProperty extends BaseProperty {
  value: FText;
}

export interface FText {
  flags: number;
  historyType: number;
  // HISTORYTYPE_BASE
  namespace?: string;
  key?: string;
  sourceString?: string;
  // HISTORYTYPE_ARGUMENTFORMAT
  sourceFmt?: FText;
  arguments?: TextArgument[];
}

export interface TextArgument {
  argumentName: string;
  argumentValueType: number;
  // FORMATARGUMENTTYPE_TEXT
  argumentValue?: FText;
}

export interface ByteProperty extends BaseProperty {
  value: {
    enumName: string;
    valueName?: string;
    value?: number;
  };
}

export interface EnumProperty extends BaseProperty {
  value: {
    enum: string;
    value: string;
  };
}

export interface ObjectProperty extends BaseProperty {
  value: {
    levelName: string;
    pathName: string;
  };
}

export interface StructProperty extends BaseProperty {
  value: {
    type: string;
    [id: string]: any;
  }; // TODO!!
}

export interface ArrayProperty extends BaseProperty {
  value: {
    type: string;
    structName?: string;
    structType?: string;
    structInnerType?: string;
    structUnknown?: string;
    propertyGuid?: string;
    values: any[];
  }; // TODO!!
}

export interface MapProperty extends BaseProperty {
  value: {
    keyType: string;
    valueType: string;
    values: MapEntry[];
  }; // TODO!!
}
interface MapEntry {
  // {[key: string]: any}

  key: any; // keys don't have to be a string (e.g. ObjectProperty), so we cannot
  // simply use an object as a map as was done previously
  value: any;
}

export type Property =
  | IntProperty
  | BoolProperty
  | FloatProperty
  | StringProperty
  | NameProperty
  | TextProperty
  | ByteProperty
  | EnumProperty
  | ObjectProperty
  | StructProperty
  | ArrayProperty
  | MapProperty;
