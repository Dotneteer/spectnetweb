import { Registers } from './Registers'
describe('Z80 CPU Basic tests', () => {

    var registers: Registers;

    beforeEach(() => {
        this.registers = new Registers();
    });

    afterEach(() => {
        // TODO: tear down each test
    });

    it('Setting A works as expected', () => {
        this.registers.A = 0xA5;
        expect(this.registers.A).toBe(0xA5);
        expect(this.registers.AF).toBe(0xA5FF);
        this.registers.A = 0x23A5;
        expect(this.registers.A).toBe(0xA5);
        expect(this.registers.AF).toBe(0xA5FF);
    });

    it('Setting F works as expected', () => {
        this.registers.F = 0xA5;
        expect(this.registers.F).toBe(0xA5);
        expect(this.registers.AF).toBe(0xFFA5);
        this.registers.F = 0x23A5;
        expect(this.registers.F).toBe(0xA5);
        expect(this.registers.AF).toBe(0xFFA5);
    });

    it('Setting AF works as expected', () => {
        this.registers.AF = 0xA524;
        expect(this.registers.A).toBe(0xA5);
        expect(this.registers.F).toBe(0x24);
        expect(this.registers.AF).toBe(0xA524);
        this.registers.AF = 0x11A524;
        expect(this.registers.A).toBe(0xA5);
        expect(this.registers.F).toBe(0x24);
        expect(this.registers.AF).toBe(0xA524);
    });

})