import React, { useState, useEffect } from 'react';
import '../styles/modal.css';

function ResizeModal({ isOpen, onClose, imageWidth, imageHeight, onResize }) {
  const [units, setUnits] = useState('percent');
  const [width, setWidth] = useState(100);
  const [height, setHeight] = useState(100);
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
  const [interpolation, setInterpolation] = useState('nearest');

  // Подсчет общего количества пикселей в мегапикселях
  const getMegapixels = (width, height) => {
    return ((width * height) / 1000000).toFixed(2); // Преобразование в мегапиксели
  };

  useEffect(() => {
    setWidth(100);
    setHeight(100);
  }, [imageWidth, imageHeight]);

  const handleWidthChange = (e) => {
    const newWidth = e.target.value.trim() === '' ? '' : Math.min(Math.round(e.target.value), 9999); 
    setWidth(newWidth);
    
    if (newWidth !== '' && maintainAspectRatio) {
      setHeight(Math.round((newWidth * imageHeight) / imageWidth));
    }
  };
  
  const handleHeightChange = (e) => {
    const newHeight = e.target.value.trim() === '' ? '' : Math.min(Math.round(e.target.value), 9999); 
    setHeight(newHeight);
    
    if (newHeight !== '' && maintainAspectRatio) {
      setWidth(Math.round((newHeight * imageWidth) / imageHeight));
    }
  };
  
  

  const handleResize = () => {
    let newWidth = width;
    let newHeight = height;
    if (units === 'percent') {
      newWidth = Math.round((imageWidth * width) / 100);
      newHeight = Math.round((imageHeight * height) / 100);
    } else {
      newWidth = Math.round(width);
      newHeight = Math.round(height);
    }
    onResize({ width: newWidth, height: newHeight });
    onClose();
  };

  if (!isOpen) return null;

  // Подсчет пикселей для текущего и нового размера
  const originalMegapixels = getMegapixels(imageWidth, imageHeight);
  const newWidth = units === 'percent' ? Math.round((imageWidth * width) / 100) : width;
  const newHeight = units === 'percent' ? Math.round((imageHeight * height) / 100) : height;
  const newMegapixels = getMegapixels(newWidth, newHeight);

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Изменение размера изображения</h2>
        <div>
          <label>Единицы измерения:</label>
          <select value={units} onChange={(e) => setUnits(e.target.value)}>
            <option value="percent">Проценты</option>
            <option value="pixels">Пиксели</option>
          </select>
        </div>
        <div>
          <label>Ширина:</label>
          <input
            type="number"
            value={width}
            onChange={handleWidthChange}
            max={9999} 
          />
        </div>
        <div>
          <label>Высота:</label>
          <input
            type="number"
            value={height}
            onChange={handleHeightChange}
            max={9999} 
          />
        </div>
        <div>
          <label>
            <input 
              type="checkbox" 
              checked={maintainAspectRatio} 
              onChange={() => setMaintainAspectRatio(!maintainAspectRatio)} 
            />
            Сохранять пропорции
          </label>
        </div>
        <div className="tooltip-container">
          <label>Алгоритм интерполяции:</label>
          <select value={interpolation} onChange={(e) => setInterpolation(e.target.value)}>
            <option value="nearest">Ближайший сосед</option>
          </select>
          <div className="tooltip">
            <span className="tooltip-text">
              Ближайший сосед - быстрый и простой метод, но может приводить к появлению ступенчатых краев в изображении.
            </span>
          </div>
        </div>
        
        {/* Информация о пикселях */}
        <div>
          <p>Исходное разрешение: {imageWidth}x{imageHeight} пикселей ({originalMegapixels} MP)</p>
          <p>Новое разрешение: {newWidth}x{newHeight} пикселей ({newMegapixels} MP)</p>
        </div>
        
        <div className="modal-buttons">
          <button onClick={handleResize}>Применить</button>
          <button onClick={onClose}>Отмена</button>
        </div>
      </div>
    </div>
  );
}

export default ResizeModal;