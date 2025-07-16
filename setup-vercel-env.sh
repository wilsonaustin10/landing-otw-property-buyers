#!/bin/bash

echo "Setting up Vercel environment variables..."

# Add Go High Level variables
echo "NEXT_PUBLIC_GHL_ENDPOINT=https://services.leadconnectorhq.com/contacts/" | vercel env add NEXT_PUBLIC_GHL_ENDPOINT production
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2NhdGlvbl9pZCI6ImVjb1BOZDBsdjBObUNSRExEWkh0IiwidmVyc2lvbiI6MSwiaWF0IjoxNzUyNjc2MTQ0Mjk1LCJzdWIiOiJzeDBxOXVRRXMzYnYyQkhIaHZReSJ9.dNHgv2lRwDWVgIAXD7utWwrVJu2Iw3XHXqJpM4LUlhg" | vercel env add GHL_API_KEY production

# Add Google Maps API key
echo "AIzaSyCF--irB1Ja8RLSDoA49sxB1LtZG0YcCPg" | vercel env add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY production

# Add placeholder for Zapier (optional)
echo "YOUR_ZAPIER_WEBHOOK_URL" | vercel env add ZAPIER_WEBHOOK_URL production

echo "Environment variables added! Now redeploy your project:"
echo "vercel --prod"