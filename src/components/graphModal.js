import React, { useState, useEffect } from 'react';
import '../styles/graphModal.css';

const GrapModal = ({ isOpen, onClose, onApply, onReset, onPreview }) => {
  const [input1, setInput1] = useState(0);
  const [output1, setOutput1] = useState(0);
  const [input2, setInput2] = useState(255);
  const [output2, setOutput2] = useState(255);
  const [previewEnabled, setPreviewEnabled] = useState(false);

  useEffect(() => {
    if (previewEnabled) {
      const timeoutId = setTimeout(() => {
        const lut = generateLUT();
        onPreview(lut);
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [input1, output1, input2, output2, previewEnabled]);

  const generateLUT = () => {
    const lut = new Array(256);
    for (let i = 0; i < 256; i++) {
      if (i <= input1) {
        lut[i] = (output1 / input1) * i;
      } else if (i >= input2) {
        lut[i] = ((255 - output2) / (255 - input2)) * (i - input2) + output2;
      } else {
        lut[i] = ((output2 - output1) / (input2 - input1)) * (i - input1) + output1;
      }
    }
    return lut;
  };

  const handleApply = () => {
    const lut = generateLUT();
    onApply(lut);
  };

  const handleReset = () => {
    setInput1(0);
    setOutput1(0);
    setInput2(255);
    setOutput2(255);
    onReset();
  };

  if (!isOpen) return null;

  const handleInput1Change = (e) => {
    const value = Math.min(255, Math.max(0, Number(e.target.value)));
    if (value === '' || (value > 0 && value < input2)) {
      setInput1(value);
    }
  };

  const handleInput2Change = (e) => {
    const value = Math.min(255, Math.max(0, Number(e.target.value)));
    if (value === '' || (value > input1 && value <= 255)) {
      setInput2(value);
    }
  };

  const handleFocus = (setter) => () => setter('');

  const generateSVGCurve = () => {
    const x1 = (input1 / 255) * 250; // Изменяем ширину на 250
    const x2 = (input2 / 255) * 250; // Изменяем ширину на 250
    const y1 = 250 - (output1 / 255) * 250; // Изменяем высоту на 250
    const y2 = 250 - (output2 / 255) * 250; // Изменяем высоту на 250
  
    const redHistogram = Array.from({ length: 256 }, () => Math.random() * 200);
    const greenHistogram = Array.from({ length: 256 }, () => Math.random() * 200);
    const blueHistogram = Array.from({ length: 256 }, () => Math.random() * 200);
    const barWidth = 2; // Ширина каждого столбика
const totalBars = redHistogram.length; // Общее количество столбиков
const spacing = (250 - (totalBars * barWidth)) / (totalBars + 1); // Промежутки между столбиками

return (
  <svg width="250" height="250" className="curve-svg">
    {/* Гистограмма для красного канала */}
    {redHistogram.map((value, index) => (
      <rect
        key={`red-${index}`}
        x={(index * (barWidth + spacing)) + spacing} // Смещение по оси X
        y={250 - value} // Смещение по оси Y прижато к низу
        width={barWidth} // Ширина столбика
        height={value} // Высота столбика
        fill="rgba(255, 0, 0, 0.5)"
      />
    ))}

    {/* Гистограмма для зеленого канала */}
    {greenHistogram.map((value, index) => (
      <rect
        key={`green-${index}`}
        x={(index * (barWidth + spacing)) + spacing + barWidth} // Смещение по оси X
        y={250 - value} // Смещение по оси Y прижато к низу
        width={barWidth} // Ширина столбика
        height={value} // Высота столбика
        fill="rgba(0, 255, 0, 0.5)"
      />
    ))}

    {/* Гистограмма для синего канала */}
    {blueHistogram.map((value, index) => (
      <rect
        key={`blue-${index}`}
        x={(index * (barWidth + spacing)) + spacing + (barWidth * 2)} // Смещение по оси X
        y={250 - value} // Смещение по оси Y прижато к низу
        width={barWidth} // Ширина столбика
        height={value} // Высота столбика
        fill="rgba(0, 0, 255, 0.5)"
      />
    ))}

    {/* Кривая, соединяющая точки */}
    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="black" strokeWidth="2" />

    {/* Точки */}
    <circle cx={x1} cy={y1} r="4" fill="red" />
    <circle cx={x2} cy={y2} r="4" fill="red" />

    {/* Линии слева и справа от точек */}
    <line x1="0" y1={y1} x2={x1} y2={y1} stroke="green" strokeDasharray="4" />
    <line x1={x2} y1={y2} x2="250" y2={y2} stroke="green" strokeDasharray="4" />
  </svg>
);
  }
  

  return (
    <div className="curves-modal-overlay">
      <div className="curves-modal">
        <h2 style={{ textAlign: 'center', marginBottom: '10px' }}>Градационная коррекция</h2>
        <div className="curves-inputs" style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '10px' }}>
          <div>
            <label>
              Вход 1:
              <input
                type="number"
                value={input1}
                onChange={handleInput1Change}
                onFocus={handleFocus(setInput1)}
                min="0"
                max="255"
                style={{ margin: '0 5px' }}
              />
            </label>
            <label>
              Выход 1:
              <input
                type="number"
                value={output1}
                onChange={(e) => setOutput1(Math.min(255, Math.max(0, Number(e.target.value))))}
                onFocus={handleFocus(setOutput1)}
                min="0"
                max="255"
                style={{ margin: '0 5px' }}
              />
            </label>
          </div>
          <div>
            <label>
              Вход 2:
              <input
                type="number"
                value={input2}
                onChange={handleInput2Change}
                onFocus={handleFocus(setInput2)}
                min="1"
                max="255"
                style={{ margin: '0 5px' }}
              />
            </label>
            <label>
              Выход 2:
              <input
                type="number"
                value={output2}
                onChange={(e) => setOutput2(Math.min(255, Math.max(0, Number(e.target.value))))}
                onFocus={handleFocus(setOutput2)}
                min="0"
                max="255"
                style={{ margin: '0 5px' }}
              />
            </label>
          </div>
        </div>

        <div className="curves-chart" style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
          {generateSVGCurve()}
        </div>

        <div className="curves-controls" style={{ display: 'flex', justifyContent: 'space-around' }}>
          <label>
            <input
              type="checkbox"
              checked={previewEnabled}
              onChange={(e) => setPreviewEnabled(e.target.checked)}
            />
            Предпросмотр
          </label>
          <button onClick={handleApply}>Применить</button>
          <button onClick={handleReset}>Сбросить</button>
          <button onClick={onClose}>Закрыть</button>
        </div>
      </div>
    </div>
  );
};

export default GrapModal;
