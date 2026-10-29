'use client';
import { useState } from 'react';

export default function Home() {
  const [boardUrl, setBoardUrl] = useState('');
  const [pins, setPins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setPins([]);

    try {
      const cleanUrl = boardUrl.replace(/\/$/, '');
      const rssUrl = `${cleanUrl}.rss`;
      
      // Utilisation d'un service de conversion RSS vers JSON direct et sécurisé
      const apiURL = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;
      const res = await fetch(apiURL);
      const data = await res.json();

      if (data.status !== 'ok' || !data.items) {
        throw new Error("Impossible de récupérer ce tableau. Vérifiez qu'il est public et que l'URL est correcte.");
      }

      const fetchedPins = data.items.map(item => {
        // Extraction de l'image depuis la description HTML de l'item RSS
        const imgMatch = item.description.match(/src="([^"]+)"/);
        return {
          title: item.title || 'Épingle',
          imageUrl: imgMatch ? imgMatch[1] : ''
        };
      }).filter(pin => pin.imageUrl !== '');

      if (fetchedPins.length === 0) {
        throw new Error("Aucune image trouvée dans ce tableau.");
      }

      setPins(fetchedPins.slice(0, 10));
    } catch (err) {
      setError(err.message || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ maxWidth: '800px', margin: '40px auto', fontFamily: 'sans-serif', padding: '0 20px' }}>
      <h1 style={{ color: '#E60023', textAlign: 'center' }}>Blueprint — Life Audit</h1>
      <p style={{ textAlign: 'center', color: '#666' }}>Transformez votre tableau Pinterest en plan d'action.</p>
      
      <form onSubmit={handleAnalyze} style={{ display: 'flex', gap: '10px', marginTop: '30px' }}>
        <input
          type="url"
          placeholder="Collez l'URL de votre tableau Pinterest public..."
          value={boardUrl}
          onChange={(e) => setBoardUrl(e.target.value)}
          required
          style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '16px' }}
        />
        <button 
          type="submit" 
          disabled={loading}
          style={{ background: '#E60023', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}
        >
          {loading ? 'Analyse...' : 'Analyser'}
        </button>
      </form>

      {error && <p style={{ color: 'red', textAlign: 'center', marginTop: '20px' }}>{error}</p>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '15px', marginTop: '40px' }}>
        {pins.map((pin, index) => (
          <div key={index} style={{ border: '1px solid #eee', borderRadius: '8px', overflow: 'hidden', background: '#fafafa' }}>
            <img src={pin.imageUrl} alt={pin.title} style={{ width: '100%', height: '150px', objectFit: 'cover' }} />
            <p style={{ padding: '8px', fontSize: '12px', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{pin.title}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
