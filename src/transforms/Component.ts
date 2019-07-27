import { Component } from '../types';
import { Archive } from '../Archive';

export default function transformComponent(
  ar: Archive,
  component: Component
) {
  ar._String(component, 'className');
  ar._String(component, 'levelName');
  ar._String(component, 'pathName');
  ar._String(component, 'outerPathName');
}
