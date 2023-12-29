const { MongoClient } = require("mongodb");
const express = require("express");
require("dotenv").config();

async function startServer(app, port) {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);

  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );

    const db = client.db("BlackCoffer");
    const collection = db.collection("SampleData");

    app.post("/api/data", express.json(), async (req, res) => {
      try {
        // Extract filter parameters from the request
        const {
          endYear,
          topics,
          sector,
          region,
          pest,
          source,
          swot,
          country,
          city,
        } = req.body;

        // Build your filter object based on the provided parameters
        const filter = {};

        if (endYear) filter.endYear = endYear;
        if (topics) filter.topics = topics;
        if (sector) filter.sector = sector;
        if (region) filter.region = region;
        if (pest) filter.pest = pest;
        if (source) filter.source = source;
        if (swot) filter.swot = swot;
        if (country) filter.country = country;
        if (city) filter.city = city;

        // Query the database based on the constructed filter
        console.log(filter);
        const documents = await collection.find(filter).toArray();
        res.json(documents);
      } catch (error) {
        console.error("Error retrieving events:", error);
        res.status(500).send("Internal Server Error");
      }
    });

    // Endpoint to get all distinct values for filters
    app.get("/api/filters", express.json(), async (req, res) => {
      try {
        const distinctFilters = await Promise.all([
          collection.distinct("end_year"),
          collection.distinct("topic"),
          collection.distinct("sector"),
          collection.distinct("region"),
          collection.distinct("pestle"),
          collection.distinct("source"),
        //   collection.distinct("swot"),
          collection.distinct("country"),
        //   collection.distinct("city"),
        ]);

        const [
          distinctEndYears,
          distinctTopics,
          distinctSectors,
          distinctRegions,
          distinctPESTs,
          distinctSources,
          distinctSWOTs,
          distinctCountries,
          distinctCities,
        ] = distinctFilters;

        res.json({
          distinctEndYears,
          distinctTopics,
          distinctSectors,
          distinctRegions,
          distinctPESTs,
          distinctSources,
          distinctSWOTs,
          distinctCountries,
          distinctCities,
        });
      } catch (error) {
        console.error("Error retrieving distinct filters:", error);
        res.status(500).send("Internal Server Error");
      }
    });

    // Define routes
    app.get("/api/documents", async (req, res) => {
      const documents = await collection.find().toArray();
      res.json(documents);
    });

    app.get("/api/distinct-states", async (req, res) => {
      const distinctStates = await collection.distinct("State Name");
      res.json(distinctStates);
    });

    app.post("/api/distinct-district", express.json(), async (req, res) => {
      const state = req.body.state;

      try {
        const distinctData = await collection.distinct("District", {
          "State Name": state,
        });
        res.json(distinctData);
      } catch (error) {
        console.error("Error retrieving distinct data:", error);
        res.status(500).send("Internal Server Error");
      }
    });

    app.post("/api/fpos", express.json(), async (req, res) => {
      const state = req.body.state;
      const district = req.body.district;

      try {
        const fposData = await collection
          .find({ "State Name": state, District: district })
          .toArray();
        res.json(fposData);
      } catch (error) {
        console.error("Error retrieving FPOs data:", error);
        res.status(500).send("Internal Server Error");
      }
    });

    // Start the server
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  } finally {
    process.on("SIGINT", async () => {
      await client.close();
      console.log("MongoDB connection closed");
      process.exit();
    });
  }
}

module.exports = { startServer };
