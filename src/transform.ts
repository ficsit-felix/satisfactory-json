import { SaveGame, Actor, Entity, Component, Property } from './types';
import { DataBuffer } from './DataBuffer';
import transformProperty from './transforms/Property';

/**
 *
 * @param toSav direction in which to transform. false: sav2json, true: json2sav
 */
export function transform(buffer: DataBuffer, saveGame: SaveGame, toSav: boolean) {
    transformHeader(buffer, saveGame, toSav);

    console.log(saveGame);

    const entryCount = {
        entryCount: saveGame.actors.length +
            saveGame.components.length
    };
    buffer.transformInt(entryCount, 'entryCount', toSav);

    for (let i = 0; i < entryCount.entryCount; i++) {
        transformActorOrComponent(buffer, saveGame, i, toSav);
    }

    buffer.transformInt(entryCount, 'entryCount', toSav);
    for (let i = 0; i < entryCount.entryCount; i++) {
        if (i < saveGame.actors.length) {
            const actor = saveGame.actors[i];
            transformEntity(buffer, actor.entity, true, actor.className, toSav);
        } else {
            const component = saveGame.components[i - saveGame.actors.length];
            transformEntity(buffer, component.entity, false, component.className, toSav);
        }
    }

    const collectedCount = {
        count: saveGame.collected.length
    };
    buffer.transformInt(collectedCount, 'count', toSav);
    for (let i = 0; i < collectedCount.count; i++) {
        if (!toSav) {
            saveGame.collected.push({ levelName: '', pathName: '' });
        }
        buffer.transformString(saveGame.collected[i], 'levelName', toSav);
        buffer.transformString(saveGame.collected[i], 'pathName', toSav);
    }

    // TODO missing

}

function transformHeader(buffer: DataBuffer, saveGame: SaveGame, toSav: boolean) {
    buffer.transformInt(saveGame, 'saveHeaderType', toSav);
    buffer.transformInt(saveGame, 'saveVersion', toSav);
    buffer.transformInt(saveGame, 'buildVersion', toSav);
    buffer.transformString(saveGame, 'mapName', toSav);
    buffer.transformString(saveGame, 'mapOptions', toSav);
    buffer.transformString(saveGame, 'sessionName', toSav);
    buffer.transformInt(saveGame, 'playDurationSeconds', toSav);
    buffer.transformLong(saveGame, 'saveDateTime', toSav);
    if (saveGame.saveHeaderType > 4) {
        buffer.transformByte(saveGame, 'sessionVisibility', toSav);
    }
}

function transformActorOrComponent(buffer: DataBuffer, saveGame: SaveGame, id: number, toSav: boolean) {
    if (!toSav) {
        const type = buffer.readInt();
        if (type === 1) {
            const actor = {
                type: 1,
                className: '',
                levelName: '',
                pathName: '',
                needTransform: 0,
                transform: {
                    rotation: [],
                    translation: [],
                    scale3d: [],
                },
                wasPlacedInLevel: 0,
                entity: {
                    children: [],
                    properties: []
                }

            };
            transformActor(buffer, actor, toSav);
            saveGame.actors.push(actor);
        } else if (type === 0) {
            const component = {
                type: 0,
                className: '',
                levelName: '',
                pathName: '',
                outerPathName: '',
                entity: {
                    properties: []
                }
            };
            transformComponent(buffer, component, toSav);
            saveGame.components.push(component);
        } else {
            throw new Error(`Unknown type ${type}`);
        }
    } else {
        if (id < saveGame.actors.length) {
            transformActor(buffer, saveGame.actors[id], toSav);
        }
    }
}

function transformActor(buffer: DataBuffer, actor: Actor, toSav: boolean) {
    buffer.transformString(actor, 'className', toSav);
    buffer.transformString(actor, 'levelName', toSav);
    buffer.transformString(actor, 'pathName', toSav);
    buffer.transformInt(actor, 'needTransform', toSav);
    buffer.transformFloat(actor.transform.rotation, 0, toSav);
    buffer.transformFloat(actor.transform.rotation, 1, toSav);
    buffer.transformFloat(actor.transform.rotation, 2, toSav);
    buffer.transformFloat(actor.transform.rotation, 3, toSav);
    buffer.transformFloat(actor.transform.translation, 0, toSav);
    buffer.transformFloat(actor.transform.translation, 1, toSav);
    buffer.transformFloat(actor.transform.translation, 2, toSav);
    buffer.transformFloat(actor.transform.scale3d, 0, toSav);
    buffer.transformFloat(actor.transform.scale3d, 1, toSav);
    buffer.transformFloat(actor.transform.scale3d, 2, toSav);
    buffer.transformInt(actor, 'wasPlacedInLevel', toSav);
}

function transformComponent(buffer: DataBuffer, component: Component, toSav: boolean) {
    buffer.transformString(component, 'className', toSav);
    buffer.transformString(component, 'levelName', toSav);
    buffer.transformString(component, 'pathName', toSav);
    buffer.transformString(component, 'outerPathName', toSav);
}

/* interface Reference {
    obj: any;
    key: Key;
}

function ref(obj: any, key: Key): Reference {
    return {
        obj,
        key
    };
}
*/
function transformEntity(buffer: DataBuffer, entity: Entity,
                         withNames: boolean, className: string, toSav: boolean) {
    const length = buffer.transformBufferStart(toSav, true);

    if (withNames) {
        buffer.transformString(entity, 'levelName', toSav);
        buffer.transformString(entity, 'pathName', toSav);
        const childCount = { count: entity.children!.length };
        buffer.transformInt(childCount, 'count', toSav);
        for (let i = 0; i < childCount.count; i++) {
            if (!toSav) {
                entity.children!.push({ levelName: '', pathName: '' });
            }
            buffer.transformString(entity.children![i], 'levelName', toSav);
            buffer.transformString(entity.children![i], 'pathName', toSav);
        }
    }

    transformProperties(buffer, entity, toSav);

    const extraObjectCount = {count: 0};
    buffer.transformInt(extraObjectCount, 'count', toSav);
    if (extraObjectCount.count !== 0) {
        throw Error(`Extra object count not zero, but ${extraObjectCount.count}`);
    }

    // TODO read extra

    // read missing
    if (toSav) {
        if (entity.missing !== undefined) {
            buffer.writeHex(entity.missing);
        }
    } else {
        const missing = length - buffer.bytesRead;
        if (missing > 0) {
            entity.missing = buffer.readHex(missing);
            console.warn('missing data found in entity of type ' + className +
                ': ' + entity.missing);
        } else if (missing < 0) {
            throw Error('negative missing amount in entity of type ' + className + ': ' + missing);
        }
    }
//    console.log('finished entity', entity);
    buffer.transformBufferEnd(toSav);
}

function transformProperties(buffer: DataBuffer, entity: Entity, toSav: boolean) {
//    console.log(entity);
    if (toSav) {
        for (const property of entity.properties) {
            buffer.transformString(property, 'name', toSav);
            transformProperty(buffer, property, toSav);
        }
        buffer.writeLengthPrefixedString('None'); // end of properties
    } else {
        // read properties
        while (true) {
            const property: Property = {
                name: '',
                type: '',
                index: 0,
                value: ''
            };
            buffer.transformString(property, 'name', toSav);
            if (property.name === 'None') {
                break; // end of properties
            }

            transformProperty(buffer, property, toSav);
            entity.properties.push(property);
            //console.log('property built', property);

        }

    }

}

export function sav2json(buffer: Buffer): SaveGame {
    const saveGame: SaveGame = {
        saveHeaderType: 0,
        saveVersion: 0,
        buildVersion: 0,
        mapName: '',
        mapOptions: '',
        sessionName: '',
        playDurationSeconds: 0,
        saveDateTime: '',
        sessionVisibility: 0,
        actors: []
        , components: [],
        collected: [],
        missing: ''
    };
    transform(new DataBuffer(buffer), saveGame, false);
    return saveGame;
}
