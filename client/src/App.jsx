import { useState } from 'react';
import './App.css';

function App() {
  const [inputData, setInputData] = useState('');
  const [forecast, setForecast] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Convert comma-separated string to array of numbers
      const timeSeriesData = inputData.split(',').map(num => parseFloat(num.trim()));
      
      const response = await fetch('http://localhost:5000/api/forecast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ timeSeriesData }),
      });

      const data = await response.json();
      setForecast(data.forecast);
      setError('');
    } catch (err) {
      setError('Error processing forecast');
      console.error(err);
    }
  };

  return (
    <div className="App">
      <h1>Time Series Forecaster</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="timeSeriesInput">Enter time series data (comma-separated numbers):</label>
          <textarea
            id="timeSeriesInput"
            value={inputData}
            onChange={(e) => setInputData(e.target.value)}
            placeholder="1, 2, 3, 4, 5"
          />
        </div>
        <button type="submit">Generate Forecast</button>
      </form>
      
      {error && <p className="error">{error}</p>}
      {forecast !== null && (
        <div className="result">
          <h2>Forecast Result:</h2>
          <p>{forecast}</p>
        </div>
      )}
    </div>
  );
}

export default App; 