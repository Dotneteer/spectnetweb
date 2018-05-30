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

    it('Touch works as expected', () => {

        this.status.Touch(123);
        this.status.Touch(2345);
        this.status.Touch(34567);

        var combined : boolean = false;
        for (var i = 0; i <= 0xF; i++) {
            if (i == 123 || i == 2345 || i == 34567) continue;
            combined = combined || this.status.GetBit(i);
        }

        expect(combined).toBeFalsy();
        expect(this.status.GetBit(123)).toBeTruthy();
        // expect(this.status.GetBit(2345)).toBeTruthy();
        // expect(this.status.GetBit(34567)).toBeTruthy();
    });

    it('Touched works as expected', () => {

        this.status.Touch(2345);
        this.status.Touch(2346);
        this.status.Touch(2347);
        this.status.Touch(2348);

        expect(this.status.Touched(2344, 2348)).toBeFalsy();
        expect(this.status.Touched(2344, 2347)).toBeFalsy();
        expect(this.status.Touched(2344, 2346)).toBeFalsy();
        expect(this.status.Touched(2344, 2345)).toBeFalsy();

        expect(this.status.Touched(2345, 2348)).toBeTruthy();
        expect(this.status.Touched(2345, 2347)).toBeTruthy();
        expect(this.status.Touched(2345, 2346)).toBeTruthy();
        expect(this.status.Touched(2345, 2345)).toBeTruthy();

        expect(this.status.Touched(2345, 2349)).toBeFalsy();
        expect(this.status.Touched(2346, 2349)).toBeFalsy();
        expect(this.status.Touched(2347, 2349)).toBeFalsy();
        expect(this.status.Touched(2348, 2349)).toBeFalsy();
    });


})