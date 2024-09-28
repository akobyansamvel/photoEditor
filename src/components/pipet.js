import React from 'react';
import '../styles/pipet.css'; 
import { calculateContrast } from '../utils'
// Компонент для отображения информации о цвете
const PipetteInfo = ({ colors, onClose }) => {
  const { primary, secondary } = colors;

  const formatValue = (value) => {
    return Array.isArray(value) 
      ? value.map((v) => v.toFixed(3)) 
      : value.toFixed(3);
  };

  const contrast = primary && secondary ? calculateContrast(primary, secondary).toFixed(3) : null;

  return (
    <div className="pipette-info">
      <button className="close-button" onClick={onClose}>Закрыть</button>
      
      {primary ? (
        <div className="color-swatch">
          <div className="swatch" style={{ backgroundColor: `rgb(${primary.rgb.join(', ')})` }}></div>
          <div className="color-details">
            <p>Цвет: {`rgb(${primary.rgb.join(', ')})`}</p>
            <p>Координаты: X: {primary.position.x}, Y: {primary.position.y}</p>
            <p>RGB: {primary.rgb.join(', ')}</p>
            <p>XYZ: {formatValue(primary.xyz).join(', ')}</p>
            <p>Lab: {formatValue(primary.lab).join(', ')}</p>
            <p>LCH: {formatValue(primary.lch).join(', ')}</p>
            <p>OKLch: {formatValue(primary.oklch).join(', ')}</p>
          </div>
        </div>
      ) : (
        <p>Primary color not selected</p>
      )}

      {secondary ? (
        <div className="color-swatch secondary">
          <div className="swatch" style={{ backgroundColor: `rgb(${secondary.rgb.join(', ')})` }}></div>
          <div className="color-details">
            <p>Цвет: {`rgb(${secondary.rgb.join(', ')})`}</p>
            <p>Координаты: X: {secondary.position.x}, Y: {secondary.position.y}</p>
            <p>RGB: {secondary.rgb.join(', ')}</p>
            <p>XYZ: {formatValue(secondary.xyz).join(', ')}</p>
            <p>Lab: {formatValue(secondary.lab).join(', ')}</p>
            <p>LCH: {formatValue(secondary.lch).join(', ')}</p>
            <p>OKLch: {formatValue(secondary.oklch).join(', ')}</p>
          </div>
        </div>
      ) : (
        <p>Secondary color not selected</p>
      )}

      {primary && secondary && (
        <div>
          <p>Контрастное соотношение: {contrast}</p>
        </div>
      )}
    </div>
  );
};

export default PipetteInfo;
