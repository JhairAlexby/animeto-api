import axios from 'axios';

const BASE_URL = 'http://localhost:3000';
const API_BASE_URL = `${BASE_URL}/api`;

async function testEndpoints() {
  console.log('🧪 Probando endpoints con prefijo /api...\n');

  const endpoints = [
    // Auth endpoints
    { method: 'POST', url: `${API_BASE_URL}/auth/register`, data: { name: 'Test User', email: 'test@example.com', password: 'Test123456' } },
    { method: 'POST', url: `${API_BASE_URL}/auth/login`, data: { email: 'test@example.com', password: 'Test123456' } },
    
    // Users endpoints
    { method: 'GET', url: `${API_BASE_URL}/users/profile` },
    
    // Posts endpoints
    { method: 'GET', url: `${API_BASE_URL}/posts` },
    
    // Comments endpoints
    { method: 'GET', url: `${API_BASE_URL}/comments` },
    
    // Reactions endpoints
    { method: 'GET', url: `${API_BASE_URL}/reactions` },
    
    // Publicaciones endpoints
    { method: 'GET', url: `${API_BASE_URL}/publicaciones/completas` },
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`📍 Probando: ${endpoint.method} ${endpoint.url}`);
      
      let response;
      if (endpoint.method === 'POST') {
        response = await axios.post(endpoint.url, endpoint.data);
      } else {
        response = await axios.get(endpoint.url);
      }
      
      console.log(`✅ ${endpoint.url} - Status: ${response.status}`);
    } catch (error: any) {
      if (error.response) {
        console.log(`❌ ${endpoint.url} - Status: ${error.response.status}, Message: ${error.response.data?.message || error.response.statusText}`);
      } else {
        console.log(`❌ ${endpoint.url} - Error: ${error.message}`);
      }
    }
    console.log('');
  }

  // Probar redirección de rutas sin /api
  console.log('🔄 Probando redirección de rutas sin prefijo /api...\n');
  
  const oldEndpoints = [
    { method: 'GET', url: `${BASE_URL}/auth/register` },
    { method: 'GET', url: `${BASE_URL}/users/profile` },
    { method: 'GET', url: `${BASE_URL}/posts` },
    { method: 'GET', url: `${BASE_URL}/publicaciones/completas` },
  ];

  for (const endpoint of oldEndpoints) {
    try {
      console.log(`📍 Probando redirección: ${endpoint.method} ${endpoint.url}`);
      
      const response = await axios.get(endpoint.url, { maxRedirects: 0 });
      console.log(`⚠️  ${endpoint.url} - No se redirigió (Status: ${response.status})`);
    } catch (error: any) {
      if (error.response && error.response.status === 301) {
        console.log(`✅ ${endpoint.url} - Redirigido a: ${error.response.headers.location}`);
      } else if (error.response) {
        console.log(`❌ ${endpoint.url} - Status: ${error.response.status}`);
      } else {
        console.log(`❌ ${endpoint.url} - Error: ${error.message}`);
      }
    }
    console.log('');
  }
}

// Ejecutar las pruebas
testEndpoints().catch(console.error);