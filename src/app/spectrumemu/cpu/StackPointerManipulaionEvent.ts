// This class provides information about a stack pointer manipulation
// event
export class StackPointerManipulationEvent
{
    // Address of the operation that modified SP
    readonly OperationAddress: number;

    // The operation that modified SP
    readonly Operation: string;

    // Old SP value
    readonly OldValue: number;

    // New SP value
    readonly NewValue: number;

    // CPU tacts after the operation
    readonly Tacts: number;

    constructor(operationAddress: number, operation: string, 
        oldValue: number, newValue: number, tacts: number)
    {
        this.OperationAddress = operationAddress;
        this.Operation = operation;
        this.OldValue = oldValue;
        this.NewValue = newValue;
        this.Tacts = tacts;
    }
}