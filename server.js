const puppeteer = require("puppeteer");


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
    console.log('\nNew URL:', page.url());
    return await page.$$eval('.custom-radio-group', nodes => nodes.map(n => {
      const liElements = Array.from(n.querySelectorAll('li'));
      const labelElement = n.querySelector('label');
      const labelText = labelElement ? labelElement.innerText : null;
      const liTexts = liElements.map(li => {
        if (li.classList.contains('strike-through')) {
          return 'Original: ' + li.innerText;
        } else if (li.classList.contains('sales')) {
          return 'Precio: ' + li.innerText;
        } else {
          return li.innerText;
        }
      });
      return {labelText, liTexts: liTexts.join("\n")};
    }));
  }

  // Nala
  await page.goto('https://www.superpet.pe/gato/alimentos-y-snacks/alimento-seco?cgid=alimentos-seco-gato&prefn1=brand&prefv1=True%20Origins%20Pure');
  await page.setViewport({width: 1080, height: 1024});
  const searchResultSelector = '.product .text-base';
  await page.waitForSelector(searchResultSelector);

  const grainFreeSalmon = 'True Origins Pure Cat Adult Sterilized Salmon Grain free';
  const grainFreeSalmonPrices = await getPrices(grainFreeSalmon);
  console.log(grainFreeSalmon);
  grainFreeSalmonPrices.forEach((element, index) => {
    console.log('Label:', element.labelText);
    console.log(element.liTexts);
    console.log('');
  });
  console.log('');
  await page.goBack();
  console.log('**************************************************\n');
  await page.waitForSelector(searchResultSelector);
  const grainFreeChicken = 'True Origins Pure Cat Adult Stererilized Chicken Grain free';
  const grainFreeChickenPrices = await getPrices(grainFreeChicken);
  console.log(grainFreeChicken);
  grainFreeChickenPrices.forEach((element, index) => {
    console.log('Label:', element.labelText);
    console.log(element.liTexts);
    console.log('');
  });

  // Qori
  await page.goto('https://www.superpet.pe/perro/alimentos-y-snacks/alimento-seco?cgid=alimentos-seco-perro&prefn1=ML_Raza&prefv1=Razas%20peque%c3%b1as&prefn2=brand&prefv2=Hills');
  const hills = 'Hills Sd Puppy Small Bites Cachorros Y Razas Pequeñas Alimento Seco Perro'
  const hillsPrices = await getPrices(hills);
  console.log(hills);
  hillsPrices.forEach((element, index) => {
    console.log('Label:', element.labelText);
    console.log(element.liTexts);
    console.log('');
  });

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