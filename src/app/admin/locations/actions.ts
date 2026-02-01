'use server';

import { getCollection, Collections, LocationDocument } from "@/lib/db/mongodb";
import { revalidatePath } from "next/cache";
import { ObjectId } from "mongodb";

export type CountryData = {
  name: string;
  code: string;
};

export type CityData = {
  name: string;
  slug: string;
};

// --- COUNTRY ACTIONS ---

export async function addCountry(data: CountryData) {
  try {
    const collection = await getCollection<LocationDocument>(Collections.LOCATIONS);
    
    // Check for duplicate code
    const existing = await collection.findOne({ code: data.code.toUpperCase() });
    if (existing) {
      return { success: false, message: 'Country with this code already exists.' };
    }

    await collection.insertOne({
      name: data.name,
      code: data.code.toUpperCase(),
      cities: [],
      created_at: new Date(),
      updated_at: new Date(),
    } as any);

    revalidatePath('/admin/locations');
    return { success: true, message: 'Country added successfully' };
  } catch (error) {
    console.error('Add Country Error:', error);
    return { success: false, message: 'Failed to add country' };
  }
}

export async function updateCountry(id: string, data: CountryData) {
  try {
    const collection = await getCollection<LocationDocument>(Collections.LOCATIONS);
    
    await collection.updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          name: data.name, 
          code: data.code.toUpperCase(),
          updated_at: new Date()
        } 
      }
    );

    revalidatePath('/admin/locations');
    return { success: true, message: 'Country updated successfully' };
  } catch (error) {
    console.error('Update Country Error:', error);
    return { success: false, message: 'Failed to update country' };
  }
}

export async function deleteCountry(id: string) {
  try {
    const collection = await getCollection<LocationDocument>(Collections.LOCATIONS);
    await collection.deleteOne({ _id: new ObjectId(id) });

    revalidatePath('/admin/locations');
    return { success: true, message: 'Country deleted successfully' };
  } catch (error) {
    console.error('Delete Country Error:', error);
    return { success: false, message: 'Failed to delete country' };
  }
}

// --- CITY ACTIONS ---

export async function addCity(countryId: string, cityName: string) {
  try {
    const collection = await getCollection<LocationDocument>(Collections.LOCATIONS);
    const slug = cityName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    // Check for duplicate slug within the country
    // Using simple array filter logic since we can't easily unique index subdocuments in this schema setup without strict enforcement
    const country = await collection.findOne({ _id: new ObjectId(countryId) });
    if (country?.cities?.some(c => c.slug === slug)) {
        return { success: false, message: 'City already exists in this country.' };
    }

    await collection.updateOne(
      { _id: new ObjectId(countryId) },
      { 
        $push: { 
          cities: { 
            name: cityName, 
            slug 
          } 
        } as any,
        $set: { updated_at: new Date() }
      }
    );

    revalidatePath('/admin/locations');
    return { success: true, message: 'City added successfully' };
  } catch (error) {
    console.error('Add City Error:', error);
    return { success: false, message: 'Failed to add city' };
  }
}

export async function deleteCity(countryId: string, slug: string) {
  try {
    const collection = await getCollection<LocationDocument>(Collections.LOCATIONS);
    
    await collection.updateOne(
      { _id: new ObjectId(countryId) },
      { 
        $pull: { 
          cities: { slug } 
        } as any, // Type cast needed for $pull with subdocument field
        $set: { updated_at: new Date() }
      }
    );

    revalidatePath('/admin/locations');
    return { success: true, message: 'City deleted successfully' };
  } catch (error) {
    console.error('Delete City Error:', error);
    return { success: false, message: 'Failed to delete city' };
  }
}
