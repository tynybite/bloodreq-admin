const { MongoClient } = require('mongodb');
const path = require('path');
const fs = require('fs');

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

const locationsData = [
  { 
    name: 'Bangladesh', 
    code: 'BD', 
    cities: [
      { name: 'Dhaka', slug: 'dhaka' },
      { name: 'Chittagong', slug: 'chittagong' },
      { name: 'Sylhet', slug: 'sylhet' },
      { name: 'Khulna', slug: 'khulna' },
      { name: 'Rajshahi', slug: 'rajshahi' },
      { name: 'Barisal', slug: 'barisal' },
      { name: 'Rangpur', slug: 'rangpur' },
      { name: 'Comilla', slug: 'comilla' },
      { name: 'Narayanganj', slug: 'narayanganj' },
      { name: 'Gazipur', slug: 'gazipur' }
    ]
  },
  { 
    name: 'India', 
    code: 'IN', 
    cities: [
      { name: 'Mumbai', slug: 'mumbai' },
      { name: 'Delhi', slug: 'delhi' },
      { name: 'Bangalore', slug: 'bangalore' },
      { name: 'Hyderabad', slug: 'hyderabad' },
      { name: 'Chennai', slug: 'chennai' },
      { name: 'Kolkata', slug: 'kolkata' }
    ]
  },
  { 
    name: 'Pakistan', 
    code: 'PK', 
    cities: [
      { name: 'Karachi', slug: 'karachi' },
      { name: 'Lahore', slug: 'lahore' },
      { name: 'Islamabad', slug: 'islamabad' }
    ]
  },
  { 
    name: 'United Arab Emirates', 
    code: 'AE', 
    cities: [
      { name: 'Dubai', slug: 'dubai' },
      { name: 'Abu Dhabi', slug: 'abu-dhabi' },
      { name: 'Sharjah', slug: 'sharjah' }
    ]
  },
  { 
    name: 'Saudi Arabia', 
    code: 'SA', 
    cities: [
      { name: 'Riyadh', slug: 'riyadh' },
      { name: 'Jeddah', slug: 'jeddah' },
      { name: 'Mecca', slug: 'mecca' },
      { name: 'Medina', slug: 'medina' }
    ]
  },
  { 
    name: 'Malaysia', 
    code: 'MY', 
    cities: [
      { name: 'Kuala Lumpur', slug: 'kuala-lumpur' },
      { name: 'George Town', slug: 'george-town' }
    ]
  },
  { 
    name: 'Singapore', 
    code: 'SG', 
    cities: [
      { name: 'Singapore', slug: 'singapore' }
    ]
  },
  { 
    name: 'United States', 
    code: 'US', 
    cities: [
      { name: 'New York', slug: 'new-york' },
      { name: 'Los Angeles', slug: 'los-angeles' },
      { name: 'Chicago', slug: 'chicago' },
      { name: 'Houston', slug: 'houston' }
    ]
  },
  { 
    name: 'United Kingdom', 
    code: 'GB', 
    cities: [
      { name: 'London', slug: 'london' },
      { name: 'Manchester', slug: 'manchester' },
      { name: 'Birmingham', slug: 'birmingham' }
    ]
  }
];

async function seed() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected correctly to server');
    
    const db = client.db(dbName);
    const collection = db.collection('locations');

    // Clear existing locations
    await collection.deleteMany({});
    console.log('Cleared existing locations');

    // Insert new locations
    const result = await collection.insertMany(locationsData.map(loc => ({
      ...loc,
      created_at: new Date(),
      updated_at: new Date()
    })));

    console.log(`Successfully inserted ${result.insertedCount} locations`);

  } catch (err) {
    console.error('Error seeding locations:', err);
  } finally {
    await client.close();
  }
}

seed();
