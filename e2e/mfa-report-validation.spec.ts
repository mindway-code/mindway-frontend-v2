import { createHmac, randomUUID } from 'node:crypto';
import { expect, test, type APIRequestContext, type APIResponse } from '@playwright/test';

const apiUrl = process.env['PLAYWRIGHT_API_URL'] ?? 'http://localhost:3333/api';

async function responseData<T>(response: APIResponse): Promise<T> {
  expect(response.ok(), `${response.status()} ${response.url()}`).toBeTruthy();
  return ((await response.json()) as { data: T }).data;
}

function decodeBase32(value: string): Buffer {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = '';
  for (const character of value.replace(/=+$/g, '').replace(/\s/g, '').toUpperCase()) {
    const index = alphabet.indexOf(character);
    if (index < 0) throw new Error('Invalid Base32 secret');
    bits += index.toString(2).padStart(5, '0');
  }
  const bytes: number[] = [];
  for (let offset = 0; offset + 8 <= bits.length; offset += 8) {
    bytes.push(Number.parseInt(bits.slice(offset, offset + 8), 2));
  }
  return Buffer.from(bytes);
}

function totp(secret: string, stepOffset = 0): string {
  const step = Math.floor(Date.now() / 30_000) + stepOffset;
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(step));
  const digest = createHmac('sha1', decodeBase32(secret)).update(counter).digest();
  const offset = digest[digest.length - 1]! & 0x0f;
  const binary =
    ((digest[offset]! & 0x7f) << 24) |
    ((digest[offset + 1]! & 0xff) << 16) |
    ((digest[offset + 2]! & 0xff) << 8) |
    (digest[offset + 3]! & 0xff);
  return String(binary % 1_000_000).padStart(6, '0');
}

async function alignAwayFromTotpBoundary(): Promise<void> {
  const second = Math.floor(Date.now() / 1000) % 30;
  const waitMilliseconds =
    second < 3 ? (3 - second) * 1000 : second > 26 ? (33 - second) * 1000 : 0;
  if (waitMilliseconds) await new Promise((resolve) => setTimeout(resolve, waitMilliseconds));
}

test('enrolls MFA, returns to the report and publishes the submitted revision', async ({
  page,
  request,
}) => {
  const suffix = randomUUID().slice(0, 8);
  const email = `mfa-e2e-${suffix}@example.test`;
  const password = `Mfa-E2e-${randomUUID()}!`;
  const reportTitle = `Jornada MFA ${suffix}`;
  let token = '';
  let childId = '';

  try {
    const registration = await responseData<{ accessToken: string }>(
      await request.post(`${apiUrl}/auth/register`, {
        data: {
          name: 'Jornada MFA E2E',
          email,
          password,
          confirmPassword: password,
          role: 'common',
        },
      }),
    );
    token = registration.accessToken;
    const headers = { Authorization: `Bearer ${token}` };

    const child = await responseData<{ id: string }>(
      await request.post(`${apiUrl}/children`, {
        headers,
        data: { name: `Crianca E2E ${suffix}`, age: 8, birthDate: '2018-01-01T00:00:00.000Z' },
      }),
    );
    childId = child.id;
    const report = await responseData<{ id: string }>(
      await request.post(`${apiUrl}/reports-children/child/${childId}`, {
        headers,
        data: {
          title: reportTitle,
          behavior: 'Conteudo usado somente na jornada automatizada.',
          difficulty: 'Nenhum dado real.',
          recommendation: 'Confirmar publicacao protegida por MFA.',
        },
      }),
    );
    await responseData(
      await request.post(`${apiUrl}/reports-children/${report.id}/submissions`, {
        headers,
        data: {},
      }),
    );

    await page.addInitScript(
      (accessToken) => sessionStorage.setItem('accessToken', accessToken),
      token,
    );
    await page.goto('/settings?section=security&returnUrl=%2Freports-child');
    await expect(page.getByRole('heading', { name: /Seguran/ }).first()).toBeVisible();

    await page.getByLabel('Senha atual').first().fill(password);
    await page.getByRole('button', { name: /Ativar verifica/ }).click();
    await expect(
      page.getByAltText('QR Code para configurar o aplicativo autenticador'),
    ).toBeVisible();
    const secret = (await page.getByTestId('mfa-manual-secret').textContent())?.trim();
    expect(secret).toBeTruthy();

    await alignAwayFromTotpBoundary();
    await page.getByLabel(/digo de verifica/).fill(totp(secret!, -1));
    await page.getByRole('button', { name: 'Confirmar e ativar' }).click();
    await expect(
      page.getByRole('heading', { name: /Salve seus c.digos de recupera/ }),
    ).toBeVisible();
    await expect(page.getByTestId('mfa-recovery-codes').locator('li')).toHaveCount(10);

    await page.getByRole('button', { name: /salvei, voltar ao relat/ }).click();
    await expect(page).toHaveURL(/\/reports-child$/);
    await page.getByRole('button', { name: reportTitle, exact: true }).click();
    await page.getByRole('button', { name: /Validar relat/ }).click();

    const validationDialog = page.getByRole('dialog', { name: /Validar revis/ });
    await expect(validationDialog).toBeVisible();
    await expect(page.getByRole('dialog')).toHaveCount(1);
    await validationDialog.getByLabel(/digo de verifica/).fill(totp(secret!));
    await validationDialog.getByRole('button', { name: 'Confirmar e validar' }).click();

    await expect(
      page.getByRole('heading', { name: /Identidade confirmada com verifica/ }),
    ).toBeVisible();
    await expect(page.getByText(/Revis.o 1 validada por Jornada MFA E2E/)).toBeVisible();
  } finally {
    if (token) {
      const headers = { Authorization: `Bearer ${token}` };
      if (childId) await request.delete(`${apiUrl}/children/${childId}`, { headers });
      await request.delete(`${apiUrl}/users/me`, { headers });
    }
  }
});
