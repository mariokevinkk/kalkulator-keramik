import { useState, useMemo, useEffect } from 'react';
import './App.css';

function App() {
  const [panjangRuangan, setPanjangRuangan] = useState(400); 
  const [lebarRuangan, setLebarRuangan] = useState(400);   
  const [panjangKeramik, setPanjangKeramik] = useState(40);
  const [lebarKeramik, setLebarKeramik] = useState(40);
  const [wasteFactor, setWasteFactor] = useState(10); 
  const [roomUnit, setRoomUnit] = useState('cm'); 
  const [useCadangan, setUseCadangan] = useState(false);
  const [history, setHistory] = useState([]);
  const [theme, setTheme] = useState(localStorage.getItem('ceramic_theme') || 'light');

  // Persistence
  useEffect(() => {
    const saved = localStorage.getItem('ceramic_history');
    if (saved) try { setHistory(JSON.parse(saved)); } catch (e) {}
    document.documentElement.setAttribute('data-theme', theme);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('ceramic_theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const result = useMemo(() => {
    const pR = roomUnit === 'm' ? panjangRuangan * 100 : panjangRuangan;
    const lR = roomUnit === 'm' ? lebarRuangan * 100 : lebarRuangan;
    
    // Safety check for zero/negative
    if (pR <= 0 || lR <= 0 || panjangKeramik <= 0 || lebarKeramik <= 0) {
      return { pR, lR, tilesH: 0, tilesV: 0, totalTilesLayout: 0, totalWithWaste: 0 };
    }

    const tilesH = Math.ceil(pR / panjangKeramik);
    const tilesV = Math.ceil(lR / lebarKeramik);
    const totalTilesLayout = tilesH * tilesV;
    
    const remH = pR % panjangKeramik;
    const remV = lR % lebarKeramik;
    const hasRemainderH = remH !== 0;
    const hasRemainderV = remV !== 0;

    const actualWaste = useCadangan ? wasteFactor : 0;
    const totalWithWaste = Math.ceil(totalTilesLayout * (1 + actualWaste / 100));
    
    return {
      pR, lR, tilesH, tilesV, totalTilesLayout, totalWithWaste,
      hasRemainderH, hasRemainderV
    };
  }, [panjangRuangan, lebarRuangan, panjangKeramik, lebarKeramik, wasteFactor, roomUnit, useCadangan]);

  const saveToHistory = () => {
    const newItem = {
      id: Date.now(),
      date: new Date().toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
      room: `${panjangRuangan}x${lebarRuangan} ${roomUnit}`,
      tile: `${panjangKeramik}x${lebarKeramik} cm`,
      total: result.totalWithWaste
    };
    const updated = [newItem, ...history];
    setHistory(updated);
    localStorage.setItem('ceramic_history', JSON.stringify(updated));
  };

  const deleteHistory = (id) => {
    const updated = history.filter(item => item.id !== id);
    setHistory(updated);
    localStorage.setItem('ceramic_history', JSON.stringify(updated));
  };

  return (
    <div className="app-container">
      <header className="main-header">
        <h1 className="main-title">Kalkulator Keramik</h1>
        <button className="theme-btn" onClick={toggleTheme}>
          {theme === 'light' ? '🌙 Gelap' : '☀️ Terang'}
        </button>
      </header>

      <div className="main-grid">
        {/* INPUTS */}
        <section className="card input-card">
          <div className="card-header">
            <h2 className="card-title">Ukuran Ruangan</h2>
            <select className="ui-select" value={roomUnit} onChange={(e) => setRoomUnit(e.target.value)}>
              <option value="cm">cm</option>
              <option value="m">meter</option>
            </select>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Sisi A ({roomUnit})</label>
              <input type="number" value={panjangRuangan} onChange={(e) => setPanjangRuangan(Number(e.target.value))} />
            </div>
            <div className="form-group">
              <label>Sisi B ({roomUnit})</label>
              <input type="number" value={lebarRuangan} onChange={(e) => setLebarRuangan(Number(e.target.value))} />
            </div>
          </div>

          <h2 className="card-title" style={{ marginTop: '1.5rem' }}>Ukuran Keramik (cm)</h2>
          <div className="form-row">
            <div className="form-group">
              <label>Panjang (cm)</label>
              <input type="number" value={panjangKeramik} onChange={(e) => setPanjangKeramik(Number(e.target.value))} />
            </div>
            <div className="form-group">
              <label>Lebar (cm)</label>
              <input type="number" value={lebarKeramik} onChange={(e) => setLebarKeramik(Number(e.target.value))} />
            </div>
          </div>

          <div className="cadangan-wrap">
            <label className="checkbox-wrap">
              <input type="checkbox" checked={useCadangan} onChange={(e) => setUseCadangan(e.target.checked)} />
              <span>Gunakan Cadangan (%)</span>
            </label>
            {useCadangan && (
              <input className="small-input" type="number" value={wasteFactor} onChange={(e) => setWasteFactor(Number(e.target.value))} />
            )}
          </div>
        </section>

        {/* RESULTS */}
        <section className="card result-card">
          <h2 className="card-title">Ringkasan</h2>
          <div className="big-result">
            <div className="res-label">Total Belanja</div>
            <div className="res-value">{result.totalWithWaste} <span>Pcs</span></div>
          </div>
          
          <div className="mini-stats">
            <div className="mini-item">
              <div className="mini-label">Susunan</div>
              <div className="mini-value">{result.tilesH} x {result.tilesV}</div>
            </div>
            <div className="mini-item">
              <div className="mini-label">Tanpa Sisa</div>
              <div className="mini-value">{result.totalTilesLayout} Pcs</div>
            </div>
            <div className="mini-item">
              <div className="mini-label">Potongan</div>
              <div className="mini-value">{(result.hasRemainderH || result.hasRemainderV) ? 'Ada' : 'Cukup'}</div>
            </div>
          </div>
          
          <button className="primary-btn" onClick={saveToHistory}>Simpan ke Riwayat</button>
        </section>
      </div>

      {/* VISUALIZER - FULL REWRITE */}
      <section className="card visual-card">
        <h2 className="card-title">Visualisasi Tata Letak</h2>
        
        <div className="viz-wrapper">
          <div className="viz-frame">
             {/* Labels */}
             <div className="label v-label-top">{result.pR} cm</div>
             <div className="label v-label-left">{result.lR} cm</div>
             
             {/* Actual Visual Area */}
             <div className="viz-box-container">
                <div 
                  className="viz-box" 
                  style={{ aspectRatio: `${result.pR}/${result.lR}` }}
                >
                  <div 
                    className="viz-grid"
                    style={{
                      gridTemplateColumns: `repeat(${result.tilesH}, 1fr)`,
                      gridTemplateRows: `repeat(${result.tilesV}, 1fr)`,
                    }}
                  >
                    {[...Array(Math.min(1000, result.totalTilesLayout))].map((_, i) => {
                      const col = i % result.tilesH;
                      const row = Math.floor(i / result.tilesH);
                      const isCut = (result.hasRemainderH && col === result.tilesH - 1) || 
                                    (result.hasRemainderV && row === result.tilesV - 1);
                      return <div key={i} className={`tile ${isCut ? 'tile-cut' : ''}`}></div>;
                    })}
                  </div>
                </div>
             </div>
          </div>
          
          <div className="viz-legend">
            <div className="leg-item"><span className="leg-box utuh"></span> Keramik Utuh</div>
            {(result.hasRemainderH || result.hasRemainderV) && (
              <div className="leg-item"><span className="leg-box sisa"></span> Potongan Sisa</div>
            )}
          </div>
        </div>
      </section>

      {/* HISTORY */}
      {history.length > 0 && (
        <section className="card hist-card">
          <h2 className="card-title">Riwayat Simpan</h2>
          <div className="table-row-wrap">
            <table className="hist-table">
              <thead>
                <tr>
                  <th>Tgl</th>
                  <th>Ruangan</th>
                  <th>Keramik</th>
                  <th>Hasil</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h.id}>
                    <td>{h.date}</td>
                    <td>{h.room}</td>
                    <td>{h.tile}</td>
                    <td className="accent">{h.total} Pcs</td>
                    <td><button className="del-btn" onClick={() => deleteHistory(h.id)}>✖</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

export default App;
