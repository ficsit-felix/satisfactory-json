export interface SaveGame {
    saveHeaderType: number;
    saveVersion: number;
    buildVersion: number;
    mapName: string;
    mapOptions: string;
    sessionName: string;
    playDurationSeconds: number;
    saveDateTime: string;
    sessionVisibility: number;
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

export interface StrProperty extends BaseProperty {
    value: string;
}

export interface NameProperty extends BaseProperty {
    value: string;
}

export interface TextProperty extends BaseProperty {
    unknown1: number;
    unknown2: number;
    unknown3: number;
    unknown4: string;
    value: string;
}

export interface ByteProperty extends BaseProperty {
    value: {
        unk1: string;
        unk2: number;
    };
}

export interface EnumProperty extends BaseProperty {
    enum: string;
    value: string;
}

export interface ObjectProperty extends BaseProperty {
    value: {
        levelName: string;
        pathName: string;
    };
}

export interface StructProperty extends BaseProperty {
    structUnknown: string;
    value: any; // TODO!!
}

export interface ArrayProperty extends BaseProperty {
    structName?: string;
    structType?: string;
    structInnerType?: string;
    structUnknown?: string;
    value: any; // TODO!!
}

export interface MapProperty extends BaseProperty {
    value: any; // TODO!!
}

export type Property =
    | IntProperty
    | BoolProperty
    | FloatProperty
    | StrProperty
    | NameProperty
    | TextProperty
    | ByteProperty
    | EnumProperty
    | ObjectProperty
    | StructProperty
    | ArrayProperty
    | MapProperty;
