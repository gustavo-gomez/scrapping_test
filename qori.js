const puppeteer = require("puppeteer");
const {getPrices} = require('./util.js');
const {sendEmail} = require('./email.js');

const hillsURL = 'https://www.superpet.pe/perro/alimentos-y-snacks/alimento-seco?cgid=alimentos-seco-perro&prefn1=ML_Edad&prefv1=Cachorro&prefn2=brand&prefv2=Hills';
const hillsFoodName = 'Hills Sd Puppy Small Bites Cachorros Y Razas Pequeñas Alimento Seco Perro';
const hillsRazaMediana = 'Hills Sd Puppy H. Development Cachorros Razas Medianas Alimento Seco Perro';

const foodsToSearch = [hillsFoodName, hillsRazaMediana];

(async () => {
  let browser;
  if (process.env.ENV === 'production')
    browser = await puppeteer.launch({headless: true, args: ['--no-sandbox']});
  else
    browser = await puppeteer.launch();

  const page = await browser.newPage();
  await page.goto(hillsURL);
  await page.setViewport({width: 1080, height: 1024});
  const searchResultSelector = '.product .text-base';

  await page.waitForSelector(searchResultSelector);
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
    subject: 'Precios - superpet - Qori'
  })
  process.exit(0);
})();
