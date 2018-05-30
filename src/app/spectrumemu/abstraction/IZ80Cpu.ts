import { IDevice } from './IDevice';
import { Registers } from '../cpu/Registers';
import { Z80StateFlags } from '../cpu/Z80StateFlags';
import { IMemoryDevice } from './IMemoryDevice';
import { IPortDevice } from './IPortDevice';
import { IStackDebugSupport } from './IStackDebugSupport';
import { IBranchDebugSupport } from './IBranchDebugSupport';
import { ILiteEvent } from './ILightEvent';
import { AddressArgs } from '../cpu/AddressArgs';
import { AddressAndDataArgs } from '../cpu/AddressAndDataArgs';
import { Z80InstructionExecutionArgs } from '../cpu/Z80InstructionExecutionArgs';

// Represents a Z80 CPU
export interface IZ80Cpu extends IDevice {
    // Gets the current tact of the device -- the clock cycles since
    // the device was reset    
    readonly Tacts: number;

    // The registers of the Z80 CPU
    readonly Registers: Registers;

    // CPU signals and HW flags
    readonly StateFlags: Z80StateFlags;

    // Specifies the contention mode that affects the CPU.
    // False: ULA contention mode;
    // True: Gate array contention mode;
    UseGateArrayContention: boolean;

    // Interrupt Enable Flip-Flop #1
    readonly IFF1: boolean;

    // Interrupt Enable Flip-Flop #2
    readonly IFF2: boolean;

    // The current Interrupt mode
    readonly InterruptMode: number;

    // The interrupt is blocked
    readonly IsInterruptBlocked: boolean;

    // Is currently in opcode execution?
    readonly IsInOpExecution: boolean;

    // Increments the internal clock with the specified delay ticks
    Delay(ticks: number): void;

    // Executes a CPU cycle
    ExecuteCpuCycle(): void;

    // Checks if the next instruction to be executed is a call instruction or not
    GetCallInstructionLength(): number;

    // Gets the memory device associated with the CPU
    readonly MemoryDevice: IMemoryDevice;

    // Gets the device that handles Z80 CPU I/O operations
    readonly PortDevice: IPortDevice;

    // Gets the object that supports debugging the stack
    StackDebugSupport: IStackDebugSupport;

    // Gets the object that supports debugging jump instructions
    readonly BranchDebugSupport: IBranchDebugSupport;

    // This flag indicates if the CPU entered into a maskable
    // interrupt method as a result of an INT signal
    readonly MaskableInterruptModeEntered: boolean;

    // This flag signs if the Z80 extended instruction set (Spectrum Next)
    // is allowed, or NOP instructions should be executed instead of
    // these extended operations.
    readonly AllowExtendedInstructionSet: boolean;

    // Sets the CPU's RESET signal
    SetResetSignal(): void;

    // Releases the CPU's RESET signal
    ReleaseResetSignal(): void;

    // This event is raised just before a maskable interrupt is about to execute
    readonly InterruptExecuting: ILiteEvent<void>;

    // This event is raised just before a non-maskable interrupt is about to execute
    readonly NmiExecuting: ILiteEvent<void>;

    // This event is raised just before the memory is being read
    readonly MemoryReading: ILiteEvent<AddressArgs>;

    // This event is raised right after the memory has been read
    readonly MemoryRead: ILiteEvent<AddressAndDataArgs>;

    // This event is raised just before the memory is being written
    readonly MemoryWriting: ILiteEvent<AddressAndDataArgs>;

    // This event is raised just after the memory has been written
    readonly MemoryWritten: ILiteEvent<AddressAndDataArgs>;

    // This event is raised just before a port is being read
    readonly PortReading: ILiteEvent<AddressArgs>;

    // This event is raised right after a port has been read
    readonly PortRead: ILiteEvent<AddressArgs>;

    // This event is raised just before a port is being written
    readonly PortWriting: ILiteEvent<AddressAndDataArgs>;

    // This event is raised just after a port has been written
    readonly PortWritten: ILiteEvent<AddressAndDataArgs>;

    // This event is raised just before a Z80 operation is being executed
    readonly OperationExecuting: ILiteEvent<Z80InstructionExecutionArgs>;

    // This event is raised just after a Z80 operation has been executed
    readonly OperationExecuted: ILiteEvent<Z80InstructionExecutionArgs>;
}
