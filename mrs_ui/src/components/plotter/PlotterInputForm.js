import React, { useEffect, useState } from "react";
import { Button, Select, Form, Space, Input } from "antd";
import axios from "axios";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";

const { Option } = Select;

const FILTER_OPERATORS = [">", "<", "=", ">=", "<=", "!=", "%"];

const PlotterInputForm = (props) => {
  const [form] = Form.useForm();
  const [axisOptions, setAxisOptions] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedYaxes, setSelectedYaxes] = useState([]);
  const [selectedXaxes, setSelectedXaxes] = useState([]);

  useEffect(() => {
    if (props.type) {
      setLoading(true);
      let endpoint =
        props.type === "timeseries"
          ? "/displayname/timeseries"
          : "/displayname/cycle";
      const controller = new AbortController();
      axios
        .get(endpoint, {
          signal: controller.signal,
        })
        .then((res) => {
          console.log("plotterinputform", res);
          setAxisOptions(res.data?.records);
          setLoading(false);
        })
        .catch((err) => {
          setLoading(false);
        });

      return () => {
        controller.abort();
      };
    } else {
      throw new Error("Type is not defined");
    }
  }, [props.type]);

  const handleYAxisSelect = (value) => {
    // setAxisOptions(Object.keys(axisOptions).filter((k, v) => k !== value));
    setSelectedYaxes([...selectedYaxes, value]);
  };

  const handleYAxisDeselect = (value) => {
    // setAxisOptions((prev) => console.log(prev));
    setSelectedYaxes(selectedYaxes.filter((c) => c !== value));
  };

  const handleXAxisSelect = (value) => {
    // setAxisOptions(Object.keys(axisOptions).filter((k, v) => k !== value));
    setSelectedXaxes([...selectedXaxes, value]);
  };

  const handleXAxisDeselect = (value) => {
    setAxisOptions((prev) => [...Object.keys(prev), value]);
    // setSelectedXaxes(selectedXaxes.filter((c) => c !== value));
  };

  const onFinish = (values) => {
    props.onPlot(values, axisOptions);
  };

  const onReset = () => {
    props.onPlotReset();
    form.resetFields();
  };

  return (
    <>
      <Form name="control-hooks" onFinish={onFinish} form={form}>
        <Form.Item
          label="X-Axis"
          name="x-axis"
          rules={[
            {
              required: true,
            },
          ]}
        >
          {/* <Select
            mode="multiple"
            allowClear
            loading={loading}
            style={{ width: "100%" }}
            placeholder="Please select X Axes"
            onSelect={handleXAxisSelect}
            onDeselect={handleXAxisDeselect}
            value={selectedXaxes}
          >
            {Object.keys(axisOptions).map((c, i) => (
              <Option key={i} value={axisOptions[c]}>
                {c}
              </Option>
            ))}
          </Select> */}
          <Select
            showSearch
            style={{ width: "100%" }}
            placeholder="Select X-Axis"
            loading={loading}
            dropdownMatchSelectWidth={false}
          >
            {Object.keys(axisOptions).map((c, i) => (
              <Option key={i} value={axisOptions[c]}>
                {c}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          label="Y-Axis"
          name="y-axis"
          rules={[
            {
              required: true,
            },
          ]}
        >
          {/* <Select
            showSearch
            style={{ width: "100%" }}
            placeholder="Select Y-Axis"
            loading={loading}
            dropdownMatchSelectWidth={false}
          >
            {Object.keys(axisOptions).map((c, i) => (
              <Option key={i} value={axisOptions[c]}>
                {c}
              </Option>
            ))}
          </Select> */}
          <Select
            mode="multiple"
            allowClear
            loading={loading}
            style={{ width: "100%" }}
            placeholder="Please select Y Axes"
            onSelect={handleYAxisSelect}
            onDeselect={handleYAxisDeselect}
            value={selectedYaxes}
          >
            {Object.keys(axisOptions).map((c, i) => (
              <Option key={i} value={axisOptions[c]}>
                {c}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.List name="filters">
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
                    >
                      {Object.keys(axisOptions).map((c, i) => (
                        <Option key={i} value={axisOptions[c]}>
                          {c}
                        </Option>
                      ))}
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
                  <MinusCircleOutlined onClick={() => remove(name)} />
                </Space>
              ))}
              <Form.Item>
                <Button
                  type="dashed"
                  onClick={() => add()}
                  block
                  icon={<PlusOutlined />}
                >
                  Add Filter
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>

        <Form.Item>
          <Button type="primary" htmlType="submit">
            Plot
          </Button>
          <Button htmlType="button" className="ms-1" onClick={onReset}>
            Reset
          </Button>
        </Form.Item>
      </Form>
    </>
  );
};

export default PlotterInputForm;
