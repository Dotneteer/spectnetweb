import { StackPointerManipulationEvent } from "../cpu/StackPointerManipulationEvent";
import { StackContentManipulationEvent } from "../cpu/StackContentManipulationEvent";

// This interface defines the operations that support debugging the call stack
export interface IStackDebugSupport {
    // Records a stack pointer manipulation event
    RecordStackPointerManipulationEvent(ev: StackPointerManipulationEvent): void;

    // Records a stack content manipulation event
    RecordStackContentManipulationEvent(ev: StackContentManipulationEvent): void;
}