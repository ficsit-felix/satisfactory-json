import { Builder } from '../../engine/Builder';

export function transformCircuitSubsystem(builder: Builder): void {
  builder
    .obj('extra')
    .int('_circuitCount', (ctx) => ctx.obj.circuits.length)
    .arr('circuits')
    .loop('_circuitCount', (builder) => {
      builder
        .elem('_index')
        .int('circuitId')
        .str('levelName')
        .str('pathName')
        .endElem();
    })
    .endArr()
    .endObj();
}
