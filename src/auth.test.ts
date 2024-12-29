import { getScraper } from './test-utils';
import { TwitterGuestAuth } from './auth';
import { Headers } from 'headers-polyfill';

const testLogin = process.env['TWITTER_PASSWORD'] ? test : test.skip;

testLogin(
  'scraper can log in',
  async () => {
    const scraper = await getScraper({ authMethod: 'password' });
    await expect(scraper.isLoggedIn()).resolves.toBeTruthy();
  },
  15000,
);

test('scraper can log in with cookies', async () => {
  const scraper = await getScraper();
  await expect(scraper.isLoggedIn()).resolves.toBeTruthy();
});

test('scraper can restore its login state from cookies', async () => {
  const scraper = await getScraper();
  await expect(scraper.isLoggedIn()).resolves.toBeTruthy();
  const scraper2 = await getScraper({ authMethod: 'anonymous' });
  await expect(scraper2.isLoggedIn()).resolves.toBeFalsy();

  const cookies = await scraper.getCookies();
  await scraper2.setCookies(cookies);

  await expect(scraper2.isLoggedIn()).resolves.toBeTruthy();
});

testLogin(
  'scraper can log out',
  async () => {
    const scraper = await getScraper({ authMethod: 'password' });
    await expect(scraper.isLoggedIn()).resolves.toBeTruthy();

    await scraper.logout();

    await expect(scraper.isLoggedIn()).resolves.toBeFalsy();
  },
  15000,
);

test('guest auth generates new user agent on each request', async () => {
  const auth = new TwitterGuestAuth('test-token');
  const headers1 = new Headers();
  const headers2 = new Headers();

  await auth.installTo(headers1);
  await auth.installTo(headers2);

  expect(headers1.get('user-agent')).not.toBe(headers2.get('user-agent'));
  expect(headers1.get('sec-ch-ua')).not.toBe(headers2.get('sec-ch-ua'));
});

test('guest auth ignores set user agent', async () => {
  const auth = new TwitterGuestAuth('test-token');
  const headers = new Headers();

  auth.setUserAgent('test-ua', 'test-sec');
  await auth.installTo(headers);

  expect(headers.get('user-agent')).not.toBe('test-ua');
  expect(headers.get('sec-ch-ua')).not.toBe('test-sec');
});

test('user auth maintains consistent user agent after login', async () => {
  const scraper = await getScraper({ authMethod: 'password' });
  await expect(scraper.isLoggedIn()).resolves.toBeTruthy();

  // Get initial UA/sec-ch-ua that was generated during login
  const { userAgent: ua1, secChUa: sec1 } = scraper.getUserAgent();
  expect(ua1).toBeDefined();
  expect(sec1).toBeDefined();

  // Make multiple requests, should use same UA/sec-ch-ua
  await scraper.getProfile('twitter');
  await scraper.getProfile('x');

  const { userAgent: ua2, secChUa: sec2 } = scraper.getUserAgent();
  expect(ua2).toBe(ua1);
  expect(sec2).toBe(sec1);
}, 15000);
