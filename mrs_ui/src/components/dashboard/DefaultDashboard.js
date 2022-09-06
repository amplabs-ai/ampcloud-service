import { useAuth0 } from '@auth0/auth0-react';
import { Button } from 'antd';
import React, { useState } from 'react'
import "antd/dist/antd.css";
import Table from "ant-responsive-table";
import Tutorial from "../tutorial/Tutorial"


const DefaultDashboard = () => {
    const [buttonText, setButtonText] = useState('Following');
    const { user, } = useAuth0();

    const handleClick = () => {
        setButtonText('Following');
    }


    const columns = [
        {
            title: 'Popular Data Publisher',
            dataIndex: 'email',
            key: "email",
            align: 'center',
            showOnResponse: true,
            showOnDesktop: true

        },
        // {
        //     title: 'Follow',
        //     dataIndex: 'follow',
        //     key: "follow",
        //     align: 'center',
        //     showOnResponse: true,
        //     showOnDesktop: true

        // },
    ];
    const data = [
        {
            key: '1',
            email: 'info@batteryarchive.org',
            // follow: <Button type="primary" onClick={() => { handleClick() }}>
            //     {buttonText}
            // </Button>,

        },
        {
            key: '2',
            email: 'data.matr.io@tri.global',
            // follow: <Button type="primary" onClick={() => { handleClick() }}>
            //     {buttonText}
            // </Button>,

        },

    ];


    let name = user.email.split('@')[0];

    return (
        <>
            <div className='container'>
                <div className='jumbotron' style={{ "paddingBottom": "10rem", "paddingTop":"5rem" }}>
                    <p className='mt-4 ms-3 display-6'>Welcome {name.charAt(0).toUpperCase() + name.slice(1)},</p>
                    <div className='text-center'>
                        <p className='fs-2 '>Explore, analyze, and share quality battery data</p>
                    </div>
                    <div className='container my-3'>
                        <div className="row justify-content-center">
                            <div className="col-md-6 p-5 bg-white shadow" >

                                <div className='text-center'>
                                    <h2 >New to AmpLabs? Try our Tutorial</h2>
                                </div>
                                <div className='d-flex justify-content-center'>
                                    <Tutorial />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='text-center mt-4' >
                        <p>Select a cell from the list on the left to view time series and cycle series information about the battery cell.</p>

                    </div>


                </div>
                <div className='container my-3'>
                    <div className="row justify-content-center">
                        <div className="col-md-6 ">

                            {/* <Table
                                antTableProps={{
                                    showHeader: true,
                                    columns: columns,
                                    dataSource: data,
                                    pagination: true
                                }}
                                mobileBreakPoint={768}
                                title={() => <h6 >Popular Data Publisher</h6>}
                                columns={columns}
                                dataSource={data}
                                onChange={onChange}
                                pagination={{ pageSize: 4 }}
                            /> */}
                        </div>
                    </div>
                </div>
            </div>
        </>

    )
}

export default DefaultDashboard