const sgMail = require("@sendgrid/mail");

module.exports.sendEmail = async function (foodPets) {
  const msg = {
    to: process.env.EMAIL_TO,
    from: process.env.EMAIL_FROM,
    templateId: process.env.EMAIL_TEMPLATE_ID,
    dynamicTemplateData: {foodPets},
  }
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)

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
