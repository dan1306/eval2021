const fetch = require("node-fetch");
const Search = require("../models/search");

async function searchAddress(req, res) {
  let addr = req.body.addrs;

  let findAddr = await Search.findOne({ address: addr });

  if (findAddr) {
    let tim1 = new Date(findAddr.updatedAt);

    let tim2 = new Date();

    let minPassed = (Math.abs(tim2 - tim1) / 36e5) * 60;

    if (minPassed > 1) {
      let fetchResponse = await fetch(
        `https://api.blockcypher.com/v1/btc/test3/addrs/${addr}/full?limit=50`
      );
      if (fetchResponse.ok) {
        fetchResponse = await fetchResponse.json();

        findAddr.data = fetchResponse;
        findAddr.updatedAt = new Date();
        findAddr = await findAddr.save();
        console.log(fetchResponse);
        let obj = {
          updated: true,
          minutesPassed: minPassed,
          dataFromAdderss: findAddr,
        };

        res.status(200).json(obj);
      } else {
        fetchResponse = await fetchResponse.json();

        return res.status(400).json(fetchResponse);
      }
    } else {
      let obj = {
        updated: false,
        minutesPassed: minPassed,
        dataFromAdderss: findAddr,
      };

      return res.status(200).json(obj);
    }
  } else {
    let fetchResponse = await fetch(
      `https://api.blockcypher.com/v1/btc/test3/addrs/${addr}/full?limit=50`
    );
    if (fetchResponse.ok) {
      fetchResponse = await fetchResponse.json();

      let searchField = new Search();
      searchField.address = addr;
      searchField.data = fetchResponse;
      searchField.save();
      return res.status(200).json(searchField);
    } else {
      fetchResponse = await fetchResponse.json();

      return res.status(400).json(fetchResponse);
    }
  }
}

module.exports = {
  searchAddress,
};