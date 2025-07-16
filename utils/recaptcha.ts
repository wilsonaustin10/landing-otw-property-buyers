interface RecaptchaResponse {
  tokenProperties?: {
    valid: boolean;
    hostname?: string;
    action?: string;
    createTime?: string;
  };
  riskAnalysis?: {
    score: number;
    reasons?: string[];
  };
  event?: {
    token: string;
    siteKey: string;
    expectedAction?: string;
  };
}

export async function verifyRecaptchaToken(token: string, expectedAction?: string): Promise<{ success: boolean; score?: number }> {
  const apiKey = process.env.RECAPTCHA_API_KEY;
  
  if (!apiKey) {
    console.error('RECAPTCHA_API_KEY not configured');
    // In development, we might want to bypass reCAPTCHA
    if (process.env.NODE_ENV === 'development') {
      console.warn('Skipping reCAPTCHA verification in development');
      return { success: true, score: 1.0 };
    }
    return { success: false };
  }

  try {
    const projectId = 'allied-advantage-automation';
    const url = `https://recaptchaenterprise.googleapis.com/v1/projects/${projectId}/assessments?key=${apiKey}`;
    
    const requestBody = {
      event: {
        token,
        expectedAction: expectedAction || 'submit_lead_form',
        siteKey: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '6Levh4UrAAAAAInVfJl98rvZ7YeaC3BraGwUkmST',
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('reCAPTCHA verification failed:', response.status, errorText);
      return { success: false };
    }

    const data: RecaptchaResponse = await response.json();
    
    // Check if token is valid
    const isValid = data.tokenProperties?.valid || false;
    const score = data.riskAnalysis?.score || 0;
    
    // Log the assessment for debugging
    console.log('reCAPTCHA assessment:', {
      valid: isValid,
      score,
      action: data.tokenProperties?.action,
      expectedAction: expectedAction || 'submit_lead_form'
    });
    
    // Consider it successful if token is valid and score is above threshold
    const success = isValid && score >= 0.5;
    
    return { success, score };
  } catch (error) {
    console.error('Error verifying reCAPTCHA:', error);
    return { success: false };
  }
}