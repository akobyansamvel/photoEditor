import React, { useState, useEffect } from 'react';
import '../styles/graphModal.css';
import { Line } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

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
        lut[i] = output1;
      } else if (i >= input2) {
        lut[i] = output2;
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
    setPreviewEnabled(false);
    onReset();
  };

  const handlePreviewChange = (e) => {
    const isChecked = e.target.checked;
    setPreviewEnabled(isChecked);
    if (!isChecked) {
      handleReset();
    }
  };

  if (!isOpen) return null;

  const handleClose = () => {
    setPreviewEnabled(false);
    onClose();
  };

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

  const generateHistograms = () => {
    const redHistogram = Array.from({ length: 256 }, () => Math.random() * 200);
    const greenHistogram = Array.from({ length: 256 }, () => Math.random() * 200);
    const blueHistogram = Array.from({ length: 256 }, () => Math.random() * 200);
    return { redHistogram, greenHistogram, blueHistogram };
  };

  const { redHistogram, greenHistogram, blueHistogram } = generateHistograms();

  const data = {
    labels: Array.from({ length: 256 }, (_, i) => i),
    datasets: [
      {
        label: 'Curve',
        data: generateLUT(),
        borderColor: 'rgba(0, 0, 0)',
        fill: false,
        // Добавляем точки только для input1 и input2
        pointRadius: ({ dataIndex }) => (dataIndex === input1 || dataIndex === input2 ? 4 : 0),
        pointStyle: 'circle',
      },
      {
        label: 'Red Histogram',
        data: redHistogram,
        borderColor: 'rgba(255, 0, 0, 0.5)',
        fill: false,
        pointRadius: 0,
      },
      {
        label: 'Green Histogram',
        data: greenHistogram,
        borderColor: 'rgba(0, 255, 0, 0.5)',
        fill: false,
        pointRadius: 0,
      },
      {
        label: 'Blue Histogram',
        data: blueHistogram,
        borderColor: 'rgba(0, 0, 255, 0.5)',
        fill: false,
        pointRadius: 0,
      },
    ],
  };
  

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
          <Line data={data} />
        </div>

        <div className="curves-buttons" style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '10px' }}>
          <button onClick={handleApply}>Применить</button>
          <button onClick={handleReset}>Сбросить</button>
          <button onClick={handleClose}>Закрыть</button>
        </div>

        <label style={{ display: 'block', textAlign: 'center', marginBottom: '10px' }}>
          <input type="checkbox" checked={previewEnabled} onChange={handlePreviewChange} />
          Включить предпросмотр
        </label>
      </div>
    </div>
  );
};

export default GrapModal;
