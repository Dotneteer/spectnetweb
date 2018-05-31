import { OpPrefixMode } from '../cpu/OpPrefixMode';
import { OpIndexMode } from '../cpu/OpIndexMode';
import { MemoryStatusArray } from '../cpu/MemoryStatusArray';

// This interface defines the operations that support 
// the testing of a Z80 CPU device.
export interface IZ80CpuTestSupport {
    // Allows setting the number of tacts
    SetTacts(tacts: number);

    // Sets the specified interrupt mode
    SetInterruptMode(im: number);

    // Sets the IFF1 and IFF2 flags to the specified value;
    SetIffValues(value: boolean);

    // The current Operation Prefix Mode
    PrefixMode: OpPrefixMode;

    // The current Operation Index Mode
    IndexMode: OpIndexMode;

    // Block interrupts
    BlockInterrupt();

    // Removes the CPU from its halted state
    RemoveFromHaltedState();

    // Increments the internal clock counter with 1
    ClockP1();

    // Increments the internal clock counter with 2
    ClockP2();

    // Increments the internal clock counter with 3
    ClockP3();

    // Increments the internal clock counter with 4
    ClockP4();

    // Increments the internal clock counter with 5
    ClockP5();

    // Increments the internal clock counter with 6
    ClockP6();

    // Increments the internal clock counter with 7
    ClockP7();

    // Gets the current execution flow status
    readonly ExecutionFlowStatus: MemoryStatusArray

    // Gets the current memory read status
    readonly MemoryReadStatus: MemoryStatusArray

    // Gets the current memory write status
    readonly MemoryWriteStatus: MemoryStatusArray
}