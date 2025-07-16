/**
 * Test creating contacts without phone to see if that allows unique contacts
 */

require('dotenv').config();

const API_KEY = process.env.GHL_API_KEY;
const ENDPOINT = 'https://rest.gohighlevel.com/v1/contacts/';

console.log('🧪 Testing Contact Creation Without Phone\n');

async function testContactCreation() {
  const tests = [
    {
      name: 'Contact with unique email only',
      data: {
        firstName: 'Test',
        lastName: 'EmailOnly',
        email: `test-${Date.now()}@example.com`,
        source: 'Test - Email Only'
      }
    },
    {
      name: 'Contact with address but no phone',
      data: {
        firstName: '999 Test Avenue',
        lastName: `Lead ${new Date().toLocaleString()}`,
        email: `lead-${Date.now()}@partial.placeholder`,
        address1: '999 Test Avenue',
        city: 'Austin',
        state: 'TX',
        postalCode: '78701',
        source: 'Test - No Phone',
        customField: {
          propertyAddress: '999 Test Avenue, Austin, TX 78701',
          submissionType: 'partial'
        }
      }
    },
    {
      name: 'Contact with phone in custom field only',
      data: {
        firstName: '888 Phone Custom',
        lastName: `Lead ${new Date().toLocaleString()}`,
        email: `lead-${Date.now()}-2@partial.placeholder`,
        customField: {
          phone: '(555) 000-0003',
          propertyAddress: '888 Phone Custom, Austin, TX',
          submissionType: 'partial'
        },
        source: 'Test - Phone in Custom Field'
      }
    }
  ];
  
  for (const test of tests) {
    console.log(`\n📋 Testing: ${test.name}`);
    console.log('Data:', JSON.stringify(test.data, null, 2));
    
    try {
      const response = await fetch(ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
        },
        body: JSON.stringify(test.data)
      });
      
      const responseData = await response.json();
      
      if (response.ok) {
        console.log('✅ Contact created successfully');
        console.log(`   ID: ${responseData.contact.id}`);
        console.log(`   Name: ${responseData.contact.firstName} ${responseData.contact.lastName}`);
        console.log(`   Email: ${responseData.contact.email}`);
        console.log(`   Phone: ${responseData.contact.phone || 'No phone'}`);
      } else {
        console.log('❌ Failed:', responseData);
      }
    } catch (error) {
      console.log('❌ Error:', error.message);
    }
    
    await new Promise(resolve => setTimeout(resolve, 1500));
  }
  
  console.log('\n\n📝 Summary:');
  console.log('If contacts without phone numbers create unique records,');
  console.log('we could store the phone in a custom field and create');
  console.log('a workflow in GoHighLevel to move it to the main phone field.');
}

testContactCreation();