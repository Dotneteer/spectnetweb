import { BranchEvent } from "../cpu/BranchEvent";

// This interface provides information that support debugging branching statements
export interface IBranchDebugSupport
{
    // Records a branching event
    RecordBranchEvent(ev: BranchEvent ): void;
}
