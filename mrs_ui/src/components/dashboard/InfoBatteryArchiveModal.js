import Button from 'antd/es/button';
import Modal from 'antd/es/modal';
import React, { useState } from 'react';
import InfoCircleOutlined from '@ant-design/icons/InfoCircleOutlined';
import { Link } from "react-router-dom";


const InfoBatteryArchiveModal = () => {
    const [isModalVisible, setIsModalVisible] = useState(false);


    return (
        <>
            Battery-Archive
            <Button className='ml-2 p-0' type='text' size='small' onClick={() => setIsModalVisible(true)} icon={<InfoCircleOutlined />} />

            <Modal
                centered
                visible={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
                width="fit-content"
                maskClosable={false}
                bodyStyle={{
                    padding: "15px",
                    margin: "85px 10px",
                }}
            >

                <div className='container text-justify' style={{ textAlign: 'justify' }}>
                    <span className='display-5 fw-lighter '>Studies</span>
                    <p >We launched Battery Archive to provide battery data and metadata in a standard format that simplifies data comparison. The data shared on this site has been uploaded with permission from the institution that generated it. The data is converted in a standard format at upload, and typical statistical quantities are calculated if they were missing from the original dataset. We encourage the following code of conduct for the use of the data and site.</p>
                    <ul >
                        <li>Use of any data featured on this site for publication purposes should include references to the article that describes the experiments conducted for generating the data.</li>
                        <li>Individual groups may have additional guidelines for the use of their data. In such cases, we link to the group’s website for these policies.</li>
                        <li>Please cite www.batteryarchive.org as the source from where the data was downloaded.</li>
                        <li>Send us a reference to work that uses the data, and we will add it to our publication list.</li>
                    </ul>
                    <h4>Underwriters Laboratories Inc. – Purdue University (UL-PUR)</h4>
                    <p >The dataset used in the publication <Link to="/" onClick={() => { window.open("https://iopscience.iop.org/article/10.1149/1945-7111/abc8c0/meta") }}>"Degradation-Safety Analytics in Lithium-Ion Cells: Part I. Aging Under Charge/Discharge Cycling"</Link> consists of 21 commercial 18650 cells with a graphite negative electrode and an NCA positive electrode. The cells were cycled at 0.5C at 2.7-4.2V (0-100% SOC) or 2.9-4.0V (2.5-96.5% SOC, when the cells are fresh) at room temperature to various levels of capacity fade (10%, 15% and 20%). For the full details of the study and policies for data reuse, please refer to their <Link to="/" onClick={() => { window.open("https://zenodo.org/record/4443456#.Yv3Xj-xBx7M") }}> website</Link>.</p>
                    <h4>Center for Advanced Life Cycle Engineering (CALCE)</h4>
                    <p >CALCE has collected data on multiple cells. For the full details of these studies, the associated publications, and policies for data reuse, please refer to their <Link to="/" onClick={() => { window.open("https://web.calce.umd.edu/batteries/data.htm") }}> website</Link>.</p>
                    <h4>Hawaii Natural Energy Institute (HNEI)</h4>
                    <p>The dataset from HNEI used in the publication <Link to="/" onClick={() => { window.open("https://www.mdpi.com/1996-1073/11/5/1031") }}>"Intrinsic Variability in the Degradation of a Batch of Commercial 18650 Lithium-Ion Cells"</Link> consists of commercial 18650 cells with a graphite negative electrode and a blended positive electrode composed of NMC and LCO. The cell was cycled at 1.5C to 100% DOD for more than 1000 cycles at room temperature. This study examines the influence of intrinsic cell-to-cell variations on aging.</p>
                    <h4>Oxford University (OX)</h4>
                    <p>The small LCO pouch cells in Oxford Battery Degradation Dataset 1 were all tested in a thermal chamber at 40 °C. The cells were exposed to a constant-current-constant-voltage charging profile, followed by a drive cycle discharging profile that was obtained from the urban Artemis profile. Characterization measurements were taken every 100 cycles. For the full details of this study, the associated publications, and policies for data reuse, please refer to their <Link to="/" onClick={() => { window.open("https://ora.ox.ac.uk/objects/uuid:03ba4b01-cfed-46d3-9b1a-7d4a7bdf6fac") }}>website</Link>.</p>
                    <h4>Sandia National Laboratories (SNL)</h4>
                    <p>The dataset from Sandia National Labs used in the publication <Link to="/" onClick={() => { window.open("https://iopscience.iop.org/article/10.1149/1945-7111/abae37") }}>“Degradation of Commercial Lithium-ion Cells as a Function of Chemistry and Cycling Conditions”</Link> consists of commercial 18650 NCA, NMC, and LFP cells cycled to 80% capacity (although cycling is still ongoing). This study examines the influence of temperature, depth of discharge (DOD), and discharge current on the long-term degradation of the commercial cells. Each round of cycling consisted of a capacity check, some number of cycles at the designated conditions for that cell, and another capacity check at the end. The capacity check consisted of three charge/discharge cycles from 0-100% SOC at 0.5C</p>
                </div>


            </Modal>
        </>
    );
};

export default InfoBatteryArchiveModal;