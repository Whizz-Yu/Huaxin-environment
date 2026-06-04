/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { CemsStack, DenitrationLog, DcsParameter } from "../types";
import EmissionLedger from "./EmissionLedger";
import EmissionJointMonitoring from "./EmissionJointMonitoring";
import DenitrationMonitoring from "./DenitrationMonitoring";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  FileSpreadsheet,
  Settings,
  ShieldCheck,
  AlertOctagon,
  Flame,
  ArrowRight,
  Sparkles,
  Info,
  Calendar,
  Layers,
  ThermometerSnowflake,
  RotateCw,
  ListFilter,
  Activity,
  Plus,
  Minus,
  Wrench,
  Network,
  Radio,
  Trash2,
  Edit,
  CheckCircle,
  TrendingUp,
  Gauge,
  Terminal,
  Check,
  FileText,
  RefreshCw,
  Play,
  X,
  ChevronRight,
  Cpu,
  MapPin,
  Sliders,
  HelpCircle,
} from "lucide-react";

interface OrganizedEmissionsProps {
  cemsStacks: CemsStack[];
  denitrationLogs: DenitrationLog[];
  dcsParameters: DcsParameter[];
  onTriggerBypass: (id: string, status: "open" | "closed" | "sealed") => void;
}

export default function OrganizedEmissions({
  cemsStacks,
  denitrationLogs,
  dcsParameters,
  onTriggerBypass,
}: OrganizedEmissionsProps) {
  // Navigation Tabs for Sub-features
  const [subTab, setSubTab] = useState<"inventory" | "joint_monitoring" | "denitration" | "bypassChart" | "dcs" | "cems">("inventory");

  // Selection of stack for shared features
  const [selectedStackId, setSelectedStackId] = useState<string>("cems-2"); // default: 2# Kiln tail

  // Custom added emission sources (Subpage 1)
  const [customStacks, setCustomStacks] = useState<CemsStack[]>([]);
  const [editingStackId, setEditingStackId] = useState<string | null>(null);

  // Form States for Emission Source Inventory (Subpage 1)
  const [formName, setFormName] = useState("");
  const [formProcess, setFormProcess] = useState("熟料烧成工段");
  const [formPermitNo, setFormPermitNo] = useState("91530181MA6N3K2D5X001P");
  const [formHeight, setFormHeight] = useState("85m");
  const [formDustMethod, setFormDustMethod] = useState("低压脉冲袋式除尘器");
  const [formDenitMethod, setFormDenitMethod] = useState("SNCR+SCR联合脱硝");
  const [formHasBypass, setFormHasBypass] = useState(false);
  const [formStatus, setFormStatus] = useState<"running" | "stopped" | "fault">("running");

  // Form States for Denitration logs (Subpage 2)
  const [denitLogs, setDenitLogs] = useState<DenitrationLog[]>(denitrationLogs);
  const [newPurchase, setNewPurchase] = useState("");
  const [newConsume, setNewConsume] = useState("");
  const [newNozzle, setNewNozzle] = useState("");

  // Spray Nozzles operational states (Subpage 2)
  const [sprayNozzles, setSprayNozzles] = useState([
    { id: "NZ-1", name: "左侧SNCR喷枪A1", temp: 962, pressure: 0.42, flow: 1.25, status: "running" },
    { id: "NZ-2", name: "左侧SNCR喷枪A2", temp: 955, pressure: 0.38, flow: 1.10, status: "running" },
    { id: "NZ-3", name: "右侧SNCR喷枪B1", temp: 978, pressure: 0.45, flow: 1.32, status: "running" },
    { id: "NZ-4", name: "右侧SNCR喷枪B2", temp: 948, pressure: 0.22, flow: 0.45, status: "warning" }, // warning for low pressure
  ]);
  const [isPurgingGuns, setIsPurgingGuns] = useState(false);
  const [purgeProgress, setPurgeProgress] = useState(0);

  // Exhust Gas stats (Subpage 3)
  const [paramFilter, setParamFilter] = useState<"pm" | "so2" | "nox">("pm");
  const [startDate, setStartDate] = useState("2026-06-01");
  const [endDate, setEndDate] = useState("2026-06-02");
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // DCS section (Subpage 4)
  const [activeDcsSection, setActiveDcsSection] = useState<DcsParameter["section"]>("kiln");
  const [dcsLogs, setDcsLogs] = useState<string[]>([
    "DCS 中控中继网关状态: 挂载正常",
    "通信底频: MODBUS-TCP / UDP [监听中]",
    "采样帧校验完成 (CRC-16校验码 F3B2 对账无误)"
  ]);
  const [isDcsDiagnosing, setIsDcsDiagnosing] = useState(false);
  const [dcsDiagnoseProgress, setDcsDiagnoseProgress] = useState(0);

  // States for interactive DCS parameter adjustment modal & human confirmation
  const [tuningParam, setTuningParam] = useState<{
    sectionId: DcsParameter["section"];
    param: {
      id: string;
      name: string;
      code: string;
      value: number;
      unit: string;
      min: number;
      max: number;
      remark: string;
    };
  } | null>(null);
  const [tuningValueInput, setTuningValueInput] = useState<string>("");
  const [confirmCheckbox, setConfirmCheckbox] = useState<boolean>(false);
  const [tuningError, setTuningError] = useState<string | null>(null);

  // Deep interactive process partitions state
  const [dcsPartitions, setDcsPartitions] = useState<{
    [key in DcsParameter["section"]]: {
      id: DcsParameter["section"];
      name: string;
      status: "running" | "stopped" | "fault";
      desc: string;
      parameters: {
        id: string;
        name: string;
        code: string;
        value: number;
        unit: string;
        min: number;
        max: number;
        remark: string;
      }[];
    }
  }>({
    kiln: {
      id: "kiln",
      name: "水泥窑生产工序",
      status: "running",
      desc: "配料、喂煤煅烧与生料分解中和反应中枢",
      parameters: [
        { id: "k-1", name: "喂料量", code: "FI-101 (主生料喂给量)", value: 350.5, unit: "t/h", min: 300, max: 450, remark: "高温稳定煅烧" },
        { id: "k-2", name: "喂煤量", code: "FI-102 (窑尾分解炉喷煤量)", value: 24.2, unit: "t/h", min: 15, max: 35, remark: "窑内热工配煤" },
        { id: "k-3", name: "分解炉温度", code: "TI-105 (高煅烧室热电偶温度)", value: 885.0, unit: "℃", min: 800, max: 950, remark: "生料熟化率约95%" },
        { id: "k-4", name: "预热器出口温度", code: "TI-108 (旋风负压烟温测点)", value: 320.0, unit: "℃", min: 280, max: 350, remark: "二次热风热流回收" },
        { id: "k-5", name: "CO 浓度", code: "AI-110 (烟气分析红外测定仪)", value: 45.3, unit: "ppm", min: 0, max: 80, remark: "煤粉均燃安全监控" },
        { id: "k-6", name: "协同处置固体废物入窑量", code: "FI-120 (环保固废给料计量秤)", value: 5.6, unit: "t/h", min: 0, max: 10, remark: "生活废污循环协同清消" },
      ]
    },
    kilnTail: {
      id: "kilnTail",
      name: "窑尾排放口监测",
      status: "running",
      desc: "高架烟道排气口及在线环保数据采集端",
      parameters: [
        { id: "kt-1", name: "烟气量", code: "FI-201 (废气流量双孔板差压计)", value: 380450, unit: "m³/h", min: 250000, max: 450000, remark: "负压风路稳定" },
        { id: "kt-2", name: "含氧量", code: "AI-202 (高架烟道氧化锆分析仪)", value: 10.2, unit: "%", min: 5, max: 15, remark: "过冷空气配比" },
        { id: "kt-3", name: "烟气温度", code: "TI-203 (总引风热电阻烟温传感器)", value: 145.2, unit: "℃", min: 100, max: 180, remark: "主烟路透温" },
        { id: "kt-4", name: "氨排放浓度", code: "AI-204 (激光气体分析仪氨逃逸)", value: 2.4, unit: "mg/m³", min: 0, max: 8, remark: "催化还原出口正常" },
      ]
    },
    dustRemove: {
      id: "dustRemove",
      name: "超低除尘工序",
      status: "running",
      desc: "大功率布袋及电静力无组织粉尘捕捉模块",
      parameters: [
        { id: "dr-1", name: "除尘器风量", code: "FI-301 (脉冲喷扫风阻调节仪)", value: 450120, unit: "m³/h", min: 300000, max: 550000, remark: "气固流态均匀" },
        { id: "dr-2", name: "风机电流", code: "II-302 (引风机驱动电枢整流)", value: 125.4, unit: "A", min: 80, max: 180, remark: "变频高效降耗" },
        { id: "dr-3", name: "颗粒物排放浓度", code: "AI-303 (激光浊度后置后散射测仪)", value: 3.8, unit: "mg/m³", min: 0, max: 10, remark: "颗粒级阻断良好" },
      ]
    },
    desof: {
      id: "desof",
      name: "烟气脱硫系统",
      status: "stopped",
      desc: "石灰石-生石膏湿法烟气固硫配淋中继",
      parameters: [
        { id: "ds-1", name: "脱硫剂使用量", code: "FI-401 (高压碱悬浮喷雾电磁计)", value: 1.25, unit: "t/h", min: 0.5, max: 2.5, remark: "浆料吸收泵正常" },
        { id: "ds-2", name: "脱硫剂仓料位", code: "LI-402 (料仓仓顶调谐雷达高度)", value: 68.4, unit: "%", min: 15, max: 95, remark: "料位充足" },
        { id: "ds-3", name: "风机电流", code: "II-403 (烟气再循环喷射机电流)", value: 98.2, unit: "A", min: 60, max: 140, remark: "负荷匹配较小" },
        { id: "ds-4", name: "二氧化硫排放浓度", code: "AI-404 (紫外荧光二氧化硫感应仪)", value: 8.5, unit: "mg/m³", min: 0, max: 35, remark: "高效固硫SO2极低" },
      ]
    },
    denit: {
      id: "denit",
      name: "SNCR深度脱硝工序",
      status: "running",
      desc: "SNCR选择性非催化还原氨水喷淋脱除系统",
      parameters: [
        { id: "dn-1", name: "脱硝剂使用量", code: "FI-501 (氨水储罐喷射高精度计量)", value: 1.84, unit: "t/h", min: 0.5, max: 3.0, remark: "动态负荷跟踪" },
        { id: "dn-2", name: "脱硝剂仓料位", code: "LI-502 (双立式储罐非电接触料位计)", value: 75.2, unit: "%", min: 10, max: 90, remark: "液氨仓安全余量" },
        { id: "dn-3", name: "脱硝反应器入口烟气温度", code: "TI-503A (脱硝反应段入口高温感探)", value: 320.4, unit: "℃", min: 280, max: 360, remark: "SNCR常温运行窗" },
        { id: "dn-4", name: "脱硝反应器出口烟气温度", code: "TI-503B (脱硝净化区出口废汽热温)", value: 315.1, unit: "℃", min: 260, max: 340, remark: "高效催化反应后" },
        { id: "dn-5", name: "脱硝反应器入口烟气压力", code: "PI-504A (前端炉室微负压压差变送器)", value: -1.22, unit: "kPa", min: -2.5, max: -0.1, remark: "进气负压诱导" },
        { id: "dn-6", name: "脱硝反应器出口烟气压力", code: "PI-504B (出口除尘段阻抗微压测量棒)", value: -1.55, unit: "kPa", min: -3.0, max: -0.5, remark: "微阻通过无背压" },
        { id: "dn-7", name: "脱硝反应器入口氮氧化物浓度", code: "AI-505A (还原前高浓度NOx预分析)", value: 650.0, unit: "mg/m³", min: 400, max: 900, remark: "燃烧粗NOx源头" },
        { id: "dn-8", name: "脱硝反应器出口氮氧化物浓度", code: "AI-505B (经过氨区脱除自纠偏检测器)", value: 42.1, unit: "mg/m³", min: 0, max: 100, remark: "脱硝装置高还原率" },
        { id: "dn-9", name: "风机电流", code: "II-506 (氨风稀释电枢主控变频)", value: 110.5, unit: "A", min: 70, max: 150, remark: "空气稀释运行" },
        { id: "dn-10", name: "氮氧化物排放浓度", code: "AI-507 (窑尾废烟NOx综合外排在线感仪)", value: 41.2, unit: "mg/m³", min: 0, max: 50, remark: "排口环保核查合规" },
      ]
    },
  });

  // CEMS Calibration state (Subpage 5)
  const [activeCalibStep, setActiveCalibStep] = useState<number>(0); // 0 waiting, 1 purge, 2 zero-gas, 3 span-gas, 4 done
  const [calibProgress, setCalibProgress] = useState(0);
  const [calibLogs, setCalibLogs] = useState([
    { id: "cb-1", time: "2026-06-03 04:00", stack: "2# 回转窑尾", pmDrift: "-0.02%", so2Drift: "+0.15%", status: "达标" },
    { id: "cb-2", time: "2026-06-02 04:00", stack: "1# 水泥窑头", pmDrift: "+0.04%", so2Drift: "-0.11%", status: "达标" },
    { id: "cb-3", time: "2026-06-01 04:00", stack: "2# 回转窑尾", pmDrift: "-0.01%", so2Drift: "+0.08%", status: "达标" },
  ]);

  // Automated compliance self-inspection states
  const [selfInspectActive, setSelfInspectActive] = useState(false);
  const [selfInspectProgress, setSelfInspectProgress] = useState(0);
  const [selfInspectStepMsg, setSelfInspectStepMsg] = useState("");
  const [selfInspectReport, setSelfInspectReport] = useState<any>(null);
  const [selectedStandardType, setSelectedStandardType] = useState<"ultra_low" | "gb_key" | "gb_normal">("ultra_low");

  // Redesigned Inventory Workspace States corresponding to detailed interactive analysis request
  const [inventoryDetailMode, setInventoryDetailMode] = useState<"auto_monitoring" | "manual_sampling" | "evaluation">("auto_monitoring");
  const [invStartDate, setInvStartDate] = useState("2026-06-01");
  const [invEndDate, setInvEndDate] = useState("2026-06-03");
  const [invActiveChartParam, setInvActiveChartParam] = useState<string>("pm");
  const [invExportingNotice, setInvExportingNotice] = useState<string | null>(null);

  // Compute merged lists
  const allStacks = [...cemsStacks, ...customStacks];
  const selectedStack = allStacks.find((s) => s.id === selectedStackId) || allStacks[0];

  // Dynamic limits depending on stack and selected policy standard types
  const getLimitsForStack = (stackId: string, standardType: "ultra_low" | "gb_key" | "gb_normal") => {
    if (standardType === "ultra_low") {
      if (stackId === "cems-2" || stackId === "cems-5" || stackId.includes("custom")) {
        return { pm: 10, so2: 35, nox: 50 };
      } else if (stackId === "cems-1") {
        return { pm: 10, so2: 1.5, nox: 15 }; 
      } else if (stackId === "cems-3") {
        return { pm: 10, so2: 5, nox: 20 };
      } else {
        return { pm: 10, so2: 5, nox: 10 };
      }
    } else if (standardType === "gb_key") {
      if (stackId === "cems-2" || stackId === "cems-5" || stackId.includes("custom")) {
        return { pm: 20, so2: 100, nox: 320 };
      } else if (stackId === "cems-1") {
        return { pm: 20, so2: 10, nox: 50 };
      } else if (stackId === "cems-3") {
        return { pm: 20, so2: 20, nox: 50 };
      } else {
        return { pm: 20, so2: 10, nox: 30 };
      }
    } else {
      if (stackId === "cems-2" || stackId === "cems-5" || stackId.includes("custom")) {
        return { pm: 30, so2: 200, nox: 400 };
      } else if (stackId === "cems-1") {
        return { pm: 30, so2: 20, nox: 100 };
      } else if (stackId === "cems-3") {
        return { pm: 30, so2: 50, nox: 100 };
      } else {
        return { pm: 30, pm10: 30, so2: 30, nox: 50 };
      }
    }
  };

  const activeLimits = getLimitsForStack(selectedStackId, selectedStandardType);
  const limits = activeLimits;

  // Sync logs when parent data updates initially
  useEffect(() => {
    if (denitrationLogs && denitrationLogs.length > 0 && denitLogs.length === denitrationLogs.length) {
      setDenitLogs(denitrationLogs);
    }
  }, [denitrationLogs]);

  // Handle addition of a custom stack (Subpage 1)
  const handleAddOrEditStack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    if (editingStackId) {
      // Edit mode
      setCustomStacks((prev) =>
        prev.map((s) =>
          s.id === editingStackId
            ? {
                ...s,
                name: formName,
                process: formProcess,
                permitNo: formPermitNo,
                status: formStatus,
                hasBypass: formHasBypass,
              }
            : s
        )
      );
      setEditingStackId(null);
    } else {
      // Add mode
      const newId = `cems-custom-${Date.now()}`;
      const newStack: CemsStack = {
        id: newId,
        name: formName,
        process: formProcess,
        permitNo: formPermitNo,
        status: formStatus,
        hasBypass: formHasBypass,
        bypassStatus: formHasBypass ? "closed" : "sealed",
        oxygen: 12.5,
        pm: 3.5,
        so2: 8.2,
        nox: 22.0,
        nh3: 1.1,
        hf: 0.05,
        co: 85,
        nmhc: 0.6,
        temperature: 95,
        flowRate: 154000,
        pressure: -0.45,
      };
      setCustomStacks((prev) => [...prev, newStack]);
      setSelectedStackId(newId);
    }

    // Reset Form Fields
    setFormName("");
    setFormProcess("熟料烧成工段");
    setFormPermitNo("91530181MA6N3K2D5X001P");
    setFormHeight("85m");
    setFormDustMethod("低压脉冲袋式除尘器");
    setFormDenitMethod("SNCR+SCR联合脱硝");
    setFormHasBypass(false);
    setFormStatus("running");
  };

  // Trigger editing a stack
  const triggerEditStack = (stack: CemsStack) => {
    setEditingStackId(stack.id);
    setFormName(stack.name);
    setFormProcess(stack.process);
    setFormPermitNo(stack.permitNo);
    setFormStatus(stack.status);
    setFormHasBypass(stack.hasBypass);
  };

  // Delete a custom stack (original ones stay unchanged for safety)
  const handleDeleteCustomStack = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCustomStacks((prev) => prev.filter((s) => s.id !== id));
    if (selectedStackId === id) {
      setSelectedStackId(cemsStacks[0]?.id || "cems-1");
    }
  };

  // Handle SNCR/SCR Denitration log addition (Subpage 2)
  const handleAddDenitLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newConsume) return;
    const item: DenitrationLog = {
      id: `newdn-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      purchasedAmount: parseFloat(newPurchase) || 0,
      consumedAmount: parseFloat(newConsume),
      nozzleInspect: newNozzle || "高效双流体雾化单元巡检记录良",
      operator: "曹工"
    };
    setDenitLogs([item, ...denitLogs]);
    setNewPurchase("");
    setNewConsume("");
    setNewNozzle("");
  };

  const handleDeleteDenitLog = (id: string) => {
    setDenitLogs(prev => prev.filter(l => l.id !== id));
  };

  // Gun backwash action simulation (Subpage 2)
  const triggerPurgeGuns = () => {
    if (isPurgingGuns) return;
    setIsPurgingGuns(true);
    setPurgeProgress(0);
    const interval = setInterval(() => {
      setPurgeProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsPurgingGuns(false);
          // Auto recover warning nozzle status
          setSprayNozzles(prevNozzles =>
            prevNozzles.map(n => n.id === "NZ-4" ? { ...n, pressure: 0.40, flow: 1.15, status: "running" } : n)
          );
          return 100;
        }
        return prev + 10;
      });
    }, 250);
  };

  // Export report analyzer simulation (Subpage 3)
  const handleExport = (name: string) => {
    setExportNotice(`正在汇出 [${name}] 超低排历史统计分析报表.csv 文件...`);
    setTimeout(() => {
      setExportNotice(`汇出成功! 已创建合格校验电子签名校验戳：SHA-256 [Huaxin_CEMS_Compliance]`);
      setTimeout(() => setExportNotice(null), 3000);
    }, 1800);
  };

  // DCS Integrity Diagnostic Simulation (Subpage 4)
  const triggerDcsDiagnostics = () => {
    if (isDcsDiagnosing) return;
    setIsDcsDiagnosing(true);
    setDcsDiagnoseProgress(0);
    setDcsLogs((prev) => ["--- 发起DCS分布式接入自诊断流程 ---", ...prev]);

    const steps = [
      { p: 20, m: "[OPC-UA] 握手通信网关 192.168.10.22... [成功]" },
      { p: 40, m: "[DCS-PLC] 扫掠S7-1500测流寄存器状态 (40001 - 40220)... [无丢失]" },
      { p: 60, m: "[数据通道] 验证熟料窑尾35m平台热电偶电压反馈，均方差 0.04%... [优良]" },
      { p: 80, m: "[总线校真] 窑体低负压差压信号回路阻抗测定: 242Ω... [合格]" },
      { p: 100, m: "[中控桥接] 通道校验通过。5个主监测工艺段包丢失率为0.01%，在线校验合格率100%。" }
    ];

    let currentStepIdx = 0;
    const interval = setInterval(() => {
      if (currentStepIdx < steps.length) {
        const step = steps[currentStepIdx];
        setDcsDiagnoseProgress(step.p);
        setDcsLogs((prev) => [step.m, ...prev]);
        currentStepIdx++;
      } else {
        clearInterval(interval);
        setIsDcsDiagnosing(false);
      }
    }, 600);
  };

  // Change DCS running status dynamically
  const toggleDcsStatus = (sectId: DcsParameter["section"], e: React.MouseEvent) => {
    e.stopPropagation();
    const statuses: ("running" | "stopped" | "fault")[] = ["running", "stopped", "fault"];
    setDcsPartitions(prev => {
      const sect = prev[sectId];
      const currentIdx = statuses.indexOf(sect.status);
      const nextStatus = statuses[(currentIdx + 1) % statuses.length];
      
      const newLogs = [
        `[运行中枢] 工艺分段【${sect.name}】运行状态变更为：${
          nextStatus === "running" ? "● 运行 Running" : nextStatus === "stopped" ? "○ 停止 Stopped" : "▲ 故障 Fault"
        }`,
        ...dcsLogs
      ];
      setDcsLogs(newLogs.slice(0, 40));
      
      return {
        ...prev,
        [sectId]: {
          ...sect,
          status: nextStatus
        }
      };
    });
  };

  // Adjust DCS parameter value manually
  const updateDcsValueDirectly = (sectId: DcsParameter["section"], paramId: string, targetValue: number) => {
    setDcsPartitions(prev => {
      const sect = prev[sectId];
      if (!sect) return prev;
      const updatedParams = sect.parameters.map(p => {
        if (p.id === paramId) {
          const isOver = targetValue > p.max || targetValue < p.min;
          let newLogs = [...dcsLogs];
          if (isOver) {
            newLogs = [
              `[DCS超标越冲] ⚠️ 写入越界警报！测点【${p.name}】写入目标值 ${targetValue} ${p.unit} 超出设计安全区间 (${p.min}-${p.max})！指令已强制下发。`,
              ...newLogs
            ];
          } else {
            newLogs = [
              `[DCS物理解算] ✔ 人工安全授权。PLC寄存器控制器写入命令包：测点【${p.name} (${p.code})】标定值 ${p.value} ➔ ${targetValue} ${p.unit}`,
              ...newLogs
            ];
          }
          setDcsLogs(newLogs.slice(0, 40));
          return { ...p, value: targetValue };
        }
        return p;
      });
      
      return {
        ...prev,
        [sectId]: {
          ...sect,
          parameters: updatedParams
        }
      };
    });
  };

  // Adjust DCS parameter value manually (legacy delta step)
  const adjustDcsValue = (sectId: DcsParameter["section"], paramId: string, amount: number) => {
    setDcsPartitions(prev => {
      const sect = prev[sectId];
      const updatedParams = sect.parameters.map(p => {
        if (p.id === paramId) {
          const newVal = parseFloat((p.value + amount).toFixed(p.value % 1 === 0 && amount % 1 === 0 ? 0 : 1));
          const isOver = newVal > p.max || newVal < p.min;
          
          let newLogs = [...dcsLogs];
          if (isOver) {
            newLogs = [
              `[DCS超标越区] 警告！测点【${p.name}】实测 ${newVal} 已跑越合格区间 (${p.min}-${p.max} ${p.unit})！`,
              ...newLogs
            ];
          } else {
            newLogs = [
              `[DCS在线微调] 测点【${p.name} (${p.code})】人工微调标度: ${p.value} ➔ ${newVal} ${p.unit}`,
              ...newLogs
            ];
          }
          setDcsLogs(newLogs.slice(0, 40));
          
          return { ...p, value: newVal };
        }
        return p;
      });
      
      return {
        ...prev,
        [sectId]: {
          ...sect,
          parameters: updatedParams
        }
      };
    });
  };

  // CEMS Calibration Step-by-Step Simulation (Subpage 5)
  const triggerCemsCalibration = () => {
    if (activeCalibStep !== 0) return;
    setActiveCalibStep(1);
    setCalibProgress(0);

    const steps = [
      { s: 1, p: 25, label: "采样枪高压热清洗吹扫中 (Purging chamber)..." },
      { s: 2, p: 50, label: "注入高纯氮气(N2)进行传感器零点配准 (Zero calibration)..." },
      { s: 3, p: 75, label: "注入配气标钢瓶标气进行量程极化校准 (Span calibration)..." },
      { s: 4, p: 100, label: "自动零点及量程校准完成，传感器漂移偏差记录合格。" }
    ];

    let currentStepIdx = 0;
    const interval = setInterval(() => {
      if (currentStepIdx < steps.length) {
        const step = steps[currentStepIdx];
        setActiveCalibStep(step.s);
        setCalibProgress(step.p);
        currentStepIdx++;
      } else {
        clearInterval(interval);
        // Append a new calibration ledger log
        const newLog = {
          id: `cb-new-${Date.now()}`,
          time: new Date().toLocaleTimeString(),
          stack: selectedStack.name.substring(0, 10),
          pmDrift: "-0.01%",
          so2Drift: "+0.03%",
          status: "达标"
        };
        setCalibLogs(prev => [newLog, ...prev]);
        setActiveCalibStep(0); // reset
      }
    }, 1200);
  };

  // CEMS Automated Compliance Self-Inspection
  const triggerComplianceSelfInspection = () => {
    if (selfInspectActive) return;
    setSelfInspectActive(true);
    setSelfInspectProgress(5);
    setSelfInspectStepMsg("正在初始化全系统有组织自查链路...");
    setSelfInspectReport(null);

    const steps = [
      { p: 20, msg: `连接 ${selectedStack.name} 激光气体分析腔体总线 (MODBUS TCP)...` },
      { p: 50, msg: `采集实际浓度值: PM ${selectedStack.pm}mg/m³, SO₂ ${selectedStack.so2}mg/m³, NOx ${selectedStack.nox}mg/m³` },
      { p: 80, msg: `参照 ${selectedStandardType === 'ultra_low' ? '超低排放技术指南' : selectedStandardType === 'gb_key' ? '《GB 4915-2013》重点区域' : '《GB 4915-2013》一般区域'} 政策指标执行比对分析与折算...` },
      { p: 100, msg: "分析模型解算完成，正在生成自查核实报告..." }
    ];

    let stepIdx = 0;
    const interval = setInterval(() => {
      if (stepIdx < steps.length) {
        setSelfInspectProgress(steps[stepIdx].p);
        setSelfInspectStepMsg(steps[stepIdx].msg);
        stepIdx++;
      } else {
        clearInterval(interval);
        setSelfInspectActive(false);

        // Generate final report
        const hasPassedPm = selectedStack.pm <= limits.pm;
        const hasPassedSo2 = selectedStack.so2 <= limits.so2;
        const hasPassedNox = selectedStack.nox <= limits.nox;
        const isOverallPassed = hasPassedPm && hasPassedSo2 && hasPassedNox;

        const report = {
          stackId: selectedStack.id,
          stackName: selectedStack.name,
          process: selectedStack.process,
          standardType: selectedStandardType,
          auditor: "cowleszdqzh@gmail.com",
          time: new Date().toISOString().replace('T', ' ').substring(0, 19),
          pmVal: selectedStack.pm,
          pmLimit: limits.pm,
          pmPassed: hasPassedPm,
          so2Val: selectedStack.so2,
          so2Limit: limits.so2,
          so2Passed: hasPassedSo2,
          noxVal: selectedStack.nox,
          noxLimit: limits.nox,
          noxPassed: hasPassedNox,
          isOverallPassed,
          oxygen: selectedStack.oxygen || 11.2,
          temperature: selectedStack.temperature || 145,
          pressure: selectedStack.pressure || -0.22,
          flowRate: selectedStack.flowRate || 350000,
          bypassStatus: selectedStack.bypassStatus === "open" ? "异常开启" : selectedStack.bypassStatus === "closed" ? "旁路正常关闭" : "铅封静默合规"
        };
        setSelfInspectReport(report);
      }
    }, 605);
  };

  // Generate mock sample chart data
  const generateTrendData = () => {
    const baseVal = selectedStack[paramFilter] || 5;
    return Array.from({ length: 15 }, (_, i) => {
      const floatVal = baseVal + (Math.sin(i / 2) * (baseVal * 0.15)) + (Math.random() - 0.5) * (baseVal * 0.05);
      return {
        tick: `${i * 2 + 8}:00`,
        [paramFilter]: parseFloat(Math.max(0.1, floatVal).toFixed(2)),
        limit: limits[paramFilter],
      };
    });
  };

  const trendData = generateTrendData();

  // Helper renderer for dynamic emission meters inside the CEMS access chamber
  const renderCemsBar = (label: string, value: number, limit: number, unit: string, colorClass: string) => {
    const isExceeded = value > limit;
    const pct = Math.min((value / limit) * 100, 100);
    return (
      <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-900/40 relative overflow-hidden flex flex-col justify-between h-24">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-[11px] text-slate-450 block">{label}</span>
            <div className="flex items-baseline gap-1 mt-1 font-mono">
              <span className={`text-lg font-bold ${isExceeded ? "text-red-500 animate-pulse" : colorClass}`}>
                {value.toFixed(1)}
              </span>
              <span className="text-[9.5px] text-slate-500">{unit}</span>
            </div>
          </div>
          <span className="text-[9px] text-slate-500 bg-slate-950 px-1.5 py-0.5 rounded font-mono">
            标准 {limit}
          </span>
        </div>

        <div className="mt-3">
          <div className="h-1 bg-slate-950 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${isExceeded ? "bg-red-500" : "bg-cyan-500"}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="flex justify-between text-[8px] text-slate-600 font-mono mt-1">
            <span>0%</span>
            <span>合规限</span>
            <span>150%</span>
          </div>
        </div>
      </div>
    );
  };

  // Redesigned Inventory Workspace helper utils
  const getParamColor = (param: string) => {
    switch (param) {
      case "pm": return "#f43f5e";
      case "so2": return "#f59e0b";
      case "nox": return "#d946ef";
      case "oxygen": return "#06b6d4";
      case "co": return "#6366f1";
      case "temperature": return "#f43f5e";
      default: return "#22d3ee";
    }
  };

  const getMockAutoChartData = (stack: any, param: string, start: string, end: string) => {
    // Generate simulated dynamic 72h-interval telemetry lines
    const baseVal = stack[param] || 25;
    return [
      { time: `${start.slice(5)} 08:00`, value: Number((baseVal * 0.95).toFixed(2)) },
      { time: `${start.slice(5)} 16:00`, value: Number((baseVal * 1.02).toFixed(2)) },
      { time: `${start.slice(5)} 20:00`, value: Number((baseVal * 0.98).toFixed(2)) },
      { time: `${end.slice(5)} 04:00`, value: Number((baseVal * 1.05).toFixed(2)) },
      { time: `${end.slice(5)} 12:00`, value: Number((baseVal * 0.92).toFixed(2)) },
      { time: `${end.slice(5)} 18:00`, value: Number((baseVal * 0.97).toFixed(2)) },
      { time: `${end.slice(5)} 23:59`, value: Number((baseVal * 1.01).toFixed(2)) },
    ];
  };

  const getMockManualChartPoints = (stack: any, start: string, end: string) => {
    const baseTemp = stack.temperature || 93;
    return [
      { time: `${start.slice(5)} 10:00`, manual_temp: Number((baseTemp * 0.97).toFixed(1)), manual_flow: 13.5 },
      { time: `${start.slice(5)} 15:00`, manual_temp: Number((baseTemp * 0.99).toFixed(1)), manual_flow: 14.1 },
      { time: `${end.slice(5)} 09:00`, manual_temp: Number((baseTemp * 0.96).toFixed(1)), manual_flow: 13.7 },
      { time: `${end.slice(5)} 16:00`, manual_temp: Number((baseTemp * 1.01).toFixed(1)), manual_flow: 13.9 },
      { time: `${end.slice(5)} 21:00`, manual_temp: Number((baseTemp * 0.98).toFixed(1)), manual_flow: 13.8 },
    ];
  };

  const handleExportInventoryRecord = () => {
    const fnMode = inventoryDetailMode === "auto_monitoring" ? "连续自动CEMS" : 
                   inventoryDetailMode === "manual_sampling" ? "比对手工监测" : "环保对标评价";
    setInvExportingNotice(`⏳ 正在对齐 [${selectedStack.name}] [${fnMode}] 分组台账并验证防伪哈希...`);
    
    setTimeout(() => {
      setInvExportingNotice(`✔ [${selectedStack.name}] ${fnMode}台账报表(.xlsx)已生成并导出防伪码!`);
      setTimeout(() => setInvExportingNotice(null), 7050);
    }, 2000);
  };

  const renderDetailValueCard = (label: string, value: number, unit: string, key: string, customColor: string) => {
    return (
      <div className="bg-slate-900/50 p-2.5 rounded border border-slate-900 flex flex-col justify-between font-mono">
        <span className="text-[10px] text-slate-500 font-sans leading-tight">{label}</span>
        <div className="mt-1 flex items-baseline gap-0.5">
          <span className={`text-[13px] font-bold ${customColor}`}>{value}</span>
          <span className="text-[8px] text-slate-550 scale-90 ml-0.5">{unit}</span>
        </div>
      </div>
    );
  };

  // Sub-tab definitions
  const tabs = [
    { id: "inventory", name: "排放源建账档案", desc: "厂区排口台账及物理接入", icon: ListFilter, color: "text-sky-400" },
    { id: "joint_monitoring", name: "联合监测与对标评价", desc: "在线/手工同屏分析与对标偏差评算", icon: Activity, color: "text-cyan-400" },
    { id: "denitration", name: "脱硝系统生产监测", desc: "氨水库容与喷枪巡检自洁", icon: Flame, color: "text-fuchsia-400" },
    { id: "bypassChart", name: "外排烟气旁路监管", desc: "物理应急旁路开度防舞弊", icon: ThermometerSnowflake, color: "text-indigo-400" },
    { id: "dcs", name: "分布式控制DCS接入", desc: "窑体分段各中继高频监测点位", icon: Settings, color: "text-orange-400" },
    { id: "cems", name: "CEMS在线自标定", desc: "五重气态因子日零量漂自检", icon: Cpu, color: "text-rose-400" },
  ];

  return (
    <div className="space-y-4">
      {/* Tab Navigation header */}
      <div className="bg-slate-950/90 rounded-xl border border-blue-900/30 p-2.5 shadow-xl">
        <div className="flex flex-wrap gap-1.5 text-xs text-slate-200">
          {tabs.map((tab) => {
            const isTabActive = subTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                onClick={() => setSubTab(tab.id as any)}
                className={`flex-1 min-w-[170px] p-2 rounded-lg border text-left transition-all relative overflow-hidden group ${
                  isTabActive
                    ? "bg-slate-900/90 border-cyan-500/50 shadow-md text-white"
                    : "bg-transparent border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/35"
                }`}
              >
                <div className="flex items-center gap-2 mb-0.5">
                  <Icon className={`h-4 w-4 ${isTabActive ? tab.color + " drop-shadow-[0_0_5px_currentColor]" : "text-slate-500 group-hover:text-slate-400"}`} />
                  <span className={`text-xs font-sans font-bold tracking-wide ${isTabActive ? tab.color : "text-slate-300"}`}>
                    {tab.name}
                  </span>
                </div>
                <p className="text-[9.5px] text-slate-500 font-sans truncate">{tab.desc}</p>
                {isTabActive && (
                  <div className="absolute bottom-0 inset-x-0 h-0.5 bg-cyan-400" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 排放源档案与台账登记主页面 */}
      {subTab === "inventory" && (
        <EmissionLedger
          allStacks={allStacks}
          selectedStackId={selectedStackId}
          setSelectedStackId={setSelectedStackId}
          onSetSubTab={setSubTab}
          editingStackId={editingStackId}
          setEditingStackId={setEditingStackId}
          formName={formName}
          setFormName={setFormName}
          formProcess={formProcess}
          setFormProcess={setFormProcess}
          formPermitNo={formPermitNo}
          setFormPermitNo={setFormPermitNo}
          formHeight={formHeight}
          setFormHeight={setFormHeight}
          formDustMethod={formDustMethod}
          setFormDustMethod={setFormDustMethod}
          formDenitMethod={formDenitMethod}
          setFormDenitMethod={setFormDenitMethod}
          formHasBypass={formHasBypass}
          setFormHasBypass={setFormHasBypass}
          formStatus={formStatus}
          setFormStatus={setFormStatus}
          onAddOrEditStack={handleAddOrEditStack}
          onTriggerEditStack={triggerEditStack}
          onDeleteCustomStack={handleDeleteCustomStack}
        />
      )}

      {/* SUB-PAGE 2: 脱硝系统生产监测 */}
      {subTab === "denitration" && (
        <DenitrationMonitoring />
      )}

      {/* SUB-PAGE 3: 外排烟气监测管理 */}
      {subTab === "bypassChart" && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-2 rounded-xl border border-blue-900/30 bg-slate-950 p-4 shadow-xl">
            <div className="flex flex-wrap justify-between items-center border-b border-blue-950/70 pb-3 mb-3.5 gap-2">
              <div className="space-y-0.5">
                <h4 className="font-sans text-xs font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Activity className="h-4.5 w-4.5" /> 烟筒外排连续采样精密分析曲线
                </h4>
                <p className="text-[10px] text-slate-500">
                  当前对比分析排口: <span className="text-slate-300">{selectedStack.name}</span>
                </p>
              </div>

              {/* Parameter selection tools */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-sans text-slate-400">历史指标选析:</span>
                <div className="flex items-center rounded bg-slate-900 p-0.5 border border-slate-800 text-[10px]">
                  <button
                    onClick={() => setParamFilter("pm")}
                    className={`rounded px-2.5 py-0.5 font-sans font-bold ${
                      paramFilter === "pm" ? "bg-cyan-900 text-cyan-300" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    粉尘颗粒
                  </button>
                  <button
                    onClick={() => setParamFilter("so2")}
                    className={`rounded px-2.5 py-0.5 font-sans font-bold ${
                      paramFilter === "so2" ? "bg-amber-900 text-amber-300" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    SO2二氧化硫
                  </button>
                  <button
                    onClick={() => setParamFilter("nox")}
                    className={`rounded px-2.5 py-0.5 font-sans font-bold ${
                      paramFilter === "nox" ? "bg-fuchsia-900 text-fuchsia-300" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    NOx氮氧化物
                  </button>
                </div>
              </div>
            </div>

            {/* Filtering options & export */}
            <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900/40 px-3 py-2 rounded-lg mb-3.5 border border-slate-900 text-xs text-slate-350">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-500" />
                <span>检索时段:</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-[11px] px-2 py-0.5 rounded text-slate-100 outline-none font-mono"
                />
                <ArrowRight className="h-3.5 w-3.5 text-slate-600" />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-[11px] px-2 py-0.5 rounded text-slate-100 outline-none font-mono"
                />
              </div>

              <button
                onClick={() => handleExport(selectedStack.name)}
                className="flex items-center gap-1.5 border border-cyan-800 bg-cyan-950/60 px-3 py-1 rounded text-[11px] text-cyan-400 hover:bg-cyan-900/60 transition-colors font-semibold cursor-pointer"
              >
                <FileSpreadsheet className="h-3.5 w-3.5" />
                <span>导出符合省监控API对齐的 CSV 签名清单</span>
              </button>
            </div>

            {exportNotice && (
              <div className="mb-2 text-center text-[10px] text-cyan-400 border border-dashed border-cyan-800 py-1 bg-cyan-950/20 rounded animate-pulse">
                {exportNotice}
              </div>
            )}

            <div className="h-[210px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 5, right: 10, left: -30, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(30, 41, 59, 0.3)" />
                  <XAxis dataKey="tick" stroke="#475569" fontSize={9} />
                  <YAxis stroke="#475569" fontSize={9} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#020617", borderColor: "#1e3a8a", borderRadius: "6px" }}
                    labelStyle={{ color: "#94a3b8", fontSize: "11px", fontWeight: "bold" }}
                    itemStyle={{ fontSize: "11px" }}
                  />
                  <Line
                    name={`实测数值 (${paramFilter.toUpperCase()})`}
                    type="monotone"
                    dataKey={paramFilter}
                    stroke={paramFilter === "pm" ? "#22d3ee" : paramFilter === "so2" ? "#f59e0b" : "#d946ef"}
                    strokeWidth={2}
                    dot={true}
                  />
                  <Line
                    name="超低排放控制限"
                    type="step"
                    dataKey="limit"
                    stroke="#ef4444"
                    strokeWidth={1}
                    strokeDasharray="4 4"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Emergency bypass regulation */}
          <div className="rounded-xl border border-blue-900/30 bg-slate-950 p-4 shadow-xl flex flex-col justify-between">
            <div>
              <div className="border-b border-blue-950/70 pb-3 mb-3.5">
                <h3 className="font-sans text-xs font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                  <ShieldCheck className="h-4.5 w-4.5 text-emerald-400" />
                  烟道物理应急旁路隔离铅封监管
                </h3>
                <p className="text-[10px] text-slate-550">严控窑体检修或起跳异常开启，物理隔封在线报警</p>
              </div>

              {/* Stack Selector details */}
              <div className="mb-4 bg-slate-900/40 p-2.5 rounded-lg border border-slate-900 flex justify-between items-center font-sans">
                <div>
                  <span className="text-[10px] text-slate-550 block">当前选定受监排口</span>
                  <span className="text-xs font-semibold text-slate-200">{selectedStack.name}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-550 block text-right">旁道物理设计</span>
                  <span className={`text-[10px] font-bold ${selectedStack.hasBypass ? 'text-amber-500' : 'text-slate-500'}`}>
                    {selectedStack.hasBypass ? '有应急旁路 (Active)' : '直排无旁路 (None)'}
                  </span>
                </div>
              </div>

              {selectedStack.hasBypass ? (
                <div className="space-y-3.5 font-sans">
                  <div className="flex justify-between items-center bg-slate-900/10 p-3 rounded-lg border border-slate-900/60">
                    <span className="text-[11px] text-slate-400">旁路当前物理阀态:</span>
                    <div className="flex items-center gap-1.5">
                      <span className={`h-2 w-2 rounded-full ${
                        selectedStack.bypassStatus === "open"
                          ? "bg-rose-500 animate-ping"
                          : selectedStack.bypassStatus === "closed"
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                      }`} stroke="currentColor"/>
                      <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded border ${
                        selectedStack.bypassStatus === "open"
                          ? "bg-rose-950/40 text-rose-400 border-rose-900/50"
                          : selectedStack.bypassStatus === "closed"
                            ? "bg-amber-950/40 text-amber-500 border-amber-900/50"
                            : "bg-emerald-950/40 text-emerald-400 border-emerald-900/50"
                      }`}>
                        {selectedStack.bypassStatus === "open" ? "开启 (OPEN)" : selectedStack.bypassStatus === "closed" ? "关闭 (CLOSED)" : "现场铅封 (SEALED)"}
                      </span>
                    </div>
                  </div>

                  <div className="text-[10.5px] text-slate-400 space-y-1 bg-slate-900/30 p-2 rounded border border-slate-900/40">
                    <p className="font-semibold text-orange-400">指令授权安全下发：</p>
                    <p className="text-[9.5px] leading-relaxed text-slate-500">根据环保监管法，开启应急旁路必须提报中技检修，否则将涉嫌篡改干扰监控数据。以下按钮将手动向PLC发出物理状态更改信号：</p>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => onTriggerBypass(selectedStack.id, "open")}
                      className={`py-1.5 px-2 rounded font-sans font-bold text-[10.5px] border cursor-pointer text-center transition-all ${
                        selectedStack.bypassStatus === "open"
                          ? "bg-rose-950 text-rose-350 border-rose-600 shadow-[0_0_8px_rgba(239,68,68,0.2)]"
                          : "bg-slate-900 hover:bg-slate-850 text-slate-400 border-slate-850 hover:border-slate-700"
                      }`}
                    >
                      🧪 强制开度
                    </button>
                    <button
                      type="button"
                      onClick={() => onTriggerBypass(selectedStack.id, "closed")}
                      className={`py-1.5 px-2 rounded font-sans font-bold text-[10.5px] border cursor-pointer text-center transition-all ${
                        selectedStack.bypassStatus === "closed"
                          ? "bg-amber-950 text-amber-500 border-amber-600 shadow-[0_0_8px_rgba(245,158,11,0.2)]"
                          : "bg-slate-900 hover:bg-slate-850 text-slate-400 border-slate-850 hover:border-slate-700"
                      }`}
                    >
                      🔒 正常关闭
                    </button>
                    <button
                      type="button"
                      onClick={() => onTriggerBypass(selectedStack.id, "sealed")}
                      className={`py-1.5 px-2 rounded font-sans font-bold text-[10.5px] border cursor-pointer text-center transition-all ${
                        selectedStack.bypassStatus === "sealed"
                          ? "bg-emerald-950 text-emerald-350 border-emerald-600 shadow-[0_0_8px_rgba(16,185,129,0.2)]"
                          : "bg-slate-900 hover:bg-slate-850 text-slate-400 border-slate-850 hover:border-slate-700"
                      }`}
                    >
                      🛡️ 铅封静默
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-dashed border-slate-900/60 text-center space-y-2 bg-slate-900/10">
                  <span className="text-2xl block">✔</span>
                  <p className="text-[11px] font-sans text-emerald-500 font-bold">高标准直排零旁路设计</p>
                  <p className="text-[9.5px] leading-relaxed text-slate-500 font-mono">
                    该外排口未配置应急多路旁排总，所有烟气全量经主管道进行深度化学还原 and 滤袋收尘。
                  </p>
                </div>
              )}
            </div>
            
            <div className="mt-4 border-t border-slate-900/40 pt-3 flex justify-between items-center text-[9px] font-mono text-slate-500">
              <span>防舞弊校验锁: ACTIVE</span>
              <span>环保链条认证 ✔</span>
            </div>
          </div>
        </div>
      )}

      {/* SUB-PAGE 4: 分布式控制系统DCS接入 */}
      {subTab === "dcs" && (() => {
        const partitionsArray = Object.values(dcsPartitions) as any[];
        const selectedPartition = (dcsPartitions as any)[activeDcsSection];

        return (
          <div className="space-y-4">
            {/* Top architecture monitor banner */}
            <div className="bg-slate-950 border border-slate-900 rounded-xl p-3 shadow-md flex flex-wrap justify-between items-center gap-3">
              <div className="flex items-center gap-2.5">
                <Cpu className="h-5 w-5 text-orange-400 animate-pulse" />
                <div>
                  <span className="text-[12px] text-orange-400 block font-bold font-sans">
                    华新中控西门子 PCS7 分布式中继网接入柜 (DCS Live-Bridge)
                  </span>
                  <p className="text-[10px] text-slate-500">
                    实时接入窑头、分解炉、窑尾排口、布袋脉冲除尘、脱硫脱硝治理单元等 DDC/PLC 节点关键控制参数
                  </p>
                </div>
              </div>

              <div className="flex gap-4 text-xs font-mono">
                <div className="bg-slate-900/40 p-1.5 rounded border border-slate-900">
                  <span className="text-slate-500 text-[8px] block uppercase">总线协议</span>
                  <span className="text-slate-200 font-bold">OPC UA / Modbus</span>
                </div>
                <div className="bg-slate-900/40 p-1.5 rounded border border-slate-900">
                  <span className="text-slate-500 text-[8px] block uppercase">参数丢失率</span>
                  <span className="text-emerald-400 font-bold">0.00 %</span>
                </div>
                <div className="bg-slate-900/40 p-1.5 rounded border border-slate-900">
                  <span className="text-slate-500 text-[8px] block uppercase">中继延迟</span>
                  <span className="text-slate-200 font-bold">4 ms (极速)</span>
                </div>
              </div>
            </div>

            {/* DCS Interactive Plant Node Map / Flow Schematic */}
            <div className="bg-slate-950 border border-slate-900 rounded-xl p-4 shadow-xl">
              <div className="flex items-center justify-between mb-3 border-b border-slate-900/80 pb-2 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4.5 w-4.5 text-cyan-400" />
                  <span className="text-[11.5px] font-bold text-slate-300 uppercase tracking-wider font-sans">
                    华新禄劝超低熟料水泥生产线 · 物理 DCS 空间测点拓扑图 (Interactive Physical Map)
                  </span>
                </div>
                <span className="text-[9px] font-mono text-slate-500">
                  ⚡ 动态数字孪生点点阵 · 鼠标悬停显示实时参数 · 点击快速切换工艺视图
                </span>
              </div>

              {/* Graphical Plant Flowchart and Node Map */}
              <div className="relative w-full h-[230px] md:h-[260px] bg-slate-950 rounded-lg overflow-hidden border border-slate-900/40">
                {/* SVG pipeline & blueprint connections */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="pipe-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#f97316" stopOpacity="0.4" />
                      <stop offset="30%" stopColor="#ec4899" stopOpacity="0.4" />
                      <stop offset="60%" stopColor="#10b981" stopOpacity="0.4" />
                      <stop offset="80%" stopColor="#06b6d4" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity="0.4" />
                    </linearGradient>
                  </defs>

                  {/* Flow pipeline connections */}
                  {/* Kiln Core -> Denit -> Kiln Tail -> Dust -> Desof */}
                  <path
                    d="M 120, 140 Q 200, 70 280, 90 T 440, 120 T 600, 160 T 780, 110"
                    fill="none"
                    stroke="url(#pipe-gradient)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    className="opacity-70"
                  />
                  <path
                    d="M 120, 140 Q 200, 70 280, 90 T 440, 120 T 600, 160 T 780, 110"
                    fill="none"
                    stroke="#fb923c"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeDasharray="8, 6"
                    className="opacity-80"
                    style={{
                      animation: "dcs-flow 18s linear infinite"
                    }}
                  />

                  {/* Reference industrial ground grid elements */}
                  <line x1="0" y1="180" x2="1200" y2="180" stroke="#1e293b" strokeDasharray="3, 3" strokeWidth="1" className="opacity-40" />
                  
                  {/* Factory buildings decorative layout blueprint */}
                  {/* Cement Kiln */}
                  <rect x="70" y="110" width="100" height="60" rx="3" stroke="#334155" strokeWidth="1" fill="#020617" fillOpacity="0.3" strokeDasharray="2, 2" />
                  <text x="120" y="150" fill="#475569" fontSize="8" textAnchor="middle" fontFamily="monospace" className="select-none">
                    ROTARY KILN #2
                  </text>

                  {/* SNCR Zone */}
                  <circle cx="280" cy="90" r="30" stroke="#334155" strokeWidth="1" fill="#020617" fillOpacity="0.3" strokeDasharray="2, 2" />
                  <text x="280" y="93" fill="#475569" fontSize="8" textAnchor="middle" fontFamily="monospace" className="select-none">
                    SNCR RECT
                  </text>

                  {/* Dust collector building */}
                  <rect x="550" y="120" width="80" height="60" rx="3" stroke="#334155" strokeWidth="1" fill="#020617" fillOpacity="0.3" strokeDasharray="2, 2" />
                  <text x="590" y="155" fill="#475569" fontSize="8" textAnchor="middle" fontFamily="monospace" className="select-none">
                    BAGHOUSE
                  </text>

                  {/* Absorption Tower */}
                  <rect x="720" y="70" width="60" height="110" rx="4" stroke="#334155" strokeWidth="1" fill="#020617" fillOpacity="0.3" strokeDasharray="2, 2" />
                  <text x="750" y="125" fill="#475569" fontSize="8" textAnchor="middle" fontFamily="monospace" className="select-none">
                    ABSORB TWR
                  </text>
                </svg>

                <style dangerouslySetInnerHTML={{__html: `
                  @keyframes dcs-flow {
                    from { stroke-dashoffset: 200; }
                    to { stroke-dashoffset: 0; }
                  }
                `}} />

                {/* Markers Overlay */}
                {partitionsArray.map((p) => {
                  const isSelected = activeDcsSection === p.id;
                  
                  // Setup position mappings (%)
                  const posMap: Record<string, { top: string; left: string; color: string; label: string }> = {
                    kiln: { top: "54%", left: "15%", color: "amber", label: "回转窑生料煅烧" },
                    denit: { top: "35%", left: "35%", color: "rose", label: "SNCR脱硝喷淋" },
                    kilnTail: { top: "42%", left: "55%", color: "emerald", label: "窑尾排口监测点" },
                    dustRemove: { top: "62%", left: "72%", color: "cyan", label: "高压脉冲除尘" },
                    desof: { top: "32%", left: "88%", color: "indigo", label: "吸收塔脱硫固膏" }
                  };
                  
                  const pos = posMap[p.id] || { top: "50%", left: "50%", color: "slate", label: "未知节点" };
                  
                  // Status-based formatting
                  const isRunning = p.status === "running";
                  const isStopped = p.status === "stopped";
                  const pulseColor = isRunning 
                    ? "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.8)]" 
                    : isStopped 
                      ? "bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.6)]" 
                      : "bg-rose-500 animate-pulse shadow-[0_0_12px_rgba(244,63,94,0.9)]";

                  return (
                    <div
                      key={p.id}
                      onClick={() => setActiveDcsSection(p.id)}
                      className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-10 select-none pb-2"
                      style={{ top: pos.top, left: pos.left }}
                    >
                      {/* Node highlight halo */}
                      <div className={`p-2 rounded-full border transition-all duration-300 relative flex items-center justify-center ${
                        isSelected 
                          ? "bg-slate-900 border-orange-500 scale-110 shadow-[0_0_16px_rgba(249,115,22,0.45)]" 
                          : "bg-slate-950 border-slate-800 hover:border-slate-500 group-hover:scale-105"
                      }`}>
                        {/* Little status pulsing dot inside */}
                        <span className={`absolute -top-1 -right-1 h-4 w-4 rounded-full flex items-center justify-center border border-slate-950 text-[6.5px] font-bold text-white font-mono ${pulseColor}`}>
                          <span className={`${isRunning ? "animate-ping" : ""} absolute inline-flex h-full w-full rounded-full bg-inherit opacity-75`} />
                          <span className="relative text-[7.5px]">
                            {isRunning ? "✔" : isStopped ? "Ⅱ" : "!"}
                          </span>
                        </span>

                        {/* Industrial icon indicator */}
                        {p.id === "kiln" && <Flame className={`h-4.5 w-4.5 ${isSelected ? "text-orange-400" : "text-amber-500"}`} />}
                        {p.id === "denit" && <Activity className={`h-4.5 w-4.5 ${isSelected ? "text-orange-400" : "text-fuchsia-400"}`} />}
                        {p.id === "kilnTail" && <Gauge className={`h-4.5 w-4.5 ${isSelected ? "text-orange-400" : "text-emerald-400"}`} />}
                        {p.id === "dustRemove" && <Wrench className={`h-4.5 w-4.5 ${isSelected ? "text-orange-400" : "text-cyan-400"}`} />}
                        {p.id === "desof" && <Layers className={`h-4.5 w-4.5 ${isSelected ? "text-orange-400" : "text-indigo-400"}`} />}
                      </div>

                      {/* Tooltip text details on-hover */}
                      <div className={`absolute left-1/2 -translate-x-1/2 top-10 bg-slate-950/95 text-slate-100 border p-2 rounded-lg text-left shadow-2xl transition-all duration-200 pointer-events-none w-44 ${
                        isSelected 
                          ? "opacity-100 translate-y-0 scale-100 border-orange-500/50" 
                          : "opacity-0 -translate-y-1 scale-95 group-hover:opacity-100 border-slate-800 group-hover:translate-y-0 group-hover:pointer-events-auto"
                      }`}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-sans font-bold text-[10.5px] text-slate-200">{p.name}</span>
                          <span className={`text-[8px] font-mono font-bold px-1 rounded ${
                            isRunning ? "bg-emerald-950 text-emerald-400" : isStopped ? "bg-amber-950 text-amber-500" : "bg-rose-950 text-rose-400 animate-pulse"
                          }`}>
                            {isRunning ? "运行" : isStopped ? "停止" : "故障"}
                          </span>
                        </div>
                        <p className="text-[8.5px] text-slate-400 line-clamp-1 mb-1.5">{p.desc}</p>
                        
                        {/* Show 2 real-time monitoring stats */}
                        <div className="space-y-0.5 border-t border-slate-900 pt-1 text-[8px] font-mono text-slate-400">
                          <div className="flex justify-between">
                            <span>{p.parameters[0]?.name}:</span>
                            <span className="text-yellow-400 font-bold">{p.parameters[0]?.value} {p.parameters[0]?.unit}</span>
                          </div>
                          {p.parameters[1] && (
                            <div className="flex justify-between">
                              <span>{p.parameters[1]?.name}:</span>
                              <span className="text-slate-300 font-bold">{p.parameters[1]?.value} {p.parameters[1]?.unit}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Stationary plant map status stats indicator pill */}
                <div className="absolute right-3 bottom-3 bg-slate-950/90 border border-slate-900 rounded-lg p-2 space-y-1 text-[9px] font-mono opacity-90 backdrop-blur pointer-events-none select-none">
                  <div className="text-cyan-400 font-bold text-[9.5px] border-b border-slate-900 pb-1 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    中控物理流架总线状态
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span>运行工序: <b className="text-emerald-400">{partitionsArray.filter(pa => pa.status === "running").length}</b> 组</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                    <span>物理停止: <b className="text-amber-400">{partitionsArray.filter(pa => pa.status === "stopped").length}</b> 组</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
                    <span>故障警报: <b className="text-rose-400">{partitionsArray.filter(pa => pa.status === "fault").length}</b> 组</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 1. PROCESS AREA PARTITIONS (不同工序进行区域划分) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block font-sans">
                  ① DCS 中控工艺分段监视屏 (点击不同工序卡片，跳转查看对应数据表格)
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  * 可点击各卡片内的运行状态标牌，手动模拟启停/故障切换
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                {partitionsArray.map((partition) => {
                  const isSelected = activeDcsSection === partition.id;
                  const stat = partition.status;
                  const isRunning = stat === "running";
                  const isStopped = stat === "stopped";
                  const isFault = stat === "fault";

                  // Choose status label / color
                  const statLabel = isRunning ? "运行中 Running" : isStopped ? "已停止 Stopped" : "故障 Fault";
                  const statColor = isRunning 
                    ? "bg-emerald-950/50 text-emerald-400 border-emerald-900/60" 
                    : isStopped 
                      ? "bg-slate-900 text-slate-400 border-slate-800" 
                      : "bg-rose-950/50 text-rose-400 border-rose-900/60 animate-pulse";
                  
                  const statDot = isRunning 
                    ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]" 
                    : isStopped 
                      ? "bg-slate-500" 
                      : "bg-rose-500 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.7)]";

                  // Render icon based on partition id
                  let partIcon = <Flame className="h-4.5 w-4.5 text-amber-500" />;
                  if (partition.id === "kilnTail") partIcon = <Gauge className="h-4.5 w-4.5 text-emerald-500" />;
                  if (partition.id === "dustRemove") partIcon = <Wrench className="h-4.5 w-4.5 text-cyan-400" />;
                  if (partition.id === "desof") partIcon = <Layers className="h-4.5 w-4.5 text-indigo-400" />;
                  if (partition.id === "denit") partIcon = <Activity className="h-4.5 w-4.5 text-fuchsia-400" />;

                  return (
                    <div
                      key={partition.id}
                      onClick={() => setActiveDcsSection(partition.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all text-left flex flex-col justify-between ${
                        isSelected
                          ? "bg-slate-950 border-orange-500/80 shadow-[0_0_12px_rgba(249,115,22,0.12)] ring-1 ring-orange-500/20"
                          : "bg-slate-900/30 border-slate-900 hover:border-slate-800 hover:bg-slate-900/55"
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <div className="p-1 rounded-lg bg-slate-900/50 border border-slate-800">
                            {partIcon}
                          </div>
                          {/* Clickable Status Switcher */}
                          <button
                            type="button"
                            onClick={(e) => toggleDcsStatus(partition.id, e)}
                            className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold flex items-center gap-1 border transition-colors hover:bg-slate-800 ${statColor}`}
                            title="点击手动变换工艺运行状态"
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${statDot}`} />
                            <span>{statLabel.split(" ")[0]}</span>
                          </button>
                        </div>

                        <h5 className="text-[11.5px] font-semibold text-slate-200 font-sans tracking-wide">
                          {partition.name}
                        </h5>
                        <p className="text-[9.5px] text-slate-500 mt-1 line-clamp-1">
                          {partition.desc}
                        </p>
                      </div>

                      {/* Miniature values snippet */}
                      <div className="mt-3.5 space-y-1 border-t border-slate-900/40 pt-2 text-[9px] font-mono text-slate-400">
                        <div className="flex justify-between">
                          <span className="truncate max-w-[65px]">{partition.parameters[0].name}</span>
                          <span className="text-slate-300 font-bold">
                            {partition.parameters[0].value} <span className="text-[7.5px] text-slate-500">{partition.parameters[0].unit}</span>
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="truncate max-w-[65px]">{partition.parameters[1].name}</span>
                          <span className="text-slate-300 font-bold">
                            {partition.parameters[1].value} <span className="text-[7.5px] text-slate-500">{partition.parameters[1].unit}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. LOWER SECTION: DETAILED TABLES AND TERMINAL */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Left detailed view table (2/3 width) */}
              <div className="lg:col-span-2 rounded-xl border border-blue-900/25 bg-slate-950 p-4 shadow-xl flex flex-col justify-between min-h-[380px]">
                <div>
                  {/* Table Metadata Header */}
                  <div className="border-b border-blue-950 pb-3 mb-3 flex flex-wrap justify-between items-center gap-2">
                    <div>
                      <h4 className="font-sans text-xs font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                        <Settings className="h-4 w-4 text-orange-450 animate-spin" style={{ animationDuration: "12s" }} />
                        {selectedPartition.name} · 中控物理参数测点清单 (DCS Jump-Table)
                      </h4>
                      <span className="text-[9.5px] text-slate-500 block">
                        {selectedPartition.desc} · 包含对应DCS测定的所有连续关键数值
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[9.5px] font-mono text-slate-500">工序状态:</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono border ${
                        selectedPartition.status === "running"
                          ? "bg-emerald-950/30 text-emerald-400 border-emerald-900/50"
                          : selectedPartition.status === "stopped"
                            ? "bg-slate-900 text-slate-400 border-slate-800"
                            : "bg-rose-950/30 text-rose-400 border-rose-900/50 animate-pulse"
                      }`}>
                        {selectedPartition.status === "running" ? "运行中 Running" : selectedPartition.status === "stopped" ? "已停止 Stopped" : "故障报错 Fault"}
                      </span>
                    </div>
                  </div>

                  {/* Dynamic parameter change info notice if stopped or faulted */}
                  {selectedPartition.status !== "running" && (
                    <div className={`p-2.5 rounded-lg border text-xs font-sans mb-3 flex gap-2 items-center ${
                      selectedPartition.status === "stopped"
                        ? "bg-slate-900/65 border-slate-800 text-slate-400 font-medium"
                        : "bg-rose-950/20 border-rose-900/40 text-rose-400 animate-pulse"
                    }`}>
                      ⚠️
                      <span>
                        提示：当前工艺工序处于【{selectedPartition.status === "stopped" ? "停止" : "故障"}】状态下，中控PLC测点停止主回路写入。您仍可点按参数的【参数调校】按钮进行应急仿真授权改写。
                      </span>
                    </div>
                  )}

                  {/* Detailed table of production parameters */}
                  <div className="overflow-x-auto rounded-lg border border-slate-900">
                    <table className="w-full text-left font-mono text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-900/40 border-b border-slate-900 text-slate-400 text-[10.5px] font-sans">
                          <th className="py-2 px-3">参数中文名称</th>
                          <th className="py-2 px-3">DCS 测点编号</th>
                          <th className="py-2 px-3 text-right">中控物理采集值 / 安全调整</th>
                          <th className="py-2 px-3 text-center">设计安全限</th>
                          <th className="py-2 px-3 text-center">状态评定</th>
                          <th className="py-2 px-3 font-sans">测位备注</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-900/60 text-slate-300">
                        {selectedPartition.parameters.map((param: any) => {
                          const isUnder = param.value < param.min;
                          const isOver = param.value > param.max;
                          const isOutOfRange = isUnder || isOver;

                          return (
                            <tr 
                              key={param.id} 
                              className={`hover:bg-slate-900/30 transition-colors ${
                                isOutOfRange ? "bg-rose-950/10 text-rose-200" : ""
                              }`}
                            >
                              <td className="py-2.5 px-3 font-sans font-semibold text-slate-200">
                                {param.name}
                              </td>
                              <td className="py-2.5 px-3 text-slate-500 font-mono text-[10.5px]">
                                {param.code.split(" ")[0]}
                              </td>
                              <td className="py-2.5 px-3">
                                <div className="flex items-center justify-end gap-2.5">
                                  <span className={`font-bold font-mono text-right ${
                                    isOutOfRange ? "text-rose-400 animate-pulse font-black" : "text-yellow-400"
                                  }`}>
                                    {param.value}
                                  </span>
                                  <span className="text-[10px] text-slate-500 font-normal w-6 text-left">
                                    {param.unit}
                                  </span>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setTuningParam({ sectionId: activeDcsSection, param });
                                      setTuningValueInput(String(param.value));
                                      setConfirmCheckbox(false);
                                      setTuningError(null);
                                    }}
                                    className="px-2 py-0.5 rounded bg-orange-950/60 hover:bg-orange-900/80 border border-orange-900/50 hover:border-orange-500 text-orange-400 hover:text-white transition-all text-[9.5px] font-sans font-bold cursor-pointer flex items-center gap-1 select-none shrink-0 shadow-sm"
                                    title="执行中控物理点对点调校参数写入"
                                  >
                                    <Sliders className="h-2.5 w-2.5" />
                                    <span>独立调校</span>
                                  </button>
                                </div>
                              </td>
                              <td className="py-2.5 px-3 text-center text-slate-400 text-[10.5px]">
                                {param.min} ~ {param.max}
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9.5px] font-sans font-bold border ${
                                  isOutOfRange
                                    ? "bg-rose-950 text-rose-400 border-rose-900"
                                    : "bg-emerald-950 text-emerald-400 border-emerald-900"
                                }`}>
                                  {isOutOfRange ? "⚠️ 越界/偏差" : "✔ 正常合规"}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-[10.5px] text-slate-450 font-sans truncate max-w-[120px]" title={param.remark}>
                                {param.remark}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="text-[10px] font-mono text-slate-500 bg-slate-900/20 p-2.5 border border-slate-950 rounded flex gap-2 items-center mt-3">
                  <Info className="h-4 w-4 text-cyan-500" />
                  <span>所有变送自 DDC 的数据完全映射物理 PLC 采集，且保持极低差温差压拟真变频，满足华新禄劝超低排放长效审计。</span>
                </div>
              </div>

              {/* Right telemetry diagnosis console terminal sidebar */}
              <div className="rounded-xl border border-blue-900/25 bg-slate-950 p-4 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="border-b border-blue-950 pb-3 mb-3">
                    <h4 className="font-sans text-xs font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                      <Terminal className="h-4.5 w-4.5 text-orange-500 animate-pulse" />
                      中控物理采样环通信自诊断
                    </h4>
                    <p className="text-[10px] text-slate-500">验证OPC数据总线 and PLC中继通信回路一致性</p>
                  </div>

                  {isDcsDiagnosing ? (
                    <div className="space-y-1.5 py-3.5">
                      <div className="flex justify-between text-[11px] font-bold font-mono text-orange-450">
                        <span>全工艺节点寄存器扫掠中...</span>
                        <span>{dcsDiagnoseProgress}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-900 rounded overflow-hidden">
                        <div className="h-full bg-orange-500 transition-all duration-300" style={{ width: `${dcsDiagnoseProgress}%` }} />
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={triggerDcsDiagnostics}
                      className="w-full rounded bg-orange-950 hover:bg-orange-900 text-orange-300 border border-orange-850 text-xs py-2.5 transition-all font-semibold cursor-pointer shadow-md"
                    >
                      启动PLC数据中继冗余物理通道自诊断
                    </button>
                  )}

                  <div className="mt-4 bg-black/95 rounded-lg border border-slate-900 p-3 max-h-[220px] overflow-y-auto font-mono text-[9px] text-emerald-400 leading-normal space-y-1 shadow-inner">
                    {dcsLogs.map((log, idx) => (
                      <p key={idx} className="border-b border-slate-900/10 pb-0.5 last:border-b-0">{log}</p>
                    ))}
                  </div>
                </div>

                <div className="text-[10.5px] text-slate-550 font-mono text-right p-1.5 bg-slate-900/20 border border-slate-950 rounded mt-3">
                  CRC-16 Modbus Sync: 100.0% · 自动冗余
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* SUB-PAGE 5: 烟气连续在线监测系统CEMS接入 */}
      {subTab === "cems" && (
        <div className="space-y-4 font-sans text-slate-100">
          {/* Top Panel: Title & Regulatory Policy Reference Selector */}
          <div className="bg-slate-950 border border-slate-900 rounded-xl p-4 shadow-md flex justify-between items-center flex-wrap gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Radio className="h-5 w-5 text-emerald-400 animate-pulse" />
                <h3 className="text-sm font-bold text-slate-200 tracking-wide uppercase">
                  有组织烟气排放连续监测 CEMS 智能接入模块
                </h3>
              </div>
              <p className="text-[10.5px] text-slate-450 leading-normal max-w-2xl">
                对生产过程中的各重点设备排气筒产生的粉尘、SO₂、NOx 等污染物进行实时监控。结合国家《GB 4915-2013 水泥工业大气污染物排放标准》与地方超低排放改造规范进行对比分析和合规筛查。
              </p>
            </div>
            
            {/* Standard Policy standard selection toggler */}
            <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-lg border border-slate-800">
              <span className="text-[10.5px] font-semibold text-slate-400 px-1">参考政策标准:</span>
              <button
                type="button"
                onClick={() => setSelectedStandardType("ultra_low")}
                className={`px-2.5 py-1 text-[10px] rounded transition-all font-bold cursor-pointer ${
                  selectedStandardType === "ultra_low"
                    ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                    : "text-slate-500 hover:text-slate-355 border border-transparent"
                }`}
                title="颗粒物 10, SO2 35, NOx 50 mg/m³ 超严格示范标准"
              >
                🍃 超低排放改造限值
              </button>
              <button
                type="button"
                onClick={() => setSelectedStandardType("gb_key")}
                className={`px-2.5 py-1 text-[10px] rounded transition-all font-bold cursor-pointer ${
                  selectedStandardType === "gb_key"
                    ? "bg-cyan-950 text-cyan-400 border border-cyan-800"
                    : "text-slate-500 hover:text-slate-355 border border-transparent"
                }`}
                title="颗粒物 20, SO2 100, NOx 320 mg/m³ 重点控制区"
              >
                🏛️ GB4915 重点区标
              </button>
              <button
                type="button"
                onClick={() => setSelectedStandardType("gb_normal")}
                className={`px-2.5 py-1 text-[10px] rounded transition-all font-bold cursor-pointer ${
                  selectedStandardType === "gb_normal"
                    ? "bg-blue-950 text-blue-400 border border-blue-800"
                    : "text-slate-500 hover:text-slate-355 border border-transparent"
                }`}
                title="颗粒物 30, SO2 200, NOx 400 mg/m³ 一般环境常规限值"
              >
                🏭 GB4915 一般常规
              </button>
            </div>
          </div>

          {/* Interactive Equipment Nodes Grid Selection */}
          <div className="space-y-1.5">
            <span className="text-[11px] text-slate-450 block font-semibold">
              🎯 生产工序节点切换监测 (点击可选定目标排口分析):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {allStacks.slice(0, 5).map((stack) => {
                const isActive = stack.id === selectedStackId;
                const isRunning = stack.status === "running";
                
                // Mini indicator summary color for brief showing
                const hasExceeded = (stack.pm > limits.pm) || (stack.so2 > limits.so2) || (stack.nox > limits.nox);

                return (
                  <button
                    key={stack.id}
                    onClick={() => {
                      setSelectedStackId(stack.id);
                      setSelfInspectReport(null); // Reset report when context shifts
                    }}
                    className={`p-3 rounded-xl text-left transition-all border cursor-pointer hover:scale-[1.01] flex flex-col justify-between h-[105px] overflow-hidden ${
                      isActive
                        ? "bg-slate-900 border-emerald-500/60 shadow-[0_4px_12px_rgba(16,185,129,0.15)] text-white"
                        : "bg-slate-950/80 border-slate-900 text-slate-400 hover:border-slate-800"
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start gap-1">
                        <span className="text-[9px] font-mono text-slate-500 block uppercase truncate max-w-[85px]">
                          {stack.process}
                        </span>
                        <span className={`h-1.5 w-1.5 rounded-full ${isRunning ? "bg-emerald-400 animate-ping" : "bg-red-400"}`} />
                      </div>
                      <h4 className="text-xs font-bold mt-1 line-clamp-2 text-slate-200">
                        {stack.name}
                      </h4>
                    </div>

                    <div className="mt-2 flex justify-between items-end border-t border-slate-900/50 pt-1.5">
                      <div className="flex gap-2 text-[9px] font-mono">
                        <div>
                          <span className="text-slate-500">PM: </span>
                          <span className={stack.pm > limits.pm ? "text-red-400 font-bold" : "text-cyan-400 font-semibold"}>
                            {stack.pm}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500">NOx: </span>
                          <span className={stack.nox > limits.nox ? "text-red-400 font-bold" : "text-fuchsia-400 font-semibold"}>
                            {stack.nox}
                          </span>
                        </div>
                      </div>
                      <span className={`text-[8.5px] font-bold px-1 py-0.5 rounded ${
                        hasExceeded
                          ? "bg-red-950/30 text-red-400 border border-red-900/50"
                          : "bg-emerald-950/30 text-emerald-400 border border-emerald-900/50"
                      }`}>
                        {hasExceeded ? "⚠️ 超标" : "✔ 合规"}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Left Col: Core Gas Chamber Progress Meters vs Standards Comparison */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-slate-950 border border-slate-900 rounded-xl p-4 shadow-md space-y-3">
                <div className="flex justify-between items-center border-b border-slate-900 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4.5 w-4.5 text-cyan-400" />
                    <span className="text-xs font-bold text-slate-200">
                      【{selectedStack.name}】废气浓度实测 vs 标准指标比对 analyses
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    基准折算含氧量: {selectedStack.oxygen || 11.2}%
                  </span>
                </div>

                <div className="text-[11px] text-slate-400 bg-slate-900/30 p-2 rounded-lg border border-slate-900/50 leading-relaxed">
                  <span className="font-bold text-amber-500">📌 现行标准：</span>
                  {selectedStandardType === "ultra_low" ? (
                    <span>依国家最新超低排放政策，水泥工业核心排口需满足颗粒物 ≤ 10, SO₂ ≤ 35, 氮氧化物 ≤ 50 mg/m³ 的最高阶合规门槛（煤磨及水泥磨颗粒物执行 ≤ 10 mg/m³）。</span>
                  ) : selectedStandardType === "gb_key" ? (
                    <span>参考国家重点区标准，控制区排口粉尘限值 20, 二氧化硫限值 100, 氮氧化物标准限值 320 mg/m³ 实施监控。</span>
                  ) : (
                    <span>参考《GB 4915-2013》国家一般常规区标准，工艺排口粉尘限值 30, 二氧化硫限值 200, 氮氧化物限值 400 mg/m³ 实施限额。</span>
                  )}
                </div>

                {/* Grid layout for major pollutant items comparison */}
                <div className="space-y-3 mt-4">
                  {/* Particulate Matter PM */}
                  {(() => {
                    const value = selectedStack.pm;
                    const limit = limits.pm;
                    const isExceeded = value > limit;
                    const pct = Math.min((value / limit) * 105, 100);
                    return (
                      <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-900/60 transition-all hover:bg-slate-900/60">
                        <div className="flex justify-between items-center mb-1">
                          <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-cyan-400" />
                            <span className="text-xs font-bold text-slate-300">粉尘颗粒物 (Particulate Matter PM)</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs font-mono">
                            <span className="text-slate-500">实测:</span>
                            <span className={`text-sm font-bold ${isExceeded ? "text-red-400 animate-pulse" : "text-cyan-400"}`}>
                              {value.toFixed(1)} mg/m³
                            </span>
                            <span className="text-slate-600">|</span>
                            <span className="text-slate-500">限值:</span>
                            <span className="text-slate-300 font-semibold">{limit} mg/m³</span>
                          </div>
                        </div>
                        <div className="h-2 bg-slate-950 rounded-full overflow-hidden relative">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${isExceeded ? "bg-red-500" : "bg-cyan-500"}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[9px] text-slate-500 font-mono mt-1">
                          <span>0% 零点</span>
                          <span className="text-slate-400">占位比: {pct.toFixed(0)}%</span>
                          <span>合规限 100%</span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Sulfur Dioxide SO2 */}
                  {(() => {
                    const value = selectedStack.so2;
                    const limit = limits.so2;
                    const isExceeded = value > limit;
                    const pct = Math.min((value / limit) * 105, 100);
                    return (
                      <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-900/60 transition-all hover:bg-slate-900/60">
                        <div className="flex justify-between items-center mb-1">
                          <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-amber-400" />
                            <span className="text-xs font-bold text-slate-300">二氧化硫 (Sulfur Dioxide SO₂)</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs font-mono">
                            <span className="text-slate-500">实测:</span>
                            <span className={`text-sm font-bold ${isExceeded ? "text-red-400 animate-pulse" : "text-amber-400"}`}>
                              {value.toFixed(1)} mg/m³
                            </span>
                            <span className="text-slate-600">|</span>
                            <span className="text-slate-500">限值:</span>
                            <span className="text-slate-300 font-semibold">{limit} mg/m³</span>
                          </div>
                        </div>
                        <div className="h-2 bg-slate-950 rounded-full overflow-hidden relative">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${isExceeded ? "bg-red-500" : "bg-amber-500"}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[9px] text-slate-500 font-mono mt-1">
                          <span>0% 净气</span>
                          <span className="text-slate-400">占位比: {pct.toFixed(0)}%</span>
                          <span>合规限 100%</span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Nitrogen Oxide NOx */}
                  {(() => {
                    const value = selectedStack.nox;
                    const limit = limits.nox;
                    const isExceeded = value > limit;
                    const pct = Math.min((value / limit) * 105, 100);
                    return (
                      <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-900/60 transition-all hover:bg-slate-900/60">
                        <div className="flex justify-between items-center mb-1">
                          <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-fuchsia-400" />
                            <span className="text-xs font-bold text-slate-300">氮氧化物 (Nitrogen Oxides NOx)</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs font-mono">
                            <span className="text-slate-500">实测:</span>
                            <span className={`text-sm font-bold ${isExceeded ? "text-red-400 animate-pulse" : "text-fuchsia-450"}`}>
                              {value.toFixed(1)} mg/m³
                            </span>
                            <span className="text-slate-600">|</span>
                            <span className="text-slate-500">限值:</span>
                            <span className="text-slate-300 font-semibold">{limit} mg/m³</span>
                          </div>
                        </div>
                        <div className="h-2 bg-slate-950 rounded-full overflow-hidden relative">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${isExceeded ? "bg-red-500" : "bg-fuchsia-500"}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[9px] text-slate-500 font-mono mt-1">
                          <span>0% 还原后</span>
                          <span className="text-slate-400">占位比: {pct.toFixed(0)}%</span>
                          <span>合规限 100%</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Additional parameters cards (Oxygen, Temp, Flow rate, static pressure) */}
                <div className="grid grid-cols-4 gap-2.5 mt-3 pt-3 border-t border-slate-900/50 text-xs">
                  <div className="bg-slate-900/20 p-2 rounded border border-slate-900 flex flex-col justify-between">
                    <span className="text-[10px] text-slate-500 block">烟道负压</span>
                    <span className="text-xs font-bold text-slate-300 mt-1 font-mono">{selectedStack.pressure} kPa</span>
                  </div>
                  <div className="bg-slate-900/20 p-2 rounded border border-slate-900 flex flex-col justify-between">
                    <span className="text-[10px] text-slate-500 block">烟气流速速比</span>
                    <span className="text-xs font-bold text-slate-300 mt-1 font-mono">{selectedStack.flowRate} m³/h</span>
                  </div>
                  <div className="bg-slate-900/20 p-2 rounded border border-slate-900 flex flex-col justify-between">
                    <span className="text-[10px] text-slate-500 block">物理排烟温度</span>
                    <span className="text-xs font-bold text-slate-300 mt-1 font-mono">{selectedStack.temperature} ℃</span>
                  </div>
                  <div className="bg-slate-900/20 p-2 rounded border border-slate-900 flex flex-col justify-between">
                    <span className="text-[10px] text-slate-500 block">氨水微量逃逸</span>
                    <span className="text-xs font-bold text-slate-300 mt-1 font-mono">{selectedStack.nh3 || 1.8} mg/m³</span>
                  </div>
                </div>
              </div>

              {/* Policy standard control card */}
              <div className="bg-slate-950 border border-slate-900 rounded-xl p-4 shadow-md space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-900 pb-2">
                  <FileText className="h-4 w-4 text-emerald-400" />
                  <span className="text-xs font-bold text-slate-200">
                    有组织大气排放国家政策规范对照参考
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="bg-slate-900/30 p-2.5 rounded border border-slate-900/60 space-y-1">
                    <p className="font-bold text-emerald-400 text-[11px]">【核心窑尾及热源】</p>
                    <p className="text-[10px] text-slate-400">GB4915 标准常规：30/200/400</p>
                    <p className="text-[10px] text-emerald-450 leading-relaxed">超低排放标准：10/35/50 mg/m³</p>
                  </div>
                  <div className="bg-slate-900/30 p-2.5 rounded border border-slate-900/60 space-y-1">
                    <p className="font-bold text-cyan-400 text-[11px]">【窑头（冷却机）】</p>
                    <p className="text-[10px] text-slate-400">无燃料二氧化硫，主要是高密度粉末捕捉</p>
                    <p className="text-[10px] text-cyan-455 leading-relaxed">全天粉尘指标严控 ≤10 mg/m³</p>
                  </div>
                  <div className="bg-slate-900/30 p-2.5 rounded border border-slate-900/60 space-y-1">
                    <p className="font-bold text-fuchsia-400 text-[11px]">【煤磨及水泥磨】</p>
                    <p className="text-[10px] text-slate-400">以脉冲喷吹防爆袋式除尘器作为终端防护</p>
                    <p className="text-[10px] text-fuchsia-455 leading-relaxed">除尘排放标准：10-20 mg/m³</p>
                  </div>
                </div>
                <p className="text-[9.5px] text-slate-500 leading-normal text-right font-mono">
                  来源依据: 《生态环境部关于推进实施水泥行业超低排放的意见 (环大气〔2024〕)》
                </p>
              </div>
            </div>

            {/* Right Col: Instant Compliance Self-Inspection Center & Auto-Calib */}
            <div className="lg:col-span-5 space-y-4">
              {/* Compliance Self-Check execution control */}
              <div className="bg-slate-950 border border-slate-900 rounded-xl p-4 shadow-xl flex flex-col justify-between min-h-[350px]">
                <div className="space-y-3">
                  <div className="border-b border-slate-900 pb-3 flex justify-between items-center">
                    <h4 className="text-xs font-bold text-emerald-400 tracking-wider flex items-center gap-1.5 uppercase font-sans">
                      <ShieldCheck className="h-4.5 w-4.5 text-emerald-400 animate-pulse" />
                      CEMS 排口环保指标自查中心
                    </h4>
                    <span className="text-[10px] bg-slate-900 px-2 py-0.5 text-slate-400 rounded-full font-mono font-bold">
                      实时筛查
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed font-sans">
                    点击下方自查按钮，系统会全量解算当前排口的二次基准氧折算因子，对<strong>颗粒物、二氧化硫、氮氧化物</strong>实测值与当前所选的政策标准做出精细核查并输出自查合格签，作为防干扰与自查备案依据。
                  </p>

                  {selfInspectActive ? (
                    <div className="space-y-2 py-2">
                      <div className="flex justify-between items-center text-[10px] font-mono text-emerald-400">
                        <span className="font-semibold block truncate max-w-[190px]">{selfInspectStepMsg}</span>
                        <span className="font-bold font-mono">{selfInspectProgress}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-900 rounded overflow-hidden">
                        <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${selfInspectProgress}%` }} />
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={triggerComplianceSelfInspection}
                      className="w-full rounded bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-850 py-2.5 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg"
                    >
                      📝 一键生成有组织排放环保合规自查报告
                    </button>
                  )}

                  {/* Generated receipt sheet print */}
                  {selfInspectReport && (
                    <div className="bg-slate-900/80 p-3.5 rounded-lg border border-slate-800 text-xs font-mono space-y-2.5 shadow-inner mt-2">
                      <div className="flex justify-between items-center border-b border-slate-800 pb-1.5">
                        <span className="font-semibold text-slate-200">排口合规校验单</span>
                        <span className={`text-[10px] px-1.5 rounded-full ${
                          selfInspectReport.isOverallPassed ? "bg-emerald-950 text-emerald-450" : "bg-red-950 text-red-400"
                        }`}>
                          {selfInspectReport.isOverallPassed ? "● 合规达标 (PASS)" : "● 指标高警 (EXCEED)"}
                        </span>
                      </div>

                      <div className="space-y-1 text-[11px] text-slate-350">
                        <p><span className="text-slate-500">自查烟口:</span> {selfInspectReport.stackName}</p>
                        <p><span className="text-slate-500">当前工段:</span> {selfInspectReport.process}</p>
                        <p><span className="text-slate-500">政策指标:</span> <span className="text-emerald-450 font-bold">
                          {selfInspectReport.standardType === "ultra_low" ? "超低排放改造指标" : selfInspectReport.standardType === "gb_key" ? "国标重点区标准" : "国标普通常规标准"}
                        </span></p>
                        <p><span className="text-slate-500">自查专员:</span> {selfInspectReport.auditor}</p>
                        <p><span className="text-slate-500">印签时间:</span> {selfInspectReport.time}</p>
                      </div>

                      {/* Items checklist detail inside report */}
                      <div className="border-t border-b border-slate-800/60 py-1.5 text-[10.5px] space-y-1 font-mono">
                        <div className="flex justify-between">
                          <span className="text-slate-400">颗粒物-PM:</span>
                          <span className="text-right">
                            {selfInspectReport.pmVal} / {selfInspectReport.pmLimit} mg/m³{" "}
                            <span className={selfInspectReport.pmPassed ? "text-emerald-400 ml-1" : "text-red-400 ml-1"}>
                              {selfInspectReport.pmPassed ? "✔ 正常" : "❌ 超标"}
                            </span>
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">二氧化硫-SO₂:</span>
                          <span className="text-right">
                            {selfInspectReport.so2Val} / {selfInspectReport.so2Limit} mg/m³{" "}
                            <span className={selfInspectReport.so2Passed ? "text-emerald-400 ml-1" : "text-red-400 ml-1"}>
                              {selfInspectReport.so2Passed ? "✔ 正常" : "❌ 超标"}
                            </span>
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">氮氧化物-NOx:</span>
                          <span className="text-right">
                            {selfInspectReport.noxVal} / {selfInspectReport.noxLimit} mg/m³{" "}
                            <span className={selfInspectReport.noxPassed ? "text-emerald-400 ml-1" : "text-red-400 ml-1"}>
                              {selfInspectReport.noxPassed ? "✔ 正常" : "❌ 超标"}
                            </span>
                          </span>
                        </div>
                      </div>

                      {/* Diagnostic suggestions */}
                      <div className="text-[10px] text-slate-400 p-1.5 bg-slate-950/60 border border-slate-800/85 rounded leading-relaxed">
                        <span className="text-orange-450 font-bold">💡 智能自查建议：</span>
                        {!selfInspectReport.isOverallPassed ? (
                          <span>
                            由于排气筒排放超标，建议立刻：1) 检查SNCR脱硝喷射系统，氨水注入流量是否配合匹配；2) 关注除尘器压差，是否发生袋滤穿孔。
                          </span>
                        ) : selfInspectReport.pmVal > selfInspectReport.pmLimit * 0.8 ? (
                          <span>颗粒物接近安全上限限值门槛，建议提前触发大功率布袋吹灰器以巩固颗粒拦截率。</span>
                        ) : selfInspectReport.noxVal > selfInspectReport.noxLimit * 0.8 ? (
                          <span>NOx进入预警安全深度范围，建议微调增加SNCR氨水喷淋阀门，提升尾气还原中和性能。</span>
                        ) : (
                          <span>当前有组织排放测点完全锁定优质区间，旁路物理在控，折算值表现十分优越。无需手动介入调控。</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-slate-900/30 p-2 border border-slate-900 rounded font-mono text-[9px] text-slate-500 flex justify-between items-center">
                  <span>国标协议号: HJ 75/76-2017</span>
                  <span>认证码: {selectedStack.permitNo.substring(0, 10)}...</span>
                </div>
              </div>

              {/* Day calibration Action Console */}
              <div className="rounded-xl border border-slate-900/80 bg-slate-950 p-4 shadow-xl flex flex-col justify-between min-h-[300px]">
                <div className="space-y-3">
                  <div className="border-b border-slate-900 pb-3 flex justify-between items-center">
                    <h3 className="font-sans text-xs font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Layers className="h-4 w-4 text-emerald-450" />
                      CEMS 腔箱物理自动吹扫及标校
                    </h3>
                    <span className="text-[10px] text-slate-500">每日自校准</span>
                  </div>

                  {activeCalibStep === 0 ? (
                    <div className="space-y-3">
                      <p className="text-xs text-slate-400 leading-relaxed">
                        基于环保局 CEMS 建设运营指南要求，分析腔箱每日需定时调用标定电键校正，确保分析探头透光率、电极零位在控。
                      </p>
                      <button
                        type="button"
                        onClick={triggerCemsCalibration}
                        className="w-full rounded bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-850 py-2.5 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <RotateCw className="h-4 w-4 animate-spin" style={{ animationDuration: "5000ms" }} />
                        启动一键主腔箱氮气标零与量程比对
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4 py-2">
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-[11px] font-mono">
                          <span className="text-slate-400">校正阶段: {activeCalibStep}/4</span>
                          <span className="text-cyan-400 font-bold">{calibProgress}% 指标</span>
                        </div>
                        <div className="h-1.5 bg-slate-900 rounded overflow-hidden font-bold">
                          <div className="h-full bg-cyan-500 transition-all duration-300" style={{ width: `${calibProgress}%` }} />
                        </div>
                      </div>

                      <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-900 font-bold text-xs text-cyan-400 text-center animate-pulse">
                        {activeCalibStep === 1 && "阶段 1/4: 高气压排渣探针反吹扫进行中..."}
                        {activeCalibStep === 2 && "阶段 2/4: 标零高纯氮气电位极校中..."}
                        {activeCalibStep === 3 && "阶段 3/4: 标气量程曲线增益对齐纠错中..."}
                        {activeCalibStep === 4 && "阶段 4/4: 校准大功告成，正在合并传输参数..."}
                      </div>
                    </div>
                  )}
                </div>

                <div className="overflow-x-auto mt-4 pt-3 border-t border-slate-900/40">
                  <span className="text-[10px] text-slate-450 block mb-1 font-bold">📋 最近标零校验电子日志:</span>
                  <table className="w-full text-left text-[10px] border-collapse font-mono font-bold">
                    <thead>
                      <tr className="border-b border-slate-900 text-slate-500">
                        <th className="py-1 px-1">诊断时间</th>
                        <th className="py-1 px-1">设备排口</th>
                        <th className="py-1 px-1 text-right">粉尘偏比</th>
                        <th className="py-1 px-1 text-right">SO₂量偏</th>
                        <th className="py-1 px-1 text-center">结果</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900/50 text-slate-400">
                      {calibLogs.slice(0, 3).map((log) => (
                        <tr key={log.id} className="hover:bg-slate-900/20">
                          <td className="py-1 px-1 text-slate-500">{log.time}</td>
                          <td className="py-1 px-1 font-sans font-semibold text-slate-300 truncate max-w-[80px]">{log.stack}</td>
                          <td className="py-1 px-1 text-right text-cyan-400">{log.pmDrift}</td>
                          <td className="py-1 px-1 text-right text-emerald-400">{log.so2Drift}</td>
                          <td className="py-1 px-1 text-center">
                            <span className="text-emerald-400 font-bold">✔</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {tuningParam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in font-sans">
          <div className="bg-slate-950 border border-orange-500/40 rounded-xl max-w-md w-full shadow-2xl overflow-hidden text-slate-100 flex flex-col">
            {/* Header */}
            <div className="p-4 bg-orange-950/40 border-b border-orange-900/40 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Sliders className="h-5 w-5 text-orange-450 animate-pulse" />
                <h3 className="text-sm font-bold text-orange-450 tracking-wider">
                  DCS 物理通道点对点安全调校
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setTuningParam(null)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">
                  正在改写测点
                </label>
                <p className="text-sm font-bold text-slate-200">
                  {tuningParam.param.name}
                </p>
                <p className="text-[11px] text-slate-400 font-mono">
                  测点寄存器: {tuningParam.param.code}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-slate-900/60 p-3 rounded-lg border border-slate-900 text-xs">
                <div>
                  <span className="text-[10px] text-slate-450 block font-sans">当前物理采集</span>
                  <span className="text-yellow-400 font-bold font-mono text-sm leading-normal">
                    {tuningParam.param.value} {tuningParam.param.unit}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-450 block font-sans">设计安全范围</span>
                  <span className="text-slate-300 font-bold font-mono text-sm leading-normal">
                    {tuningParam.param.min} ~ {tuningParam.param.max} {tuningParam.param.unit}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] text-slate-400 font-medium block">
                  调校物理写入值 ({tuningParam.param.unit})
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="any"
                    value={tuningValueInput}
                    onChange={(e) => {
                      setTuningValueInput(e.target.value);
                      setTuningError(null);
                    }}
                    placeholder={`输入数值（建议 ${tuningParam.param.min} - ${tuningParam.param.max}）`}
                    className="flex-1 rounded bg-slate-900 border border-slate-800 text-white font-mono text-sm px-3 py-2 outline-none focus:border-orange-500/50"
                  />
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setTuningValueInput(String(tuningParam.param.min))}
                      className="px-2 py-1 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded text-[10px] text-slate-350 cursor-pointer font-mono"
                      title="快速设为安全值下限"
                    >
                      下限
                    </button>
                    <button
                      type="button"
                      onClick={() => setTuningValueInput(String(tuningParam.param.max))}
                      className="px-2 py-1 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded text-[10px] text-slate-350 cursor-pointer font-mono"
                      title="快速设为安全值上限"
                    >
                      上限
                    </button>
                  </div>
                </div>
                {tuningError && (
                  <p className="text-rose-400 font-medium text-xs font-sans">
                    ⚠️ {tuningError}
                  </p>
                )}
                {parseFloat(tuningValueInput) > tuningParam.param.max || parseFloat(tuningValueInput) < tuningParam.param.min ? (
                  <p className="text-amber-500 text-[10.5px] leading-relaxed bg-amber-950/20 p-2 rounded border border-amber-900/30 font-sans">
                    ⚠️ 警告：写入值超出安全设计区间。点击确认调校将强制下发 PLC，可能引发物理解算不平衡或超低排放污染核定报警！
                  </p>
                ) : null}
              </div>

              {/* Safety checkbox */}
              <div className="flex items-start gap-2.5 bg-slate-900/30 p-2.5 rounded border border-slate-900">
                <input
                  type="checkbox"
                  id="confirm-chk"
                  checked={confirmCheckbox}
                  onChange={(e) => setConfirmCheckbox(e.target.checked)}
                  className="mt-0.5 rounded border-slate-800 bg-slate-900 text-orange-500 focus:ring-0 cursor-pointer h-3.5 w-3.5"
                />
                <label htmlFor="confirm-chk" className="text-[10.5px] text-slate-400 cursor-pointer leading-tight font-sans select-none">
                  我已确认该测点在当前工控状态下处于检修/工艺调试状态，并且我拥有授权签名去执行点对点寄存器直接改写物理指令包。
                </label>
              </div>
            </div>

            {/* Footer buttons */}
            <div className="bg-slate-950 p-4 border-t border-slate-900 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setTuningParam(null)}
                className="px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-slate-300 text-xs font-semibold border border-slate-850 cursor-pointer transition-colors font-sans"
              >
                取消
              </button>
              <button
                type="button"
                onClick={() => {
                  const val = parseFloat(tuningValueInput);
                  if (isNaN(val)) {
                    setTuningError("请输入有效的数字！");
                    return;
                  }
                  if (!confirmCheckbox) {
                    setTuningError("请先勾选下方的人工安全及授权声明复选框！");
                    return;
                  }
                  updateDcsValueDirectly(tuningParam.sectionId, tuningParam.param.id, val);
                  setTuningParam(null);
                }}
                className="px-4 py-1.5 rounded bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold shadow-md cursor-pointer transition-colors hover:shadow-orange-500/10 font-sans"
              >
                确认调校写入
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
