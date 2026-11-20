import { safeInternalReturnUrl } from './settings.component';

describe('safeInternalReturnUrl', () => {
  const origin = 'https://mindway.example';

  it('keeps an internal path with query string and fragment', () => {
    expect(safeInternalReturnUrl('/reports-child?page=2#report', origin)).toBe(
      '/reports-child?page=2#report',
    );
  });

  it('rejects absolute, protocol-relative and non-path values', () => {
    expect(safeInternalReturnUrl('https://attacker.example', origin)).toBeNull();
    expect(safeInternalReturnUrl('//attacker.example/reports-child', origin)).toBeNull();
    expect(safeInternalReturnUrl('javascript:alert(1)', origin)).toBeNull();
    expect(safeInternalReturnUrl(null, origin)).toBeNull();
  });
});
