import React, { useState } from "react";
import { CemsStack } from "../types";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  FileSpreadsheet,
  Activity,
  CheckCircle,
  TrendingUp,
  FileText,
  ActivityIcon,
  ShieldCheck,
  Search,
  Filter,
  Flame,
  ArrowRight,
  Sparkles,
} from "lucide-react";

interface EmissionJointMonitoringProps {
  allStacks: CemsStack[];
  selectedStackId: string;
  setSelectedStackId: (id: string) => void;
}

export default function EmissionJointMonitoring({
  allStacks,
  selectedStackId,
  setSelectedStackId,
}: EmissionJointMonitoringProps) {
  const [startDate, setStartDate] = useState("2026-06-01");
  const [endDate, setEndDate] = useState("2026-06-03");
  const [activeParam, setActiveParam] = useState("pm");
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const selectedStack = allStacks.find((s) => s.id === selectedStackId) || allStacks[0];

  const getParamLabel = (param: string) => {
    switch (param) {
      case "pm": return "颗粒物烟粉尘";
      case "so2": return "二氧化硫含量 (SO2)";
      case "nox": return "氮氧化物因子 (NOx)";
      default: return "监测因子";
    }
  };

  const getParamUnit = (param: string) => {
    switch (param) {
      case "pm":
      case "so2":
      case "nox":
        return "mg/m³";
      default:
        return "mg/m³";
    }
  };

  // Dual-rail time-series database simulation matching CEMS vs Handcraft
  const getCombinedChartData = (stack: any, param: string, start: string, end: string) => {
    const baseVal = stack[param] || 15;
    return [
      { time: `${start.slice(5)} 02:00`, cemsValue: Number((baseVal * 0.94).toFixed(2)), manualValue: null },
      { time: `${start.slice(5)} 08:00`, cemsValue: Number((baseVal * 1.03).toFixed(2)), manualValue: Number((baseVal * 0.98).toFixed(2)) },
      { time: `${start.slice(5)} 14:00`, cemsValue: Number((baseVal * 0.97).toFixed(2)), manualValue: null },
      { time: `${start.slice(5)} 20:00`, cemsValue: Number((baseVal * 1.06).toFixed(2)), manualValue: Number((baseVal * 1.01).toFixed(2)) },
      { time: `${end.slice(5)} 02:00`, cemsValue: Number((baseVal * 0.91).toFixed(2)), manualValue: null },
      { time: `${end.slice(5)} 08:00`, cemsValue: Number((baseVal * 0.98).toFixed(2)), manualValue: Number((baseVal * 0.93).toFixed(2)) },
      { time: `${end.slice(5)} 14:00`, cemsValue: Number((baseVal * 1.04).toFixed(2)), manualValue: null },
      { time: `${end.slice(5)} 20:59`, cemsValue: Number((baseVal * 0.95).toFixed(2)), manualValue: Number((baseVal * 0.97).toFixed(2)) },
    ];
  };

  const handleExport = () => {
    setExportNotice(`⏳ 正在对齐 [${selectedStack.name}] 综合双轨监测台账并验证防伪哈希签名...`);
    setTimeout(() => {
      setExportNotice(`✔ ${selectedStack.name} 综合在线与手工对标报表(.xlsx)已生成，CA认证签章[SHA-256]嵌入成功!`);
      setTimeout(() => setExportNotice(null), 6000);
    }, 1500);
  };

  // Color Coding:
  // Online CEMS is Cyan: #06b6d4, Solid Line
  // Manual Chemistry is Amber: #f59e0b, Dashed Line with distinct circle points
  const chartData = getCombinedChartData(selectedStack, activeParam, startDate, endDate);

  const dustDiff = selectedStack.pm * 0.06;
  const dustDev = 6.38;
  const so2Diff = selectedStack.so2 * 0.03;
  const so2Dev = -2.91;
  const noxDiff = selectedStack.nox * 0.04;
  const noxDev = 4.16;

  // Format manual items
  const manualTemp = (selectedStack.temperature * 0.985).toFixed(1);
  const manualPressure = (selectedStack.pressure - 0.02).toFixed(2);

  return (
    <div className="space-y-4 font-sans text-slate-300">
      {/* 1. Integrated Header Controls */}
      <div className="bg-slate-950 border border-slate-900 rounded-xl p-4 shadow-xl flex justify-between items-center flex-wrap gap-4 animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-950 text-cyan-400">
            <Activity className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              有组织废气联合监测与对标评价工作区
              <span className="text-[10px] bg-cyan-950 text-cyan-400 font-normal px-2 py-0.5 rounded border border-cyan-900/45">
                数据双轨制
              </span>
            </h2>
            <p className="text-[10.5px] text-slate-400">
              有组织在线监测采集(CEMS) 与 人工实验室取样(Manual) 统一同屏对比及对对标合理性评测
            </p>
          </div>
        </div>

        {/* Selected Emission Stack Filter */}
        <div className="flex items-center gap-2.5 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 shadow-sm">
          <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
            <Filter className="h-3.5 w-3.5 text-cyan-400" />
            对应排放源选择:
          </span>
          <select
            value={selectedStackId}
            onChange={(e) => setSelectedStackId(e.target.value)}
            className="rounded bg-slate-950 border border-slate-850 text-xs text-slate-200 outline-none px-2 py-1 focus:border-cyan-700 font-mono"
          >
            {allStacks.map((stack) => (
              <option key={stack.id} value={stack.id}>
                {stack.name} {stack.status === "stopped" ? " (待命)" : stack.status === "fault" ? " (停机)" : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 2. Top Telemetry Metrics - Gray tag identifying CEMS vs Manual check values */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
        <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-900/80 flex flex-col justify-between font-mono shadow-md relative group">
          <span className="text-[9.5px] text-slate-500 font-sans leading-tight flex justify-between items-center">
            基准含氧量
            <span className="text-[8px] scale-90 px-1 rounded bg-cyan-950 text-cyan-400">CEMS</span>
          </span>
          <div className="mt-1 flex items-baseline gap-0.5">
            <span className="text-base font-bold text-cyan-400">{selectedStack.oxygen.toFixed(1)}</span>
            <span className="text-[8.5px] text-slate-400 scale-90 ml-0.5">%</span>
          </div>
        </div>

        <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-900/80 flex flex-col justify-between font-mono shadow-md relative group">
          <span className="text-[9.5px] text-slate-500 font-sans leading-tight flex justify-between items-center">
            颗粒物含度
            <span className="text-[8px] scale-90 px-1 rounded bg-rose-950 text-rose-400">CEMS</span>
          </span>
          <div className="mt-1 flex items-baseline gap-0.5">
            <span className="text-base font-bold text-rose-400">{selectedStack.pm.toFixed(2)}</span>
            <span className="text-[8.5px] text-slate-400 scale-90 ml-0.5">mg/m³</span>
          </div>
        </div>

        <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-900/80 flex flex-col justify-between font-mono shadow-md relative group">
          <span className="text-[9.5px] text-slate-500 font-sans leading-tight flex justify-between items-center">
            二氧化硫浓度
            <span className="text-[8px] scale-90 px-1 rounded bg-amber-950 text-amber-400">CEMS</span>
          </span>
          <div className="mt-1 flex items-baseline gap-0.5">
            <span className="text-base font-bold text-amber-400">{selectedStack.so2.toFixed(1)}</span>
            <span className="text-[8.5px] text-slate-400 scale-90 ml-0.5">mg/m³</span>
          </div>
        </div>

        <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-900/80 flex flex-col justify-between font-mono shadow-md relative group">
          <span className="text-[9.5px] text-slate-500 font-sans leading-tight flex justify-between items-center">
            氮氧化物含量
            <span className="text-[8px] scale-90 px-1 rounded bg-fuchsia-950 text-fuchsia-400">CEMS</span>
          </span>
          <div className="mt-1 flex items-baseline gap-0.5">
            <span className="text-base font-bold text-fuchsia-400">{selectedStack.nox.toFixed(1)}</span>
            <span className="text-[8.5px] text-slate-400 scale-90 ml-0.5">mg/m³</span>
          </div>
        </div>

        <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-900/80 flex flex-col justify-between font-mono shadow-md relative group">
          <span className="text-[9.5px] text-slate-500 font-sans leading-tight flex justify-between items-center">
            手工实测烟温
            <span className="text-[8px] scale-90 px-1 rounded bg-amber-950 text-amber-500">Manual</span>
          </span>
          <div className="mt-1 flex items-baseline gap-0.5">
            <span className="text-base font-bold text-amber-400">{manualTemp}</span>
            <span className="text-[8.5px] text-slate-400 scale-90 ml-0.5">℃</span>
          </div>
        </div>

        <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-900/80 flex flex-col justify-between font-mono shadow-md relative group">
          <span className="text-[9.5px] text-slate-500 font-sans leading-tight flex justify-between items-center">
            手工静压校正
            <span className="text-[8px] scale-90 px-1 rounded bg-emerald-950 text-emerald-400">Manual</span>
          </span>
          <div className="mt-1 flex items-baseline gap-0.5">
            <span className="text-base font-bold text-emerald-400">{manualPressure}</span>
            <span className="text-[8.5px] text-slate-400 scale-90 ml-0.5">kPa</span>
          </div>
        </div>
      </div>

      {/* 3. Combined Dual-Rail Visualization Graphics Segment */}
      <div className="rounded-xl border border-slate-900 bg-slate-950 p-4 shadow-xl">
        <div className="flex flex-wrap justify-between items-center gap-3 border-b border-slate-900 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4.5 w-4.5 text-cyan-400" />
            <span className="text-xs font-bold text-slate-200">
              有组织排放 【{selectedStack.name}】 在线 vs 手工对比分析图
            </span>
            <span className="text-[9.5px] text-slate-500 italic">
              (按时间轴关联对齐，监测因子可切)
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Active Factor Switcher */}
            <div className="flex bg-slate-900 p-0.5 rounded border border-slate-800 text-[10px]">
              <button
                type="button"
                onClick={() => setActiveParam("pm")}
                className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                  activeParam === "pm" ? "bg-cyan-900/80 text-cyan-100 font-bold" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                烟尘粉尘
              </button>
              <button
                type="button"
                onClick={() => setActiveParam("so2")}
                className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                  activeParam === "so2" ? "bg-cyan-900/80 text-cyan-100 font-bold" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                SO2二氧化硫
              </button>
              <button
                type="button"
                onClick={() => setActiveParam("nox")}
                className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                  activeParam === "nox" ? "bg-cyan-900/80 text-cyan-100 font-bold" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                NOx氮氧化物
              </button>
            </div>

            {/* Start and end dates */}
            <div className="flex items-center gap-1 text-[10px] text-slate-550 font-mono">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-slate-900 border border-slate-800 text-slate-300 rounded px-1.5 py-0.5 outline-none font-sans"
              />
              <span>—</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-slate-900 border border-slate-800 text-slate-300 rounded px-1.5 py-0.5 outline-none font-sans"
              />
            </div>
          </div>
        </div>

        {/* Graph Display with Color tagging label explanations */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-3 h-[250px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#0e1726" />
                <XAxis dataKey="time" stroke="#475569" fontSize={9.5} />
                <YAxis stroke="#475569" fontSize={9.5} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#020617",
                    border: "1px solid #1e293b",
                    borderRadius: "6px",
                    fontSize: "11px",
                    color: "#f1f5f9",
                  }}
                  formatter={(value: any, name: string) => {
                    if (value === null || value === undefined) return ["无对标检测", name];
                    return [`${value} ${getParamUnit(activeParam)}`, name === "cemsValue" ? "CEMS [在线监测]" : "Lab [手工监测]"];
                  }}
                />
                {/* Online CEMS: Cyan Solid Line */}
                <Line
                  type="monotone"
                  dataKey="cemsValue"
                  name="cemsValue"
                  stroke="#06b6d4"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: "#06b6d4" }}
                  activeDot={{ r: 5 }}
                />
                {/* Manual Check: Amber Dashed Offset Line */}
                <Line
                  type="monotone"
                  dataKey="manualValue"
                  name="manualValue"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ r: 6, fill: "#f59e0b", stroke: "#d97706", strokeWidth: 1.5 }}
                  connectNulls={true}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Side Color Legend Panel */}
          <div className="rounded-lg bg-slate-900/35 border border-slate-900/60 p-3.5 flex flex-col justify-between">
            <div className="space-y-3">
              <h4 className="text-[11px] font-bold text-slate-200">📊 联合图例及颜色说明</h4>
              
              {/* Online indicator */}
              <div className="p-2 rounded bg-cyan-950/40 border边框 border-cyan-900/30 flex shadow-sm gap-2">
                <div className="h-4 w-1 rounded bg-cyan-500 mt-0.5" />
                <div>
                  <div className="text-[10.5px] font-bold text-cyan-400">数采仪在线数据 (CEMS)</div>
                  <div className="text-[9.5px] text-slate-400 mt-0.5">代表颜色: <span className="text-cyan-404 font-mono">#06b6d4</span></div>
                  <p className="text-[9px] text-slate-500 leading-tight">高电位持续采样并每分钟进行分钟算数平均上传。</p>
                </div>
              </div>

              {/* Handcraft indicator */}
              <div className="p-2 rounded bg-amber-950/30 border border-amber-900/30 flex shadow-sm gap-2">
                <div className="h-4 w-1 rounded bg-amber-500 mt-0.5" />
                <div>
                  <div className="text-[10.5px] font-bold text-amber-500">实验室手工采检 (Lab Manual)</div>
                  <div className="text-[9.5px] text-slate-400 mt-0.5">代表颜色: <span className="text-amber-404 font-mono">#f59e0b</span></div>
                  <p className="text-[9px] text-slate-500 leading-tight">固定时点手工皮托管抽样检测，属国家环保部校准基底。</p>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-900 text-[10.5px]">
              <div className="flex justify-between items-center text-slate-400">
                <span>偏差相对均率 (MRE):</span>
                <span className="text-emerald-400 font-bold">4.41% ✅</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Combined Evaluation section (Appraising text and Joint comparison table) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Left Side: Compliance Status Summary */}
        <div className="lg:col-span-2 rounded-xl bg-emerald-950/10 border border-emerald-900/40 p-4.5 flex flex-col justify-between animate-fade-in shadow-inner">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs mb-2">
              <ShieldCheck className="h-5 w-5 text-emerald-400 animate-pulse" />
              HJ对标成果: 测定合理，判定完全达标
            </div>
            <p className="text-[11px] text-slate-350 leading-relaxed mt-2.5">
              对选定排放控制点 <b>[ {selectedStack.name} ]</b> 连续在线自动CEMS数据与代表手工抽检在时序上进行相对均相对差比评估：
              复合均绝对比偏（MRE）为<b>4.41%</b>，远低于国标规范要求的 <b>&lt; 15%</b> 的物理差值容忍度上限。
              此排气端已通过“在线/手工”双重验证。系统评估其防尾监控质量评定为 <b>A级（免审校验免检点位）</b>。
            </p>
          </div>

          <div className="mt-4 pt-3.5 border-t border-slate-900/80 text-[10px] text-slate-500 flex justify-between items-center font-mono">
            <span>评测等级: 1等绿色规范点</span>
            <span>签戳校验码: CEMS-DUAL-APPROVE</span>
          </div>
        </div>

        {/* Right Side: High-contrast comparison values table */}
        <div className="lg:col-span-3 rounded-xl bg-slate-900/25 border border-slate-950 p-4 overflow-x-auto text-xs font-mono shadow-xl text-slate-300">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[11.5px] font-bold text-slate-205 font-sans">
              在线日连测自动时均与手测采检均点对比评价台账
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExport}
                className="rounded bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800 px-2 py-0.8 text-[10px] font-sans inline-flex items-center gap-1 transition-all cursor-pointer font-medium"
              >
                <FileSpreadsheet className="h-3.5 w-3.5 text-cyan-405" />
                导出综合评价表.xlsx
              </button>
            </div>
          </div>

          <table className="w-full border-collapse border border-slate-905 text-[11px]">
            <thead>
              <tr className="bg-slate-950 text-slate-400 font-sans text-[10px] uppercase">
                <th className="p-2 border border-slate-900 text-left">监测比对因子</th>
                <th className="p-2 border border-slate-900 text-right text-cyan-400">自动实时均数 (CEMS)</th>
                <th className="p-2 border border-slate-900 text-right text-amber-500">物理手工均数 (Lab)</th>
                <th className="p-2 border border-slate-900 text-right">离教绝对偏差 / 相对度码</th>
                <th className="p-2 border border-slate-900 text-center">规范对标质评</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900">
              <tr>
                <td className="p-2 border border-slate-900 font-sans text-slate-300">颗粒物烟尘 (PM)</td>
                <td className="p-2 border border-slate-900 text-right font-bold text-cyan-405">{selectedStack.pm.toFixed(2)} mg/m³</td>
                <td className="p-2 border border-slate-900 text-right font-bold text-amber-400">{(selectedStack.pm * 0.94).toFixed(2)} mg/m³</td>
                <td className="p-2 border border-slate-900 text-right text-emerald-400 font-semibold">{dustDiff.toFixed(2)} mg/m³ (+{dustDev}%)</td>
                <td className="p-2 border border-slate-900 text-center text-[10px] text-emerald-400 font-sans font-bold bg-emerald-950/20">合理均值合理</td>
              </tr>
              <tr>
                <td className="p-2 border border-slate-900 font-sans text-slate-300">二氧化硫 (SO2)</td>
                <td className="p-2 border border-slate-900 text-right font-bold text-cyan-405">{selectedStack.so2.toFixed(1)} mg/m³</td>
                <td className="p-2 border border-slate-900 text-right font-bold text-amber-400">{(selectedStack.so2 * 1.03).toFixed(1)} mg/m³</td>
                <td className="p-2 border border-slate-900 text-right text-emerald-400 font-semibold">{Math.abs(so2Diff).toFixed(1)} mg/m³ ({so2Dev}%)</td>
                <td className="p-2 border border-slate-900 text-center text-[10px] text-emerald-400 font-sans font-bold bg-emerald-950/20">合理均值合理</td>
              </tr>
              <tr>
                <td className="p-2 border border-slate-900 font-sans text-slate-300">氮氧化物 (NOx)</td>
                <td className="p-2 border border-slate-900 text-right font-bold text-cyan-405">{selectedStack.nox.toFixed(1)} mg/m³</td>
                <td className="p-2 border border-slate-900 text-right font-bold text-amber-400">{(selectedStack.nox * 0.96).toFixed(1)} mg/m³</td>
                <td className="p-2 border border-slate-900 text-right text-emerald-400 font-semibold">{noxDiff.toFixed(1)} mg/m³ (+{noxDev}%)</td>
                <td className="p-2 border border-slate-900 text-center text-[10px] text-emerald-400 font-sans font-bold bg-emerald-950/20">合理均值合理</td>
              </tr>
            </tbody>
          </table>

          {exportNotice && (
            <p className="mt-2 text-emerald-400 font-sans animate-pulse font-bold text-[10px]">
              {exportNotice}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
