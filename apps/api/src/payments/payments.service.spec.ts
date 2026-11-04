import { PaymentsService } from './payments.service';
describe('PaymentsService', () => {
  const svc = new PaymentsService({} as never);
  it('sign + verify roundtrip', () => {
    const body = '{"id":"e1"}';
    const sig = svc.sign(body);
    expect(svc.verify(body, sig)).toBe(true);
    expect(svc.verify(body, sig.slice(0, -1) + '0')).toBe(false);
  });
});
