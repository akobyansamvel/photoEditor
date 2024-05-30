import React from 'react';
import './pipet.css'; // Импортируем стили для компонента

// Компонент для отображения информации о цвете
const PipetteInfo = ({ colors, onClose }) => {
  // Деструктурируем объект colors для получения primary и secondary цветов
  const { primary, secondary } = colors;

  return (
    <div className="pipette-info">
      {/* Кнопка для закрытия окна */}
      <button className="close-button" onClick={onClose}>Закрыть</button>
      
      {/* Проверяем, выбран ли основной цвет */}
      {primary ? (
        <div className="color-swatch">
          {/* Отображаем образец основного цвета */}
          <div className="swatch" style={{ backgroundColor: `rgb(${primary.rgb.join(', ')})` }}></div>
          <div className="color-details">
            {/* Детали основного цвета */}
            <p>Цвет: {`rgb(${primary.rgb.join(', ')})`}</p>
            <p>Координаты: X: {primary.position.x}, Y: {primary.position.y}</p>
            <p>RGB: {primary.rgb.join(', ')}</p>
            <p>XYZ: {primary.xyz.join(', ')}</p>
            <p>Lab: {primary.lab.join(', ')}</p>
            <p>LCH: {primary.lch.join(', ')}</p>
            <p>OKLch: {primary.oklch.join(', ')}</p>
          </div>
        </div>
      ) : (
        // Сообщение, если основной цвет не выбран
        <p>Primary color not selected</p>
      )}

      {/* Проверяем, выбран ли второстепенный цвет */}
      {secondary ? (
        <div className="color-swatch secondary">
          {/* Отображаем образец второстепенного цвета */}
          <div className="swatch" style={{ backgroundColor: `rgb(${secondary.rgb.join(', ')})` }}></div>
          <div className="color-details">
            {/* Детали второстепенного цвета */}
            <p>Цвет: {`rgb(${secondary.rgb.join(', ')})`}</p>
            <p>Координаты: X: {secondary.position.x}, Y: {secondary.position.y}</p>
            <p>RGB: {secondary.rgb.join(', ')}</p>
            <p>XYZ: {secondary.xyz.join(', ')}</p>
            <p>Lab: {secondary.lab.join(', ')}</p>
            <p>LCH: {secondary.lch.join(', ')}</p>
            <p>OKLch: {secondary.oklch.join(', ')}</p>
          </div>
        </div>
      ) : (
        // Сообщение, если второстепенный цвет не выбран
        <p>Secondary color not selected</p>
      )}
    </div>
  );
};

export default PipetteInfo;
