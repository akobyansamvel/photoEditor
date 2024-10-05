import React, { useEffect, useState } from 'react';
import '../styles/KernelModal.css';

const ConvolutionFilterModal = ({ onClose, onApply, onReset, imageData }) => {
  const initialKernel = [
    [0, 0, 0],
    [0, 1, 0],
    [0, 0, 0]
  ];

  // Состояние для ядра свертки
  const [kernel, setKernel] = useState(initialKernel);
  const [appliedKernel, setAppliedKernel] = useState(initialKernel); // Состояние для последнего применённого ядра

  // Состояние для предпросмотра
  const [preview, setPreview] = useState(false);
  const [previewImageData, setPreviewImageData] = useState(null); // Для хранения предпросмотра
  const [previewImageUrl, setPreviewImageUrl] = useState(null); // URL для предпросмотра

  // Предустановленные ядра
  const presets = {
    identity: [[0, 0, 0], [0, 1, 0], [0, 0, 0]],
    sharpen: [[0, -1, 0], [-1, 5, -1], [0, -1, 0]],
    gaussianBlur: [[1, 2, 1], [2, 4, 2], [1, 2, 1]],
    boxBlur: [[1, 1, 1], [1, 1, 1], [1, 1, 1]],
    laplacian: [[0, -1, 0], [-1, 4, -1], [0, -1, 0]],
  };


const handleInputChange = (i, j, value) => {
  const updatedKernel = [...kernel];
  
  if (value === '') {
    updatedKernel[i][j] = '';
  } else {

    const numberValue = Math.min(parseFloat(value), 100);
    updatedKernel[i][j] = numberValue;
  }

  setKernel(updatedKernel);
};



  // Обработчик выбора предустановки
  const handlePresetSelect = (preset) => {
    setKernel(presets[preset]);
  };

  // Применение фильтра
  const applyFilter = (kernel, imageData) => {
    const { data, width, height } = imageData;
    const newImageData = new ImageData(width, height);

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let sumR = 0, sumG = 0, sumB = 0;

        for (let i = -1; i <= 1; i++) {
          for (let j = -1; j <= 1; j++) {
            const index = ((y + i) * width + (x + j)) * 4;
            sumR += data[index] * kernel[i + 1][j + 1];
            sumG += data[index + 1] * kernel[i + 1][j + 1];
            sumB += data[index + 2] * kernel[i + 1][j + 1];
          }
        }

        const newIndex = (y * width + x) * 4;
        newImageData.data[newIndex] = Math.min(Math.max(sumR, 0), 255);
        newImageData.data[newIndex + 1] = Math.min(Math.max(sumG, 0), 255);
        newImageData.data[newIndex + 2] = Math.min(Math.max(sumB, 0), 255);
        newImageData.data[newIndex + 3] = 255; // Альфа-канал
      }
    }

    return newImageData;
  };

  // Обработчик предпросмотра
  const handlePreview = () => {
    setPreview((prev) => !prev);
    if (!preview && imageData) {
      const filteredImageData = applyFilter(kernel, imageData);
      setPreviewImageData(filteredImageData);
    } else {
      setPreviewImageData(null); // Удалить предпросмотр, если отменяем
    }
  };

  // Эффект для обновления URL предпросмотра
  useEffect(() => {
    if (previewImageData) {
      const canvas = document.createElement('canvas');
      canvas.width = previewImageData.width;
      canvas.height = previewImageData.height;
      const ctx = canvas.getContext('2d');
      ctx.putImageData(previewImageData, 0, 0);
      setPreviewImageUrl(canvas.toDataURL());
    } else {
      setPreviewImageUrl(null);
    }
  }, [previewImageData]);

  // Обработчик кнопки "Применить"
  const handleApply = () => {
    if (onApply) {
      onApply(preview ? previewImageData : kernel);
      setAppliedKernel(preview ? previewImageData : kernel); // Сохранить применённое ядро
    }
  };

  // Обработчик сброса
  const handleReset = () => {
    setKernel(initialKernel); // Вернуть ядро к начальному значению
    setPreview(false);
    setPreviewImageData(null);
    setPreviewImageUrl(null);
    onReset();
  };

  return (
    <div className="modal">
      <h2>Convolution Filter</h2>
      <table className="kernel-input-grid">
        <tbody>
          {Array.isArray(kernel) && kernel.map((row, i) => (
            <tr key={i}>
              {row.map((value, j) => (
                <td key={`${i}-${j}`}>
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => handleInputChange(i, j, e.target.value)}
                    max={100}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="presets">
        {Object.keys(presets).map((preset) => (
          <button key={preset} onClick={() => handlePresetSelect(preset)}>
            {preset.charAt(0).toUpperCase() + preset.slice(1)}
          </button>
        ))}
      </div>

      <div className="actions">
        <button onClick={handleApply}>Apply</button>
        <button onClick={handleReset}>Reset</button>
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
