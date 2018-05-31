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

    private _instructionBytes: number[] = [];
    private _lastPC: number;

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
    NmiExecuting: LiteEvent<void>

    // This event is raised just before the memory is being read
    MemoryReading: LiteEvent<AddressArgs>;

    // This event is raised right after the memory has been read
    MemoryRead: LiteEvent<AddressAndDataArgs>;
    
    // This event is raised just before the memory is being written
    MemoryWriting: LiteEvent<AddressAndDataArgs>;
    
    // This event is raised just after the memory has been written
    MemoryWritten: LiteEvent<AddressAndDataArgs>;
    
    // This event is raised just before a port is being read
    PortReading: LiteEvent<AddressArgs>;
    
    // This event is raised right after a port has been read
    PortRead: LiteEvent<AddressArgs>;
    
    // This event is raised just before a port is being written
    PortWriting: LiteEvent<AddressAndDataArgs>;
    
    // This event is raised just after a port has been written
    PortWritten: LiteEvent<AddressAndDataArgs>;

    // This event is raised just before a Z80 operation is being executed
    OperationExecuting: LiteEvent<Z80InstructionExecutionArgs>;

    // This event is raised just after a Z80 operation has been executed
    OperationExecuted: LiteEvent<Z80InstructionExecutionArgs>;

    // The current Operation Prefix Mode
    PrefixMode: OpPrefixMode;

    // The current Operation Index Mode
    IndexMode: OpIndexMode;

    // =======================================================================
    // Lifecycle

    constructor() {
        this.Registers = new Registers();
        this.InterruptExecuting = new LiteEvent<void>();
        this.NmiExecuting = new LiteEvent<void>();
        this.MemoryReading = new LiteEvent<AddressArgs>();
        this.MemoryRead = new LiteEvent<AddressAndDataArgs>();
        this.MemoryWriting = new LiteEvent<AddressAndDataArgs>();
        this.MemoryWritten = new LiteEvent<AddressAndDataArgs>();
        this.PortReading = new LiteEvent<AddressArgs>();
        this.PortRead = new LiteEvent<AddressAndDataArgs>();
        this.PortWriting = new LiteEvent<AddressAndDataArgs>();
        this.PortWritten = new LiteEvent<AddressAndDataArgs>();
        this.OperationExecuting = new LiteEvent<Z80InstructionExecutionArgs>();
        this.OperationExecuted = new LiteEvent<Z80InstructionExecutionArgs>();
    }

    // ========================================================================
    // Clock handling methods
    // Increments the internal clock with the specified delay ticks
    Delay(ticks: number) {
        this.Tacts += ticks;
    }
    
    // Increments the internal clock counter with 1
    ClockP1() {
        this.Tacts += 1;
    }

    // Increments the internal clock counter with 2
    ClockP2() {
        this.Tacts += 2;
    }

    // Increments the internal clock counter with 3
    ClockP3() {
        this.Tacts += 3;
    }

    // Increments the internal clock counter with 4
    ClockP4() {
        this.Tacts += 4;
    }

    // Increments the internal clock counter with 5
    ClockP5() {
        this.Tacts += 5;
    }

    // Increments the internal clock counter with 6
    ClockP6() {
        this.Tacts += 6;
    }

    // Increments the internal clock counter with 7
    ClockP7() {
        this.Tacts += 7;
    }

    // ========================================================================
    // Main execution cycle methods

    // Executes a CPU cycle
    ExecuteCpuCycle() {
        // --- If any of the RST, INT or NMI signals has been processed,
        // --- Execution flow in now on the corresponding way
        // --- Nothing more to do in this execution cycle
        if (this.ProcessCpuSignals()) return;

        // --- Get operation code and refresh the memory
        this.MaskableInterruptModeEntered = false;
        var opCode = this.ReadCodeMemory();
        this.ClockP3();
        this.Registers.PC++;
        this.RefreshMemory();
        if (this.PrefixMode == OpPrefixMode.None) {
            // -- The CPU is about to execute a standard operation
            switch (opCode) {
                case 0xDD:
                    // --- An IX index prefix received
                    // --- Disable the interrupt unless the full operation code is received
                    this.IndexMode = OpIndexMode.IX;
                    this.IsInOpExecution = this.IsInterruptBlocked = true;
                    return;

                case 0xFD:
                    // --- An IY index prefix received
                    // --- Disable the interrupt unless the full operation code is received
                    this.IndexMode = OpIndexMode.IY;
                    this.IsInOpExecution = this.IsInterruptBlocked = true;
                    return;

                case 0xCB:
                    // --- A bit operation prefix received
                    // --- Disable the interrupt unless the full operation code is received
                    this.PrefixMode = OpPrefixMode.Bit;
                    this.IsInOpExecution = this.IsInterruptBlocked = true;
                    return;

                case 0xED:
                    // --- An extended operation prefix received
                    // --- Disable the interrupt unless the full operation code is received
                    this.PrefixMode = OpPrefixMode.Extended;
                    this.IsInOpExecution = this.IsInterruptBlocked = true;
                    return;

                default:
                    // --- Normal (8-bit) operation code received
                    this.IsInterruptBlocked = false;
                    this._opCode = opCode;
                        OperationExecuting?.Invoke(this, 
                            new Z80InstructionExecutionEventArgs(_lastPC, _instructionBytes, opCode));
                        ProcessStandardOrIndexedOperations();
                        OperationExecuted?.Invoke(this, 
                            new Z80InstructionExecutionEventArgs(_lastPC, _instructionBytes, opCode, Registers.PC));
                        _prefixMode = OpPrefixMode.None;
                        _indexMode = OpIndexMode.None;
                        _isInOpExecution = false;
                        _instructionBytes.Clear();
                        _lastPC = Registers.PC;
                        return;
                }
            }

            if (_prefixMode == OpPrefixMode.Bit)
            {
                // --- The CPU is already in BIT operations (0xCB) prefix mode
                _isInterruptBlocked = false;
                _opCode = opCode;
                OperationExecuting?.Invoke(this,
                    new Z80InstructionExecutionEventArgs(_lastPC, _instructionBytes, opCode));
                ProcessCBPrefixedOperations();
                OperationExecuted?.Invoke(this,
                    new Z80InstructionExecutionEventArgs(_lastPC, _instructionBytes, opCode, Registers.PC));
                _indexMode = OpIndexMode.None;
                _prefixMode = OpPrefixMode.None;
                _isInOpExecution = false;
                _instructionBytes.Clear();
                _lastPC = Registers.PC;
                return;
            }

            if (_prefixMode == OpPrefixMode.Extended)
            {
                // --- The CPU is already in Extended operations (0xED) prefix mode
                _isInterruptBlocked = false;
                _opCode = opCode;
                OperationExecuting?.Invoke(this,
                    new Z80InstructionExecutionEventArgs(_lastPC, _instructionBytes, opCode));
                ProcessEDOperations();
                OperationExecuted?.Invoke(this,
                    new Z80InstructionExecutionEventArgs(_lastPC, _instructionBytes, opCode, Registers.PC));
                _indexMode = OpIndexMode.None;
                _prefixMode = OpPrefixMode.None;
                _isInOpExecution = false;
                _instructionBytes.Clear();
                _lastPC = Registers.PC;
            }

    }
  
    // Checks if the next instruction to be executed is a call instruction or not
    GetCallInstructionLength(): number {
        return 0;
    }
    
    // Applies the RESET signal
    Reset() {
        this.Tacts = 0;
    }

    // ========================================================================
    // Memory and port device operations

    // Read the memory at the specified address
    ReadMemory(addr: number): number {
        (this.MemoryReading as LiteEvent<AddressArgs>).trigger(new AddressArgs(addr));
        this.MemoryReadStatus.Touch(addr);
        var data = this.MemoryDevice.Read(addr);
        (this.MemoryRead as LiteEvent<AddressAndDataArgs>).trigger(new AddressAndDataArgs(addr, data));
        return data;
    }

    // Read the memory at the PC address
    ReadCodeMemory(): number {
        this.ExecutionFlowStatus.Touch(this.Registers.PC);
        var data = this.MemoryDevice.Read(this.Registers.PC);
        this._instructionBytes.push(data);
        return data;
    }

    // Set the memory value at the specified address
    WriteMemory(addr: number, value: number) {
        (this.MemoryWriting as LiteEvent<AddressAndDataArgs>).trigger(new AddressAndDataArgs(addr, value));
        this.MemoryWriteStatus.Touch(addr);
        this.MemoryDevice.Write(addr, value);
        (this.MemoryWritten as LiteEvent<AddressAndDataArgs>).trigger(new AddressAndDataArgs(addr, value));
    }

    // Read the port with the specified address
    ReadPort(addr: number): number {
        (this.PortReading as LiteEvent<AddressArgs>).trigger(new AddressArgs(addr));
        var data = this.PortDevice.ReadPort(addr);
        (this.PortRead as LiteEvent<AddressAndDataArgs>).trigger(new AddressAndDataArgs(addr, data));
        return data;
    }

    // Write data to the port with the specified address
    WritePort(addr: number, data: number) {
        (this.PortWriting as LiteEvent<AddressAndDataArgs>).trigger(new AddressAndDataArgs(addr, data));
        this.PortDevice.WritePort(addr, data);
        (this.PortWritten as LiteEvent<AddressAndDataArgs>).trigger(new AddressAndDataArgs(addr, data));
    }

    // ========================================================================
    // CPU signal processing methods

    // Processes the CPU signals coming from peripheral devices
    // of the computer
    // Returns true, if a signal has been processed; otherwise, false
    private ProcessCpuSignals(): boolean {
        if (this.StateFlags == Z80StateFlags.None) return false;

        if ((this.StateFlags & Z80StateFlags.Int) != 0 && !this.IsInterruptBlocked && this.IFF1) {
            (this.InterruptExecuting as LiteEvent<void>).trigger();
                this.ExecuteInterrupt();
                return true;
        }

        if ((this.StateFlags & Z80StateFlags.Halted) != 0) {
            // --- The HALT instruction suspends CPU operation until a 
            // --- subsequent interrupt or reset is received. While in the
            // --- HALT state, the processor executes NOPs to maintain
            // --- memory refresh logic.
            this.ClockP3();
            this.RefreshMemory();
            return true;
        }

        if ((this.StateFlags & Z80StateFlags.Reset) != 0) {
            this.ExecuteReset();
            return true;
        }

        if ((this.StateFlags & Z80StateFlags.Nmi) != 0) {
            (this.NmiExecuting as LiteEvent<void>).trigger();
            this.ExecuteNmi();
            return true;
        }

        return false;
    }

    // Executes an INT
    private ExecuteInterrupt() {
        if ((this.StateFlags & Z80StateFlags.Halted) != 0)
        {
            // --- We emulate stepping over the HALT instruction
            this.Registers.PC++;
            this.StateFlags &= Z80StateFlags.InvHalted;
        }
        this.IFF1 = false;
        this.IFF2 = false;
        this.Registers.SP--;
        this.ClockP1();
        this.WriteMemory(this.Registers.SP, this.Registers.PC >> 8);
        this.ClockP3();
        this.Registers.SP--;
        this.WriteMemory(this.Registers.SP, this.Registers.PC & 0xFF);
        this.ClockP3();

        switch (this.InterruptMode)
        {
            // --- Interrupt Mode 0:
            // --- The interrupting device can place any instruction on
            // --- the data bus and the CPU executes it. Consequently, the
            // --- interrupting device provides the next instruction to be 
            // --- executed.
            case 0:
                
            // --- Interrupt Mode 1:
            // --- The CPU responds to an interrupt by executing a restart
            // --- at address 0038h.As a result, the response is identical to 
            // --- that of a nonmaskable interrupt except that the call 
            // --- location is 0038h instead of 0066h.
            case 1:
                // --- In this implementation, we do cannot emulate a device
                // --- that places instruction on the data bus, so we'll handle
                // --- IM 0 and IM 1 the same way
                this.Registers.WZ = 0x0038;
                this.ClockP5();
                break;

            // --- Interrupt Mode 2:
            // --- The programmer maintains a table of 16-bit starting addresses 
            // --- for every interrupt service routine. This table can be 
            // --- located anywhere in memory. When an interrupt is accepted, 
            // --- a 16-bit pointer must be formed to obtain the required interrupt
            // --- service routine starting address from the table. The upper 
            // --- eight bits of this pointer is formed from the contents of the I
            // --- register.The I register must be loaded with the applicable value
            // --- by the programmer. A CPU reset clears the I register so that it 
            // --- is initialized to 0. The lower eight bits of the pointer must be
            // --- supplied by the interrupting device. Only seven bits are required
            // --- from the interrupting device, because the least-significant bit 
            // --- must be a 0.
            // --- This process is required, because the pointer must receive two
            // --- adjacent bytes to form a complete 16-bit service routine starting 
            // --- address; addresses must always start in even locations.
            default:
                // --- Getting the lower byte from device (assume 0)
                this.ClockP2();
                var adr = (this.Registers.IR & 0xFF00) | 0xFF;
                this.ClockP5();
                var l = this.ReadMemory(adr);
                this.ClockP3();
                var h = this.ReadMemory(++adr);
                this.ClockP3();
                this.Registers.WZ = (h * 0x100 + l);
                this.ClockP6();
                break;
        }
        this.Registers.PC = this.Registers.WZ;
        this.MaskableInterruptModeEntered = true;
    }

    // Takes care of refreching the dynamic memory
    // The Z80 CPU contains a memory refresh counter, enabling dynamic 
    // memories to be used with the same ease as static memories. Seven 
    // bits of this 8-bit register are automatically incremented after 
    // each instruction fetch. The eighth bit remains as programmed, 
    // resulting from an "LD R, A" instruction. The data in the refresh
    // counter is sent out on the lower portion of the address bus along 
    // with a refresh control signal while the CPU is decoding and 
    // executing the fetched instruction. This mode of refresh is 
    // transparent to the programmer and does not slow the CPU operation.
    // </remarks>
    private RefreshMemory() {
        this.Registers.R = ((this.Registers.R + 1) & 0x7F) | (this.Registers.R & 0x80);
        this.ClockP1();
    }

    // Executes a hard reset
    private ExecuteReset() {
        this._instructionBytes = [];
        this._lastPC = 0;
        this.IFF1 = false;
        this.IFF2 = false;
        this.InterruptMode = 0;
        this.IsInterruptBlocked = false;
        this.StateFlags = Z80StateFlags.None;
        this.PrefixMode = OpPrefixMode.None;
        this.IndexMode = OpIndexMode.None;
        this.Registers.PC = 0x0000;
        this.Registers.IR = 0x0000;
        this.IsInOpExecution = false;
        this.Tacts = 0;
    }

    // Executes an NMI
    private ExecuteNmi() {
        if ((this.StateFlags & Z80StateFlags.Halted) != 0) {
            // --- We emulate stepping over the HALT instruction
            this.Registers.PC++;
            this.StateFlags &= Z80StateFlags.InvHalted;
        }
        this.IFF2 = this.IFF1;
        this.IFF1 = false;
        this.Registers.SP--;
        this.ClockP1();
        this.WriteMemory(this.Registers.SP, this.Registers.PC >> 8);
        this.ClockP3();
        this.Registers.SP--;
        this.WriteMemory(this.Registers.SP, this.Registers.PC & 0xFF);
        this.ClockP3();

        // --- NMI address
        this.Registers.PC = 0x0066;
    }
   

    // Sets the CPU's RESET signal
    SetResetSignal(): void {
    }

    // Releases the CPU's RESET signal
    ReleaseResetSignal(): void {
    }

    // ========================================================================
    // Test support methods

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
        this.IFF1 = this.IFF2 = value;
    }

    // Block interrupts
    BlockInterrupt() {
        this.IsInterruptBlocked = true;
    }

    // Removes the CPU from its halted state
    RemoveFromHaltedState() {
        if ((this.StateFlags & Z80StateFlags.Halted) == 0) return;
        this.Registers.PC++;
        this.StateFlags &= Z80StateFlags.InvHalted;
    }

    // =======================================================================
    // Device state management
    GetDeviceState() {
    }

    RestoreDeviceState(state: any) {
    }
}
