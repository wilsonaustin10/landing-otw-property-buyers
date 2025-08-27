import { google } from 'googleapis';

interface LeadFormData {
  leadId?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone: string;
  address: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  propertyCondition?: string;
  timeframe?: string;
  price?: string;
  comments?: string;
  referralSource?: string;
  isPropertyListed?: boolean;
  placeId?: string;
}

class GoogleSheetsClient {
  private sheets: any;
  private auth: any;
  private initialized: boolean = false;

  constructor() {
    this.initializeAuth();
  }

  private initializeAuth() {
    try {
      const credentials = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
      
      if (!credentials) {
        console.warn('GOOGLE_SERVICE_ACCOUNT_KEY environment variable not set');
        return;
      }

      console.log('Attempting to parse Google Service Account credentials...');
      
      let credentialsJson;
      try {
        credentialsJson = JSON.parse(credentials);
      } catch (e) {
        try {
          credentialsJson = JSON.parse(credentials.replace(/\\n/g, '\n'));
        } catch (e2) {
          console.error('Failed to parse GOOGLE_SERVICE_ACCOUNT_KEY. Make sure it\'s valid JSON.');
          console.error('First 100 chars of key:', credentials.substring(0, 100));
          throw e2;
        }
      }
      
      console.log('Service account email:', credentialsJson.client_email);
      
      this.auth = new google.auth.GoogleAuth({
        credentials: credentialsJson,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });

      this.sheets = google.sheets({ version: 'v4', auth: this.auth });
      this.initialized = true;
      console.log('Google Sheets client initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Google Sheets client:', error);
      this.initialized = false;
    }
  }

  async appendPropertyLead(data: LeadFormData) {
    console.log('appendPropertyLead called with data:', { 
      leadId: data.leadId, 
      firstName: data.firstName, 
      lastName: data.lastName 
    });
    
    if (!this.initialized) {
      console.log('Google Sheets client not initialized, skipping property lead submission');
      return false;
    }

    const spreadsheetId = process.env.GOOGLE_SHEETS_PROPERTY_ID;
    
    if (!spreadsheetId) {
      console.log('GOOGLE_SHEETS_PROPERTY_ID environment variable not set');
      return false;
    }
    
    console.log('Using property sheet ID:', spreadsheetId);

    try {
      const timestamp = new Date().toISOString();
      
      const values = [[
        timestamp,
        data.leadId || '',
        data.firstName || '',
        data.lastName || '',
        data.email || '',
        data.phone,
        data.address,
        data.propertyCondition || '',
        data.timeframe || '',
        data.price || '',
        data.comments || '',
        data.referralSource || 'Website',
        data.streetAddress || '',
        data.city || '',
        data.state || '',
        data.postalCode || '',
        data.isPropertyListed ? 'Yes' : 'No',
        data.placeId || ''
      ]];

      const response = await this.sheets.spreadsheets.values.append({
        spreadsheetId,
        range: 'Sheet1!A:R',
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values,
        },
      });

      console.log('Successfully appended property lead to Google Sheet');
      console.log('Response:', JSON.stringify(response.data, null, 2));
      return true;
    } catch (error: any) {
      console.error('Error appending property lead to Google Sheet:', error.message || error);
      if (error.response) {
        console.error('Error response:', error.response.data);
      }
      return false;
    }
  }

  async updatePropertyLead(leadId: string, data: Partial<LeadFormData>) {
    console.log('updatePropertyLead called for leadId:', leadId);
    
    if (!this.initialized) {
      console.log('Google Sheets client not initialized, skipping update');
      return false;
    }

    const spreadsheetId = process.env.GOOGLE_SHEETS_PROPERTY_ID;
    
    if (!spreadsheetId) {
      console.log('GOOGLE_SHEETS_PROPERTY_ID environment variable not set');
      return false;
    }

    try {
      const getResponse = await this.sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Sheet1!A:R',
      });

      const rows = getResponse.data.values || [];
      const headers = rows[0] || [];
      const leadIdIndex = 1;
      
      let rowIndex = -1;
      for (let i = 1; i < rows.length; i++) {
        if (rows[i][leadIdIndex] === leadId) {
          rowIndex = i;
          break;
        }
      }

      if (rowIndex === -1) {
        console.log('Lead ID not found, creating new row');
        return this.appendPropertyLead({
          ...data as LeadFormData,
          leadId,
        });
      }

      const existingRow = rows[rowIndex];
      const updatedRow = [
        existingRow[0],
        leadId,
        data.firstName || existingRow[2] || '',
        data.lastName || existingRow[3] || '',
        data.email || existingRow[4] || '',
        data.phone || existingRow[5] || '',
        data.address || existingRow[6] || '',
        data.propertyCondition || existingRow[7] || '',
        data.timeframe || existingRow[8] || '',
        data.price || existingRow[9] || '',
        data.comments || existingRow[10] || '',
        data.referralSource || existingRow[11] || 'Website',
        data.streetAddress || existingRow[12] || '',
        data.city || existingRow[13] || '',
        data.state || existingRow[14] || '',
        data.postalCode || existingRow[15] || '',
        data.isPropertyListed !== undefined ? (data.isPropertyListed ? 'Yes' : 'No') : (existingRow[16] || 'No'),
        data.placeId || existingRow[17] || ''
      ];

      const updateResponse = await this.sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `Sheet1!A${rowIndex + 1}:R${rowIndex + 1}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [updatedRow],
        },
      });

      console.log('Successfully updated property lead in Google Sheet');
      return true;
    } catch (error: any) {
      console.error('Error updating property lead in Google Sheet:', error.message || error);
      if (error.response) {
        console.error('Error response:', error.response.data);
      }
      return false;
    }
  }

  async addHeadersIfEmpty(spreadsheetId: string, headers: string[], range: string = 'Sheet1!A1') {
    if (!this.initialized) return false;

    try {
      const result = await this.sheets.spreadsheets.values.get({
        spreadsheetId,
        range: range,
      });

      if (!result.data.values || result.data.values.length === 0) {
        await this.sheets.spreadsheets.values.update({
          spreadsheetId,
          range: range,
          valueInputOption: 'USER_ENTERED',
          requestBody: {
            values: [headers],
          },
        });
        
        const sheetId = 0;
        await this.sheets.spreadsheets.batchUpdate({
          spreadsheetId,
          requestBody: {
            requests: [{
              repeatCell: {
                range: {
                  sheetId,
                  startRowIndex: 0,
                  endRowIndex: 1,
                },
                cell: {
                  userEnteredFormat: {
                    textFormat: {
                      bold: true,
                    },
                  },
                },
                fields: 'userEnteredFormat.textFormat.bold',
              },
            }],
          },
        });
        
        console.log('Added headers to sheet');
      }

      return true;
    } catch (error) {
      console.error('Error adding headers:', error);
      return false;
    }
  }
}

export const googleSheetsClient = new GoogleSheetsClient();

export async function initializeGoogleSheets() {
  const propertySheetId = process.env.GOOGLE_SHEETS_PROPERTY_ID;

  if (propertySheetId) {
    const propertyHeaders = [
      'Timestamp',
      'Lead ID',
      'First Name',
      'Last Name',
      'Email',
      'Phone',
      'Address',
      'Property Condition',
      'Timeframe',
      'Price',
      'Comments',
      'Referral Source',
      'Street Address',
      'City',
      'State',
      'Postal Code',
      'Is Listed',
      'Place ID'
    ];
    
    await googleSheetsClient.addHeadersIfEmpty(propertySheetId, propertyHeaders, 'Sheet1!A1:R1');
  }
}