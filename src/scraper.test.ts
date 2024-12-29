import { Scraper } from './scraper';
import { getScraper } from './test-utils';

test('scraper can fetch home timeline', async () => {
  const scraper = await getScraper();

  const count = 20;
  const seenTweetIds: string[] = [];

  const homeTimeline = await scraper.fetchHomeTimeline(count, seenTweetIds);
  console.log(homeTimeline);
  expect(homeTimeline).toBeDefined();
  expect(homeTimeline?.length).toBeGreaterThan(0);
  expect(homeTimeline[0]?.rest_id).toBeDefined();
}, 30000);

test('scraper can fetch following timeline', async () => {
  const scraper = await getScraper();

  const count = 20;
  const seenTweetIds: string[] = [];

  const homeTimeline = await scraper.fetchFollowingTimeline(
    count,
    seenTweetIds,
  );
  console.log(homeTimeline);
  expect(homeTimeline).toBeDefined();
  expect(homeTimeline?.length).toBeGreaterThan(0);
  expect(homeTimeline[0]?.rest_id).toBeDefined();
}, 30000);

test('scraper uses response transform when provided', async () => {
  const scraper = new Scraper({
    transform: {
      response: (response) =>
        new Proxy(response, {
          get(target, p, receiver) {
            if (p === 'status') {
              return 400;
            }

            if (p === 'ok') {
              return false;
            }

            return Reflect.get(target, p, receiver);
          },
        }),
    },
  });

  await expect(scraper.getLatestTweet('twitter')).rejects.toThrow();
});

test('scraper can get and set user agent', async () => {
  const scraper = await getScraper();
  const { userAgent: ua1, secChUa: sec1 } = scraper.getUserAgent();

  // Set new values
  scraper.setUserAgent('test-ua', 'test-sec');
  const { userAgent: ua2, secChUa: sec2 } = scraper.getUserAgent();

  expect(ua2).toBe('test-ua');
  expect(sec2).toBe('test-sec');
  expect(ua2).not.toBe(ua1);
  expect(sec2).not.toBe(sec1);
});

test('scraper maintains user agent when restoring from cookies', async () => {
  const scraper1 = await getScraper();
  scraper1.setUserAgent('test-ua', 'test-sec');
  const cookies = await scraper1.getCookies();

  const scraper2 = await getScraper({ authMethod: 'anonymous' });
  await scraper2.setCookies(cookies);
  scraper2.setUserAgent('test-ua', 'test-sec');

  const { userAgent, secChUa } = scraper2.getUserAgent();
  expect(userAgent).toBe('test-ua');
  expect(secChUa).toBe('test-sec');
});
