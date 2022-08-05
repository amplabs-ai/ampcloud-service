import { useAuth0 } from '@auth0/auth0-react';
import { Button, Table } from 'antd';
import React, { useState } from 'react'


const DefaultDashboard = () => {
    const [buttonText, setButtonText] = useState('Following');
    const { user, } = useAuth0();

    const handleClick = () => {
        setButtonText('Following');
    }


    const columns = [
        {
            title: 'Email',
            dataIndex: 'email',
            align: "center",
            key: "email",
            width: "60%",
        },
        {
            title: 'Follow',
            dataIndex: 'follow',
            align: "center",
            key: "follow",
            width: "40%",

        },
    ];
    const data = [
        {
            key: '1',
            email: 'info@batteryarchive.org',
            follow: <Button type="primary" onClick={() => { handleClick() }}>
                {buttonText}
            </Button>,

        },
        {
            key: '2',
            email: 'data.matr.io@tri.global',
            follow: <Button type="primary" onClick={() => { handleClick() }}>
                {buttonText}
            </Button>,

        },

    ];

    const onChange = (pagination, filters, extra) => {
        console.log('params', pagination, filters, extra);
    };

    let name = user.email.split('@')[0];

    return (
        <>
            <div className='container'>
                <div className='jumbotron py-1 pb-2'  >
                    <p className='mt-3 ms-3 display-6'>Welcome {name.charAt(0).toUpperCase() + name.slice(1)},</p>
                    <div className='text-center'>
                        <p className='fs-2'>Explore, analyze, and share quality battery data</p>
                    </div>
                    <div className='d-flex justify-content-center'>
                        <p >Navigate to -
                            <ul >
                                <li><b>API</b> to view AmpLab's Open API</li>
                                <li><b>Examples</b> to see examples contributed by the AmpLabs Community</li>
                                <li><b>CSV Viewer </b>to explore a csv file before uploading into AmpLabs</li>
                                <li><b>Upload</b> to add new data into the AmpLabs database</li>
                                <li><b>Data</b> to view data you have access to via the AmpLabs dashboard</li>
                            </ul>
                        </p>
                    </div>
                    <div className='text-center'>
                        <q >Select a cell from the list on the left to view time series and cycle series information about the battery cell.</q>

                    </div>


                </div>
                <div className='container my-3'>
                    <div className="row justify-content-end">
                        <div className="col-md-6">
                            <Table
                                title={() => <h6 >Follow Popular Data Publisher</h6>}
                                columns={columns}
                                dataSource={data}
                                onChange={onChange}
                                pagination={{ pageSize: 4 }}

                            />
                        </div>
                        <div className='col-md-3'></div>

                    </div>

                </div>





            </div>






        </>

    )
}

export default DefaultDashboard