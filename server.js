const puppeteer = require("puppeteer");
const sgMail = require("@sendgrid/mail");


function delay(time) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time)
  });
}

(async () => {

  // Launch the browser and open a new blank page
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  async function clickOnFood(elementText) {
    await page.evaluate((elementText) => {
      const textBaseElements = Array.from(document.querySelectorAll('.text-base'));
      for (let element of textBaseElements) {
        if (element.innerText === elementText) {
          const productElement = element.closest('.product');
          if (productElement) {
            const linkElement = productElement.querySelector('a.link');
            if (linkElement) {
              linkElement.click();
              return;
            }
          }
        }
      }
    }, elementText);
  }

  async function getPrices(foodName) {
    await clickOnFood(foodName);
    await page.waitForNavigation();
    const url = page.url();
    
    await page.waitForSelector('.custom-radio-group');
    await delay(1500);
    
    const promotionComponent = await page.$('.callout');
    let promotionText = null;
    if (promotionComponent) {
      promotionText = await page.evaluate(element => element.innerText, promotionComponent);
    }

    // iterate over all the row prices
    const prices = await page.$$eval('.custom-radio-group', nodes => nodes.map(n => {
      const weightElement = n.querySelector('label');
      const weightText = weightElement ? weightElement.innerText : null;

      const noStock = Boolean(n.querySelector('input[disabled]'));
      if (noStock) return {weightText, unitPrice: 'No stock'};

      const priceContainer = Array.from(n.querySelectorAll('li'));
      const prices = priceContainer.map(li => {
        if (li.classList.contains('strike-through')) {
          return 'Original: ' + li.innerText;
        } else if (li.classList.contains('sales')) {
          return 'Precio: ' + li.innerText;
        } else {
          return li.innerText;
        }
      });
      return {weightText, unitPrice: prices.join("\n")};
    }));
    return {url, promotionText, prices};
  }

  // Nala
  await page.goto('https://www.superpet.pe/gato/alimentos-y-snacks/alimento-seco?cgid=alimentos-seco-gato&prefn1=brand&prefv1=True%20Origins%20Pure');
  await page.setViewport({width: 1080, height: 1024});
  const searchResultSelector = '.product .text-base';
  await page.waitForSelector(searchResultSelector);

  const grainFreeSalmon = 'True Origins Pure Cat Adult Sterilized Salmon Grain free';
  const grainFreeSalmonPrices = await getPrices(grainFreeSalmon);
  console.log(grainFreeSalmon);
  console.log('Promocion: ', grainFreeSalmonPrices?.promotionText);
  grainFreeSalmonPrices.prices.forEach((element, index) => {
    console.log('Peso: ', element.weightText);
    console.log(element.unitPrice);
    console.log('');
  });
  console.log('');
  await page.goBack();
  console.log('**************************************************\n');
  await page.waitForSelector(searchResultSelector);
  const grainFreeChicken = 'True Origins Pure Cat Adult Stererilized Chicken Grain free';
  const grainFreeChickenPrices = await getPrices(grainFreeChicken);
  console.log(grainFreeChicken);
  console.log('Promocion: ', grainFreeChickenPrices.promotionText);
  grainFreeChickenPrices.prices.forEach((element, index) => {
    console.log('Peso: ', element.weightText);
    console.log(element.unitPrice);
    console.log('');
  });

  // Qori
  await page.goto('https://www.superpet.pe/perro/alimentos-y-snacks/alimento-seco?cgid=alimentos-seco-perro&prefn1=ML_Raza&prefv1=Razas%20peque%c3%b1as&prefn2=brand&prefv2=Hills');
  await page.waitForSelector(searchResultSelector);
  const hills = 'Hills Sd Puppy Small Bites Cachorros Y Razas Pequeñas Alimento Seco Perro'
  const hillsPrices = await getPrices(hills);
  console.log(hills);
  console.log('Promocion: ', hillsPrices.promotionText);
  hillsPrices.prices.forEach((element, index) => {
    console.log('Peso: ', element.weightText);
    console.log(element.unitPrice);
    console.log('');
  });


//   const msg = {
//     to: 'gomezf09@gmail.com', // Change to your recipient
//     from: 'contacto@gustavogomez.dev', // Change to your verified sender
//     subject: 'Sending with SendGrid is Fun',
//     text: 'and easy to do anywhere, even with Node.js',
//     html: '<strong>and easy to do anywhere, even with Node.js</strong>',
//   }
// console.log('before email: ', process.env.SENDGRID_API_KEY);
//
//   sgMail.setApiKey(process.env.SENDGRID_API_KEY)
//   console.log('sent email');
//   await (async () => {
//     try {
//       await sgMail.send(msg);
//     } catch (error) {
//       console.error(error);
//
//       if (error.response) {
//         console.error(error.response.body)
//       }
//     }
//   })();
  process.exit(0);
})();

// const server = http.createServer((req, res) => {
//     res.statusCode = 200;
//     res.setHeader("Content-Type", "text/plain");
//     res.end("Hello World\n");
// });
//
// const PORT = 3000;
// server.listen(PORT, async () => {
//     console.log(`Server running at http://localhost:${PORT}/`);
// });