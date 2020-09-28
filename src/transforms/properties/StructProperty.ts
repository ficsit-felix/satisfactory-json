import { Builder } from '../../engine/Builder';
import { transformVector } from './structs/Vector';
import { transformArbitraryStruct } from './structs/ArbitraryStruct';
import { transformBox } from './structs/Box';
import { transformInventoryItem } from './structs/InventoryItem';
import { transformColor } from './structs/Color';
import { transformLinearColor } from './structs/LinearColor';
import { transformQuat } from './structs/Quat';
import { transformRailroadTrackPosition } from './structs/RailroadTrackPosition';
import { transformTimerHandle } from './structs/TimerHandle';
import { transformGuid } from './structs/Guid';
import { transformFluidBox } from './structs/FluidBox';
import { transformSlateBrush } from './structs/SlateBrush';
import { transformVector2D } from './structs/Vector2D';
import { transformFINNetworkTrace } from './structs/FINetworkTrace';

export function transformStructProperty(builder: Builder): void {
  builder
    .obj('value')
    .str('type', false) // Tag.StructName
    .int('_zero0', (_) => 0, false) // Tag.StructGuid
    .int('_zero1', (_) => 0, false)
    .int('_zero2', (_) => 0, false)
    .int('_zero3', (_) => 0, false)
    .exec((ctx) => {
      if (
        ctx.tmp._zero0 !== 0 ||
        ctx.tmp._zero1 !== 0 ||
        ctx.tmp._zero2 !== 0 ||
        ctx.tmp._zero3 !== 0
      ) {
        throw new Error(
          'Struct GUID not 0, but ' +
            ctx.tmp._zero0 +
            ' ' +
            ctx.tmp._zero1 +
            ' ' +
            ctx.tmp._zero2 +
            ' ' +
            ctx.tmp._zero3
        );
      }
    })
    .assertNullByte(false) // Tag.HasPropertyGuid
    .switch('type', {
      Vector: (builder) => transformVector(builder),
      Rotator: (builder) => transformVector(builder),
      Box: (builder) => transformBox(builder),
      Color: (builder) => transformColor(builder),
      LinearColor: (builder) => transformLinearColor(builder),
      Quat: (builder) => transformQuat(builder),
      InventoryItem: (builder) => transformInventoryItem(builder),
      RailroadTrackPosition: (builder) =>
        transformRailroadTrackPosition(builder),
      TimerHandle: (builder) => transformTimerHandle(builder),
      Transform: (builder) => transformArbitraryStruct(builder),
      RemovedInstanceArray: (builder) => transformArbitraryStruct(builder),
      InventoryStack: (builder) => transformArbitraryStruct(builder),
      ProjectileData: (builder) => transformArbitraryStruct(builder),
      Guid: (builder) => transformGuid(builder),
      TrainSimulationData: (builder) => transformArbitraryStruct(builder),
      FluidBox: (builder) => transformFluidBox(builder),
      ResearchData: (builder) => transformArbitraryStruct(builder),
      SlateBrush: (builder) => transformSlateBrush(builder),
      Hotbar: (builder) => transformArbitraryStruct(builder),
      EnabledCheats: (builder) => transformArbitraryStruct(builder),
      Vector2D: (builder) => transformVector2D(builder),
      FINNetworkTrace: (builder) => transformFINNetworkTrace(builder),
      $default: (builder) =>
        builder.error((ctx) => `Unknown struct property: ${ctx.obj.type}`),
    })
    .endObj();
}
