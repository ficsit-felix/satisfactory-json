import { Builder } from '../engine/Builder';
import { transformExtra } from './Extra';
import { transformProperty } from './Property';

// TODO _withNames
export function transformEntity(builder: Builder) {
  builder
    .bufferStart('_length', true)
    .debug('_length', ctx => ctx.vars._length)

    .if(ctx => ctx.vars._withNames, builder => {
      builder
        .str('levelName')
        .str('pathName')
        .int('_childCount', ctx => ctx.obj.children.length)
        .arr('children')
        .loop('_childCount', builder => {
          builder
            .elem('_index')
            .str('levelName')
            .str('pathName')
            .endElem();
        });
    })
    .exec(ctx => console.log('entity', ctx.obj))
    .call(transformProperties)
    .int('_extraObjectCount', ctx => 0)
    .exec(ctx => {
      if (ctx.vars._extraObjectCount !== 0) {
        throw Error(`Extra object count not zero, but ${ctx.vars._extraObjectCount}`);
      }
    })
    .call(transformExtra)
    // TODO read missing data
    .bufferEnd();
}

export function transformProperties(builder: Builder) {
  builder
    .arr('properties')
    .exec(ctx => ctx.vars._propertiesCount = ctx.isLoading ? 999999999 : ctx.obj.properites.length)
    .loop('_propertiesCount', builder => {
      builder.str('_name')
        .if(ctx => ctx.vars._name === 'None', builder => builder.break())
        .exec(ctx => console.log('properties._index', ctx.vars._index))
        .elem('_index')
        .call(transformProperty)
        .endElem()
    })
    .endArr();
}