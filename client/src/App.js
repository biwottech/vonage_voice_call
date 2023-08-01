import React, { useState } from "react";
import * as XLSX from "xlsx";
import axios from "axios";
import "./App.css";

function App() {
  // onchange states
  const [excelFile, setExcelFile] = useState(null);
  const [typeError, setTypeError] = useState(null);

  // submit state
  const [excelData, setExceldata] = useState(null);

  // submit action
  const handleSubmit = (e) => {
    e.preventDefault();
    if (excelFile != null) {
      const workbook = XLSX.read(excelFile, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(sheet);
      setExceldata(data); // display data
      makeCalls();
    }
  };

  async function getCallStatus(call_uuid) {
    // hit call status endpoint
    const response = await axios.get("/call-status", {
      params: {
        call_uuid,
      },
    });

    return response.data;
  }

  async function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function makeCalls() {
    // we want to call each of the records in the excel sheet
    // but we want to wait for each call to finish before we call the next one
    for (let record of excelData) {
      // call the record
      // wait for it to finish
      // then make the next call
      await axios.post("/call", record);
      let callStatus = await getCallStatus(record.call_uuid);
      while (callStatus.status !== "completed") {
        // wait for 3 seconds
        await sleep(3000);
        callStatus = await getCallStatus(record.call_uuid);
      }
    }
  }

  // onchange event
  const handleFile = (e) => {
    let selectedFile = e.target.files[0];
    let fileType = [
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/csv",
    ];
    if (selectedFile) {
      if (selectedFile.type) {
        if (fileType.includes(selectedFile.type)) {
          setExcelFile(selectedFile);
          setTypeError(null);

          let reader = new FileReader();
          reader.readAsArrayBuffer(selectedFile);
          reader.onload = (e) => {
            setExcelFile(e.target.result);
          };
        } else {
          setExcelFile(null);
          setTypeError("Please select valid excel sheet");
        }
      }
    } else {
      console.log("Please select your file");
    }
  };

  return (
    <div className="App">
      <div className="container">
        <div className="row">
          <div className="col-sm-12 col-md-12 col-lg-12">
            <div className="card mt-30">
              <div className="card-header">
                <h3>Upload & View Excel Sheets</h3>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-sm-12 col-md-12 col-lg-12">
                    <form
                      className="row gx-3 gy-2 align-items-center"
                      onSubmit={handleSubmit}
                      encType="multipart/form-data"
                    >
                      <div className="col-sm-3">
                        <label className="visually-hidden" htmlFor="specificSizeInputGroupUsername">
                          Upload Excel Sheet
                        </label>
                        <div className="input-group">
                          <div className="input-group-text">@</div>
                          <input type="file" id="file" className="form-control" required onChange={handleFile} />
                        </div>
                      </div>
                      <div className="col-auto">
                        <button type="submit" className="btn btn-primary">
                          Submit
                        </button>
                      </div>
                      {
                        /* error */
                        typeError && (
                          <div className="alert alert-danger" role="alert">
                            {typeError}
                          </div>
                        )
                      }
                    </form>
                  </div>
                </div>
              </div>
              <div className="card-body">
                {/* view data  */}
                <div className="view-data">
                  <h3>View Data</h3>
                  {excelData ? (
                    <div className="table-responsive">
                      <h3>Excel Sheet Data</h3>
                      <table className="table table-bordered">
                        <thead>
                          <tr>
                            {Object.keys(excelData[0]).map((key) => (
                              <th key={key}>{key} </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {excelData.map((individualExcelData, index) => (
                            <tr key={index}>
                              {Object.keys(individualExcelData).map((key) => (
                                <td key={key}>
                                  {" "}
                                  {key} {individualExcelData[key]}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <h2>No data found</h2>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
