import { Z80Cpu } from './Z80Cpu'
describe('Z80 CPU Basic tests', () => {

    beforeEach(() => {
        // TODO: Set up each test
    });

    afterEach(() => {
        // TODO: tear down each test
    });

    it('Reset() should clear Tacts', () => {
        var z80 = new Z80Cpu();
        z80.Reset();
        expect(z80.Tacts).toBe(0);
    })
})