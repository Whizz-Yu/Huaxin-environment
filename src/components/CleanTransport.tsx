/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { GateRecord, CleaningVehicle } from "../types";
import { motion, AnimatePresence } from "motion/react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Car,
  CheckCircle,
  AlertOctagon,
  Phone,
  Power,
  RotateCw,
  Gauge,
  Navigation,
  Sparkles,
  Info,
  Layers,
  ArrowRight,
  ShieldCheck,
  Send,
  GitBranch,
  Video,
  Database,
  Calendar,
  Sliders,
  Play,
  RotateCcw,
  PlusCircle,
  Download,
  Search,
  Eye,
  FileSpreadsheet,
  AlertTriangle,
  MapPin,
  ChevronRight,
  ChevronDown,
  Folder,
  Maximize2,
  Clock,
  User,
  Check,
  HelpCircle,
  Activity,
  ListCollapse,
  TrendingUp,
  Percent,
  Compass,
  FileText
} from "lucide-react";

interface CleanTransportProps {
  gateRecords: GateRecord[];
  cleaningVehicles: CleaningVehicle[];
  onManualApproveGate: (recordId: string) => void;
  onDispatchVehicle: (vehicleId: string, status: "working" | "idle") => void;
}

// Complete Mock data for Detailed 进出厂电子台账 with 23 requested fields (Today Logistics Inbound Gate Ledger)
interface ExtendedGateRecord {
  id: string;
  entranceId: string;       // 出入口编号
  gateId: string;           // 道闸编号
  directionText: "进厂" | "出厂"; // 进出厂状态
  time: string;             // 进、出厂时间
  photoUrl: string;         // 进、出厂照片 (Mock Unsplash)
  plateNumber: string;      // 车牌号码
  plateColor: "黄牌" | "绿牌" | "蓝牌" | "白牌"; // 号牌颜色
  vehicleType: string;      // 车辆类型
  vin: string;              // 车辆识别代码 (VIN)
  registeredDate: string;   // 注册登记日期
  vehicleModel: string;     // 车辆型号
  engineModel: string;      // 发动机型号
  engineManufacturer: string; // 发动机生产厂
  engineNumber: string;     // 发动机编号
  fuelType: "重柴油" | "纯电动" | "混合动力" | "LNG天然气"; // 燃料类型
  emissionStandard: "新能源" | "国六" | "国五" | "国五以下"; // 排放标准
  utilisationType: "货运运输" | "非营运回送" | "厂内周转"; // 使用性质
  networkStatus: "正常连接部网" | "单机脱机缓存" | "信号偏离调试"; // 联网状态
  escortListCode: string;   // 随车清单单号
  driverLicenseStatus: "核对合格" | "年审超期临界" | "非B2/A2报警"; // 行驶证状态
  cargoName: string;        // 运输货物名称
  cargoWeight: number;      // 运输量 (吨)
  fleetName: string;        // 车队名称
}

// Complete Mock data for 厂内运输车辆台账 (Internal Fleet Environmental Register)
interface InternalVehicle {
  id: string;
  envRegisterCode: string;   // 环保登记编码
  vin: string;               // 车辆识别代码 (VIN)
  productionDate: string;    // 生产日期
  plateNumber: string;       // 车牌号码
  registeredDate: string;    // 注册登记日期
  vehicleModel: string;      // 车辆型号
  engineModel: string;       // 发动机型号
  engineManufacturer: string;  // 发动机生产厂
  engineNumber: string;      // 发动机编号
  fuelType: string;          // 燃料类型
  emissionStandard: string;  // 排放标准
  escortListStatus: string;  // 随车清单关联状态
  driverLicenseStatus: string; // 行驶证检验
  ownerUnit: string;         // 车辆所有人(单位)
}

// Complete Mock data for 非道路移动机械台账 (Non-road Machinery Registry)
interface NonRoadMachinery {
  id: string;
  envRegisterCode: string;   // 环保登记编码
  productionDate: string;    // 机械生产日期
  plateNumber: string;       // 车牌号码 (例如: 湘53012-G)
  emissionStandard: string;  // 排放标准 (国四、国三等)
  fuelType: string;          // 燃料类型 (柴油、电能)
  machineryType: string;     // 机械种类 (轮式装载机、泵车、履带式液压挖掘机)
  pin: string;               // 机械环保代码/产品识别码 (PIN)
  machineryModel: string;    // 机械型号
  engineModel: string;       // 发动机型号
  engineManufacturer: string;  // 发动机生产厂
  engineNumber: string;      // 发动机编号
  chassisPlate: "已铆接打刻钢印" | "无" | "损坏"; // 整车(机)铭牌状态
  enginePlate: "原厂打刻清晰" | "模糊";    // 发动机铭牌状态
  envTagStatus: "贴有绿色环保标签" | "无"; // 机械环保标签
  ownerUnit: string;         // 所属人(单位)
}

// Definition of 10 separate pages (sub-functions)
type SubPageType = 
  | "production_env"        // 1. 生产环境检测
  | "cumulative_cars"       // 2. 累计进车量
  | "clean_transport_rate"  // 3. 清洁运输率
  | "gate_control_system"   // 4. 门禁管理系统
  | "running_status"        // 5. 运行状态
  | "event_display"         // 6. 事件显示
  | "electronic_ledger"     // 7. 门禁电子台账
  | "video_display"         // 8. 视频显示
  | "transport_mode_stats"  // 9. 运输方式统计
  | "sanitation_vehicles";  // 10. 环卫车

export default function CleanTransport({
  gateRecords,
  cleaningVehicles,
  onManualApproveGate,
  onDispatchVehicle,
}: CleanTransportProps) {
  
  // State to manage the active page amongst the 10 child functions
  const [activeSubPage, setActiveSubPage] = useState<SubPageType>("production_env");

  // --- CCTV Video Surveillance states ---
  const [selectedCctvNode, setSelectedCctvNode] = useState<string>("煤棚入口");
  const [activeCameraIndex, setActiveCameraIndex] = useState<number>(1);
  const [cctvLayout, setCctvLayout] = useState<number>(20); // 1, 4, 9, 16, 20
  const [ptzZoom, setPtzZoom] = useState<number>(4.0);
  const [ptzAperture, setPtzAperture] = useState<number>(35);
  const [ptzFocus, setPtzFocus] = useState<number>(75);
  const [ptzSpeed, setPtzSpeed] = useState<number>(45);
  const [isLightActive, setIsLightActive] = useState<boolean>(false);
  const [isWiperActive, setIsWiperActive] = useState<boolean>(false);
  const [isTourActive, setIsTourActive] = useState<boolean>(false);
  const [isWatchActive, setIsWatchActive] = useState<boolean>(false);
  const [ptzDirectionText, setPtzDirectionText] = useState<string>("静止监听");
  const [ptzPanValue, setPtzPanValue] = useState<number>(218.4);
  const [ptzTiltValue, setPtzTiltValue] = useState<number>(12.6);
  const [cctvSearchQuery, setCctvSearchQuery] = useState<string>("");
  const [cctvCollapsedFolders, setCctvCollapsedFolders] = useState<Record<string, boolean>>({
    coking: false,
    coal: false,
    coke: false,
    others: true,
  });

  // Auto CCTV Tour Interval
  React.useEffect(() => {
    if (!isTourActive) return;
    const interval = setInterval(() => {
      setActiveCameraIndex(prev => {
        const next = prev + 1;
        return next > cctvLayout ? 1 : next;
      });
    }, 2800);
    return () => clearInterval(interval);
  }, [isTourActive, cctvLayout]);

  // --- Sub-Module States & Data ---

  // 1. Production Environment Detection State
  const [selectedDirectoryPath, setSelectedDirectoryPath] = useState<string>("areas/core/north_gate");
  const directoryTree = [
    {
      id: "areas/core",
      name: "华新一期核心生产区",
      type: "area",
      children: [
        {
          id: "areas/core/north_gate",
          name: "01号北门重卡进出主道",
          type: "gate",
          devices: ["1A道闸雷达", "ANPR尾气检测气帘系统", "超清热成像抓拍机-1", "尾气遥感遥测发射仪"]
        },
        {
          id: "areas/core/east_gate",
          name: "02号东大门出厂核实道闸",
          type: "gate",
          devices: ["2A道闸雷达", "国六核验数据网关框", "智能门页闭锁定频仪"]
        }
      ]
    },
    {
      id: "areas/logistics",
      name: "原料物流堆存大棚区",
      type: "area",
      children: [
        {
          id: "areas/logistics/west_gate",
          name: "03号西侧辅料进车专属门禁",
          type: "gate",
          devices: ["3B重卡地坪地磅感应", "PM2.5超微抓拍机-3", "高空降尘气密封锁阀"]
        },
        {
          id: "areas/logistics/dock_gate",
          name: "04号码头皮带输送装卸道闸",
          type: "gate",
          devices: ["水尺声纳感应柜", "皮带封皮密实红外仪"]
        }
      ]
    },
    {
      id: "areas/cement",
      name: "熟料与水泥包装出厂区",
      type: "area",
      children: [
        {
          id: "areas/cement/south_gate",
          name: "05号南门水泥运输车门禁",
          type: "gate",
          devices: ["4A气态快速排析仪", "智能自动抬杆高频控制箱", "环保随车清单识别网关"]
        }
      ]
    }
  ];

  const currentNodeName = useMemo(() => {
    for (const area of directoryTree) {
      if (area.id === selectedDirectoryPath) return area.name;
      for (const gate of area.children) {
        if (gate.id === selectedDirectoryPath) return gate.name;
      }
    }
    return "01号北门重卡进出主道";
  }, [selectedDirectoryPath]);

  // 2. Gate Control System states
  const [gateSystemMode, setGateSystemMode] = useState<"auto" | "manual">("auto");
  const [barrierState, setBarrierState] = useState<"closed" | "opened">("closed");
  const [totalBarrierRaises, setTotalBarrierRaises] = useState<number>(1420);

  // 3. Events Log State
  const [gateEvents, setGateEvents] = useState<Array<{
    id: string;
    time: string;
    gateNode: string;
    type: "info" | "warn" | "success";
    message: string;
  }>>([
    { id: "evt-1", time: "10:52:14", gateNode: "01号北门重卡通道", type: "success", message: "新能源车 云A·83G13 随车清单白名单比对合规，指令自动抬杆开闸，道闸秒级自动复位" },
    { id: "evt-2", time: "10:48:30", gateNode: "03号西侧辅料大门", type: "warn", message: "警报! 探测到未核减排放车辆 冀A·RD582 强闯，部网尾气阶段为【国五】,闸口锁定执行硬件拦截" },
    { id: "evt-3", time: "10:42:01", gateNode: "05号南门水泥大门", type: "info", message: "环保网端上级数据合流：成功拉取并导入25辆特约绿色物流重卡随车清单卡" },
    { id: "evt-4", time: "10:31:55", gateNode: "02号东大门通道", type: "info", message: "操作员 cowleszdqzh@gmail.com 登录中控对道闸机 2A 调试，上传动态抓拍更新固件" },
  ]);

  // 4. Ledger tabs (今日进出厂大车, 厂内运输车, 非道路移动机械)
  const [activeLedgerTab, setActiveLedgerTab] = useState<number>(0);
  const [ledgerSearchQuery, setLedgerSearchQuery] = useState<string>("");

  const [inboundLedger, setInboundLedger] = useState<ExtendedGateRecord[]>([
    {
      id: "gt-01",
      entranceId: "IN-GATE-01B",
      gateId: "BARRIER-CORE-A1",
      directionText: "进厂",
      time: "10:52:14",
      photoUrl: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=260&auto=format&fit=crop&q=60",
      plateNumber: "云A·83G13",
      plateColor: "绿牌",
      vehicleType: "重型半挂纯电自卸车",
      vin: "LSG99A82D8819A14F",
      registeredDate: "2024-05-18",
      vehicleModel: "三一重工纯电EV-550",
      engineModel: "TZ400XS-SANY-02",
      engineManufacturer: "三一重工动力系统部",
      engineNumber: "SANY-EV-99120",
      fuelType: "纯电动",
      emissionStandard: "新能源",
      utilisationType: "货运运输",
      networkStatus: "正常连接部网",
      escortListCode: "ESC-20260603-0842",
      driverLicenseStatus: "核对合格",
      cargoName: "高热煤燃料粉炭",
      cargoWeight: 45.2,
      fleetName: "华能绿色运力车队"
    },
    {
      id: "gt-02",
      entranceId: "IN-GATE-01B",
      gateId: "BARRIER-CORE-A1",
      directionText: "进厂",
      time: "10:48:30",
      photoUrl: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=260&auto=format&fit=crop&q=60",
      plateNumber: "冀A·RD582",
      plateColor: "黄牌",
      vehicleType: "重载砂石柴油自卸挂车",
      vin: "LHG458X88D394142B",
      registeredDate: "2019-11-20",
      vehicleModel: "陕汽德龙 F3000",
      engineModel: "WP12.375E50",
      engineManufacturer: "潍柴动力股份有限公司",
      engineNumber: "WEICHAI-442819",
      fuelType: "重柴油",
      emissionStandard: "国五以下",
      utilisationType: "货运运输",
      networkStatus: "正常连接部网",
      escortListCode: "ESC-20260603-0915",
      driverLicenseStatus: "年审超期临界",
      cargoName: "生石灰碎料",
      cargoWeight: 38.5,
      fleetName: "冀北通物流运输队"
    },
    {
      id: "gt-03",
      entranceId: "OUT-GATE-02A",
      gateId: "BARRIER-EAST-B1",
      directionText: "出厂",
      time: "10:30:15",
      photoUrl: "https://images.unsplash.com/photo-1590487988256-9ed24133863e?w=260&auto=format&fit=crop&q=60",
      plateNumber: "鄂F·F2039",
      plateColor: "蓝牌",
      vehicleType: "中型自卸运输货车",
      vin: "LFE201A990B384918",
      registeredDate: "2021-04-12",
      vehicleModel: "东风天锦 DFL1160",
      engineModel: "ISD180 50",
      engineManufacturer: "东风康明斯发动机",
      engineNumber: "CUMMINS-0941A",
      fuelType: "重柴油",
      emissionStandard: "国六",
      utilisationType: "货运运输",
      networkStatus: "正常连接部网",
      escortListCode: "ESC-20260603-0518",
      driverLicenseStatus: "核对合格",
      cargoName: "熟料石膏辅料",
      cargoWeight: 24.0,
      fleetName: "江汉大通物流社"
    }
  ]);

  const [internalLedger, setInternalLedger] = useState<InternalVehicle[]>([
    {
      id: "int-01",
      envRegisterCode: "HB-530129-014",
      vin: "LSG99A20E9938A881",
      productionDate: "2024-03-12",
      plateNumber: "云A·39D11",
      registeredDate: "2024-04-05",
      vehicleModel: "宇通重工YZ400纯电搅拌车",
      engineModel: "TZ380XS-YUTONG",
      engineManufacturer: "河南宇通电马达事业部",
      engineNumber: "YT-EV-88241",
      fuelType: "纯电动",
      emissionStandard: "新能源",
      escortListStatus: "长期内循环白单绑定",
      driverLicenseStatus: "合格年审在案",
      ownerUnit: "华新禄劝水泥有限公司"
    },
    {
      id: "int-02",
      envRegisterCode: "HB-530129-092",
      vin: "LH40201FA1941A582",
      productionDate: "2022-08-15",
      plateNumber: "云A·772D9",
      registeredDate: "2022-10-18",
      vehicleModel: "重汽豪沃TX柴油洒水喷淋车",
      engineModel: "MC11.44-60",
      engineManufacturer: "中国重汽集团发动机厂",
      engineNumber: "SINOTRUK-66812",
      fuelType: "重柴油",
      emissionStandard: "国六",
      escortListStatus: "无(清洁作业车豁免)",
      driverLicenseStatus: "合格年审在案",
      ownerUnit: "昆明绿化环卫保洁集团"
    }
  ]);

  const [nonRoadLedger, setNonRoadLedger] = useState<NonRoadMachinery[]>([
    {
      id: "mach-01",
      envRegisterCode: "HB-MCH-530129-0012",
      productionDate: "2021-06-20",
      plateNumber: "临·5301-A242",
      emissionStandard: "国四非道路重工",
      fuelType: "重柴油",
      machineryType: "轮式装载机",
      pin: "PIN992A82C7581B82",
      machineryModel: "柳工 CLG856H",
      engineModel: "Cummins QSB6.7",
      engineManufacturer: "广西康明斯发动机有限公司",
      engineNumber: "CUMMINS-7758319",
      chassisPlate: "已铆接打刻钢印",
      enginePlate: "原厂打刻清晰",
      envTagStatus: "贴有绿色环保标签",
      ownerUnit: "华新禄劝矿山采出班组"
    },
    {
      id: "mach-02",
      envRegisterCode: "HB-MCH-530129-0391",
      productionDate: "2023-02-14",
      plateNumber: "临·5301-G912",
      emissionStandard: "新能源非道路机械",
      fuelType: "纯电能",
      machineryType: "履带式液压挖掘机",
      pin: "PIN118F201D992CA34",
      machineryModel: "三一重机 SY215C-H",
      engineModel: "E-MOTOR-SANY220",
      engineManufacturer: "湖南三一伺服电机部",
      engineNumber: "SANY-MOTOR-8241",
      chassisPlate: "已铆接打刻钢印",
      enginePlate: "原厂打刻清晰",
      envTagStatus: "贴有绿色环保标签",
      ownerUnit: "临沧联程土石方合伙部"
    }
  ]);

  // 5. Transportation mode statistical filters
  const [filterStartTime, setFilterStartTime] = useState<string>("2026-05-01");
  const [filterEndTime, setFilterEndTime] = useState<string>("2026-06-03");
  const [filterSelectedMethod, setFilterSelectedMethod] = useState<string>("ALL");

  const rawTransportLogs = [
    { id: "tr-01", date: "2026-06-02", method: "皮带廊道运输", count: 142, cargo: "矿山原石灰石", totalWeight: 8420 },
    { id: "tr-02", date: "2026-06-01", method: "铁路专用线", count: 12, cargo: "熟料/散装水泥", totalWeight: 3200 },
    { id: "tr-03", date: "2026-05-28", method: "管道密封运送", count: 96, cargo: "热电锅炉脱硫剂", totalWeight: 1450 },
    { id: "tr-04", date: "2026-05-20", method: "新能源自卸卡车", count: 284, cargo: "纸袋包装水泥", totalWeight: 4200 },
    { id: "tr-05", date: "2026-05-15", method: "国六高标卡车", count: 48, cargo: "高炉水渣矿粉", totalWeight: 1100 },
  ];

  const filteredTransportLogs = useMemo(() => {
    return rawTransportLogs.filter(log => {
      const isDateOk = log.date >= filterStartTime && log.date <= filterEndTime;
      const isMethodOk = filterSelectedMethod === "ALL" || log.method.includes(filterSelectedMethod);
      return isDateOk && isMethodOk;
    });
  }, [filterStartTime, filterEndTime, filterSelectedMethod]);

  const transportModeData = [
    { name: "皮带式廊道运输", value: 34, color: "#22d3ee", desc: "封闭输送机直接入库，无扬尘溢出" },
    { name: "铁路专用线运输", value: 28, color: "#3b82f6", desc: "直达水泥配发大站，重运力支持" },
    { name: "管道密封运送", value: 12, color: "#8b5cf6", desc: "气料合一高密封，零辅料路耗" },
    { name: "新能源汽运", value: 18, color: "#10b981", desc: "纯电自卸卡车，环保自动识别抬杆" },
    { name: "常规特许汽运", value: 8, color: "#f59e0b", desc: "国六/国五过渡段汽运，按部网备案放行" },
  ];

  // Helper Toast Alerts
  const [liveToast, setLiveToast] = useState<string | null>(null);
  const triggerToast = (text: string) => {
    setLiveToast(text);
    setTimeout(() => setLiveToast(null), 4000);
  };

  const handleExportTransportCSV = () => {
    let csvContent = "\uFEFF"; // UTF-8 BOM
    csvContent += "结算日期,运输方式,过车/发运频率(24h),大宗货物种类,运输总量(吨)\n";
    filteredTransportLogs.forEach(row => {
      csvContent += `${row.date},${row.method},${row.count}次,${row.cargo},${row.totalWeight}吨\n`;
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `清洁运输货量及运输方式核查报表_${filterStartTime}_${filterEndTime}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    triggerToast(`📊 运输方式数据表导出完成！共包含 ${filteredTransportLogs.length} 条已核验的磅单/皮带秤记录。`);
  };

  // Switch gate operating auto/manual modes
  const handleToggleGateMode = () => {
    const nextMode = gateSystemMode === "auto" ? "manual" : "auto";
    setGateSystemMode(nextMode);
    triggerToast(`⚙ 闸门控制权更迭: 已转换至 【${nextMode === "auto" ? "全自动遥控识别" : "中控人工授权开闸"}】 运行模式`);
  };

  // Manual break gate
  const handleTriggerManualBarrier = () => {
    setBarrierState(prev => (prev === "closed" ? "opened" : "closed"));
    setTotalBarrierRaises(prev => prev + 1);
    
    const newEvt = {
      id: `evt-${Date.now()}`,
      time: new Date().toTimeString().split(" ")[0],
      gateNode: currentNodeName,
      type: "warn" as const,
      message: `操作员(cowleszdqzh@gmail.com)发出紧急中控越权指令，物理闸杠由 [${barrierState === "closed" ? "落杆拦截" : "升杠放行"}] 强锁为 [${barrierState === "closed" ? "升杠放行" : "落杆拦截"}]`
    };
    setGateEvents(prev => [newEvt, ...prev]);
    triggerToast(barrierState === "closed" ? "🔓 指令下发成功：电磁阻尼离合吸合，道闸强制抬升。" : "🔒 指令下发成功：释放道闸，复位落杆。");
  };

  // Add dummy vehicle scan
  const handleAddInboundDummyRow = () => {
    const letters = ["A", "B", "C", "F"];
    const randomPlate = "云" + letters[Math.floor(Math.random() * letters.length)] + "·" + Math.floor(10000 + Math.random() * 90000);
    const isElectric = Math.random() > 0.45;
    const timeNow = new Date().toTimeString().split(" ")[0];
    
    const newRow: ExtendedGateRecord = {
      id: `gt-gen-${Date.now()}`,
      entranceId: "IN-GATE-04A",
      gateId: "BARRIER-CORE-A1",
      directionText: "进厂",
      time: timeNow,
      photoUrl: isElectric 
        ? "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=260&auto=format&fit=crop&q=60" 
        : "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=260&auto=format&fit=crop&q=60",
      plateNumber: randomPlate,
      plateColor: isElectric ? "绿牌" : "黄牌",
      vehicleType: isElectric ? "重型纯电物流自卸车" : "燃油高标物料重卡",
      vin: "LSG" + Math.random().toString(36).substring(2, 10).toUpperCase() + "741BFR",
      registeredDate: isElectric ? "2024-03-20" : "2020-03-12",
      vehicleModel: isElectric ? "宇通重卡EV-900" : "陕汽德龙WP12",
      engineModel: isElectric ? "TZ390-YT-EV" : "WP12.375E54",
      engineManufacturer: isElectric ? "宇通电控制造" : "潍柴动力制造",
      engineNumber: "ENG-" + Math.floor(10000 + Math.random() * 90000),
      fuelType: isElectric ? "纯电动" : "重柴油",
      emissionStandard: isElectric ? "新能源" : "国六",
      utilisationType: "货运运输",
      networkStatus: "正常连接部网",
      escortListCode: "ESC-20260603-" + Math.floor(1000 + Math.random() * 9000),
      driverLicenseStatus: "核对合格",
      cargoName: isElectric ? "高铝熟料砂矿" : "生石灰球团",
      cargoWeight: Math.floor(30 + Math.random() * 15),
      fleetName: isElectric ? "华新绿动能一队" : "联程外雇柴油车组"
    };

    setInboundLedger(prev => [newRow, ...prev]);

    // Push into event log
    const logItem = {
      id: `evt-${Date.now()}`,
      time: timeNow,
      gateNode: currentNodeName,
      type: (isElectric ? "success" : "info") as any,
      message: `ANPR抓拍触发: 扫码捕捉车牌 [${newRow.plateNumber}], 尾气标准 [${newRow.emissionStandard}], 符合排放限值, 电控抬杠放行。`
    };
    setGateEvents(prev => [logItem, ...prev]);
    triggerToast(`🚗 车辆 ${newRow.plateNumber} (${newRow.emissionStandard}) 抵达，已添加至今日进出厂电子台账中`);
  };

  // Left sidebar items configuration (10 isolated pages)
  const menuConfig = [
    {
      group: "门禁管理子模块 (Gate Management Component)",
      items: [
        { id: "production_env", label: "生产环境检测", icon: Layers, desc: "关口/传感器/对射层级联控", countBadge: null },
        { id: "cumulative_cars", label: "累计进车量", icon: Car, desc: "绿色/国六/黄标分类计数", countBadge: "4类别" },
        { id: "clean_transport_rate", label: "清洁运输率", icon: TrendingUp, desc: "皮带/管道及新能源趋势折线", countBadge: "近3月" },
        { id: "gate_control_system", label: "门禁管理系统", icon: Sliders, desc: "手/自闸杠控制与车辆仿真", countBadge: "动画" },
        { id: "running_status", label: "运行状态", icon: Power, desc: "设备运转模式及报警状态", countBadge: "正常" },
        { id: "event_display", label: "事件显示", icon: Activity, desc: "大门实时出入预警与历史行为", countBadge: "实时" },
        { id: "electronic_ledger", label: "门禁电子台账", icon: Database, desc: "1比1环保随车/机械全归属登记", countBadge: "3子账" },
        { id: "video_display", label: "视频显示", icon: Video, desc: "现场ANPR视频与OCR流馈入", countBadge: "2K监控" },
        { id: "transport_mode_stats", label: "运输方式统计", icon: FileText, desc: "多元运力饼图占比及账单导出", countBadge: "Excel" },
      ]
    },
    {
      group: "环卫车辆子模块 (Sanitation Vehicles)",
      items: [
        { id: "sanitation_vehicles", label: "环卫车管理", icon: Navigation, desc: "高精度GPS洒水降尘雾炮保洁", countBadge: `${cleaningVehicles.length}辆在册` },
      ]
    }
  ];

  return (
    <div className="bg-slate-950/80 border border-slate-900 rounded-2xl overflow-hidden shadow-2xl text-slate-200 flex flex-col xl:flex-row min-h-[660px]">
      
      {/* LEFT NAVIGATION COLUMN CONSOLE */}
      <div className="w-full xl:w-[280px] bg-slate-950 border-b xl:border-b-0 xl:border-r border-slate-900 p-4.5 flex flex-col justify-between shrink-0">
        <div className="space-y-4">
          
          {/* Module Logo / Title */}
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="p-1.5 rounded-lg bg-cyan-950 border border-cyan-900 text-cyan-400">
                <Car className="h-5 w-5" />
              </div>
              <h2 className="text-sm font-black text-slate-150 uppercase tracking-wide font-sans">
                清洁运输监控台
              </h2>
            </div>
            <p className="text-[10px] text-slate-500 leading-normal">
              标准协议: GB/T 38118 · 联网比对
            </p>
          </div>

          {/* Sub menu dividers */}
          <div className="space-y-4 pt-1">
            {menuConfig.map((group, gIdx) => (
              <div key={gIdx} className="space-y-1.5">
                <span className="text-[10px] uppercase font-black tracking-wider text-slate-600 block pl-1">
                  {group.group}
                </span>

                <div className="space-y-1">
                  {group.items.map((item) => {
                    const isSelected = activeSubPage === item.id;
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveSubPage(item.id as SubPageType)}
                        className={`w-full text-left p-2 rounded-xl transition-all cursor-pointer flex items-start gap-2.5 group relative ${
                          isSelected
                            ? "bg-slate-900 text-cyan-400 font-extrabold shadow-inner border border-slate-800"
                            : "text-slate-400 hover:bg-slate-900/40 hover:text-slate-200"
                        }`}
                      >
                        <Icon className={`h-4.5 w-4.5 mt-0.5 shrink-0 ${
                          isSelected ? "text-cyan-400" : "text-slate-500 group-hover:text-slate-350"
                        }`} />
                        <div className="overflow-hidden">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs truncate">{item.label}</span>
                            {item.countBadge && (
                              <span className={`text-[8.5px] font-mono px-1 rounded transform scale-90 ${
                                isSelected ? "bg-cyan-950 text-cyan-300 border border-cyan-900" : "bg-slate-900 text-slate-500"
                              }`}>
                                {item.countBadge}
                              </span>
                            )}
                          </div>
                          <span className="text-[9px] text-slate-500 block truncate font-normal">
                            {item.desc}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Console footer stats */}
        <div className="mt-8 pt-4 border-t border-slate-900 space-y-1.5 text-[9.5px] font-mono text-slate-500">
          <div className="flex justify-between">
            <span>在线网关层:</span>
            <span className="text-emerald-400">● 100% ONLINE</span>
          </div>
          <div className="flex justify-between">
            <span>中控身份:</span>
            <span className="text-cyan-400 truncate max-w-[110px]" title="cowleszdqzh@gmail.com">cowleszdqzh</span>
          </div>
        </div>

      </div>

      {/* RIGHT DISPLAY WORKSPACE CARD */}
      <div className="flex-1 bg-slate-950/40 p-5 flex flex-col justify-between overflow-x-hidden min-h-[600px]">
        
        <div>
          {/* Active Sub-page Dynamic Header */}
          <div className="border-b border-slate-900 pb-3 mb-5 flex justify-between items-center flex-wrap gap-2">
            <div>
              <div className="flex items-center gap-1.5 text-[10.5px] font-mono text-slate-500 uppercase tracking-widest">
                <span>清洁物料运输安全网关</span>
                <span>/</span>
                <span className="text-cyan-400 font-bold">
                  {activeSubPage === "production_env" && "生产环境检测"}
                  {activeSubPage === "cumulative_cars" && "已进厂累计排放统计"}
                  {activeSubPage === "clean_transport_rate" && "清洁运输达成率折线图"}
                  {activeSubPage === "gate_control_system" && "门禁管理自动化系统"}
                  {activeSubPage === "running_status" && "门区网关及卡口设备运行状态"}
                  {activeSubPage === "event_display" && "高频通行事件记录"}
                  {activeSubPage === "electronic_ledger" && "进出厂/非道路移动机械环保电子台账"}
                  {activeSubPage === "video_display" && "多路现场车牌通道视频汇流"}
                  {activeSubPage === "transport_mode_stats" && "大宗货物发运方式饼图与报表"}
                  {activeSubPage === "sanitation_vehicles" && "保洁洒水雾炮环卫车中控GIS组网"}
                </span>
              </div>
              <h1 className="text-lg font-black text-slate-100 font-sans tracking-tight mt-1.5">
                {activeSubPage === "production_env" && "🌲 生产环境检测"}
                {activeSubPage === "cumulative_cars" && "🚛 累计进车量统计"}
                {activeSubPage === "clean_transport_rate" && "📈 清洁运输率考评与国标"}
                {activeSubPage === "gate_control_system" && "🔓 智能闸机控制系统"}
                {activeSubPage === "running_status" && "⚡ 系统运行状态看板"}
                {activeSubPage === "event_display" && "📋 通行及预警事件显示"}
                {activeSubPage === "electronic_ledger" && "🗄 门禁电子台账国家目录档案"}
                {activeSubPage === "video_display" && "📹 现场卡口实时视频通道"}
                {activeSubPage === "transport_mode_stats" && "📊 多元运输方式量化分析"}
                {activeSubPage === "sanitation_vehicles" && "🧹 GPS环卫清洁车辆智慧作业流"}
              </h1>
            </div>

            {liveToast && (
              <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-xs tracking-wide text-cyan-300 font-mono flex items-center gap-2 animate-bounce">
                <Sparkles className="h-4 w-4 text-cyan-400 shrink-0" />
                <span>{liveToast}</span>
              </div>
            )}
          </div>

          {/* ========================================================
              DYNAMIC SUB-PAGES BODY
              ======================================================== */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSubPage}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
            >
              
              {/* PAGE 1: 生产环境检测 */}
              {activeSubPage === "production_env" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="bg-slate-950 border border-slate-900 rounded-xl p-4 md:col-span-1 space-y-4">
                    <span className="text-[11px] font-black uppercase text-cyan-400 font-mono tracking-widest block border-b border-slate-900 pb-1.5">
                      厂界及门口层级物理目录
                    </span>

                    <div className="space-y-3 text-xs">
                      {directoryTree.map((area) => (
                        <div key={area.id} className="space-y-1">
                          <div
                            onClick={() => setSelectedDirectoryPath(area.id)}
                            className={`p-1.5 rounded-lg cursor-pointer transition-all flex items-center gap-2 font-bold ${
                              selectedDirectoryPath === area.id 
                                ? "bg-slate-900 text-slate-100" 
                                : "text-slate-400 hover:text-slate-200"
                            }`}
                          >
                            <span>📂</span>
                            <span className="truncate">{area.name}</span>
                          </div>

                          <div className="pl-4 space-y-1">
                            {area.children.map((gate) => {
                              const isSelected = selectedDirectoryPath === gate.id;
                              return (
                                <div
                                  key={gate.id}
                                  onClick={() => setSelectedDirectoryPath(gate.id)}
                                  className={`p-1.5 rounded-md cursor-pointer transition-all flex items-center justify-between ${
                                    isSelected 
                                      ? "bg-slate-800 text-cyan-400 font-black border-l-2 border-cyan-400" 
                                      : "text-slate-450 hover:text-slate-250"
                                  }`}
                                >
                                  <span className="flex items-center gap-1.5 truncate">
                                    <span>🚪</span>
                                    <span>{gate.name}</span>
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-950 border border-slate-900 rounded-xl p-4 md:col-span-2 space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-900 pb-1.5">
                      <span className="text-xs font-black text-slate-200">
                        当前关联门禁系统：{currentNodeName}
                      </span>
                      <span className="text-[9.5px] font-mono text-emerald-400">已建立通讯映射</span>
                    </div>

                    <div className="text-xs text-slate-400 leading-relaxed space-y-3">
                      <p>
                        本系统严格根据层级关联逻辑设计，不同的目录节点绑定不同的现场检测物理柜及快速遥感遥测发射仪。一旦选中，中控可向对应雷达对射和气态分析阀下发传感器校准电平：
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-850">
                          <span className="text-[11px] font-bold text-slate-300 block">关联检测仪数量</span>
                          <span className="text-xl font-mono text-cyan-400 font-black block mt-1">
                            {directoryTree.find(a => a.id === selectedDirectoryPath)?.children?.flatMap(c => c.devices).length || 3} 个
                          </span>
                        </div>
                        <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-850">
                          <span className="text-[11px] font-bold text-slate-300 block">反向遥信控制阻抗</span>
                          <span className="text-xl font-mono text-emerald-400 font-black block mt-1">75 Ω (通畅)</span>
                        </div>
                      </div>

                      <div className="space-y-2 pt-2">
                        <span className="text-[9.5px] uppercase font-bold text-slate-500 block">
                          该门禁节点下的有线检测模块列表:
                        </span>
                        
                        <div className="space-y-1.5">
                          {["ANPR高清牌照识别主摄", "地平红外对射复位雷达", "大宗原料尾气气膜判识分析架"].map((dev, idx) => (
                            <div key={idx} className="flex justify-between items-center bg-slate-900/25 p-2 rounded border border-slate-900 text-xs font-mono">
                              <span className="text-slate-350">{dev}</span>
                              <span className="text-[9px] bg-emerald-950 text-emerald-400 px-1.5 py-0.2 rounded border border-emerald-900">OK</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* PAGE 2: 累计进车量 */}
              {activeSubPage === "cumulative_cars" && (
                <div className="space-y-4">
                  <div className="bg-slate-950 border border-slate-900 rounded-xl p-4">
                    <span className="text-xs font-bold text-slate-500 block uppercase tracking-wider font-mono mb-2">
                      过闸进厂大宗重载卡车排放阶段分类总表
                    </span>
                    
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
                      {/* Class A: Green */}
                      <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-850">
                        <div className="flex justify-between items-center text-slate-500 text-[10.5px]">
                          <span>纯电动 / 新能源卡车</span>
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        </div>
                        <span className="text-2xl font-mono font-black text-emerald-400 block mt-1.5">142 辆</span>
                        <div className="text-[9px] text-slate-500 mt-2">
                          占比 {(142 / (142 + 285 + 96 + 18) * 100).toFixed(1)}% | 华新主张首退绿牌
                        </div>
                      </div>

                      {/* Class B: Comply National VI */}
                      <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-850">
                        <div className="flex justify-between items-center text-slate-500 text-[10.5px]">
                          <span>柴油国六排放卡车</span>
                          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                        </div>
                        <span className="text-2xl font-mono font-black text-cyan-400 block mt-1.5">285 辆</span>
                        <div className="text-[9px] text-slate-500 mt-2">
                          占比 {(285 / (142 + 285 + 96 + 18) * 100).toFixed(1)}% | 符合大气一类区标准
                        </div>
                      </div>

                      {/* Class C: Comply National V */}
                      <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-850">
                        <div className="flex justify-between items-center text-slate-500 text-[10.5px]">
                          <span>柴油国五排放卡车</span>
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                        </div>
                        <span className="text-2xl font-mono font-black text-amber-500 block mt-1.5">96 辆</span>
                        <div className="text-[9px] text-slate-500 mt-2">
                          占比 {(96 / (142 + 285 + 96 + 18) * 100).toFixed(1)}% | 在重污染天气进行受限控制
                        </div>
                      </div>

                      {/* Class D: Below National V */}
                      <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-850">
                        <div className="flex justify-between items-center text-slate-500 text-[10.5px]">
                          <span>国五以下黄标车辆</span>
                          <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-ping" />
                        </div>
                        <span className="text-2xl font-mono font-black text-red-500 block mt-1.5">18 辆</span>
                        <div className="text-[9px] text-slate-550 mt-2">
                          占比 {(18 / (142 + 285 + 96 + 18) * 100).toFixed(1)}% | 无特批白卡，全阻拦截
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-900/30 p-4 border border-slate-900 rounded-xl space-y-2 text-xs text-slate-450 leading-relaxed">
                    <span className="text-cyan-400 font-bold block">💡 累计计数规范:</span>
                    <p>
                      过车量传感器每 60 秒上报结算至统一数据库，对符合“新能源”及“国六”绿色白名单大宗货卡，闸阀将联动释放；对不达标或无随车清单的国五、国五以下柴油挂卡发出蜂鸣和落锁信号，并反馈于中控事件控制层。
                    </p>
                  </div>
                </div>
              )}

              {/* PAGE 3: 清洁运输率 */}
              {activeSubPage === "clean_transport_rate" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                  <div className="bg-slate-950 border border-slate-900 rounded-xl p-4 lg:col-span-2 space-y-4">
                    <span className="text-xs font-bold text-slate-500 block uppercase tracking-wider font-mono">
                      近 3 个月份清洁运输比例与国家指标线 (80%) 走势对比
                    </span>

                    <div className="h-[210px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart 
                          data={[
                            { month: "4月份统计", 实际清洁占比_Percent: 82.4, 国家标准要求_Percent: 80.0 },
                            { month: "5月份统计", 实际清洁占比_Percent: 85.1, 国家标准要求_Percent: 80.0 },
                            { month: "6月(当期当班)", 实际清洁占比_Percent: 89.4, 国家标准要求_Percent: 80.0 },
                          ]} 
                          margin={{ top: 5, right: 10, left: -25, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,41,59,0.3)" />
                          <XAxis dataKey="month" stroke="#475569" fontSize={9.5} />
                          <YAxis stroke="#475569" fontSize={9.5} domain={[70, 100]} />
                          <Tooltip
                            contentStyle={{ backgroundColor: "#020617", borderColor: "#1e293b", borderRadius: "5px" }}
                            itemStyle={{ fontSize: "10.5px" }}
                          />
                          <Legend iconSize={8} wrapperStyle={{ fontSize: "10px" }} />
                          <Line name="清洁运输比例 (%)" type="monotone" dataKey="实际清洁占比_Percent" stroke="#22d3ee" strokeWidth={2.5} dot={true} />
                          <Line name="国标核定达标线 (80%)" type="step" dataKey="国家标准要求_Percent" stroke="#ef4444" strokeWidth={1} strokeDasharray="4 4" dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-slate-950 border border-slate-900 rounded-xl p-4 lg:col-span-1 space-y-3">
                    <span className="text-xs font-bold text-cyan-400 block border-b border-slate-900 pb-1.5">
                      清洁运输占比科学算理
                    </span>
                    <p className="text-[11.5px] text-slate-400 leading-relaxed font-sans">
                      结合运输基础台账中的 <strong>运输合同、货票、磅单、水尺记录、密闭皮带秤</strong> 等方面的海量数据。
                    </p>

                    <div className="bg-slate-900/60 p-2.5 rounded border border-slate-850 space-y-1 text-[10.5px] font-mono text-slate-500">
                      <p className="text-slate-350 font-bold">算公式：</p>
                      <p className="text-cyan-400 leading-relaxed text-xs">
                        比率 = (清洁运量之和) / (总大宗物料 + 产品总运量之和) 
                      </p>
                      <ul className="list-disc pl-3 mt-1.5 space-y-0.5 text-[9.5px]">
                        <li>清洁运力：廊道、铁路、管道、纯电重卡</li>
                        <li>总运力：全厂大宗原料 + 所有出厂成品</li>
                      </ul>
                    </div>

                    <p className="text-[10px] text-emerald-400 font-bold">
                      ✓ 当期清洁运行率: 89.4% (高出国家基准 9.4%)
                    </p>
                  </div>
                </div>
              )}

              {/* PAGE 4: 门禁管理系统控制 */}
              {activeSubPage === "gate_control_system" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                  <div className="bg-slate-950 border border-slate-900 rounded-xl p-4 lg:col-span-2 space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                      <span className="text-xs font-bold text-slate-200">
                        智能闸杠硬件仿真与复位面板
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                        gateSystemMode === "auto" ? "bg-cyan-950 text-cyan-400 border border-cyan-900" : "bg-amber-950 text-amber-500 border border-amber-900"
                      }`}>
                        控制模式: {gateSystemMode === "auto" ? "OCR全自动开闸" : "纯人工手动特批"}
                      </span>
                    </div>

                    {/* Interactive 2D Simulator */}
                    <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-850/60 flex flex-col justify-between items-center h-[170px]">
                      <span className="text-[10px] text-slate-500 font-mono">雷达对射范围与车闸落距状态</span>

                      <div className="relative w-full h-[80px] bg-slate-950 rounded-lg border border-slate-900 flex items-center justify-center overflow-hidden">
                        <Car className="h-8 w-8 text-slate-700 absolute left-6 bottom-3 animate-pulse" />
                        
                        {/* Simulation road lines */}
                        <div className="absolute bottom-2 inset-x-0 h-0.5 border-t border-dashed border-slate-800" />
                        
                        <motion.div
                          className="absolute right-10 w-36 h-2 bg-gradient-to-r from-red-500 to-yellow-500 rounded-lg origin-right"
                          animate={{ rotate: barrierState === "opened" ? -80 : 0 }}
                          transition={{ type: "spring", stiffness: 90 }}
                          style={{ bottom: "22px" }}
                        />

                        <span className={`absolute top-2.5 px-2 rounded text-[10px] font-mono font-black border ${
                          barrierState === "opened" 
                            ? "bg-emerald-950 text-emerald-400 border-emerald-900 animate-pulse" 
                            : "bg-red-950 text-red-400 border-red-900"
                        }`}>
                          {barrierState === "opened" ? "RAISED [道道抬起已放行]" : "LOWERED [闸杠截断拦截中]"}
                        </span>
                      </div>

                      <p className="text-[9.5px] text-slate-500 leading-normal font-mono">
                        雷达红外对射安全防坠保护状态：🟢 探测无卡住，安全触边复位传感器正常
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-950 border border-slate-900 rounded-xl p-4 lg:col-span-1 flex flex-col justify-between h-full min-h-[220px]">
                    <div>
                      <span className="text-xs font-bold text-cyan-400 block border-b border-slate-900 pb-1.5 mb-2.5">
                        中控远程应急指令阀
                      </span>
                      <p className="text-[11px] text-slate-450 leading-relaxed font-sans">
                        对排放不达标（如国五阶段）或出车前未提前在后台报备白名单的货车，可就地临时进行手动远程授权急开闸，抬起物理道闸放行：
                      </p>
                    </div>

                    <div className="space-y-2 pt-4">
                      <button
                        onClick={handleTriggerManualBarrier}
                        className={`w-full py-2.5 px-3 rounded-lg text-xs font-black font-sans cursor-pointer transition-colors border shadow-md ${
                          barrierState === "closed"
                            ? "bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border-emerald-850"
                            : "bg-red-950 hover:bg-red-900 text-red-300 border-red-850"
                        }`}
                      >
                        {barrierState === "closed" ? "🔓 强制手动远程抬开此闸" : "🔒 强制释放落杠此闸"}
                      </button>

                      <div className="flex gap-2">
                        <button
                          onClick={handleToggleGateMode}
                          className="flex-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10.5px] cursor-pointer text-slate-300 py-1.5 rounded font-black font-sans"
                        >
                          切换手自开闸
                        </button>
                        <button
                          onClick={handleAddInboundDummyRow}
                          className="flex-1 bg-slate-900 hover:bg-slate-800 border border-slate-850 text-[10.5px] text-cyan-400 rounded py-1.5 font-bold cursor-pointer"
                        >
                          模拟重载车扣闸
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* PAGE 5: 运行状态 */}
              {activeSubPage === "running_status" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="bg-slate-950 border border-slate-900 rounded-xl p-4 space-y-3">
                    <span className="text-xs font-bold text-slate-300 block border-b border-slate-900 pb-1.5 font-sans">
                      双级卡口网络与电平监控
                    </span>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between items-center p-2 rounded bg-slate-900/50">
                        <span className="text-slate-500">运行模式：</span>
                        <span className="font-mono text-cyan-400 font-bold">自动多目抓尾气联动</span>
                      </div>
                      <div className="flex justify-between items-center p-2 rounded bg-slate-900/50">
                        <span className="text-slate-500">气压电平阀电位：</span>
                        <span className="font-mono text-emerald-400 font-bold">5.2 V (合格)</span>
                      </div>
                      <div className="flex justify-between items-center p-2 rounded bg-slate-900/50">
                        <span className="text-slate-500">设备联网网关连接线：</span>
                        <span className="font-mono text-emerald-400 font-semibold">● 环保主干专用线正常</span>
                      </div>
                      <div className="flex justify-between items-center p-2 rounded bg-slate-900/50">
                        <span className="text-slate-500">心跳遥信帧差：</span>
                        <span className="font-mono text-slate-300">14 ms</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-950 border border-slate-900 rounded-xl p-4 space-y-3">
                    <span className="text-xs font-bold text-slate-300 block border-b border-slate-900 pb-1.5 font-sans">
                      统计及报警信号汇聚
                    </span>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between items-center p-2 rounded bg-slate-900/50">
                        <span className="text-slate-500">今日总放行闸次：</span>
                        <span className="font-mono text-cyan-400 font-bold">{totalBarrierRaises} 次</span>
                      </div>
                      <div className="flex justify-between items-center p-2 rounded bg-slate-900/50">
                        <span className="text-slate-500">系统自诊断报警级别：</span>
                        <span className="text-amber-500 font-bold">无致命软硬件硬伤</span>
                      </div>
                      <div className="flex justify-between items-center p-2 rounded bg-slate-900/50">
                        <span className="text-slate-500">部网黑名单锁闸阻断数：</span>
                        <span className="font-mono text-rose-500 font-black">18 闸拦截</span>
                      </div>
                      <div className="flex justify-between items-center p-2 rounded bg-slate-900/50">
                        <span className="text-slate-500">雷达对射自恢复校验：</span>
                        <span className="text-emerald-400">自保护常闭触点 🟢 正常</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* PAGE 6: 事件显示 */}
              {activeSubPage === "event_display" && (
                <div className="bg-slate-950 border border-slate-900 rounded-xl p-4 space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                    <span className="text-xs font-bold text-slate-300">
                      厂界卡口/通道通行与拦截过程异常事件流
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 font-bold">实时侦听中</span>
                  </div>

                  {/* Filter / Search panel */}
                  <div className="space-y-2">
                    <div className="space-y-2 max-h-[295px] overflow-y-auto font-mono text-xs pr-1 divide-y divide-slate-900">
                      {gateEvents.map((evt) => (
                        <div key={evt.id} className="pt-2.5 pb-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-slate-650 font-bold bg-slate-900 px-1.5 py-0.2 rounded">
                                {evt.time}
                              </span>
                              <span className="text-slate-300 font-sans font-bold">
                                {evt.gateNode}
                              </span>
                            </div>
                            <p className={`text-xs ${
                              evt.type === "success" ? "text-emerald-400" :
                              evt.type === "warn" ? "text-amber-400 font-bold" : "text-slate-400"
                            }`}>
                              {evt.message}
                            </p>
                          </div>

                          <span className={`text-[9px] px-1.5 rounded self-start sm:self-auto ${
                            evt.type === "success" ? "bg-emerald-950 text-emerald-400 border border-emerald-950" :
                            evt.type === "warn" ? "bg-amber-950 text-amber-500 border border-amber-950 animate-pulse" : "bg-slate-900 text-slate-500"
                          }`}>
                            {evt.type === "success" ? "放行放杠" : evt.type === "warn" ? "部网高预警拦截" : "常态电报"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* PAGE 7: 门禁电子台账 */}
              {activeSubPage === "electronic_ledger" && (
                <div className="bg-slate-950 border border-slate-900 rounded-xl p-4 space-y-4">
                  <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center border-b border-slate-900 pb-3 gap-3">
                    <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-800">
                      {[
                        "1. 进出厂通行台账 (23字段)",
                        "2. 厂内运输车辆台账 (14字段)",
                        "3. 非道路移动机械台账 (15字段)"
                      ].map((name, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setActiveLedgerTab(idx);
                            setLedgerSearchQuery("");
                          }}
                          className={`px-3 py-1.5 text-xs font-bold rounded cursor-pointer transition-all ${
                            activeLedgerTab === idx 
                              ? "bg-slate-800 text-cyan-400 font-black shadow-inner" 
                              : "text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          {name}
                        </button>
                      ))}
                    </div>

                    <div className="relative font-sans text-xs w-full xl:w-[220px]">
                      <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-650">
                        <Search className="h-4 w-4" />
                      </span>
                      <input
                        type="text"
                        placeholder="检索车牌、VIN、环保序列识别码..."
                        value={ledgerSearchQuery}
                        onChange={(e) => setLedgerSearchQuery(e.target.value)}
                        className="bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-slate-200 outline-none w-full"
                      />
                    </div>
                  </div>

                  {/* 7.1: 今日过闸实时台账 */}
                  {activeLedgerTab === 0 && (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500">今日物料货卡进出厂全过程登记表：</span>
                        <button
                          onClick={handleAddInboundDummyRow}
                          className="bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-850 text-xs rounded-lg px-3 py-1 font-bold cursor-pointer"
                        >
                          ➕ 随机生成过车
                        </button>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse font-mono whitespace-nowrap">
                          <thead>
                            <tr className="border-b border-slate-900 text-slate-500 bg-slate-950/40">
                              <th className="py-2.5 px-1.5 text-center">抓拍</th>
                              <th className="py-2.5 px-1.5">出入口编号</th>
                              <th className="py-2.5 px-1.5">道闸编号</th>
                              <th className="py-2.5 px-1.5 text-center">方向/状态</th>
                              <th className="py-2.5 px-1.5 text-center">进出时间</th>
                              <th className="py-2.5 px-1.5">车牌号码</th>
                              <th className="py-2.5 px-1.5">号牌颜色</th>
                              <th className="py-2.5 px-1.5">排放标准</th>
                              <th className="py-2.5 px-1.5">车辆类别</th>
                              <th className="py-2.5 px-1.5 font-bold">车辆识别码(VIN)</th>
                              <th className="py-2.5 px-1.5">随车清单单号</th>
                              <th className="py-2.5 px-1.5">行驶证状态</th>
                              <th className="py-2.5 px-1.5 text-right font-bold">运输量 (吨)</th>
                              <th className="py-2.5 px-1.5">运载货物名称</th>
                              <th className="py-2.5 px-1.5">发动机厂</th>
                              <th className="py-2.5 px-1.5">电机/发动机模型</th>
                              <th className="py-2.5 px-1.5">燃料类型</th>
                              <th className="py-2.5 px-1.5">车队所有权归属</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-900 text-slate-400">
                            {inboundLedger
                              .filter(item => 
                                ledgerSearchQuery === "" ||
                                item.plateNumber.includes(ledgerSearchQuery) ||
                                item.vin.includes(ledgerSearchQuery) ||
                                item.cargoName.includes(ledgerSearchQuery)
                              )
                              .map((item) => (
                                <tr key={item.id} className="hover:bg-slate-900/20 text-[11px]">
                                  <td className="py-2.5 px-1.5 text-center">
                                    <img
                                      src={item.photoUrl}
                                      referrerPolicy="no-referrer"
                                      alt="ANPR record"
                                      className="h-6 w-10 rounded object-cover border border-slate-800 mx-auto"
                                    />
                                  </td>
                                  <td className="py-2.5 px-1.5 font-bold text-slate-300">{item.entranceId}</td>
                                  <td className="py-2.5 px-1.5 text-slate-500">{item.gateId}</td>
                                  <td className="py-2.5 px-1.5 text-center">
                                    <span className={`inline-block px-1.5 py-0.2 rounded text-[9.5px] font-bold ${
                                      item.directionText === "进厂" ? "bg-cyan-950 text-cyan-400 border border-cyan-900/40" : "bg-purple-950 text-purple-400"
                                    }`}>
                                      {item.directionText}
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-1.5 text-center text-amber-500 font-bold">{item.time}</td>
                                  <td className="py-2.5 px-1.5 font-bold text-slate-100">{item.plateNumber}</td>
                                  <td className="py-2.5 px-1.5">
                                    <span className="text-[10px] bg-slate-905 px-1 rounded">{item.plateColor}</span>
                                  </td>
                                  <td className="py-2.5 px-1.5">
                                    <span className={`px-1.5 rounded text-[10px] font-bold ${
                                      item.emissionStandard === "新能源" ? "bg-emerald-950 text-emerald-400" : "bg-cyan-950 text-cyan-400"
                                    }`}>
                                      {item.emissionStandard}
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-1.5 font-sans">{item.vehicleType}</td>
                                  <td className="py-2.5 px-1.5 text-slate-500 font-bold">{item.vin}</td>
                                  <td className="py-2.5 px-1.5 text-indigo-400 font-bold">{item.escortListCode}</td>
                                  <td className="py-2.5 px-1.5 text-emerald-400 font-sans">✓ {item.driverLicenseStatus}</td>
                                  <td className="py-2.5 px-1.5 text-right text-cyan-400 font-bold">{item.cargoWeight} 吨</td>
                                  <td className="py-2.5 px-1.5 font-bold text-slate-200">{item.cargoName}</td>
                                  <td className="py-2.5 px-1.5 text-slate-550 truncate max-w-[150px]">{item.engineManufacturer}</td>
                                  <td className="py-2.5 px-1.5 text-slate-550">{item.engineModel}</td>
                                  <td className="py-2.5 px-1.5 text-slate-500">{item.fuelType}</td>
                                  <td className="py-2.5 px-1.5 text-slate-350">{item.fleetName}</td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* 7.2: 厂内运输车台账 */}
                  {activeLedgerTab === 1 && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse font-mono whitespace-nowrap">
                        <thead>
                          <tr className="border-b border-slate-900 text-slate-500 bg-slate-950/40">
                            <th className="py-2 px-1.5">环保外环登记编码</th>
                            <th className="py-2 px-1.5">车识别码(VIN)</th>
                            <th className="py-2 px-1.5 text-center">出厂生产日期</th>
                            <th className="py-2 px-1.5">登记车牌</th>
                            <th className="py-2 px-1.5 text-center font-bold">入册日期</th>
                            <th className="py-2 px-1.5">内循环车辆型号</th>
                            <th className="py-2 px-1.5">环保标准阶段</th>
                            <th className="py-2 px-1.5">动力燃料</th>
                            <th className="py-2 px-1.5">发动机厂号</th>
                            <th className="py-2 px-1.5">随车清单卡联结</th>
                            <th className="py-2 px-1.5">所属单位/所有人</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-900 text-slate-400">
                          {internalLedger
                            .filter(item => 
                              ledgerSearchQuery === "" ||
                              item.plateNumber.includes(ledgerSearchQuery) ||
                              item.vin.includes(ledgerSearchQuery)
                            )
                            .map((item) => (
                              <tr key={item.id} className="hover:bg-slate-900/15">
                                <td className="py-2.5 px-1.5 font-bold text-cyan-400 text-[11px]">{item.envRegisterCode}</td>
                                <td className="py-2.5 px-1.5 text-slate-500 font-bold">{item.vin}</td>
                                <td className="py-2.5 px-1.5 text-center text-slate-500">{item.productionDate}</td>
                                <td className="py-2.5 px-1.5 text-slate-200 font-bold">{item.plateNumber}</td>
                                <td className="py-2.5 px-1.5 text-center text-slate-550">{item.registeredDate}</td>
                                <td className="py-2.5 px-1.5 font-sans">{item.vehicleModel}</td>
                                <td className="py-2.5 px-1.5">
                                  <span className="text-[10px] bg-emerald-950 text-emerald-300 rounded px-1.5 font-bold">
                                    {item.emissionStandard}
                                  </span>
                                </td>
                                <td className="py-2.5 px-1.5">{item.fuelType}</td>
                                <td className="py-2.5 px-1.5 text-slate-500 truncate max-w-[150px]">{item.engineManufacturer}</td>
                                <td className="py-2.5 px-1.5 text-indigo-400">{item.escortListStatus}</td>
                                <td className="py-2.5 px-1.5 font-sans font-bold text-slate-350">{item.ownerUnit}</td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* 7.3: 非道路移动机械台账 */}
                  {activeLedgerTab === 2 && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse font-mono whitespace-nowrap">
                        <thead>
                          <tr className="border-b border-slate-900 text-slate-500 bg-slate-950/40">
                            <th className="py-2 px-1.5">环保绑定代码</th>
                            <th className="py-2 px-1.5">非道路特卡车牌</th>
                            <th className="py-2 px-1.5">产品识别码(PIN)</th>
                            <th className="py-2 px-1.5 text-center">出厂日期</th>
                            <th className="py-2 px-1.5">特种机械种类</th>
                            <th className="py-2 px-1.5">尾气标准阶段</th>
                            <th className="py-2 px-1.5">整车(机)铭牌</th>
                            <th className="py-2 px-1.5">环保绿色物理标签</th>
                            <th className="py-2 px-1.5">动力传动电池</th>
                            <th className="py-2 px-1.5">机械所有人</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-900 text-slate-400">
                          {nonRoadLedger
                            .filter(item => 
                              ledgerSearchQuery === "" ||
                              item.plateNumber.includes(ledgerSearchQuery) ||
                              item.pin.includes(ledgerSearchQuery)
                            )
                            .map((item) => (
                              <tr key={item.id} className="hover:bg-slate-900/15">
                                <td className="py-2.5 px-1.5 font-bold text-cyan-400 text-[11px]">{item.envRegisterCode}</td>
                                <td className="py-2.5 px-1.5 text-slate-200 font-bold">{item.plateNumber}</td>
                                <td className="py-2.5 px-1.5 text-slate-500 font-bold">{item.pin}</td>
                                <td className="py-2.5 px-1.5 text-center text-slate-500">{item.productionDate}</td>
                                <td className="py-2.5 px-1.5 font-bold text-slate-300">{item.machineryType}</td>
                                <td className="py-2.5 px-1.5">
                                  <span className="text-[10px] bg-sky-950 text-sky-400 rounded px-1.5 py-0.5">
                                    {item.emissionStandard}
                                  </span>
                                </td>
                                <td className="py-2.5 px-1.5 text-emerald-400 font-sans">✓ {item.chassisPlate}</td>
                                <td className="py-2.5 px-1.5">
                                  <span className="text-[9.5px] bg-emerald-950 text-emerald-450 border border-emerald-900 px-1 py-0.2 rounded">
                                    {item.envTagStatus}
                                  </span>
                                </td>
                                <td className="py-2.5 px-1.5">{item.fuelType}</td>
                                <td className="py-2.5 px-1.5 font-sans font-bold text-slate-350">{item.ownerUnit}</td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* PAGE 8: 视频显示 */}
              {activeSubPage === "video_display" && (() => {
                const channelToNameMap: Record<number, { name: string; ip: string; place: string }> = {
                  1: { name: "煤棚入口", ip: "192.168.12.10", place: "焦化厂/煤棚" },
                  2: { name: "煤棚出口", ip: "192.168.12.11", place: "焦化厂/煤棚" },
                  3: { name: "焦棚入口", ip: "192.168.12.12", place: "焦化厂/焦棚" },
                  4: { name: "焦棚出口", ip: "192.168.12.13", place: "焦化厂/焦棚" },
                  5: { name: "焦炉炉顶", ip: "192.168.12.14", place: "焦化厂/核心生产区" },
                  6: { name: "干熄焦装入装置", ip: "192.168.12.15", place: "焦化厂/生产关键区" },
                  7: { name: "备用汽车", ip: "192.168.12.16", place: "焦化厂/车辆过渡段" },
                  8: { name: "筛焦楼筛分", ip: "192.168.12.17", place: "筛焦楼/一号核心仓" },
                  9: { name: "筛焦楼装车", ip: "192.168.12.18", place: "筛焦楼/散装发放路段" },
                  10: { name: "洗车平台", ip: "192.168.12.19", place: "大门边界/洗车加压槽" },
                  11: { name: "西北角1A重载卡门", ip: "192.168.12.20", place: "外部边界/车辆进厂" },
                  12: { name: "东侧2A核验道口", ip: "192.168.12.21", place: "外部边界/车辆出厂" },
                  13: { name: "南侧3B环卫大连口", ip: "192.168.12.22", place: "外部边界/环卫车出入口" },
                  14: { name: "码头卸货廊道1号", ip: "192.168.12.23", place: "原料物流/带钢皮带线" },
                  15: { name: "熟料出库4C主卡口", ip: "192.168.12.24", place: "熟料厂界/产品发放台" },
                  16: { name: "备用视频遥测 A", ip: "192.168.12.25", place: "生产配电区/高压柜" },
                  17: { name: "备用视频遥测 B", ip: "192.168.12.26", place: "水处理站/回收循环池" },
                  18: { name: "备用视频遥测 C", ip: "192.168.12.27", place: "熟料一期备料棚" },
                  19: { name: "烟尘排放激光抓拍点", ip: "192.168.12.28", place: "一期窑尾烟囱平台" },
                  20: { name: "降尘雾炮机遥感点", ip: "192.168.12.29", place: "环境监测点/厂界北区" }
                };

                const filteredChannels = Object.entries(channelToNameMap).filter(([chStr, data]) => {
                  if (cctvSearchQuery === "") return true;
                  const ch = +chStr;
                  const query = cctvSearchQuery.toLowerCase();
                  return (
                    data.name.toLowerCase().includes(query) ||
                    data.place.toLowerCase().includes(query) ||
                    data.ip.toLowerCase().includes(query) ||
                    `通道 ${ch}#`.includes(query) ||
                    `${ch}` === query
                  );
                });

                const handlePtzDir = (dir: string, deltaPan: number, deltaTilt: number) => {
                  setPtzDirectionText(dir);
                  setPtzPanValue(prev => +((prev + deltaPan + 360) % 360).toFixed(1));
                  setPtzTiltValue(prev => +(Math.min(90, Math.max(-10, prev + deltaTilt))).toFixed(1));
                };

                return (
                  <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 font-sans text-slate-100">
                    
                    {/* Left Column: 厂房环境监测 Directory Tree (xl:col-span-3) */}
                    <div className="xl:col-span-3 bg-slate-950/80 border border-slate-900 rounded-xl p-4 flex flex-col justify-between space-y-4 shadow-xl shadow-black/80 relative overflow-hidden backdrop-blur-md">
                      <div className="absolute top-0 left-0 w-8 h-[1px] bg-cyan-500" />
                      <div className="absolute top-0 left-0 w-[1px] h-8 bg-cyan-500" />
                      <div className="absolute bottom-0 right-0 w-8 h-[1px] bg-cyan-500" />
                      <div className="absolute bottom-0 right-0 w-[1px] h-8 bg-cyan-500" />
                      
                      <div className="space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                          <span className="text-xs font-bold text-cyan-400 tracking-wider flex items-center gap-1.5 font-mono">
                            <span className="inline-block h-1.5 w-1.5 rounded-full bg-cyan-500 animate-pulse" />
                            厂房环境监测
                          </span>
                          <span className="text-[10px] font-mono text-slate-500 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-850">
                            双目遥测
                          </span>
                        </div>

                        {/* Directory Search Box */}
                        <div className="relative text-xs">
                          <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-500">
                            <Search className="h-3.5 w-3.5 text-slate-600" />
                          </span>
                          <input
                            type="text"
                            placeholder="查询监测点/本地IP/通道..."
                            value={cctvSearchQuery}
                            onChange={(e) => setCctvSearchQuery(e.target.value)}
                            className="bg-slate-900 border border-slate-850 rounded-lg pl-8 pr-3 py-1.5 text-slate-200 outline-none w-full text-[11px] placeholder-slate-650 tracking-wide transition-all focus:border-cyan-500/50 focus:shadow-[0_0_8px_rgba(6,182,212,0.15)]"
                          />
                        </div>

                        {/* Directory Nested Tree */}
                        <div className="max-h-[350px] overflow-y-auto space-y-1.5 pr-1 text-xs select-none custom-scrollbar">
                          {cctvSearchQuery !== "" ? (
                            <div className="space-y-1">
                              <div className="text-[10px] text-slate-550 font-mono pb-1">
                                筛选出 {filteredChannels.length} 处监控点:
                              </div>
                              {filteredChannels.length === 0 ? (
                                <div className="text-center py-6 text-slate-600 text-[11px]">
                                  未匹配到任何监测点
                                </div>
                              ) : (
                                filteredChannels.map(([chStr, data]) => {
                                  const ch = +chStr;
                                  const isActive = activeCameraIndex === ch;
                                  return (
                                    <button
                                      key={`search-ch-${ch}`}
                                      onClick={() => {
                                        setActiveCameraIndex(ch);
                                        setSelectedCctvNode(data.name);
                                      }}
                                      className={`w-full text-left p-2 rounded transition-all flex items-center justify-between text-[11px] ${
                                        isActive
                                          ? "bg-cyan-950/40 text-cyan-400 border border-cyan-900 font-bold"
                                          : "hover:bg-slate-900/60 text-slate-400 border border-transparent"
                                      }`}
                                    >
                                      <div className="flex items-center gap-1.5 truncate">
                                        <Video className={`h-3 w-3 shrink-0 ${isActive ? "text-cyan-400" : "text-slate-500"}`} />
                                        <span className="truncate">{data.name}</span>
                                      </div>
                                      <span className="text-[9.5px] font-mono text-slate-500 shrink-0">
                                        通道 {ch}#
                                      </span>
                                    </button>
                                  );
                                })
                              )}
                            </div>
                          ) : (
                            <div className="space-y-1 text-slate-350">
                              
                              {/* 焦化厂 Folder */}
                              <div>
                                <button
                                  onClick={() => setCctvCollapsedFolders(prev => ({ ...prev, coking: !prev.coking }))}
                                  className="w-full flex items-center justify-between py-1 px-1.5 hover:bg-slate-900/40 rounded text-slate-200 font-semibold cursor-pointer text-[11px]"
                                >
                                  <div className="flex items-center gap-1.5">
                                    {cctvCollapsedFolders.coking ? (
                                      <ChevronRight className="h-3 w-3 text-slate-500" />
                                    ) : (
                                      <ChevronDown className="h-3 w-3 text-cyan-500" />
                                    )}
                                    <Folder className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                                    <span>焦化厂</span>
                                  </div>
                                </button>
                                
                                {!cctvCollapsedFolders.coking && (
                                  <div className="pl-3.5 mt-1 space-y-1 border-l border-slate-900 ml-2">
                                    
                                    {/* 煤棚 Subfolder */}
                                    <div>
                                      <button
                                        onClick={() => setCctvCollapsedFolders(prev => ({ ...prev, coal: !prev.coal }))}
                                        className="w-full flex items-center justify-between py-1 px-1 hover:bg-slate-900/30 rounded text-slate-300 text-[11px]"
                                      >
                                        <div className="flex items-center gap-1.5">
                                          {cctvCollapsedFolders.coal ? (
                                            <ChevronRight className="h-3 w-3 text-slate-650" />
                                          ) : (
                                            <ChevronDown className="h-3 w-3 text-cyan-650" />
                                          )}
                                          <span className="text-slate-400 font-medium">煤棚</span>
                                        </div>
                                      </button>
                                      
                                      {!cctvCollapsedFolders.coal && (
                                        <div className="pl-3 mt-0.5 space-y-0.5 border-l border-slate-900 ml-1.5">
                                          <button
                                            onClick={() => { setActiveCameraIndex(1); setSelectedCctvNode("煤棚入口"); }}
                                            className={`w-full text-left py-1 px-1.5 rounded text-[11px] flex justify-between items-center transition-colors ${
                                              activeCameraIndex === 1 ? "text-cyan-405 font-bold bg-cyan-950/30 text-cyan-400 border-l border-cyan-400 pl-2" : "text-slate-400 hover:text-slate-200"
                                            }`}
                                          >
                                            <span className="flex items-center gap-1">⏱️ 煤棚入口</span>
                                            <span className="text-[9px] font-mono opacity-60">1#</span>
                                          </button>
                                          <button
                                            onClick={() => { setActiveCameraIndex(2); setSelectedCctvNode("煤棚出口"); }}
                                            className={`w-full text-left py-1 px-1.5 rounded text-[11px] flex justify-between items-center transition-colors ${
                                              activeCameraIndex === 2 ? "text-cyan-405 font-bold bg-cyan-950/30 text-cyan-400 border-l border-cyan-400 pl-2" : "text-slate-400 hover:text-slate-200"
                                            }`}
                                          >
                                            <span className="flex items-center gap-1">⏱️ 煤棚出口</span>
                                            <span className="text-[9px] font-mono opacity-60">2#</span>
                                          </button>
                                        </div>
                                      )}
                                    </div>

                                    {/* 焦棚 Subfolder */}
                                    <div>
                                      <button
                                        onClick={() => setCctvCollapsedFolders(prev => ({ ...prev, coke: !prev.coke }))}
                                        className="w-full flex items-center justify-between py-1 px-1 hover:bg-slate-900/30 rounded text-slate-300 text-[11px]"
                                      >
                                        <div className="flex items-center gap-1.5">
                                          {cctvCollapsedFolders.coke ? (
                                            <ChevronRight className="h-3 w-3 text-slate-650" />
                                          ) : (
                                            <ChevronDown className="h-3 w-3 text-cyan-650" />
                                          )}
                                          <span className="text-slate-400 font-medium">焦棚</span>
                                        </div>
                                      </button>
                                      
                                      {!cctvCollapsedFolders.coke && (
                                        <div className="pl-3 mt-0.5 space-y-0.5 border-l border-slate-900 ml-1.5">
                                          <button
                                            onClick={() => { setActiveCameraIndex(3); setSelectedCctvNode("焦棚入口"); }}
                                            className={`w-full text-left py-1 px-1.5 rounded text-[11px] flex justify-between items-center transition-colors ${
                                              activeCameraIndex === 3 ? "text-cyan-405 font-bold bg-cyan-950/30 text-cyan-400 border-l border-cyan-400 pl-2" : "text-slate-400 hover:text-slate-200"
                                            }`}
                                          >
                                            <span className="flex items-center gap-1">⏱️ 焦棚入口</span>
                                            <span className="text-[9px] font-mono opacity-60">3#</span>
                                          </button>
                                          <button
                                            onClick={() => { setActiveCameraIndex(4); setSelectedCctvNode("焦棚出口"); }}
                                            className={`w-full text-left py-1 px-1.5 rounded text-[11px] flex justify-between items-center transition-colors ${
                                              activeCameraIndex === 4 ? "text-cyan-405 font-bold bg-cyan-950/30 text-cyan-400 border-l border-cyan-400 pl-2" : "text-slate-400 hover:text-slate-200"
                                            }`}
                                          >
                                            <span className="flex items-center gap-1">⏱️ 焦棚出口</span>
                                            <span className="text-[9px] font-mono opacity-60">4#</span>
                                          </button>
                                        </div>
                                      )}
                                    </div>

                                    {/* Direct nodes */}
                                    <button
                                      onClick={() => { setActiveCameraIndex(5); setSelectedCctvNode("焦炉炉顶"); }}
                                      className={`w-full text-left py-1.5 px-1.5 rounded text-[11px] flex justify-between items-center transition-colors ${
                                        activeCameraIndex === 5 ? "text-cyan-405 font-bold bg-cyan-950/25 text-cyan-400 border-l border-cyan-400 pl-2" : "text-slate-400 hover:text-slate-200"
                                      }`}
                                    >
                                      <span>🎥 焦炉炉顶</span>
                                      <span className="text-[9px] font-mono opacity-60">5#</span>
                                    </button>

                                    <button
                                      onClick={() => { setActiveCameraIndex(6); setSelectedCctvNode("干熄焦装入装置"); }}
                                      className={`w-full text-left py-1.5 px-1.5 rounded text-[11px] flex justify-between items-center transition-colors ${
                                        activeCameraIndex === 6 ? "text-cyan-405 font-bold bg-cyan-950/25 text-cyan-400 border-l border-cyan-400 pl-2" : "text-slate-400 hover:text-slate-200"
                                      }`}
                                    >
                                      <span className="truncate">🎥 干熄焦装入</span>
                                      <span className="text-[9px] font-mono opacity-60">6#</span>
                                    </button>

                                    <button
                                      onClick={() => { setActiveCameraIndex(7); setSelectedCctvNode("备用汽车"); }}
                                      className={`w-full text-left py-1.2 px-1.5 rounded text-[11px] flex justify-between items-center transition-colors ${
                                        activeCameraIndex === 7 ? "text-cyan-405 font-bold bg-cyan-950/25 text-cyan-400 border-l border-cyan-400 pl-2" : "text-slate-400 hover:text-slate-200"
                                      }`}
                                    >
                                      <span>🎥 备用汽车</span>
                                      <span className="text-[9px] font-mono opacity-60">7#</span>
                                    </button>

                                    <button
                                      onClick={() => { setActiveCameraIndex(8); setSelectedCctvNode("筛焦楼筛分"); }}
                                      className={`w-full text-left py-1.2 px-1.5 rounded text-[11px] flex justify-between items-center transition-colors ${
                                        activeCameraIndex === 8 ? "text-cyan-405 font-bold bg-cyan-950/25 text-cyan-400 border-l border-cyan-400 pl-2" : "text-slate-400 hover:text-slate-200"
                                      }`}
                                    >
                                      <span>🎥 筛焦楼筛分</span>
                                      <span className="text-[9px] font-mono opacity-60">8#</span>
                                    </button>

                                    <button
                                      onClick={() => { setActiveCameraIndex(9); setSelectedCctvNode("筛焦楼装车"); }}
                                      className={`w-full text-left py-1.2 px-1.5 rounded text-[11px] flex justify-between items-center transition-colors ${
                                        activeCameraIndex === 9 ? "text-cyan-405 font-bold bg-cyan-950/25 text-cyan-400 border-l border-cyan-400 pl-2" : "text-slate-400 hover:text-slate-200"
                                      }`}
                                    >
                                      <span>🎥 筛焦楼装车</span>
                                      <span className="text-[9px] font-mono opacity-60">9#</span>
                                    </button>

                                    <button
                                      onClick={() => { setActiveCameraIndex(10); setSelectedCctvNode("洗车平台"); }}
                                      className={`w-full text-left py-1.2 px-1.5 rounded text-[11px] flex justify-between items-center transition-colors ${
                                        activeCameraIndex === 10 ? "text-cyan-405 font-bold bg-cyan-950/25 text-cyan-400 border-l border-cyan-400 pl-2" : "text-slate-400 hover:text-slate-200"
                                      }`}
                                    >
                                      <span>🎥 洗车平台</span>
                                      <span className="text-[9px] font-mono opacity-60">10#</span>
                                    </button>
                                  </div>
                                )}
                              </div>

                              {/* 辅助及备用通道 Folder */}
                              <div>
                                <button
                                  onClick={() => setCctvCollapsedFolders(prev => ({ ...prev, others: !prev.others }))}
                                  className="w-full flex items-center justify-between py-1 px-1.5 hover:bg-slate-900/40 rounded text-slate-200 font-semibold cursor-pointer text-[11px]"
                                >
                                  <div className="flex items-center gap-1.5">
                                    {cctvCollapsedFolders.others ? (
                                      <ChevronRight className="h-3 w-3 text-slate-500" />
                                    ) : (
                                      <ChevronDown className="h-3 w-3 text-cyan-500" />
                                    )}
                                    <Folder className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                                    <span className="truncate">辅助及出入边界</span>
                                  </div>
                                </button>
                                
                                {!cctvCollapsedFolders.others && (
                                  <div className="pl-3.5 mt-1 space-y-1 border-l border-slate-900 ml-2">
                                    {Array.from({ length: 10 }).map((_, idx) => {
                                      const ch = idx + 11;
                                      const name = channelToNameMap[ch]?.name || `监控点 ${ch}#`;
                                      return (
                                        <button
                                          key={`tree-ch-${ch}`}
                                          onClick={() => { setActiveCameraIndex(ch); setSelectedCctvNode(name); }}
                                          className={`w-full text-left py-1 px-1.5 rounded text-[11px] flex justify-between items-center transition-colors ${
                                            activeCameraIndex === ch ? "text-cyan-405 font-bold bg-cyan-950/25 text-cyan-400 border-l border-cyan-400 pl-2" : "text-slate-405 hover:text-slate-200"
                                          }`}
                                        >
                                          <span className="truncate">🎥 {name.replace("西北角", "").replace("东侧", "")}</span>
                                          <span className="text-[9px] font-mono opacity-60">{ch}#</span>
                                        </button>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>

                            </div>
                          )}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-900 leading-normal font-mono text-[9px] text-slate-500 space-y-0.5">
                        <div className="flex justify-between">
                          <span>流类型：H.265 HW ACCEL</span>
                          <span className="text-emerald-500 font-bold">● RTMP NORMAL</span>
                        </div>
                        <div className="flex justify-between">
                          <span>编解码：HD 2.5MB/s</span>
                          <span>帧误差：12ms</span>
                        </div>
                      </div>
                    </div>

                    {/* Center Column: Interactive screen wall matrix (xl:col-span-6) */}
                    <div className="xl:col-span-6 bg-slate-950/40 border border-slate-900 rounded-xl flex flex-col justify-between p-4 space-y-4 shadow-xl shadow-black/80 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-8 h-[1px] bg-cyan-500/50" />
                      <div className="absolute top-0 left-0 w-[1px] h-8 bg-cyan-500/50" />
                      <div className="absolute bottom-0 right-0 w-8 h-[1px] bg-cyan-500/50" />
                      <div className="absolute bottom-0 right-0 w-[1px] h-8 bg-cyan-500/50" />
                      
                      <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-100 uppercase tracking-widest font-mono flex items-center gap-1">
                            <span className="inline-block h-2 w-2 rounded-full bg-red-500 animate-ping" />
                            超低排放集中监视墙
                          </span>
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold font-mono bg-cyan-950 text-cyan-400 border border-cyan-900">
                            {cctvLayout === 20 ? "5*4 布局" : `${cctvLayout}分屏`}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-405 bg-slate-900/60 border border-slate-850 px-2 py-0.5 rounded">
                          当前：<span className="text-cyan-400 font-semibold">{channelToNameMap[activeCameraIndex]?.name}</span>
                        </span>
                      </div>

                      {/* CCTV Grid Blocks */}
                      <div className={`grid gap-2 flex-grow min-h-[380px] ${
                        cctvLayout === 1 ? "grid-cols-1" :
                        cctvLayout === 4 ? "grid-cols-2" :
                        cctvLayout === 9 ? "grid-cols-3" : "grid-cols-4"
                      }`} style={{ gridTemplateRows: cctvLayout === 20 ? "repeat(5, minmax(0, 1fr))" : "" }}>
                        
                        {Array.from({ length: cctvLayout }).map((_, index) => {
                          const cellCh = index + 1;
                          const chData = channelToNameMap[cellCh] || { name: `通道 ${cellCh}#`, ip: "192.168.12.99", place: "厂界遥测区" };
                          const isActive = activeCameraIndex === cellCh;
                          
                          return (
                            <div
                              key={`grid-cell-${cellCh}`}
                              onClick={() => {
                                setActiveCameraIndex(cellCh);
                                setSelectedCctvNode(chData.name);
                              }}
                              className={`relative rounded border transition-all duration-300 overflow-hidden cursor-pointer flex flex-col justify-between ${
                                isActive
                                  ? "border-cyan-400 ring-2 ring-cyan-400/40 bg-cyan-950/20 shadow-[0_0_15px_rgba(6,182,212,0.35)] z-10 scale-[1.01]"
                                  : "border-slate-850 bg-slate-950/65 hover:border-cyan-800/40"
                              } ${cctvLayout === 1 ? "p-3.5" : "p-1"}`}
                            >
                              {/* Horizontal laser scan highlight line */}
                              {isActive && (
                                <div className="absolute inset-x-0 h-[1.5px] bg-cyan-400/90 w-full animate-[bounce_4s_infinite] opacity-70 z-10 pointer-events-none" />
                              )}

                              {/* Active Wind wiper effect */}
                              {isActive && isWiperActive && (
                                <div className="absolute inset-0 bg-transparent pointer-events-none z-10 overflow-hidden">
                                  <motion.div
                                    initial={{ rotate: -80, originX: 0.5, originY: 1 }}
                                    animate={{ rotate: [ -80, 80, -80 ] }}
                                    transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
                                    className="absolute bottom-0 left-1/2 -ml-[1px] w-[2px] h-[95%] bg-cyan-400/70"
                                  />
                                </div>
                              )}

                              {/* Camera info bar overlay */}
                              <div className="absolute inset-x-0 top-0 p-1 flex justify-between items-center font-mono text-[8.5px] text-slate-400 bg-black/40 z-10 pointer-events-none">
                                <span className="font-bold text-slate-300">{cellCh}#</span>
                                <span className="text-[7.5px] scale-90">{chData.ip}</span>
                              </div>

                              {/* Simulation Viewport behind glass */}
                              <div className="w-full h-full min-h-[55px] bg-[#020617] rounded flex flex-col items-center justify-center relative overflow-hidden p-1.5">
                                {/* Raster scanning details background */}
                                <div className="absolute inset-0 bg-[radial-gradient(#0e1726_1px,transparent_1px)] [background-size:10px_10px] opacity-40" />
                                
                                {isActive ? (
                                  <div className="text-center space-y-1 z-0 relative">
                                    {/* Pulse reticle */}
                                    <div className="absolute inset-0 flex items-center justify-center opacity-[0.06] transform scale-150">
                                      <Compass className="h-16 w-16 text-cyan-400 animate-spin" style={{ animationDuration: '30s' }} />
                                    </div>

                                    {/* Rec indicators */}
                                    <div className="flex items-center justify-center gap-1 leading-none text-cyan-400">
                                      <Activity className="h-4.5 w-4.5 text-cyan-400 animate-pulse shrink-0" />
                                      {cctvLayout <= 4 && (
                                        <span className="text-[10px] font-bold tracking-wider text-rose-500 animate-pulse pt-0.5">REC ●</span>
                                      )}
                                    </div>

                                    {cctvLayout <= 4 && (
                                      <div className="font-mono text-[8.5px] text-slate-450 leading-normal">
                                        <p className="text-cyan-350 font-bold">{chData.place}</p>
                                        <p>PTZ: H{ptzPanValue}° / V{ptzTiltValue}°</p>
                                        <p>Z:{ptzZoom}× / F:{ptzFocus}</p>
                                      </div>
                                    )}

                                    {/* Intelligent Object detection simulation boxes */}
                                    {cctvLayout <= 9 && (
                                      <div className="absolute bottom-1 right-1 border border-cyan-500/40 rounded px-1 text-[7.5px] bg-slate-950/70 text-cyan-400 pointer-events-none font-sans scale-90 origin-bottom-right">
                                        AI: 车载对射合格
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div className="text-center opacity-30 select-none group-hover:opacity-50 transition-opacity">
                                    <Video className="h-3.5 w-3.5 text-slate-500 mx-auto" />
                                    {cctvLayout <= 4 && (
                                      <span className="text-[7.5px] block font-mono text-slate-600 mt-1 uppercase">通道闭联</span>
                                    )}
                                  </div>
                                )}
                              </div>

                              {/* Card local bottom status */}
                              <div className="absolute inset-x-0 bottom-0 p-1 flex justify-between items-center font-mono text-[8.5px] bg-black/40 z-10 text-slate-450 pointer-events-none border-t border-slate-900/10">
                                <span className="truncate max-w-[65px]">{chData.name}</span>
                                {isActive ? (
                                  <span className="text-cyan-400 font-bold scale-90">LIVE 50FPS</span>
                                ) : (
                                  <span className="text-slate-600 scale-90">联网</span>
                                )}
                              </div>

                            </div>
                          );
                        })}
                      </div>

                      {/* Display layouts selection */}
                      <div className="flex justify-between items-center bg-slate-900/40 border border-slate-900 rounded-lg p-2.5 flex-wrap gap-2 text-xs">
                        <span className="text-[10px] text-slate-500 font-mono tracking-wider">分屏样式快捷切换:</span>
                        <div className="flex bg-slate-950 p-1 rounded-md border border-slate-850 gap-1 leading-none text-slate-400 text-[10px]">
                          {[
                            { code: 1, label: "单画面" },
                            { code: 4, label: "4分屏" },
                            { code: 9, label: "9分屏" },
                            { code: 16, label: "16分屏" },
                            { code: 20, label: "20分屏" }
                          ].map(lay => (
                            <button
                              key={`layout-${lay.code}`}
                              onClick={() => {
                                setCctvLayout(lay.code);
                                if (activeCameraIndex > lay.code) {
                                  setActiveCameraIndex(1);
                                  setSelectedCctvNode(channelToNameMap[1].name);
                                }
                              }}
                              className={`px-2.5 py-1.5 font-bold rounded cursor-pointer transition-all ${
                                cctvLayout === lay.code
                                  ? "bg-cyan-950/80 border border-cyan-850 text-cyan-400 font-black shadow-inner"
                                  : "hover:text-slate-200"
                              }`}
                            >
                              {lay.label}
                            </button>
                          ))}
                        </div>
                      </div>

                    </div>

                    {/* Right Column: 云台操作 controls (xl:col-span-3) */}
                    <div className="xl:col-span-3 bg-slate-950 border border-slate-900 rounded-xl p-4 flex flex-col justify-between space-y-4 shadow-xl shadow-black/80 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-8 h-[1px] bg-cyan-500" />
                      <div className="absolute top-0 right-0 w-[1px] h-8 bg-cyan-500" />
                      <div className="absolute bottom-0 left-0 w-8 h-[1px] bg-cyan-500" />
                      <div className="absolute bottom-0 left-0 w-[1px] h-8 bg-cyan-500" />

                      <div className="space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                          <span className="text-xs font-bold text-cyan-400 tracking-wider flex items-center gap-1.5 font-mono">
                            <Sliders className="h-3.5 w-3.5 text-cyan-400" />
                            云台操作控制
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">COAX_PTZ</span>
                        </div>

                        {/* Joystick Wheel Section */}
                        <div className="flex justify-center py-2 relative">
                          <div className="w-38 h-38 rounded-full border border-cyan-900/50 bg-[#060c18] relative flex items-center justify-center p-1.5 shadow-inner shadow-cyan-950/40">
                            
                            {/* Inner concentric layout */}
                            <div className="absolute inset-5 rounded-full border border-dashed border-cyan-955/20 pointer-events-none" />

                            {/* Center Home-Return Button */}
                            <button
                              onClick={() => {
                                setPtzPanValue(218.4);
                                setPtzTiltValue(12.6);
                                setPtzZoom(4.0);
                                setPtzFocus(75);
                                setPtzDirectionText("自适应锁定");
                              }}
                              title="校准重组"
                              className="absolute w-11 h-11 rounded-full bg-slate-950 border border-cyan-800 text-cyan-400 hover:bg-cyan-950 hover:text-cyan-300 flex items-center justify-center shadow-md active:scale-90 transition-all duration-100 cursor-pointer z-10"
                            >
                              <RotateCcw className="h-4.5 w-4.5 animate-spin-slow text-cyan-400" />
                            </button>

                            {/* Up */}
                            <button
                              onClick={() => handlePtzDir("上移调准", 0, 3.0)}
                              className="absolute top-1.5 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full text-[10px] text-slate-400 hover:text-cyan-400 hover:bg-slate-900 active:scale-110 flex items-center justify-center cursor-pointer transition-all font-bold"
                              title="上"
                            >
                              ▲
                            </button>

                            {/* Down */}
                            <button
                              onClick={() => handlePtzDir("下移调准", 0, -3.0)}
                              className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full text-[10px] text-slate-400 hover:text-cyan-400 hover:bg-slate-900 active:scale-110 flex items-center justify-center cursor-pointer transition-all font-bold"
                              title="下"
                            >
                              ▼
                            </button>

                            {/* Left */}
                            <button
                              onClick={() => handlePtzDir("左偏转向", -4.0, 0)}
                              className="absolute left-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full text-[10px] text-slate-400 hover:text-cyan-400 hover:bg-slate-900 active:scale-110 flex items-center justify-center cursor-pointer transition-all font-bold"
                              title="左"
                            >
                              ◀
                            </button>

                            {/* Right */}
                            <button
                              onClick={() => handlePtzDir("右偏转向", 4.0, 0)}
                              className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full text-[10px] text-slate-400 hover:text-cyan-400 hover:bg-slate-900 active:scale-110 flex items-center justify-center cursor-pointer transition-all font-bold"
                              title="右"
                            >
                              ▶
                            </button>

                            {/* Up-Left */}
                            <button
                              onClick={() => handlePtzDir("左上偏置", -3.0, 2.5)}
                              className="absolute top-4 left-4 w-6.5 h-6.5 rounded-full text-[9px] text-slate-500 hover:text-cyan-400 hover:bg-slate-900 active:scale-110 flex items-center justify-center cursor-pointer transition-all font-extrabold"
                              title="左上"
                            >
                              ↖
                            </button>

                            {/* Up-Right */}
                            <button
                              onClick={() => handlePtzDir("右上偏置", 3.0, 2.5)}
                              className="absolute top-4 right-4 w-6.5 h-6.5 rounded-full text-[9px] text-slate-500 hover:text-cyan-400 hover:bg-slate-900 active:scale-110 flex items-center justify-center cursor-pointer transition-all font-extrabold"
                              title="右上"
                            >
                              ↗
                            </button>

                            {/* Down-Left */}
                            <button
                              onClick={() => handlePtzDir("左下偏置", -3.0, -2.5)}
                              className="absolute bottom-4 left-4 w-6.5 h-6.5 rounded-full text-[9px] text-slate-500 hover:text-cyan-400 hover:bg-slate-900 active:scale-110 flex items-center justify-center cursor-pointer transition-all font-extrabold"
                              title="左下"
                            >
                              ↙
                            </button>

                            {/* Down-Right */}
                            <button
                              onClick={() => handlePtzDir("右下偏置", 3.0, -2.5)}
                              className="absolute bottom-4 right-4 w-6.5 h-6.5 rounded-full text-[9px] text-slate-500 hover:text-cyan-400 hover:bg-slate-900 active:scale-110 flex items-center justify-center cursor-pointer transition-all font-extrabold"
                              title="右下"
                            >
                              ↘
                            </button>

                          </div>
                        </div>

                        {/* Joystick Telemetry Log status */}
                        <div className="bg-slate-900 border border-slate-950 p-2 rounded-lg text-center font-mono space-y-1 select-none">
                          <span className="text-[8.5px] text-slate-550 block">当前焦段姿态：</span>
                          <span className="text-[11px] font-bold text-cyan-400 flex items-center justify-center gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
                            {ptzDirectionText}
                          </span>
                          <div className="flex justify-around text-[10px] text-slate-450 pt-1.5 border-t border-slate-950 text-[10px]">
                            <span>水平: <b className="text-slate-350 font-bold">{ptzPanValue}°</b></span>
                            <span>俯仰: <b className="text-slate-350 font-bold">{ptzTiltValue}°</b></span>
                          </div>
                        </div>

                        {/* Fine Symmetrical adjustments */}
                        <div className="space-y-2 text-[11px] font-mono select-none">
                          
                          {/* Zoom adjustment row */}
                          <div className="flex items-center justify-between bg-slate-900 border border-slate-950 p-1.5 rounded-md">
                            <span className="text-slate-400 pl-1">变倍：</span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setPtzZoom(v => Math.max(1, +(v - 0.5).toFixed(1)))}
                                className="w-5.5 h-5.5 bg-slate-950 hover:bg-slate-800 rounded font-black text-slate-300 hover:text-cyan-400 flex items-center justify-center cursor-pointer text-xs"
                              >
                                -
                              </button>
                              <span className="text-[11.5px] font-bold text-slate-100 min-w-[36px] text-center">
                                {ptzZoom}×
                              </span>
                              <button
                                onClick={() => setPtzZoom(v => Math.min(16, +(v + 0.5).toFixed(1)))}
                                className="w-5.5 h-5.5 bg-slate-950 hover:bg-slate-800 rounded font-black text-slate-300 hover:text-cyan-400 flex items-center justify-center cursor-pointer text-xs"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          {/* Iris adjustment row */}
                          <div className="flex items-center justify-between bg-slate-900 border border-slate-950 p-1.5 rounded-md">
                            <span className="text-slate-400 pl-1">光圈：</span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setPtzAperture(v => Math.max(10, v - 5))}
                                className="w-5.5 h-5.5 bg-slate-950 hover:bg-slate-800 rounded font-black text-slate-300 hover:text-cyan-400 flex items-center justify-center cursor-pointer text-xs"
                              >
                                -
                              </button>
                              <span className="text-[11.5px] font-bold text-slate-100 min-w-[36px] text-center">
                                {ptzAperture}F
                              </span>
                              <button
                                onClick={() => setPtzAperture(v => Math.min(100, v + 5))}
                                className="w-5.5 h-5.5 bg-slate-950 hover:bg-slate-800 rounded font-black text-slate-300 hover:text-cyan-400 flex items-center justify-center cursor-pointer text-xs"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          {/* Focus adjustment row */}
                          <div className="flex items-center justify-between bg-slate-900 border border-slate-950 p-1.5 rounded-md">
                            <span className="text-slate-400 pl-1">聚焦：</span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setPtzFocus(v => Math.max(10, v - 5))}
                                className="w-5.5 h-5.5 bg-slate-950 hover:bg-slate-800 rounded font-black text-slate-300 hover:text-cyan-400 flex items-center justify-center cursor-pointer text-xs"
                              >
                                -
                              </button>
                              <span className="text-[11.5px] font-bold text-slate-100 min-w-[36px] text-center">
                                {ptzFocus}
                              </span>
                              <button
                                onClick={() => setPtzFocus(v => Math.min(250, v + 5))}
                                className="w-5.5 h-5.5 bg-slate-950 hover:bg-slate-800 rounded font-black text-slate-300 hover:text-cyan-400 flex items-center justify-center cursor-pointer text-xs"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          {/* Speed selector range slider */}
                          <div className="space-y-1 shadow-inner p-1">
                            <div className="flex justify-between items-center text-[9.5px] text-slate-500">
                              <span>调节速率百分比:</span>
                              <span className="text-cyan-400 font-bold">{ptzSpeed}%</span>
                            </div>
                            <input
                              type="range"
                              min="1"
                              max="100"
                              value={ptzSpeed}
                              onChange={(e) => setPtzSpeed(+e.target.value)}
                              className="w-full bg-slate-900 h-1 rounded-md appearance-none cursor-pointer accent-cyan-400 border border-slate-950"
                            />
                          </div>
                        </div>

                        {/* Action buttons (Light, Wiper, etc.) */}
                        <div className="grid grid-cols-4 gap-1 select-none text-[9px] font-mono leading-relaxed text-center">
                          
                          {/* Light */}
                          <button
                            onClick={() => {
                              setIsLightActive(!isLightActive);
                              setPtzDirectionText(isLightActive ? "关闭补光" : "极域夜视补光");
                            }}
                            className={`flex flex-col items-center justify-center gap-1 py-1 px-0.5 rounded border transition-colors cursor-pointer ${
                              isLightActive
                                ? "bg-amber-950/40 border-yellow-500/60 text-yellow-405 shadow-[0_0_8px_rgba(234,179,8,0.25)]"
                                : "bg-slate-900 border-slate-950 text-slate-450 hover:border-slate-800"
                            }`}
                          >
                            <span className="text-[10px]">💡</span>
                            <span>灯光</span>
                          </button>

                          {/* Wiper */}
                          <button
                            onClick={() => {
                              setIsWiperActive(!isWiperActive);
                              setPtzDirectionText(isWiperActive ? "关闭扫雨刷" : "启动除积尘雨刷");
                            }}
                            className={`flex flex-col items-center justify-center gap-1 py-1 px-0.5 rounded border transition-colors cursor-pointer ${
                              isWiperActive
                                ? "bg-cyan-950 border-cyan-500/60 text-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.25)]"
                                : "bg-slate-900 border-slate-950 text-slate-450 hover:border-slate-800"
                            }`}
                          >
                            <span className="text-[10px]">🧹</span>
                            <span>雨刷</span>
                          </button>

                          {/* Aux Focus */}
                          <button
                            onClick={() => {
                              setPtzFocus(110);
                              setPtzDirectionText("辅助自动调焦");
                            }}
                            className="flex flex-col items-center justify-center gap-1 py-1 px-0.5 rounded bg-slate-900 border border-slate-950 text-slate-450 hover:border-slate-800 cursor-pointer"
                          >
                            <span className="text-[10px]">🎯</span>
                            <span className="truncate">辅助聚焦</span>
                          </button>

                          {/* Lens initialize */}
                          <button
                            onClick={() => {
                              setPtzPanValue(218.4);
                              setPtzTiltValue(12.6);
                              setPtzZoom(4.0);
                              setPtzFocus(75);
                              setPtzDirectionText("镜头基准归零");
                            }}
                            className="flex flex-col items-center justify-center gap-1 py-1 px-0.5 rounded bg-slate-900 border border-slate-950 text-slate-450 hover:border-slate-800 cursor-pointer"
                          >
                            <span className="text-[10px]">🔄</span>
                            <span className="truncate">镜头重置</span>
                          </button>

                          {/* Manual Screen Snapshot */}
                          <button
                            onClick={() => {
                              setPtzDirectionText(`已截存通道${activeCameraIndex}画面`);
                              alert(`【手动截图成功】\n已抓取并归档 通道 ${activeCameraIndex}# 画面：\n保存位置: server://opt/cctv_history/IP_${channelToNameMap[activeCameraIndex]?.ip}.jpg`);
                            }}
                            className="flex flex-col items-center justify-center gap-1 py-1 px-0.5 rounded bg-slate-900 border border-slate-950 text-slate-450 hover:border-slate-800 cursor-pointer"
                          >
                            <span className="text-[10px]">📷</span>
                            <span>手动截图</span>
                          </button>

                          {/* 3D targeting spot */}
                          <button
                            onClick={() => {
                              setPtzPanValue(180.0);
                              setPtzTiltValue(25.0);
                              setPtzDirectionText("3D定点聚焦");
                            }}
                            className="flex flex-col items-center justify-center gap-1 py-1 px-0.5 rounded bg-slate-900 border border-slate-950 text-slate-450 hover:border-slate-800 cursor-pointer"
                          >
                            <span className="text-[10px]">🔍</span>
                            <span>3D定位</span>
                          </button>

                          {/* One key tour cycle */}
                          <button
                            onClick={() => {
                              setIsTourActive(!isTourActive);
                              setPtzDirectionText(isTourActive ? "静止监听" : "一键巡航启动");
                            }}
                            className={`flex flex-col items-center justify-center gap-1 py-1 px-0.5 rounded border transition-colors cursor-pointer ${
                              isTourActive
                                ? "bg-purple-950 border-purple-500/60 text-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.25)]"
                                : "bg-slate-900 border-slate-950 text-slate-450 hover:border-slate-800"
                            }`}
                          >
                            <span className="text-[10px]">✈️</span>
                            <span>一键巡游</span>
                          </button>

                          {/* Watch mode guard */}
                          <button
                            onClick={() => {
                              setIsWatchActive(!isWatchActive);
                              setPtzDirectionText(isWatchActive ? "解除守望" : "锁定守望");
                            }}
                            className={`flex flex-col items-center justify-center gap-1 py-1 px-0.5 rounded border transition-colors cursor-pointer ${
                              isWatchActive
                                ? "bg-emerald-950 border-emerald-500/60 text-emerald-450 shadow-[0_0_8px_rgba(16,185,129,0.25)]"
                                : "bg-slate-900 border-slate-950 text-slate-450 hover:border-slate-800"
                            }`}
                          >
                            <span className="text-[10px]">🛡️</span>
                            <span>一键守望</span>
                          </button>

                        </div>
                      </div>

                      {/* Stat summary counters */}
                      <div className="pt-2 border-t border-slate-900 grid grid-cols-3 gap-1.5 text-center text-xs">
                        <div className="bg-[#050b14]/50 p-1.5 rounded border border-slate-950 flex flex-col justify-between">
                          <span className="text-[13px] font-black text-cyan-405 font-mono text-cyan-400">57</span>
                          <span className="text-[8.5px] text-slate-550 block mt-0.5 whitespace-nowrap">监测点总数</span>
                        </div>
                        <div className="bg-[#050b14]/50 p-1.5 rounded border border-slate-950 flex flex-col justify-between">
                          <span className="text-[13px] font-black text-emerald-450 font-mono text-emerald-400">45</span>
                          <span className="text-[8.5px] text-slate-550 block mt-0.5 whitespace-nowrap">在线数</span>
                        </div>
                        <div className="bg-[#050b14]/50 p-1.5 rounded border border-slate-950 flex flex-col justify-between">
                          <span className="text-[13px] font-black text-rose-500 font-mono text-rose-500">12</span>
                          <span className="text-[8.5px] text-slate-550 block mt-0.5 whitespace-nowrap">离线数</span>
                        </div>
                      </div>

                    </div>

                  </div>
                );
              })()}

              {/* PAGE 9: 运输方式统计 */}
              {activeSubPage === "transport_mode_stats" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                  <div className="bg-slate-950 border border-slate-900 rounded-xl p-4 lg:col-span-1 flex flex-col justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-300 block border-b border-slate-900 pb-1.5 mb-3 font-sans">
                        多元绿色大宗发运渠道占比 (月结量化)
                      </span>

                      <div className="h-[140px] w-full relative">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={transportModeData}
                              cx="50%"
                              cy="50%"
                              innerRadius={42}
                              outerRadius={60}
                              paddingAngle={3}
                              dataKey="value"
                            >
                              {transportModeData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{ backgroundColor: "#020617", borderColor: "#1e293b", borderRadius: "5px" }}
                              itemStyle={{ fontSize: "10.5px" }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                          <span className="text-[10px] text-slate-500 block">综合媒介</span>
                          <span className="text-xs font-bold text-cyan-400 font-mono">5大运输</span>
                        </div>
                      </div>

                      <div className="space-y-1.5 pt-2 text-[10.5px] font-mono">
                        {transportModeData.map((t, i) => (
                          <div key={i} className="flex justify-between items-center bg-slate-900/10 p-1.5 rounded">
                            <span className="text-slate-400 flex items-center gap-1.5">
                              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: t.color }} />
                              {t.name}
                            </span>
                            <span className="font-bold text-slate-200">{t.value}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-950 border border-slate-900 rounded-xl p-4 lg:col-span-2 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center border-b border-slate-900 pb-1.5 flex-wrap gap-2 text-xs">
                        <span className="font-bold text-slate-200">
                          结合货票、皮带秤、水尺磅单详细核对单
                        </span>

                        {/* Custom Starting/Ending Filters */}
                        <div className="flex gap-2 text-[10px] font-mono items-center">
                          <div className="flex items-center gap-1">
                            <span className="text-slate-500">区间：</span>
                            <input
                              type="date"
                              value={filterStartTime}
                              onChange={(e) => setFilterStartTime(e.target.value)}
                              className="bg-slate-900 border border-slate-800 rounded text-slate-350 px-1 py-0.5 outline-none"
                            />
                          </div>
                          <span>-</span>
                          <input
                            type="date"
                            value={filterEndTime}
                            onChange={(e) => setFilterEndTime(e.target.value)}
                            className="bg-slate-900 border border-slate-800 rounded text-slate-350 px-1 py-0.5 outline-none"
                          />
                        </div>
                      </div>

                      {/* Filter result cards */}
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="bg-slate-900 p-2 rounded border border-slate-850">
                          <span className="text-slate-500 text-[10px] block">核校周转总额：</span>
                          <span className="font-mono text-cyan-400 font-bold block mt-0.5">
                            {filteredTransportLogs.reduce((acc, curr) => acc + curr.count, 0)} 次
                          </span>
                        </div>
                        <div className="bg-slate-900 p-2 rounded border border-slate-850">
                          <span className="text-slate-500 text-[10px] block">大宗货运量计：</span>
                          <span className="font-mono text-emerald-450 font-bold block mt-0.5">
                            {filteredTransportLogs.reduce((acc, curr) => acc + curr.totalWeight, 0).toLocaleString()} 吨
                          </span>
                        </div>
                        <div className="bg-slate-900 p-2 rounded border border-slate-850">
                          <span className="text-slate-500 text-[10px] block">清洁运量白单：</span>
                          <span className="text-slate-300 font-bold block mt-0.5">已与地磅比对一致</span>
                        </div>
                      </div>

                      <div className="overflow-x-auto max-h-[125px]">
                        <table className="w-full text-left text-xs border-collapse font-mono">
                          <thead>
                            <tr className="border-b border-slate-900 text-slate-550">
                              <th className="py-1 px-1">代表日期</th>
                              <th className="py-1 px-1">承载运输方式</th>
                              <th className="py-1 px-1 text-center font-bold">发运频率 (24h)</th>
                              <th className="py-1 px-1">货物名称</th>
                              <th className="py-1 px-1 text-right">运量 (吨)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-950 text-slate-400">
                            {filteredTransportLogs.map((log) => (
                              <tr key={log.id} className="hover:bg-slate-900/10">
                                <td className="py-1.5 px-1 text-slate-350">{log.date}</td>
                                <td className="py-1.5 px-1 text-cyan-400 font-bold">{log.method}</td>
                                <td className="py-1.5 px-1 text-center font-bold text-slate-200">{log.count} 次</td>
                                <td className="py-1.5 px-1">{log.cargo}</td>
                                <td className="py-1.5 px-1 text-right text-emerald-400 font-bold">{log.totalWeight} 吨</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="flex justify-between items-center bg-slate-900/50 p-2 border border-slate-900 mt-3 rounded-lg text-xs">
                      <span className="text-[9.5px] text-slate-500 font-mono">磅单结算无缝接入系统</span>
                      <button
                        onClick={handleExportTransportCSV}
                        className="bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-850 hover:border-emerald-700 text-xs font-bold font-sans rounded px-3 py-1 cursor-pointer flex items-center gap-1.5"
                      >
                        <Download className="h-4 w-4" />
                        <span>导出对应周期绿色量化表 (CSV)</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* PAGE 10: 环卫车清洁子模块 */}
              {activeSubPage === "sanitation_vehicles" && (
                <div className="space-y-4">
                  {/* Stats Cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                    <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-850">
                      <span className="text-slate-500 block">在册环卫特快车组：</span>
                      <span className="text-xl font-mono text-cyan-400 font-black block mt-0.5">{cleaningVehicles.length} 辆</span>
                    </div>
                    <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-850">
                      <span className="text-slate-500 block">当前在线消雾率：</span>
                      <span className="text-xl font-mono text-emerald-400 font-black block mt-0.5">
                        {((cleaningVehicles.filter(v => v.status === "working").length / (cleaningVehicles.length || 1)) * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-850">
                      <span className="text-slate-500 block">今日清扫总路程里程：</span>
                      <span className="text-xl font-mono text-teal-400 font-black block mt-0.5">
                        {cleaningVehicles.reduce((acc, curr) => acc + curr.todayMileage, 0).toFixed(1)} km
                      </span>
                    </div>
                    <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-850">
                      <span className="text-slate-500 block">加水快速站电平：</span>
                      <span className="text-xl font-mono text-purple-400 font-black block mt-0.5">🟢 3组网通连中</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    {/* List */}
                    <div className="lg:col-span-2 space-y-3">
                      {cleaningVehicles.map(v => {
                        const isWorking = v.status === "working";
                        return (
                          <div key={v.id} className="bg-slate-900/50 p-3 rounded-xl border border-slate-850 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-3">
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-slate-100 font-sans">{v.name}</span>
                                <span className={`text-[9px] px-1.5 py-0.2 rounded ${
                                  v.type === "sprinkler" ? "bg-cyan-950 text-cyan-400" :
                                  v.type === "sweeper" ? "bg-teal-950 text-teal-400" : "bg-purple-950 text-purple-400"
                                }`}>
                                  {v.type === "sprinkler" ? "高压推头雾喷" : v.type === "sweeper" ? "强力清吸扫车" : "雾炮喷雾控制机"}
                                </span>
                              </div>

                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-3 gap-y-1 text-[10.5px] text-slate-500 font-mono mt-1.5">
                                <p>司机：{v.driver}</p>
                                <p>水箱：<span className={v.waterLevel < 35 ? "text-yellow-400 font-bold" : "text-cyan-400"}>{v.waterLevel}%</span></p>
                                <p>今日消尘发次：{v.todaySprays} 次</p>
                                <p>速度：{v.speed} km/h</p>
                                <p>班次累计里程：{v.todayMileage} km</p>
                              </div>
                            </div>

                            <button
                              onClick={() => onDispatchVehicle(v.id, isWorking ? "idle" : "working")}
                              className={`rounded-lg px-3 py-1 text-xs font-bold cursor-pointer transition-colors border shrink-0 font-sans ${
                                isWorking 
                                  ? "bg-amber-950 hover:bg-amber-900 text-amber-500 border-amber-850" 
                                  : "bg-emerald-950 hover:bg-emerald-900 text-emerald-400 border-emerald-850"
                              }`}
                            >
                              {isWorking ? "🛑 召回回停库" : "⚡ 紧急指定洒水"}
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    {/* GPS map layout */}
                    <div className="bg-slate-950 border border-slate-900 rounded-xl p-4 flex flex-col justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-350 block border-b border-slate-900 pb-1.5 mb-2 font-mono">
                          2D GNSS-RTK 高精坐标图
                        </span>

                        <div className="relative h-[155px] bg-slate-900 border border-slate-950 rounded-lg overflow-hidden shadow-inner mt-1">
                          {/* Inner dotted track line */}
                          <div className="absolute inset-4 border border-dashed border-slate-800 rounded-full" />

                          {cleaningVehicles.map(v => (
                            <div
                              key={`gps-view-${v.id}`}
                              className="absolute transition-all duration-1000"
                              style={{ left: `${v.latitude}%`, top: `${v.longitude}%` }}
                            >
                              <div className="relative">
                                <span className={`absolute h-5 w-5 -left-2.5 -top-2.5 rounded-full flex items-center justify-center font-mono text-[10px] font-bold text-white ${
                                  v.status === "working" ? "bg-cyan-500 animate-pulse" : "bg-slate-650"
                                }`}>
                                  {v.id.slice(-1)}
                                </span>
                                <div className="absolute left-3.5 -top-2.5 bg-slate-950 border border-slate-850 rounded px-1 text-[8.5px] whitespace-nowrap pointer-events-none text-slate-300">
                                  {v.name.slice(0, 5)}
                                </div>
                              </div>
                            </div>
                          ))}

                          <span className="absolute top-1.5 left-1.5 text-[8.5px] font-mono text-slate-600">📥 北门上矿配仓</span>
                          <span className="absolute bottom-1.5 right-1.5 text-[8.5px] font-mono text-slate-600">🚒 熟料出库大门段</span>
                        </div>
                      </div>

                      <div className="text-[9.5px] leading-relaxed font-mono text-slate-500 pt-3">
                        ✓ 联动触发：当空气监控PM10超 120 ug/m³ 自动唤醒1号水车保洁。
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>

        {/* Global Footer Notes */}
        <div className="mt-8 border-t border-slate-900 pt-3 flex justify-between items-center text-[10px] font-mono text-slate-550 flex-wrap gap-2">
          <span>华新一期清洁运输标准平台（联网版本）</span>
          <span>部网签名校验：SHA256/D8A9F32</span>
        </div>

      </div>

    </div>
  );
}
