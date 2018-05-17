// This class represents the Z80 CPU
export class Z80Cpu {
    private _tacts: number;

    

    // Gets the current tact of the device -- the clock cycles since
    // the device was reset
    public get Tacts() { return this._tacts; }

    // Applies the RESET signal
    public Reset() {
        this._tacts = 0;
    }
}