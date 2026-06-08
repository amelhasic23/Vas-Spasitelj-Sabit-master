require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname)));

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

app.post('/send', async (req, res) => {
  const { ime, prezime, email, tel, poruka } = req.body;
  if (!ime || !email || !poruka) {
    return res.json({ ok: false, error: 'Nedostaju obavezna polja.' });
  }
  try {
    await transporter.sendMail({
      from: `"${ime} ${prezime}" <${process.env.GMAIL_USER}>`,
      replyTo: email,
      to: process.env.GMAIL_USER,
      subject: `Nova poruka od ${ime} ${prezime}`,
      text: `Ime: ${ime} ${prezime}\nEmail: ${email}\nTelefon: ${tel || '-'}\n\nPoruka:\n${poruka}`,
      html: `<p><strong>Ime:</strong> ${ime} ${prezime}</p>
             <p><strong>Email:</strong> ${email}</p>
             <p><strong>Telefon:</strong> ${tel || '-'}</p>
             <p><strong>Poruka:</strong></p>
             <p>${poruka.replace(/\n/g, '<br>')}</p>`,
    });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.json({ ok: false, error: 'Greška pri slanju. Pokušajte ponovo.' });
  }
});

app.post('/newsletter', async (req, res) => {
  const { email } = req.body;
  if (!email || !email.includes('@')) {
    return res.json({ ok: false, error: 'Unesite ispravnu email adresu.' });
  }
  try {
    await transporter.sendMail({
      from: `"Newsletter" <${process.env.GMAIL_USER}>`,
      to: process.env.NEWSLETTER_TO || process.env.GMAIL_USER,
      subject: 'Nova pretplata na newsletter',
      text: `Nova pretplata:\n\nEmail: ${email}`,
      html: `<p><strong>Nova pretplata na newsletter</strong></p><p>Email: ${email}</p>`,
    });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.json({ ok: false, error: 'Greška pri slanju. Pokušajte ponovo.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
