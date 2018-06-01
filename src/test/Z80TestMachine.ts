import { IStackDebugSupport } from "../app/spectrumemu/abstraction/IStackDebugSupport";
import { IBranchDebugSupport } from "../app/spectrumemu/abstraction/IBranchDebugSupport";
import { Z80Cpu } from "../app/spectrumemu/cpu/Z80Cpu";
import { ILiteEvent, LiteEvent } from "../app/spectrumemu/abstraction/ILightEvent";
import { Registers } from "../app/spectrumemu/cpu/Registers";
import { StackPointerManipulationEvent } from "../app/spectrumemu/cpu/StackPointerManipulationEvent";
import { StackContentManipulationEvent } from "../app/spectrumemu/cpu/StackContentManipulationEvent";
import { BranchEvent } from "../app/spectrumemu/cpu/BranchEvent";
import { ITbBlueControlDevice } from "../app/spectrumemu/abstraction/ITbBlueControlDevice";
import { Z80StateFlags } from "../app/spectrumemu/cpu/Z80StateFlags";
import { IMemoryDevice } from "../app/spectrumemu/abstraction/IMemoryDevice";
import { ISpectrumVm } from "../app/spectrumemu/abstraction/ISpectrumVm";
import { IZ80Cpu } from "../app/spectrumemu/abstraction/IZ80Cpu";
import { IPortDevice } from "../app/spectrumemu/abstraction/IPortDevice";
import { FlagsSetMask } from "../app/spectrumemu/cpu/FlagsSetMask";

// This class implements a Z80 machine that can be used for unit testing.
export class Z80TestMachine implements IStackDebugSupport, IBranchDebugSupport {
    private _breakReceived: boolean;
    public readonly Cpu: Z80Cpu;
    public RunMode: RunMode
    public Memory: number[]
    public CodeEndsAt: number;
    public readonly MemoryAccessLog: MemoryOp[]
    public readonly IoAccessLog: IoOp[]
    public readonly IoInputSequence: number[]
    public IoReadCount: number;
    public CpuCycleCompleted: ILiteEvent<void>;
    public RegistersBeforeRun: Registers;
    public MemoryBeforeRun: number[]
    public readonly StackPointerManipulations: StackPointerManipulationEvent[]
    public readonly StackContentManipulations: StackContentManipulationEvent[]
    public readonly BranchEvents: BranchEvent[];

    // Initializes the test machine
    constructor(runMode = RunMode.Normal, allowExtendedInstructions = false,
        tbBlue: ITbBlueControlDevice = null) {
        this.Memory = [];
        for (var i = 0; i <= 0xFFFF; i++) {
            this.Memory[i] = 0x00;
        }
        this.MemoryAccessLog = [];
        this.IoAccessLog = [];
        this.IoInputSequence = [];
        this.IoReadCount = 0;
        this.CpuCycleCompleted = new LiteEvent<void>();        
        this.StackPointerManipulations = [];
        this.StackContentManipulations = [];
        this.BranchEvents = [];
        var memDevice = new Z80TestMemoryDevice(this.ReadMemory, this.WriteMemory);
        var portDevice = new Z80TestPortDevice(this.ReadPort, this.WritePort);
        this.Cpu = new Z80Cpu(memDevice, portDevice, allowExtendedInstructions, tbBlue);
        portDevice.Cpu = this.Cpu;
        this.RunMode = runMode;
        this.Cpu.StackDebugSupport = this;
        this.Cpu.BranchDebugSupport = this;
        this._breakReceived = false;
    }

    // Initializes the code passed in <paramref name="programCode"/>. This code
    // is put into the memory from <paramref name="codeAddress"/> and
    // code execution starts at <paramref name="startAddress"/>
    public InitCode(programCode: number[] = null, codeAddress = 0,
        startAddress = 0): void {
        // --- Initialize the code
        if (programCode != null) {
            for (var i = 0; i < programCode.length;  i++) {
                this.Memory[codeAddress++] = programCode[i];
            }
            this.CodeEndsAt = codeAddress;
            while (codeAddress < 0x10000) {
                this.Memory[codeAddress++] = 0;
            }
        }

        // --- Init code execution
        this.Cpu.Reset();
        this.Cpu.Registers.PC = startAddress;
    }

    // Runs the code
    public Run(): boolean {
        this.RegistersBeforeRun = this.Clone(this.Cpu.Registers);
        this.MemoryBeforeRun = [];
        for (var i = 0; i <= 0xFFFF; i++) {
            this.MemoryBeforeRun[i] = this.Memory[i];
        }
        var stopped = false;

        while (!stopped) {
            this.Cpu.ExecuteCpuCycle();
            (this.CpuCycleCompleted as LiteEvent<void>).trigger();
            switch (this.RunMode) {
                case RunMode.Normal:
                case RunMode.UntilBreak:
                    stopped = this._breakReceived;
                    break;
                case RunMode.OneCycle:
                    stopped = true;
                    break;
                case RunMode.OneInstruction:
                    stopped = !this.Cpu.IsInOpExecution;
                    break;
                case RunMode.UntilHalt:
                    stopped = (this.Cpu.StateFlags & Z80StateFlags.Halted) != 0;
                    break;
                default:
                    stopped = this.Cpu.Registers.PC >= this.CodeEndsAt;
                    break;
            }
        }
        return this._breakReceived;
    }

    public Break(): void {
        this._breakReceived = true;
    }

    protected ReadMemory = (addr: number, noContention: boolean = false): number => {
        var value = this.Memory[addr];
        this.MemoryAccessLog.push(new MemoryOp(addr, value, false));
        return value;
    }

    protected WriteMemory = (addr: number, value: number): void => {
        this.Memory[addr] = value;
        this.MemoryAccessLog.push(new MemoryOp(addr, value, true));
    }

    protected ReadPort = (addr: number): number => {
        var value = this.IoReadCount >= this.IoInputSequence.length
            ? 0x00
            : this.IoInputSequence[this.IoReadCount++];
        this.IoAccessLog.push(new IoOp(addr, value, false));
        return value;
    }

    protected WritePort = (addr: number, value: number): void => {
        this.IoAccessLog.push(new IoOp(addr, value, true));
    }

    RecordStackPointerManipulationEvent(ev: StackPointerManipulationEvent): void {
            this.StackPointerManipulations.push(ev);
    }

    RecordStackContentManipulationEvent(ev: StackContentManipulationEvent): void {
        this. StackContentManipulations.push(ev);
    }

    RecordBranchEvent(ev: BranchEvent): void {
        this.BranchEvents.push(ev);
    }

    // Clones the current set of registers
    private Clone(regs: Registers): Registers {
        var r = new Registers(); 
        r._AF_ = regs._AF_,
        r._BC_ = regs._BC_,
        r._DE_ = regs._DE_,
        r._HL_ = regs._HL_,
        r.AF = regs.AF,
        r.BC = regs.BC,
        r.DE = regs.DE,
        r.HL = regs.HL,
        r.SP = regs.SP,
        r.PC = regs.PC,
        r.IX = regs.IX,
        r.IY = regs.IY,
        r.IR = regs.IR,
        r.WZ = regs.WZ
        return r;  
    }

    // Checks if all registers keep their original values, except the ones
    // listed in <paramref name="except"/>
    ShouldKeepRegisters(except: string = null): void {
        const before = this.RegistersBeforeRun;
        const after = this.Cpu.Registers;
        var exclude = except == null ? [] : except.split(',');
        exclude = exclude.map(reg => reg.toUpperCase().trim());
        var differs: string[] = [];

        if (before._AF_ != after._AF_ && exclude.indexOf("AF'") < 0) {
            differs.push("AF'");
        }
        if (before._BC_ != after._BC_ && exclude.indexOf("BC'") < 0) {
            differs.push("BC'");
        }
        if (before._DE_ != after._DE_ && exclude.indexOf("DE'") < 0) {
            differs.push("DE'");
        }
        if (before._HL_ != after._HL_ && exclude.indexOf("HL'") < 0) {
            differs.push("HL'");
        }
        if (before.AF != after.AF &&
            !(exclude.indexOf("AF") > -1 || exclude.indexOf("A") > -1 || exclude.indexOf("F") > -1)) {
            differs.push("AF");
        }
        if (before.BC != after.BC &&
            !(exclude.indexOf("BC") > -1 || exclude.indexOf("B") > -1 || exclude.indexOf("C") > -1)) {
            differs.push("BC");
        }
        if (before.DE != after.DE &&
            !(exclude.indexOf("DE") > -1 || exclude.indexOf("D") > -1 || exclude.indexOf("E") > -1)) {
            differs.push("DE");
        }
        if (before.HL != after.HL &&
            !(exclude.indexOf("HL") > -1 || exclude.indexOf("H") > -1 || exclude.indexOf("L") > -1 )) {
            differs.push("HL");
        }
        if (before.SP != after.SP && exclude.indexOf("SP") < 0) {
            differs.push("SP");
        }
        if (before.IX != after.IX && exclude.indexOf("IX") < 0) {
            differs.push("IX");
        }
        if (before.IY != after.IY && exclude.indexOf("IY") < 0) {
            differs.push("IY");
        }
        if (before.A != after.A && exclude.indexOf("A") < 0 && exclude.indexOf("AF") < 0) {
            differs.push("A");
        }
        if (before.F != after.F && exclude.indexOf("F") < 0 && exclude.indexOf("AF") < 0) {
            differs.push("F");
        }
        if (before.B != after.B && exclude.indexOf("B") < 0 && exclude.indexOf("BC") < 0) {
            differs.push("B");
        }
        if (before.C != after.C && exclude.indexOf("C") < 0 && exclude.indexOf("BC") < 0) {
            differs.push("C");
        }
        if (before.D != after.D && exclude.indexOf("D") < 0 && exclude.indexOf("DE") < 0) {
            differs.push("D");
        }
        if (before.E != after.E && exclude.indexOf("E") < 0 && exclude.indexOf("DE") < 0) {
            differs.push("E");
        }
        if (before.H != after.H && exclude.indexOf("H") < 0 && exclude.indexOf("HL") < 0) {
            differs.push("H");
        }
        if (before.L != after.L && exclude.indexOf("L") < 0 && exclude.indexOf("HL") < 0) {
            differs.push("L");
        }
        if (differs.length == 0) return;
        fail("The following registers are expected to remain intact, " +
            `but their values have been changed: ${differs.join(", ")}`);
    }

    // Tests if S flag keeps its value while running a test.
    ShouldKeepSFlag(): void {
        const before = (this.RegistersBeforeRun.F & FlagsSetMask.S) != 0;
        const after = (this.Cpu.Registers.F & FlagsSetMask.S) != 0;
        if (after == before) return;
        fail(`S flag expected to keep its value, but it changed from ${before} to ${after}`);
    }

    // Tests if Z flag keeps its value while running a test.
    ShouldKeepZFlag(): void {
        const before = (this.RegistersBeforeRun.F & FlagsSetMask.Z) != 0;
        const after = (this.Cpu.Registers.F & FlagsSetMask.Z) != 0;
        if (after == before) return;
        fail(`Z flag expected to keep its value, but it changed from ${before} to ${after}`);
    }

    // Tests if N flag keeps its value while running a test.
    ShouldKeepNFlag(): void {
        const before = (this.RegistersBeforeRun.F & FlagsSetMask.N) != 0;
        const after = (this.Cpu.Registers.F & FlagsSetMask.N) != 0;
        if (after == before) return;
        fail(`N flag expected to keep its value, but it changed from ${before} to ${after}`);
    }

    // Tests if PV flag keeps its value while running a test.
    ShouldKeepPVFlag(): void {
        const before = (this.RegistersBeforeRun.F & FlagsSetMask.PV) != 0;
        const after = (this.Cpu.Registers.F & FlagsSetMask.PV) != 0;
        if (after == before) return;
        fail(`PV flag expected to keep its value, but it changed from ${before} to ${after}`);
    }

    // Tests if H flag keeps its value while running a test.
    ShouldKeepHFlag(): void {
        const before = (this.RegistersBeforeRun.F & FlagsSetMask.H) != 0;
        const after = (this.Cpu.Registers.F & FlagsSetMask.H) != 0;
        if (after == before) return;
        fail(`PV flag expected to keep its value, but it changed from {before} to {after}`);
    }

    // Tests if C flag keeps its value while running a test.
    ShouldKeepCFlag(): void {
        const before = (this.RegistersBeforeRun.F & FlagsSetMask.C) != 0;
        const after = (this.Cpu.Registers.F & FlagsSetMask.C) != 0;
        if (after == before) return;
        fail(`C flag expected to keep its value, but it changed from ${before} to ${after}`);
    }

    // Check if the machine's memory keeps its previous values, except
    // the addresses and address ranges specified in <paramref name="except"/>
    ShouldKeepMemory(except: string = null): void {
        const MAX_DEVS = 10;
        const ranges: {From: number, To: number}[] = [];
        const deviations: number[] = [];

        // --- Parse ranges
        var strRanges = except == null ? [] : except.split(',');
        for (var i = 0; i < strRanges.length; i++) {
            const range = strRanges[i];
            const blocks = range.split('-');
            var lower = 0xffff;
            var upper = 0xffff;
            if (blocks.length >= 1) {
                lower = parseInt(blocks[0], 16);
                upper = lower;
            }
            if (blocks.length >= 2) {
                upper = parseInt(blocks[1], 16);
            }
            ranges.push({From: lower, To: upper});
        }

        // --- Check each byte of memory, ignoring the stack
        var upperMemoryBound = this.Cpu.Registers.SP;
        if (upperMemoryBound == 0) upperMemoryBound = 0x10000;
        for (var idx = 0; idx < upperMemoryBound; idx++) {
            if (this.Memory[idx] == this.MemoryBeforeRun[idx]) continue;

            // --- Test allowed deviations
            var found = ranges.some(range => idx >= range.From && idx <= range.To);
            if (found) continue;

            // --- Report deviation
            deviations.push(idx);
            if (deviations.length >= MAX_DEVS) break;
        }

        if (deviations.length > 0) {
            fail("The following memory locations are expected to remain intact, " +
                "but their values have been changed: " +
                deviations.map(d => d.toString(16)).join(", "));
        }
    }
}

// Holds information about a memory operation
class MemoryOp {
    constructor(public Address: number, public Values: number, public IsWrite: boolean) {
    }
}

// Holds information about an I/O operation
class IoOp {
    constructor(Address: number, Value: number, IsOutput: boolean) {
    }
}

// The test machine uses this memory device
class Z80TestMemoryDevice implements IMemoryDevice {
    constructor(private readFunc: (addr: number, read: boolean) => number, 
        private writeFunc: (addr: number, value: number) => void) {
    }

    Read(addr: number, suppressContention: boolean): number{
        return this.readFunc(addr, suppressContention);
    }

    Write(addr: number, value: number, supressContention = false): void {
        return this.writeFunc(addr, value);
    }

    ContentionWait(addr: number): void {
    }

    CloneMemory(): number[] {
        return [];
    }

    CopyRom(buffer: number[]): void {
    }

    SelectRom(romIndex: number): void {
    }

    GetSelectedRomIndex(): number {
        return 0;
    }

    PageIn(slot: number, bank: number, bank16Mode = true): void {
    }

    GetSelectedBankIndex(slot: number, bank16Mode = true): number {
        return 0;
    }

    UsesShadowScreen: boolean;

    get IsInAllRamMode() {
        return false;
    };

    get IsIn8KMode() {
        return false;
    };

    GetRomBuffer(romIndex: number): number[] {
        return [];
    }

    GetRamBank(bankIndex: number, bank16Mode = true): number[] {
        return [];
    }

    GetAddressLocation(addr: number): { IsInRom: boolean, Index: number, Address: number } {
        return null;
    }

    IsRamBankPagedIn(index: number): { IsPagedIn: boolean, BaseAddress: number } {
        return { IsPagedIn: false, BaseAddress: 0 };
    }

    Reset() {
    }

    GetDeviceState(): any {
    }

    RestoreDeviceState(state: any): void {
    }

    HostVm: ISpectrumVm;

    OnAttachedToVm(hostVm: ISpectrumVm ): void {
    }
}

// The test machine uses this port device 
class Z80TestPortDevice implements IPortDevice {
    public Cpu: IZ80Cpu;

    constructor(private readFunc: (addr: number) => number, private writeFunc: (address: number, value: number) => void) {
    }

    ReadPort(addr: number): number {
        this.ContentionWait(addr);
        return this.readFunc(addr);
    }

    WritePort(addr: number, data: number): void {
        this.ContentionWait(addr);
        this.writeFunc(addr, data);
    }

    ContentionWait(addr: number): void {
        this.Cpu.Delay(4);
    }

    Reset(): void {
    }

    GetDeviceState(): any {
    }

    RestoreDeviceState(state: any): void {
    }

    HostVm: ISpectrumVm;

    OnAttachedToVm(hostVm: ISpectrumVm): void {
    }
}


    // This enum defines the run modes the Z80TestMachine allows
export enum RunMode {
    // Run while the machine is disposed or a break signal arrives.
    Normal,

    // Run a single CPU Execution cycle, even if an operation
    // contains multiple bytes
    OneCycle,

    // Pause when the next single instruction is executed.
    OneInstruction,

    // Run until a HALT instruction is reached.
    UntilHalt,

    // Run until a break signal arrives.
    UntilBreak,

    // Run until the whole injected code is executed
    UntilEnd
}
