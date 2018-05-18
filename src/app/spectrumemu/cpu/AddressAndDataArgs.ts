// This class represent the arguments of a write event
export class AddressAndDataArgs
{
    // Address written
    readonly Address: number;

    // Data written
    readonly Data: number;

    constructor(address: number, data: number)
    {
        this.Address = address;
        this.Data = data;
    }
}