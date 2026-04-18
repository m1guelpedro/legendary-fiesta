import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Exemplo de chamada para a API do backend
    fetch('http://backend:3000/')
      .then(res => res.json())
      .then(data => setMessage(data.message))
      .catch(err => console.error('Erro ao conectar com API:', err));
  }, []);

  return (
    <div className="App">
      <h1>Frontend React</h1>
      <p>Mensagem da API: {message}</p>
    </div>
  );
}

export default App;