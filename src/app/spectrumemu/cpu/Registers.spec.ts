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

    it('Setting B works as expected', () => {
        this.registers.B = 0xA5;
        expect(this.registers.B).toBe(0xA5);
        expect(this.registers.BC).toBe(0xA5FF);
        this.registers.B = 0x23A5;
        expect(this.registers.B).toBe(0xA5);
        expect(this.registers.BC).toBe(0xA5FF);
    });

    it('Setting C works as expected', () => {
        this.registers.C = 0xA5;
        expect(this.registers.C).toBe(0xA5);
        expect(this.registers.BC).toBe(0xFFA5);
        this.registers.C = 0x23A5;
        expect(this.registers.C).toBe(0xA5);
        expect(this.registers.BC).toBe(0xFFA5);
    });

    it('Setting BC works as expected', () => {
        this.registers.BC = 0xA524;
        expect(this.registers.B).toBe(0xA5);
        expect(this.registers.C).toBe(0x24);
        expect(this.registers.BC).toBe(0xA524);
        this.registers.BC = 0x11A524;
        expect(this.registers.B).toBe(0xA5);
        expect(this.registers.C).toBe(0x24);
        expect(this.registers.BC).toBe(0xA524);
    });

    it('Setting D works as expected', () => {
        this.registers.D = 0xA5;
        expect(this.registers.D).toBe(0xA5);
        expect(this.registers.DE).toBe(0xA5FF);
        this.registers.D = 0x23A5;
        expect(this.registers.D).toBe(0xA5);
        expect(this.registers.DE).toBe(0xA5FF);
    });

    it('Setting E works as expected', () => {
        this.registers.E = 0xA5;
        expect(this.registers.E).toBe(0xA5);
        expect(this.registers.DE).toBe(0xFFA5);
        this.registers.E = 0x23A5;
        expect(this.registers.E).toBe(0xA5);
        expect(this.registers.DE).toBe(0xFFA5);
    });

    it('Setting DE works as expected', () => {
        this.registers.DE = 0xA524;
        expect(this.registers.D).toBe(0xA5);
        expect(this.registers.E).toBe(0x24);
        expect(this.registers.DE).toBe(0xA524);
        this.registers.DE = 0x11A524;
        expect(this.registers.D).toBe(0xA5);
        expect(this.registers.E).toBe(0x24);
        expect(this.registers.DE).toBe(0xA524);
    });

    it('Setting H works as expected', () => {
        this.registers.H = 0xA5;
        expect(this.registers.H).toBe(0xA5);
        expect(this.registers.HL).toBe(0xA5FF);
        this.registers.H = 0x23A5;
        expect(this.registers.H).toBe(0xA5);
        expect(this.registers.HL).toBe(0xA5FF);
    });

    it('Setting L works as expected', () => {
        this.registers.L = 0xA5;
        expect(this.registers.L).toBe(0xA5);
        expect(this.registers.HL).toBe(0xFFA5);
        this.registers.L = 0x23A5;
        expect(this.registers.L).toBe(0xA5);
        expect(this.registers.HL).toBe(0xFFA5);
    });

    it('Setting HL works as expected', () => {
        this.registers.HL = 0xA524;
        expect(this.registers.H).toBe(0xA5);
        expect(this.registers.L).toBe(0x24);
        expect(this.registers.HL).toBe(0xA524);
        this.registers.DE = 0x11A524;
        expect(this.registers.H).toBe(0xA5);
        expect(this.registers.L).toBe(0x24);
        expect(this.registers.HL).toBe(0xA524);
    });

    it('Setting AF_ works as expected', () => {
        this.registers._AF_ = 0xA524;
        expect(this.registers._AF_).toBe(0xA524);
        this.registers._AF_ = 0x11A524;
        expect(this.registers._AF_).toBe(0xA524);
    });

    it('Setting BC_ works as expected', () => {
        this.registers._BC_ = 0xA524;
        expect(this.registers._BC_).toBe(0xA524);
        this.registers._BC_ = 0x11A524;
        expect(this.registers._BC_).toBe(0xA524);
    });

    it('Setting DE_ works as expected', () => {
        this.registers._DE_ = 0xA524;
        expect(this.registers._DE_).toBe(0xA524);
        this.registers._DE_ = 0x11A524;
        expect(this.registers._DE_).toBe(0xA524);
    });

    it('Setting HL_ works as expected', () => {
        this.registers._HL_ = 0xA524;
        expect(this.registers._HL_).toBe(0xA524);
        this.registers._HL_ = 0x11A524;
        expect(this.registers._HL_).toBe(0xA524);
    });

    it('Setting I works as expected', () => {
        this.registers.I = 0xA5;
        expect(this.registers.I).toBe(0xA5);
        expect(this.registers.IR).toBe(0xA5FF);
        this.registers.I = 0x23A5;
        expect(this.registers.I).toBe(0xA5);
        expect(this.registers.IR).toBe(0xA5FF);
    });

    it('Setting R works as expected', () => {
        this.registers.R = 0xA5;
        expect(this.registers.R).toBe(0xA5);
        expect(this.registers.IR).toBe(0xFFA5);
        this.registers.R = 0x23A5;
        expect(this.registers.R).toBe(0xA5);
        expect(this.registers.IR).toBe(0xFFA5);
    });

    it('Setting IR works as expected', () => {
        this.registers.IR = 0xA524;
        expect(this.registers.I).toBe(0xA5);
        expect(this.registers.R).toBe(0x24);
        expect(this.registers.IR).toBe(0xA524);
        this.registers.IR = 0x11A524;
        expect(this.registers.I).toBe(0xA5);
        expect(this.registers.R).toBe(0x24);
        expect(this.registers.IR).toBe(0xA524);
    });

    it('Setting PC works as expected', () => {
        this.registers.PC = 0xA524;
        expect(this.registers.PC).toBe(0xA524);
        this.registers.PC = 0x11A524;
        expect(this.registers.PC).toBe(0xA524);
    });

    it('Setting SP works as expected', () => {
        this.registers.SP = 0xA524;
        expect(this.registers.SP).toBe(0xA524);
        this.registers.SP = 0x11A524;
        expect(this.registers.SP).toBe(0xA524);
    });

    it('Setting XH works as expected', () => {
        this.registers.XH = 0xA5;
        expect(this.registers.XH).toBe(0xA5);
        expect(this.registers.IX).toBe(0xA5FF);
        this.registers.XH = 0x23A5;
        expect(this.registers.XH).toBe(0xA5);
        expect(this.registers.IX).toBe(0xA5FF);
    });

    it('Setting XL works as expected', () => {
        this.registers.XL = 0xA5;
        expect(this.registers.XL).toBe(0xA5);
        expect(this.registers.IX).toBe(0xFFA5);
        this.registers.XL = 0x23A5;
        expect(this.registers.XL).toBe(0xA5);
        expect(this.registers.IX).toBe(0xFFA5);
    });

    it('Setting IX works as expected', () => {
        this.registers.IX = 0xA524;
        expect(this.registers.XH).toBe(0xA5);
        expect(this.registers.XL).toBe(0x24);
        expect(this.registers.IX).toBe(0xA524);
        this.registers.IX = 0x11A524;
        expect(this.registers.XH).toBe(0xA5);
        expect(this.registers.XL).toBe(0x24);
        expect(this.registers.IX).toBe(0xA524);
    });

    it('Setting YH works as expected', () => {
        this.registers.YH = 0xA5;
        expect(this.registers.YH).toBe(0xA5);
        expect(this.registers.IY).toBe(0xA5FF);
        this.registers.YH = 0x23A5;
        expect(this.registers.YH).toBe(0xA5);
        expect(this.registers.IY).toBe(0xA5FF);
    });

    it('Setting YL works as expected', () => {
        this.registers.YL = 0xA5;
        expect(this.registers.YL).toBe(0xA5);
        expect(this.registers.IY).toBe(0xFFA5);
        this.registers.YL = 0x23A5;
        expect(this.registers.YL).toBe(0xA5);
        expect(this.registers.IY).toBe(0xFFA5);
    });

    it('Setting IY works as expected', () => {
        this.registers.IY = 0xA524;
        expect(this.registers.YH).toBe(0xA5);
        expect(this.registers.YL).toBe(0x24);
        expect(this.registers.IY).toBe(0xA524);
        this.registers.IY = 0x11A524;
        expect(this.registers.YH).toBe(0xA5);
        expect(this.registers.YL).toBe(0x24);
        expect(this.registers.IY).toBe(0xA524);
    });

    it('Setting WZH works as expected', () => {
        this.registers.WZH = 0xA5;
        expect(this.registers.WZH).toBe(0xA5);
        expect(this.registers.WZ).toBe(0xA5FF);
        this.registers.WZH = 0x23A5;
        expect(this.registers.WZH).toBe(0xA5);
        expect(this.registers.WZ).toBe(0xA5FF);
    });

    it('Setting WZL works as expected', () => {
        this.registers.WZL = 0xA5;
        expect(this.registers.WZL).toBe(0xA5);
        expect(this.registers.WZ).toBe(0xFFA5);
        this.registers.WZL = 0x23A5;
        expect(this.registers.WZL).toBe(0xA5);
        expect(this.registers.WZ).toBe(0xFFA5);
    });

    it('Setting WZ works as expected', () => {
        this.registers.WZ = 0xA524;
        expect(this.registers.WZH).toBe(0xA5);
        expect(this.registers.WZL).toBe(0x24);
        expect(this.registers.WZ).toBe(0xA524);
        this.registers.WZ = 0x11A524;
        expect(this.registers.WZH).toBe(0xA5);
        expect(this.registers.WZL).toBe(0x24);
        expect(this.registers.WZ).toBe(0xA524);
    });

    it('Getting S Flag works as expected', () => {
        this.registers.F = 0x00;
        expect(this.registers.SFlag).toBeFalsy();
        this.registers.F = 0x80;
        expect(this.registers.SFlag).toBeTruthy();
    });

    it('Getting Z Flag works as expected', () => {
        this.registers.F = 0x00;
        expect(this.registers.ZFlag).toBeFalsy();
        this.registers.F = 0x40;
        expect(this.registers.ZFlag).toBeTruthy();
    });

    it('Getting R5 Flag works as expected', () => {
        this.registers.F = 0x00;
        expect(this.registers.R5Flag).toBeFalsy();
        this.registers.F = 0x20;
        expect(this.registers.R5Flag).toBeTruthy();
    });

    it('Getting H Flag works as expected', () => {
        this.registers.F = 0x00;
        expect(this.registers.HFlag).toBeFalsy();
        this.registers.F = 0x10;
        expect(this.registers.HFlag).toBeTruthy();
    });

    it('Getting R3 Flag works as expected', () => {
        this.registers.F = 0x00;
        expect(this.registers.R3Flag).toBeFalsy();
        this.registers.F = 0x08;
        expect(this.registers.R3Flag).toBeTruthy();
    });

    it('Getting PV Flag works as expected', () => {
        this.registers.F = 0x00;
        expect(this.registers.PVFlag).toBeFalsy();
        this.registers.F = 0x04;
        expect(this.registers.PVFlag).toBeTruthy();
    });

    it('Getting N Flag works as expected', () => {
        this.registers.F = 0x00;
        expect(this.registers.NFlag).toBeFalsy();
        this.registers.F = 0x04;
        expect(this.registers.PVFlag).toBeTruthy();
    });

    it('Getting C Flag works as expected', () => {
        this.registers.F = 0x00;
        expect(this.registers.NFlag).toBeFalsy();
        this.registers.F = 0x04;
        expect(this.registers.PVFlag).toBeTruthy();
    });

    it('ExchangeAFSet works as expected', () => {
        this.registers.AF = 0xABCD;
        this.registers._AF_ = 0x1234;
        this.registers.ExchangeAfSet();
        expect(this.registers.AF).toBe(0x1234);
        expect(this.registers._AF_).toBe(0xABCD);
    });

    it('ExchangeRegisterSet works as expected', () => {
        this.registers.BC = 0xABCD;
        this.registers._BC_ = 0x1234;
        this.registers.DE = 0xBCDE;
        this.registers._DE_ = 0x2345;
        this.registers.HL = 0xCDEF;
        this.registers._HL_ = 0x3456;
        this.registers.ExchangeRegisterSet();
        expect(this.registers.BC).toBe(0x1234);
        expect(this.registers._BC_).toBe(0xABCD);
        expect(this.registers.DE).toBe(0x2345);
        expect(this.registers._DE_).toBe(0xBCDE);
        expect(this.registers.HL).toBe(0x3456);
        expect(this.registers._HL_).toBe(0xCDEF);
    });
})