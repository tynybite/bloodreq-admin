import { NextRequest } from 'next/server';
import { successResponse, errorResponse, getAuthUser } from '@/lib/api-utils';

interface RouteParams {
  params: Promise<{ language: string }>;
}

// GET /api/translations/:language - Get translations for a language
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { language } = await params;
  
  // Verify authentication
  const { user, error: authError } = await getAuthUser(request);
  if (authError) return authError;

  try {
    // In production, translations would come from database or i18n files
    const translations: Record<string, Record<string, string>> = {
      en: {
        'app.name': 'BloodReq',
        'auth.login': 'Login',
        'auth.signup': 'Sign Up',
        'auth.logout': 'Logout',
        'blood.request': 'Blood Request',
        'blood.donate': 'Donate Blood',
        'blood.urgency.critical': 'Critical',
        'blood.urgency.urgent': 'Urgent',
        'blood.urgency.planned': 'Planned',
        'fundraiser.create': 'Create Fundraiser',
        'fundraiser.donate': 'Donate Now',
        'profile.edit': 'Edit Profile',
        'notification.title': 'Notifications',
        'common.save': 'Save',
        'common.cancel': 'Cancel',
        'common.submit': 'Submit',
        'common.loading': 'Loading...',
        'error.generic': 'Something went wrong',
      },
      bn: {
        'app.name': 'ব্লাডরেক',
        'auth.login': 'লগইন',
        'auth.signup': 'সাইন আপ',
        'auth.logout': 'লগআউট',
        'blood.request': 'রক্তের অনুরোধ',
        'blood.donate': 'রক্তদান করুন',
        'blood.urgency.critical': 'জরুরি',
        'blood.urgency.urgent': 'তাৎক্ষণিক',
        'blood.urgency.planned': 'পরিকল্পিত',
        'fundraiser.create': 'তহবিল তৈরি করুন',
        'fundraiser.donate': 'অনুদান দিন',
        'profile.edit': 'প্রোফাইল সম্পাদনা',
        'notification.title': 'বিজ্ঞপ্তি',
        'common.save': 'সংরক্ষণ',
        'common.cancel': 'বাতিল',
        'common.submit': 'জমা দিন',
        'common.loading': 'লোড হচ্ছে...',
        'error.generic': 'কিছু সমস্যা হয়েছে',
      },
      hi: {
        'app.name': 'ब्लडरेक',
        'auth.login': 'लॉगिन',
        'auth.signup': 'साइन अप',
        'auth.logout': 'लॉगआउट',
        'blood.request': 'रक्त अनुरोध',
        'blood.donate': 'रक्तदान करें',
        'common.save': 'सहेजें',
        'common.cancel': 'रद्द करें',
        'error.generic': 'कुछ गलत हो गया',
      },
    };

    const lang = translations[language] ? language : 'en';

    return successResponse({
      language: lang,
      translations: translations[lang],
      available_languages: Object.keys(translations),
    });
  } catch (error) {
    console.error('Get translations error:', error);
    return errorResponse('An unexpected error occurred', 'SERVER_ERROR', 500);
  }
}
