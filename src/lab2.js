import { useState, useRef, useEffect } from 'react';
import './App.css';

function App() {
  const [image, setImage] = useState();
  const [imageURL, setImageURL] = useState('/no_photo.jpg');
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
    const context = canvas.getContext('2d');
    const image = new Image();
    image.src = imageURL;
    image.onload = () => {
      canvas.width = image.width;
      canvas.height = image.height;
      context.drawImage(image, 0, 0);
    };
  }, [imageURL]);

  return (
    <div className="App">
      <header className="App-header">
        <form className='uploader'>
          <canvas
            ref={canvasRef}
            onMouseMove={handleMouseMove}
            style={{ display: 'block', width: '500px', maxHeight: '500px' }}
          ></canvas>
         <div>Position: X: {position.x}, Y: {position.y}</div>
         <div style={{ backgroundColor: color }}>Текущий цвет: {color}</div>
          <div className="uploader__file-name">{image ? image.name : ""}</div>
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
        </form>
      </header>
    </div>
  );
}

export default App;
