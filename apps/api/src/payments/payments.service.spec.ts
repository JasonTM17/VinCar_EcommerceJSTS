import { PaymentsService } from './payments.service';

describe('PaymentsService', () => {
  const notifications = { publish: jest.fn() } as never;
  const svc = new PaymentsService({} as never, notifications);

  it('sign + verify roundtrip', () => {
    const body = '{"id":"e1"}';
    const sig = svc.sign(body);
    expect(svc.verify(body, sig)).toBe(true);
    expect(svc.verify(body, sig.slice(0, -1) + '0')).toBe(false);
  });
});
