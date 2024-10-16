const puppeteer = require("puppeteer");
const {getPrices} = require('./util.js');
const {sendEmail} = require('./email.js');

const trueOriginsPageURL = 'https://www.superpet.pe/gato/alimentos-y-snacks/alimento-seco?cgid=alimentos-seco-gato&prefn1=brand&prefv1=True%20Origins%20Pure'
const grainFreeSalmon = 'True Origins Pure Cat Adult Sterilized Salmon Grain free';
const grainFreeChicken = 'True Origins Pure Cat Adult Stererilized Chicken Grain free';

const arenaURL = 'https://www.superpet.pe/gato/salud-e-higiene/arena?cgid=Salud-e-higiene-arena-gato&prefn1=brand&prefv1=Origens'
const arena1 = 'Arena Para Gato Origens Super Premium 100% Natural Con Eucalipto '
const arena2 = 'Arena Para Gato Origens Super Premium 100% Natural Sin Aroma '

const pages = [
  {
    url: trueOriginsPageURL,
    itemsToSearch: [grainFreeSalmon, grainFreeChicken]
  },
  {
    url: arenaURL,
    itemsToSearch: [arena1, arena2]
  }
];

(async () => {
  let browser;
  let emailInformation = []
  if (process.env.ENV === 'production')
    browser = await puppeteer.launch({headless: true, args: ['--no-sandbox']});
  else
    browser = await puppeteer.launch();
  const page = await browser.newPage();

  for (const item of pages) {
    try {
      await page.goto(item.url);
      await page.setViewport({width: 1080, height: 1024});
      const searchResultSelector = '.product .text-base';
      await page.waitForSelector(searchResultSelector);
      let previousHasData = false;
      for (const itemToSearch of item.itemsToSearch) {
        if (previousHasData) {
          await page.goBack();
          await page.waitForSelector(searchResultSelector);
        }
        const foodInformation = await getPrices(itemToSearch, page);
        previousHasData = foodInformation?.url;

        previousHasData ? emailInformation.push({
          foodName: itemToSearch,
          promotionText: foodInformation.promotionText,
          url: foodInformation.url,
          foods: foodInformation.prices
        }) : emailInformation.push({
          foodName: itemToSearch,
          promotionText: "No se encontraron precios",
        })
      }
    } catch (e) {
    }
  }

  emailInformation && await sendEmail({
    foodPets: emailInformation,
    subject: 'Precios - superpet - Nala'
  })
  process.exit(0);
})();
