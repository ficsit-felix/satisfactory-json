import { Builder } from '../../../engine/Builder';

export function transformColor(builder: Builder) {
  builder
    //.obj('value') // TODO readd 
    .byte('b')
    .byte('g')
    .byte('r')
    .byte('a')
    //.endObj();
}