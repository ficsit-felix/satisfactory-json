import { DataBuffer } from '../DataBuffer';
import { Entity } from '../types';
import transformPowerLine from './extras/PowerLine';
import transformCircuitSubsystem from './extras/CircuitSubsystem';
import transformGameMode from './extras/GameMode';
import transformGameState from './extras/GameState';
import transformPlayerState from './extras/PlayerState';
import transformVehicle from './extras/Vehicle';
import transformConveyorBelt from './extras/ConveyorBelt';
import transformRailroadSubsystem from './extras/RailroadSubsystem';

export default function transformExtra(
    buffer: DataBuffer,
    entity: Entity, toSav: boolean, className: string,
    length: number) {
    switch (className) {
        case '/Game/FactoryGame/Buildable/Factory/PowerLine/Build_PowerLine.Build_PowerLine_C':
            transformPowerLine(buffer, entity, toSav);
            break;
        case '/Game/FactoryGame/-Shared/Blueprint/BP_CircuitSubsystem.BP_CircuitSubsystem_C':
            transformCircuitSubsystem(buffer, entity, toSav);
            break;
        case '/Game/FactoryGame/-Shared/Blueprint/BP_GameMode.BP_GameMode_C':
            transformGameMode(buffer, entity, toSav);
            break;
        case '/Game/FactoryGame/-Shared/Blueprint/BP_GameState.BP_GameState_C':
            transformGameState(buffer, entity, toSav);
            break;
        case '/Game/FactoryGame/-Shared/Blueprint/BP_RailroadSubsystem.BP_RailroadSubsystem_C':
            transformRailroadSubsystem(buffer, entity, toSav, length);
            break;
        case '/Game/FactoryGame/Character/Player/BP_PlayerState.BP_PlayerState_C':
            transformPlayerState(buffer, entity, toSav, length);
            break;
        case '/Game/FactoryGame/Buildable/Vehicle/Tractor/BP_Tractor.BP_Tractor_C':
        case '/Game/FactoryGame/Buildable/Vehicle/Truck/BP_Truck.BP_Truck_C':
        case '/Game/FactoryGame/Buildable/Vehicle/Explorer/BP_Explorer.BP_Explorer_C':
            transformVehicle(buffer, entity, toSav);
            break;
        // tslint:disable: max-line-length
        case '/Game/FactoryGame/Buildable/Factory/ConveyorBeltMk1/Build_ConveyorBeltMk1.Build_ConveyorBeltMk1_C':
        case '/Game/FactoryGame/Buildable/Factory/ConveyorBeltMk2/Build_ConveyorBeltMk2.Build_ConveyorBeltMk2_C':
        case '/Game/FactoryGame/Buildable/Factory/ConveyorBeltMk3/Build_ConveyorBeltMk3.Build_ConveyorBeltMk3_C':
        case '/Game/FactoryGame/Buildable/Factory/ConveyorBeltMk4/Build_ConveyorBeltMk4.Build_ConveyorBeltMk4_C':
        case '/Game/FactoryGame/Buildable/Factory/ConveyorBeltMk5/Build_ConveyorBeltMk5.Build_ConveyorBeltMk5_C':
        case '/Game/FactoryGame/Buildable/Factory/ConveyorBeltMk6/Build_ConveyorBeltMk6.Build_ConveyorBeltMk6_C':
        case '/Game/FactoryGame/Buildable/Factory/ConveyorLiftMk1/Build_ConveyorLiftMk1.Build_ConveyorLiftMk1_C':
        case '/Game/FactoryGame/Buildable/Factory/ConveyorLiftMk2/Build_ConveyorLiftMk2.Build_ConveyorLiftMk2_C':
        case '/Game/FactoryGame/Buildable/Factory/ConveyorLiftMk3/Build_ConveyorLiftMk3.Build_ConveyorLiftMk3_C':
        case '/Game/FactoryGame/Buildable/Factory/ConveyorLiftMk4/Build_ConveyorLiftMk4.Build_ConveyorLiftMk4_C':
        case '/Game/FactoryGame/Buildable/Factory/ConveyorLiftMk5/Build_ConveyorLiftMk5.Build_ConveyorLiftMk5_C':
        case '/Game/FactoryGame/Buildable/Factory/ConveyorLiftMk6/Build_ConveyorLiftMk6.Build_ConveyorLiftMk6_C':
            // tslint:enable
            transformConveyorBelt(buffer, entity, toSav, length);
            break;
    }
}
