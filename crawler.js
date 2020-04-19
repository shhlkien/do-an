const puppeteer = require('puppeteer');

const { writeFile, mkdir, exists } = require('./helpers/fs-promise');
const { error } = require('./helpers/console');

const webpage = 'https://duckduckgo.com/?';
const params = new URLSearchParams({
  t: 'canonical',
  iar: 'images',
  iax: 'images',
  ia: 'images',
  iaf: 'type:photo',
});
const IMAGE_SELECTOR = '.tile--img__img.js-lazyload';
// 'Scarlett Johansson actor', 'Jeremy Renner actor', 'Mark Ruffalo  actor', 'Chris Hemsworth actor', 'Don Cheadle actor', 'Paul Rudd actor', 'Benedict Cumberbatch actor', 'Robert Downey Jr. actor', 'Chadwick Boseman actor', 'Brie Larson actor', 'Tom Holland actor', 'Karen Gillan actor', 'Zoe Saldana actor', 'Evangeline Lilly actor', 'Tessa Thompson actor', 'Rene Russo actor', 'Elizabeth Olsen actor', 'Anthony Mackie actor', 'Sebastian Stan actor', 'Tom Hiddleston actor', 'Danai Gurira actor', 'Benedict Wong actor', 'Pom Klementieff actor', 'Dave Bautista actor', 'Letitia Wright actor', 'John Slattery actor', 'Tilda Swinton actor', 'Jon Favreau actor', 'Hayley Atwell actor', 'Natalie Portman actor', 'Chris Evans actor','Michael Douglas actor', 'William Hurt actor', 'Winston Duke actor', 'Hiroyuki Sanada actor', 'Tom Vaughan-Lawlor actor', 'Josh Brolin actor', 'Chris Pratt actor', 'Samuel L. Jackson actor', 'Ross Marquand actor', 'Joe Russo actor', 'Michael James Shaw actor', 'Ben Sakamoto actor', 'Cade Woodward actor', 'Stan Lee actor', 'John Michael Morris actor', 'Patrick Gorman actor'
const people = ['Tobey Maguire actor', 'Willem Dafoe actor', 'James Franco actor'];

(async () => {
  try {
    const browser = await puppeteer.launch({
      headless: 1,
      slowMo: 500,
      // args: ['--proxy-server=REDACTED:80']
    });
    const page = await browser.newPage();

    await page.setViewport({ width: 1200, height: 300 });
    await page.authenticate(null);
    page.on('console', msg => console.log(msg.text()));

    for (let j = people.length; --j >= 0;) {

      params.append('q', people[j]);
      await page.goto(webpage + params, { waitUntil: 'domcontentloaded', timeout: 0 });
      await page.waitForSelector(IMAGE_SELECTOR);

      const images = await page.evaluate(
        sel => {
          const imageElements = document.querySelectorAll(sel);
          const images = [];
          console.log(`crawler.js:33: `, !!imageElements)

          if (imageElements) {

            for (let i = 0; i < 20; i++) {

              const alt = imageElements[i].getAttribute('alt').toLowerCase();
              const type = alt.includes('jpeg') ? 'jpeg' : alt.includes('jpg') ? 'jpg' : 'png';

              images.push({
                src: imageElements[i].getAttribute('src').replace('//', 'https:'),
                type
              });
            }
          }

          return images;
        },
        IMAGE_SELECTOR);

      if (images.length === 0) continue;

      const dir = `seeds/models/${people[j]}`;

      if (!await exists(dir)) await mkdir(dir);

      for (let i = images.length; --i >= 0;) {

        const { src, type } = images[i];
        const viewSource = await page.goto(src);

        await writeFile(`${dir}/${i}.${type}`, await viewSource.buffer());
      }

      params.delete('q');
    }

    await browser.close();
  }
  catch (err) {
    console.log(error(err));
    process.exit(1);
  }
})();