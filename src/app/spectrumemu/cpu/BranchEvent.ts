// This class provides information about a branching event
export class BranchEvent {
    // Address of the operation that modified SP
    readonly OperationAddress: number;

    // The operation that modified SP
    readonly Operation: string;

    // Jump address
    readonly JumpAddress: number;

    // CPU tacts after the operation
    readonly Tacts: number;

    constructor(operationAddress: number, operation: string, 
        jumpAddress: number, tacts: number)
        {
            this.OperationAddress = operationAddress;
            this.Operation = operation;
            this.JumpAddress = jumpAddress;
            this.Tacts = tacts;
        }
}