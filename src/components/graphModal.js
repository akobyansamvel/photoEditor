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

  // Генерация LUT
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

  // Применение изменений
  const handleApply = () => {
    const lut = generateLUT();
    onApply(lut);
  };

  // Сброс значений
  const handleReset = () => {
    setInput1(0);
    setOutput1(0);
    setInput2(255);
    setOutput2(255);
    onReset();
  };

  if (!isOpen) return null;

  // Проверка входных данных
  const handleInput1Change = (e) => {
    const value = Number(e.target.value);
    if (value >= 0 && value < input2) setInput1(value);
  };

  const handleInput2Change = (e) => {
    const value = Number(e.target.value);
    if (value > input1 && value <= 255) setInput2(value);
  };

  // Генерация SVG для кривых
  const generateSVGCurve = () => {
    const x1 = (input1 / 255) * 200;
    const x2 = (input2 / 255) * 200;
    const y1 = 200 - (output1 / 255) * 200;
    const y2 = 200 - (output2 / 255) * 200;

    return (
      <svg width="200" height="200" className="curve-svg">
        <line x1="0" y1="200" x2="200" y2="0" stroke="#ccc" />
  
        <line x1="0" y1="200" x2={x1} y2={y1} stroke="blue" strokeWidth="2" />
        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="blue" strokeWidth="2" />
        <line x1={x2} y1={y2} x2="200" y2="0" stroke="blue" strokeWidth="2" />
  
        <circle cx={x1} cy={y1} r="4" fill="red" />
        <circle cx={x2} cy={y2} r="4" fill="red" />
      </svg>
    );
  };

  return (
    <div className="curves-modal-overlay">
      <div className="curves-modal">
        <h2>Градационная коррекция</h2>
        <div className="curves-inputs">
          <div>
            <label>
              Вход 1:
              <input
                type="number"
                value={input1}
                onChange={handleInput1Change}
                min="0"
                max="254"
              />
            </label>
            <label>
              Выход 1:
              <input
                type="number"
                value={output1}
                onChange={(e) => setOutput1(Number(e.target.value))}
                min="0"
                max="255"
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
                min="1"
                max="255"
              />
            </label>
            <label>
              Выход 2:
              <input
                type="number"
                value={output2}
                onChange={(e) => setOutput2(Number(e.target.value))}
                min="0"
                max="255"
              />
            </label>
          </div>
        </div>

        <div className="curves-chart">
          {generateSVGCurve()} 
        </div>

        <div className="curves-controls">
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
