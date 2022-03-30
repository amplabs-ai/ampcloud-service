import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Space,
  Input,
  Table,
  Button,
  Typography,
  Popconfirm,
  message,
} from "antd";
import { FaRegTrashAlt } from "react-icons/fa";

const { Title, Text } = Typography;

const DashboardFilterBar = (props) => {
  const [cellIds, setCellIds] = useState([]);
  const [tableLoading, setTableLoading] = useState(true);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const [selectedRows, setSelectedRows] = useState([]);

  const [step, setStep] = useState(1);
  const [stepInputPlaceholder, setStepInputPlaceholder] = useState("Step");
  const [stepInputStatus, setStepInputStatus] = useState("");

  useEffect(() => {
    axios
      .get(
        "http://batteryarchivemrstutoriallb-436798068.ap-south-1.elb.amazonaws.com:81/cells/all/meta"
      )
      .then((response) => {
        console.log("cell ids", response);
        let cellIdData = [];
        let data = response.data.records[0];
        if (data.length) {
          data.forEach((cellId, i) => {
            cellIdData.push({
              key: i,
              cell_id: cellId.cell_id,
            });
          });
          console.log(cellIdData);
          setCellIds([...cellIdData]);
          setSelectedRowKeys(cellIdData.map((c) => c.key));
          setSelectedRows([...cellIdData]);
          setTableLoading(false);
          props.onFilterChange([...cellIdData], step);
        } else {
          // error
          console.log("no data found!");
          props.onFilterChange([], step);
          setTableLoading(false);
        }
      })
      .catch((err) => {
        console.log("get cellId err", err);
        props.internalServerErrorFound("500");
      });
    const filterTitle = document.createElement("span");
    filterTitle.innerHTML = "Select Filter ";
    filterTitle.className = "ms-1";
    document
      .querySelector(
        ".ant-table-container table > thead > tr:first-child th:first-child"
      )
      .append(filterTitle);
  }, []);

  const handleCellDelete = (record) => {
    console.log("delete", record.key);
    axios
      .delete(
        `http://batteryarchivemrstutoriallb-436798068.ap-south-1.elb.amazonaws.com:81/cells/${record.cell_id}`
      )
      .then(() => {
        setCellIds(cellIds.filter((item) => item.key !== record.key));
        handleApplyFilter();
        message.success("Cell Id Deleted!");
        message.success("Cell Id Deleted!");
      })
      .catch((err) => {
        message.error("Error deleting Cell Id");
        message.error("Error deleting Cell Id");
      });
  };

  const handleApplyFilter = () => {
    console.log("step", step);
    if (!step) {
      setStepInputStatus("error");
      setStepInputPlaceholder("This field is required!");
      message.error("Step field is required!");
      message.error("Step field is required!");
      return;
    } else if (!selectedRows.length) {
      message.error("Please Select atleast one cell Id!");
      message.error("Please Select atleast one cell Id!");
      return;
    }
    let result = props.onFilterChange(selectedRows, step);
    if (result) {
      message.success("Filter Applied!"); // potential bug in antd need to call msg twice
      message.success("Filter Applied!");
    } else {
      message.error("Error Applying filters!");
      message.error("Error Applying filters!");
    }
  };

  const downloadCycleData = (k) => {
    console.log("downloadCycleData", k);
    axios
      .get(
        `http://batteryarchivemrstutoriallb-436798068.ap-south-1.elb.amazonaws.com:81/download/cells/cycle_data/${k}`
      )
      .then(({ data }) => {
        console.log("downloadcycledata", data);

        var a = document.createElement("a");
        var blob = new Blob([data], { type: "text/csv" });
        a.href = window.URL.createObjectURL(blob);
        a.download = k + " (Cycle Data)";
        a.click();
      });
  };

  const downloadTimeSeriesData = (k) => {
    console.log("downloadTimeSeriesData", k);
    axios
      .get(
        `http://batteryarchivemrstutoriallb-436798068.ap-south-1.elb.amazonaws.com:81/download/cells/cycle_timeseries/${k}`
      )
      .then(({ data }) => {
        console.log("downloadTimeSeriesData", data);

        var a = document.createElement("a");
        var blob = new Blob([data], { type: "text/csv" });
        a.href = window.URL.createObjectURL(blob);
        a.download = k + " (Time Series)";
        a.click();
      });
  };

  const columns = [
    {
      title: "Cell Id",
      dataIndex: "cell_id",
      width: 100,
    },
    {
      title: "Cycle Data",
      key: "cycleDataDownload",
      render: (text, record) => (
        <Space size="middle">
          <Button type="link" onClick={() => downloadCycleData(record.cell_id)}>
            Download
          </Button>
        </Space>
      ),
      width: 100,
    },
    {
      title: "Time Series",
      key: "timeSeriesDownload",
      render: (text, record) => (
        <Space size="middle">
          <Button
            type="link"
            onClick={() => downloadTimeSeriesData(record.cell_id)}
          >
            Download
          </Button>
        </Space>
      ),
      width: 100,
    },
    {
      title: "Delete",
      key: "action",
      render: (text, record) =>
        cellIds.length >= 1 ? (
          <div className="filter-bar-delete-column">
            <Popconfirm
              title="Sure to delete?"
              onConfirm={() => handleCellDelete(record)}
            >
              <Space size="middle">
                <FaRegTrashAlt style={{ cursor: "pointer" }} />
              </Space>
            </Popconfirm>
          </div>
        ) : null,
      width: 100,
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedRowKeys, selectedRows) => {
      setSelectedRowKeys(selectedRowKeys);
      setSelectedRows(selectedRows);
      // setCellIds(selectedRows);
      console.log("selectedRows", selectedRows);
    },
  };
  return (
    <div>
      <div className="card shadow-sm">
        <div className="card-body filterBar">
          <div style={{ display: "inline-block" }} className="pe-2">
            {/* <Title level={5}>Step</Title> */}
            <Input
              type="number"
              addonBefore="Step"
              status={stepInputStatus}
              onChange={(e) => {
                setStepInputStatus("");
                setStepInputPlaceholder("Step");
                setStep(e.target.value);
              }}
              value={step}
              placeholder={stepInputPlaceholder}
              allowClear
            />
          </div>
          {/* <Button
						disabled={!cellIds.length}
						danger
						onClick={() => handleApplyFilter()}
						className="mt-2"
					>
						Filter
					</Button> */}
          <button
            disabled={!cellIds.length}
            onClick={() => handleApplyFilter()}
            className=" btn btn-outline-dark btn-sm"
          >
            Apply Filter
          </button>

          <Table
            sticky={true}
            loading={tableLoading}
            style={{ marginTop: "10px" }}
            columns={columns}
            dataSource={cellIds}
            pagination={false}
            scroll={{
              x: true,
              y: "300px",
            }}
            size="small"
            rowSelection={{
              type: "checkbox",
              ...rowSelection,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardFilterBar;
