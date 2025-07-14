export function testEnvVariables() {
    const variables = {
      key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
      exists: !!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
      keyLength: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.length || 0,
      keyStart: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.substring(0, 4) || 'none'
    };
    
    console.log('Environment variables check:', variables);
    
    if (!variables.exists) {
      console.error('API key is missing. Please check:');
      console.error('1. .env.local file exists in project root');
      console.error('2. File contains: NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key');
      console.error('3. No quotes or spaces in the key');
    }
  }