import React, { useEffect, useState } from 'react';
import icon from '../../../../assets/icon.svg';

export default function Hello() {
  const [text, changeText] = useState('init');
  window.electron.ipcRenderer.on('ipc-example', (args: any) => {
    console.log('example', args);
    changeText(String(args));
  });
  // useEffect(() => {

  // }, []);

  return (
    <div>
      <div className="Hello">
        <img width="200px" alt="icon" src={icon} />
      </div>
      <h1>electron-react-boilerplate</h1>
      <div className="Hello">
        <a
          href="https://electron-react-boilerplate.js.org/"
          target="_blank"
          rel="noreferrer"
        >
          <button type="button">
            <span role="img" aria-label="books">
              📚
            </span>
            Read our docs {text}
          </button>
        </a>
        <a
          href="https://github.com/sponsors/electron-react-boilerplate"
          target="_blank"
          rel="noreferrer"
        >
          <button type="button">
            <span role="img" aria-label="books">
              🙏
            </span>
            Donate
          </button>
        </a>
      </div>
    </div>
  );
}
