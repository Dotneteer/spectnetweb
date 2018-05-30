// --- This class represents a status array where every bit 
// --- indicates the status of a particular memory address
// --- within the 64K memory space
export class MemoryStatusArray {
    // --- Stores the array of bits, each number 32 bits
    private readonly _memoryBits: number[] = [];

    // --- Create an array of zero bits
    constructor() {
        this.ClearAll();
    }

    // --- Clear all bits
    public ClearAll() {
        for (var i = 0; i < 2048; i++) {
            this._memoryBits[i] = 0;
        }
    }

    // --- Gets the state of the specified bit
    public GetBit(index: number) : boolean {
        if (index < 0 || index > 0xFFFF) {
            throw new Error(`index value ${index} is out of range: 0x0000 - 0xFFFF`);
        }
        var position = index >> 5;
        var mask = 1 << (index % 32);
        return (this._memoryBits[position] & mask) != 0;
    }

    // --- Sets the specified bit to true
    public Touch(index: number) {
        if (index < 0 || index > 0xFFFF) {
            throw new Error(`index value ${index} is out of range: 0x0000 - 0xFFFF`);
        }
        var position = index >> 5;
        var mask = 1 << (index % 32);
        this._memoryBits[position] |= mask; 
    }

    // --- Checks if all addresses are touched between the start and end
    public Touched(start: number, end: number) {
        if (start < 0 || start > 0xFFFF) {
            throw new Error(`index value ${start} is out of range: 0x0000 - 0xFFFF`);
        }
        if (end < 0 || end > 0xFFFF) {
            throw new Error(`index value ${end} is out of range: 0x0000 - 0xFFFF`);
        }
        for (var i = start; i <= end; i++) {
                if (!this.GetBit(i)) return false;
        }
        return true;
    }
}