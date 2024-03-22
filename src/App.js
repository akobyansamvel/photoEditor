import { useState, useRef, useEffect } from 'react';
import './App.css';

function App() {
  const [image, setImage] = useState();
  const [imageURL, setImageURL] = useState('');
  const [color, setColor] = useState(''); 
  const [position, setPosition] = useState({x:0,y:0});
  const fileReader = new FileReader();
  const canvasRef = useRef(null); 

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
    };
    image.onerror = () => {
      alert('Ошибка при загрузке изображения. Проверьте URL.');
    };
  }, [imageURL]);
  

  return (
    <div className="App">
        <div className='uploader'>
          <canvas
            ref={canvasRef}
            onMouseMove={handleMouseMove}
            className='uploader__canvas'
          ></canvas>
        <div className='color-info'> 
        <div>Координаты: X: {position.x}px, Y: {position.y}px</div>
          <div className='color'>Цвет: {color}
            <div style={{ backgroundColor: color,width:30, height:30,marginLeft:10}}><br/> </div>
          </div>
          <div >{image ? image.name : ""}</div>
        </div>
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
        </div>
        <div className="url-uploader">
          <input
            type="text"
            placeholder="Введите URL изображения"
            onChange={(e) => setImageURL(e.target.value)} 
            className="url-input"/>
        </div>
    </div>
  );
}

export default App;
