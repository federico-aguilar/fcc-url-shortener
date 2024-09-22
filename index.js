require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const parser = require('body-parser');
const dns = require('dns');
const mongoose = require('mongoose');
const mongodbUri = "mongodb+srv:blahblahblah"
const clientOptions = { useNewUrlParser: true, useUnifiedTopology: true };
mongoose.connect(mongodbUri, clientOptions);

const shortUrlSchema = new mongoose.Schema(
  { original_url: String, short_url: String }
)

const ShortUrl = mongoose.model(
  'ShortUrl', shortUrlSchema
)

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.use(parser.json());
app.use(parser.urlencoded({ extended: true }));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

//post endpoint
app.post('/api/shorturl', function (req, res) {
  const original_url = req.body.url;
  dns.lookup(original_url, (err, addresses, family) => {
    if (err) {
      res.json( {error: 'invalid url' });
    } else {
      ShortUrl.findOne({ original_url })
      .then((docs) => {
          const desiredKeys = ["original_url", "short_url"];
          if (!docs) {
            const short_url = CreateShortUrl();
            ShortUrl.create({ original_url, short_url })
            .then(doc => {
              res.json({ original_url: doc.original_url, short_url: doc.short_url });
            })
          } else {
            res.json({ original_url: docs.original_url, short_url: docs.short_url });
          }
      })
      .catch((err) => {
        res.json(`Error with ShortUrl.findOne({ original_url : ${original_url}})`)
      })
    }
  })
});

function CreateShortUrl() {
  const base62 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let shortUrl = '';

  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * base62.length);
    shortUrl += base62.substring(randomIndex, randomIndex + 1);
  }

  return shortUrl;
}

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
