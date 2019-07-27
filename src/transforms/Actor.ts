import { Archive } from '../Archive';
import { Actor } from '../types';

export default function transformActor(ar: Archive, actor: Actor) {
  ar.transformString(actor.className);
  ar.transformString(actor.levelName);
  ar.transformString(actor.pathName);
  ar.transformInt(actor.needTransform);
  ar.transformFloat(actor.transform.rotation[0]);
  ar.transformFloat(actor.transform.rotation[1]);
  ar.transformFloat(actor.transform.rotation[2]);
  ar.transformFloat(actor.transform.rotation[3]);
  ar.transformFloat(actor.transform.translation[0]);
  ar.transformFloat(actor.transform.translation[1]);
  ar.transformFloat(actor.transform.translation[2]);
  ar.transformFloat(actor.transform.scale3d[0]);
  ar.transformFloat(actor.transform.scale3d[1]);
  ar.transformFloat(actor.transform.scale3d[2]);
  ar.transformInt(actor.wasPlacedInLevel);
}
