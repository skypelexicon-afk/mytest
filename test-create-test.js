import axios from 'axios';

const testData = {
  name: 'Test Mathematics Exam',
  subject: 'Mathematics',
  duration: 90,
  totalMarks: 100,
  numQuestions: 50,
  description: 'Mid-term mathematics examination'
};

async function testCreateTest() {
  try {
    console.log('Testing test creation API...');
    console.log('Request data:', testData);
    
    // Try without auth first to see the error
    const response = await axios.post('http://localhost:3000/api/tests/create', testData, {
      withCredentials: true
    });
    
    console.log('Success:', response.data);
  } catch (error) {
    console.error('Error details:');
    console.error('Status:', error.response?.status);
    console.error('Message:', error.response?.data);
  }
}

testCreateTest();
