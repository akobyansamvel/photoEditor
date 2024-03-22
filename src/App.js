import { useState, useRef, useEffect } from 'react';
import './App.css';

function App() {
  const [image, setImage] = useState();
  const [imageURL, setImageURL] = useState('');
  const [color, setColor] = useState(''); 
  const [position, setPosition] = useState({x:0,y:0});
  const fileReader = new FileReader();
  const canvasRef = useRef(null); 
  const [imageWidth, setImageWidth] = useState(0);
  const [imageHeight, setImageHeight] = useState(0);


  fileReader.onloadend = () => {
    setImageURL(fileReader.result);
  };

  const handleOnChange = (event) => {
    event.preventDefault();
    const file = event.target.files[0];
    setImage(file);
    fileReader.readAsDataURL(file);
  };

  const updatePosition = (e) => {
    const { offsetX, offsetY } = e.nativeEvent;
    setPosition({ x: offsetX, y: offsetY });
  };
 
  
  const updateColor = (e) => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    const { offsetX, offsetY } = e.nativeEvent;
    const [r, g, b] = ctx.getImageData(offsetX, offsetY, 1, 1).data;  
    setColor(`rgb(${r}, ${g}, ${b})`);
  };
  const handleMouseMove = (e) => {
    updateColor(e);
    updatePosition(e);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageURL) return;
    const context = canvas.getContext('2d');
    const image = new Image();
    image.src = imageURL;
    image.onload = () => {
      canvas.width = image.width;
      canvas.height = image.height;
      context.drawImage(image, 0, 0);
      setImageWidth(image.width); // Установка ширины изображения
      setImageHeight(image.height); // Установка высоты изображения
    };
    image.onerror = () => {
      alert('Ошибка при загрузке изображения. Проверьте URL.');
    };
  }, [imageURL]);
  
  

  return (
    <div className='App'>
    <div className='uploader'>
      {image && (
        <div className='color-info'>
            <div className='image-size'>
              Размер изображения: <br />
              Ширина: {imageWidth}px, <br />
              Высота: {imageHeight}px
                </div>
        <div>Координаты: <br />X: {position.x}px, <br /> Y: {position.y}px</div>
        <div className='color'>Цвет: <br /> {color}</div>
        <div style={{ backgroundColor: color, width: 150, height: 30, marginTop: 10 }}></div>
      </div>
      )}
         <div className='test'>
         <canvas
            ref={canvasRef}
            onMouseMove={handleMouseMove}
            className='uploader__canvas'>
            </canvas>
            <div >{image ? image.name : ""}</div>
       <div className='load'>
       <label
            htmlFor="loader-button"
            className="uploader__button">
              Загрузить файл
            </label>
            <input
              id="loader-button"
              type="file"
              className="uploader__upload-button"
              onChange={handleOnChange}/>
        <div className="url-uploader">
          <input
            type="text"
            placeholder="Введите URL изображения"
            onChange={(e) => setImageURL(e.target.value)} 
            className="url-input"/>
        </div>
       </div>
         </div>
          </div>

     
    </div>
  );
}

export default App;
