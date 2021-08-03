import { useState } from "react";
import Papa from "papaparse";
import axios from 'axios';
import { CSVLink } from 'react-csv';

const FileInput = () => {
  const [file, setFile] = useState();
  const [cleaned, setCleaned] = useState([]);

  const config = {
    header: true,
    complete: function (results, file) {
      const newResults = results.data.map((result, index) => {
        if (index > 0 && index < results.data.length - 1) {
          const parsedName = result.Name.split(" - ");
          const flavor = parsedName[1];
          const size = parsedName[2];
          const concentration = parsedName[3];
          return {
            brand: result.Brand,
            flavor: flavor,
            size: size,
            nicotine: concentration,
          };
        }
        return
      });
      console.log(newResults);
      // post newResults
      axios.post(`${process.env.REACT_APP_API_URL}/data/submit`, newResults).then(response => {
        console.log("success on the front end", response)
      }).catch(error => {
        console.log(error)
      })
    },
  };

  const parseToJSON = (file) => {
    Papa.parse(file, config);
  };

  const handleSelection = (e) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (file) parseToJSON(file);
  };

  const handleClean = (e) => {
    e.preventDefault();
    axios.get(`${process.env.REACT_APP_API_URL}/data/cleaning`)
    .then(response => {
      console.log(response)
    })
    .catch(error => {
      console.log(error)
    })
  }

  const handleRequest = (e) => {
    e.preventDefault();
    axios.get(`${process.env.REACT_APP_API_URL}/data/getcleaned`)
    .then(response => {
      setCleaned(response.data)
      console.log(cleaned)
    })
    .catch(error => {
      console.log(error)
    })
  }

  const handleReset = (e) =>{
    e.preventDefault();
    axios.delete(`${process.env.REACT_APP_API_URL}/data/clear`)
    .then(response => {
      console.log(response)
    })
    .catch(error => {
      console.log(error)
    })
  }

  const handleDownload = (e) => {
    e.preventDefault()
    
    const newData = Papa.unparse(cleaned)
    console.log("🚀 ~ file: FileInput.tsx ~ line 101 ~ handleDownload ~ newData", newData)
  }

  return (
    <>
    <form onSubmit={onSubmit}>
      <label>
        Select Import File
        <input
          name="file"
          type="file"
          accept=".xls, .xlsx, .csv"
          onChange={handleSelection}
        />
      </label>
      <button type="submit">Submit</button>
    </form>
    <button onClick={handleClean}>Clean CSV</button>
    <button onClick={handleRequest}>Request Cleaned CSV</button>
    <button onClick={handleDownload}>Download Cleaned CSV</button>
    <span onClick={handleReset}><CSVLink data={cleaned}>Download</CSVLink></span>
    </>
  );
};

export default FileInput;
