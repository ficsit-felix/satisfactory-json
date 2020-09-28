// Custom serialization logic for FINNetworkTrace

import { Builder } from '../../../engine/Builder';
import { RegisteredFunction } from '../../../engine/TransformationEngine';

// https://github.com/CoderDE/FicsIt-Networks/blob/ab918a81a8a7527aec0cf6cd35270edfc5a1ddfe/Source/FicsItNetworks/Network/FINNetworkTrace.cpp#L154
export function transformFINNetworkTrace(builder: Builder): void {
  builder.int('valid').if(
    (ctx) => ctx.obj.valid,
    (builder) => {
      builder
        .str('levelName')
        .str('pathName')
        .int('hasPrev')
        .if(
          (ctx) => ctx.obj.hasPrev,
          (builder) => {
            // serialize previous trace
            builder
              .obj('prev')
              .call(RegisteredFunction.transformFINNetworkTrace)
              .endObj();
          }
        )
        .int('hasStep')
        .if(
          (ctx) => ctx.obj.hasStep,
          (builder) => {
            builder.str('step');
          }
        );
    }
  );
}
