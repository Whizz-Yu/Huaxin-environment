/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import {
  CemsStack,
  DustSensor,
  DeviceStatusLog,
  AlarmItem,
} from "../types";
import {
  BarChart,
  Bar,
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
  TrendingUp,
  Cpu,
  Tv,
  Wrench,
  Activity,
  AlertOctagon,
  ShieldAlert,
  ArrowUpRight,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { selectHourlyTrends, initialTransportStats } from "../data/mockData";

interface DashboardStatsProps {
  cemsStacks: CemsStack[];
  dustSensors: DustSensor[];
  deviceLogs: DeviceStatusLog[];
  alarms: AlarmItem[];
}

export default function DashboardStats({
  cemsStacks,
  dustSensors,
  deviceLogs,
  alarms,
}: DashboardStatsProps) {
  const hourlyData = selectHourlyTrends();

  // 1. Calculate device total aggregates
  // Monitoring devices
  const monitorTotal = deviceLogs.filter(d => d.deviceType === "monitoring").length + cemsStacks.length;
  const monitorNormal = deviceLogs.filter(d => d.deviceType === "monitoring" && d.status === "normal").length + cemsStacks.filter(c => c.status === "running").length;
  // Video devices
  const videoTotal = deviceLogs.filter(d => d.deviceType === "video").length + 7; // statically add some
  const videoNormal = deviceLogs.filter(d => d.deviceType === "video" && d.status === "normal").length + 7;
  // Treatment devices
  const treatmentTotal = deviceLogs.filter(d => d.deviceType === "treatment").length + 6;
  const treatmentNormal = deviceLogs.filter(d => d.deviceType === "treatment" && d.status === "normal").length + 5;

  // Active alarm tally
  const activeAlarmsCount = alarms.filter(a => a.status === "active").length;

  // 2. Calculated emission compliance: average pm and standard
  const runningCems = cemsStacks.filter(c => c.status === "running");
  const averagePm = runningCems.reduce((acc, cur) => acc + cur.pm, 0) / (runningCems.length || 1);
  const complianceRate = averagePm < 8 ? 100 : parseFloat(((10 - averagePm) / 10 * 100).toFixed(1));

  // 3. Environment averages for the cement gauges vs regional control
  const avgPm25 = Math.floor(dustSensors.reduce((acc, s) => acc + s.pm25, 0) / dustSensors.length);
  const avgPm10 = Math.floor(dustSensors.reduce((acc, s) => acc + s.pm10, 0) / dustSensors.length);
  const avgTsp = Math.floor(dustSensors.reduce((acc, s) => acc + s.tsp, 0) / dustSensors.length);

  // Government benchmark values (国控对照)
  const govPm25 = 35;
  const govPm10 = 70;
  const govTsp = 100;

  // Pie chart transport modes
  const transportData = [
    { name: "铁运 (列车输送)", value: 45, color: "#22d3ee" },
    { name: "水运及管带廊", value: 38, color: "#34d399" },
    { name: "国六高标车公路", value: 17, color: "#f59e0b" },
  ];

  return (
    <div className="space-y-4">
      {/* 2. Top-level Multi-panel Summary widget */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Module 1: 全厂设备汇总 */}
        <div id="stat-all-devices-summary" className="relative rounded-xl border border-blue-900/30 bg-slate-900/30 p-4">
          <div className="flex justify-between items-start mb-2">
            <span className="font-sans text-xs text-slate-400 font-medium">全厂设备汇总运行状态</span>
            <Cpu className="h-4.5 w-4.5 text-cyan-400" />
          </div>
          <div className="space-y-2 mt-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                环境监测设备 (CEMS)
              </span>
              <span className="font-mono text-slate-100 font-bold">
                {monitorNormal}/{monitorTotal} <span className="text-[10px] text-slate-500">正常</span>
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                全厂视频监控球机
              </span>
              <span className="font-mono text-slate-100 font-bold">
                {videoNormal}/{videoTotal} <span className="text-[10px] text-slate-500">连通</span>
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-teal-400" />
                环保降尘治污设备
              </span>
              <span className="font-mono text-slate-100 font-bold">
                {treatmentNormal}/{treatmentTotal} <span className="text-[10px] text-slate-500">运行</span>
              </span>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-900/80 flex justify-between items-center text-[10px]">
            <span className="text-slate-500">故障自查预警</span>
            <span className={`font-mono font-semibold px-1 rounded ${activeAlarmsCount > 0 ? "bg-red-950 text-red-400" : "bg-emerald-950 text-emerald-400"}`}>
              {activeAlarmsCount} 处活跃告警
            </span>
          </div>
        </div>

        {/* Module 2: 清洁运输比例 */}
        <div id="stat-clean-logistics" className="rounded-xl border border-blue-900/30 bg-slate-900/30 p-4">
          <div className="flex justify-between items-start mb-2">
            <span className="font-sans text-xs text-slate-400 font-medium">清洁方式运输(大宗及产品)</span>
            <TrendingUp className="h-4.5 w-4.5 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="font-mono text-2xl font-bold text-slate-100">{initialTransportStats.cleanRate}%</span>
            <span className="text-xs text-emerald-400 flex items-center">
              超越基准 +8.5%
            </span>
          </div>
          {/* Progress bar versus state benchmark standard 80% */}
          <div className="mt-3">
            <div className="flex justify-between text-[10px] text-slate-500 mb-1">
              <span>清洁占比 (国铁+皮带通廊+纯电)</span>
              <span>行业达标目标 80%</span>
            </div>
            <div className="relative h-2 w-full rounded bg-slate-950 overflow-hidden">
              <div className="absolute top-0 left-0 h-full bg-emerald-500" style={{ width: `${initialTransportStats.cleanRate}%` }} />
              <div className="absolute top-0 h-full border-r border-cyan-400/80 border-dashed" style={{ left: "80%" }} />
            </div>
          </div>
          <p className="text-[10.5px] font-mono text-slate-500 mt-2.5 leading-tight">
            汽运次数: <span className="text-slate-300 font-medium">{initialTransportStats.roadFrequency}次</span> | 铁货运次数: <span className="text-slate-300 font-medium">{initialTransportStats.ironFrequency}次</span>
          </p>
        </div>

        {/* Module 3: 排放达标率 & 自动传输率 */}
        <div id="stat-telemetry-compliance" className="rounded-xl border border-blue-900/30 bg-slate-900/30 p-4">
          <div className="flex justify-between items-start mb-2">
            <span className="font-sans text-xs text-slate-400 font-medium">CEMS 自动有效传输率</span>
            <Activity className="h-4.5 w-4.5 text-indigo-400" />
          </div>
          <div className="flex items-center gap-4 mt-2">
            <div>
              <span className="font-mono text-3xl font-bold text-indigo-400">93%</span>
              <p className="text-[10px] text-indigo-300 font-sans">网传时效率指标</p>
            </div>
            <div className="h-10 w-px bg-slate-900" />
            <div>
              <span className="font-mono text-2xl font-bold text-emerald-400">100%</span>
              <p className="text-[10px] text-emerald-300 font-sans">烟尘粉尘达标率</p>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-900/80 flex justify-between text-[10px] text-slate-500">
            <span>在线有组织采样点: 6 个</span>
            <span>无组织监测点: 10 个</span>
          </div>
        </div>

        {/* Module 4: 采样源平台统计 */}
        <div id="stat-sample-spots" className="rounded-xl border border-blue-900/30 bg-slate-900/30 p-4">
          <div className="flex justify-between items-start mb-1">
            <span className="font-sans text-xs text-slate-400 font-medium">有组织合规配置点</span>
            <Wrench className="h-4.5 w-4.5 text-amber-500" />
          </div>
          <div className="grid grid-cols-3 gap-2 text-center mt-3">
            <div className="rounded bg-slate-950 p-1.5 border border-slate-850/60">
              <span className="font-mono text-base font-bold text-cyan-400 block">12</span>
              <span className="text-[9px] text-slate-500 font-sans block">标准采样点</span>
            </div>
            <div className="rounded bg-slate-950 p-1.5 border border-slate-850/60">
              <span className="font-mono text-base font-bold text-emerald-400 block">20</span>
              <span className="text-[9px] text-slate-500 font-sans block">合格采样孔</span>
            </div>
            <div className="rounded bg-slate-950 p-1.5 border border-slate-850/60">
              <span className="font-mono text-base font-bold text-fuchsia-400 block">6</span>
              <span className="text-[9px] text-slate-500 font-sans block">高架采样平台</span>
            </div>
          </div>
          <p className="text-[9px] font-mono text-slate-500 mt-2.5 text-center leading-tight">
            所有物理排口及高架平台均架设安全爬梯与环保围护网
          </p>
        </div>

      </div>

      {/* 3. Lower Charts block */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Left Col: Average Environment values Gauge layout (平均环境数据仪表盘对比) */}
        <div id="panel-aqi-gauges" className="rounded-xl border border-blue-900/40 bg-slate-950 p-4 flex flex-col justify-between">
          <div className="border-b border-blue-950 pb-2 mb-3">
            <h3 className="font-sans text-xs font-semibold text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
              <ShieldAlert className="h-4 w-4" /> 平均环境数据与省国控站实时对比
            </h3>
            <p className="text-[10px] text-slate-500">仪表对比厂内平均与省国控监测背景数值</p>
          </div>

          <div className="space-y-4 py-2">
            {/* PM2.5 Gauge bar */}
            <div>
              <div className="flex justify-between items-end text-xs font-mono mb-1">
                <span className="text-slate-300 font-sans font-medium">PM 2.5 悬浮尘</span>
                <span>
                  厂内: <span className="text-emerald-400 font-bold">{avgPm25}</span> / 国站: <span className="text-slate-400">{govPm25}</span> ug/m³
                </span>
              </div>
              <div className="relative h-2.5 w-full rounded bg-slate-900 overflow-hidden">
                <div className="absolute top-0 left-0 h-full bg-cyan-400 rounded-l" style={{ width: `${(avgPm25 / 100) * 100}%` }} />
                {/* Marker line for background station */}
                <div className="absolute top-0 h-full w-0.5 bg-red-400" style={{ left: `${(govPm25 / 100) * 100}%` }} title="国家背景站背景值" />
              </div>
              <div className="flex justify-between text-[9px] text-slate-500 mt-1 font-mono">
                <span>0优秀</span>
                <span>国标标准 35</span>
                <span>100重度</span>
              </div>
            </div>

            {/* PM10 Gauge bar */}
            <div>
              <div className="flex justify-between items-end text-xs font-mono mb-1">
                <span className="text-slate-300 font-sans font-medium">PM 10 (超低排核心标)</span>
                <span>
                  厂内: <span className="text-amber-400 font-bold">{avgPm10}</span> / 国站: <span className="text-slate-400">{govPm10}</span> ug/m³
                </span>
              </div>
              <div className="relative h-2.5 w-full rounded bg-slate-900 overflow-hidden">
                <div className="absolute top-0 left-0 h-full bg-amber-500 rounded-l" style={{ width: `${(avgPm10 / 200) * 100}%` }} />
                <div className="absolute top-0 h-full w-0.5 bg-red-400" style={{ left: `${(govPm10 / 200) * 100}%` }} />
              </div>
              <div className="flex justify-between text-[9px] text-slate-500 mt-1 font-mono">
                <span>0正常</span>
                <span>超低合规 150</span>
                <span>200超标预警</span>
              </div>
            </div>

            {/* TSP Gauge bar */}
            <div>
              <div className="flex justify-between items-end text-xs font-mono mb-1">
                <span className="text-slate-300 font-sans font-medium">TSP 总悬浮颗粒物</span>
                <span>
                  厂内: <span className="text-cyan-400 font-bold">{avgTsp}</span> / 国站: <span className="text-slate-400">{govTsp}</span> ug/m³
                </span>
              </div>
              <div className="relative h-2.5 w-full rounded bg-slate-900 overflow-hidden">
                <div className="absolute top-0 left-0 h-full bg-teal-400 rounded-l" style={{ width: `${(avgTsp / 300) * 100}%` }} />
                <div className="absolute top-0 h-full w-0.5 bg-red-400" style={{ left: `${(govTsp / 300) * 100}%` }} />
              </div>
              <div className="flex justify-between text-[9px] text-slate-500 mt-1 font-mono">
                <span>0优秀</span>
                <span>厂标对照 100</span>
                <span>300严重</span>
              </div>
            </div>
          </div>

          <div className="mt-2 text-center rounded bg-emerald-950/20 py-2 border border-emerald-950">
            <span className="font-sans text-[10.5px] text-emerald-400 flex items-center justify-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" /> 监测表明符合超低排A级标杆企业细则。
            </span>
          </div>
        </div>

        {/* Right 2 cols: Diurnal Dust particulate graphs (厂区环境质量变化趋势) */}
        <div id="panel-dust-trends-polyline" className="lg:col-span-2 rounded-xl border border-blue-900/40 bg-slate-950 p-4 flex flex-col justify-between">
          <div className="flex flex-wrap justify-between items-center border-b border-blue-950 pb-2 mb-3 gap-2">
            <div>
              <h3 className="font-sans text-xs font-semibold text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4" /> 厂区粉尘(PM10)浓度当日 24 小时时时变化趋势 (折线图)
              </h3>
              <p className="text-[10px] text-slate-500 font-sans">折线显示当日分时段PM10变化状况与国家预警限值对比</p>
            </div>
            
            <div className="flex items-center gap-3 font-mono text-[9px]">
              <span className="flex items-center gap-1 text-amber-400">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                厂内均值
              </span>
              <span className="flex items-center gap-1 text-slate-400">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                国控限制(150)
              </span>
            </div>
          </div>

          <div className="h-[210px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={hourlyData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(30, 41, 59, 0.4)" />
                <XAxis dataKey="hour" stroke="#475569" fontSize={9} />
                <YAxis stroke="#475569" fontSize={9} domain={[0, 200]} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#020617", borderColor: "#1e3a8a", borderRadius: "6px" }}
                  labelStyle={{ color: "#94a3b8", fontSize: "11px", fontWeight: "bold" }}
                  itemStyle={{ fontSize: "11px", padding: "1px 0" }}
                />
                <Legend iconSize={8} wrapperStyle={{ fontSize: "10px", marginTop: "5px" }} />
                <Line
                  name="PM10 实测值"
                  type="monotone"
                  dataKey="pm10"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
                <Line
                  name="PM2.5 实测值"
                  type="monotone"
                  dataKey="pm25"
                  stroke="#10b981"
                  strokeWidth={1.5}
                  dot={false}
                />
                <Line
                  name="预排标准限值"
                  type="step"
                  dataKey="limitPm10"
                  stroke="#ef4444"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
