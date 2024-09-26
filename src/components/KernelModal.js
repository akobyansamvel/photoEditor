import React, { useState } from 'react';
import  '../styles/KernelModal.css';

const ConvolutionFilterModal = ({ onClose, onApply, onReset, imageData }) => {
  // Состояние для ядра свертки
  const [kernel, setKernel] = useState([
    [0, 0, 0],
    [0, 1, 0],
    [0, 0, 0]
  ]);

  // Состояние для предпросмотра
  const [preview, setPreview] = useState(false);

  // Предустановленные ядра
  const presets = {
    identity: [[0, 0, 0], [0, 1, 0], [0, 0, 0]],
    sharpen: [[0, -1, 0], [-1, 5, -1], [0, -1, 0]],
    gaussianBlur: [[1, 2, 1], [2, 4, 2], [1, 2, 1]],
    boxBlur: [[1, 1, 1], [1, 1, 1], [1, 1, 1]]
  };

  // Обработчик изменения значения в поле ввода
  const handleInputChange = (i, j, value) => {
    const updatedKernel = [...kernel];
    updatedKernel[i][j] = parseFloat(value) || 0;
    setKernel(updatedKernel);
  };

  // Обработчик выбора предустановки
  const handlePresetSelect = (preset) => {
    setKernel(presets[preset]);
  };

  // Обработчик кнопки "Применить"
  const handleApply = () => {
    if (onApply) {
      onApply(kernel);
    }
  };

  // Обработчик предпросмотра
  const handlePreview = () => {
    setPreview(!preview);
    if (!preview && onApply) {
      onApply(kernel); // Применить ядро для предпросмотра
    }
  };

  return (
    <div className="modal">
      <h2>Convolution Filter</h2>
      <table className="kernel-input-grid">
        <tbody>
          {kernel.map((row, i) => (
            <tr key={i}>
              {row.map((value, j) => (
                <td key={`${i}-${j}`}>
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => handleInputChange(i, j, e.target.value)}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="presets">
        <button onClick={() => handlePresetSelect('identity')}>Identity</button>
        <button onClick={() => handlePresetSelect('sharpen')}>Sharpen</button>
        <button onClick={() => handlePresetSelect('gaussianBlur')}>Gaussian Blur</button>
        <button onClick={() => handlePresetSelect('boxBlur')}>Box Blur</button>
      </div>

      <div className="actions">
        <button onClick={handleApply}>Apply</button>
        <button onClick={onReset}>Reset</button>
        <button onClick={onClose}>Close</button>
        <label>
          <input type="checkbox" checked={preview} onChange={handlePreview} />
          Preview
        </label>
      </div>
    </div>
  );
};

export default ConvolutionFilterModal;
