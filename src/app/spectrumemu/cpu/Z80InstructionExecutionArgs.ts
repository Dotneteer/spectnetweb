// Represents the event args of a Z80 operation
export class Z80InstructionExecutionArgs {
    // PC before the execution
    readonly PcBefore: number;

    // Operation code bytes
    readonly Instruction: number[];

    // Operation code
    readonly OpCode: number;

    // PC after the operation
    readonly PcAfter?: number;

    constructor(pcBefore: number, instruction: number[], opCode: number, pcAfter: (number|null))
    {
        this.PcBefore = pcBefore;
        this.Instruction = instruction.slice(0);
        this.OpCode = opCode;
        this.PcAfter = pcAfter;
    }
}
