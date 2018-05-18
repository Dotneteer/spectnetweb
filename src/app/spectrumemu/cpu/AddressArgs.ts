// This class represent the arguments of an address-related event
export class AddressArgs
{
    // Address read
    readonly Address: number;

    constructor(address: number)
    {
        this.Address = address;
    }
}