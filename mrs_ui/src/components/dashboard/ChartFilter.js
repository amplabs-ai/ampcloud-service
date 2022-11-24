import React, { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import { InfoCircleOutlined } from "@ant-design/icons";
import { Button, Select, Form, Space, Input, Modal, Spin } from "antd";
import {
  MinusCircleOutlined,
  PlusOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { useDashboard } from "../../context/DashboardContext";
import { initialChartFilters } from "../../chartConfig/initialConfigs";

const { Option } = Select;
const FILTER_OPERATORS = [">", "<", "=", ">=", "<=", "!=", "%"];
const timeseries = [
  "currentTime",
  "voltageTime",
  "differentialCapacity",
  "galvanostaticPlot",
];

const ChartFilter = forwardRef((props, _ref) => {
  const [displayNames, setDisplayNames] = useState({});
  const [loading, setLoading] = useState(false);
  const [filterValues, setFilterValues] = useState(initialChartFilters[props.chartName])
  const { state, action } = useDashboard();

  const [form] = Form.useForm();


  useEffect(() => {
    
    if (props.displayNames) {
      setDisplayNames(props.displayNames)
    } 
  }, [props.displayNames, props.fetchdata]);

  const onFinish = (values) => {
    let data = {
      cell_ids: state.checkedCellIds.map((c) => c.cell_id),
      filters: values.filters || [],
    };
    let request = {
      method: "post",
      headers: {
        Authorization: "Bearer " + props.accessToken,
        "Content-Type": "application/json",
      },
      data: JSON.stringify(data),
    }
    setFilterValues(values.filters)
    props.setIsModalVisible(false)
    props.fetchData(props.chartName, request);
  };

  useImperativeHandle(_ref, () => ({
    getFilterValues: () => {
      return filterValues;
    }
  }))
  return (
    <>
      <Modal
        centered
        visible={props.isModalVisible}
        onCancel={() => props.setIsModalVisible(false)}
        footer={null}
        width="fit-content"
        maskClosable={false}
        bodyStyle={{
          padding: "50px",
          margin: "85px 10px",
        }}
      >
        <Form name="control-hooks" form={form} onFinish={onFinish}>
          <Form.List
            name="filters"
            initialValue={initialChartFilters[props.chartName]}
          >
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space
                    key={key}
                    style={{
                      display: "flex",
                      marginBottom: 8,
                    }}
                    align="baseline"
                  >
                    <Form.Item
                      {...restField}
                      name={[name, "column"]}
                      rules={[
                        {
                          required: true,
                          message: "Missing column name",
                        },
                      ]}
                    >
                      <Select
                        placeholder="Column"
                        size="small"
                        showSearch
                        dropdownMatchSelectWidth={false}
                        notFoundContent={!displayNames.length ? <Spin size="small" /> : false}
                      >
                        {Object.keys(displayNames).map((c, i) => (
                          <Option key={i} value={displayNames[c]}>
                            {c}
                          </Option>
                        ))}
                        {props.chartName === "differentialCapacity" && (
                          <Option key="test" value="reduction_factor">
                            Reduction Factor
                          </Option>
                        )}
                      </Select>
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, "operation"]}
                      rules={[
                        {
                          required: true,
                          message: "Missing operation type",
                        },
                      ]}
                    >
                      <Select
                        showSearch
                        size="small"
                        placeholder="Operation"
                        dropdownMatchSelectWidth={false}
                        notFoundContent={!displayNames.length ? <Spin size="small" /> : false}
                      >
                        {FILTER_OPERATORS.map((c, i) => (
                          <Option key={i} value={c}>
                            {c}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, "filterValue"]}
                      rules={[
                        {
                          required: true,
                          message: "Missing filter value",
                        },
                      ]}
                    >
                      <Input size="small" placeholder="Value" />
                    </Form.Item>

                    {fields.length > 1 ? (
                      <MinusCircleOutlined onClick={() => remove(name)} />
                    ) : null}

                    <PlusCircleOutlined onClick={() => add()} />
                  </Space>
                ))}
              </>
            )}
          </Form.List>
          {/* {ischartName === "differentialCapacity" ? (
            <Form.Item>
              <Input
                type="number"
                addonBefore="Reduction Factor"
                status={reductionFactorInputStatus}
                onChange={(e) => {
                  setReductionFactorInputStatus("");
                  setReductionFactorInputPlaceholder("Reduction Factor");
                  setReductionFactor(e.target.value);
                }}
                value={reductionFactor}
                placeholder={reductionFactorInputPlaceholder}
                allowClear
              />
            </Form.Item>
          ) : null} */}

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Apply Filter
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
});

export default React.memo(ChartFilter);
