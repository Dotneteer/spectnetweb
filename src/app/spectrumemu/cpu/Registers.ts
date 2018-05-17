// Represents the register set of the Z80 CPU
export class Registers {
    private _a: number;
    private _f: number;

    // Register A
    public get A() { return this._a; }
    public set A(value: number) { this._a = value & 0xff; }

    // Register F
    public get F() { return this._f; }
    public set F(value: number) { this._f = value & 0xff; }

    // Register AF
    public get AF() { return (this._a << 8) | this._f; }
    public set AF(value: number) {
        this._a = (value >> 8) & 0xff;
        this._f = value & 0xff;
    }

    constructor() {
        this._a = 0xff;
        this._f = 0xff;
    }
}