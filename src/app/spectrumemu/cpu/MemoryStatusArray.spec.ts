import { MemoryStatusArray } from './MemoryStatusArray'
describe('MemoryStatusArray tests', () => {

    var status: MemoryStatusArray;

    beforeEach(() => {
        this.status = new MemoryStatusArray();
    });

    afterEach(() => {
        // TODO: tear down each test
    });

    it('All bits are false initially', () => {
        var combined : boolean = false;
        for (var i = 0; i <= 0xF; i++) {
            combined = combined || this.status.GetBit(i);
        }
        expect(combined).toBeFalsy();
    });


})