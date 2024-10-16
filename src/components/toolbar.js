import React from 'react';
import '../styles/App.css';

function Toolbar({ activeTool, onSelectTool, onOpenCurvesModal, openModal }) {
  return (
    <div className="toolbar">
      <button
        className={activeTool === 'hand' ? 'active' : ''}
        onClick={() => onSelectTool('hand')}
        title="Рука (Перемещение изображения) [H]"
      >
        &#x1f590;
      </button>
      <button
        className={activeTool === 'pipette' ? 'active' : ''}
        onClick={() => onSelectTool('pipette')}
        title="Пипетка (Выбор цвета) [P]"
      >
        🖌
      </button>
      <button
        className="curves-button"
        onClick={onOpenCurvesModal}
        title="Кривые (Градационная коррекция) [C]"
      >
        Кривые
      </button>
      <button onClick={openModal}>Open Convolution Filter</button>

    </div>
  );
}

export default Toolbar;
