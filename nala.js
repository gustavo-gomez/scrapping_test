const puppeteer = require("puppeteer");
const {getPrices} = require('./util.js');
const {sendEmail} = require('./email.js');

const trueOriginsPageURL = 'https://www.superpet.pe/gato/alimentos-y-snacks/alimento-seco?cgid=alimentos-seco-gato&prefn1=brand&prefv1=True%20Origins%20Pure'
const grainFreeSalmon = 'True Origins Pure Cat Adult Sterilized Salmon Grain free';
const grainFreeChicken = 'True Origins Pure Cat Adult Stererilized Chicken Grain free';

(async () => {
  let browser;
  console.log(process.env.NODE_ENV);
  if (process.env.NODE_ENV === 'production')
    browser = await puppeteer.launch({headless: true, args: ['--no-sandbox']});
  else
    browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto(trueOriginsPageURL);
  await page.setViewport({width: 1080, height: 1024});
  const searchResultSelector = '.product .text-base';
  await page.waitForSelector(searchResultSelector);

  const grainFreeSalmonPrices = await getPrices(grainFreeSalmon, page);


  await page.goBack();
  await page.waitForSelector(searchResultSelector);

  const grainFreeChickenPrices = await getPrices(grainFreeChicken, page);

  await sendEmail([
    {
      foodName: grainFreeSalmon,
      promotionText: grainFreeSalmonPrices.promotionText,
      url: grainFreeSalmonPrices.url,
      foods: grainFreeSalmonPrices.prices
    },
    {
      foodName: grainFreeChicken,
      promotionText: grainFreeChickenPrices.promotionText,
      url: grainFreeChickenPrices.url,
      foods: grainFreeChickenPrices.prices
    }
  ])
  process.exit(0);
})();
