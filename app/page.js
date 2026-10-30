'use client';
import { useState } from 'react';

export default function Home() {
  const [url, setUrl] = useState('');
  const [pins, setPins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    setLoading(true);
    setError('');
    setPins([]);

    try {
      const res = await fetch('/api/fetch-board', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ boardUrl: url }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors du chargement');

      setPins(data.pins);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ padding: '40px', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Blueprint — Board Analyzer</h1>
      <p>Collez l'URL d'un tableau Pinterest public pour récupérer les épingles :</p>
      
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="https://www.pinterest.com/username/boardname/"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #ccc' }}
        />
        <button
          onClick={handleAnalyze}
          style={{ padding: '12px 24px', background: '#000', color: '#fff', borderRadius: '8px', cursor: 'pointer' }}
        >
          {loading ? 'Chargement...' : 'Analyser'}
        </button>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
        {pins.map((pin, i) => (
          <div key={i} style={{ border: '1px solid #eee', borderRadius: '8px', overflow: 'hidden' }}>
            <img src={pin.imageUrl} alt={pin.title} style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
            <p style={{ padding: '8px', fontSize: '12px', margin: 0 }}>{pin.title}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
