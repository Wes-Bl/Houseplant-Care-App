import Database from 'better-sqlite3';
import cors from 'cors';
import express from 'express';


//create Database
const db = new Database('cache.db');
db.exec(`CREATE TABLE IF NOT EXISTS cache (
  id TEXT PRIMARY KEY,
  common_name TEXT,
  scientific_name TEXT,
  family TEXT,
  genus TEXT,
  image_url TEXT,
  author TEXT,
  rank TEXT,
  status TEXT
)`);

//perenual table 
db.exec(`CREATE TABLE IF NOT EXISTS perenual_cache (
    scientific_name TEXT PRIMARY KEY,
    data TEXT
)`);

const search = db.prepare('SELECT * FROM cache WHERE common_name LIKE ? OR scientific_name LIKE ?');
//cache search

const app = express()
app.use(cors());
const key = process.env.FLORACODEX_API_KEY;
console.log('Floracodex key loaded:');
console.log('Key type:', typeof key, 'Key length:', key?.length || 0);
console.log('First few chars:', key?.substring(0,4) || 'undefined');
const plantnetKey = process.env.PLANTNET_API_KEY;
console.log('Pl@ntnet key loaded:');
const perenualKey = process.env.PERENUAL_API_KEY;
console.log('Perenual key loaded:');


app.use(express.json({ limit: '50mb' }));
app.listen(3000, '0.0.0.0', () =>
    console.log('Server running on port 3000')
);


    app.get('/plants/search', async (req, res) => {
    console.log(req.query.q)
        //return from cache
    const cached = search.all(`%${req.query.q}%`, `%${req.query.q}%`);
        //then Floracodex

    const response = await fetch(`https://api.floracodex.com/v1/plants?key=${key}&q=${req.query.q}`);

    
    const apiData = await response.json();
        //merge results, insert new ones into cache
    const merged = [...cached];
    apiData.data.forEach(plant => {
    db.prepare('INSERT OR IGNORE INTO cache (id, common_name, scientific_name, family, genus, image_url, author, rank, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
        .run(plant.id, plant.common_name, plant.scientific_name, plant.family, plant.genus, plant.image_url, plant.author, plant.rank, plant.status);
});
const allPlants = [...cached];
for (const plant of apiData.data) {
if (!allPlants.some(p => p.id === plant.id)) {
    allPlants.push(plant);
}
}
res.json({ data: allPlants });
});

// ID from Pl@ntnet.
    app.post('/plants/identify', async (req, res) => {
    console.log('Identify request received');
    const { images } = req.body;
    const formData = new FormData();
    //pulls images, sends to plantnet.
    for (const base64Image of images) {
    const buffer = Buffer.from(base64Image, 'base64');
    formData.append('images', new Blob([buffer], { type: 'image/jpeg' }), 'plant.jpg');
}

    
    const plantnetResponse = await fetch(`https://my-api.plantnet.org/v2/identify/all?api-key=${plantnetKey}&lang=en`, {
        method: 'POST',
        body: formData
    });
    
    const data = await plantnetResponse.json();
    console.log(data);
    
    const topMatch = data.results[0].species.scientificNameWithoutAuthor;
    console.log('Top match:', topMatch);

    const floraResponse = await fetch(`https://api.floracodex.com/v1/plants?key=${key}&q=${topMatch}`);
    let floraData = await floraResponse.json();

    //if no results, search genus instead. this helps Flora and Plantnet work better togther. They're buddies!

    if (floraData.data.length === 0) {
        const genus = topMatch.split(' ')[0];
        console.log('Trying genus:', genus);
        const genusResponse = await fetch(`https://api.floracodex.com/v1/plants?key=${key}&q=${genus}`);
        floraData = await genusResponse.json();
}
    console.log('Flora data:', floraData);

    res.json({ plantnet: data, flora: floraData });
});

app.get('/plants/details', async (req, res) => {
  const scientificName = req.query.scientific_name;
  console.log('Perenual lookup for:', scientificName);

  if (!scientificName) {
    return res.status(400).json({ error: 'scientific_name is required' });
  }

  // check cache first
  const cached = db.prepare('SELECT data FROM perenual_cache WHERE scientific_name = ?').get(scientificName);
  if (cached) {
    console.log('Returning cached perenual data');
    return res.json(JSON.parse(cached.data));
  }

  try {
    const response = await fetch(`https://perenual.com/api/species-list?key=${perenualKey}&q=${encodeURIComponent(scientificName)}`);
    const data = await response.json();
    console.log('Perenual response:', JSON.stringify(data).slice(0, 300));

    const plant = data.data?.[0];
    if (!plant) {
      return res.status(404).json({ error: 'No perenual data found' });
    }

    // cache it
    db.prepare('INSERT OR REPLACE INTO perenual_cache (scientific_name, data) VALUES (?, ?)')
      .run(scientificName, JSON.stringify(plant));

    res.json(plant);
  } catch (err) {
    console.error('Perenual error:', err);
    res.status(500).json({ error: 'Perenual lookup failed' });
  }
});