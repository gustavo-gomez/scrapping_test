const puppeteer = require("puppeteer");
const {getPrices} = require('./util.js');
const {sendEmail} = require('./email.js');

const hillsURL = 'https://www.superpet.pe/perro/alimentos-y-snacks/alimento-seco?cgid=alimentos-seco-perro&prefn1=ML_Raza&prefv1=Razas%20peque%c3%b1as&prefn2=brand&prefv2=Hills';
const hillsFoodName = 'Hills Sd Puppy Small Bites Cachorros Y Razas Pequeñas Alimento Seco Perro';

(async () => {
  let browser;
  if (process.env.NODE_ENV === 'production')
    browser = await puppeteer.launch({headless: true, args: ['--no-sandbox']});
  else
    browser = await puppeteer.launch();

  const page = await browser.newPage();
  await page.goto(hillsURL);
  await page.setViewport({width: 1080, height: 1024});
  const searchResultSelector = '.product .text-base';

  await page.waitForSelector(searchResultSelector);
  const hillsPrices = await getPrices(hillsFoodName, page);

  await sendEmail([
    {
      foodName: hillsFoodName,
      promotionText: hillsPrices.promotionText,
      url: hillsPrices.url,
      foods: hillsPrices.prices
    }
  ])
  process.exit(0);
})();
