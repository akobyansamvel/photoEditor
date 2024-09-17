import React, { useState, useRef, useEffect } from 'react';
import './App.css';
import ResizeModal from './modal';
import Toolbar from './toolbar';
import PipetteInfo from './pipet';
import CurvesModal from './CurvesModal'; // Импорт компонента CurvesModal
import { rgbToXyz, rgbToLab, rgbToLch, rgbToOKLch, calculateContrast, calculateAPCA } from './utils';

function App() {
  // Состояния для управления приложением
  const [image, setImage] = useState(null);
  const [imageURL, setImageURL] = useState('');
  const [color, setColor] = useState('');
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(100);
  const [originalDimensions, setOriginalDimensions] = useState({ width: 0, height: 0 });
  const [displayedDimensions, setDisplayedDimensions] = useState({ width: 0, height: 0 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCurvesModalOpen, setIsCurvesModalOpen] = useState(false); // Состояние для CurvesModal
  const [activeTool, setActiveTool] = useState('hand');
  const [colors, setColors] = useState({ primary: null, secondary: null });
  const [isPipetteInfoOpen, setIsPipetteInfoOpen] = useState(false);
  const [imageOffset, setImageOffset] = useState({ x: 0, y: 0 }); // Offset for image movement
  const canvasRef = useRef(null);
  const fileReader = useRef(new FileReader());

  const FIXED_CANVAS_WIDTH = 800; // Set the desired width of the canvas
  const FIXED_CANVAS_HEIGHT = 600; // Set the desired height of the canvas

  // Обработчик события загрузки файла FileReader
  fileReader.current.onloadend = () => {
    setImageURL(fileReader.current.result);
  };

  // Обработка изменения файла ввода
  const handleOnChange = (event) => {
    event.preventDefault();
    const file = event.target.files[0];
    setImage(file);
    fileReader.current.readAsDataURL(file);
  };

  // Обновление позиции курсора на холсте
  const updatePosition = (e) => {
    const { offsetX, offsetY } = e.nativeEvent;
    setPosition({ x: offsetX, y: offsetY });
  };

  // Обновление цвета на основе пикселя холста
  const updateColor = (e) => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    const { offsetX, offsetY } = e.nativeEvent;
    const [r, g, b] = ctx.getImageData(offsetX, offsetY, 1, 1).data;
    setColor(`rgb(${r}, ${g}, ${b})`);
  };

  // Обработчик движения мыши для инструмента пипетки
  const handleMouseMove = (e) => {
    if (activeTool === 'pipette') {
      updateColor(e);
      updatePosition(e);
    }
  };

  // Обработчик кликов на холсте для инструмента пипетки
  const handleCanvasClick = (e) => {
    if (activeTool !== 'pipette') return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const { offsetX, offsetY } = e.nativeEvent;
    const [r, g, b] = ctx.getImageData(offsetX, offsetY, 1, 1).data;
    const color = {
      rgb: [r, g, b],
      position: { x: offsetX, y: offsetY },
      xyz: rgbToXyz([r, g, b]),
      lab: rgbToLab([r, g, b]),
      lch: rgbToLch([r, g, b]),
      oklch: rgbToOKLch([r, g, b])
    };

    if (e.altKey || e.ctrlKey || e.shiftKey) {
      setColors({ ...colors, secondary: color });
    } else {
      setColors({ ...colors, primary: color });
    }

    setIsPipetteInfoOpen(true);
  };

  // Рисование изображения на холсте
  const drawImage = (img, scale, offsetX = 0, offsetY = 0) => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    const scaledWidth = (img.width * scale) / 100;
    const scaledHeight = (img.height * scale) / 100;

    const drawX = offsetX + (FIXED_CANVAS_WIDTH - scaledWidth) / 2;
    const drawY = offsetY + (FIXED_CANVAS_HEIGHT - scaledHeight) / 2;

    context.clearRect(0, 0, FIXED_CANVAS_WIDTH, FIXED_CANVAS_HEIGHT);
    context.drawImage(img, drawX, drawY, scaledWidth, scaledHeight);

    setDisplayedDimensions({ width: Math.round(scaledWidth), height: Math.round(scaledHeight) });
  };

// Изменение размера изображения
const resizeImage = ({ width, height }) => {
  const canvas = canvasRef.current;
  const context = canvas.getContext('2d');
  const img = new Image();
  img.src = imageURL; // Используем текущий imageURL для загрузки изображения
  img.onload = () => {
    context.clearRect(0, 0, canvas.width, canvas.height); // Очищаем холст перед рисованием
    context.imageSmoothingEnabled = false;
    
    // Рассчитываем позиции для центрирования изображения внутри холста
    const offsetX = (canvas.width - width) / 2;
    const offsetY = (canvas.height - height) / 2;
    
    // Рисуем изображение на холсте по новым размерам, центрированное
    context.drawImage(img, offsetX, offsetY, width, height);
    
    setDisplayedDimensions({ width: width, height: height }); // Обновляем состояние с новыми размерами
  };
};



  // Сохранение изображения в локальный файл
  const saveImage = () => {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.href = canvas.toDataURL();
    link.download = 'resized_image.png';
    link.click();
  };
  const drawImageWithOriginalSize = (image, offsetX = 0, offsetY = 0, scale = 100) => {
  const canvas = canvasRef.current;
  const context = canvas.getContext('2d');

  // Очищаем холст перед отрисовкой
  context.clearRect(0, 0, canvas.width, canvas.height);

  const scaledWidth = (image.width * scale) / 100;
  const scaledHeight = (image.height * scale) / 100;

  // Рассчитываем новую позицию для отрисовки с учётом смещения
  const drawX = offsetX;
  const drawY = offsetY;

  // Ограничиваем отображение изображением рамками канваса
  context.drawImage(image, drawX, drawY, scaledWidth, scaledHeight);

  setDisplayedDimensions({ width: scaledWidth, height: scaledHeight });
};


  // Эффект для загрузки и рисования изображения на холсте
  useEffect(() => {
    if (!imageURL) return;
    const img = new Image();
    img.src = imageURL;
    img.onload = () => {
      setOriginalDimensions({ width: img.width, height: img.height });
      setDisplayedDimensions({ width: img.width, height: img.height });
      drawImage(img, scale, imageOffset.x, imageOffset.y);
    };
    img.onerror = () => {
      alert('Ошибка при загрузке изображения. Проверьте URL.');
    };
  }, [imageURL, scale, imageOffset]);

  // Обработчик события нажатия клавиши для навигации по холсту
  const handleKeyDown = (e) => {
    console.log('Нажата клавиша:', e.key);
  
    // Если активен инструмент "рука", предотвращаем стандартное поведение (например, прокрутку)
    if (activeTool === 'hand') {
      const moveAmount = e.shiftKey ? 20 : e.altKey ? 1 : 10;
      let offsetX = imageOffset.x;
      let offsetY = imageOffset.y;
  
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();  // Останавливаем прокрутку
          offsetX -= moveAmount;
          break;
        case 'ArrowRight':
          e.preventDefault();  // Останавливаем прокрутку
          offsetX += moveAmount;
          break;
        case 'ArrowUp':
          e.preventDefault();  // Останавливаем прокрутку
          offsetY -= moveAmount;
          break;
        case 'ArrowDown':
          e.preventDefault();  // Останавливаем прокрутку
          offsetY += moveAmount;
          break;
        default:
          return; // Do nothing for other keys
      }
  
      setImageOffset({ x: offsetX, y: offsetY });
    }
  };
  

  // Применение коррекции кривых с использованием LUT
  const applyCurvesCorrection = (lut) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      data[i] = lut[data[i]];       // Красный
      data[i + 1] = lut[data[i + 1]]; // Зеленый
      data[i + 2] = lut[data[i + 2]]; // Синий
    }

    ctx.putImageData(imageData, 0, 0);
  };

  // Предпросмотр коррекции кривых
  const handlePreviewCurvesCorrection = (lut) => {
    applyCurvesCorrection(lut);
  };

  // Применение и закрытие коррекции кривых
  const handleCurvesApply = (lut) => {
    applyCurvesCorrection(lut);
    setIsCurvesModalOpen(false);
  };

  // Сброс коррекции кривых к исходному изображению
  const handleCurvesReset = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = imageURL;
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
  };

  return (
    <div className="App" onKeyDown={handleKeyDown} tabIndex="0">
      <Toolbar activeTool={activeTool} onSelectTool={setActiveTool} onOpenCurvesModal={() => setIsCurvesModalOpen(true)} />
      <div className="uploader">
        {image && (
          <div className="color-info">
            <div className="image-size">
              Размер изображения: <br />
              Ширина: {displayedDimensions.width}px <br />
              Высота: {displayedDimensions.height}px
            </div>
            <div>Координаты: <br />X: {position.x}px, <br /> Y: {position.y}px</div>
            <div className="color">Цвет: <br /> {color}</div>   
            <div style={{ backgroundColor: color, width: 150, height: 30, marginTop: 10 }}></div>
          </div>
        )}
        <div className="test">
          <canvas
            ref={canvasRef}
            width={FIXED_CANVAS_WIDTH}
            height={FIXED_CANVAS_HEIGHT}
            onMouseMove={handleMouseMove}
            onClick={handleCanvasClick}
            className="uploader__canvas"
          ></canvas>
          <div>{image ? image.name : ''}</div>
          <div className="load">
            <label htmlFor="loader-button" className="uploader__button">
              Загрузить файл
            </label>
            <input
              id="loader-button"
              type="file"
              className="uploader__upload-button"
              onChange={handleOnChange}
            />
            <div className="url-uploader">
              <input
                type="text"
                placeholder="Введите URL изображения"
                onChange={(e) => setImageURL(e.target.value)}
                className="url-input"
              />
              <button className="url-button" onClick={() => fileReader.current.readAsDataURL(image)}>загрузить</button>
            </div>
          </div>
          <div className="scale-selector">
            <label htmlFor="scale">Масштаб:</label>
           <input
            id="scale"
            type="range"
            min="12"
            max="300"
            value={scale}
            step="1"
            onChange={(e) => setScale(e.target.value)}
            style={{ width: '100%' }}
          />
            <span>{scale}%</span>
          </div>
          <button onClick={() => setIsModalOpen(true)}>Изменить размер</button>
          <button onClick={saveImage}>Сохранить</button>
        </div>
      </div>
      <ResizeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        imageWidth={originalDimensions.width}
        imageHeight={originalDimensions.height}
        onResize={resizeImage}
      />
      <CurvesModal
        isOpen={isCurvesModalOpen}
        onClose={() => setIsCurvesModalOpen(false)}
        onApply={handleCurvesApply}
        onReset={handleCurvesReset}
        onPreview={handlePreviewCurvesCorrection}
      />
      {isPipetteInfoOpen && (
        <PipetteInfo colors={colors} onClose={() => setIsPipetteInfoOpen(false)} />
      )}
    </div>
  );
}

export default App;
