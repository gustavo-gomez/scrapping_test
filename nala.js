const puppeteer = require("puppeteer");
const sgMail = require("@sendgrid/mail");
const {getPrices} = require('./util.js');

const trueOriginsPageURL = 'https://www.superpet.pe/gato/alimentos-y-snacks/alimento-seco?cgid=alimentos-seco-gato&prefn1=brand&prefv1=True%20Origins%20Pure'
const grainFreeSalmon = 'True Origins Pure Cat Adult Sterilized Salmon Grain free';
const grainFreeChicken = 'True Origins Pure Cat Adult Stererilized Chicken Grain free';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto(trueOriginsPageURL);
  await page.setViewport({width: 1080, height: 1024});
  const searchResultSelector = '.product .text-base';
  await page.waitForSelector(searchResultSelector);

  const grainFreeSalmonPrices = await getPrices(grainFreeSalmon, page);


  await page.goBack();
  await page.waitForSelector(searchResultSelector);

  const grainFreeChickenPrices = await getPrices(grainFreeChicken, page);

  const msg = {
    to: 'gomezf09@gmail.com',
    from: 'contacto@gustavogomez.dev',
    templateId: 'd-f907a9a7cc3b4360b146a19378505f41',
    dynamicTemplateData: {
      foodPets: [
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
      ]
    },
  }
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
  console.log('sent email');
  await (async () => {
    try {
      await sgMail.send(msg);
    } catch (error) {
      console.error(error);

      if (error.response) {
        console.error(error.response.body)
      }
    }
  })();
  process.exit(0);
})();
