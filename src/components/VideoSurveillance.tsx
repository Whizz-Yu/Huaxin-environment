/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion } from "motion/react";
import {
  Video,
  Sliders,
  RotateCcw,
  Search,
  ChevronRight,
  ChevronDown,
  Folder,
  Compass,
  Activity
} from "lucide-react";

export default function VideoSurveillance() {
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
    others: false,
  });

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
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 font-sans text-slate-100 p-1.5">
      
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
                className={`relative rounded border transition-all duration-350 overflow-hidden cursor-pointer flex flex-col justify-between ${
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
                <div className="absolute inset-x-0 top-0 p-1 flex justify-between items-center font-mono text-[8.5px] text-slate-405 bg-black/40 z-10 pointer-events-none">
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
                          <p className="text-cyan-355 font-bold text-cyan-350">{chData.place}</p>
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
                    <span className="text-cyan-405 font-bold scale-90 text-cyan-400">LIVE 50FPS</span>
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
              <Sliders className="h-3.5 w-3.5 text-cyan-405" />
              云台操作控制
            </span>
            <span className="text-[10px] text-slate-505 font-mono text-slate-500">COAX_PTZ</span>
          </div>

          {/* Joystick Wheel Section */}
          <div className="flex justify-center py-2 relative">
            <div className="w-38 h-38 rounded-full border border-cyan-900/50 bg-[#060c18] relative flex items-center justify-center p-1.5 shadow-inner shadow-cyan-950/40">
              
              {/* Inner concentric layout */}
              <div className="absolute inset-5 rounded-full border border-dashed border-cyan-950/20 pointer-events-none" />

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
                className="absolute w-11 h-11 rounded-full bg-slate-950 border border-cyan-800 text-cyan-400 hover:bg-cyan-950 hover:text-cyan-305 flex items-center justify-center shadow-md active:scale-90 transition-all duration-100 cursor-pointer z-10"
              >
                <RotateCcw className="h-4.5 w-4.5 text-cyan-404" />
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
            <span className="text-[11px] font-bold text-cyan-405 text-cyan-400 flex items-center justify-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
              {ptzDirectionText}
            </span>
            <div className="flex justify-around text-[10px] text-slate-450 pt-1.5 border-t border-slate-950">
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
                  className="w-5.5 h-5.5 bg-slate-950 hover:bg-slate-850 rounded font-black text-slate-300 hover:text-cyan-405 flex items-center justify-center cursor-pointer text-xs"
                >
                  -
                </button>
                <span className="text-[11.5px] font-bold text-slate-100 min-w-[36px] text-center">
                  {ptzZoom}×
                </span>
                <button
                  onClick={() => setPtzZoom(v => Math.min(16, +(v + 0.5).toFixed(1)))}
                  className="w-5.5 h-5.5 bg-slate-950 hover:bg-slate-850 rounded font-black text-slate-300 hover:text-cyan-405 flex items-center justify-center cursor-pointer text-xs"
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
                  className="w-5.5 h-5.5 bg-slate-950 hover:bg-slate-850 rounded font-black text-slate-300 hover:text-cyan-405 flex items-center justify-center cursor-pointer text-xs"
                >
                  -
                </button>
                <span className="text-[11.5px] font-bold text-slate-100 min-w-[36px] text-center">
                  {ptzAperture}F
                </span>
                <button
                  onClick={() => setPtzAperture(v => Math.min(100, v + 5))}
                  className="w-5.5 h-5.5 bg-slate-950 hover:bg-slate-850 rounded font-black text-slate-300 hover:text-cyan-405 flex items-center justify-center cursor-pointer text-xs"
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
                  className="w-5.5 h-5.5 bg-slate-950 hover:bg-slate-850 rounded font-black text-slate-300 hover:text-cyan-405 flex items-center justify-center cursor-pointer text-xs"
                >
                  -
                </button>
                <span className="text-[11.5px] font-bold text-slate-100 min-w-[36px] text-center">
                  {ptzFocus}
                </span>
                <button
                  onClick={() => setPtzFocus(v => Math.min(250, v + 5))}
                  className="w-5.5 h-5.5 bg-slate-950 hover:bg-slate-850 rounded font-black text-slate-300 hover:text-cyan-405 flex items-center justify-center cursor-pointer text-xs"
                >
                  +
                </button>
              </div>
            </div>

            {/* Speed selector range slider */}
            <div className="space-y-1 shadow-inner p-1">
              <div className="flex justify-between items-center text-[9.5px] text-slate-550 text-slate-500">
                <span>调节速率百分比:</span>
                <span className="text-cyan-404 text-cyan-400 font-bold">{ptzSpeed}%</span>
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
                  ? "bg-cyan-955 border-cyan-500/60 text-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.25)]"
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
                  ? "bg-emerald-950 border-emerald-500/60 text-emerald-455 shadow-[0_0_8px_rgba(16,185,129,0.25)] text-emerald-400"
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
            <span className="text-[13px] font-black text-emerald-455 font-mono text-emerald-400">45</span>
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
}
