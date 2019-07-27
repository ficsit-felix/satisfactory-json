import { Archive } from '../Archive';
import { Actor } from '../types';

export default function transformActor(ar: Archive, actor: Actor) {
  ar._String(actor, 'className');
  ar._String(actor, 'levelName');
  ar._String(actor, 'pathName');
  ar._Int(actor, 'needTransform');
  ar._Float(actor.transform.rotation, 0);
  ar._Float(actor.transform.rotation, 1);
  ar._Float(actor.transform.rotation, 2);
  ar._Float(actor.transform.rotation, 3);
  ar._Float(actor.transform.translation, 0);
  ar._Float(actor.transform.translation, 1);
  ar._Float(actor.transform.translation, 2);
  ar._Float(actor.transform.scale3d, 0);
  ar._Float(actor.transform.scale3d, 1);
  ar._Float(actor.transform.scale3d, 2);
  ar._Int(actor, 'wasPlacedInLevel');
}
