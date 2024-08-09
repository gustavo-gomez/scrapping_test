const puppeteer = require("puppeteer");
const {getPrices} = require('./util.js');
const {sendEmail} = require('./email.js');

const trueOriginsPageURL = 'https://www.superpet.pe/gato/alimentos-y-snacks/alimento-seco?cgid=alimentos-seco-gato&prefn1=brand&prefv1=True%20Origins%20Pure'
const grainFreeSalmon = 'True Origins Pure Cat Adult Sterilized Salmon Grain free';
const grainFreeChicken = 'True Origins Pure Cat Adult Stererilized Chicken Grain free';

const foodsToSearch = [grainFreeSalmon, grainFreeChicken];

(async () => {
  let browser;

  if (process.env.ENV === 'production')
    browser = await puppeteer.launch({headless: true, args: ['--no-sandbox']});
  else
    browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto(trueOriginsPageURL);
  await page.setViewport({width: 1080, height: 1024});
  const searchResultSelector = '.product .text-base';
  await page.waitForSelector(searchResultSelector);

  //start
  let emailInformation = []
  let previousHasData = false;
  for (const foodName of foodsToSearch) {
    if (previousHasData) {
      await page.goBack();
      await page.waitForSelector(searchResultSelector);
    }
    const foodInformation = await getPrices(foodName, page);
    previousHasData = foodInformation?.url;

    previousHasData ? emailInformation.push({
      foodName,
      promotionText: foodInformation.promotionText,
      url: foodInformation.url,
      foods: foodInformation.prices
    }) :  emailInformation.push({
      foodName,
      promotionText: "No se encontraron precios",
    })
  }

  await sendEmail({
    foodPets: emailInformation,
    subject: 'Precios - superpet - Nala'
  })
  process.exit(0);
})();
