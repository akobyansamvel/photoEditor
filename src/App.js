
import { useState } from 'react';
import './App.css';


function App() {
 
  const [image, setImage] = useState();
  const [imageURL, setImageURL] = useState('/no_photo.jpg'); // Изменено здесь
  const fileReader = new FileReader();
  fileReader.onloadend = () => {
    setImageURL(fileReader.result);
  };
  const handleOnChange = (event) => {
    event.preventDefault();
    const file = event.target.files[0];
    setImage(file);
    fileReader.readAsDataURL(file);
}
  
  return (
    <div className="App">
      <header className="App-header">
        <form className='uploader'>
          <img
          src={imageURL}
          className="uploader__preview"
          alt="preview"/>
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
