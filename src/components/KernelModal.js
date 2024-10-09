import React, { useState, useEffect } from 'react';
import '../styles/KernelModal.css';

const ConvolutionFilterModal = ({ onClose, onApply, onReset, onPreview }) => {
  const initialKernel = [
    [0, 0, 0],
    [0, 1, 0],
    [0, 0, 0]
  ];

  const [kernel, setKernel] = useState(initialKernel);
  const [preview, setPreview] = useState(false);

  const presets = {
    identity: [[0, 0, 0], [0, 1, 0], [0, 0, 0]],
    sharpen: [[0, -1, 0], [-1, 5, -1], [0, -1, 0]],
    gaussianBlur: [[1, 2, 1], [2, 4, 2], [1, 2, 1]],
    boxBlur: [[1, 1, 1], [1, 1, 1], [1, 1, 1]],
    laplacian: [[0, -1, 0], [-1, 4, -1], [0, -1, 0]],
  };

  const handleInputChange = (i, j, value) => {
    const updatedKernel = kernel.map(row => [...row]);
    
    if (value === '') {
      updatedKernel[i][j] = '';
    } else {
      const numberValue = Math.min(parseFloat(value), 100);
      updatedKernel[i][j] = numberValue;
    }

    setKernel(updatedKernel);
    if (preview) {
      onPreview(updatedKernel);
    }
  };

  const handlePresetSelect = (preset) => {
    const newKernel = presets[preset];
    setKernel(newKernel);
    if (preview) {
      onPreview(newKernel);
    }
  };

  const handlePreview = () => {
    setPreview(!preview);
    if (!preview) {
      onPreview(kernel);
    } else {
      onReset();
    }
  };

  const handleApply = () => {
    onApply(kernel);
    setPreview(false);
  };

  const handleReset = () => {
    setKernel(initialKernel);
    setPreview(false);
    onReset();
  };

  useEffect(() => {
    return () => {
      if (preview) {
        onReset();
      }
    };
  }, [preview, onReset]);

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
                    step="0.01"
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
