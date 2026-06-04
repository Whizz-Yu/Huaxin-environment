/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from "react";
import { DustSensor, DeviceStatusLog, AlarmItem, UnorganizedSource } from "../types";
import { motion, AnimatePresence } from "motion/react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import {
  Activity,
  Cpu,
  AlertTriangle,
  Layers,
  ClipboardList,
  Droplets,
  Video,
  Search,
  FileDown,
  RotateCcw,
  Compass,
  Zap,
  Check,
  Plus,
  RefreshCw,
  Eye,
  Camera,
  Trash2,
  AlertOctagon,
  TrendingUp,
  Settings,
  ChevronRight,
  ShieldCheck,
  CheckCircle,
  Clock,
  User,
} from "lucide-react";

interface UnorganizedEmissionsProps {
  dustSensors: DustSensor[];
  deviceLogs: DeviceStatusLog[];
  alarms: AlarmItem[];
  unorganizedSources: UnorganizedSource[];
  onTriggerTreatment: (id: string, active: boolean) => void;
  onMitigateDust: (sensorId: string) => void;
}

export default function UnorganizedEmissions({
  dustSensors,
  deviceLogs,
  alarms,
  unorganizedSources,
  onTriggerTreatment,
  onMitigateDust,
}: UnorganizedEmissionsProps) {
  // ----------------------------------------------------
  // Local States mirroring parents for rich interactivity
  // ----------------------------------------------------
  const [localDustSensors, setLocalDustSensors] = useState<DustSensor[]>(dustSensors);
  const [localDeviceLogs, setLocalDeviceLogs] = useState<DeviceStatusLog[]>(deviceLogs);
  const [localAlarms, setLocalAlarms] = useState<AlarmItem[]>(alarms);
  const [localSources, setLocalSources] = useState<UnorganizedSource[]>(unorganizedSources);

  // Synchronize from props when changed
  useEffect(() => { setLocalDustSensors(dustSensors); }, [dustSensors]);
  useEffect(() => { setLocalDeviceLogs(deviceLogs); }, [deviceLogs]);
  useEffect(() => { setLocalAlarms(alarms); }, [alarms]);
  useEffect(() => { setLocalSources(unorganizedSources); }, [unorganizedSources]);

  // Current sub-tab index
  const [activeSubTab, setActiveSubTab] = useState<
    "device_status_summary" | "alarm_ratio" | "source_inventory" | "monitoring_records" | "treatment_records" | "cctv_records"
  >("device_status_summary");

  // Notifications or toast messages
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Global search filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterArea, setFilterArea] = useState<string>("ALL");

  const distinctAreas = useMemo(() => {
    return Array.from(new Set(localDustSensors.map((s) => s.area)));
  }, [localDustSensors]);

  // Toast helper
  const showToast = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(null), 4000);
  };

  // ----------------------------------------------------
  // Sub-Tab 1: 设备运行状态汇总 (Device Summary & Diagnostics)
  // ----------------------------------------------------
  const [diagProgress, setDiagProgress] = useState(0);
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [deviceFilterType, setDeviceFilterType] = useState<string>("ALL");

  const startBatchDiagnostics = () => {
    if (isDiagnosing) return;
    setIsDiagnosing(true);
    setDiagProgress(10);
    const interval = setInterval(() => {
      setDiagProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsDiagnosing(false);
            // Simulate restoring offline or warning devices to normal state
            setLocalDeviceLogs((current) =>
              current.map((dev) => ({
                ...dev,
                status: dev.status === "offline" || dev.status === "error" ? "normal" : dev.status,
              }))
            );
            showToast("✅ 全厂有组织/无组织监测阀门及视频摄像头Modbus诊断完毕，2处冗余通讯已自愈。");
          }, 600);
          return 100;
        }
        return prev + 15;
      });
    }, 200);
  };

  const handleRestartDevice = (id: string, name: string) => {
    showToast(`🔄 正在向备用微电子网关发送冷重启信标: 【${name}】...`);
    setTimeout(() => {
      setLocalDeviceLogs((current) =>
        current.map((dev) => (dev.id === id ? { ...dev, status: "normal" } : dev))
      );
      showToast(`⚡ 【${name}】复位电路响应成功，网络状态已自恢复 [ONLINE]`);
    }, 1200);
  };

  // ----------------------------------------------------
  // Sub-Tab 2: 报警类型占比 (Incident pie charts & ledger)
  // ----------------------------------------------------
  const alarmGroupData = useMemo(() => {
    const counts = {
      production_fault: 0,
      treatment_fault: 0,
      monitoring_fault: 0,
      overshoot_alarm: 0,
    };
    localAlarms.forEach((a) => {
      if (counts[a.type] !== undefined) counts[a.type]++;
    });
    return [
      { name: "生产工位故障", value: counts.production_fault, color: "#d946ef", type: "production_fault" },
      { name: "降尘设备失效", value: counts.treatment_fault, color: "#f59e0b", type: "treatment_fault" },
      { name: "监测断线报警", value: counts.monitoring_fault, color: "#6366f1", type: "monitoring_fault" },
      { name: "粉尘浓度超标", value: counts.overshoot_alarm, color: "#ef4444", type: "overshoot_alarm" },
    ];
  }, [localAlarms]);

  // Alarm Filters
  const [alarmFilterLevel, setAlarmFilterLevel] = useState<string>("ALL");
  const [alarmFilterStatus, setAlarmFilterStatus] = useState<string>("ALL");

  // Manual Alarm simulation injector
  const [simAlarmType, setSimAlarmType] = useState<"production_fault" | "treatment_fault" | "monitoring_fault" | "overshoot_alarm">("overshoot_alarm");
  const [simAlarmLocation, setSimAlarmLocation] = useState("辅料卸料大棚A区");
  const [simAlarmDesc, setSimAlarmDesc] = useState("粉尘实时浓度连续5分钟超出 150 ug/m³ 警戒线");

  const injectSimulatedAlarm = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `alarm-${Date.now()}`;
    const nowStr = new Date().toISOString().substring(11, 19);
    const newAlarm: AlarmItem = {
      id: newId,
      type: simAlarmType,
      name:
        simAlarmType === "overshoot_alarm" ? "颗粒物浓度极度过剩" :
        simAlarmType === "treatment_fault" ? "喷淋电磁阀卡涩断控" :
        simAlarmType === "monitoring_fault" ? "无线传感器LoRa丢失" : "布袋防爆门错位开闭",
      location: simAlarmLocation,
      startTime: nowStr,
      endTime: null,
      status: "active",
      level: simAlarmType === "overshoot_alarm" ? "critical" : "major",
      description: simAlarmDesc,
    };

    setLocalAlarms((prev) => [newAlarm, ...prev]);
    showToast(`⚠️ 报警注入成功：[${newAlarm.name}] 已派发至中控环保看板。`);
  };

  const resolveAlarmLocally = (id: string, title: string) => {
    setLocalAlarms((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "resolved", endTime: new Date().toISOString().substring(11, 19) } : a))
    );
    showToast(`✔ 警告【${title}】已变更为人工安全确认（已消除并解除联动锁）。`);
  };

  // ----------------------------------------------------
  // Sub-Tab 3: 无组织排放源清单 (Fugitive Sources inventory Master-Detail)
  // ----------------------------------------------------
  const [selectedSource, setSelectedSource] = useState<UnorganizedSource>(localSources[0] || unorganizedSources[0]);
  const [sourceTypeFilter, setSourceTypeFilter] = useState("ALL");

  const handleTriggerTreatmentLocal = (id: string, active: boolean) => {
    onTriggerTreatment(id, active);
    setLocalSources((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, treatmentStatus: active ? "active" : "inactive" } : s
      )
    );
    // Sync main selected source representation
    if (selectedSource.id === id) {
      setSelectedSource((prev) => ({ ...prev, treatmentStatus: active ? "active" : "inactive" }));
    }
    showToast(
      active
        ? `🔥 已启动该粉尘排放源关联的【${selectedSource.treatmentDevice}】，现场湿雾喷洒阻滞。`
        : `🛑 降尘设备已切换回待命就绪状态。`
    );
  };

  const handleUpdatePMValue = (val: number) => {
    setLocalSources((prev) =>
      prev.map((s) => (s.id === selectedSource.id ? { ...s, pm10Value: val } : s))
    );
    setSelectedSource((prev) => ({ ...prev, pm10Value: val }));
  };

  // ----------------------------------------------------
  // Sub-Tab 4: 无组织监测过程记录 (Time-series Monitoring & Spot Input)
  // ----------------------------------------------------
  const [limitStandard, setLimitStandard] = useState<"gb" | "ultralow">("gb");
  const [spotName, setSpotName] = useState("3#熟料交货栈桥");
  const [spotPM10, setSpotPM10] = useState(85);
  const [spotTSP, setSpotTSP] = useState(165);

  // Time-series continuous monitoring logs
  const [monitoringHistory, setMonitoringHistory] = useState<Array<{
    id: string;
    time: string;
    location: string;
    pm25: number;
    pm10: number;
    tsp: number;
    inspector: string;
    isManual: boolean;
  }>>([
    { id: "mon-1", time: "10:35:12", location: "原料装卸储运大棚", pm25: 35, pm10: 110, tsp: 240, inspector: "自研测距探头A", isManual: false },
    { id: "mon-2", time: "10:30:45", location: "熟料地库顶部廊道", pm25: 41, pm10: 165, tsp: 310, inspector: "双通道散射法B", isManual: false },
    { id: "mon-3", time: "10:25:20", location: "1#(石灰石)中段皮带", pm25: 22, pm10: 68, tsp: 130, inspector: "自研测距探头C", isManual: false },
    { id: "mon-4", time: "10:20:05", location: "辅料装矿接料斗", pm25: 55, pm10: 145, tsp: 290, inspector: "自研测距探头D", isManual: false },
    { id: "mon-5", time: "10:15:30", location: "熟料集货堆棚C区", pm25: 29, pm10: 95, tsp: 180, inspector: "散射粒子计数器", isManual: false },
    { id: "mon-6", time: "10:10:00", location: "包装出料装车轨道", pm25: 18, pm10: 42, tsp: 90, inspector: "自研测距探头E", isManual: false },
  ]);

  const recordManualSpotCheck = (e: React.FormEvent) => {
    e.preventDefault();
    const newRec = {
      id: `man-mon-${Date.now()}`,
      time: new Date().toISOString().substring(11, 19),
      location: spotName,
      pm25: Math.round(spotPM10 * 0.45),
      pm10: spotPM10,
      tsp: spotTSP,
      inspector: "cowleszdqzh@gmail.com", // Logged-in User Email as prefilled inspector value
      isManual: true,
    };
    setMonitoringHistory((prev) => [newRec, ...prev]);
    showToast(`📝 自助快速排查记录录入成功！点位:【${spotName}】。`);
  };

  const trendChartData = useMemo(() => {
    // Return logs in chronological order (old to new) for chart plotting
    return [...monitoringHistory]
      .reverse()
      .map((item) => ({
        time: item.time,
        "PM10 浓度": item.pm10,
        "PM2.5 浓度": item.pm25,
        "TSP 总粉尘": item.tsp,
      }));
  }, [monitoringHistory]);

  // ----------------------------------------------------
  // Sub-Tab 5: 无组织治理过程记录 (Spray Gun Cabinet & Events)
  // ----------------------------------------------------
  const [spraySpeed, setSpraySpeed] = useState<"auto" | "manual" | "time">("auto");
  const [nozzleAngle, setNozzleAngle] = useState(45);
  const [mistWaterLevel, setMistWaterLevel] = useState(85);
  const [heatingActive, setHeatingActive] = useState(false);
  const [oneKeyPower, setOneKeyPower] = useState(true);

  // Weekly bar comparison
  const weekdaysData = [
    { name: "周一", 自动喷强频数: 14, 区域最高PM10: 88, 抑尘效率: 75 },
    { name: "周二", 自动喷强频数: 25, 区域最高PM10: 145, 抑尘效率: 82 },
    { name: "周三", 自动喷强频数: 32, 区域最高PM10: 168, 抑尘效率: 84 },
    { name: "周四", 自动喷强频数: 12, 区域最高PM10: 65, 抑尘效率: 78 },
    { name: "周五", 自动喷强频数: 19, 区域最高PM10: 95, 抑尘效率: 80 },
    { name: "周六", 自动喷强频数: 8, 区域最高PM10: 45, 抑尘效率: 79 },
    { name: "周日", 自动喷强频数: 5, 区域最高PM10: 38, 抑尘效率: 72 },
  ];

  const [treatmentEventLogs, setTreatmentEventLogs] = useState<Array<{
    id: string;
    time: string;
    machineName: string;
    targetNode: string;
    duration: string;
    waterVolume: string;
    triggerReason: string;
    efficiency: string;
  }>>([
    { id: "treat-1", time: "10:36:15", machineName: "5号大空间防爆雾炮车", targetNode: "熟料地库栈桥", duration: "180s", waterVolume: "1.2 m³", triggerReason: "环境PM10突破 150 ug/m³", efficiency: "78%" },
    { id: "treat-2", time: "10:18:22", machineName: "1#卸料大棚干雾机", targetNode: "石灰石给料斗", duration: "300s", waterVolume: "2.4 m³", triggerReason: "红外定时联动", efficiency: "81%" },
    { id: "treat-3", time: "09:44:00", machineName: "洗车台底盘强力喷淋", targetNode: "重卡过水凹槽", duration: "90s", waterVolume: "3.5 m³", triggerReason: "车辆驶入雷达触发", efficiency: "94%" },
    { id: "treat-4", time: "09:12:40", machineName: "皮带运输重段细雾枪", targetNode: "辅料转接段", duration: "120s", waterVolume: "0.8 m³", triggerReason: "人工就地控制柜启键", efficiency: "72%" },
  ]);

  const handleManualTriggerCabinetSpray = () => {
    if (!oneKeyPower) {
      showToast("❌ 控制柜总电源已断开，请先启动总电源按钮！");
      return;
    }
    setMistWaterLevel((prev) => Math.max(10, prev - 6));
    const nowStr = new Date().toISOString().substring(11, 19);
    const newEvent = {
      id: `treat-${Date.now()}`,
      time: nowStr,
      machineName: "5号大空间防爆雾炮车",
      targetNode: selectedSource.name,
      duration: "180秒 (超压压制)",
      waterVolume: `${(0.8 + Math.random() * 0.9).toFixed(2)} m³`,
      triggerReason: "集中式就地控制柜手动点火",
      efficiency: "85%",
    };

    setTreatmentEventLogs((prev) => [newEvent, ...prev]);
    showToast(`🌪️ 已强制激射 5号旋转雾炮，仰角已定向 ${nozzleAngle}°对准 【${selectedSource.name}】进行超高压降沉压制！`);
  };

  // ----------------------------------------------------
  // Sub-Tab 6: 无组织监控过程记录 (CCTV Video Stream Multiplex)
  // ----------------------------------------------------
  const [selectedCameraId, setSelectedCameraId] = useState<string>("cctv-1");
  const [zoomLevel, setZoomLevel] = useState<number>(2.0);
  const [panAngle, setPanAngle] = useState({ pan: 120, tilt: 35 });
  const [snapshots, setSnapshots] = useState<Array<{
    id: string;
    time: string;
    camName: string;
    imageUrl: string;
    ocrPlate?: string;
    blackSmokeIndex?: string;
  }>>([
    { id: "sn-1", time: "10:35:01", camName: "北大门车辆洗台CCTV", imageUrl: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=260&auto=format&fit=crop&q=60", ocrPlate: "云A·1D992", blackSmokeIndex: "0 (完全无烟)" },
    { id: "sn-2", time: "10:18:14", camName: "熟料大堆地仓5层南监", imageUrl: "https://images.unsplash.com/photo-1590487988256-9ed24133863e?w=260&auto=format&fit=crop&q=60", ocrPlate: "津B·981G8", blackSmokeIndex: "1 (正常蒸汽白烟)" },
  ]);

  // Video camera registry metadata
  const cameraCatalog = [
    { id: "cctv-1", name: "北大门重卡洗车台监控", tag: "GATE_NORTH_WASH", area: "厂前防尘道闸" },
    { id: "cctv-2", name: "主石灰石卸料库顶监控", tag: "CRUSH_LIMESTONE", area: "一破工艺区" },
    { id: "cctv-3", name: "熟料密闭大棚北CCTV", tag: "CLINKER_DOME_N", area: "熟料库" },
    { id: "cctv-4", name: "煤粉输送及混煤制备监控", tag: "COAL_PREP_07", area: "煤磨区" },
  ];

  const captureActiveCctvSnapshot = () => {
    const matchedCam = cameraCatalog.find(c => c.id === selectedCameraId) || cameraCatalog[0];
    const platesSim = ["冀A·R5532", "鄂F·002D8", "渝C·3843F", "陕F·A20E9"];
    const randomPlate = platesSim[Math.floor(Math.random() * platesSim.length)];
    const randomSmoke = `${(Math.random() * 0.5).toFixed(1)} Ringelmann (合格)`;

    const newSnapshot = {
      id: `sn-${Date.now()}`,
      time: new Date().toISOString().substring(11, 19),
      camName: matchedCam.name,
      imageUrl: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=260&auto=format&fit=crop&q=60",
      ocrPlate: randomPlate,
      blackSmokeIndex: randomSmoke,
    };
    setSnapshots((prev) => [newSnapshot, ...prev]);
    showToast(`📸 【CCTV 实时画面抓拍】已归档，生成OCR车辆车牌特征分析和不透光尾气透光比对图（备案成功）。`);
  };

  return (
    <div className="space-y-4 font-sans text-slate-100">
      
      {/* 🚀 Interactive Sub-Tabs Navigation */}
      <div className="bg-slate-950 border border-slate-900 rounded-xl p-3 shadow-lg">
        <div className="flex items-center gap-1.5 border-b border-slate-900 pb-2 mb-3">
          <Settings className="h-4.5 w-4.5 text-cyan-400 animate-spin" style={{ animationDuration: "12s" }} />
          <h2 className="text-xs font-bold font-mono text-slate-300 uppercase tracking-widest">
            无组织粉尘微环境空气污染网格智能监控系统
          </h2>
          <span className="text-[10px] ml-auto px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-500 font-mono">
            标准协议: HJ 212 / GB 16297
          </span>
        </div>

        {/* Horizontal Navigation rail with glowing accents */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {[
            { id: "device_status_summary", name: "设备运行状态汇总", icon: Cpu, color: "border-cyan-500/30 text-cyan-400" },
            { id: "alarm_ratio", name: "报警类型占比", icon: AlertTriangle, color: "border-amber-500/30 text-amber-400" },
            { id: "source_inventory", name: "无组织排放源清单", icon: Layers, color: "border-emerald-500/30 text-emerald-400" },
            { id: "monitoring_records", name: "无组织监测过程记录", icon: ClipboardList, color: "border-sky-500/30 text-sky-400" },
            { id: "treatment_records", name: "无组织治理过程记录", icon: Droplets, color: "border-teal-500/30 text-teal-400" },
            { id: "cctv_records", name: "无组织监控过程记录", icon: Video, color: "border-indigo-500/30 text-indigo-400" },
          ].map((tab) => {
            const isSelected = activeSubTab === tab.id;
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveSubTab(tab.id as any);
                  setSearchQuery(""); // Clear queries when shifting tabs
                }}
                className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-center transition-all cursor-pointer ${
                  isSelected
                    ? "bg-slate-900 border-white/25 shadow-[0_0_12px_rgba(34,211,238,0.15)] ring-1 ring-cyan-500/50"
                    : "bg-slate-950/60 border-slate-900 text-slate-500 hover:border-slate-800 hover:text-slate-300"
                }`}
              >
                <TabIcon className={`h-5 w-5 mb-1 ${isSelected ? tab.color.split(" ")[1] : "text-slate-500"}`} />
                <span className={`text-[11px] font-bold ${isSelected ? "text-slate-100" : "text-slate-450"}`}>
                  {tab.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {actionSuccess && (
        <div className="text-center text-[11px] text-cyan-300 border border-dashed border-cyan-800/60 py-2.5 bg-cyan-950/40 rounded-lg animate-pulse">
          {actionSuccess}
        </div>
      )}

      {/* ----------------------------------------------------
          SUB-TAB 1: 设备运行状态汇总
          ---------------------------------------------------- */}
      {activeSubTab === "device_status_summary" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="bg-slate-950 border border-slate-900 p-3 rounded-xl flex flex-col justify-between h-[90px]">
              <span className="text-[10.5px] text-slate-500 block">厂区监控网元总数</span>
              <span className="font-mono text-2xl font-black text-cyan-400 mt-1">{localDeviceLogs.length} 台</span>
              <span className="text-[9px] text-slate-650 leading-tight">全天持续巡检</span>
            </div>
            <div className="bg-slate-950 border border-slate-900 p-3 rounded-xl flex flex-col justify-between h-[90px]">
              <span className="text-[10.5px] text-slate-500 block">在线良率百分比</span>
              <span className="font-mono text-2xl font-black text-emerald-400 mt-1">96.8%</span>
              <span className="text-[9px] text-slate-650 leading-tight">高于国家行业基准值</span>
            </div>
            <div className="bg-slate-950 border border-slate-900 p-3 rounded-xl flex flex-col justify-between h-[90px]">
              <span className="text-[10.5px] text-slate-500 block">故障报警设备数</span>
              <span className="font-mono text-2xl font-black text-yellow-500 mt-1">
                {localDeviceLogs.filter((d) => d.status === "warning").length} 台
              </span>
              <span className="text-[9px] text-slate-650 leading-tight">处于二级阈值偏离</span>
            </div>
            <div className="bg-slate-950 border border-slate-900 p-3 rounded-xl flex flex-col justify-between h-[90px]">
              <span className="text-[10.5px] text-slate-500 block">失联断线传感器</span>
              <span className="font-mono text-2xl font-black text-red-500 mt-1 animate-pulse">
                {localDeviceLogs.filter((d) => d.status === "offline" || d.status === "error").length} 台
              </span>
              <span className="text-[9px] text-slate-650 leading-tight">建议立刻排查PLC电缆</span>
            </div>
            <div className="bg-slate-950 border border-slate-900 p-3 rounded-xl flex flex-col justify-between h-[90px]">
              <span className="text-[10.5px] text-slate-500 block">24h自动喷淋消耗</span>
              <span className="font-mono text-2xl font-black text-teal-400 mt-1">24.8 m³</span>
              <span className="text-[9px] text-slate-650 leading-tight">重力节水循环模式</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Left Box: Diagnostic Panel Control */}
            <div className="bg-slate-950 border border-slate-900 rounded-xl p-4 flex flex-col justify-between min-h-[300px]">
              <div className="space-y-3">
                <div className="border-b border-slate-900 pb-2.5 flex items-center gap-2">
                  <Activity className="h-4.5 w-4.5 text-cyan-400" />
                  <span className="text-xs font-bold text-slate-200">一键轮询诊断与隔离网关</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  通过 MODBUS TCP/IP 集中信道对厂界各处的无组织空气子站、激光微粒计数器、多角度降尘雾炮机以及车牌抓拍网络进行即时Ping链路测，支持快速隔离异常端口。
                </p>

                {isDiagnosing ? (
                  <div className="space-y-2 py-2">
                    <div className="flex justify-between text-xs font-mono text-cyan-400">
                      <span>PLC 信号阻断及校验对齐中...</span>
                      <span>{diagProgress}%</span>
                    </div>
                    <div className="h-2 bg-slate-900 rounded overflow-hidden">
                      <div className="h-full bg-cyan-400 transition-all duration-300" style={{ width: `${diagProgress}%` }} />
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={startBatchDiagnostics}
                    className="w-full bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-850 rounded py-2 text-xs font-bold transition-all cursor-pointer"
                  >
                    ⚡ 点击启动一键批量轮询
                  </button>
                )}
              </div>

              <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-900 text-[10px] space-y-1 font-mono text-slate-500 mt-4">
                <p>● 当前通讯频率: 5秒巡检 (自适应)</p>
                <p>● 网元应答丢失限值: 连续3次触发断线警报</p>
                <p>● 双冗余网关热备状态: 【自动对换在控】</p>
              </div>
            </div>

            {/* Right Box: Full device register data sheets */}
            <div className="lg:col-span-2 bg-slate-950 border border-slate-900 rounded-xl p-4">
              <div className="flex justify-between items-center border-b border-slate-900 pb-2 mb-3">
                <span className="text-xs font-bold text-slate-200">全厂监测/治理设备状态详情总览</span>
                {/* Search query */}
                <div className="flex items-center gap-2">
                  <select
                    value={deviceFilterType}
                    onChange={(e) => setDeviceFilterType(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded text-[10px] text-slate-300 px-2 py-0.5 outline-none"
                  >
                    <option value="ALL">全部设备类型</option>
                    <option value="monitoring">无组织尘源探头</option>
                    <option value="video">联动AI摄像枪</option>
                    <option value="treatment">治理雾枪及阀门</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto max-h-[300px]">
                <table className="w-full text-left text-xs border-collapse font-mono">
                  <thead>
                    <tr className="border-b border-slate-900 text-slate-500">
                      <th className="py-2 px-1">设备识别名</th>
                      <th className="py-2 px-1">类型属性</th>
                      <th className="py-2 px-1 text-right">额电压 (V)</th>
                      <th className="py-2 px-1 text-right">流强 (A)</th>
                      <th className="py-2 px-1 text-center font-sans">运行状态</th>
                      <th className="py-2 px-1 text-center font-sans">诊断反馈</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900 text-slate-400">
                    {localDeviceLogs
                      .filter((d) => deviceFilterType === "ALL" || d.deviceType === deviceFilterType)
                      .map((dev) => {
                        const isOffline = dev.status === "offline" || dev.status === "error";
                        return (
                          <tr key={dev.id} className="hover:bg-slate-900/20">
                            <td className="py-2.5 px-1 font-sans text-[11px] font-semibold text-slate-200">
                              {dev.deviceName}
                            </td>
                            <td className="py-2.5 px-1 font-sans text-slate-500">
                              {dev.deviceType === "monitoring" ? "采集传感器" :
                               dev.deviceType === "video" ? "高清CCTV" :
                               dev.deviceType === "treatment" ? "射雾雾炮" : "生料辅端"}
                            </td>
                            <td className="py-2.5 px-1 text-right text-cyan-400">{dev.voltage} V</td>
                            <td className="py-2.5 px-1 text-right text-emerald-400">{dev.current} A</td>
                            <td className="py-2.5 px-1 text-center">
                              <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-sans ${
                                dev.status === "normal" ? "bg-emerald-950 text-emerald-450 border border-emerald-900" : "bg-red-950 text-red-550 border border-red-900"
                              }`}>
                                {dev.status === "normal" ? "● 在线工作" : "● 硬件失踪"}
                              </span>
                            </td>
                            <td className="py-1 px-1 text-center">
                              <button
                                onClick={() => handleRestartDevice(dev.id, dev.deviceName)}
                                className="bg-slate-900 hover:bg-slate-800 border border-slate-850 hover:border-slate-700 rounded px-1.5 py-0.5 text-[10px] text-slate-400 cursor-pointer"
                              >
                                强制重置
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------
          SUB-TAB 2: 报警类型占比分析 & 记录 ledger
          ---------------------------------------------------- */}
      {activeSubTab === "alarm_ratio" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            
            {/* Left: Recharts Alarm Donut & manual form */}
            <div className="bg-slate-950 border border-slate-900 rounded-xl p-4 flex flex-col justify-between min-h-[380px]">
              <div className="space-y-3">
                <div className="border-b border-slate-900 pb-2.5">
                  <span className="text-xs font-bold text-cyan-400 block uppercase tracking-widest font-mono">
                    🚨 报警类型占比分析图 (饼图)
                  </span>
                  <p className="text-[10.5px] text-slate-500">依据后台对连续扬尘超限/设备报警频数计算得到</p>
                </div>

                <div className="h-[180px] w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={alarmGroupData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {alarmGroupData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: "#020617", borderColor: "#1e3a8a", borderRadius: "6.5px" }}
                        itemStyle={{ fontSize: "11px" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Total indicator inside Donut */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                    <span className="font-mono text-lg font-black text-slate-100 block">4</span>
                    <span className="text-[8px] text-slate-500 uppercase font-sans">告警大类</span>
                  </div>
                </div>

                {/* Pie legend details */}
                <div className="space-y-1 text-xs">
                  {alarmGroupData.map((g) => (
                    <div key={g.name} className="flex justify-between items-center text-[10.5px] font-mono">
                      <span className="text-slate-450 flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: g.color }} />
                        {g.name}
                      </span>
                      <span className="font-bold text-slate-300">
                        {g.value} 次 <span className="text-slate-500 font-normal">({parseFloat(((g.value / (localAlarms.length || 1)) * 100).toFixed(0)) || 0}%)</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Live manual injector form */}
              <form onSubmit={injectSimulatedAlarm} className="border-t border-slate-900 pt-3.5 space-y-2 mt-4 text-xs">
                <p className="font-bold text-slate-400 text-[10.5px]">🛠️ 进行仿真警情应急联动注入测验:</p>
                <div>
                  <label className="text-slate-500 block mb-0.5">模拟超标位置点位:</label>
                  <input
                    type="text"
                    value={simAlarmLocation}
                    onChange={(e) => setSimAlarmLocation(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200 outline-none font-sans"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-500 block mb-0.5">预选异常分类:</label>
                    <select
                      value={simAlarmType}
                      onChange={(e: any) => setSimAlarmType(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-1.5 py-1 text-slate-200 outline-none"
                    >
                      <option value="overshoot_alarm">粉尘浓度大值超标</option>
                      <option value="treatment_fault">雾炮执行阀堵塞</option>
                      <option value="production_fault">传送皮带负荷故障</option>
                      <option value="monitoring_fault">颗粒物探头死机</option>
                    </select>
                  </div>
                  <div>
                    <button
                      type="submit"
                      className="w-full bg-amber-950 hover:bg-amber-900 text-amber-300 border border-amber-800 rounded text-xs font-bold py-1.5 mt-4 cursor-pointer"
                    >
                      💥 注入测试告警
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Right: Alarm ledger table */}
            <div className="lg:col-span-2 bg-slate-950 border border-slate-900 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center border-b border-slate-900 pb-2 mb-3">
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">厂界监控告警及联动落单台账</span>
                    <p className="text-[10px] text-slate-500">记录了所有主动/被动颗粒物防溢越限时间及工装故障</p>
                  </div>

                  <div className="flex gap-2">
                    <select
                      value={alarmFilterLevel}
                      onChange={(e) => setAlarmFilterLevel(e.target.value)}
                      className="bg-slate-900 border border-slate-800 rounded text-[10px] text-slate-300 px-2 py-0.5 outline-none font-sans"
                    >
                      <option value="ALL">全部紧急度</option>
                      <option value="critical">超紧急 (Critical)</option>
                      <option value="major">严重警告 (Major)</option>
                      <option value="minor">轻微缺陷 (Minor)</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-y-auto max-h-[350px]">
                  <table className="w-full text-left text-xs border-collapse font-mono">
                    <thead>
                      <tr className="border-b border-slate-900 text-slate-500">
                        <th className="py-2 px-1">报警工艺位</th>
                        <th className="py-2 px-1">事件名称</th>
                        <th className="py-2 px-1 text-center font-sans">严重度</th>
                        <th className="py-2 px-1 text-center font-sans">启停时间</th>
                        <th className="py-2 px-1 text-center font-sans">处理状态</th>
                        <th className="py-2 px-1 text-center font-sans">安全操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900 text-slate-400">
                      {localAlarms
                        .filter((a) => alarmFilterLevel === "ALL" || a.level === alarmFilterLevel)
                        .map((al) => {
                          const isActive = al.status === "active";
                          return (
                            <tr key={al.id} className="hover:bg-slate-900/20">
                              <td className="py-3 px-1 font-sans text-[11px] font-semibold text-slate-200">
                                {al.location}
                              </td>
                              <td className="py-3 px-1 font-sans text-slate-400 truncate max-w-[125px]" title={al.description}>
                                {al.name}
                              </td>
                              <td className="py-3 px-1 text-center">
                                <span className={`inline-block rounded px-1 text-[9px] font-bold ${
                                  al.level === "critical" ? "bg-red-950/40 text-red-400 border border-red-900/50 animate-pulse" :
                                  al.level === "major" ? "bg-amber-950/40 text-amber-500 border border-amber-800/50" : "bg-blue-950/40 text-blue-400"
                                }`}>
                                  {al.level === "critical" ? "一级紧" : al.level === "major" ? "二级严" : "常规偏"}
                                </span>
                              </td>
                              <td className="py-3 px-1 text-center text-slate-500 text-[10px]">
                                {al.startTime} ⮕ {al.endTime || "持续监测"}
                              </td>
                              <td className="py-3 px-1 text-center">
                                <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-sans font-bold ${
                                  isActive ? "bg-red-950 text-red-400" : "bg-emerald-950 text-emerald-400"
                                }`}>
                                  {isActive ? "正在越标" : "已确认消警"}
                                </span>
                              </td>
                              <td className="py-2 px-1 text-center font-sans">
                                {isActive ? (
                                  <button
                                    onClick={() => resolveAlarmLocally(al.id, al.name)}
                                    className="bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-850 rounded px-2.5 py-0.5 text-[10px] cursor-pointer font-bold"
                                  >
                                    一键手动销警
                                  </button>
                                ) : (
                                  <span className="text-[10px] text-slate-500">归档备齐</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-slate-900/40 p-2 border border-slate-900 text-[9.5px] text-slate-500 leading-normal font-mono text-right mt-2">
                系统每日生成《脱硝自检与环保超标隔离备案日志》，自动上链至合规环保系统备书。
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ----------------------------------------------------
          SUB-TAB 3: 无组织排放源清单
          ---------------------------------------------------- */}
      {activeSubTab === "source_inventory" && (
        <div className="space-y-4">
          <div className="bg-slate-950 border border-slate-900 rounded-xl p-4 shadow-md flex justify-between items-center flex-wrap gap-2">
            <div>
              <span className="text-xs font-bold text-slate-200 block">有组织/无组织大气排放固定工序尘源清单</span>
              <p className="text-[10px] text-slate-500">针对易散落粉末的工艺料仓、破碎投料、辅料大棚进行清单管理</p>
            </div>

            <div className="flex gap-2">
              <select
                value={sourceTypeFilter}
                onChange={(e) => setSourceTypeFilter(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded text-xs text-slate-300 px-3 py-1 outline-none font-sans"
              >
                <option value="ALL">全部物源分类</option>
                <option value="储存">原料堆存区</option>
                <option value="输送">高架皮带回廊</option>
                <option value="工艺过程">包装与出铁车间</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Left: Master sources ledger */}
            <div className="lg:col-span-2 bg-slate-950 border border-slate-900 rounded-xl p-4">
              <span className="text-xs font-bold text-cyan-400 block mb-3 font-mono">🔍 点击下列表行查验工艺位及治理控制卡</span>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse font-mono">
                  <thead>
                    <tr className="border-b border-slate-900 text-slate-500">
                      <th className="py-2 px-1">生产过程源名称</th>
                      <th className="py-2 px-1">易散物料类型</th>
                      <th className="py-2 px-1">搭配抑尘阀泵</th>
                      <th className="py-2 px-1 text-right">局部PM10瞬值</th>
                      <th className="py-2 px-1 text-center font-sans">联动治理状态</th>
                      <th className="py-2 px-1 text-center font-sans">切换监控</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900 text-slate-400">
                    {localSources
                      .filter((s) => sourceTypeFilter === "ALL" || s.type === sourceTypeFilter)
                      .map((src) => {
                        const isSelected = selectedSource.id === src.id;
                        const isAtmActive = src.treatmentStatus === "active";
                        return (
                          <tr
                            key={src.id}
                            onClick={() => setSelectedSource(src)}
                            className={`hover:bg-slate-900/30 cursor-pointer transition-colors ${
                              isSelected ? "bg-cyan-950/40 text-cyan-300 font-bold" : ""
                            }`}
                          >
                            <td className="py-3 px-1 font-sans text-[11px] font-semibold text-slate-200">
                              {src.name}
                            </td>
                            <td className="py-3 px-1 font-sans text-slate-500">{src.type}</td>
                            <td className="py-3 px-1 font-sans text-slate-450 truncate max-w-[120px]">{src.treatmentDevice}</td>
                            <td className="py-3 px-1 text-right text-cyan-400 font-bold">{src.pm10Value} ug</td>
                            <td className="py-3 px-1 text-center">
                              <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-sans ${
                                isAtmActive ? "bg-teal-950 text-teal-400 border border-teal-900" : "bg-slate-900 text-slate-500"
                              }`}>
                                {isAtmActive ? "● 正在开阀降尘" : "● 待命就绪"}
                              </span>
                            </td>
                            <td className="py-1 px-1 text-center">
                              <span className="text-xs text-indigo-400 hover:text-indigo-300">🔎 详情卡</span>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right: Selected details & adjustments */}
            <div className="bg-slate-950 border border-slate-900 rounded-xl p-4 flex flex-col justify-between min-h-[350px]">
              <div>
                <div className="border-b border-slate-900 pb-2.5 mb-3 flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-200 flex items-center gap-1.5 uppercase font-mono">
                    <Layers className="h-4 w-4 text-cyan-400" />
                    【{selectedSource.name}】微观治理控制卡
                  </span>
                  <span className="text-[10px] text-slate-500">源工艺编号: #{selectedSource.id}</span>
                </div>

                <div className="space-y-3.5 text-xs text-slate-350 font-sans">
                  <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-900/80 space-y-2">
                    <p><strong className="text-slate-400">扬尘大类:</strong> {selectedSource.type} 工段重点落灰源</p>
                    <p><strong className="text-slate-400">既设终端:</strong> {selectedSource.treatmentDevice} 防护系统</p>
                    <p><strong className="text-slate-400">实时测算PM10:</strong> <span className="font-mono text-cyan-400 font-bold text-sm">{selectedSource.pm10Value} ug/m³</span></p>
                    <p><strong className="text-slate-400">监控CCTV:</strong> <span className="text-indigo-400 font-mono text-[11px]">[{selectedSource.cctvUrl}]</span></p>
                  </div>

                  <div className="space-y-1.5 border-t border-slate-900/50 pt-3">
                    <label className="text-slate-500 block">手动微调该点位扬尘浓度 (仿真动态检验):</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="10"
                        max="240"
                        value={selectedSource.pm10Value}
                        onChange={(e) => handleUpdatePMValue(parseInt(e.target.value))}
                        className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                      />
                      <span className="font-mono text-xs text-cyan-400 bg-slate-900 px-2 py-0.5 rounded font-black">
                        {selectedSource.pm10Value}ug
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 border-t border-slate-900/50 pt-3.5 space-y-2.5">
                <button
                  onClick={() => handleTriggerTreatmentLocal(selectedSource.id, selectedSource.treatmentStatus !== "active")}
                  className={`w-full text-xs font-bold py-2 px-3 rounded cursor-pointer transition-all flex items-center justify-center gap-1 border ${
                    selectedSource.treatmentStatus === "active"
                      ? "bg-amber-950 text-amber-300 border-amber-800 hover:bg-amber-900"
                      : "bg-cyan-950 text-cyan-300 border-cyan-800 hover:bg-cyan-900"
                  }`}
                >
                  {selectedSource.treatmentStatus === "active" ? "❌ 强制切断联动闭电" : "🔥 手动激发该点抑尘雾化喷水"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------
          SUB-TAB 4: 无组织监测过程记录
          ---------------------------------------------------- */}
      {activeSubTab === "monitoring_records" && (
        <div className="space-y-4">
          <div className="bg-slate-950 border border-slate-900 rounded-xl p-4 shadow-md flex justify-between items-center flex-wrap gap-4">
            <div>
              <span className="text-xs font-bold text-slate-200 block">连续微粒环境在线监测趋势(PM2.5 / PM10 / TSP)</span>
              <p className="text-[10px] text-slate-500">支持比对国家《环境空气质量标准 (GB 3095-2012)》二级限值指标</p>
            </div>

            <div className="flex items-center gap-2 bg-slate-900/80 p-1 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500 px-1 font-semibold">比对安全限值参考线:</span>
              <button
                onClick={() => setLimitStandard("gb")}
                className={`px-3 py-1 text-[10px] rounded transition-all font-bold cursor-pointer ${
                  limitStandard === "gb" ? "bg-cyan-950 text-cyan-400 border border-cyan-800" : "text-slate-500"
                }`}
              >
                🏛️ 国标二级 (150 ug)
              </button>
              <button
                onClick={() => setLimitStandard("ultralow")}
                className={`px-3 py-1 text-[10px] rounded transition-all font-bold cursor-pointer ${
                  limitStandard === "ultralow" ? "bg-teal-950 text-teal-400 border border-teal-800" : "text-slate-500"
                }`}
              >
                🍃 超低改造限值 (100 ug)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Left: Recharts Dynamic Trend line charts */}
            <div className="lg:col-span-2 bg-slate-950 border border-slate-900 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-cyan-400 block mb-3 font-mono">📈 扬尘环境粉尘物料粒子浓度走势</span>
                
                <div className="h-[210px] w-full mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorPm10" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorTsp" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(30, 41, 59, 0.4)" />
                      <XAxis dataKey="time" stroke="#475569" fontSize={9} />
                      <YAxis stroke="#475569" fontSize={9} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#020617", borderColor: "#1e3a8a", borderRadius: "6px" }}
                        itemStyle={{ fontSize: "11px" }}
                      />
                      <Legend iconSize={8} wrapperStyle={{ fontSize: "10px" }} />
                      <Area name="PM10 浓度 (ug/m³)" type="monotone" dataKey="PM10 浓度" stroke="#f59e0b" fillOpacity={1} fill="url(#colorPm10)" strokeWidth={1.5} />
                      <Area name="TSP 总悬浮颗粒物" type="monotone" dataKey="TSP 总粉尘" stroke="#22d3ee" fillOpacity={1} fill="url(#colorTsp)" strokeWidth={1.5} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-900 text-[10.5px] text-slate-400 leading-normal flex justify-between items-center mt-4">
                <span>⚠️ 当前参考警示警戒线: <strong className="text-amber-500 font-bold">{limitStandard === "gb" ? 150 : 100} ug/m³</strong></span>
                <span className="text-[10px] text-slate-500">超过此参考线自动联动开启现场旋转雾炮</span>
              </div>
            </div>

            {/* Right: Manual check forms */}
            <div className="bg-slate-950 border border-slate-900 rounded-xl p-4 flex flex-col justify-between">
              <form onSubmit={recordManualSpotCheck} className="space-y-3.5 text-xs text-slate-350">
                <span className="font-bold text-slate-200 block border-b border-slate-900 pb-2.5 uppercase font-mono">
                  📝 提交巡回环境点瞬时取样备案
                </span>
                
                <div>
                  <label className="text-slate-500 block mb-1 font-semibold">采样区域名称/栈桥编号:</label>
                  <input
                    type="text"
                    value={spotName}
                    onChange={(e) => setSpotName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-slate-200 outline-none font-sans"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-500 block mb-1 font-semibold">PM10 (物尘ug/m³):</label>
                    <input
                      type="number"
                      value={spotPM10}
                      onChange={(e) => setSpotPM10(parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-slate-200 outline-none font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 block mb-1 font-semibold">TSP (总粉尘ug/m³):</label>
                    <input
                      type="number"
                      value={spotTSP}
                      onChange={(e) => setSpotTSP(parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-slate-200 outline-none font-mono"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-500 block mb-0.5 font-semibold">核查专员签章邮箱 (预填不可改):</label>
                  <div className="bg-slate-900 border border-slate-850 px-2 py-1.5 text-slate-400 font-mono rounded flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-slate-500" />
                    <span>cowleszdqzh@gmail.com</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-850 rounded py-2 text-xs font-bold transition-all cursor-pointer"
                >
                  ➕ 将瞬时采样上传至过程台账
                </button>
              </form>

              <div className="bg-slate-900/40 p-2.5 rounded border border-slate-900 text-[10px] text-slate-500 font-mono text-center">
                所有人工抽检台账皆与国家环保HJ/75数据传输标准协议对齐封箱，防改写。
              </div>
            </div>
          </div>

          {/* Bottom raw list */}
          <div className="bg-slate-950 border border-slate-900 rounded-xl p-4">
            <span className="text-xs font-bold text-slate-200 block mb-3 font-sans">📄 近期无组织粉尘微环境网格连续监测报告清单</span>
            <div className="overflow-x-auto max-h-[220px]">
              <table className="w-full text-left text-xs border-collapse font-mono">
                <thead>
                  <tr className="border-b border-slate-900 text-slate-500">
                    <th className="py-2 px-1">诊断回录时间</th>
                    <th className="py-2 px-1 text-left">监测工段/位</th>
                    <th className="py-2 px-1 text-right">PM2.5 (ug/m³)</th>
                    <th className="py-2 px-1 text-right">PM10 (环境尘)</th>
                    <th className="py-2 px-1 text-right">TSP (总溢出)</th>
                    <th className="py-2 px-1">数据采集设备 / 人工检测专员</th>
                    <th className="py-2 px-1 text-center font-sans">合规筛查</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900 text-slate-400">
                  {monitoringHistory.map((item) => {
                    const isEx = item.pm10 > (limitStandard === "gb" ? 150 : 100);
                    return (
                      <tr key={item.id} className="hover:bg-slate-900/20">
                        <td className="py-2 px-1 text-slate-450">{item.time}</td>
                        <td className="py-2 px-1 font-sans font-semibold text-slate-300">{item.location}</td>
                        <td className="py-2 px-1 text-right text-emerald-400">{item.pm25} ug</td>
                        <td className={`py-2 px-1 text-right font-bold ${isEx ? "text-yellow-500 animate-pulse" : "text-emerald-400"}`}>
                          {item.pm10} ug
                        </td>
                        <td className="py-2 px-1 text-right text-cyan-400">{item.tsp} ug</td>
                        <td className="py-2 px-1 text-slate-400 flex items-center gap-1">
                          {item.isManual ? (
                            <span className="inline-flex rounded bg-blue-950 text-blue-400 px-1 py-0.5 text-[9px] font-sans font-semibold border border-blue-900">
                              👨‍💼 线下抽检
                            </span>
                          ) : (
                            <span className="text-slate-500">📡 在线子站</span>
                          )}
                          <span>{item.inspector}</span>
                        </td>
                        <td className="py-2 px-1 text-center">
                          <span className={`px-1 py-0.2 rounded text-[9.5px] ${
                            isEx ? "bg-amber-950 text-amber-500" : "bg-emerald-950 text-emerald-450"
                          }`}>
                            {isEx ? "⚠️ 超限提醒" : "✔ 安全合规"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------
          SUB-TAB 5: 无组织治理过程记录
          ---------------------------------------------------- */}
      {activeSubTab === "treatment_records" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Left: Weekday Activations and reductions analysis */}
            <div className="lg:col-span-2 bg-slate-950 border border-slate-900 rounded-xl p-4">
              <span className="text-xs font-bold text-cyan-400 block mb-3 font-mono">📊 每日自动雾枪喷淋覆盖次数 vs 区域平均粉尘浓度跌落相关比对</span>
              
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weekdaysData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(30, 41, 59, 0.4)" />
                    <XAxis dataKey="name" stroke="#475569" fontSize={9} />
                    <YAxis stroke="#475569" fontSize={9} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#020617", borderColor: "#1e3a8a", borderRadius: "6.5px" }}
                      itemStyle={{ fontSize: "11px" }}
                    />
                    <Legend iconSize={8} wrapperStyle={{ fontSize: "10px" }} />
                    <Bar name="自动喷药覆盖次数 (次/日)" dataKey="自动喷量频数" fill="#2dd4bf" radius={[3, 3, 0, 0]} />
                    <Bar name="微观区域平均PM10 (ug/m³)" dataKey="区域最高PM10" fill="#f97316" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Right: Cabinet Console Panel (390-480 in original file) */}
            <div className="bg-slate-950 border border-slate-900 rounded-xl p-4 flex flex-col justify-between min-h-[300px]">
              <div className="space-y-3.5">
                <div className="border-b border-slate-900 pb-2.5">
                  <span className="text-xs font-bold text-teal-400 block font-mono flex items-center gap-1.5 uppercase">
                    <Compass className="h-4 w-4" /> 5号旋转除硫射雾枪/重力雾炮电气控制柜
                  </span>
                  <p className="text-[10px] text-slate-500">支持横俯仰角配准、一键主备用伴热极寒天气防冷凝器</p>
                </div>

                <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-900/60 flex justify-between items-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-550 block font-mono">就地控制机号:</span>
                    <span className="font-bold text-slate-200 truncate max-w-[150px] block">
                      #{selectedSource.treatmentDevice || "高高压冲洗泵站"}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10.5px] text-slate-450">控制总闸:</span>
                    <button
                      type="button"
                      onClick={() => setOneKeyPower(!oneKeyPower)}
                      className={`h-5 w-10 rounded-full p-0.5 transition-colors cursor-pointer ${
                        oneKeyPower ? "bg-emerald-500" : "bg-slate-800"
                      }`}
                    >
                      <div className={`h-4 w-4 rounded-full bg-white transition-transform ${oneKeyPower ? "translate-x-5" : ""}`} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 bg-slate-950/80 p-2 rounded-lg border border-slate-900/80 text-xs">
                  <div>
                    <label className="text-slate-500 block mb-0.5 font-semibold">自驱联动触发:</label>
                    <select
                      value={spraySpeed}
                      onChange={(e: any) => setSpraySpeed(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-slate-200 outline-none rounded p-1 text-[11px]"
                    >
                      <option value="auto">粉尘浓度触发</option>
                      <option value="manual">全手动接管</option>
                      <option value="time">循环溢雾压制</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-500 block mb-0.5 font-semibold">横向俯视角 (°):</label>
                    <input
                      type="range"
                      min="10"
                      max="90"
                      value={nozzleAngle}
                      onChange={(e) => setNozzleAngle(parseInt(e.target.value) || 0)}
                      className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 mt-2"
                    />
                    <span className="text-[9px] text-slate-550 block text-right font-mono">仰角: {nozzleAngle}°</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-mono leading-tight">
                  <div className="p-2 border border-slate-900 bg-slate-900/40 rounded">
                    <span className="text-[9px] text-slate-550 block">喷头供水压</span>
                    <span className="text-cyan-400 font-bold block mt-1">4.2 MPa</span>
                  </div>
                  <div className="p-2 border border-slate-900 bg-slate-900/40 rounded">
                    <span className="text-[9px] text-slate-550 block">储药罐液流</span>
                    <span className={`font-bold block mt-1 ${mistWaterLevel < 20 ? "text-red-400" : "text-emerald-400"}`}>
                      {mistWaterLevel}%
                    </span>
                  </div>
                  <div className="p-2 border border-slate-900 bg-slate-900/40 rounded flex flex-col justify-between items-center">
                    <span className="text-[9px] text-slate-550 block">智能伴热</span>
                    <button
                      type="button"
                      onClick={() => setHeatingActive(!heatingActive)}
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded transition-all mt-1 ${
                        heatingActive ? "bg-amber-950 text-amber-400" : "bg-slate-950 text-slate-600"
                      }`}
                    >
                      {heatingActive ? "已点火" : "防冻伴热"}
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-900/50 space-y-2">
                <button
                  type="button"
                  onClick={handleManualTriggerCabinetSpray}
                  className="w-full bg-teal-950 hover:bg-teal-900 text-teal-300 border border-teal-850 rounded py-2 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  🌪️ 激射除尘旋转强雾枪
                </button>
              </div>
            </div>
          </div>

          {/* Ledger table bottom */}
          <div className="bg-slate-950 border border-slate-900 rounded-xl p-4">
            <span className="text-xs font-bold text-slate-200 block mb-3 font-sans">📄 厂区无组织治理(加压洗车、微尘水雾发生、电除尘器脉冲)过程台账记录</span>
            
            <div className="overflow-x-auto max-h-[220px]">
              <table className="w-full text-left text-xs border-collapse font-mono">
                <thead>
                  <tr className="border-b border-slate-900 text-slate-500">
                    <th className="py-2 px-1">执行激发时间</th>
                    <th className="py-2 px-1">降尘终端器名</th>
                    <th className="py-2 px-1">重污染除尘覆盖点位</th>
                    <th className="py-2 px-1 text-center">水雾激洒时长</th>
                    <th className="py-2 px-1 text-right">消耗循环水量</th>
                    <th className="py-2 px-1">系统触发成因</th>
                    <th className="py-2 px-1 text-center">除尘拦截成效 (PM降幅)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900 text-slate-400">
                  {treatmentEventLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-900/20">
                      <td className="py-2.5 px-1 text-slate-450">{log.time}</td>
                      <td className="py-2.5 px-1 font-sans font-semibold text-slate-200">{log.machineName}</td>
                      <td className="py-2.5 px-1 font-sans text-slate-450">{log.targetNode}</td>
                      <td className="py-2.5 px-1 text-center text-teal-400">{log.duration}</td>
                      <td className="py-2.5 px-1 text-right text-cyan-400 font-bold">{log.waterVolume}</td>
                      <td className="py-2.5 px-1 text-slate-500 truncate max-w-[130px]" title={log.triggerReason}>
                        {log.triggerReason}
                      </td>
                      <td className="py-2.5 px-1 text-center text-emerald-400 font-bold">{log.efficiency}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------
          SUB-TAB 6: 无组织监控过程记录 (CCTV & Plate Reader)
          ---------------------------------------------------- */}
      {activeSubTab === "cctv_records" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            
            {/* Left Col: Master-Detail CCTV multiplex with overlaid frame controls */}
            <div className="lg:col-span-2 bg-slate-950 border border-slate-900 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-indigo-400 block mb-2.5 font-mono">🎥 高空及物料死角无组织扬尘在线视频联动哨卡</span>
                
                {/* Simulated Monitor display wall inside industrial frame */}
                <div className="rounded-xl border border-indigo-900/60 bg-slate-950 p-2 shadow-inner relative overflow-hidden">
                  <div className="h-[210px] w-full bg-slate-900 rounded relative overflow-hidden flex items-center justify-center">
                    
                    {/* Background realistic CCTV photo placeholder with overlay gridlines */}
                    <img
                      src="https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800&auto=format&fit=crop&q=80"
                      alt="CCTV stream placeholder"
                      className="absolute inset-0 h-full w-full object-cover opacity-60 filter grayscale brightness-75 contrast-125"
                      referrerPolicy="no-referrer"
                    />

                    {/* Scanning CRT overlay effect */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_4px,3px_100%] pointer-events-none" />

                    {/* Camera indicator HUD labels overlays */}
                    <div className="absolute top-2 left-2 text-[9px] font-mono text-emerald-400 bg-slate-950/80 px-2 py-0.5 rounded leading-none flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-ping" />
                      REC 【{cameraCatalog.find((c) => c.id === selectedCameraId)?.tag || "GATE_NORTH"}】
                    </div>

                    <div className="absolute top-2 right-2 text-[9px] font-mono text-slate-400 bg-slate-950/80 px-2 py-0.5 rounded leading-none">
                      ZOOM: {zoomLevel.toFixed(1)}x
                    </div>

                    <div className="absolute bottom-2 left-2 text-[9px] font-mono text-cyan-400 bg-slate-950/80 px-2 py-0.5 rounded leading-none">
                      PAN: {panAngle.pan}° / TILT: {panAngle.tilt}°
                    </div>

                    <div className="absolute bottom-2 right-2 text-[9px] font-mono text-slate-400 bg-slate-950/80 px-2 py-0.5 rounded leading-none flex items-center gap-1">
                      <Clock className="h-3 w-3 text-emerald-450" />
                      <span>{new Date().toISOString().substring(11, 19)}</span>
                      <span className="text-slate-500">2026-06-03</span>
                    </div>

                    {/* On-screen visual box crosshair focus */}
                    <div className="h-16 w-16 border border-dashed border-red-500/60 pointer-events-none absolute" />

                    {/* PTZ tactile buttons overlays */}
                    <div className="absolute right-3 bottom-10 flex flex-col gap-1 z-30">
                      <button
                        onClick={() => setPanAngle((prev) => ({ ...prev, tilt: Math.min(prev.tilt + 5, 90) }))}
                        className="bg-slate-950/90 text-slate-300 border border-slate-800 rounded p-1 font-bold text-[9px] hover:text-white"
                        title="Tilt Up"
                      >
                        ▲
                      </button>
                      <div className="flex gap-1">
                        <button
                          onClick={() => setPanAngle((prev) => ({ ...prev, pan: prev.pan - 10 }))}
                          className="bg-slate-950/90 text-slate-300 border border-slate-800 rounded p-1 font-bold text-[9px] hover:text-white"
                          title="Pan Left"
                        >
                          ◀
                        </button>
                        <button
                          onClick={() => setPanAngle((prev) => ({ ...prev, pan: prev.pan + 10 }))}
                          className="bg-slate-950/90 text-slate-300 border border-slate-800 rounded p-1 font-bold text-[9px] hover:text-white"
                          title="Pan Right"
                        >
                          ▶
                        </button>
                      </div>
                      <button
                        onClick={() => setPanAngle((prev) => ({ ...prev, tilt: Math.max(prev.tilt - 5, 0) }))}
                        className="bg-slate-950/90 text-slate-300 border border-slate-800 rounded p-1 font-bold text-[9px] hover:text-white"
                        title="Tilt Down"
                      >
                        ▼
                      </button>
                    </div>
                  </div>
                </div>

                {/* CCTV Selector Grid */}
                <div className="grid grid-cols-2 gap-2 mt-3.5 text-xs">
                  {cameraCatalog.map((cam) => (
                    <button
                      key={cam.id}
                      onClick={() => {
                        setSelectedCameraId(cam.id);
                        showToast(`📡 已成功定向接入无组织高清音视频哨卡: ${cam.name}`);
                      }}
                      className={`p-2 rounded border text-left transition-all cursor-pointer ${
                        selectedCameraId === cam.id
                          ? "bg-slate-900 border-indigo-500 text-indigo-300"
                          : "bg-slate-950 border-slate-900 text-slate-500 hover:border-slate-850"
                      }`}
                    >
                      <span className="font-bold block tracking-tight truncate">{cam.name}</span>
                      <span className="text-[9px] font-mono block text-slate-600 truncate mt-0.5">分区: {cam.area}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-between gap-3 mt-4 pt-3.5 border-t border-slate-900/40 text-xs">
                <button
                  onClick={captureActiveCctvSnapshot}
                  className="bg-indigo-950 hover:bg-indigo-900 text-indigo-300 border border-indigo-850 rounded px-4 py-2 flex items-center gap-1 cursor-pointer font-bold flex-1 justify-center shadow-lg"
                >
                  📸 抓拍该画面生成车辆尾气与黑烟透光比对图 (OCR)
                </button>
              </div>
            </div>

            {/* Right Col: AI license plate list and captured snapshots */}
            <div className="bg-slate-950 border border-slate-900 rounded-xl p-4 flex flex-col justify-between min-h-[350px]">
              <div>
                <span className="text-xs font-bold text-slate-200 block border-b border-slate-900 pb-2 mb-3 uppercase font-sans">
                  🚗 本次抓拍OCR识别及黑烟异常比对归档 (双流体烟雾计度)
                </span>

                <div className="space-y-3.5 max-h-[290px] overflow-y-auto pr-1">
                  {snapshots.map((sn) => (
                    <div key={sn.id} className="bg-slate-900/50 p-3 rounded-lg border border-slate-900 text-xs font-mono space-y-2 flex gap-3">
                      <div className="h-16 w-20 bg-slate-850 rounded overflow-hidden relative border border-slate-800 shrink-0">
                        <img src={sn.imageUrl} alt="Snapshot thumbnail" className="h-full w-full object-cover filter grayscale contrast-125" referrerPolicy="no-referrer" />
                      </div>
                      
                      <div className="space-y-1 text-[10.5px]">
                        <p><strong className="text-indigo-400">{sn.camName}</strong></p>
                        <p className="text-slate-500">截帧时间: <span className="text-slate-300">{sn.time}</span></p>
                        {sn.ocrPlate && <p>🔍 OCR 车牌识别: <span className="text-emerald-400 font-bold bg-emerald-950/40 border border-emerald-900 px-1 py-0.2 rounded font-mono">{sn.ocrPlate}</span></p>}
                        {sn.blackSmokeIndex && <p>🌫️ 黑烟 Ringelmann: <span className="text-cyan-400 font-bold">{sn.blackSmokeIndex}</span></p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900/40 p-2 border border-slate-900 rounded text-[9px] text-slate-500 font-mono text-center mt-3">
                搭载 50G-ops 近端黑烟识别专用算法，过滤气泡与普通高架防结冰蒸汽。
              </div>
            </div>

          </div>

          {/* Heavy logistics vehicles log */}
          <div className="bg-slate-950 border border-slate-900 rounded-xl p-4">
            <span className="text-xs font-bold text-slate-200 block mb-3 font-sans">📄 近24小时进入无组织区（矿石及散装骨料大门）重载卸料卡车冲洗及排烟识别记录清单</span>
            <div className="overflow-x-auto max-h-[180px]">
              <table className="w-full text-left text-xs border-collapse font-mono">
                <thead>
                  <tr className="border-b border-slate-900 text-slate-500">
                    <th className="py-2 px-1">车辆经过时间</th>
                    <th className="py-2 px-1">重卡车牌代码</th>
                    <th className="py-2 px-1">出厂排放标准</th>
                    <th className="py-2 px-1 text-center">车轮自动高压强洗反馈</th>
                    <th className="py-2 px-1">卡车载重量 (T)</th>
                    <th className="py-2 px-1">所载货品名</th>
                    <th className="py-2 px-1 text-center font-sans">林格曼黑烟比对检测</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900 text-slate-400">
                  {[
                    { time: "10:34:10", plate: "云A·3V84N", std: "国六排放 (National VI)", wash: "✔ 自动冲洗2.5分钟已通车", weight: 48, cargo: "石灰石碎石", smoke: "0级 (正常无色)" },
                    { time: "10:14:02", plate: "辽B·8C915", std: "国五排放 (National V)", wash: "✔ 自动冲洗2.0分钟已通车", weight: 52, cargo: "生粘土辅料", smoke: "0级 (无起效灰烟)" },
                    { time: "09:58:20", plate: "苏E·U009C", std: "新能源 (New Energy EV)", wash: "✔ 减速通过免冲(无泥尘)", weight: 45, cargo: "熟料散货", smoke: "纯电能 (零尾气排放)" },
                    { time: "09:24:55", plate: "陕A·88F28", std: "重载老国四 (Below V)", wash: "✔ 异常二次滞留深度冲刷", weight: 50, cargo: "原煤散货", smoke: "0.5级 (局部带灰微烟)" },
                  ].map((car, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/20">
                      <td className="py-2.5 px-1 text-slate-500">{car.time}</td>
                      <td className="py-2.5 px-1 font-bold text-slate-200">{car.plate}</td>
                      <td className="py-2.5 px-1 text-slate-450 text-[11px]">{car.std}</td>
                      <td className="py-2.5 px-1 text-center text-emerald-400">{car.wash}</td>
                      <td className="py-2.5 px-1 text-right text-cyan-400">{car.weight} 吨</td>
                      <td className="py-2.5 px-1 font-sans text-slate-400">{car.cargo}</td>
                      <td className="py-2.5 px-1 text-center">
                        <span className="inline-flex px-1.5 py-0.2 rounded text-[10px] bg-emerald-950 text-emerald-450 border border-emerald-900">
                          {car.smoke}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
