const express= require("express");
const { Resend } =require("resend");
require('dotenv').config()

const app = express();
const resend = new Resend(process.env.MAILER_TOKEN);

app.get("/", async (req, res) => {
  const { data, error } = await resend.emails.send({
    from: "Contact Form <gakundohope5@gmail.com>",
    to: ["hirwahope5@gmail.com"],
    subject: "hello world",
    html: "<strong>it works!</strong>",
  });

  if (error) {
    return res.status(400).json(error);
  }

  res.status(200).json({ data });
});

app.listen(3000, () => {
  console.log("Listening on http://localhost:3000");
});
