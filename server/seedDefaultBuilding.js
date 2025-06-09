// seedDefaultBuilding.js
import Building from './models/Building.js';

const seedDefaultBuilding = async () => {
  try {
    const exists = await Building.findOne();
    if (!exists) {
      const defaultBuilding = new Building({
        name: "Default Building",
        numberOfApartments: 10,
        residentsPerApartment: 4,
        maxVisitorsPerResident:20
      });
      await defaultBuilding.save();
      console.log("✅ Default building seeded.");
    }
  } catch (err) {
    console.error("❌ Seeding failed:", err);
  }
};

export default seedDefaultBuilding;
