function delay(time) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time)
  });
}

async function clickOnFood(elementText, page) {
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

module.exports.getPrices = async function (foodName, page) {
  await clickOnFood(foodName, page);
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
    const priceRow = priceContainer.map(li => {
      if (li.classList.contains('strike-through')) {
        return 'Original: ' + li.innerText;
      } else if (li.classList.contains('sales')) {
        return 'Precio: ' + li.innerText;
      } else {
        return li.innerText;
      }
    });
    return {weightText, unitPrice: priceRow.join("\n")};
  }));
  return {url, promotionText, prices};
}

