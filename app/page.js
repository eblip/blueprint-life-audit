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
      
      // Utilisation d'un autre proxy public plus stable pour le format XML/RSS
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(rssUrl)}`;
      const res = await fetch(proxyUrl);

      if (!res.ok) {
        throw new Error("Impossible d'accéder à ce tableau. Assurez-vous qu'il est public.");
      }

      const xmlText = await res.text();

      // Vérification si le proxy renvoie du HTML par erreur
      if (xmlText.trim().startsWith('<!DOCTYPE') || xmlText.trim().startsWith('<html')) {
        throw new Error("Pinterest a bloqué la requête ou le tableau n'existe pas.");
      }

      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, "text/xml");
      const items = xmlDoc.querySelectorAll('item');

      if (items.length === 0) {
        throw new Error("Aucune épingle trouvée dans ce tableau.");
      }

      const fetchedPins = [];
      items.forEach((item, index) => {
        if (index < 10) {
          const title = item.querySelector('title')?.textContent || 'Épingle';
          const description = item.querySelector('description')?.textContent || '';
          
          const imgMatch = description.match(/src="([^"]+)"/);
          const imageUrl = imgMatch ? imgMatch[1] : '';

          if (imageUrl) {
            fetchedPins.push({ title, imageUrl });
          }
        }
      });

      setPins(fetchedPins);
    } catch (err) {
      setError(err.message || "Une erreur est survenue lors de l'analyse.");
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
