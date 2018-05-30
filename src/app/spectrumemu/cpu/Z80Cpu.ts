import { IZ80Cpu } from '../abstraction/IZ80Cpu';
import { IZ80CpuTestSupport } from '../abstraction/IZ80CpuTestSupport';
import { Registers } from './Registers';
import { Z80StateFlags } from '../cpu/Z80StateFlags';
import { IMemoryDevice } from '../abstraction/IMemoryDevice';
import { IPortDevice } from '../abstraction/IPortDevice';
import { IStackDebugSupport } from '../abstraction/IStackDebugSupport';
import { IBranchDebugSupport } from '../abstraction/IBranchDebugSupport';
import { ILiteEvent, LiteEvent } from '../abstraction/ILightEvent';
import { AddressArgs } from './AddressArgs';
import { AddressAndDataArgs } from './AddressAndDataArgs';
import { Z80InstructionExecutionArgs } from './Z80InstructionExecutionArgs';
import { OpPrefixMode } from './OpPrefixMode';
import { OpIndexMode } from './OpIndexMode';
import { MemoryStatusArray } from './MemoryStatusArray';

// This class represents the Z80 CPU
export class Z80Cpu implements IZ80Cpu, IZ80CpuTestSupport {
    // Gets the current tact of the device -- the clock cycles since
    // the device was reset
    Tacts: number;

    // The registers of the Z80 CPU
    Registers: Registers;
 
    // CPU signals and HW flags
    StateFlags: Z80StateFlags;

    // Specifies the contention mode that affects the CPU.
    // False: ULA contention mode;
    // True: Gate array contention mode;
    UseGateArrayContention: boolean;

    // Interrupt Enable Flip-Flop #1
    IFF1: boolean;

    // Interrupt Enable Flip-Flop #2
    IFF2: boolean;

    // The current Interrupt mode
    InterruptMode: number;

    // The interrupt is blocked
    IsInterruptBlocked: boolean;

    // Is currently in opcode execution?
    IsInOpExecution: boolean;

    // Gets the memory device associated with the CPU
    MemoryDevice: IMemoryDevice

    // Gets the device that handles Z80 CPU I/O operations
    PortDevice: IPortDevice;

    // Gets the object that supports debugging the stack
    StackDebugSupport: IStackDebugSupport;

    // Gets the object that supports debugging jump instructions
    BranchDebugSupport: IBranchDebugSupport;

    // This flag indicates if the CPU entered into a maskable
    // interrupt method as a result of an INT signal
    MaskableInterruptModeEntered: boolean;

    // This flag signs if the Z80 extended instruction set (Spectrum Next)
    // is allowed, or NOP instructions should be executed instead of
    // these extended operations.
    AllowExtendedInstructionSet: boolean;

    // Gets the current execution flow status
    ExecutionFlowStatus: MemoryStatusArray

    // Gets the current memory read status
    MemoryReadStatus: MemoryStatusArray;

    // Gets the current memory write status
    MemoryWriteStatus: MemoryStatusArray;

    // This event is raised just before a maskable interrupt is about to execute
    InterruptExecuting: ILiteEvent<void>;

    // This event is raised just before a non-maskable interrupt is about to execute
    NmiExecuting: ILiteEvent<void>

    // This event is raised just before the memory is being read
    MemoryReading: ILiteEvent<AddressArgs>;

    // This event is raised right after the memory has been read
    MemoryRead: ILiteEvent<AddressAndDataArgs>;
    
    // This event is raised just before the memory is being written
    MemoryWriting: ILiteEvent<AddressAndDataArgs>;
    
    // This event is raised just after the memory has been written
    MemoryWritten: ILiteEvent<AddressAndDataArgs>;
    
    // This event is raised just before a port is being read
    PortReading: ILiteEvent<AddressArgs>;
    
    // This event is raised right after a port has been read
    PortRead: ILiteEvent<AddressArgs>;
    
    // This event is raised just before a port is being written
    PortWriting: ILiteEvent<AddressAndDataArgs>;
    
    // This event is raised just after a port has been written
    PortWritten: ILiteEvent<AddressAndDataArgs>;

    // This event is raised just before a Z80 operation is being executed
    OperationExecuting: ILiteEvent<Z80InstructionExecutionArgs>;

    // This event is raised just after a Z80 operation has been executed
    OperationExecuted: ILiteEvent<Z80InstructionExecutionArgs>;

    // The current Operation Prefix Mode
    PrefixMode: OpPrefixMode;

    // The current Operation Index Mode
    IndexMode: OpIndexMode;

    // =======================================================================
    // Lifecycle

    constructor() {
        this.Registers = new Registers();
        this.InterruptExecuting = new LiteEvent<void>();
    }

    // Increments the internal clock with the specified delay ticks
    Delay(ticks: number) {
    }
    
    // Executes a CPU cycle
    ExecuteCpuCycle() {
    }
        
    // Checks if the next instruction to be executed is a call instruction or not
    GetCallInstructionLength(): number {
        return 0;
    }
    
    
    // Applies the RESET signal
    public Reset() {
        this.Tacts = 0;
    }

    // Sets the CPU's RESET signal
    SetResetSignal(): void {
    }

    // Releases the CPU's RESET signal
    ReleaseResetSignal(): void {
    }

    // Allows setting the number of tacts
    SetTacts(tacts: number) {
        this.Tacts = tacts;
    }

    // Sets the specified interrupt mode
    SetInterruptMode(im: number) {
        this.InterruptMode = im;
    }

    // Sets the IFF1 and IFF2 flags to the specified value;
    SetIffValues(value: boolean) {
    }

    // Block interrupts
    BlockInterrupt() {
    }

    // Removes the CPU from its halted state
    RemoveFromHaltedState() {
    }

    // =======================================================================
    // Device state management
    GetDeviceState() {
    }

    RestoreDeviceState(state: any) {
    }
}
