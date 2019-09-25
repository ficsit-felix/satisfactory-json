import { Builder } from '../engine/Builder';
import { transformCircuitSubsystem } from './extras/CircuitSubsystem';
import { transformGameMode } from './extras/GameMode';
import { transformGameState } from './extras/GameState';
import { transformPlayerState } from './extras/PlayerState';
import { transformPowerLine } from './extras/PowerLine';
import { transformVehicle } from './extras/Vehicle';
import { transformConveyorBelt } from './extras/ConveyorBelt';
import { transformTrain } from './extras/Train';

export function transformExtra(builder: Builder) {
  builder
    .switch('_className', {
      '/Game/FactoryGame/Buildable/Factory/PowerLine/Build_PowerLine.Build_PowerLine_C':
        builder => builder.call(transformPowerLine),
      '/Game/FactoryGame/-Shared/Blueprint/BP_CircuitSubsystem.BP_CircuitSubsystem_C':
        builder => builder.call(transformCircuitSubsystem),
      '/Game/FactoryGame/-Shared/Blueprint/BP_GameMode.BP_GameMode_C':
        builder => builder.call(transformGameMode),
      '/Game/FactoryGame/-Shared/Blueprint/BP_GameState.BP_GameState_C':
        builder => builder.call(transformGameState),


      '/Game/FactoryGame/Character/Player/BP_PlayerState.BP_PlayerState_C':
        builder => builder.call(transformPlayerState),
      '/Game/FactoryGame/Buildable/Vehicle/Tractor/BP_Tractor.BP_Tractor_C':
        builder => builder.call(transformVehicle),
      '/Game/FactoryGame/Buildable/Vehicle/Truck/BP_Truck.BP_Truck_C':
        builder => builder.call(transformVehicle),
      '/Game/FactoryGame/Buildable/Vehicle/Explorer/BP_Explorer.BP_Explorer_C':
        builder => builder.call(transformVehicle),

      '/Game/FactoryGame/Buildable/Factory/ConveyorBeltMk1/Build_ConveyorBeltMk1.Build_ConveyorBeltMk1_C': builder => builder.call(transformConveyorBelt),
      '/Game/FactoryGame/Buildable/Factory/ConveyorBeltMk2/Build_ConveyorBeltMk2.Build_ConveyorBeltMk2_C': builder => builder.call(transformConveyorBelt),
      '/Game/FactoryGame/Buildable/Factory/ConveyorBeltMk3/Build_ConveyorBeltMk3.Build_ConveyorBeltMk3_C': builder => builder.call(transformConveyorBelt),
      '/Game/FactoryGame/Buildable/Factory/ConveyorBeltMk4/Build_ConveyorBeltMk4.Build_ConveyorBeltMk4_C': builder => builder.call(transformConveyorBelt),
      '/Game/FactoryGame/Buildable/Factory/ConveyorBeltMk5/Build_ConveyorBeltMk5.Build_ConveyorBeltMk5_C': builder => builder.call(transformConveyorBelt),
      '/Game/FactoryGame/Buildable/Factory/ConveyorBeltMk6/Build_ConveyorBeltMk6.Build_ConveyorBeltMk6_C': builder => builder.call(transformConveyorBelt),
      '/Game/FactoryGame/Buildable/Factory/ConveyorLiftMk1/Build_ConveyorLiftMk1.Build_ConveyorLiftMk1_C': builder => builder.call(transformConveyorBelt),
      '/Game/FactoryGame/Buildable/Factory/ConveyorLiftMk2/Build_ConveyorLiftMk2.Build_ConveyorLiftMk2_C': builder => builder.call(transformConveyorBelt),
      '/Game/FactoryGame/Buildable/Factory/ConveyorLiftMk3/Build_ConveyorLiftMk3.Build_ConveyorLiftMk3_C': builder => builder.call(transformConveyorBelt),
      '/Game/FactoryGame/Buildable/Factory/ConveyorLiftMk4/Build_ConveyorLiftMk4.Build_ConveyorLiftMk4_C': builder => builder.call(transformConveyorBelt),
      '/Game/FactoryGame/Buildable/Factory/ConveyorLiftMk5/Build_ConveyorLiftMk5.Build_ConveyorLiftMk5_C': builder => builder.call(transformConveyorBelt),
      '/Game/FactoryGame/Buildable/Factory/ConveyorLiftMk6/Build_ConveyorLiftMk6.Build_ConveyorLiftMk6_C': builder => builder.call(transformConveyorBelt),
      // Mk6_Mod
      '/Game/FactoryGame/Mk6_Mod/Build_ConveyorLiftMk61.Build_ConveyorLiftMk61_C': builder => builder.call(transformConveyorBelt),
      '/Game/FactoryGame/Mk6_Mod/Build_BeltMk61.Build_BeltMk61_C': builder => builder.call(transformConveyorBelt),
      '/Game/FactoryGame/Buildable/Vehicle/Train/Wagon/BP_FreightWagon.BP_FreightWagon_C':
        builder => builder.call(transformTrain),
      '/Game/FactoryGame/Buildable/Vehicle/Train/Locomotive/BP_Locomotive.BP_Locomotive_C':
        builder => builder.call(transformTrain),

      '/Game/FactoryGame/-Shared/Blueprint/BP_RailroadSubsystem.BP_RailroadSubsystem_C':
        builder => builder.call(transformPlayerState),
      '$default': _ => {
      }
    })
}