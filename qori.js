const puppeteer = require("puppeteer");
const {getPrices} = require('./util.js');
const {sendEmail} = require('./email.js');

const hillsURL = 'https://www.superpet.pe/perro/alimentos-y-snacks/alimento-seco?cgid=alimentos-seco-perro&prefn1=brand&prefv1=Canbo';
const hillsFoodName = 'Canbo Cachorro Cordero razas med/gran';

const mpets = 'https://www.superpet.pe/perro/salud-e-higiene/panales-y-control-de-orina?cgid=Salud-e-higiene-pa%c3%b1ales-perro&prefn1=brand&prefv1=Mpets'
const mpetsCarbon = 'Mpets Carbon Training Pads Pañales De Entrenamiento (60X60Cm)'
const mpetsTraining = 'Mpets Puppy Training Pañal de entrenamiento (60X60Cm)'

const pages = [
  {
    url: hillsURL,
    itemsToSearch: [hillsFoodName]
  },
  {
    url: mpets,
    itemsToSearch: [mpetsCarbon, mpetsTraining]
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
    subject: 'Precios - superpet - Qori'
  })
  process.exit(0);
})();
