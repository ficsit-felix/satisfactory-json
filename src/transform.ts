import { SaveGame, Actor, Entity } from './types';

class DataBuffer {
    public readInt(): number {
        return 5;
    }

    public writeInt(x: number) {
        console.log(`wrote ${x}`);
    }

    public transformInt(obj: any, key: string | number, toSav: boolean) {
        if (toSav) {
            obj[key] = this.readInt();
        } else {
            this.writeInt(obj[key]);
        }
    }

    public transformString(obj: any, key: string, toSav: boolean) {

    }

    public transformFloat(obj: any, key: string | number, toSav: boolean) {

    }
}


/**
 * 
 * @param toSav direction in which to transform. false: sav2json, true: json2sav
 */
export function transform(buffer: DataBuffer, saveGame: SaveGame, toSav: boolean) {
    transformHeader(buffer, saveGame, toSav);
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
        if (toSav) {
            saveGame.collected.push({ levelName: '', pathName: '' });
        }
        buffer.transformString(saveGame.collected[i], 'levelName', toSav);
        buffer.transformString(saveGame.collected[i], 'pathName', toSav);
    }

}

function transformHeader(buffer: DataBuffer, saveGame: SaveGame, toSav: boolean) {
    buffer.transformInt(saveGame, 'saveHeaderType', toSav);
    buffer.transformInt(saveGame, 'saveVersion', toSav);
    buffer.transformInt(saveGame, 'buildVersion', toSav);
    buffer.transformString(saveGame, 'mapName', toSav);
}

function transformActorOrComponent(buffer: DataBuffer, saveGame: SaveGame, id: number, toSav: boolean) {
    if (toSav) {
        const type = buffer.readInt();
        if (type === 1) {
            const actor = {

            };
            transformActor(actor, toSav);
            saveGame.actors.push(actor);
        } else if (type === 0) {
            const component = {};
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

}

/*
type Key = string | number;
interface Reference {
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
function transformEntity(buffer: DataBuffer, entity: Entity, withNames: boolean, className: string, toSav: boolean) {

}


function sav2json(buffer: DataBuffer): SaveGame {
    const saveGame: SaveGame = {
        saveHeaderType: 0,
        saveVersion: 0,
        buildVersion: 0,
        mapName: "",
        mapOptions: "",
        sessionName: "",
        playDurationSeconds: 0,
        saveDateTime: "",
        sessionVisibility: 0,
        actors: []
        , components: [],
        collected: [],
        missing: ''
    };
    transform(buffer, saveGame, false);
    return saveGame;
}

console.log(sav2json(new DataBuffer()));