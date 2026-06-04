/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  CemsStack,
  DustSensor,
  DeviceStatusLog,
  AlarmItem,
  UnorganizedSource,
  GateRecord,
  CleaningVehicle,
} from "./types";
import {
  initialCemsStacks,
  initialDenitrationLogs,
  initialDcsParameters,
  initialDustSensors,
  initialDeviceLogs,
  initialAlarms,
  initialUnorganizedSources,
  initialGateRecords,
  initialCleaningVehicles,
  perturbCems,
  perturbDust,
  perturbCleaningVehicles,
} from "./data/mockData";

// Subpages components imports
import GisMap from "./components/GisMap";
import DashboardStats from "./components/DashboardStats";
import OrganizedEmissions from "./components/OrganizedEmissions";
import UnorganizedEmissions from "./components/UnorganizedEmissions";
import CleanTransport from "./components/CleanTransport";
import VideoSurveillance from "./components/VideoSurveillance";
import SmartControl from "./components/SmartControl";
import DataManagementSystem from "./components/DataManagementSystem";

// Lucide Icons imports
import {
  Compass,
  Wind,
  Droplet,
  Truck,
  Video,
  Database,
  Terminal,
  Activity,
  UserCheck,
  RotateCw,
  Sun,
  CloudSun,
  Clock,
  CheckCircle,
  AlertTriangle,
  X,
  Zap,
} from "lucide-react";

export default function App() {
  // Page Tab state
  const [activeTab, setActiveTab] = useState<"gis" | "organized" | "unorganized" | "transport" | "video" | "smart" | "data_mgmt">("gis");

  // Core mutable telemetry state
  const [cemsStacks, setCemsStacks] = useState<CemsStack[]>(initialCemsStacks);
  const [dustSensors, setDustSensors] = useState<DustSensor[]>(initialDustSensors);
  const [cleaningVehicles, setCleaningVehicles] = useState<CleaningVehicle[]>(initialCleaningVehicles);
  const [deviceLogs, setDeviceLogs] = useState<DeviceStatusLog[]>(initialDeviceLogs);
  const [alarms, setAlarms] = useState<AlarmItem[]>(initialAlarms);
  const [unorganizedSources, setUnorganizedSources] = useState<UnorganizedSource[]>(initialUnorganizedSources);
  const [gateRecords, setGateRecords] = useState<GateRecord[]>(initialGateRecords);

  // Console log entries running ledger
  const [consoleLogs, setConsoleLogs] = useState<string[]>([
    "[系统初始化] 华新禄劝超低排放管控平台已成功挂载服务。",
    "[通讯建立] 成功连通高架CEMS、微观扬尘监测站。采样频率MODBUS-TCP @ 2000ms",
    "[通讯建立] 自动重卡排空监测探针 OCR 道闸系统已就位。",
    "[保洁系统] 北斗/GPS 高精度RTK特种保洁清洁卡双向指令环就绪。"
  ]);

  // Clock state
  const [currentTime, setCurrentTime] = useState(new Date());

  // Alarm modal control states
  const [showAlarmsPanel, setShowAlarmsPanel] = useState(false);
  const [alarmsFilterTab, setAlarmsFilterTab] = useState<"all" | "active" | "resolved">("active");

  const addConsoleLog = (message: string) => {
    const timeStr = new Date().toLocaleTimeString();
    setConsoleLogs((prev) => [`[${timeStr}] ${message}`, ...prev.slice(0, 40)]);
  };

  // Handle resolving an alarm with linked reactive telemetry state updates
  const handleResolveAlarm = (alarmId: string) => {
    const formattedTime = new Date().toLocaleTimeString();
    
    setAlarms((prev) =>
      prev.map((alm) => {
        if (alm.id === alarmId) {
          addConsoleLog(`[级联消缺联动] 手动排查闭环保自监告警: [${alm.name}]`);
          
          // Reactive links to drift sensors back into normal ranges
          if (alarmId === "alm-1" || alm.name.includes("粉尘浓度超标")) {
            // Restore dust-6 sensor to safety
            setDustSensors((prevDust) =>
              prevDust.map((ds) =>
                ds.id === "dust-6"
                  ? { ...ds, pm10: 38, pm25: 12, tsp: 52, status: "normal" }
                  : ds
              )
            );
            addConsoleLog("[联动治污] 熟料大棚负压抑尘除烟风机正常工作，10/10m风速重起，粉尘测值收束为 38ug/m³");
          }

          if (alarmId === "alm-2" || alm.name.includes("离线") || alm.name.includes("故障")) {
            // Restore device logs and sensor
            setDeviceLogs((prevLogs) =>
              prevLogs.map((dl) =>
                dl.id === "devlog-6"
                  ? { ...dl, status: "normal", voltage: 220, current: 3.2, powerCons: 8.5 }
                  : dl
              )
            );
            setDustSensors((prevDust) =>
              prevDust.map((ds) =>
                ds.id === "dust-6" && ds.status === "error"
                  ? { ...ds, status: "normal" }
                  : ds
              )
            );
            addConsoleLog("[联动诊断] 熟料圆库出口检测下位终端物理重连，4-20mA高抗信号总线校验返回正常电压");
          }

          return {
            ...alm,
            status: "resolved",
            endTime: new Date().toLocaleDateString() + " " + formattedTime,
          };
        }
        return alm;
      })
    );
  };

  // Dynamic random emergency simulator trigger
  const handleGenerateRandomAlarm = () => {
    const randomId = `alm-sim-${Date.now().toString().slice(-4)}`;
    const alarmScenarios = [
      {
        type: "overshoot_alarm" as const,
        name: "窑尾布袋除尘器B室滤袋破损泄露警告",
        location: "2#回转窑尾除尘箱二号漏斗区",
        level: "critical" as const,
        description: "激光浊度透光率测值骤降至 84.5%，检测通道粉尘分排尘瞬时飞跃至 18.5mg/m³"
      },
      {
        type: "production_fault" as const,
        name: "熟料篦冷机降温一号强冷风机断电跳闸",
        location: "篦冷机出料高压配电柜3号间",
        level: "major" as const,
        description: "电机定子过热瞬时达到 115℃，低压漏电继电器联动跳脱保护"
      },
      {
        type: "treatment_fault" as const,
        name: "氨水库密闭装料管道铅封法兰轻微渗氨",
        location: "西侧脱硝氨水卸药总库槽柜",
        level: "minor" as const,
        description: "4-20mA 防爆气敏探头防爆红线2.0ppm超限，瞬测 3.2ppm，已联动事故旁漏风闸"
      }
    ];

    const chosen = alarmScenarios[Math.floor(Math.random() * alarmScenarios.length)];
    const newAlarm: AlarmItem = {
      id: randomId,
      type: chosen.type,
      name: chosen.name,
      location: chosen.location,
      startTime: new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString(),
      endTime: null,
      status: "active",
      level: chosen.level,
      description: chosen.description
    };

    setAlarms((prev) => [newAlarm, ...prev]);
    addConsoleLog(`[突发环保预警] 模拟网络新增异常: [${chosen.name}]！数据流安全标记告警活跃！`);
  };

  // 1. Simulation Background Loop: Drift values to make dashboard live
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());

      // Drift CEMS stacks values
      setCemsStacks((prev) => perturbCems(prev));

      // Drift Dust PM values
      setDustSensors((prev) => perturbDust(prev));

      // Coordinate tracking move on GPS
      setCleaningVehicles((prev) => perturbCleaningVehicles(prev));

    }, 4000);

    return () => clearInterval(timer);
  }, []);

  // 2. Scheduled logger reminder just to simulate active network checks
  useEffect(() => {
    const logTimer = setInterval(() => {
      const activeCemsCount = cemsStacks.filter(c => c.status === "running").length;
      const warningSensors = dustSensors.filter(d => d.status === "error" || d.status === "warning").length;
      
      const randomMsg = [
        `[状态核验] 全厂高空烟尘自动在线传输率保持 93.4%，通讯连通度100%。`,
        `[环保联动] 网格探针校验：厂内粉尘颗粒度正常，未见大宗越度指标。`,
        `[DCS联动] 熟料生产回转窑喂料正常运作中。喂料总量: 380t/h。`,
        `[保洁巡检] ${cleaningVehicles.filter(v => v.status === "working").length}部移动路面强扫车正在GPS联动路段深度清洁。`,
        warningSensors > 0 
          ? `[预警分析] 当前厂内有 ${warningSensors} 处监测点显示浓度过高，相关区域联动降尘设备正自动补水。`
          : `[指数通报] 空气净化成效卓越：厂区均PM10低于 50ug/m³，高于国家A级标杆标准。`
      ];

      const chosen = randomMsg[Math.floor(Math.random() * randomMsg.length)];
      addConsoleLog(chosen);

    }, 12000);

    return () => clearInterval(logTimer);
  }, [cemsStacks, dustSensors, cleaningVehicles]);

  // --- INTERACTION MUTATORS ---

  // Trigger CEMS bypass valve opening
  const handleTriggerBypass = (id: string, status: "open" | "closed" | "sealed") => {
    setCemsStacks((prev) =>
      prev.map((stack) => {
        if (stack.id === id) {
          const changed = { ...stack, bypassStatus: status };
          addConsoleLog(
            `[旁路隔离监管] 排污排口 ${stack.name} 旁通阀状态变更为: [${
              status === "open" ? "紧急开启！" : status === "closed" ? "封锁铅印" : "全自闭闭锁"
            }]`
          );
          return changed;
        }
        return stack;
      })
    );
  };

  // Trigger active unorganized spraying sprinklers
  const handleTriggerTreatment = (id: string, active: boolean) => {
    setUnorganizedSources((prev) =>
      prev.map((src) => {
        if (src.id === id) {
          addConsoleLog(
            `[治污干预] 抑尘系统：${src.name} 辅抑装置 -> [${active ? "强启喷水中" : "停止运行"}]`
          );
          // Drop dust amount heavily if turned on
          const nextPm = active ? Math.max(12, Math.floor(src.pm10Value * 0.25)) : Math.floor(src.pm10Value * 3);
          return { ...src, treatmentStatus: active ? "active" : "inactive", pm10Value: nextPm };
        }
        return src;
      })
    );
  };

  // Manual spray gun drop dust PM10
  const handleMitigateDust = (sensorId: string) => {
    setDustSensors((prev) =>
      prev.map((sensor) => {
        if (sensor.id === sensorId) {
          addConsoleLog(
            `[就地一键降尘] 成功触发对点防线保洁：${sensor.name} 重尘指标瞬间泄减`
          );
          return {
            ...sensor,
            pm10: Math.max(15, Math.floor(sensor.pm10 * 0.3)),
            pm25: Math.max(5, Math.floor(sensor.pm25 * 0.4)),
            tsp: Math.max(22, Math.floor(sensor.tsp * 0.35)),
            status: "normal" as const
          };
        }
        return sensor;
      })
    );
  };

  // Manual Override Approve vehicle at gates
  const handleManualApproveGate = (recordId: string) => {
    setGateRecords((prev) =>
      prev.map((record) => {
        if (record.id === recordId) {
          addConsoleLog(`[门禁人工特批] 车牌 [${record.plateNumber}] 已由环保安全主管手动放行。`);
          return { ...record, approved: true };
        }
        return record;
      })
    );
  };

  // Dispatch cleaning street sweepers
  const handleDispatchVehicle = (vehicleId: string, status: "working" | "idle") => {
    setCleaningVehicles((prev) =>
      prev.map((v) => {
        if (v.id === vehicleId) {
          addConsoleLog(
            `[北斗保洁调度] 终端指令机 -> [${v.name}] 位置航线调整为: [${
              status === "working" ? "联动路段极速环卫作业" : "任务完成，回航补水整备"
            }]`
          );
          return { ...v, status, speed: status === "working" ? 15 : 0 };
        }
        return v;
      })
    );
  };

  // Active items hover links to show pinpoint selectors
  const handleSelectCems = (cems: CemsStack) => {
    addConsoleLog(`[双击定位] 载入在线有组织CEMS测流通道: ${cems.name}`);
  };

  const handleSelectDust = (dust: DustSensor) => {
    addConsoleLog(`[双击定位] 载入无组织粉尘微环境网格剖面: ${dust.name}`);
  };

  const handleSelectVehicle = (vehicle: CleaningVehicle) => {
    addConsoleLog(`[双击定位] 载入动态环卫微粒探测车辆: ${vehicle.name}`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between overflow-x-hidden p-3 antialiased">
      
      {/* 1. TOP INDUSTRIAL PLATFORM CONTROL HEADER */}
      <header
        id="unified-control-dashboard-header"
        className="relative rounded-xl border border-blue-900/30 bg-slate-900/60 shadow-xl px-4 py-3 mb-3 flex flex-wrap items-center justify-between gap-4 select-none"
      >
        {/* Glow decorative backdrop */}
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />

        {/* Brand Left: Power button + Climate */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <button
            onClick={() => {
              if (confirm("是否确认离线并注销当前智慧环保系统会话？")) {
                alert("管理员会话注销，系统进入守护运行态。");
              }
            }}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-950/40 border border-red-800/50 hover:bg-red-900 text-red-400 cursor-pointer shadow-lg transition-all"
            title="关闭注销"
          >
            <Activity className="h-4.5 w-4.5" />
          </button>
          
          <div className="flex items-center gap-2 bg-slate-950/80 px-3 py-1.5 rounded border border-slate-900 leading-none">
            <CloudSun className="h-4.5 w-4.5 text-amber-500 animate-pulse" />
            <div>
              <span className="text-slate-200 block font-bold text-xs">37℃ • 多云</span>
              <span className="text-[8px] text-slate-500 font-sans block mt-0.5">厂区局部气候</span>
            </div>
          </div>
        </div>

        {/* Center Name: Screenshot Style Banner Header with Brackets Decals */}
        <div className="text-center flex flex-col items-center">
          <div className="flex items-center gap-4 text-cyan-400">
            <span className="font-mono text-cyan-600/60 text-sm hidden sm:inline">&lt;&lt;&lt;&lt;&lt;&lt;&lt;</span>
            <h1 className="font-sans text-2xl font-black text-slate-100 uppercase tracking-widest leading-none drop-shadow-md">
              超低排放管控一体化软件平台
            </h1>
            <span className="font-mono text-cyan-600/60 text-sm hidden sm:inline">&gt;&gt;&gt;&gt;&gt;&gt;&gt;</span>
          </div>
          <p className="text-[9px] text-slate-400 font-sans tracking-widest mt-1">
            华新禄劝水泥智慧环保管理系统 • 一体化虚拟监控中心
          </p>
        </div>

        {/* Right Info: Clock, Date, Notification Bell */}
        <div className="flex items-center gap-4 text-xs font-mono">
          
          {/* Notification Warning Alarm Icon */}
          <div className="relative group/alarm select-none">
            {/* The Notification Icon Button with specific name, triggers alarm info popup when clicked */}
            <button
              onClick={() => setShowAlarmsPanel(true)}
              className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-rose-950/30 border border-rose-800/40 text-rose-400 hover:bg-rose-900/60 hover:text-rose-200 transition-all cursor-pointer shadow-lg outline-none"
              title="全厂环保是在线实时告警中枢"
              id="alarm-trigger-indicator-button"
            >
              <Activity className="h-4.5 w-4.5 animate-pulse text-rose-400" />
              {alarms.filter(a => a.status === "active").length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-rose-600 text-[8.5px] font-extrabold text-slate-100 flex items-center justify-center border border-slate-950 animate-bounce">
                  {alarms.filter(a => a.status === "active").length}
                </span>
              )}
            </button>

            {/* Floating CSS Tooltip showing the precise name of the icon button on hover */}
            <div className="absolute right-0 top-full mt-2 hidden group-hover/alarm:block bg-slate-900 border border-rose-500/40 text-rose-300 text-[11px] font-sans rounded-md px-3 py-1.5 whitespace-nowrap z-[110] shadow-2xl font-bold">
              环境保护实时异常告警总线
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-950/80 px-3 py-1.5 rounded border border-slate-900 leading-none">
            <Clock className="h-4.5 w-4.5 text-cyan-400" />
            <div>
              <span className="text-slate-200 block text-xs font-bold font-mono">
                {currentTime.toLocaleTimeString()}
              </span>
              <span className="text-[8px] text-slate-500 block mt-0.5">2026年06月02日 星期五</span>
            </div>
          </div>
        </div>
      </header>

      {/* Futuristic Nav Tabs Sub-Header Menu for page switches */}
      <nav className="flex flex-wrap items-center justify-center rounded-lg bg-slate-950/80 p-1.5 mb-3 border border-slate-900 text-xs gap-1.5">
        <button
          onClick={() => setActiveTab("gis")}
          className={`flex items-center gap-1.5 rounded px-4 py-2 font-sans font-semibold tracking-wide transition-all cursor-pointer ${
            activeTab === "gis"
              ? "bg-cyan-950 text-cyan-400 font-bold border border-cyan-800/40 shadow-sm"
              : "text-slate-400 hover:text-slate-200 border border-transparent"
          }`}
        >
          <Compass className="h-4 w-4" />
          <span>三维管控一张图</span>
        </button>

        <button
          onClick={() => setActiveTab("organized")}
          className={`flex items-center gap-1.5 rounded px-4 py-2 font-sans font-semibold tracking-wide transition-all cursor-pointer ${
            activeTab === "organized"
              ? "bg-cyan-950 text-cyan-400 font-bold border border-cyan-800/40 shadow-sm"
              : "text-slate-400 hover:text-slate-200 border border-transparent"
          }`}
        >
          <Wind className="h-4 w-4" />
          <span>有组织废气监测</span>
        </button>

        <button
          onClick={() => setActiveTab("unorganized")}
          className={`flex items-center gap-1.5 rounded px-4 py-2 font-sans font-semibold tracking-wide transition-all cursor-pointer ${
            activeTab === "unorganized"
              ? "bg-cyan-950 text-cyan-400 font-bold border border-cyan-800/40 shadow-sm"
              : "text-slate-400 hover:text-slate-200 border border-transparent"
          }`}
        >
          <Droplet className="h-4 w-4" />
          <span>无组织抑尘监测</span>
        </button>

        <button
          onClick={() => setActiveTab("transport")}
          className={`flex items-center gap-1.5 rounded px-4 py-2 font-sans font-semibold tracking-wide transition-all cursor-pointer ${
            activeTab === "transport"
              ? "bg-cyan-950 text-cyan-400 font-bold border border-cyan-800/40 shadow-sm"
              : "text-slate-400 hover:text-slate-200 border border-transparent"
          }`}
        >
          <Truck className="h-4 w-4" />
          <span>大宗清洁运输台账</span>
        </button>

        <button
          onClick={() => setActiveTab("video")}
          className={`flex items-center gap-1.5 rounded px-4 py-2 font-sans font-semibold tracking-wide transition-all cursor-pointer ${
            activeTab === "video"
              ? "bg-cyan-950 text-cyan-400 font-bold border border-cyan-800/40 shadow-sm"
              : "text-slate-400 hover:text-slate-200 border border-transparent"
          }`}
        >
          <Video className="h-4 w-4" />
          <span>厂区视频监控</span>
        </button>

        <button
          onClick={() => setActiveTab("smart")}
          className={`flex items-center gap-1.5 rounded px-4 py-2 font-sans font-semibold tracking-wide transition-all cursor-pointer ${
            activeTab === "smart"
              ? "bg-cyan-950 text-cyan-400 font-bold border border-cyan-800/40 shadow-sm"
              : "text-slate-400 hover:text-slate-200 border border-transparent"
          }`}
        >
          <Database className="h-4 w-4" />
          <span>智能管控</span>
        </button>

        <button
          onClick={() => setActiveTab("data_mgmt")}
          className={`flex items-center gap-1.5 rounded px-4 py-2 font-sans font-semibold tracking-wide transition-all cursor-pointer ${
            activeTab === "data_mgmt"
              ? "bg-cyan-950 text-cyan-400 font-bold border border-cyan-800/40 shadow-sm"
              : "text-slate-400 hover:text-slate-200 border border-transparent"
          }`}
        >
          <Database className="h-4 w-4 animate-pulse text-cyan-530 text-cyan-400" />
          <span>数据管理系统</span>
        </button>
      </nav>

      {/* 2. MAIN ACTIVE SEGMENT SWITCHBOARD WORKSPACE */}
      <main className="flex-1 min-h-0 relative mb-3">
        {/* Switched view container */}
        <div className="h-full w-full">
          {activeTab === "gis" && (
            <GisMap
              cemsStacks={cemsStacks}
              dustSensors={dustSensors}
              cleaningVehicles={cleaningVehicles}
              deviceLogs={deviceLogs}
              onSelectCems={handleSelectCems}
              onSelectDust={handleSelectDust}
              onSelectVehicle={handleSelectVehicle}
            />
          )}

          {activeTab === "organized" && (
            <OrganizedEmissions
              cemsStacks={cemsStacks}
              denitrationLogs={initialDenitrationLogs}
              dcsParameters={initialDcsParameters}
              onTriggerBypass={handleTriggerBypass}
            />
          )}

          {activeTab === "unorganized" && (
            <UnorganizedEmissions
              dustSensors={dustSensors}
              deviceLogs={deviceLogs}
              alarms={alarms}
              unorganizedSources={unorganizedSources}
              onTriggerTreatment={handleTriggerTreatment}
              onMitigateDust={handleMitigateDust}
            />
          )}

          {activeTab === "transport" && (
            <CleanTransport
              gateRecords={gateRecords}
              cleaningVehicles={cleaningVehicles}
              onManualApproveGate={handleManualApproveGate}
              onDispatchVehicle={handleDispatchVehicle}
            />
          )}

          {activeTab === "video" && (
            <VideoSurveillance />
          )}

          {activeTab === "smart" && (
            <SmartControl
              onAddLogMessage={addConsoleLog}
            />
          )}

          {activeTab === "data_mgmt" && (
            <DataManagementSystem
              onAddLogMessage={addConsoleLog}
            />
          )}
        </div>
      </main>

      {/* 3. FOOTER RUNTIME CONSOLE LOGGER AND SYSTEM TELEMETRY */}
      <footer id="unified-terminal-scrolling-bar" className="rounded-xl border border-blue-900/40 bg-slate-900/40 p-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-black/60 p-2.5 rounded-lg border border-slate-900 text-xs">
          
          <div className="flex items-start gap-2.5 flex-1 select-none">
            <div className="rounded bg-sky-950 p-1.5 border border-sky-800 text-cyan-400 mt-0.5">
              <Terminal className="h-4.5 w-4.5 animate-pulse" />
            </div>
            
            <div className="flex-1 min-w-0">
              <span className="font-sans text-[10.5px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                华新禄劝生产与脱硝排放在线仿真中继控制台
              </span>
              {/* Scroller displays current leading operations */}
              <div className="h-8 overflow-y-auto font-mono text-[11px] text-slate-350 pr-2 divide-y divide-slate-900/60 leading-normal">
                {consoleLogs.map((log, idx) => (
                  <p key={idx} className="py-0.5 truncate text-[10.5px]" style={{ opacity: Math.max(0.2, 1 - idx * 0.25) }}>
                    {log}
                  </p>
                ))}
              </div>
            </div>
          </div>

          {/* Core connection states checklist */}
          <div className="flex items-center gap-4 text-xs font-mono border-l border-slate-900 pl-4">
            <div className="flex items-center gap-1.5">
              <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-slate-400">物联网通道: <b className="text-slate-100 font-bold">已连结</b></span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-slate-400">数据自证率: <b className="text-slate-100 font-bold">100%</b></span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-[11px] text-emerald-400 font-sans font-medium">超低 A 级功耗</span>
            </div>
          </div>

        </div>

        {/* Corporate bottom credit */}
        <div className="mt-2.5 text-center text-[10px] text-slate-600 font-mono">
          <span>华新禄劝水泥智慧环保数据系统 © 2026 HUAXIN LIME-CEMENT GROUP. ALL RIGHTS RESERVED.</span>
        </div>
      </footer>

      {/* 4. REAL-TIME ENVIRONMENTAL ALARM MODAL OVERLAY */}
      {showAlarmsPanel && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-900/60 rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl relative flex flex-col max-h-[85vh] animate-fade-in text-slate-200">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-rose-950/40 to-slate-900 border-b border-slate-800 p-4.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-rose-950/80 text-rose-400 border border-rose-900/50">
                  <AlertTriangle className="h-5 w-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    全厂环保突发异常及超低排告警信息中枢
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    实时追溯高空烟囱废气、局部破碎无组织扬尘、电控设备在线通讯健康度等元数据
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAlarmsPanel(false)}
                className="p-1 px-2.5 py-1 text-xs text-slate-400 bg-slate-850 hover:bg-slate-800 hover:text-white rounded border border-slate-700 transition-all cursor-pointer"
                title="关闭面板"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Filter tab & actions */}
            <div className="p-3 bg-slate-900/60 border-b border-slate-800/80 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-900">
                <button
                  type="button"
                  onClick={() => setAlarmsFilterTab("active")}
                  className={`px-3 py-1.5 text-[11px] rounded transition-all cursor-pointer font-bold ${
                    alarmsFilterTab === "active"
                      ? "bg-rose-950/80 text-rose-400 border border-rose-900/40"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  活跃中 ({alarms.filter(a => a.status === "active").length})
                </button>
                <button
                  type="button"
                  onClick={() => setAlarmsFilterTab("resolved")}
                  className={`px-3 py-1.5 text-[11px] rounded transition-all cursor-pointer font-bold ${
                    alarmsFilterTab === "resolved"
                      ? "bg-slate-800 text-slate-300"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  已恢复 ({alarms.filter(a => a.status === "resolved").length})
                </button>
                <button
                  type="button"
                  onClick={() => setAlarmsFilterTab("all")}
                  className={`px-3 py-1.5 text-[11px] rounded transition-all cursor-pointer font-bold ${
                    alarmsFilterTab === "all"
                      ? "bg-slate-800 text-slate-300"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  全部履历 ({alarms.length})
                </button>
              </div>

              {/* Advanced diagnostic action: trigger simulated alarm */}
              <button
                type="button"
                onClick={handleGenerateRandomAlarm}
                className="px-3 py-1.5 rounded bg-slate-950 hover:bg-slate-850 text-rose-400 hover:text-rose-300 border border-slate-850 hover:border-rose-900/40 text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
              >
                <Zap className="h-3 w-3 text-amber-500" />
                模拟触发偶发异常
              </button>
            </div>

            {/* List block */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 max-h-[50vh]">
              {alarms.filter(a => alarmsFilterTab === "all" || a.status === alarmsFilterTab).length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs flex flex-col items-center justify-center gap-2">
                  <CheckCircle className="h-8 w-8 text-emerald-500/50" />
                  <p>没有找到对应类别的异常告警纪录</p>
                  <p className="text-[10px] text-slate-600">当前厂内超低排放各工艺、有组织监测及保洁闭环良好。</p>
                </div>
              ) : (
                alarms
                  .filter(a => alarmsFilterTab === "all" || a.status === alarmsFilterTab)
                  .map((item) => {
                    const isCritical = item.level === "critical";
                    const isMajor = item.level === "major";
                    const isActive = item.status === "active";

                    return (
                      <div
                        key={item.id}
                        className={`p-3.5 rounded-lg border transition-all ${
                          isActive
                            ? isCritical
                              ? "bg-rose-950/20 border-rose-900/60 shadow-[0_0_12px_rgba(239,68,68,0.06)]"
                              : isMajor
                              ? "bg-amber-950/15 border-amber-900/50 shadow-[0_0_12px_rgba(245,158,11,0.04)]"
                              : "bg-yellow-950/10 border-yellow-900/40"
                            : "bg-slate-950/30 border-slate-800/80 text-slate-400"
                        }`}
                      >
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap mb-1.5">
                              {/* Level Tag */}
                              <span
                                className={`text-[9px] px-1.5 py-0.5 rounded font-black tracking-wider leading-none font-sans uppercase border ${
                                  isCritical
                                    ? "bg-rose-950 text-rose-400 border-rose-900/40"
                                    : isMajor
                                    ? "bg-amber-950 text-amber-500 border-amber-900/30"
                                    : "bg-yellow-950 text-yellow-500 border-yellow-900/30"
                                }`}
                              >
                                {item.level === "critical" ? "重大/严重非控" : item.level === "major" ? "主要/设备异常" : "常规/轻微偏移"}
                              </span>

                              {/* Status Tag */}
                              <span
                                className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                                  isActive
                                    ? "bg-rose-600/10 text-rose-400 border border-rose-900/30 animate-pulse"
                                    : "bg-slate-800 text-slate-400"
                                }`}
                              >
                                {isActive ? "● 监控中(活跃)" : "✓ 已闭环排查"}
                              </span>

                              <span className="text-[10px] font-mono text-slate-500">
                                时间: {item.startTime}
                              </span>
                            </div>

                            <h4 className={`text-xs font-bold leading-relaxed ${isActive ? "text-slate-100 font-sans" : "text-slate-400"}`}>
                              {item.name}
                            </h4>
                          </div>

                          {/* Quick Resolve trigger */}
                          {isActive && (
                            <button
                              type="button"
                              onClick={() => handleResolveAlarm(item.id)}
                              className="px-2.5 py-1.5 rounded bg-slate-950 hover:bg-slate-850 text-emerald-400 hover:text-emerald-355 border border-slate-850 hover:border-emerald-950 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors shrink-0"
                            >
                              <CheckCircle className="h-3 w-3 text-emerald-500" />
                              人工销号
                            </button>
                          )}
                        </div>

                        <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] bg-black/40 p-2 rounded border border-slate-900/60 leading-relaxed font-mono">
                          <div>
                            <span className="text-slate-500">物理点位分配:</span>{" "}
                            <span className="text-slate-350">{item.location}</span>
                          </div>
                          <div>
                            <span className="text-slate-500">归属流向分类:</span>{" "}
                            <span className="text-slate-350">
                              {item.type === "overshoot_alarm" ? "超标排尘告警" :
                               item.type === "monitoring_fault" ? "在线自监通讯故障" :
                               item.type === "treatment_fault" ? "治污喷头机械欠压" : "DCS中继异常"}
                            </span>
                          </div>
                          {item.endTime && (
                            <div className="sm:col-span-2 text-emerald-400/80">
                              <span className="text-slate-500 font-normal">系统排消时间:</span> {item.endTime}
                            </div>
                          )}
                        </div>

                        <p className="mt-2.5 text-[10.5px] font-sans text-slate-400 leading-normal pl-1 border-l-2 border-slate-800">
                          {item.description}
                        </p>
                      </div>
                    );
                  })
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-950 p-3.5 border-t border-slate-800 flex justify-between items-center text-[10px]/relaxed">
              <span className="text-slate-500">
                华新绿环安全中枢已配置256位国密物理电控校验通道
              </span>
              <button
                type="button"
                onClick={() => setShowAlarmsPanel(false)}
                className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-750 hover:text-white rounded font-bold cursor-pointer transition-colors"
              >
                关闭面板
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
