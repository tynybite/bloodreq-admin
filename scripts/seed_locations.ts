import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || "bloodreq";

if (!MONGODB_URI) {
  console.error("Please add MONGODB_URI to your .env file");
  process.exit(1);
}

const countriesData = [
  {
    name: "Bangladesh",
    code: "BD",
    cities: [
      "Dhaka", "Chittagong", "Khulna", "Rajshahi", "Sylhet", "Barisal", "Rangpur", "Mymensingh",
      "Comilla", "Narayanganj", "Gazipur", "Bogra", "Kushtia", "Jessore", "Cox's Bazar", "Tangail",
      "Faridpur", "Dinajpur", "Pabna", "Noakhali"
    ]
  },
  {
    name: "India",
    code: "IN",
    cities: [
      "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Ahmedabad", "Chennai", "Kolkata", "Surat", "Pune", "Jaipur",
      "Lucknow", "Kanpur", "Nagpur", "Indore", "Thane", "Bhopal", "Visakhapatnam", "Pimpri-Chinchwad", "Patna", "Vadodara"
    ]
  },
  {
    name: "Pakistan",
    code: "PK",
    cities: [
      "Karachi", "Lahore", "Faisalabad", "Rawalpindi", "Gujranwala", "Peshawar", "Multan", "Hyderabad", "Islamabad", "Quetta",
      "Bahawalpur", "Sargodha", "Sialkot", "Sukkur", "Larkana", "Sheikhupura", "Rahim Yar Khan", "Jhang", "Dera Ghazi Khan", "Gujrat"
    ]
  },
  {
    name: "United States",
    code: "US",
    cities: [
      "New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio", "San Diego", "Dallas", "San Jose",
      "Austin", "Jacksonville", "Fort Worth", "Columbus", "San Francisco", "Charlotte", "Indianapolis", "Seattle", "Denver", "Washington"
    ]
  },
  {
    name: "China",
    code: "CN",
    cities: [
      "Shanghai", "Beijing", "Guangzhou", "Shenzhen", "Tianjin", "Wuhan", "Dongguan", "Chongqing", "Chengdu", "Nanjing",
      "Nanyang", "Xi'an", "Shenyang", "Hangzhou", "Harbin", "Tai'an", "Suzhou", "Shantou", "Jinan", "Zhengzhou"
    ]
  },
  {
    name: "Indonesia",
    code: "ID",
    cities: [
      "Jakarta", "Surabaya", "Bandung", "Medan", "Semarang", "Palembang", "Makassar", "Batam", "Pekanbaru", "Bandar Lampung",
      "Padang", "Denpasar", "Samarinda", "Tasikmalaya", "Pontianak", "Banjarmasin", "Balikpapan", "Jambi", "Surakarta", "Cimahi"
    ]
  },
  {
    name: "Brazil",
    code: "BR",
    cities: [
      "São Paulo", "Rio de Janeiro", "Brasília", "Salvador", "Fortaleza", "Belo Horizonte", "Manaus", "Curitiba", "Recife", "Goiânia",
      "Belém", "Porto Alegre", "Guarulhos", "Campinas", "São Luís", "São Gonçalo", "Maceió", "Duque de Caxias", "Natal", "Teresina"
    ]
  },
  {
    name: "Nigeria",
    code: "NG",
    cities: [
      "Lagos", "Kano", "Ibadan", "Kaduna", "Port Harcourt", "Benin City", "Maiduguri", "Zaria", "Aba", "Jos",
      "Ilorin", "Oyo", "Enugu", "Abeokuta", "Abuja", "Sokoto", "Onitsha", "Warri", "Ebute Ikorodu", "Okene"
    ]
  },
    {
    name: "Russia",
    code: "RU",
    cities: [
      "Moscow", "Saint Petersburg", "Novosibirsk", "Yekaterinburg", "Nizhny Novgorod", "Kazan", "Chelyabinsk", "Omsk", "Samara", "Rostov-on-Don",
      "Ufa", "Krasnoyarsk", "Perm", "Voronezh", "Volgograd", "Krasnodar", "Saratov", "Tyumen", "Tolyatti", "Izhevsk"
    ]
  },
  {
    name: "Mexico",
    code: "MX",
    cities: [
      "Mexico City", "Ecatepec", "Guadalajara", "Puebla", "Juárez", "Tijuana", "León", "Zapopan", "Monterrey", "Nezahualcóyotl",
      "Chihuahua", "Naucalpan", "Mérida", "San Luis Potosí", "Aguascalientes", "Hermosillo", "Saltillo", "Mexicali", "Culiacán", "Guadalupe"
    ]
  },
  {
    name: "Japan",
    code: "JP",
    cities: [
      "Tokyo", "Yokohama", "Osaka", "Nagoya", "Sapporo", "Kobe", "Kyoto", "Fukuoka", "Kawasaki", "Saitama",
      "Hiroshima", "Sendai", "Kitakyushu", "Chiba", "Sakai", "Niigata", "Hamamatsu", "Shizuoka", "Sagamihara", "Okayama"
    ]
  },
  {
    name: "Ethiopia",
    code: "ET",
    cities: [
      "Addis Ababa", "Dire Dawa", "Mek'ele", "Gondar", "Bahir Dar", "Hawassa", "Jimma", "Jijiga", "Shashamane", "Bishoftu",
      "Sodo", "Arba Minch", "Hosaena", "Harar", "Dilla", "Nekemte", "Debre Birhan", "Asella", "Debre Mark'os", "Kombolcha"
    ]
  },
  {
    name: "Philippines",
    code: "PH",
    cities: [
      "Quezon City", "Manila", "Davao City", "Caloocan", "Cebu City", "Zamboanga City", "Taguig", "Antipolo", "Pasig", "Cagayan de Oro",
      "Parañaque", "Dasmariñas", "Valenzuela", "Bacoor", "General Santos", "Las Piñas", "Makati", "San Jose del Monte", "Bacolod", "Muntinlupa"
    ]
  },
   {
    name: "Egypt",
    code: "EG",
    cities: [
      "Cairo", "Alexandria", "Giza", "Shubra El-Kheima", "Port Said", "Suez", "Luxor", "Mansoura", "El-Mahalla El-Kubra", "Tanta",
      "Asyut", "Ismailia", "Fayyum", "Zagazig", "Aswan", "Damietta", "Damanhur", "Minya", "Beni Suef", "Hurghada"
    ]
  },
  {
    name: "Vietnam",
    code: "VN",
    cities: [
      "Ho Chi Minh City", "Hanoi", "Da Nang", "Haiphong", "Bien Hoa", "Can Tho", "Nha Trang", "Buon Ma Thuot", "Hue", "Vinh",
      "Vung Tau", "Qui Nhon", "Long Xuyen", "Thai Nguyen", "Ha Long", "Bac Giang", "Thai Binh", "Bac Ninh", "My Tho", "Soc Trang"
    ]
  },
  {
    name: "DR Congo",
    code: "CD",
    cities: [
      "Kinshasa", "Lubumbashi", "Mbuji-Mayi", "Kananga", "Kisangani", "Bukavu", "Tshikapa", "Kolwezi", "Likasi", "Goma",
      "Kikwit", "Uvira", "Bunia", "Mbandaka", "Matadi", "Kabinda", "Butembo", "Mwene-Ditu", "Isiro", "Kindu"
    ]
  },
  {
    name: "Turkey",
    code: "TR",
    cities: [
      "Istanbul", "Ankara", "Izmir", "Bursa", "Adana", "Gaziantep", "Konya", "Antalya", "Kayseri", "Mersin",
      "Eskisehir", "Diyarbakir", "Samsun", "Denizli", "Sanliurfa", "Adapazari", "Malatya", "Kahramanmaras", "Erzurum", "Van"
    ]
  },
  {
    name: "Iran",
    code: "IR",
    cities: [
      "Tehran", "Mashhad", "Isfahan", "Karaj", "Shiraz", "Tabriz", "Qom", "Ahvaz", "Kermanshah", "Urmia",
      "Rasht", "Zahedan", "Hamadan", "Kerman", "Yazd", "Ardabil", "Bandar Abbas", "Arak", "Islamshahr", "Zanjan"
    ]
  },
  {
    name: "Germany",
    code: "DE",
    cities: [
      "Berlin", "Hamburg", "Munich", "Cologne", "Frankfurt", "Stuttgart", "Düsseldorf", "Dortmund", "Essen", "Leipzig",
      "Bremen", "Dresden", "Hanover", "Nuremberg", "Duisburg", "Bochum", "Wuppertal", "Bielefeld", "Bonn", "Münster"
    ]
  },
  {
    name: "Thailand",
    code: "TH",
    cities: [
      "Bangkok", "Nonthaburi", "Nakhon Ratchasima", "Chiang Mai", "Hat Yai", "Udon Thani", "Pak Kret", "Khon Kaen", "Chaophraya Surasak", "Ubon Ratchathani",
      "Nakhon Si Thammarat", "Nakhon Sawan", "Nakhon Pathom", "Phitsanulok", "Pattaya", "Songkhla", "Surat Thani", "Rangsit", "Yala", "Phuket"
    ]
  }
];

async function seedLocations() {
  console.log("📍 Starting location seeding...");
  const client = new MongoClient(MONGODB_URI!);

  try {
    await client.connect();
    const db = client.db(MONGODB_DB_NAME);
    const locationsCollection = db.collection("locations");

    // 1. Clear existing locations
    console.log("🗑️  Clearing existing locations...");
    await locationsCollection.deleteMany({});

    // 2. Prepare documents
    const documents = countriesData.map(country => ({
      name: country.name,
      code: country.code,
      cities: country.cities.map(city => ({
        name: city,
        slug: city.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
      })),
      created_at: new Date(),
      updated_at: new Date()
    }));

    // 3. Insert new locations
    console.log(`🌍 Seeding ${documents.length} countries...`);
    await locationsCollection.insertMany(documents);

    console.log("✅ Locations seeded successfully!");

  } catch (error) {
    console.error("❌ Error seeding locations:", error);
  } finally {
    await client.close();
  }
}

seedLocations();
