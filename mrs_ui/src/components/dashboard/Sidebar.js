import React, { useState, useEffect } from "react";
import message from "antd/es/message";
import Button from "antd/es/button";
import Input from "antd/es/input";
import Tree from "antd/es/tree";
import Layout from "antd/es/layout";
import Spin from "antd/es/spin";
import Result from "antd/es/result";
import Modal from "antd/es/modal";
import Row from "antd/es/row";
import Col from "antd/es/col";
import Slider from "antd/es/slider";
import Select from "antd/es/select";
import Tooltip from "antd/es/tooltip";
import axios from "axios";
import SimpleBarReact from "simplebar-react";
import "simplebar/src/simplebar.css";
import "./search-filter.css";
import { useAuth0Token } from "../../utility/useAuth0Token";
import { useDashboard } from "../../context/DashboardContext";
import { useUserPlan } from "../../context/UserPlanContext";
import { useLocation, useNavigate } from "react-router-dom";
import InfoBatteryArchiveModal from "./InfoBatteryArchiveModal";
import DownloadOutlined from "@ant-design/icons/DownloadOutlined";
import FileZipOutlined from "@ant-design/icons/FileZipOutlined";

const { Option, OptGroup } = Select;
const { Search } = Input;
const { Sider } = Layout;

const SideBar = (props) => {
  const [checkedKeys, setCheckedKeys] = useState([]);
  const [filteredTreeData, setFilteredTreeData] = useState([]);
  const [treeData, setTreeData] = useState([]);
  const [checkedCellIds, setCheckedCellIds] = useState([]);
  const [isCelldataLoaded, setIsCelldataLoaded] = useState(false);
  const [searchFilterOpen, setSearchFilterOpen] = useState(false);
  const [error, setError] = useState(null);
  const [appliedFilterCount, setAppliedFilterCount] = useState(0);
  const [initialFilters, setInitialFilters] = useState({
    manufacturer: null,
    form_factor: null,
    format_dimension: null,
    cathode: null,
    anode: null,
    electrolyte: null,
    test: null,
    temperature: [null, null],
    operating_voltage: [null, null],
    energy_density_of_pack: null,
    energy_density_of_active_material: null,
    crate_c: [null, null],
    ah: [null, null],
    crate_d: [null, null],
    application: "",
    pack: "",
  });
  const [selectedFilters, setSelectedFilters] = useState(initialFilters);
  const [metadataSummary, setMetadataSummary] = useState({
    anode: [],
    cathode: [],
    format_shape: [],
    test_type: [],
    temperature: {
      min: null,
      max: null,
    },
    charge_rate: {
      min: null,
      max: null,
    },
    discharge_rate: {
      min: null,
      max: null,
    },
    capacity: {
      min: null,
      max: null,
    },
    operating_voltage: {
      min: null,
      max: null,
    },
  });
  const [filterOptionsLoaded, setFilterOptionsLoaded] = useState(false);
  const [loading, setLoading] = useState(false);

  const { state, action } = useDashboard();
  const accessToken = useAuth0Token();

  const userPlan = useUserPlan();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (accessToken && userPlan) {
      setIsCelldataLoaded(false);
      let reqBody = getReqBody();
      let endpoint = props.type === "cycle" ? "/cells/cycle/meta" : "/cells/abuse/meta";
      axios
        .post(endpoint, reqBody, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .then((res) => {
          if (res.status === 200 && res.data) {
            let treeData = _generateTreeData(res.data.records[0], userPlan);
            console.log("treeData", treeData);
            setTreeData(treeData);
            navigate(location.pathname, { replace: true });
            if (
              location.state &&
              location.state.cellIds &&
              location.state.cellIds.length
            ) {
              let { cellIds } = location.state;
              let data = [...treeData[1].children, ...treeData[0].children];
              let checkedKeys = new Set();
              data.forEach((data) => {
                if (cellIds.includes(data.title)) {
                  checkedKeys.add(data.key);
                }
              });
              console.log("checkedKeys", checkedKeys);
              checkedKeys = Array.from(checkedKeys);
              setCheckedKeys(checkedKeys);
              let checkedCellIds = checkedKeys.map((key) =>
                key.substring(key.indexOf("_") + 1)
              );
              setCheckedCellIds(checkedCellIds);
              if (location.state?.from === "upload") {
                action.loadCellData(checkedCellIds, "type-2");
              } else {
                action.plotCellData(checkedCellIds);
              }
            } else {
              setCheckedKeys(
                state.selectedCellIds.map((element) => `cell_${element}`)
              );
              setCheckedCellIds(state.selectedCellIds);
            }
            setFilteredTreeData(() => {
              setIsCelldataLoaded(true);
              return treeData;
            });
          }
        })
        .catch((err) => {
          console.error("get cellId err", err);
          setError(err);
        });

      axios
        .get("/metadata", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .then((res) => {
          setMetadataSummary(res.data.records[0]);
          setFilterOptionsLoaded(true);
        })
        .catch((err) => {});
    }
  }, [state.refreshSidebar, accessToken, userPlan, props.type]);

  const downloadTRIdata = (fileName) => {
    setLoading(true);
    let params = new URLSearchParams();
    params.append("file", fileName);
    axios
      .get(`/download/tri_data`, {
        params: params,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      .then(({ data }) => {
        var a = document.createElement("a");
        a.href = data.response_url;
        a.download = fileName;
        a.click();
        setLoading(false);
      })
      .catch((err) => {
        message.error("Error downloading data");
        message.error("Error downloading data");
        setLoading(false);
      });
  };

  const _generateTreeData = (data, userPlan) => {
    let x = [
      {
        title: "Private",
        key: "private",
        children: [],
        disabled: !userPlan?.includes("PRO"),
      },
      {
        title: "Public",
        key: "public",
        children: [],
      },
      {
        title: (
          <>
            MRS Competition (11/2022)
            <Tooltip placement="top" title="Download CSVs">
              <Button
                className="ml-2 p-0"
                type="text"
                size="small"
                icon={
                  <DownloadOutlined
                    onClick={() => downloadTRIdata("tri_data.zip")}
                  />
                }
              />
            </Tooltip>
          </>
        ),
        key: "tri_competition",
        children: [
          {
            title: (
              <>
                Training Data
                <Tooltip placement="top" title="Download JSON">
                  <Button
                    className="ml-2 p-0"
                    type="text"
                    size="small"
                    icon={<DownloadOutlined />}
                    onClick={() => downloadTRIdata("training_data_json.zip")}
                  />
                </Tooltip>
                <Tooltip placement="top" title="Download CSVs">
                  <Button
                    className="ml-2 p-0"
                    type="text"
                    size="small"
                    icon={<FileZipOutlined />}
                    onClick={() => downloadTRIdata("training_data.zip")}
                  />
                </Tooltip>
              </>
            ),
            key: "tri_training",
            children: [],
          },
          {
            title: (
              <>
                Test Data
                <Tooltip placement="top" title="Download JSON">
                  <Button
                    className="ml-2 p-0"
                    type="text"
                    size="small"
                    icon={<DownloadOutlined />}
                    onClick={() => downloadTRIdata("test_data_json.zip")}
                  />
                </Tooltip>
                <Tooltip placement="top" title="Download CSVs">
                  <Button
                    className="ml-2 p-0"
                    type="text"
                    size="small"
                    icon={<FileZipOutlined />}
                    onClick={() => downloadTRIdata("test_data.zip")}
                  />
                </Tooltip>
              </>
            ),
            key: "tri_test",
            children: [],
          },
        ],
      },
      {
        title: <InfoBatteryArchiveModal />,
        key: "amplabs",
        children: [],
      },
      {
        title: "data.matr.io",
        key: "datamatrio",
        children: [
          {
            title: "Capacity Degradation",
            key: "capacity_degradation",
            children: [],
          },
          {
            title: "Closed-loop optimization",
            key: "closed-loop_optimization",
            children: [],
          },
        ],
      },
    ];
    let amplabsDirInfo = {};
    let dataMatrIoDirInfo = {
      capacityDegrad: {},
      closeLoopOpt: {},
      triCompetition: {},
    };
    data.map((cellMeta) => {
      let cellType = cellMeta.type + "_";
      let cellId = cellMeta.cell_id;
      let index = cellMeta.index;
      switch (cellMeta.type) {
        case "public/battery-archive":
          let dirName = cellId.split("_", 1)[0];
          if (amplabsDirInfo[dirName] === undefined) {
            x[3].children.push({
              title: dirName,
              key: dirName,
              children: [
                {
                  title: cellId,
                  key: "cell_" + index + "_" + cellType + cellId,
                },
              ],
            });
            amplabsDirInfo[dirName] = x[3].children.length - 1;
          } else {
            x[3].children[amplabsDirInfo[dirName]].children.push({
              title: cellId,
              key: "cell_" + index + "_" + cellType + cellId,
            });
          }
          break;
        case "public/data.matr.io":
          let projectDirIndex;
          let batchIndex;
          if (cellId.includes("_oed_") || cellId.includes("_batch9_")) {
            // project: close-loop optimization
            projectDirIndex = 1;
            let batchNameCloseloop;
            if (cellId.includes("_oed_")) {
              batchNameCloseloop =
                "Batch " + cellId.split("_")[1] + "_" + cellId.split("_")[2];
            } else {
              batchNameCloseloop = "Batch9 (validation batch)";
            }
            if (
              dataMatrIoDirInfo.closeLoopOpt[batchNameCloseloop] === undefined
            ) {
              x[4].children[projectDirIndex].children.push({
                title: batchNameCloseloop,
                key: batchNameCloseloop,
                children: [],
              });
              dataMatrIoDirInfo.closeLoopOpt[batchNameCloseloop] =
                x[4].children[projectDirIndex].children.length - 1;
            } else {
            }
            batchIndex = dataMatrIoDirInfo.closeLoopOpt[batchNameCloseloop];
          } else if (cellId.includes("training")) {
            x[2].children[0].children.push({
              title: cellId,
              key: "cell_" + index + "_" + cellType + cellId,
            });
            break;
          } else if (cellId.includes("test")) {
            x[2].children[1].children.push({
              title: cellId,
              key: "cell_" + index + "_" + cellType + cellId,
            });
            break;
          } else {
            // project: capacity degradation
            projectDirIndex = 0;
            let batchNameCapDeg = cellId.split("_", 1)[0];
            if (
              dataMatrIoDirInfo.capacityDegrad[batchNameCapDeg] === undefined
            ) {
              x[4].children[projectDirIndex].children.push({
                title: batchNameCapDeg,
                key: batchNameCapDeg,
                children: [],
              });
              dataMatrIoDirInfo.capacityDegrad[batchNameCapDeg] =
                x[4].children[projectDirIndex].children.length - 1;
            } else {
            }
            batchIndex = dataMatrIoDirInfo.capacityDegrad[batchNameCapDeg];
          }

          x[4].children[projectDirIndex].children[batchIndex].children.push({
            title: cellId,
            key: "cell_" + index + "_" + cellType + cellId,
          });
          break;
        case "public/user":
          x[1].children.push({
            title: cellId,
            key: "cell_" + index + "_" + cellType + cellId,
          });
          break;
        case "public/other":
          x[1].children.push({
            title: cellId,
            key: "cell_" + index + "_" + cellType + cellId,
          });
          break;
        case "private":
          x[0].children.push({
            title: cellId,
            key: "cell_" + index + "_" + cellType + cellId,
            disabled: !userPlan?.includes("PRO"),
          });
          break;
        default:
          break;
      }
    });
    if (!x[1].children.length) {
      x.splice(1, 3);
    }
    return x;
  };

  const getReqBody = () => {
    let appliedfiltercount = 0;
    let reqBody = {
      filters: [],
    };

    for (const [key, value] of Object.entries(selectedFilters)) {
      if (value) {
        if (["crate_c", "crate_d", "ah", "temperature"].includes(key)) {
          if (value.every((element) => element !== null)) {
            reqBody.filters.push(
              {
                column: key,
                operation: ">=",
                filterValue: value[0].toString(),
              },
              {
                column: key,
                operation: "<=",
                filterValue: value[1].toString(),
              }
            );
            appliedfiltercount += 1;
          }
        } else if (["operating_voltage"].includes(key)) {
          if (value.every((element) => element !== null)) {
            reqBody.filters.push(
              {
                column: "v_min",
                operation: ">=",
                filterValue: value[0].toString(),
              },
              {
                column: "v_max",
                operation: "<=",
                filterValue: value[1].toString(),
              }
            );
            appliedfiltercount += 1;
          }
        } else if (value !== "") {
          reqBody.filters.push({
            column: key,
            operation: "=",
            filterValue: value.toString(),
          });
          appliedfiltercount += 1;
        }
      }
    }
    setAppliedFilterCount(appliedfiltercount);
    return reqBody;
  };

  const setSideBarData = (filteredTreeData) => {
    let sideBarData = [];
    filteredTreeData.forEach((element) => {
      let createDataMatrNode = true;
      if (
        element.key === "private" ||
        element.key === "public" ||
        element.key === "amplabs"
      ) {
        if (element.children.length !== 0) {
          sideBarData.push(element);
        }
      } else {
        let dataMatrNodeIndex = null;
        element.children.forEach((item) => {
          if (item.children.length !== 0) {
            if (createDataMatrNode) {
              sideBarData.push({
                title: element.title,
                key: element.key,
                children: [],
              });
              createDataMatrNode = false;
              dataMatrNodeIndex = sideBarData.length - 1;
            }
            sideBarData[dataMatrNodeIndex].children.push(item);
          }
        });
      }
    });
    return sideBarData;
  };

  const onFilterChange = (label, value) => {
    setSelectedFilters({ ...selectedFilters, [label]: value });
  };

  const findObjectAndParents = (item, title) => {
    if (typeof item.title === "string" && (item.title.toLowerCase().includes(title.toLowerCase()) || !title)) {
      return true;
    }
    if (item.children) {
      for (let i = 0; i < item.children.length; i++) {
        if (findObjectAndParents(item.children[i], title)) {
          return true;
        }
      }
    }
    return false;
  };

  const onCheck = (checkedKeysValue) => {
    if (
      checkedKeysValue.filter((item) => item.split("_", 1)[0] === "cell")
        .length > 5
    ) {
      message.info("Only 5 cell IDs can be loaded");
      message.info("Only 5 cell IDs can be loaded");
      return;
    }
    setCheckedKeys(checkedKeysValue);
    let x = [];
    checkedKeysValue.map((k) => {
      let identifier = k.split("_", 1)[0];
      if (identifier === "cell") {
        x.push(k.substring(k.indexOf("_") + 1));
      }
    });
    setCheckedCellIds(x);
  };

  const onChange = (e) => {
    let searchName = e.target.value;
    let filtered = treeData.filter((item) =>
      findObjectAndParents(item, searchName)
    );
    setFilteredTreeData(filtered);
  };

  const onLoad = (dashboardType) => {
    action.loadCellData(checkedCellIds, dashboardType);
  };

  const onClear = () => {
    setCheckedKeys([]);
    setCheckedCellIds([]);
    setFilteredTreeData(treeData);
    action.clearDashboard();
  };

  return (
    <>
      <Modal
        centered
        width="auto"
        visible={loading}
        closable={false}
        footer={null}
        maskClosable={false}
      >
      <Spin size="large" />
      </Modal>
      <Modal
        visible={searchFilterOpen}
        onCancel={() => setSearchFilterOpen(false)}
        width={1100}
        footer={null}
      >
        <Row>
          <Col
            span={4}
            style={{ display: "flex", flexDirection: "column", margin: "5px" }}
          >
            <h7 style={{ fontWeight: "600", marginBottom: "5px" }}>
              Manufacturer
            </h7>
            <Select
              loading={!filterOptionsLoaded}
              allowClear={true}
              className="filter-select"
              placeholder="Manufacturer"
              dropdownStyle={{ borderRadius: "5px" }}
            >
              <OptGroup label="Manufacturer">
                <Option value="">Any</Option>
                <Option value="lg">LG</Option>
                <Option value="samsung">Samsung</Option>
              </OptGroup>
            </Select>
          </Col>
          <Col span={4}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                margin: "5px",
              }}
            >
              <h7 style={{ fontWeight: "700", marginBottom: "5px" }}>
                Application
              </h7>
              <Select
                loading={!filterOptionsLoaded}
                allowClear={true}
                style={{
                  maxWidth: 300,
                }}
                onChange={(value) => {
                  onFilterChange("application", value);
                }}
                value={selectedFilters.application}
                className="filter-select"
                placeholder="Application"
                dropdownStyle={{ borderRadius: "5px" }}
              >
                <OptGroup label="Application">
                  <Option value="">Any</Option>
                  <Option disabled={true} value="marine">
                    Marine
                  </Option>
                  <Option disabled={true} value="automotive">
                    Automotive
                  </Option>
                  <Option disabled={true} value="aviation">
                    Aviation
                  </Option>
                  <Option disabled={true} value="undefined">
                    Military Grade
                  </Option>
                </OptGroup>
              </Select>
            </div>
          </Col>
          <Col
            span={4}
            style={{ display: "flex", flexDirection: "column", margin: "5px" }}
          >
            <h7 style={{ fontWeight: "700", marginBottom: "5px" }}>
              Format Shape
            </h7>
            <Select
              loading={!filterOptionsLoaded}
              value={selectedFilters.form_factor}
              allowClear={true}
              onChange={(value) => {
                onFilterChange("form_factor", value);
              }}
              className="filter-select"
              placeholder="Format Shape"
            >
              <OptGroup label="Format Shape">
                <Option value="">Any</Option>
              </OptGroup>
              {metadataSummary["format_shape"].map((item) => (
                <Option value={item}>{item}</Option>
              ))}
            </Select>
          </Col>
          <Col
            span={4}
            style={{ display: "flex", flexDirection: "column", margin: "5px" }}
          >
            <h7 style={{ fontWeight: "700", marginBottom: "5px" }}>
              Format Dimension
            </h7>
            <Select
              loading={!filterOptionsLoaded}
              allowClear={true}
              className="filter-select"
              placeholder="Format Dimension"
            >
              <OptGroup label="Format Dimension">
                <Option value="">Any</Option>
                <Option value="18650">18650</Option>
                <Option value="21700">21700</Option>
                <Option value="26650">26650</Option>
                <Option value="32650">32650</Option>
              </OptGroup>
            </Select>
          </Col>
          <Col
            span={3}
            style={{ display: "flex", flexDirection: "column", margin: "5px" }}
          >
            <h7 style={{ fontWeight: "700", marginBottom: "5px" }}>Cathode</h7>
            <Select
              loading={!filterOptionsLoaded}
              value={selectedFilters.cathode}
              allowClear={true}
              onChange={(value) => {
                onFilterChange("cathode", value);
              }}
              className="filter-select"
              placeholder="Cathode"
            >
              <OptGroup label="Cathode">
                <Option value="">Any</Option>
                {metadataSummary["cathode"].map((item) => (
                  <Option value={item}>{item}</Option>
                ))}
              </OptGroup>
            </Select>
          </Col>
          <Col
            span={3}
            style={{ display: "flex", flexDirection: "column", margin: "5px" }}
          >
            <h7 style={{ fontWeight: "700", marginBottom: "5px" }}>Anode</h7>
            <Select
              loading={!filterOptionsLoaded}
              value={selectedFilters.anode}
              allowClear={true}
              onChange={(value) => {
                onFilterChange("anode", value);
              }}
              className="filter-select"
              placeholder="Anode"
            >
              <OptGroup label="Anode">
                <Option value="">Any</Option>
                {metadataSummary["anode"].map((item) => (
                  <Option value={item}>{item}</Option>
                ))}
              </OptGroup>
            </Select>
          </Col>
        </Row>
        <br></br>
        <Row>
          <Col
            span={4}
            style={{ display: "flex", flexDirection: "column", margin: "10px" }}
          >
            <h7 style={{ fontWeight: "700", marginBottom: "5px" }}>
              Electrolyte
            </h7>
            <Select
              value={selectedFilters.electrolyte}
              onChange={(value) => {
                onFilterChange("electrolyte", value);
              }}
              loading={!filterOptionsLoaded}
              allowClear={true}
              className="filter-select"
              placeholder="Electrolyte"
            >
              <OptGroup label="Electrolyte">
                <Option value="">Any</Option>
              </OptGroup>
            </Select>
          </Col>
          <Col
            span={6}
            style={{ display: "flex", flexDirection: "column", margin: "10px" }}
          >
            <h7 style={{ fontWeight: "700", marginBottom: "5px" }}>
              Type of Test
            </h7>
            <Select
              loading={!filterOptionsLoaded}
              value={selectedFilters.test}
              allowClear={true}
              onChange={(value) => {
                onFilterChange("test", value);
              }}
              style={{
                minWidth: 120,
              }}
              className="filter-select"
              placeholder="Type of Test"
              dropdownStyle={{ borderRadius: "5px" }}
            >
              <OptGroup label="Type of Test">
                <Option value="">Any</Option>
                <Option value="Cell Thermal Performance">
                  Cell Thermal Performance
                </Option>
                <Option value="Thermal Runaway">Thermal Runaway</Option>
                <Option value="Aging">Aging</Option>
                {metadataSummary["test_type"].map((item) => (
                  <Option value={item}>{item}</Option>
                ))}
              </OptGroup>
            </Select>
          </Col>
          <Col
            span={6}
            style={{ display: "flex", flexDirection: "column", margin: "10px" }}
          >
            <h7 style={{ fontWeight: "700", marginBottom: "5px" }}>
              Energy Density of Pack
            </h7>
            <Select
              loading={!filterOptionsLoaded}
              value={selectedFilters.energy_density_of_pack}
              onChange={(value) => {
                onFilterChange("energy_density_of_pack", value);
              }}
              allowClear={true}
              style={{
                minWidth: 180,
              }}
              className="filter-select"
              placeholder="Energy Density of Pack"
            >
              <OptGroup label="Energy Density of Pack">
                <Option value="">Any</Option>
              </OptGroup>
            </Select>
          </Col>
          <Col
            span={6}
            style={{ display: "flex", flexDirection: "column", margin: "10px" }}
          >
            <div style={{ display: "flex", flexDirection: "column" }}>
              <h7 style={{ fontWeight: "700", marginBottom: "5px" }}>
                Cell Type
              </h7>
              <Select
                loading={!filterOptionsLoaded}
                allowClear={true}
                style={{
                  maxWidth: 300,
                }}
                onChange={(value) => {
                  onFilterChange("pack", value);
                }}
                value={selectedFilters.pack}
                className="filter-select"
                placeholder="Cell Type"
                dropdownStyle={{ borderRadius: "5px" }}
              >
                <OptGroup label="Cell Type">
                  <Option value="">Any</Option>
                  <Option disabled={true} value="single">
                    Single
                  </Option>
                  <Option disabled={true} value="pack">
                    Pack
                  </Option>
                </OptGroup>
              </Select>
            </div>
          </Col>
        </Row>
        <br></br>
        <br></br>
        <Row style={{ justifyContent: "space-evenly" }}>
          <Col span={4} style={{ paddingRight: "20px" }}>
            <h7 style={{ fontWeight: "700" }}>Charge C Rate</h7>
            <Slider
              onAfterChange={(value) => {
                onFilterChange("crate_c", value);
              }}
              className="filter-slider"
              range
              defaultValue={[
                metadataSummary["charge_rate"]["min"],
                metadataSummary["charge_rate"]["max"],
              ]}
              min={metadataSummary["charge_rate"]["min"]}
              max={metadataSummary["charge_rate"]["max"]}
              step="0.01"
              marks={{
                [metadataSummary["charge_rate"]["min"]]:
                  metadataSummary["charge_rate"]["min"],
                [metadataSummary["charge_rate"]["max"]]:
                  metadataSummary["charge_rate"]["max"],
              }}
            />
          </Col>
          <Col span={4} style={{ paddingRight: "20px" }}>
            <h7 style={{ fontWeight: "700" }}>Discharge C Rate</h7>
            <Slider
              onAfterChange={(value) => {
                onFilterChange("crate_d", value);
              }}
              className="filter-slider"
              range
              defaultValue={[
                metadataSummary["discharge_rate"]["min"],
                metadataSummary["discharge_rate"]["max"],
              ]}
              min={metadataSummary["discharge_rate"]["min"]}
              max={metadataSummary["discharge_rate"]["max"]}
              step="0.01"
              marks={{
                [metadataSummary["discharge_rate"]["min"]]:
                  metadataSummary["discharge_rate"]["min"],
                [metadataSummary["discharge_rate"]["max"]]:
                  metadataSummary["discharge_rate"]["max"],
              }}
            />
          </Col>
          <Col span={4} style={{ paddingRight: "20px" }}>
            <h7 style={{ fontWeight: "700", marginBottom: "5px" }}>
              Operating Voltage
            </h7>
            <Slider
              onAfterChange={(value) => {
                onFilterChange("operating_voltage", value);
              }}
              className="filter-slider"
              range
              defaultValue={[
                metadataSummary["operating_voltage"]["min"],
                metadataSummary["operating_voltage"]["max"],
              ]}
              min={metadataSummary["operating_voltage"]["min"]}
              max={metadataSummary["operating_voltage"]["max"]}
              step="0.01"
              marks={{
                [metadataSummary["operating_voltage"]["min"]]:
                  metadataSummary["operating_voltage"]["min"],
                [metadataSummary["operating_voltage"]["max"]]:
                  metadataSummary["operating_voltage"]["max"],
              }}
            />
          </Col>
          <Col span={4} style={{ paddingRight: "20px" }}>
            <h7 style={{ fontWeight: "700" }}>Temperature °C</h7>
            <Slider
              defaultValue={[
                metadataSummary["temperature"]["min"],
                metadataSummary["temperature"]["max"],
              ]}
              onChange={(value) => {
                onFilterChange("temperature", value);
              }}
              className="filter-slider"
              range
              min={metadataSummary["temperature"]["min"]}
              max={metadataSummary["temperature"]["max"]}
              step="0.01"
              marks={{
                [metadataSummary["temperature"]["min"]]:
                  metadataSummary["temperature"]["min"],
                [metadataSummary["temperature"]["max"]]:
                  metadataSummary["temperature"]["max"],
              }}
            />
          </Col>
          <Col span={4} style={{ paddingRight: "20px" }}>
            <h7 style={{ fontWeight: "700" }}>Capacity Ah</h7>
            <Slider
              defaultValue={[
                metadataSummary["capacity"]["min"],
                metadataSummary["capacity"]["max"],
              ]}
              onChange={(value) => {
                onFilterChange("ah", value);
              }}
              className="filter-slider"
              range
              min={metadataSummary["capacity"]["min"]}
              max={metadataSummary["capacity"]["max"]}
              step="0.01"
              marks={{
                [metadataSummary["capacity"]["min"]]:
                  metadataSummary["capacity"]["min"],
                [metadataSummary["capacity"]["max"]]:
                  metadataSummary["capacity"]["max"],
              }}
            />
          </Col>
        </Row>
        <br></br>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            paddingRight: "20px",
          }}
        >
          <Button
            onClick={() => {
              setAppliedFilterCount(0);
              setSelectedFilters(initialFilters);
              setSearchFilterOpen(false);
              action.refreshSidebar(null, null, null, null, "type-2");
              onClear();
            }}
            style={{ fontSize: "17px", color: "black", margin: "10px" }}
            type="link"
          >
            <u>Reset & Load</u>
          </Button>
          <Button
            style={{
              display: "flex",
              background: "#212529",
              color: "white",
              fontWeight: "600",
              height: "50px",
              padding: "10px",
              borderRadius: "7px",
            }}
            onClick={() => {
              setSearchFilterOpen(false);
              action.refreshSidebar(null, null, null, null, "type-2");
              onClear();
            }}
          >
            Show results
          </Button>
        </div>
      </Modal>
      <Sider
        trigger={null}
        collapsible
        style={{
          position: "sticky",
          maxHeight: "100vh",
          left: 0,
          top: 80,
          bottom: 0,
          padding: "0.5rem 0.5rem",
          borderRadius: "5px",
          marginRight: "5px",
        }}
        collapsedWidth={50}
        width={300}
        theme="light"
        className="shadow"
      >
        <SimpleBarReact style={{ maxHeight: "90vh" }}>
          <>
            <Search
              className="py-2"
              placeholder="Search"
              onChange={(e) => onChange(e)}
            />
            <div className="row justify-content-around pb-2">
              <div className="col-md-6">
                <Button
                  type="primary"
                  block
                  onClick={() => onClear()}
                  disabled={!checkedKeys.length}
                  danger
                >
                  Clear
                </Button>
              </div>
              <div className="col-md-6">
                <Button
                  type="primary"
                  block
                  onClick={() => onLoad("type-2")}
                  disabled={!checkedKeys.length}
                >
                  Load
                </Button>
              </div>
            </div>
            {props.type === "cycle" ? (
              <div className="row justify-content-around pb-2">
                <div className="col-md-12">
                  <Button
                    type="primary"
                    block
                    onClick={() => setSearchFilterOpen(true)}
                  >
                    Filters ({appliedFilterCount})
                  </Button>
                </div>
              </div>
            ) : null}
            {error ? (
              <Result status="warning" extra={<p>Error loading data!</p>} />
            ) : null}
            <div style={{ minHeight: "100%" }}>
              {isCelldataLoaded ? (
                <>
                  <div
                    className="text-muted"
                    style={{ float: "right", fontSize: "0.8rem" }}
                  >
                    Selected: {checkedCellIds.length}
                  </div>
                  <Tree
                    checkable
                    showLine
                    onCheck={onCheck}
                    checkedKeys={checkedKeys}
                    treeData={setSideBarData(filteredTreeData)}
                    autoExpandParent={true}
                    defaultExpandedKeys={[
                      "amplabs",
                      "datamatrio",
                      "private",
                      "public",
                    ]}
                  />
                </>
              ) : (
                <Spin
                  className="d-flex justify-content-center align-items-center"
                  style={{ height: "50vh" }}
                  size = "default"
                />
              )}
            </div>
          </>
        </SimpleBarReact>
      </Sider>
    </>
  );
};

export default SideBar;
