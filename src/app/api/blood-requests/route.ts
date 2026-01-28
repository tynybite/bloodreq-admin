import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getCollection, Collections, BloodRequestDocument, UserDocument } from '@/lib/db/mongodb';
import { successResponse, errorResponse, getAuthUser, parseBody, bloodGroupSchema } from '@/lib/api-utils';

// Schema for creating a blood request
const createBloodRequestSchema = z.object({
  patient_name: z.string().min(2, 'Patient name is required'),
  patient_age: z.number().int().positive().optional(),
  blood_group: bloodGroupSchema,
  units: z.number().int().positive(),
  hospital: z.string().min(2, 'Hospital name is required'),
  address: z.string().optional(), // Full address of hospital
  city: z.string().min(2, 'City is required'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  urgency: z.enum(['critical', 'urgent', 'planned']),
  contact_number: z.string().min(10, 'Valid contact number is required'),
  alternate_contact: z.string().optional(),
  notes: z.string().optional(),
  required_date: z.string().optional(),
});

// GET /api/blood-requests - List blood requests with filtering
export async function GET(request: NextRequest) {
  const { user, error: authError } = await getAuthUser(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const blood_group = searchParams.get('blood_group');
    const exclude_blood_group = searchParams.get('exclude_blood_group');
    const urgency = searchParams.get('urgency');
    const city = searchParams.get('city');
    const status = searchParams.get('status') || 'active'; // Default to active requests (pending, in_progress, approved)
    
    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const query: any = {};
    if (blood_group) {
      query.blood_group = blood_group;
    } else if (exclude_blood_group) {
      query.blood_group = { $ne: exclude_blood_group };
    }
    
    if (urgency) query.urgency = urgency;
    if (city) query.city = { $regex: new RegExp(city, 'i') };
    
    // Status filter
    if (status === 'active') {
      query.status = { $in: ['pending', 'in_progress', 'approved'] };
    } else if (status !== 'all') {
      query.status = status;
    }

    // Location-based filtering (lat/long radius)
    const lat = searchParams.get('latitude');
    const lng = searchParams.get('longitude');
    const radius = parseFloat(searchParams.get('radius') || '10'); // km

    const requestsCollection = await getCollection<BloodRequestDocument>(Collections.BLOOD_REQUESTS);
    const usersCollection = await getCollection<UserDocument>(Collections.USERS);

    let requests;
    let total = 0;

    // Use MongoDB aggregation
    const pipeline: any[] = [
      { $match: query },
      { $sort: { created_at: -1 } },
      { $skip: skip },
      { $limit: limit }
    ];

    total = await requestsCollection.countDocuments(query);
    const cursor = requestsCollection.aggregate(pipeline);
    const rawRequests = await cursor.toArray();

    // Enrich with requester info
    const requesterIds = [...new Set(rawRequests.map(r => r.requester_id))];
    const requesters = await usersCollection.find({ _id: { $in: requesterIds } }).toArray();
    const requesterMap = new Map(requesters.map(u => [u._id.toString(), u]));

    requests = rawRequests.map(req => {
      const requester = requesterMap.get(req.requester_id.toString());
      
      // Calculate distance if user coords provided
      let distance = null;
      if (lat && lng && req.latitude && req.longitude) {
        distance = calculateDistance(
          parseFloat(lat), 
          parseFloat(lng), 
          req.latitude, 
          req.longitude
        );
      }

      return {
        id: req._id?.toString(),
        request_type: 'blood_request', // Explicit type for mobile
        patient_name: req.patient_name,
        patient_age: req.patient_age,
        blood_group: req.blood_group,
        units: req.units,
        hospital: req.hospital,
        // Send both flattened and nested location data for compatibility
        location: req.city, // Legacy field using city name
        address: req.address, 
        city: req.city,
        latitude: req.latitude,
        longitude: req.longitude,
        urgency: req.urgency,
        contact_number: req.contact_number,
        alternate_contact: req.alternate_contact,
        notes: req.notes || req.admin_notes, // Fallback to admin_notes if user notes empty
        status: req.status,
        required_date: req.required_date,
        created_at: req.created_at,
        updated_at: req.updated_at,
        distance,
        requester: requester ? {
          id: requester._id.toString(),
          full_name: requester.full_name,
          avatar_url: requester.avatar_url,
          rating: 4.8 // Mock rating
        } : null
      };
    });

    return successResponse({
      requests,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit),
      }
    });
  } catch (error) {
    console.error('Get blood requests error:', error);
    return errorResponse('An unexpected error occurred', 'SERVER_ERROR', 500);
  }
}

// POST /api/blood-requests - Create a new blood request
export async function POST(request: NextRequest) {
  const { user, error: authError } = await getAuthUser(request);
  if (authError) return authError;

  const { data, error: parseError } = await parseBody(request, createBloodRequestSchema);
  if (parseError) return parseError;

  try {
    const requestsCollection = await getCollection<BloodRequestDocument>(Collections.BLOOD_REQUESTS);

    const newRequest: BloodRequestDocument = {
      requester_id: user!.id,
      patient_name: data.patient_name,
      patient_age: data.patient_age,
      blood_group: data.blood_group,
      units: data.units,
      hospital: data.hospital,
      address: data.address,
      city: data.city,
      latitude: data.latitude,
      longitude: data.longitude,
      urgency: data.urgency,
      contact_number: data.contact_number,
      alternate_contact: data.alternate_contact,
      notes: data.notes,
      status: 'pending',
      location: {
        type: 'Point',
        coordinates: [data.longitude || 0, data.latitude || 0], // GeoJSON expects [lng, lat]
      },
      required_date: data.required_date ? new Date(data.required_date) : new Date(),
      created_at: new Date(),
      updated_at: new Date(),
    };

    const result = await requestsCollection.insertOne(newRequest);

    return successResponse({
      id: result.insertedId.toString(),
      ...data,
      status: 'pending',
    }, 'Blood request created successfully', 201);
  } catch (error) {
    console.error('Create blood request error:', error);
    return errorResponse('An unexpected error occurred', 'SERVER_ERROR', 500);
  }
}

// Haversine formula for distance
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const d = R * c; // Distance in km
  return Number(d.toFixed(1));
}

function deg2rad(deg: number): number {
  return deg * (Math.PI/180);
}
