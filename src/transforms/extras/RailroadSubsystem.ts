import { Builder } from '../../engine/Builder';

export function transformRailroadSubsystem(builder: Builder) {

  // TODO add workaround for broken experimental saves?
  builder
    .obj('extra')
    .int('_trainCount', ctx => ctx.obj.trains.length)
    .arr('trains')
    .loop('_trainCount', builder => {
      builder.elem('_index')
        .hex('unknown', 4)
        .str('firstLevelName')
        .str('firstPathName')
        .str('secondLevelName')
        .str('secondPathName')
        .str('timetableLevelName')
        .str('timetablePathName')
        .endElem()
    })
    .endArr()
    .endObj();
}