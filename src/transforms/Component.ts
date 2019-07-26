import { Component } from '../types';
import { Archive } from '../Archive';

export default function transformComponent(
  ar: Archive,
  component: Component
) {
  ar.transformString(component, 'className');
  ar.transformString(component, 'levelName');
  ar.transformString(component, 'pathName');
  ar.transformString(component, 'outerPathName');
}
