const fetch = require("node-fetch");
const Wallet = require("../models/wallet");

async function createWallet(req, res) {
  console.log(req.user)

  let data = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  };

  let url = `https://api.blockcypher.com/v1/btc/test3/addrs?token=${process.env.token}`;

  let fetchResponse = await fetch(url, data);
  let addressKeys = await fetchResponse.json();

  console.log(fetchResponse.ok);
  if (!fetchResponse.ok) {
    return res.status(200).json(addressKeys);
  }

  let data2 = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: req.body.walletName,
      addresses: [addressKeys.address],
    }),
  };

  let url2 = `https://api.blockcypher.com/v1/btc/test3/wallets?token=${process.env.token}`;

  let fetchResponse2 = await fetch(url2, data2);


  let walletCreated = await fetchResponse2.json();

  if (!fetchResponse2.ok) {
    console.log(fetchResponse2.ok, fetchResponse2);
    return res.status(400).json(walletCreated);
  }

  let newWallet = new Wallet();
  newWallet.private = addressKeys.private;
  newWallet.public = addressKeys.public;
  newWallet.address = addressKeys.address;
  newWallet.wif = addressKeys.wif;
  newWallet.name = walletCreated.name;
  newWallet.userID = req.user._id;
  await newWallet.save();

  console.log(walletCreated);

  res.status(200).json(newWallet);
}

module.exports = {
  createWallet,
};