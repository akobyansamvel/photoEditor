import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import './CurvesModal.css';

// Регистрация компонентов Chart.js
Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const CurvesModal = ({ isOpen, onClose, onApply, onReset, onPreview }) => {
  // Состояния для входных и выходных значений
  const [input1, setInput1] = useState(0);
  const [output1, setOutput1] = useState(0);
  const [input2, setInput2] = useState(255);
  const [output2, setOutput2] = useState(255);
  const [previewEnabled, setPreviewEnabled] = useState(false); // Состояние для предпросмотра

  useEffect(() => {
    // Эффект для предпросмотра изменений
    if (previewEnabled) {
      const timeoutId = setTimeout(() => {
        const lut = generateLUT();
        onPreview(lut); // Вызываем onPreview с LUT через 100 миллисекунд
      }, 100);
      return () => clearTimeout(timeoutId); // Очищаем таймер при размонтировании
    }
  }, [input1, output1, input2, output2, previewEnabled]);

  // Функция для генерации LUT (Look-Up Table)
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

  // Обработчик для применения изменений
  const handleApply = () => {
    const lut = generateLUT();
    onApply(lut); // Вызываем onApply с LUT
  };

  // Обработчик для сброса значений
  const handleReset = () => {
    setInput1(0);
    setOutput1(0);
    setInput2(255);
    setOutput2(255);
    onReset(); // Вызываем onReset
  };

  if (!isOpen) return null; // Если модальное окно не открыто, не отображаем компонент

  // Данные для графика
  const data = {
    labels: Array.from({ length: 256 }, (_, i) => i),
    datasets: [
      {
        label: 'Curve',
        data: generateLUT(), // Генерируем LUT для данных графика
        borderColor: 'rgba(75,192,192,1)',
        fill: false,
      },
    ],
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
                onChange={(e) => setInput1(Number(e.target.value))}
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
                onChange={(e) => setInput2(Number(e.target.value))}
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
          <Line data={data} /> {/* Отображаем график с данными */}
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

export default CurvesModal;