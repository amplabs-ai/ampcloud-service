import React, {useEffect, useState} from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Plot from 'react-plotly.js'
import "./Edit.css"
import { render } from 'less';



function Edit() {
    const location = useLocation();
    const [inputField , setInputField] = useState({
        cell_id: location.state.cell_id,
        anode: location.state.anode,
        cathode: location.state.cathode,
        source:location.state.source,
        form_factor:location.state.form_factor,
        ah:  location.state.ah
    })
    const [cell_data, setCellData] = useState([])
    const [readyplot, setReady] = useState(false)

    const [v_data, setVData] = useState([])
    const [t_data, setTData] = useState([])


    useEffect(() => {
      const fetchData = async () => {
        // get the data from the api
        console.log("async")
        const data = await fetch(`http://143.198.98.214:4000/cells/${location.state.cell_id}/tests/cycle/ts`);
        // convert the data to json
        const json = await data.json();

        setCellData(json);

      }
      fetchData()
      // fetchData().then(setReady(true)).catch(console.error);;

    }, []);

    useEffect(() => {
      plot()
      setVData(v)
      setTData(time)
      // fetchData().then(setReady(true)).catch(console.error);;

    }, [cell_data]);


    let time = [];
    let v = [];
    let a = []

    function plot() {
      console.log("plot");

      cell_data.forEach((cell_ind)=>v.push(cell_ind["v"]))
      cell_data.forEach((cell_ind)=>time.push(cell_ind["test_time"]))
      console.log(time)
      console.log(v)

    }

    const inputsHandler = e => {
        const {name, value} = e.target;
        setInputField(prevState => ({
          ...prevState,
          [name]: value
        }));
      };


    const navigate = useNavigate();

    const SubmitButton = () =>{
        let anode = inputField.anode
        let cathode = inputField.cathode
        let source = inputField.source
        let form_factor = inputField.form_factor
        let ah = inputField.ah
        let cell_id = location.state.cell_id



        fetch('http://34.102.57.101:3001/cell/'+ cell_id, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ anode, cathode, source, form_factor, ah }),
          })
            .then(response => {
              return response.text();
            })
            .catch(function (error) {
              console.warn(error);
            }).finally(function () {
              console.log("edited")
          });
          navigate('/');

    }

    return (
        <div>

        <div className='edit'> <h2>Edit Cell Metdata</h2></div>
        <div className="form">
            <input
        className='edit-form'
        type="text"
        name="cell_id"
        onChange={inputsHandler}
        placeholder="Cell ID"
        value={inputField.cell_id}/>

        <br/>

        <input
        className='edit-form'
        type="text"
        name="anode"
        onChange={inputsHandler}
        placeholder="Anode"
        value={inputField.anode}/>

        <br/>

        <input
        className='edit-form'
        type="gmail"
        name="cathode"
        onChange={inputsHandler}
        placeholder="Cathode"
        value={inputField.cathode}/>

        <br/>

        <input
        className='edit-form'
        type="gmail"
        name="source"
        onChange={inputsHandler}
        placeholder="Source"
        value={inputField.source}/>

        <br/>

        <input
        className='edit-form'
        type="gmail"
        name="form_factor"
        onChange={inputsHandler}
        placeholder="Form Factor"
        value={inputField.form_factor}/>

        <br/>

        <input
        className='edit-form'
        type="gmail"
        name="ah"
        onChange={inputsHandler}
        placeholder="Amperage"
        value={inputField.ah}/>

        <br/>


        <button onClick={SubmitButton} className='submit-edit'>Submit Now</button>

        </div>


        {t_data.length!==0 &&
          <div className="plot">
            <Plot
              data={[
                {
                  x: t_data,
                  y: v_data,
                //   type: "scattergl",
                //   mode: "lines+markers",
                //   marker: {
                //     line: {
                //       width: 1,
                //       color: "#404040"
                //     }
                //   }
                }
              ]}
              layout={ {width: 600, height: 500, title: 'Voltage', xaxis:{title:"Time (s)"}, yaxis:{title:"Voltage (V)"}} }
            />
          </div>
        }
    </div>
    )


}

export default Edit;