import mongoose from 'mongoose';
import Resident from './models/Resident.js';
import Apartment from './models/Apartment.js';

const DB_URI = "mongodb://localhost:27017/building";

async function getResidentsByApartmentName(ID) {
    const apartmentName="A1";
  try {
    await mongoose.connect(DB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

    // const apartment = await Apartment.findOne({ apartment_name: apartmentName });

    // if (!apartment) {
    //   console.log('❌ Apartment not found');
    //   return;
    // }

    const residents = await Resident.find({ apartment: ID })
      .populate('userId', 'name email phone')
      .exec();

    if (residents.length === 0) {
      console.log('❌ No residents found for this apartment');
      return;
    }

    console.log('✅ Residents:', residents);
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Change the apartment name below to test
getResidentsByApartmentName('680bfaa7e62146d7d7de5bc1');
