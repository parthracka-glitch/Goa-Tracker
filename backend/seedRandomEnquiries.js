require('dotenv').config();
const mongoose = require('mongoose');
const Enquiry = require('./models/Enquiry');

const NAMES = [
  "Rohan Mehta", "Neha Sharma", "Arjun Kapoor", "Pooja Patel", "Vikram Malhotra",
  "Siddharth Sen", "Aisha Khan", "Aditya Rao", "Ananya Das", "Karan Johar",
  "Sneha Reddy", "Amit Verma", "Divya Nair", "Sanjay Gupta", "Tanvi Joshi"
];

const LOCATIONS = [
  "Mumbai", "Delhi", "Bangalore", "Pune", "Hyderabad", 
  "Ahmedabad", "Chennai", "Kolkata", "Jaipur", "Surat"
];

const CARS = [
  "Thar", "Fortuner", "Creta", "Scorpio Classic", "Ertiga", 
  "Innova Crysta", "Thar RWD", "Swift", "i20"
];

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB for seeding random enquiries...");

  const enquiries = [];
  const startDay = 1;
  const endDay = 28;

  for (let i = 0; i < 15; i++) {
    const month = Math.random() > 0.4 ? "07" : "06";
    const dayVal = Math.floor(Math.random() * (endDay - startDay + 1)) + startDay;
    const dayStr = dayVal.toString().padStart(2, '0');
    const dateKey = `2026-${month}-${dayStr}`;
    
    const hour = Math.floor(Math.random() * 12) + 9; // 9 AM to 9 PM
    const minute = Math.floor(Math.random() * 60);
    const createdAt = new Date(`2026-${month}-${dayStr}T${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00Z`);

    const name = NAMES[Math.floor(Math.random() * NAMES.length)] + " " + String.fromCharCode(65 + i);
    const phone = "9" + Math.floor(100000000 + Math.random() * 900000000);
    const email = name.toLowerCase().replace(/\s+/g, '.') + "@gmail.com";
    const location = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
    const carInterested = CARS[Math.floor(Math.random() * CARS.length)];

    enquiries.push({
      name,
      phone,
      email,
      location,
      carInterested,
      message: "Looking forward to renting this car for my trip.",
      dateKey,
      createdAt,
      updatedAt: createdAt
    });
  }

  await Enquiry.insertMany(enquiries);
  console.log(`Successfully seeded ${enquiries.length} random enquiries across June and July 2026.`);
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
