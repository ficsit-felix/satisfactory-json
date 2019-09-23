import { Builder } from '../engine/Builder';
import { transformCircuitSubsystem } from './extras/CircuitSubsystem';
import { transformRailroadSubsystem } from './extras/RailroadSubsystem';

export function transformExtra(builder: Builder) {
  builder
    .switch('_className', {
      /*    '/Game/FactoryGame/Buildable/Factory/PowerLine/Build_PowerLine.Build_PowerLine_C':
            (builder: Builder) => builder.call(transformPowerLine),*/
      '/Game/FactoryGame/-Shared/Blueprint/BP_CircuitSubsystem.BP_CircuitSubsystem_C':
        (builder: Builder) => builder.call(transformCircuitSubsystem),
      /*'/Game/FactoryGame/-Shared/Blueprint/BP_GameMode.BP_GameMode_C':
        (builder: Builder) => builder.call(transformGameMode),
      '/Game/FactoryGame/-Shared/Blueprint/BP_GameState.BP_GameState_C':
        (builder: Builder) => builder.call(transformGameState),*/
      '/Game/FactoryGame/-Shared/Blueprint/BP_RailroadSubsystem.BP_RailroadSubsystem_C':
        (builder: Builder) => builder.call(transformRailroadSubsystem),
      /*        :
            (builder: Builder) => builder.call(transformCircuitSubsystem),
              :
            (builder: Builder) => builder.call(transformCircuitSubsystem),
              :
            (builder: Builder) => builder.call(transformCircuitSubsystem),
              :
            (builder: Builder) => builder.call(transformCircuitSubsystem),*/
    })
}