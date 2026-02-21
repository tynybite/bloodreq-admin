const { MongoClient } = require('mongodb');
const path = require('path');
const fs = require('fs');
const { Country, City } = require('country-state-city');

// Load environment variables from .env file
function loadEnv() {
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      content.split('\n').forEach((line: string) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return;
        
        const firstEq = trimmed.indexOf('=');
        if (firstEq !== -1) {
          const key = trimmed.substring(0, firstEq).trim();
          let val = trimmed.substring(firstEq + 1).trim();
          
          if ((val.startsWith('"') && val.endsWith('"')) || 
              (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
          }
          
          process.env[key] = val;
        }
      });
    }
  } catch (err) {
    console.error('Error loading .env file:', err);
  }
}

loadEnv();

const uri = process.env.MONGODB_URI;
const dbName = 'bloodreq';

if (!uri) {
  console.error('MONGODB_URI is not defined in .env file');
  process.exit(1);
}

const requestedCountries = [
  'United States', 'Canada', 'Mexico', 'United Kingdom', 'Germany',
  'France', 'Italy', 'Spain', 'Netherlands', 'Sweden',
  'Norway', 'Denmark', 'Switzerland', 'Belgium', 'Austria',
  'Finland', 'Ireland', 'Poland', 'Bangladesh', 'India',
  'Pakistan', 'Sri Lanka', 'Nepal', 'Saudi Arabia', 'United Arab Emirates',
  'Qatar', 'Oman', 'Kuwait', 'Bahrain', 'Jordan',
  'Turkey', 'Malaysia', 'Singapore', 'Indonesia', 'Thailand',
  'Philippines', 'Vietnam', 'Japan', 'South Korea', 'South Africa',
  'Nigeria', 'Kenya', 'Ghana', 'Egypt', 'Australia',
  'New Zealand', 'Brazil', 'Argentina', 'Chile', 'Colombia'
];

function generateSlug(text: string) {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

async function seed() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected correctly to server');
    
    const db = client.db(dbName);
    const collection = db.collection('locations');

    const allGlobalCountries = Country.getAllCountries();
    const locationsData = [];

    for (const countryName of requestedCountries) {
      const countryData = allGlobalCountries.find((c: any) => c.name === countryName);
      
      if (!countryData) {
        console.warn(`WARNING: Could not find country ${countryName} in country-state-city data.`);
        continue;
      }

      const allCities = City.getCitiesOfCountry(countryData.isoCode) || [];
      
      // Filter for unique city names and take up to 30
      const uniqueCitiesMap = new Map();
      for (const city of allCities) {
        // Skip cities containing "County" to avoid duplicates of actual cities
        if (city.name.includes(' County')) continue;
        
        if (!uniqueCitiesMap.has(city.name)) {
          uniqueCitiesMap.set(city.name, {
            name: city.name,
            slug: generateSlug(city.name)
          });
        }
        if (uniqueCitiesMap.size >= 30) {
          break;
        }
      }

      const cities = Array.from(uniqueCitiesMap.values());
      
      if (cities.length === 0) {
        console.warn(`WARNING: Found 0 cities for ${countryName}`);
      }
      
      locationsData.push({
        name: countryName,
        code: countryData.isoCode,
        cities: cities,
        created_at: new Date(),
        updated_at: new Date()
      });
    }

    // Clear existing locations
    await collection.deleteMany({});
    console.log('Cleared existing locations');

    // Insert new locations
    if (locationsData.length > 0) {
      const result = await collection.insertMany(locationsData);
      console.log(`Successfully inserted ${result.insertedCount} locations (each with up to 30 cities)`);
    } else {
      console.log('No locations data generated to insert.');
    }

  } catch (err) {
    console.error('Error seeding locations:', err);
  } finally {
    await client.close();
  }
}

seed();
