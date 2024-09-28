import React, { useState, useRef, useEffect } from 'react';
import './styles/App.css';
import ResizeModal from './components/modal';
import Toolbar from './components/toolbar';
import PipetteInfo from './components/pipet';
import GrapModal from './components/graphModal'; 
import { rgbToXyz, rgbToLab, rgbToLch, rgbToOKLch} from './utils';
import ConvolutionFilterModal from './components/KernelModal';

function App() {
  const [image, setImage] = useState(null);
  const [imageURL, setImageURL] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [color, setColor] = useState('');
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(100);
  const [originalDimensions, setOriginalDimensions] = useState({ width: 0, height: 0 });
  const [displayedDimensions, setDisplayedDimensions] = useState({ width: 0, height: 0 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCurvesModalOpen, setIsCurvesModalOpen] = useState(false); 
  const [activeTool, setActiveTool] = useState('hand');
  const [colors, setColors] = useState({ primary: null, secondary: null });
  const [isPipetteInfoOpen, setIsPipetteInfoOpen] = useState(false);
  const [imageOffset, setImageOffset] = useState({ x: 0, y: 0 }); 
  const canvasRef = useRef(null);
  const fileReader = useRef(new FileReader());

  const FIXED_CANVAS_WIDTH = 1000; 
  const FIXED_CANVAS_HEIGHT = 600; 
  
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
  img.src = imageURL; 
  img.onload = () => {
    context.clearRect(0, 0, canvas.width, canvas.height); 
    context.imageSmoothingEnabled = false;
  
    const offsetX = (canvas.width - width) / 2;
    const offsetY = (canvas.height - height) / 2;  

    context.drawImage(img, offsetX, offsetY, width, height);
    setDisplayedDimensions({ width: width, height: height }); 
  };
};



const saveImage = () => {
  const canvas = canvasRef.current;
  
  // Создаем временный канвас с размерами отображаемого изображения
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = displayedDimensions.width;
  tempCanvas.height = displayedDimensions.height;
  const tempCtx = tempCanvas.getContext('2d');
  
  // Рисуем изображение с канваса на временный канвас
  const img = new Image();
  img.src = canvas.toDataURL(); // Используем текущее изображение из основного канваса
  img.onload = () => {
    tempCtx.drawImage(img, 0, 0, displayedDimensions.width, displayedDimensions.height);
    
    // Сохраняем изображение из временного канваса
    const link = document.createElement('a');
    link.href = tempCanvas.toDataURL();
    link.download = 'resized_image.png';
    link.click();
  };
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


  const handleKeyDown = (e) => {
    console.log('Нажата клавиша:', e.key);
  
    
    if (activeTool === 'hand') {
      const moveAmount = e.shiftKey ? 20 : e.altKey ? 1 : 10;
      let offsetX = imageOffset.x;
      let offsetY = imageOffset.y;
  
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault(); 
          offsetX -= moveAmount;
          break;
        case 'ArrowRight':
          e.preventDefault();  
          offsetX += moveAmount;
          break;
        case 'ArrowUp':
          e.preventDefault(); 
          offsetY -= moveAmount;
          break;
        case 'ArrowDown':
          e.preventDefault();  
          offsetY += moveAmount;
          break;
        default:
          return; 
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
      data[i] = lut[data[i]];       
      data[i + 1] = lut[data[i + 1]]; 
      data[i + 2] = lut[data[i + 2]]; 
    }

    ctx.putImageData(imageData, 0, 0);
  };

 // Предпросмотр коррекции кривых
const handlePreviewCurvesCorrection = (lut) => {
  applyCurvesCorrection(lut);
};

// Применение коррекции кривых
const handleCurvesApply = (lut) => {
  applyCurvesCorrection(lut);
  // Удалите следующую строку, чтобы окно оставалось открытым
  // setIsCurvesModalOpen(false);
};


  // Сброс коррекции кривых к исходному изображению
const handleCurvesReset = () => {
  const canvas = canvasRef.current;
  const ctx = canvas.getContext('2d');
  const img = new Image();
  
  img.src = imageURL;
  img.onload = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Рисуем изображение с учетом смещения и масштаба
    const scaledWidth = (img.width * scale) / 100;
    const scaledHeight = (img.height * scale) / 100;
    const drawX = imageOffset.x + (FIXED_CANVAS_WIDTH - scaledWidth) / 2;
    const drawY = imageOffset.y + (FIXED_CANVAS_HEIGHT - scaledHeight) / 2;

    ctx.drawImage(img, drawX, drawY, scaledWidth, scaledHeight);
  };
};

  const openModal = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const applyFilter = (kernel) => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height); // Extract image data from the canvas
  
      const newImageData = applyConvolutionWithPadding(imageData, kernel); // Apply the convolution filter
      ctx.putImageData(newImageData, 0, 0); // Put the filtered image data back on the canvas
      console.log('Applying filter with kernel:', kernel);
      closeModal();
    }
  };
  
  
  const applyConvolutionWithPadding = (imageData, kernel) => {
    const kernelSize = kernel.length;
    const halfKernel = Math.floor(kernelSize / 2);
  
    // Расширяем изображение перед применением свертки
    const paddedImageData = padImageEdges(imageData, halfKernel);
    const paddedWidth = paddedImageData.width;
    const paddedHeight = paddedImageData.height;
  
    const outputData = new Uint8ClampedArray(imageData.data.length);
  
    // Нормализация ядра — вычисляем сумму всех его элементов
    const kernelSum = kernel.flat().reduce((sum, value) => sum + value, 0) || 1;
  
    for (let y = 0; y < imageData.height; y++) {
      for (let x = 0; x < imageData.width; x++) {
        let r = 0, g = 0, b = 0;
  
        // Применение свертки к каждому каналу
        for (let ky = -halfKernel; ky <= halfKernel; ky++) {
          for (let kx = -halfKernel; kx <= halfKernel; kx++) {
            const pixelX = x + kx + halfKernel;
            const pixelY = y + ky + halfKernel;
            const pixelIndex = (pixelY * paddedWidth + pixelX) * 4;
            const kernelValue = kernel[ky + halfKernel][kx + halfKernel];
  
            r += paddedImageData.data[pixelIndex] * kernelValue;
            g += paddedImageData.data[pixelIndex + 1] * kernelValue;
            b += paddedImageData.data[pixelIndex + 2] * kernelValue;
          }
        }
  
        const outputIndex = (y * imageData.width + x) * 4;
  
        // Нормализуем значения и следим, чтобы они оставались в пределах от 0 до 255
        outputData[outputIndex] = Math.min(255, Math.max(0, r / kernelSum));
        outputData[outputIndex + 1] = Math.min(255, Math.max(0, g / kernelSum));
        outputData[outputIndex + 2] = Math.min(255, Math.max(0, b / kernelSum));
        outputData[outputIndex + 3] = imageData.data[outputIndex + 3]; // Альфа-канал остаётся неизменным
      }
    }
  
    return new ImageData(outputData, imageData.width, imageData.height);
  };
  
  
  const padImageEdges = (imageData, paddingSize) => {
    const width = imageData.width;
    const height = imageData.height;
    const paddedWidth = width + paddingSize * 2;
    const paddedHeight = height + paddingSize * 2;
  
    const paddedData = new Uint8ClampedArray(paddedWidth * paddedHeight * 4);
  
    for (let y = 0; y < paddedHeight; y++) {
      for (let x = 0; x < paddedWidth; x++) {
        const paddedIndex = (y * paddedWidth + x) * 4;
  
        // Координаты внутри исходного изображения
        const originalX = Math.min(width - 1, Math.max(0, x - paddingSize));
        const originalY = Math.min(height - 1, Math.max(0, y - paddingSize));
        const originalIndex = (originalY * width + originalX) * 4;
  
        // Копируем пиксельные значения (RGB + Alpha)
        paddedData[paddedIndex] = imageData.data[originalIndex];       // Red
        paddedData[paddedIndex + 1] = imageData.data[originalIndex + 1]; // Green
        paddedData[paddedIndex + 2] = imageData.data[originalIndex + 2]; // Blue
        paddedData[paddedIndex + 3] = imageData.data[originalIndex + 3]; // Alpha
      }
    }
  
    return { data: paddedData, width: paddedWidth, height: paddedHeight };
  };
  
  
  const resetFilter = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.src = imageURL; // Исходное изображение
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height); // Очищаем холст
  
      // Рассчитываем ширину и высоту изображения с учетом масштаба
      const scaledWidth = (img.width * scale) / 100; // Предположим, scale - это процент
      const scaledHeight = (img.height * scale) / 100;
  
      // Рассчитываем позицию для рисования с учетом смещения
      const drawX = imageOffset.x + (FIXED_CANVAS_WIDTH - scaledWidth) / 2;
      const drawY = imageOffset.y + (FIXED_CANVAS_HEIGHT - scaledHeight) / 2;
  
      // Рисуем изображение на холсте с учетом позиции и масштаба
      ctx.drawImage(img, drawX, drawY, scaledWidth, scaledHeight);
      console.log('Resetting filter');
    };
  };
  const applyKernelToImageData = (imageData, kernel) => {
    const width = imageData.width;
    const height = imageData.height;
    const outputData = new Uint8ClampedArray(imageData.data.length); // Создаем новый массив для выходных данных
  
    const halfKernelSize = Math.floor(kernel.length / 2);
  
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let r = 0, g = 0, b = 0; // Красный, зеленый и синий каналы
  
        // Применяем ядро
        for (let ky = -halfKernelSize; ky <= halfKernelSize; ky++) {
          for (let kx = -halfKernelSize; kx <= halfKernelSize; kx++) {
            const pixelY = Math.min(height - 1, Math.max(0, y + ky));
            const pixelX = Math.min(width - 1, Math.max(0, x + kx));
  
            const pixelIndex = (pixelY * width + pixelX) * 4; // Индекс пикселя в массиве данных
  
            const kernelValue = kernel[ky + halfKernelSize][kx + halfKernelSize]; // Значение ядра
  
            r += imageData.data[pixelIndex] * kernelValue;     // Красный
            g += imageData.data[pixelIndex + 1] * kernelValue; // Зеленый
            b += imageData.data[pixelIndex + 2] * kernelValue; // Синий
          }
        }
  
        const outputIndex = (y * width + x) * 4; // Индекс в выходных данных
        outputData[outputIndex] = Math.min(Math.max(r, 0), 255);     // Красный
        outputData[outputIndex + 1] = Math.min(Math.max(g, 0), 255); // Зеленый
        outputData[outputIndex + 2] = Math.min(Math.max(b, 0), 255); // Синий
        outputData[outputIndex + 3] = imageData.data[outputIndex + 3]; // Альфа-канал
      }
    }
  
    return new ImageData(outputData, width, height); // Возвращаем новые данные изображения
  };
  
  const handlePreviewKernel = (kernel) => {
    const canvas = canvasRef.current;
    if (!canvas) return; // Выход, если canvas не существует
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  
    const previewImageData = applyKernelToImageData(imageData, kernel);
    ctx.putImageData(previewImageData, 0, 0);
  };
  
  

  return (
    <div className="App" onKeyDown={handleKeyDown} tabIndex="0">
      <Toolbar activeTool={activeTool} onSelectTool={setActiveTool}  onOpenCurvesModal={() => setIsCurvesModalOpen(true)} openModal= {openModal} />
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
          <button className='size_button' onClick={() => setIsModalOpen(true)}>Изменить размер</button>
          <button className='save_button' onClick={saveImage}>Сохранить</button>
        </div>
      </div>
      {showModal && (
        <ConvolutionFilterModal
          onClose={closeModal}
          onApply={applyFilter}
          onReset={resetFilter}
          onPreview={handlePreviewKernel}
          imageData={null} // передайте imageData, если необходимо
        />
      )}
      <ResizeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        imageWidth={originalDimensions.width}
        imageHeight={originalDimensions.height}
        onResize={resizeImage}
      />
      <GrapModal
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
