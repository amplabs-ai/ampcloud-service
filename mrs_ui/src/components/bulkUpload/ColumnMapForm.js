import React, { useState } from "react";
import { InfoCircleOutlined } from '@ant-design/icons';
import { FaRegTrashAlt } from "react-icons/fa";
import { Checkbox, Form, Input, Select, Button, Collapse, Spin, message, Popover, Table, Popconfirm, Tooltip } from "antd";
import { useUserPlan } from "../../context/UserPlanContext";
import axios from "axios";
import {METRIC_PREFIXES, METRICS_TEMPERATURE, METRICS_TIME} from "../../constants/unitsAndMetricPrefixes";
import { useAuth0Token } from "../../utility/useAuth0Token";

const { Option, OptGroup } = Select;
const { Panel } = Collapse;
const REQUIRED_HEADERS = ["test_time", "current", "voltage"];

const ColumnMapForm = ({
  formInfo,
  options,
  onColMapChange,
  onFileInfoInputChange,
  onTemplateSelect,
  getTemplateData,
  templateData,
  onColMetricChange
}) => {
  const [loading, setloading] = useState(false)
  const [activePannelKey, setActivePannelKey] = useState(0)
  const [selectedTemplateData, setSelectedTemplateData] = useState([])
  const userPlan = useUserPlan();
  const accessToken = useAuth0Token()

  const columns = [
    {
      title: "File Column",
      dataIndex: "column",
      ellipsis: {
        showTitle: false,
      },
      render: (column) => (
        <Tooltip placement="topLeft" title={column}>
          {column}
        </Tooltip>
      ),
    },
    {
      title: "Unit/Prefix",
      dataIndex: "unit",
      width: 100,
      ellipsis: {
        showTitle: false,
      },
      render: (unit) => (
        <Tooltip placement="topLeft" title={unit}>
          {unit}
        </Tooltip>
      )
    },
    {
      title: "Mapped Column",
      dataIndex: "mapping",
      ellipsis: {
        showTitle: false,
      },
      render: (mapping) => (
        <Tooltip placement="topLeft" title={mapping}>
          {mapping}
        </Tooltip>
      ),
    }
  ]

  const onHeaderMapChange = (item, value) => {
    onColMapChange(item, value, formInfo.fileName);
  };

  const fileInputChange = (item, value) => {
    onFileInfoInputChange(item, value, formInfo.fileName);
  };

  const templateChange = (value) => {
    let data = []
    templateData[value].forEach((h, index) => {
      data.push({
        ...h,
        mapping: Object.keys(options).filter((key) =>options[key] === h["mapping"])
      })
    })
    setSelectedTemplateData(data)
    onTemplateSelect(value, formInfo.fileName);
  };

  const metricChange = (item, value) => {
	onColMetricChange(item, value, formInfo.fileName)
  }

  const getDuplicateMappings = (mappings) => {
    const toFindDuplicates = (arr) =>
      arr.filter((item, index) => {
        if (item) {
          return arr.indexOf(item) !== index;
        }
        return false;
      });
    const duplicateElements = toFindDuplicates(
      Object.values(mappings).map((item) => item[0])
    );
    return duplicateElements;
  };

  const addNewTemplate = () => {
    let missingHeaders = [];
    REQUIRED_HEADERS.forEach((h) => {
      if (!Object.values(formInfo.mappings).find((value) => value[0].includes(h))) {
        missingHeaders.push(h);
      }
    });

    let duplicateMappings = getDuplicateMappings(formInfo.mappings);
    if (missingHeaders.length || duplicateMappings.length) {
      if(!formInfo.new_template){
        message.error(`template name is required`);
				message.error(`template name is required`);
        return;
      }
      if (missingHeaders.length) {
        message.error(`missing headers(${missingHeaders.join(", ")}), `);
				message.error(`missing headers(${missingHeaders.join(", ")}), `);
        return;
      }
      if (duplicateMappings.length) {
        message.error(`found duplicates(${duplicateMappings.join(", ")}), `);
        message.error(`found duplicates(${duplicateMappings.join(", ")}), `);
        return;
      }
    }
    setloading(true)
    const initialRequestBody =  {
				name: formInfo.new_template,
				properties: formInfo.mappings,
			}
    axios
      .post("/template", JSON.stringify(initialRequestBody), {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      })
      .then((response) => {
        if (response.status !== 200) return;
        getTemplateData();
        setActivePannelKey(0)
        setloading(false)
      })
      .catch((error) => {
        setloading(false)
        message.error("Error addding Template");
        message.error("Error addding Template");
      });
  };

  const onDeleteTemplate = () => {
    setloading(true)
    let params = new URLSearchParams();
		params.append("template", formInfo.template);
		axios
			.delete(`/template`, {
				params: params,
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			})
			.then(() => {
        getTemplateData()	
        formInfo.template = ""
        setSelectedTemplateData([])
        setloading(false)
				message.success("Template Deleted!");
				message.success("Template Deleted!");
			})
			.catch((err) => {
				setloading(false)
				message.error("Error deleting Template");
				message.error("Error deleting Template");
			});
  }

  const content = (
    <div>
      <ul>
        <li>
          File Columns(First Column) will be mapped to supported values(Last Column)
        </li>
        <li>
          Mappings for: [Test Time, Current, Voltage, Cycle Index(for single cell data)] are required.
        </li>
        <li>
          Units/Metrics/Prefixes, different from supported headers should be selected(Middel Column).
        </li>
      </ul>
    </div>
  );


  const getHeader = () => (
    <span>
      <span
        style={{ color: "#000000d9", lineHeight: 1.5715, cursor: "pointer", display: "flex", alignItems: "center" }}
      >
        Create a new template
        &nbsp;
        <Popover content={content}>
          <InfoCircleOutlined />
        </Popover>
      </span>
    </span>
  );

  return (
    
      <div>
        <Form
          labelCol={{
            span: 9,
          }}
          wrapperCol={{
            span: 14,
          }}
        >
          <div className="row">
            <div className="col-md-6">
              <Form.Item
                name="cell_id"
                label="Cell Id"
                rules={[{ required: true, message: "Please enter cell id!" }]}
              >
                <Input
                  defaultValue={formInfo.cellId}
                  onChange={(e) => fileInputChange("cellId", e.target.value)}
                />
              </Form.Item>
            </div>
            <div className="col-md-6">
              <Form.Item name="isPublic" label="isPublic?">
                <Checkbox
                  checked={formInfo.isPublic}
                  disabled={userPlan.includes("COMMUNITY")}
                  onChange={(e) =>
                    fileInputChange("isPublic", e.target.checked)
                  }
                ></Checkbox>
              </Form.Item>
            </div>
          </div>
          <Collapse
            defaultActiveKey={0}
            activeKey={activePannelKey}
            onChange={() => setActivePannelKey(activePannelKey ^ 1)}
            bordered={false}
            accordion
          >
            <Panel header="Select template">
            <Spin tip="Deleting template..." spinning={loading}>
              {/* <h6>Select template</h6> */}
              <Form.Item
                name="template"
                label="Template"
                key="template"
                rules={[{ required: true, message: "Please  template name!" }]}
              >
                {/* <div className="row"> */}
                <Select
                  style={{
                    minWidth: 120,
                  }}
                  onChange={(val) => templateChange(val)}
                  dropdownMatchSelectWidth={false}
                  placement="bottomRight"
                  value={formInfo.template}
                  showSearch
                  key={formInfo.template}
                >
                  {Object.keys(templateData).map((key) => (
                    <Option key={key} value={key}>
                      {key}
                    </Option>
                  ))}
                </Select>
                {/* </div> */}
              </Form.Item>
              {selectedTemplateData.length ? (
                <Table
                  columns={columns}
                  dataSource={selectedTemplateData}
                  size="medium"
                  scroll={{
                    y: "40vh",
                  }}
                  pagination={false}
                  bordered
                  title={() => (<span style={{display:"flex", justifyContent:"space-between", fontWeight:"600", fontSize:"initial"}}>{formInfo.template}<Popconfirm title="Sure to delete?" onConfirm={() => onDeleteTemplate()}>
            <FaRegTrashAlt />
          </Popconfirm></span>)}
                />
              ) : null}
              </Spin>
            </Panel>

            <Panel header={getHeader()}>
            <Spin tip="Saving template..." spinning={loading}>
              <div
                style={{
                  maxHeight: "40vh",
                  overflowY: "scroll",
                  paddingRight: "10px",
                }}
              >
                <Form.Item
                  label="Template Name"
                  name="name"
                  rules={[
                    { required: true, message: "Please input template name!" },
                  ]}
                >
                  <Input
                    onBlur={(e) =>
                      fileInputChange("new_template", e.target.value)
                    }
                  />
                </Form.Item>
                {Object.keys(formInfo.mappings).map((item) => (
                  <Form.Item name={item} label={item} key={item}>
                    <div className="row">
                      <div className="col-md-4">
                        <Select
                          style={{
                            minWidth: 120,
                          }}
                          onChange={(val) => metricChange(item, val)}
                          dropdownMatchSelectWidth={false}
                          placement="bottomRight"
                          showSearch
                          placeholder="Metric in use"
                        >
                          <OptGroup label="Prefixes">
                            {METRIC_PREFIXES.map((o) => (
                              <Option key={o} value={o}>
                                {o}
                              </Option>
                            ))}
                          </OptGroup>
                          <OptGroup label="Time Units">
                            {METRICS_TIME.map((o) => (
                              <Option key={o} value={o}>
                                {o}
                              </Option>
                            ))}
                          </OptGroup>
                          <OptGroup label="Temperature Units">
                            {METRICS_TEMPERATURE.map((o) => (
                              <Option key={o} value={o}>
                                {o}
                              </Option>
                            ))}
                          </OptGroup>
                        </Select>
                      </div>

                      <div className="col-md-8">
                        <Select
                          style={{
                            minWidth: 120,
                          }}
                          onChange={(val) => onHeaderMapChange(item, val)}
                          dropdownMatchSelectWidth={false}
                          placement="bottomRight"
                          defaultValue={formInfo.mappings[item]}
                          showSearch
                        >
                          {Object.keys(options).map((o) => (
                            <Option key={o} value={options[o]}>
                              {o}
                            </Option>
                          ))}
                        </Select>
                      </div>
                    </div>
                  </Form.Item>
                ))}
              </div>
              <div>
                <Button type="link" onClick={() => addNewTemplate()}>
                  Save as new template
                </Button>
              </div>
              </Spin>
            </Panel>
          </Collapse>
        </Form>
      </div>

  );
};

export default React.memo(ColumnMapForm);
