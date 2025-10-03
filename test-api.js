// API 엔드포인트 테스트 스크립트
const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3000';

async function testContentsAPI() {
  console.log('🧪 Testing /api/contents endpoint...\n');

  try {
    // Test 1: Basic GET request
    console.log('Test 1: GET /api/contents');
    const response1 = await fetch(`${API_BASE}/api/contents?page=1&limit=10`);
    console.log('Status:', response1.status);
    console.log('Status Text:', response1.statusText);

    if (response1.ok) {
      const data1 = await response1.json();
      console.log('✅ Success! Received data:', {
        success: data1.success,
        totalItems: data1.data?.contents?.length || 0,
        hasMore: data1.data?.hasMore
      });
    } else {
      const errorText = await response1.text();
      console.log('❌ Error:', errorText);
    }
    console.log('\n');

    // Test 2: With search parameter
    console.log('Test 2: GET /api/contents?search=test');
    const response2 = await fetch(`${API_BASE}/api/contents?search=test&limit=5`);
    console.log('Status:', response2.status);

    if (response2.ok) {
      const data2 = await response2.json();
      console.log('✅ Search results:', data2.data?.contents?.length || 0, 'items');
    } else {
      console.log('❌ Search failed');
    }
    console.log('\n');

    // Test 3: Popular contents
    console.log('Test 3: GET /api/contents?popular=true');
    const response3 = await fetch(`${API_BASE}/api/contents?popular=true&limit=10`);
    console.log('Status:', response3.status);

    if (response3.ok) {
      const data3 = await response3.json();
      console.log('✅ Popular contents:', data3.data?.contents?.length || 0, 'items');
    } else {
      console.log('❌ Popular contents failed');
    }
    console.log('\n');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run tests
console.log('📝 Make sure the dev server is running (npm run dev)\n');
testContentsAPI();
