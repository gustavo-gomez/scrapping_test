const sgMail = require("@sendgrid/mail");

module.exports.sendEmail = async function (foodPets) {
  const msg = {
    to: 'gomezf09@gmail.com',
    from: 'contacto@gustavogomez.dev',
    templateId: 'd-f907a9a7cc3b4360b146a19378505f41',
    dynamicTemplateData: {foodPets},
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
}
