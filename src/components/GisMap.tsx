/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  CemsStack,
  DustSensor,
  CleaningVehicle,
  DeviceStatusLog,
  AlarmItem,
} from "../types";
import {
  Layers,
  MapPin,
  Video,
  Wind,
  Droplet,
  Flame,
  Truck,
  Activity,
  Maximize2,
  Minimize2,
  Info,
  CheckCircle,
  AlertTriangle,
  Play,
  Pause,
  TrendingUp,
  Cpu,
  Trash2,
  Tv,
  Wrench,
  ShieldAlert,
  AlertOctagon,
  ArrowUpRight,
  Sparkles,
  RefreshCw,
  FolderOpen,
  Calendar,
  X,
  Plus,
  Minus,
  FileText,
  User,
  Settings,
  Shield,
  Eye,
  Layers as LayersIcon
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const mapBg = "/src/assets/images/satellite_factory_1780387736526.png";

interface GisMapProps {
  cemsStacks: CemsStack[];
  dustSensors: DustSensor[];
  cleaningVehicles: CleaningVehicle[];
  deviceLogs: DeviceStatusLog[];
  alarms?: AlarmItem[];
  onSelectCems: (cems: CemsStack) => void;
  onSelectDust: (dust: DustSensor) => void;
  onSelectVehicle: (vehicle: CleaningVehicle) => void;
}

export default function GisMap({
  cemsStacks,
  dustSensors,
  cleaningVehicles,
  deviceLogs,
  alarms = [],
  onSelectCems,
  onSelectDust,
  onSelectVehicle,
}: GisMapProps) {
  // Layer Toggles
  const [activeLayer, setActiveLayer] = useState<"all" | "monitoring" | "production" | "treatment" | "cctv" | "heatmap">("all");
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [selectedHotspot, setSelectedHotspot] = useState<string | null>(null);

  // Time & Clock state inside telemetry
  const [systemCounter, setSystemCounter] = useState(0);

  // Archives popup Modal
  const [activeDocCategory, setActiveDocCategory] = useState<string | null>(null);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);

  // CCTV Interactive details
  const [cctvFilter, setCctvFilter] = useState<"normal" | "night" | "thermal">("normal");
  const [cctvPanX, setCctvPanX] = useState(0);
  const [cctvPanY, setCctvPanY] = useState(0);
  const [cctvZoom, setCctvZoom] = useState(1);
  const [isCctvModalOpen, setIsCctvModalOpen] = useState(false);

  // Mapped standard coordinates for map overlays on 1000 x 500 viewport
  const cemsCoordinates: Record<string, { x: number; y: number }> = {
    "cems-1": { x: 645, y: 195 }, // 1#窑头
    "cems-2": { x: 575, y: 125 }, // 2#窑尾
    "cems-3": { x: 450, y: 165 }, // 煤磨
    "cems-4": { x: 310, y: 220 }, // 水泥磨
    "cems-5": { x: 235, y: 260 }, // 卸料破碎
    "cems-6": { x: 380, y: 165 }, // 旁路应急 (生料磨)
  };

  const dustCoordinates: Record<string, { x: number; y: number }> = {
    "dust-1": { x: 675, y: 215 }, // 原料大棚
    "dust-2": { x: 315, y: 255 }, // 破碎进料仓
    "dust-3": { x: 530, y: 275 }, // 辅料堆场
    "dust-4": { x: 475, y: 235 }, // 配料站
    "dust-5": { x: 710, y: 165 }, // 篦冷机
    "dust-6": { x: 745, y: 175 }, // 熟料圆库底
    "dust-7": { x: 815, y: 285 }, // 包装机
    "dust-8": { x: 882, y: 305 }, // 厂区东侧
    "dust-9": { x: 885, y: 345 }, // 洗车水槽
    "dust-10": { x: 145, y: 105 }, // 生活区
  };

  const treatmentCoordinates: Record<string, { x: number; y: number }> = {
    "devlog-3": { x: 335, y: 270 }, // 石灰石破碎微雾
    "devlog-4": { x: 890, y: 360 }, // 出门洗车组
    "devlog-5": { x: 715, y: 190 }, // 篦冷机除尘单元
    "devlog-6": { x: 748, y: 185 }, // 库底降尘单元
  };

  const cctvCoordinates: Record<string, { x: number; y: number; area: string; feedText: string }> = {
    "cctv-1": { x: 570, y: 110, area: "回转窑窑尾排口35m platform", feedText: "N1-窑尾在线监控" },
    "cctv-2": { x: 300, y: 240, area: "原矿一级粗碎给料斗上方", feedText: "N2-石灰石破碎无组织" },
    "cctv-3": { x: 670, y: 195, area: "1#原煤堆棚大棚主跨中梁", feedText: "N3-原料堆场安全巡视" },
    "cctv-4": { x: 895, y: 335, area: "物流主通道出厂洗车平台东侧", feedText: "N4-洗车平台道闸监控" },
  };

  // Zoom and Drag states for the main satellite map
  const [mapZoom, setMapZoom] = useState<number>(1);
  const [mapPanX, setMapPanX] = useState<number>(0);
  const [mapPanY, setMapPanY] = useState<number>(0);
  const [isDraggingMap, setIsDraggingMap] = useState<boolean>(false);
  const [mapDragStart, setMapDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleMapMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDraggingMap(true);
    setMapDragStart({ x: e.clientX - mapPanX, y: e.clientY - mapPanY });
  };

  const handleMapMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingMap) return;
    setMapPanX(e.clientX - mapDragStart.x);
    setMapPanY(e.clientY - mapDragStart.y);
  };

  const handleMapMouseUp = () => {
    setIsDraggingMap(false);
  };

  const handleMapMouseLeave = () => {
    setIsDraggingMap(false);
  };

  const handleMapWheel = (e: React.WheelEvent) => {
    // Scroll zoom keeping limits
    const scaleFactor = 1.12;
    let newZoom = mapZoom;
    if (e.deltaY < 0) {
      newZoom = Math.min(mapZoom * scaleFactor, 5.0);
    } else {
      newZoom = Math.max(mapZoom / scaleFactor, 0.7);
    }
    setMapZoom(newZoom);
  };

  const handleZoomIn = () => {
    setMapZoom(prev => Math.min(prev * 1.25, 5.0));
  };

  const handleZoomOut = () => {
    setMapZoom(prev => Math.max(prev / 1.25, 0.7));
  };

  const handleResetMap = () => {
    setMapZoom(1);
    setMapPanX(0);
    setMapPanY(0);
  };

  // Helper renderers for dynamic emission meters inside the HUD inspect card
  const renderCemsParam = (label: string, value: number, unit: string, limit: number) => {
    const isExceeded = value > limit;
    const pct = Math.min((value / limit) * 100, 100);
    return (
      <div className="space-y-1">
        <div className="flex justify-between text-[11px]">
          <span className="text-slate-400">{label}</span>
          <span className="font-mono">
            <span className={isExceeded ? "text-rose-550 font-bold" : "text-cyan-400 font-bold"}>{value}</span>
            <span className="text-slate-500 text-[9.5px] ml-0.5">{unit}</span>
            <span className="text-[9px] text-slate-500 ml-1.5">(限 {limit})</span>
          </span>
        </div>
        <div className="h-1 bg-slate-950 rounded-full overflow-hidden border border-slate-900/40">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${isExceeded ? "bg-rose-500 animate-pulse" : "bg-cyan-500"}`} 
            style={{ width: `${pct}%` }} 
          />
        </div>
      </div>
    );
  };

  const renderDustParam = (label: string, value: number, unit: string, limit: number) => {
    const isExceeded = value > limit;
    const pct = Math.min((value / limit) * 100, 100);
    return (
      <div className="space-y-1">
        <div className="flex justify-between text-[11px]">
          <span className="text-slate-400">{label}</span>
          <span className="font-mono">
            <span className={isExceeded ? "text-rose-400 font-bold animate-pulse" : "text-emerald-400 font-bold"}>{value}</span>
            <span className="text-slate-500 text-[9.5px] ml-0.5">{unit}</span>
            <span className="text-[9px] text-slate-500 ml-1.5">(标准 {limit})</span>
          </span>
        </div>
        <div className="h-1 bg-slate-950 rounded-full overflow-hidden border border-slate-900/40">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${isExceeded ? "bg-rose-400" : "bg-emerald-400"}`} 
            style={{ width: `${pct}%` }} 
          />
        </div>
      </div>
    );
  };

  // Selected details preview
  const [selectedPin, setSelectedPin] = useState<{
    type: "cems" | "dust" | "video" | "vehicle" | "treatment";
    data: any;
  } | null>({
    type: "cems",
    data: cemsStacks[0] || null,
  });

  // Dynamic counter increment
  useEffect(() => {
    const timer = setInterval(() => {
      setSystemCounter(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format dynamic timer
  const formatTimecode = (seconds: number) => {
    const h = Math.floor((seconds % 86400) / 3600).toString().padStart(2, "0");
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, "0");
    const s = Math.floor(seconds % 60).toString().padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  const renderCctvLiveFeed = (camId: string, filter: "normal" | "night" | "thermal") => {
    const panStyle = {
      transform: `translate(${cctvPanX}px, ${cctvPanY}px) scale(${cctvZoom})`,
      transition: "transform 0.15s ease-out",
    };

    const filterBgClass = 
      filter === "night" ? "bg-emerald-950/90 border-emerald-500" :
      filter === "thermal" ? "bg-purple-950 border-purple-800" : "bg-zinc-950 border-slate-850";

    return (
      <div className={`relative aspect-video rounded border overflow-hidden ${filterBgClass} transition-colors select-none`}>
        {/* Target crop overlays */}
        <div className="absolute top-2 left-2 w-3.5 h-3.5 border-t-2 border-l-2 border-cyan-400"></div>
        <div className="absolute top-2 right-2 w-3.5 h-3.5 border-t-2 border-r-2 border-cyan-400"></div>
        <div className="absolute bottom-2 left-2 w-3.5 h-3.5 border-b-2 border-l-2 border-cyan-400"></div>
        <div className="absolute bottom-2 right-2 w-3.5 h-3.5 border-b-2 border-r-2 border-cyan-400"></div>
        
        {/* Scanline pattern mask for Night Vision/Thermal */}
        {filter !== "normal" && (
          <div className="absolute inset-0 bg-scanlines pointer-events-none opacity-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]"></div>
        )}

        {/* Title & Live indicators */}
        <div className="absolute top-2 inset-x-2 flex justify-between text-[8px] font-mono z-10">
          <div className="flex items-center gap-1.5 text-cyan-400">
            <span className="h-1.5 w-1.5 rounded-full bg-red-600 animate-ping"></span>
            <span className={filter === "night" ? "text-emerald-400 font-bold" : "text-red-400 font-bold"}>● REC LIVE</span>
            <span className="text-slate-500">|</span>
            <span className={filter === "night" ? "text-emerald-400" : "text-slate-300"}>CAM_{camId.toUpperCase()}</span>
          </div>
          <div className={filter === "night" ? "text-emerald-400" : "text-cyan-400"}>
            ZOOM: {cctvZoom.toFixed(1)}x
          </div>
        </div>

        {/* Center reticle */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="w-8 h-8 border border-white/10 rounded-full flex items-center justify-center">
            <div className={`w-1 h-1 rounded-full ${filter === "night" ? "bg-emerald-400" : "bg-cyan-500"}`}></div>
          </div>
        </div>

        {/* Vector graphics rendering area */}
        <div className="w-full h-full flex items-center justify-center" style={panStyle}>
          {camId === "cctv-1" && (
            // ROTARY KILN SCENE (Flue gas stack)
            <div className="relative w-full h-full flex items-end justify-center pb-2">
              <div className={`absolute bottom-2 inset-x-0 h-[1.2px] ${filter === "night" ? "bg-emerald-800" : "bg-slate-800"}`}></div>
              
              {/* Preheater tower outline */}
              <div className={`w-14 h-24 border ${filter === "night" ? "border-emerald-600 bg-emerald-950/30" : filter === "thermal" ? "border-purple-600 bg-purple-900/20" : "border-slate-700 bg-slate-900/30"} rounded-b-sm mr-12 relative flex flex-col justify-between p-1`}>
                <div className={`text-[4.5px] p-0.5 border text-center ${filter === "night" ? "border-emerald-800 text-emerald-400" : "border-slate-800 text-slate-500"}`}>DE-Dust</div>
                <div className={`text-[4.5px] p-0.5 border text-center ${filter === "night" ? "border-emerald-800 text-emerald-400" : "border-slate-800 text-slate-500"}`}>Reactor</div>
              </div>

              {/* Chimney Stack */}
              <div className="relative flex flex-col items-center">
                {/* Plume cloud particles animating */}
                <div className="absolute -top-12 w-16 h-12 pointer-events-none overflow-hidden flex flex-col items-center select-none">
                  <span className={`h-2.5 w-6 rounded-full ${filter === "thermal" ? "bg-orange-500" : filter === "night" ? "bg-emerald-400" : "bg-slate-300"} opacity-30 animate-bounce mb-1`}></span>
                  <span className={`h-4 w-10 rounded-full ${filter === "thermal" ? "bg-red-500" : filter === "night" ? "bg-emerald-500" : "bg-slate-400"} opacity-15 animate-ping`}></span>
                </div>
                
                <div className={`w-7 h-20 border-l border-r ${filter === "night" ? "border-emerald-500 bg-emerald-950/45" : filter === "thermal" ? "border-pink-800 bg-pink-950/40" : "border-slate-600 bg-slate-900/40"}`}>
                  <div className={`h-[1px] w-full my-3 ${filter === "night" ? "bg-emerald-700" : "bg-slate-700"}`}></div>
                  <div className={`h-[1px] w-full my-3 ${filter === "night" ? "bg-emerald-700" : "bg-slate-700"}`}></div>
                  <div className={`h-[1px] w-full my-3 ${filter === "night" ? "bg-emerald-700" : "bg-slate-700"}`}></div>
                </div>
              </div>
              
              <div className="absolute bottom-3 left-3 text-[5.5px] font-mono leading-tight p-1 bg-black/75 rounded border border-slate-900">
                <div className={filter === "night" ? "text-emerald-400" : filter === "thermal" ? "text-amber-400" : "text-cyan-400"}>NOx: {(41.5 + Math.sin(systemCounter / 1.5) * 1.2).toFixed(1)} mg/m³</div>
                <div className="text-slate-400 mt-0.5">SO2: {(12.4 + Math.cos(systemCounter / 2) * 0.5).toFixed(1)} mg/m³</div>
              </div>
            </div>
          )}

          {camId === "cctv-2" && (
            // LIMESTONE CRUSHER SECTION
            <div className="relative w-full h-full flex flex-col items-center justify-center pt-2">
              <div className="flex flex-col items-center mt-3">
                {/* Conveyor Belt line with aggregates moving */}
                <div className="relative w-40 h-2 bg-slate-950 border border-slate-800 rounded flex items-center overflow-hidden mb-1 justify-around">
                  <div className={`w-1 h-1 rounded-full ${filter === "night" ? "bg-emerald-400" : "bg-amber-600"} animate-pulse`}></div>
                  <div className={`w-1.5 h-1 rounded-full ${filter === "night" ? "bg-emerald-500" : "bg-amber-700"} animate-bounce`} style={{ animationDelay: "0.2s" }}></div>
                  <div className={`w-1 h-1 rounded-full ${filter === "night" ? "bg-emerald-400" : "bg-amber-600"} animate-bounce`} style={{ animationDelay: "0.4s" }}></div>
                </div>

                {/* Crusher Bunker box */}
                <div className={`w-28 h-12 border-b border-l border-r ${filter === "night" ? "border-emerald-600 bg-emerald-950/60" : "border-slate-700 bg-slate-900/40"} rounded-b-md relative flex justify-around p-1.5 overflow-hidden`}>
                  <div className={`h-4.5 w-4.5 rounded-full border border-dashed ${filter === "night" ? "border-emerald-500" : "border-slate-500"} animate-spin`} style={{ animationDuration: "2.5s" }}></div>
                  <div className={`h-4.5 w-4.5 rounded-full border border-dashed ${filter === "night" ? "border-emerald-500" : "border-slate-500"} animate-spin`} style={{ animationDuration: "1.8s" }}></div>
                  
                  {/* Dust puff suppression drops particles */}
                  <span className={`absolute h-1.5 w-1.5 bg-cyan-400/30 rounded-full top-2 left-6 animate-ping`}></span>
                  <span className={`absolute h-1 w-1 bg-cyan-400/25 rounded-full top-3 right-8 animate-ping`}></span>
                </div>
                <div className="text-[5.5px] mt-1 font-mono text-slate-500">PRIMARY CRUSHER INDUCT</div>
              </div>
              
              {/* Dynamic spraying droplets representation */}
              <div className="absolute top-6 inset-x-0 flex justify-around pointer-events-none select-none">
                <div className="h-6 w-12 border-b border-dashed border-cyan-400/35 rounded-b-full animate-pulse"></div>
              </div>
            </div>
          )}

          {camId === "cctv-3" && (
            // RAW MATERIALS COAL SHED
            <div className="relative w-full h-full flex items-end justify-center pb-2">
              <div className="flex items-end gap-1.5 select-none pointer-events-none w-[90%] justify-center">
                <div className={`w-22 h-10 border border-b-none ${filter === "night" ? "border-emerald-700 bg-emerald-950/20" : "border-slate-800 bg-slate-900/20"} rounded-t-full`}></div>
                
                {/* Wetting dust cannon station */}
                <div className={`w-26 h-14 border border-b-none ${filter === "night" ? "border-emerald-600 bg-emerald-950/35" : "border-slate-700 bg-slate-900/30"} rounded-t-full relative flex items-center justify-center`}>
                  <div className="absolute bottom-0 flex flex-col items-center">
                    <div className={`w-2.5 h-4.5 border ${filter === "night" ? "border-emerald-400" : "border-cyan-500"} origin-bottom rotate-[-25deg]`}></div>
                    <div className={`w-1 h-2 ${filter === "night" ? "bg-emerald-700" : "bg-slate-700"}`}></div>
                  </div>
                </div>
              </div>

              {/* Conical fog flow lines */}
              <div className="absolute bottom-5 left-14 w-15 h-8 pointer-events-none">
                <div className="w-12 h-12 border border-cyan-400/20 rounded-full animate-ping"></div>
              </div>
              <div className="absolute bottom-2 left-3 text-[5.8px] font-mono text-slate-400">RE-CLAIM_YARD_S_8</div>
            </div>
          )}

          {camId === "cctv-4" && (
            // GATE WASHING MACHINE
            <div className="relative w-full h-full flex items-end justify-center pb-2">
              <div className={`absolute bottom-2 inset-x-0 h-[1.2px] ${filter === "night" ? "bg-emerald-800" : "bg-slate-800"}`}></div>
              
              {/* Heavy logistics truck being washed */}
              <div className={`absolute bottom-2 left-6 w-24 h-11 border ${filter === "night" ? "border-emerald-500 bg-emerald-950/50" : filter === "thermal" ? "border-purple-500 bg-purple-900/40" : "border-slate-600 bg-slate-800/40"} rounded p-1 flex flex-col justify-between`}>
                <div className="text-[5px] font-bold text-slate-400 leading-none">LOGISTICS TRUCK OUT</div>
                <div className="text-[4.8px] text-emerald-400 leading-none">云A·8R93Y</div>
                
                <div className="flex justify-around mt-1">
                  <div className={`w-2 h-2 rounded-full border border-dashed ${filter === "night" ? "border-emerald-400" : "border-slate-400 animate-spin"}`}></div>
                  <div className={`w-2 h-2 rounded-full border border-dashed ${filter === "night" ? "border-emerald-400" : "border-slate-400 animate-spin"}`}></div>
                </div>
              </div>

              {/* Water Sprinkler columns shooting from ground */}
              <div className="absolute bottom-1.5 inset-x-1 h-12 flex justify-between pointer-events-none select-none text-[4.5px] text-cyan-400 animate-pulse font-mono">
                <div className="flex flex-col gap-0.5">
                  <span>/// /// ///</span>
                  <span>/// /// ///</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span>\\\ \\\ \\\</span>
                  <span>\\\ \\\ \\\</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Ticking Timecode Overlay */}
        <div className="absolute bottom-2 right-2 text-[7px] font-mono text-slate-400 bg-black/60 px-1 py-0.5 rounded pointer-events-none font-bold">
          2026-06-02 {new Date().toLocaleTimeString()}
        </div>
      </div>
    );
  };

  // Recharts Trends for change trend bottom right
  const qualityTrendData = [
    { name: "8:00", value: 32 },
    { name: "9:00", value: 24 },
    { name: "10:00", value: 28 },
    { name: "11:00", value: 34 },
    { name: "12:00", value: 45 },
    { name: "13:00", value: 50 },
    { name: "14:00", value: 48 },
    { name: "15:00", value: 30 },
  ];

  // Document contents mapping for the environmental archives
  const documentContents: Record<string, { title: string; content: React.ReactNode }> = {
    "环保组织架构": {
      title: "华新禄劝企业环境保护管理体系组织架构",
      content: (
        <div className="space-y-4 font-sans text-xs">
          <div className="p-3 bg-cyan-950/30 border border-cyan-500/20 rounded-md">
            <span className="text-cyan-400 font-bold block mb-1">主控责任人（首席环保执行官）：</span>
            <p className="text-slate-200">总经理办公室 - 李宏伟（电话: 139-8802-9901）</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-2.5 bg-slate-900 border border-slate-800 rounded">
              <span className="text-emerald-400 font-bold block mb-0.5">无组织扬尘网格管控负责人</span>
              <p className="text-slate-300">保洁二班 - 赵铁民（138-1100-3324）</p>
              <p className="text-[10px] text-slate-500 mt-1">负责全厂大棚、运输皮带、洗车台抑尘设备调度。</p>
            </div>
            <div className="p-2.5 bg-slate-900 border border-slate-800 rounded">
              <span className="text-cyan-400 font-bold block mb-0.5">有组织连续监测联络官</span>
              <p className="text-slate-300">技术工程科 - 姚春明（135-2245-8811）</p>
              <p className="text-[10px] text-slate-500 mt-1">负责1#、2#回转窑尾CEMS排污口传输及质控自证工作。</p>
            </div>
            <div className="p-2.5 bg-slate-900 border border-slate-800 rounded">
              <span className="text-blue-400 font-bold block mb-0.5">门禁大宗物流安全稽查员</span>
              <p className="text-slate-300">保安科 - 马国强（136-1249-0099）</p>
              <p className="text-[10px] text-slate-500 mt-1">负责新能源及国六重卡绿通识别、道闸环保联动特批。</p>
            </div>
            <div className="p-2.5 bg-slate-900 border border-slate-800 rounded">
              <span className="text-amber-400 font-bold block mb-0.5">环境档案及排污许可专员</span>
              <p className="text-slate-300">行政内勤科 - 孙晓敏（139-5501-1188）</p>
              <p className="text-[10px] text-slate-500 mt-1">负责国家排污许可平台维护、环测报告登记与信息公开。</p>
            </div>
          </div>
          <div className="text-center p-2 border-t border-slate-900 mt-2 text-slate-500 text-[10px]">
            集团环境委员会监督电话：400-880-9001 (绿色热线)
          </div>
        </div>
      )
    },
    "企业环保档案": {
      title: "华新禄劝水泥厂区基础环保数字化档案",
      content: (
        <div className="space-y-3 font-sans text-xs text-slate-300">
          <table className="w-full text-left border-collapse border border-slate-800">
            <thead>
              <tr className="bg-slate-900 text-cyan-400 font-bold">
                <th className="p-2 border border-slate-800">指标类型</th>
                <th className="p-2 border border-slate-800">档案记载详情</th>
                <th className="p-2 border border-slate-800">核定状态</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900">
              <tr>
                <td className="p-2 border border-slate-800 font-bold text-slate-200">厂区成立与批复</td>
                <td className="p-2 border border-slate-800">一期技改熟料生产线、全负荷自闭式散装发线。</td>
                <td className="p-2 border border-slate-800 text-emerald-400">已批复已备案</td>
              </tr>
              <tr>
                <td className="p-2 border border-slate-800 font-bold text-slate-200">环保投资预算</td>
                <td className="p-2 border border-slate-800">累计环保基建、除尘及脱硝设备总投入 1.48 亿元。</td>
                <td className="p-2 border border-slate-800 text-emerald-400">资金落实100%</td>
              </tr>
              <tr>
                <td className="p-2 border border-slate-800 font-bold text-slate-200">废气核心处理设施</td>
                <td className="p-2 border border-slate-800">SNCR/SCR 联合脱硝系统两套 + 高效覆膜滤袋脉冲突击除尘器。</td>
                <td className="p-2 border border-slate-800 text-emerald-400">A级能效连通</td>
              </tr>
              <tr>
                <td className="p-2 border border-slate-800 font-bold text-slate-200">水气循环与固废</td>
                <td className="p-2 border border-slate-800">洗车与降尘水实现多级物理沉淀回收，危废库配备闭路自感应。</td>
                <td className="p-2 border border-slate-800 text-teal-400">零排放/自回收</td>
              </tr>
            </tbody>
          </table>
          <p className="text-[10.5px] text-slate-500 mt-2">最后核验时间：2026年Q1季报环保例行内审合格。</p>
        </div>
      )
    },
    "环评报告": {
      title: "建设项目环境影响评价报告及批复书(节选)",
      content: (
        <div className="space-y-4 font-sans text-xs text-slate-300">
          <div className="p-3 bg-slate-900 rounded border border-slate-800">
            <h5 className="font-bold text-slate-200 mb-1">《华新禄劝大宗固废技改暨超低排放智能化示范项目环评报告》</h5>
            <p className="text-slate-450 leading-relaxed">
              报告载明，本改造工程通过应用自主开发的空气动力雾化以及微波干雾抑尘，在矿山到生料仓全封闭皮带长廊设置高灵敏压接控尘，
              熟料回转窑尾实施两级催化还原SCR烟气脱硝改造，工艺达到行业顶级“ A级绿色绩效”标杆限值。
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 bg-sky-950/10 border border-sky-900/30 rounded">
              <span className="text-slate-500 block text-[10px]">编写单位</span>
              <span className="text-cyan-400 font-bold block mt-0.5">省环境科学研究院</span>
            </div>
            <div className="p-2 bg-sky-950/10 border border-sky-900/30 rounded">
              <span className="text-slate-500 block text-[10px]">环评文号</span>
              <span className="text-cyan-400 font-bold block mt-0.5">昆环审[2021]45号</span>
            </div>
            <div className="p-2 bg-sky-950/10 border border-sky-900/30 rounded">
              <span className="text-slate-500 block text-[10px]">核发机关</span>
              <span className="text-cyan-400 font-bold block mt-0.5">昆明市生态环境局</span>
            </div>
          </div>
        </div>
      )
    },
    "检测报告": {
      title: "企业委托型一季度厂区边界废气与噪声第三方检测报告",
      content: (
        <div className="space-y-3 font-sans text-xs text-slate-300">
          <p className="text-slate-400">
            本季检测报告由国家 CMA/CNAS 资质认可的第三方采样机构 **“谱尼测试股份有限公司昆明分院”** 承接。
          </p>
          <ul className="space-y-2">
            <li className="p-2 bg-slate-900 rounded border border-slate-850 flex justify-between items-center">
              <span>窑尾排气筒颗粒物比对 (流速/比对误差法)</span>
              <span className="text-emerald-400 font-mono font-bold">符合标准 (流失比对差值 &lt; 2%)</span>
            </li>
            <li className="p-2 bg-slate-900 rounded border border-slate-850 flex justify-between items-center">
              <span>厂界无组织总悬浮颗粒物 (TSP 24小时采样)</span>
              <span className="text-emerald-400 font-mono font-bold">监测值 72ug/m³ (限值 120ug/m³)</span>
            </li>
            <li className="p-2 bg-slate-900 rounded border border-slate-850 flex justify-between items-center">
              <span>四厂界夜间噪声声级 (Leq指数)</span>
              <span className="text-emerald-400 font-mono font-bold">42.5 dB(A) (国家一级隔音标杆符合)</span>
            </li>
          </ul>
        </div>
      )
    },
    "排污许可证": {
      title: "中华人民共和国排污许可证 (华新标本级正本)",
      content: (
        <div className="space-y-3 font-sans text-xs text-slate-300 leading-normal">
          <div className="p-3 bg-indigo-950/10 border border-indigo-900/30 rounded-md font-mono text-[11px] grid grid-cols-2 gap-4">
            <div>
              <span className="text-slate-500 block text-[10px]">排污证书编号:</span>
              <span className="text-slate-200 block font-bold mt-0.5">91530128MA6KZ39D16001P</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">主要排放物及代号:</span>
              <span className="text-slate-200 block font-bold mt-0.5">废气-SO2/NOx/烟尘 | DA001,DA002</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">发证机关:</span>
              <span className="text-indigo-400 block font-bold mt-0.5">昆明市生态环境局</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">有效截止日期:</span>
              <span className="text-emerald-450 block font-bold mt-0.5">2029年08月14日 (已延续换证)</span>
            </div>
          </div>
          <div className="p-2.5 bg-slate-900 text-slate-400 rounded text-[11px]">
            <span className="text-amber-500 font-bold block mb-1">超低排特别监管限值核定：</span>
            ● 回转窑尾主排气筒: 排放限值 颗粒物 &le; 10 mg/m³, 二氧化硫 &le; 35 mg/m³, 氮氧化物 &le; 50 mg/m³。
            24小时在线测算，对数不一致可自动熔断限产自控干预。
          </div>
        </div>
      )
    }
  };

  const handleOpenDoc = (category: string) => {
    setActiveDocCategory(category);
    setIsArchiveModalOpen(true);
  };

  return (
    <div id="gis-interactive-map-panel" className="relative transition-all duration-300 w-full min-h-0 bg-slate-950 flex flex-col font-sans select-none antialiased">
      
      {/* Primary 3-Column Dashboard Responsive Grid Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 flex-1 w-full min-h-0">
        
        {/* ==========================================
            LEFT COLUMN (Total width: 3/12 of viewport)
            ========================================== */}
        <div id="gis-surround-left-stats" className="lg:col-span-3 flex flex-col gap-3.5 overflow-y-auto pr-0.5 max-h-[820px] lg:max-h-[90vh]">
          
          {/* Card 1: 全厂设备汇总 (Total Factory Equipment) */}
          <div className="rounded bg-slate-900/60 border border-blue-950/40 p-3.5 shadow-md shadow-black/20 flex flex-col">
            <div className="border-b border-blue-950/60 pb-2 mb-3">
              <h3 className="text-xs font-semibold text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                <span className="h-3 w-1 bg-cyan-400 block rounded-full" />
                全厂设备汇总
              </h3>
            </div>

            {/* Grid of 6 equipment categories and their counts */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-slate-950/80 border border-slate-900 rounded p-2 flex flex-col items-center justify-center">
                <Wind className="h-5 w-5 text-cyan-400 mb-1" />
                <span className="text-[10px] text-slate-400">雾炮</span>
                <span className="text-sm font-semibold font-mono text-cyan-400 mt-0.5">4个</span>
              </div>
              <div className="bg-slate-950/80 border border-slate-900 rounded p-2 flex flex-col items-center justify-center">
                <Activity className="h-5 w-5 text-cyan-400 mb-1" />
                <span className="text-[10px] text-slate-400">环境检测仪</span>
                <span className="text-sm font-semibold font-mono text-cyan-400 mt-0.5">24个</span>
              </div>
              <div className="bg-slate-950/80 border border-slate-900 rounded p-2 flex flex-col items-center justify-center">
                <Eye className="h-5 w-5 text-amber-500 mb-1" />
                <span className="text-[10px] text-slate-400">鹰眼</span>
                <span className="text-sm font-semibold font-mono text-amber-500 mt-0.5">6个</span>
              </div>
              <div className="bg-slate-950/80 border border-slate-900 rounded p-2 flex flex-col items-center justify-center">
                <LayersIcon className="h-5 w-5 text-cyan-400 mb-1" />
                <span className="text-[10px] text-slate-400">干雾抑尘</span>
                <span className="text-sm font-semibold font-mono text-cyan-400 mt-0.5">10个</span>
              </div>
              <div className="bg-slate-950/80 border border-slate-900 rounded p-2 flex flex-col items-center justify-center">
                <Truck className="h-5 w-5 text-emerald-400 mb-1" />
                <span className="text-[10px] text-slate-400">洗车机</span>
                <span className="text-sm font-semibold font-mono text-emerald-400 mt-0.5">5个</span>
              </div>
              <div className="bg-slate-950/80 border border-slate-900 rounded p-2 flex flex-col items-center justify-center">
                <Shield className="h-5 w-5 text-amber-500 mb-1" />
                <span className="text-[10px] text-slate-400">岗哨</span>
                <span className="text-sm font-semibold font-mono text-amber-500 mt-0.5">6个</span>
              </div>
            </div>
          </div>

          {/* Card 2: 清洁运输状态 + 排放达标率 (Donut Rings + DB Stack in a single split panel) */}
          <div className="rounded bg-slate-900/60 border border-blue-950/40 p-3.5 shadow-md shadow-black/20 flex flex-col">
            <div className="grid grid-cols-2 gap-3 divide-x divide-blue-950/40">
              
              {/* Left: Clean Transport Donuts */}
              <div className="pr-1 flex flex-col justify-between">
                <h4 className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <span className="h-2 w-0.5 bg-cyan-400" />
                  清洁运输状态
                </h4>
                
                <div className="flex flex-col gap-2 font-mono text-[10.5px]">
                  <div className="flex items-center gap-2">
                    <div className="relative h-9 w-9 flex-shrink-0">
                      <svg width="36" height="36" viewBox="0 0 36 36" className="transform -rotate-90">
                        <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(30, 41, 59, 0.4)" strokeWidth="3" />
                        <circle cx="18" cy="18" r="14" fill="none" stroke="#22d3ee" strokeWidth="3" strokeDasharray="62, 100" />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center text-[8px] text-cyan-400 font-bold font-sans">汽</div>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block font-sans">汽运保洁</span>
                      <span className="text-slate-100 font-extrabold text-[11px]">220 次</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative h-9 w-9 flex-shrink-0">
                      <svg width="36" height="36" viewBox="0 0 36 36" className="transform -rotate-90">
                        <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(30, 41, 59, 0.4)" strokeWidth="3" />
                        <circle cx="18" cy="18" r="14" fill="none" stroke="#0284c7" strokeWidth="3" strokeDasharray="45, 100" />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center text-[8px] text-blue-400 font-bold font-sans">铁</div>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block font-sans">铁运煤焦</span>
                      <span className="text-slate-100 font-extrabold text-[11px]">153 次</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: DB stack for 排放达标率 (Emission Compliance) */}
              <div className="pl-3 flex flex-col items-center justify-between">
                <h4 className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider mb-1 self-start flex items-center gap-1.5">
                  <span className="h-2 w-0.5 bg-cyan-400" />
                  排放达标率
                </h4>

                <div className="flex flex-col items-center text-center mt-1">
                  {/* Glowing vertical 3D green database plate stack */}
                  <div className="relative h-15 w-18 flex items-center justify-center">
                    <svg width="60" height="50" viewBox="0 0 60 50" className="opacity-95">
                      <defs>
                        <linearGradient id="dbGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#10b981" />
                          <stop offset="100%" stopColor="#064e3b" />
                        </linearGradient>
                      </defs>
                      {/* Top Plate */}
                      <path d="M 5,10 Q 30,2 55,10 Q 55,16 30,22 Q 5,16 5,10" fill="url(#dbGrad)" stroke="#34d399" strokeWidth="1" />
                      {/* Mid Plate */}
                      <path d="M 5,20 Q 30,12 55,20 Q 55,26 30,32 Q 5,26 5,20" fill="url(#dbGrad)" stroke="#34d399" strokeWidth="1" />
                      {/* Bottom Plate */}
                      <path d="M 5,30 Q 30,22 55,30 Q 55,36 30,42 Q 5,36 5,30" fill="url(#dbGrad)" stroke="#34d399" strokeWidth="1" />
                    </svg>
                    {/* compliance text overlay */}
                    <div className="absolute inset-0 flex flex-col justify-center items-center font-mono">
                      <span className="text-emerald-400 font-black text-xs leading-none drop-shadow">100%</span>
                      <span className="text-[8px] text-emerald-200 mt-1 leading-none font-sans scale-90">国标标杆</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Card 3: 环境管理档案 (Environmental Management Archives with popup files) */}
          <div className="rounded bg-slate-900/60 border border-blue-950/40 p-3.5 shadow-md shadow-black/20 flex flex-col">
            <div className="border-b border-blue-950/60 pb-2 mb-2.5 flex items-center justify-between">
              <h3 className="text-xs font-semibold text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                <span className="h-3 w-1 bg-cyan-400 block rounded-full" />
                环境管理档案
              </h3>
              <button
                onClick={() => handleOpenDoc("环保组织架构")}
                className="bg-cyan-950/70 text-cyan-400 border border-cyan-800/60 hover:bg-cyan-900 flex items-center gap-1.5 px-2 py-1 rounded text-[9.5px] cursor-pointer transition-colors"
              >
                <FolderOpen className="h-3 w-3" />
                <span>档案详情</span>
              </button>
            </div>

            {/* Fast document buttons layout */}
            <div className="flex flex-col gap-1.5 font-sans text-xs">
              <button
                onClick={() => handleOpenDoc("环保组织架构")}
                className="w-full text-left py-1.5 px-2.5 rounded bg-slate-950/70 border border-slate-900 hover:border-cyan-500/30 text-slate-300 hover:text-cyan-400 transition-colors flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-450" />
                  <span>环保组织架构</span>
                </div>
                <ArrowUpRight className="h-3.5 w-3.5 opacity-40 text-cyan-450" />
              </button>

              <button
                onClick={() => handleOpenDoc("企业环保档案")}
                className="w-full text-left py-1.5 px-2.5 rounded bg-slate-950/70 border border-slate-900 hover:border-cyan-500/30 text-slate-300 hover:text-cyan-400 transition-colors flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-450" />
                  <span>企业环保档案</span>
                </div>
                <ArrowUpRight className="h-3.5 w-3.5 opacity-40 text-cyan-450" />
              </button>

              <button
                onClick={() => handleOpenDoc("环评报告")}
                className="w-full text-left py-1.5 px-2.5 rounded bg-slate-950/70 border border-slate-900 hover:border-cyan-500/30 text-slate-300 hover:text-cyan-400 transition-colors flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-450" />
                  <span>环评报告书</span>
                </div>
                <ArrowUpRight className="h-3.5 w-3.5 opacity-40 text-cyan-450" />
              </button>

              <button
                onClick={() => handleOpenDoc("检测报告")}
                className="w-full text-left py-1.5 px-2.5 rounded bg-slate-950/70 border border-slate-900 hover:border-cyan-500/30 text-slate-300 hover:text-cyan-400 transition-colors flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-450" />
                  <span>检测比对报告</span>
                </div>
                <ArrowUpRight className="h-3.5 w-3.5 opacity-40 text-cyan-450" />
              </button>

              <button
                onClick={() => handleOpenDoc("排污许可证")}
                className="w-full text-left py-1.5 px-2.5 rounded bg-slate-950/70 border border-slate-900 hover:border-cyan-500/30 text-slate-300 hover:text-cyan-400 transition-colors flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-450" />
                  <span>排污许可证</span>
                </div>
                <ArrowUpRight className="h-3.5 w-3.5 opacity-40 text-cyan-450" />
              </button>
            </div>
          </div>

          {/* Card 4: 有组织采样点 与 无组织排放点位 (Isometric Stacked pyramids side by side) */}
          <div className="rounded bg-slate-900/60 border border-blue-950/40 p-3.5 shadow-md shadow-black/20 flex flex-col">
            <div className="grid grid-cols-2 gap-3 divide-x divide-blue-950/40 h-full">
              
              {/* Left Pyramid: 有组织采样点 */}
              <div className="pr-1 flex flex-col justify-between">
                <h4 className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <span className="h-2 w-0.5 bg-cyan-400" />
                  有组织采样点
                </h4>

                {/* 3-Level Cyan Pyramid rendered with pure SVG and pointer lines */}
                <div className="relative h-28 w-full mt-1">
                  <svg width="100%" height="100%" viewBox="0 0 100 80" className="overflow-visible">
                    {/* Pyramid Level 1 (Top) */}
                    <polygon points="50,5 40,20 60,20" fill="rgba(6, 182, 212, 0.85)" stroke="#22d3ee" strokeWidth="0.5" />
                    {/* Pyramid Level 2 (Mid) */}
                    <polygon points="38,22 62,22 66,42 34,42" fill="rgba(6, 182, 212, 0.55)" stroke="#22d3ee" strokeWidth="0.5" />
                    {/* Pyramid Level 3 (Bottom) */}
                    <polygon points="32,44 68,44 74,68 26,68" fill="rgba(6, 182, 212, 0.25)" stroke="#22d3ee" strokeWidth="0.5" />

                    {/* Connecting Pointer Lines */}
                    {/* Line 1 (Top Level) */}
                    <polyline points="50,12 85,12 85,10" stroke="#0ea5e9" strokeWidth="0.5" fill="none" />
                    <text x="86" y="21" fill="#22d3ee" className="font-sans text-[6px] font-bold">1个</text>
                    
                    {/* Line 2 (Mid Level) */}
                    <polyline points="50,32 85,32 85,30" stroke="#0ea5e9" strokeWidth="0.5" fill="none" />
                    <text x="86" y="41" fill="#22d3ee" className="font-sans text-[6px] font-bold">2个</text>

                    {/* Line 3 (Bottom Level) */}
                    <polyline points="50,56 85,56 85,54" stroke="#0ea5e9" strokeWidth="0.5" fill="none" />
                    <text x="86" y="65" fill="#22d3ee" className="font-sans text-[6px] font-bold">6个</text>
                  </svg>
                  {/* labels labels */}
                  <div className="absolute top-1 left-0 flex flex-col justify-between h-5/6 text-[7.5px] text-slate-450 leading-[25px]">
                    <span className="block font-sans">采样点</span>
                    <span className="block font-sans">采样孔</span>
                    <span className="block font-sans">采样平台</span>
                  </div>
                </div>
              </div>

              {/* Right Pyramid: 无组织排放点位 */}
              <div className="pl-3 flex flex-col justify-between">
                <h4 className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <span className="h-2 w-0.5 bg-cyan-400" />
                  无组织排放点位
                </h4>

                {/* 4-Level Green/Emerald Pyramid */}
                <div className="relative h-28 w-full mt-1">
                  <svg width="100%" height="100%" viewBox="0 0 100 80" className="overflow-visible">
                    {/* Level 1 (Top) */}
                    <polygon points="50,2 42,14 58,14" fill="rgba(16, 185, 129, 0.9)" stroke="#34d399" strokeWidth="0.5" />
                    {/* Level 2 */}
                    <polygon points="40,16 60,16 64,30 36,30" fill="rgba(16, 185, 129, 0.65)" stroke="#34d399" strokeWidth="0.5" />
                    {/* Level 3 */}
                    <polygon points="34,32 66,32 70,48 30,48" fill="rgba(16, 185, 129, 0.4)" stroke="#34d399" strokeWidth="0.5" />
                    {/* Level 4 (Bottom) */}
                    <polygon points="28,50 72,50 76,68 24,68" fill="rgba(16, 185, 129, 0.15)" stroke="#34d399" strokeWidth="0.5" />

                    {/* Connecting Pointer Lines */}
                    <polyline points="50,8 88,8 88,6" stroke="#10b981" strokeWidth="0.5" fill="none" />
                    <text x="88" y="14" fill="#34d399" className="font-sans text-[6px] font-bold">12个</text>

                    <polyline points="50,23 88,23 88,21" stroke="#10b981" strokeWidth="0.5" fill="none" />
                    <text x="88" y="29" fill="#34d399" className="font-sans text-[6px] font-bold">20个</text>

                    <polyline points="50,40 88,40 88,38" stroke="#10b981" strokeWidth="0.5" fill="none" />
                    <text x="88" y="46" fill="#34d399" className="font-sans text-[6px] font-bold">67个</text>

                    <polyline points="50,59 88,59 88,57" stroke="#10b981" strokeWidth="0.5" fill="none" />
                    <text x="88" y="65" fill="#34d399" className="font-sans text-[6px] font-bold">262个</text>
                  </svg>
                  {/* labels labels */}
                  <div className="absolute top-0.5 left-0 flex flex-col justify-between h-[90%] text-[7.5px] text-slate-450 leading-[21px]">
                    <span className="block font-sans">除尘</span>
                    <span className="block font-sans">存储</span>
                    <span className="block font-sans">工艺</span>
                    <span className="block font-sans">输送</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div> {/* ends Left Column */}


        {/* ==========================================
            CENTER COLUMN (Total width: 6/12 of viewport)
            ========================================== */}
        <div id="gis-surround-center-twin" className="lg:col-span-6 flex flex-col gap-3.5 h-full">
          
          {/* Main 3D Satellite Map Container */}
          <div className="relative flex-1 rounded border border-blue-950 bg-slate-950 overflow-hidden shadow-2xl flex flex-col min-h-[460px] lg:min-h-0">
            
            {/* Title Overlay: "三维管控一张图" center-top (fixed HUD) */}
            <div className="absolute top-4 inset-x-0 flex justify-center pointer-events-none z-20">
              <div className="px-5 py-1.5 bg-slate-950/90 border border-cyan-800/60 rounded flex items-center gap-2 shadow-lg">
                <Layers className="h-4 w-4 text-cyan-400" />
                <span className="font-sans text-xs font-bold tracking-widest text-cyan-400">三维管控一张图</span>
              </div>
            </div>

            {/* Satellite Factory Image Background element with Zoom & Pan */}
            <div
              className={`relative w-full h-full flex-1 overflow-hidden select-none ${
                isDraggingMap ? "cursor-grabbing" : "cursor-grab"
              }`}
              onMouseDown={handleMapMouseDown}
              onMouseMove={handleMapMouseMove}
              onMouseUp={handleMapMouseUp}
              onMouseLeave={handleMapMouseLeave}
              onWheel={handleMapWheel}
            >
              <div
                style={{
                  transform: `translate(${mapPanX}px, ${mapPanY}px) scale(${mapZoom})`,
                  transformOrigin: "center center",
                  transition: isDraggingMap ? "none" : "transform 0.1s ease-out",
                }}
                className="w-full h-full relative"
              >
                <img
                  src={mapBg}
                  alt="华新禄劝三维管控底图"
                  className="w-full h-full object-cover opacity-85 select-none pointer-events-none"
                  referrerPolicy="no-referrer"
                />

              {/* CONCENTRIC PULSING RED HOTSPOTS Overlaid exactly like the screenshot */}
              {/* Hotspot 1: Raw Materials Yard */}
              <div
                className="absolute"
                style={{ top: "35%", left: "58%" }}
                onClick={() => setSelectedHotspot("raw-materials")}
              >
                <div className="relative flex items-center justify-center cursor-pointer">
                  <div className="absolute h-8 w-8 rounded-full bg-red-500/20 animate-ping" />
                  <div className="absolute h-5 w-5 rounded-full bg-red-500/40 animate-pulse-ring" />
                  <div className="h-2.5 w-2.5 rounded-full bg-red-500 border border-white" />
                  {selectedHotspot === "raw-materials" && (
                    <div className="absolute -bottom-10 bg-slate-950/90 border border-red-500 text-[9.5px] p-1.5 rounded whitespace-nowrap text-red-400 font-bold z-20">
                      有组织排放：DA001窑尾烟气采样
                    </div>
                  )}
                </div>
              </div>

              {/* Hotspot 2: Rotary Kiln Center */}
              <div
                className="absolute"
                style={{ top: "48%", left: "68%" }}
                onClick={() => setSelectedHotspot("rotary-kiln")}
              >
                <div className="relative flex items-center justify-center cursor-pointer">
                  <div className="absolute h-8 w-8 rounded-full bg-orange-500/20 animate-ping" />
                  <div className="absolute h-5 w-5 rounded-full bg-orange-500/40 animate-pulse-ring" />
                  <div className="h-2.5 w-2.5 rounded-full bg-orange-500 border border-white" />
                  {selectedHotspot === "rotary-kiln" && (
                    <div className="absolute -bottom-10 bg-slate-950/90 border border-orange-500 text-[9.5px] p-1.5 rounded whitespace-nowrap text-orange-400 font-bold z-20">
                      无组织扬尘：熟料集约地仓网格
                    </div>
                  )}
                </div>
              </div>

              {/* Hotspot 3: Crusher section */}
              <div
                className="absolute"
                style={{ top: "52%", left: "32%" }}
                onClick={() => setSelectedHotspot("crusher")}
              >
                <div className="relative flex items-center justify-center cursor-pointer">
                  <div className="absolute h-8 w-8 rounded-full bg-red-500/20 animate-ping" />
                  <div className="absolute h-5 w-5 rounded-full bg-red-500/40 animate-pulse-ring" />
                  <div className="h-2.5 w-2.5 rounded-full bg-red-500 border border-white" />
                  {selectedHotspot === "crusher" && (
                    <div className="absolute -bottom-10 bg-slate-950/90 border border-red-500 text-[9.5px] p-1.5 rounded whitespace-nowrap text-red-500 font-bold z-20">
                      无组织尘源：破碎投料区抑尘重锁
                    </div>
                  )}
                </div>
              </div>


              {/* INTERACTIVE GEOLOCATIONAL PINS ON MAP */}
              {/* Overlay standard interactive layers based on active toggle */}
              <div className="absolute inset-0 pointer-events-auto">
                <svg className="w-full h-full" viewBox="0 0 1000 500" preserveAspectRatio="none">
                  
                  {/* Heatmap density transparent polygons when toggled with Red to Yellow to Blue gradients */}
                  {activeLayer === "heatmap" && (
                    <>
                      {/* Heavy industrial zones: Rotary Kilns and limestone crusher hopper stack */}
                      <circle cx="580" cy="150" r="130" fill="url(#pollutionHeat)" />
                      <circle cx="315" cy="255" r="145" fill="url(#pollutionHeat)" />
                      <circle cx="675" cy="215" r="125" fill="url(#pollutionHeat)" />
                      <circle cx="745" cy="175" r="115" fill="url(#pollutionHeat)" />
                      <circle cx="882" cy="305" r="95" fill="url(#pollutionHeat)" />
                      
                      {/* Quiet/low emission administration building & green zone (fades into cyan/blue) */}
                      <circle cx="145" cy="105" r="90" fill="url(#pollutionHeatClean)" />
                    </>
                  )}

                  <defs>
                    {/* Multi-stop color radial gradient demonstrating high red, medium yellow, clean blue transitions */}
                    <radialGradient id="pollutionHeat" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="rgba(220, 38, 38, 0.85)" />     {/* Deep Red (high pollution) */}
                      <stop offset="25%" stopColor="rgba(239, 68, 68, 0.65)" />    {/* Red */}
                      <stop offset="55%" stopColor="rgba(234, 179, 8, 0.45)" />    {/* Orange-Yellow (medium) */}
                      <stop offset="85%" stopColor="rgba(14, 165, 233, 0.2)" />    {/* Light Blue (low) */}
                      <stop offset="100%" stopColor="rgba(14, 165, 233, 0.0)" />    {/* Transparent */}
                    </radialGradient>
                    <radialGradient id="pollutionHeatClean" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="rgba(14, 165, 233, 0.45)" />    {/* Clean Blue */}
                      <stop offset="65%" stopColor="rgba(59, 130, 246, 0.15)" />    {/* Faded blue */}
                      <stop offset="100%" stopColor="rgba(59, 130, 246, 0.0)" />    {/* Transparent */}
                    </radialGradient>
                    <radialGradient id="sprayerMist" cx="50%" cy="0%" r="95%" fx="50%" fy="0%">
                      <stop offset="0%" stopColor="rgba(20, 184, 166, 0.45)" />
                      <stop offset="65%" stopColor="rgba(34, 211, 238, 0.15)" />
                      <stop offset="100%" stopColor="rgba(34, 211, 238, 0.0)" />
                    </radialGradient>
                  </defs>

                  {/* A. 监测设备 Layer (CEMS Stacks & Micro Dust Ground Sensors) */}
                  {(activeLayer === "monitoring" || activeLayer === "all") && cemsStacks.map((c) => {
                    const coords = cemsCoordinates[c.id];
                    if (!coords) return null;
                    const isSelected = selectedPin?.type === "cems" && selectedPin?.data?.id === c.id;
                    const isRunning = c.status === "running";
                    return (
                      <g
                        key={`cems-pin-${c.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPin({ type: "cems", data: c });
                        }}
                        className="cursor-pointer group"
                      >
                        {/* pulsing highlight base ring */}
                        {isRunning && (
                          <circle cx={coords.x} cy={coords.y} r="16" fill="rgba(6, 182, 212, 0.12)" className="animate-pulse" />
                        )}
                        {/* Chimney Body Silhouette */}
                        <polygon
                          points={`${coords.x - 4},${coords.y + 8} ${coords.x - 2},${coords.y - 10} ${coords.x + 2},${coords.y - 10} ${coords.x + 4},${coords.y + 8}`}
                          fill="#334155"
                          stroke={isSelected ? "#22d3ee" : "#475569"}
                          strokeWidth="1"
                        />
                        {/* Monitor housing */}
                        <rect x={coords.x - 6} y={coords.y - 15} width="12" height="5" rx="1" fill={isRunning ? "#0891b2" : "#64748b"} stroke="#ffffff" strokeWidth="0.4" />
                        
                        {/* Pulsing laser beam emitter dome */}
                        <circle cx={coords.x} cy={coords.y - 12} r="1.5" fill={isRunning ? "#22d3ee" : "#94a3b8"} className={isRunning ? "animate-ping" : ""} />
                        <circle cx={coords.x} cy={coords.y - 12} r="1.5" fill={isRunning ? "#22d3ee" : "#94a3b8"} />
                        
                        {/* Simple Stack Title tag */}
                        <rect x={coords.x - 26} y={coords.y + 10} width="52" height="10" rx="1.5" fill="rgba(15, 23, 42, 0.88)" stroke={isSelected ? "#22d3ee" : "#1e293b"} strokeWidth="0.5" />
                        <text x={coords.x} y={coords.y + 17} textAnchor="middle" fill={isSelected ? "#22d3ee" : "#cbd5e1"} className="font-mono text-[6px] font-bold">
                          {c.id === "cems-1" ? "1# 窑头" : c.id === "cems-2" ? "2# 窑尾" : c.id === "cems-3" ? "煤磨除尘" : c.id === "cems-4" ? "成品磨A" : c.id === "cems-5" ? "破碎除尘" : "应急旁路"}
                        </text>
                      </g>
                    );
                  })}

                  {(activeLayer === "monitoring" || activeLayer === "all") && dustSensors.map((d) => {
                    const coords = dustCoordinates[d.id];
                    if (!coords) return null;
                    const isSelected = selectedPin?.type === "dust" && selectedPin?.data?.id === d.id;
                    
                    const getStatusColor = () => {
                      if (d.status === "error") return "#f43f5e"; // Red
                      if (d.status === "warning") return "#f59e0b"; // Orange
                      return "#10b981"; // Green
                    };
                    const badgeColor = getStatusColor();

                    return (
                      <g
                        key={`dust-pin-${d.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPin({ type: "dust", data: d });
                        }}
                        className="cursor-pointer group"
                      >
                        {/* Breathing highlight */}
                        <circle cx={coords.x} cy={coords.y} r="12" fill={`${badgeColor}0d`} className="animate-pulse" />
                        <line x1={coords.x} y1={coords.y} x2={coords.x} y2={coords.y + 9} stroke="#64748b" strokeWidth="0.8" />
                        
                        {/* Station globe */}
                        <circle cx={coords.x} cy={coords.y} r="5" fill="#0f172a" stroke={isSelected ? "#22d3ee" : badgeColor} strokeWidth="1" />
                        <circle cx={coords.x} cy={coords.y} r="2" fill={badgeColor} />
                        
                        {/* Floating live PM val banner */}
                        <rect x={coords.x - 22} y={coords.y - 14} width="44" height="9" rx="1" fill="rgba(15, 23, 42, 0.9)" stroke={isSelected ? "#22d3ee" : badgeColor} strokeWidth="0.5" />
                        <text x={coords.x} y={coords.y - 8} textAnchor="middle" fill="#22d3ee" className="font-mono text-[5.8px] font-bold">
                          TSP: {d.tsp}
                        </text>
                      </g>
                    );
                  })}


                  {/* B. 生产设备 Layer (North-Star RTK Global Location Cleanup Vehicles) */}
                  {(activeLayer === "production" || activeLayer === "all") && cleaningVehicles.map((v, idx) => {
                    // Position calculations mapped to 1000x500 svg frame
                    const vx = Math.floor(v.latitude * 9 + idx * 8);
                    const vy = Math.floor(v.longitude * 4.2 + 25);
                    const isWorking = v.status === "working";
                    const isSelected = selectedPin?.type === "vehicle" && selectedPin?.data?.id === v.id;

                    return (
                      <g
                        key={`v-${v.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPin({ type: "vehicle", data: v });
                        }}
                        className="cursor-pointer"
                      >
                        {isWorking && (
                          <g>
                            {/* Blinking signal beacon */}
                            <circle cx={vx} cy={vy} r="15" fill="rgba(56, 189, 248, 0.15)" className="animate-pulse" />
                            {/* Water plume spraying path tails */}
                            <path
                              d={`M ${vx - 10} ${vy} Q ${vx - 18} ${vy + 4} ${vx - 24} ${vy + 8} M ${vx - 10} ${vy + 2} Q ${vx - 16} ${vy + 7} ${vx - 22} ${vy + 11}`}
                              stroke="rgba(14, 165, 233, 0.5)"
                              strokeWidth="1"
                              fill="none"
                              className="animate-pulse"
                            />
                          </g>
                        )}
                        {/* Vehicle cabin polygon */}
                        <polygon
                          points={`${vx - 8},${vy - 5} ${vx + 8},${vy - 5} ${vx + 11},${vy} ${vx + 8},${vy + 5} ${vx - 8},${vy + 5} ${vx - 11},${vy}`}
                          fill={isWorking ? "#0284c7" : "#475569"}
                          stroke={isSelected ? "#22d3ee" : "#f1f5f9"}
                          strokeWidth="0.8"
                        />
                        {/* Front wheels & indicators */}
                        <circle cx={vx + 6} cy={vy + 5} r="1.5" fill="#020617" />
                        <circle cx={vx - 6} cy={vy + 5} r="1.5" fill="#020617" />
                        
                        <text x={vx} y={vy + 2} fill="#ffffff" textAnchor="middle" className="font-sans text-[5.5px] font-extrabold scale-90">
                          {v.type === "sprinkler" ? "洒水" : v.type === "sweeper" ? "扫清" : "抑尘"}
                        </text>
                        {/* Name tag */}
                        <text x={vx} y={vy - 8} fill="#22d3ee" textAnchor="middle" className="font-mono text-[6.5px] font-bold">
                          {v.name.slice(0, 3)}
                        </text>
                      </g>
                    );
                  })}


                  {/* C. 治理设备 Layer (High-Pressure Micro-Mist sprayers & Automated washers) */}
                  {(activeLayer === "treatment" || activeLayer === "all") && deviceLogs.filter(d => d.deviceType === "treatment").map((d) => {
                    const coords = treatmentCoordinates[d.id];
                    if (!coords) return null;
                    const isSelected = selectedPin?.type === "treatment" && selectedPin?.data?.id === d.id;
                    const isWarning = d.status === "warning";
                    const isOffline = d.status === "offline";
                    const isRunning = d.status === "normal" || d.status === "warning";

                    return (
                      <g
                        key={`treatment-${d.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPin({ type: "treatment", data: d });
                        }}
                        className="cursor-pointer"
                      >
                        {/* Expanding mist sprayer jet cone */}
                        {isRunning && (
                          <path
                            d={`M ${coords.x} ${coords.y} Q ${coords.x - 12} ${coords.y + 18} ${coords.x - 24} ${coords.y + 30} Q ${coords.x} ${coords.y + 36} ${coords.x + 24} ${coords.y + 30} Z`}
                            fill="url(#sprayerMist)"
                            className="opacity-45 animate-pulse"
                          />
                        )}
                        {/* Ground controller circular capsule */}
                        <circle cx={coords.x} cy={coords.y} r="8.5" fill="#020617" stroke={isSelected ? "#22d3ee" : isWarning ? "#d97706" : isOffline ? "#64748b" : "#0d9488"} strokeWidth="1" />
                        <circle cx={coords.x} cy={coords.y} r="3.5" fill={isOffline ? "#64748b" : isWarning ? "#f59e0b" : "#14b8a6"} className={isRunning ? "animate-pulse" : ""} />
                        
                        {/* Text Tag label */}
                        <rect x={coords.x - 30} y={coords.y - 20} width="60" height="9" rx="1" fill="rgba(2, 6, 23, 0.9)" stroke={isSelected ? "#22d3ee" : "#1e293b"} strokeWidth="0.5" />
                        <text x={coords.x} y={coords.y - 13} textAnchor="middle" fill="#2dd4bf" className="font-sans text-[5.8px] font-bold scale-90">
                          {d.deviceName.slice(0, 6)}
                        </text>
                      </g>
                    );
                  })}


                  {/* D. 监控设备 Layer (Camera feeds - clicks trigger video gameplay telemetry) */}
                  {(activeLayer === "cctv" || activeLayer === "all") && Object.entries(cctvCoordinates).map(([id, cam]) => {
                    const isSelected = selectedPin?.type === "video" && selectedPin?.data?.id === id;
                    return (
                      <g
                        key={`cctv-icon-${id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPin({ type: "video", data: { id, ...cam } });
                        }}
                        className="cursor-pointer"
                      >
                        {/* PTZ Cone direction projection layout */}
                        <path
                          d={`M ${cam.x} ${cam.y} L ${cam.x - 25} ${cam.y + 40} L ${cam.x + 25} ${cam.y + 40} Z`}
                          fill="rgba(99, 102, 241, 0.12)"
                          stroke="rgba(99, 102, 241, 0.05)"
                          strokeWidth="0.5"
                        />
                        {/* Blinking camera radar shield */}
                        <circle cx={cam.x} cy={cam.y} r="11" fill="rgba(99, 102, 241, 0.09)" className="animate-pulse" />
                        
                        {/* Camera shape */}
                        <circle cx={cam.x} cy={cam.y} r="6" fill="#1e1b4b" stroke={isSelected ? "#818cf8" : "#4f46e5"} strokeWidth="1" />
                        
                        {/* Flashing rec center LED */}
                        <circle cx={cam.x} cy={cam.y} r="1.8" fill="#f43f5e" className="animate-ping" />
                        <circle cx={cam.x} cy={cam.y} r="1.8" fill="#e0e7ff" />
                        
                        {/* Label */}
                        <rect x={cam.x - 22} y={cam.y - 15} width="44" height="8" rx="1" fill="rgba(15, 23, 42, 0.9)" stroke={isSelected ? "#818cf8" : "#4338ca"} strokeWidth="0.5" />
                        <text x={cam.x} y={cam.y - 9} textAnchor="middle" fill="#a5b4fc" className="font-sans text-[5.5px] font-bold">
                          {cam.feedText}
                        </text>
                      </g>
                    );
                  })}

                </svg>
              </div> {/* closes pointer-events-auto */}
            </div> {/* closes scale transform inner container */}
          </div> {/* closes dragging outer container */}

          {/* Floating Map Zoom/Pan Controls (stationary HUD) */}
          <div className="absolute bottom-20 right-4 flex flex-col gap-1.5 z-20 pointer-events-auto">
            <button
              onClick={handleZoomIn}
              className="p-1.5 rounded-md bg-slate-950/90 border border-cyan-800/60 hover:bg-cyan-950 text-cyan-400 hover:text-cyan-300 shadow-xl transition-colors cursor-pointer"
              title="放大"
            >
              <Plus className="h-4 w-4" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-1.5 rounded-md bg-slate-950/90 border border-cyan-800/60 hover:bg-cyan-950 text-cyan-400 hover:text-cyan-300 shadow-xl transition-colors cursor-pointer"
              title="缩小"
            >
              <Minus className="h-4 w-4" />
            </button>
            <button
              onClick={handleResetMap}
              className="p-1.5 rounded-md bg-slate-950/90 border border-cyan-800/60 hover:bg-cyan-950 text-cyan-400 hover:text-cyan-300 shadow-xl transition-colors cursor-pointer"
              title="重置视图"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>

          {/* Floating Device HUD Inspect Card (stationary HUD) */}
          {selectedPin && (
            <div className="absolute top-14 right-4 bottom-22 w-76 bg-slate-950/95 border border-cyan-500/35 rounded shadow-2xl z-30 flex flex-col text-xs text-slate-200 pointer-events-auto backdrop-blur-md transition-all duration-300 overflow-hidden">
              {/* Header */}
              <div className="bg-slate-900 border-b border-cyan-800/30 p-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-cyan-400 font-sans font-bold">
                  {selectedPin.type === "cems" && <Activity className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />}
                  {selectedPin.type === "dust" && <Wind className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />}
                  {selectedPin.type === "vehicle" && <Truck className="h-3.5 w-3.5 text-sky-400" />}
                  {selectedPin.type === "treatment" && <Wrench className="h-3.5 w-3.5 text-teal-400" />}
                  {selectedPin.type === "video" && <Video className="h-3.5 w-3.5 text-indigo-400" />}
                  <span className="truncate max-w-[190px]">
                    {selectedPin.data.name || selectedPin.data.deviceName || selectedPin.data.feedText || "设备详情"}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedPin(null)}
                  className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Content body */}
              <div className="p-3.5 flex-1 overflow-y-auto space-y-3.5 custom-scrollbar bg-slate-950/30">
                {selectedPin.type === "cems" && (
                  <div className="space-y-3">
                    <div className="text-[11px] text-slate-400 flex justify-between items-center bg-slate-900/40 p-2 rounded border border-slate-850">
                      <span>分配工段: {selectedPin.data.process}</span>
                      <span className={`px-1.5 py-0.5 rounded font-bold text-[9px] ${
                        selectedPin.data.status === "running" ? "bg-emerald-950/80 text-emerald-400 border border-emerald-800/60" :
                        selectedPin.data.status === "stopped" ? "bg-slate-950/80 text-slate-400 border border-slate-800" :
                        "bg-rose-950/80 text-rose-400 border border-rose-800/60"
                      }`}>
                        {selectedPin.data.status === "running" ? "● 运行中" :
                         selectedPin.data.status === "stopped" ? "○ 停机" : "▲ 故障"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px] bg-slate-900/20 p-2 rounded border border-slate-900/40">
                      <div>
                        <span className="text-slate-500 block">排污许可证号:</span>
                        <span className="font-mono text-slate-355 block truncate" title={selectedPin.data.permitNo}>
                          {selectedPin.data.permitNo || '已备案'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">应急旁路阀:</span>
                        <span className={`font-mono block ${selectedPin.data.bypassStatus === 'closed' ? 'text-emerald-400' : 'text-amber-500'}`}>
                          {selectedPin.data.bypassStatus === 'closed' ? '锁闭(安全)' : '已开启'}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      <span className="text-[11px] font-bold text-cyan-400 block tracking-wider font-sans">烟气在线监测因子</span>
                      {renderCemsParam("颗粒物 (烟尘)", selectedPin.data.pm, "mg/m³", 10)}
                      {renderCemsParam("二氧化硫 SO₂", selectedPin.data.so2, "mg/m³", 35)}
                      {renderCemsParam("氮氧化物 NOx", selectedPin.data.nox, "mg/m³", 50)}
                      {renderCemsParam("生料磨氨逃逸 NH₃", selectedPin.data.nh3 ?? 1.4, "mg/m³", 8)}
                      {renderCemsParam("烟筒一氧化碳 CO", selectedPin.data.co ?? 8.5, "mg/m³", 150)}
                    </div>

                    <div className="pt-2 border-t border-slate-900/60 grid grid-cols-3 gap-1 text-center text-[9.5px] font-mono">
                      <div className="bg-slate-900/40 p-1.5 rounded">
                        <span className="text-slate-500 text-[8px] block">排气流量</span>
                        <span className="text-slate-300 font-bold">{selectedPin.data.flowRate || 34200}</span>
                      </div>
                      <div className="bg-slate-900/40 p-1.5 rounded">
                        <span className="text-slate-500 text-[8px] block">烟气温度</span>
                        <span className="text-slate-300 font-bold">{selectedPin.data.temperature || 120}℃</span>
                      </div>
                      <div className="bg-slate-900/40 p-1.5 rounded">
                        <span className="text-slate-500 text-[8px] block">静压 kPa</span>
                        <span className="text-slate-300 font-bold">{selectedPin.data.pressure || -0.42}</span>
                      </div>
                    </div>
                  </div>
                )}

                {selectedPin.type === "dust" && (
                  <div className="space-y-3">
                    <div className="text-[11px] text-slate-400 flex justify-between items-center bg-slate-900/40 p-2 rounded border border-slate-850">
                      <span>监测点位: {selectedPin.data.area}</span>
                      <span className={`px-1.5 py-0.5 rounded font-bold text-[9px] ${
                        selectedPin.data.status === "normal" ? "bg-emerald-950/80 text-emerald-400 border border-emerald-800/60" :
                        selectedPin.data.status === "warning" ? "bg-amber-950/80 text-amber-500 border border-amber-800/60" :
                        "bg-rose-950/80 text-rose-400 border border-rose-800/60"
                      }`}>
                        {selectedPin.data.status === "normal" ? "● 正常" :
                         selectedPin.data.status === "warning" ? "▲ 预警" : "■ 报警"}
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      <span className="text-[11px] font-bold text-emerald-400 block tracking-wider font-sans">粉尘及无组织排放</span>
                      {renderDustParam("总悬浮颗粒物 TSP", selectedPin.data.tsp, "μg/m³", 120)}
                      {renderDustParam("可吸入颗粒物 PM10", selectedPin.data.pm10, "μg/m³", 80)}
                      {renderDustParam("细颗粒物 PM2.5", selectedPin.data.pm25, "μg/m³", 35)}
                    </div>

                    <div className="pt-2 border-t border-slate-900/60 text-[9.5px] space-y-1 text-slate-400 leading-relaxed font-mono">
                      <p>● 传感器: 高精光散射在线激光粉尘仪</p>
                      <p>● 活跃刷新: 2026-06-02 {selectedPin.data.lastActive || "08:53"}</p>
                      <p>● 自校正系数: K=1.0 稳定接入企业平台</p>
                    </div>
                  </div>
                )}

                {selectedPin.type === "vehicle" && (
                  <div className="space-y-3">
                    <div className="text-[11px] text-slate-400 flex flex-col gap-1 bg-slate-900/40 p-2.5 rounded border border-slate-850">
                      <div className="flex justify-between items-center text-slate-200">
                        <span className="font-bold">{selectedPin.data.name}</span>
                        <span className={`px-1.5 py-0.5 rounded font-bold text-[9px] ${
                          selectedPin.data.status === "working" ? "bg-emerald-950/80 text-emerald-400 border border-emerald-800/60" : "bg-slate-950/80 text-slate-400 border border-slate-800"
                        }`}>
                          {selectedPin.data.status === "working" ? "● 保洁作业中" : "○ 车辆待命"}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-450 font-mono">司机: {selectedPin.data.driver} ({selectedPin.data.phone})</span>
                    </div>

                    {/* Animated Water level box */}
                    <div className="flex items-center gap-2 bg-slate-900/30 p-2 rounded border border-slate-900/40">
                      <Droplet className="h-4 w-4 text-sky-400 animate-pulse" />
                      <div className="flex-1">
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-slate-450">水箱储水位</span>
                          <span className="text-sky-400 font-bold font-mono">{selectedPin.data.waterLevel}%</span>
                        </div>
                        <div className="h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-900">
                          <div 
                            className="h-full bg-sky-400 rounded-full bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)] bg-[length:10px_10px]" 
                            style={{ width: `${selectedPin.data.waterLevel}%` }} 
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10.5px]">
                      <div className="bg-slate-900/40 p-2 rounded border border-slate-900/40 font-mono">
                        <span className="text-slate-500 text-[8.5px] block">本日保洁里程</span>
                        <span className="text-slate-200 font-bold text-xs">{selectedPin.data.todayMileage || 24.5} <span className="text-[9px] text-slate-500">km</span></span>
                      </div>
                      <div className="bg-slate-900/40 p-2 rounded border border-slate-900/40 font-mono">
                        <span className="text-slate-500 text-[8.5px] block">本日洒水次数</span>
                        <span className="text-slate-200 font-bold text-xs">{selectedPin.data.todaySprays || 6} <span className="text-[9px] text-slate-500">次</span></span>
                      </div>
                      <div className="bg-slate-900/40 p-2 rounded border border-slate-900/50 col-span-2 flex justify-between items-center font-mono text-[9.5px]">
                        <span className="text-slate-500">车载北斗定位</span>
                        <span className="text-slate-355">X: {selectedPin.data.latitude.toFixed(1)} | Y: {selectedPin.data.longitude.toFixed(1)}</span>
                      </div>
                    </div>

                    <div className="bg-indigo-950/20 border border-indigo-900/40 rounded p-2 text-[10px] text-indigo-300 leading-normal font-sans">
                      <strong>北斗高精自主调频：</strong> 实时通过RTK毫米级回传定位信息，清扫保洁自动联动洒水，抑尘效率达95%以上。
                    </div>
                  </div>
                )}

                {selectedPin.type === "treatment" && (
                  <div className="space-y-3">
                    <div className="text-[11px] text-slate-400 flex justify-between items-center bg-slate-900/40 p-2 rounded border border-slate-850">
                      <span>治理站: {selectedPin.data.deviceName}</span>
                      <span className={`px-1.5 py-0.5 rounded font-bold text-[9px] ${
                        selectedPin.data.status === "normal" ? "bg-teal-950/80 text-teal-400 border border-teal-800/60" :
                        selectedPin.data.status === "warning" ? "bg-amber-950/80 text-amber-500 border border-amber-800/60" :
                        "bg-slate-950/80 text-slate-400 border border-slate-800"
                      }`}>
                        {selectedPin.data.status === "normal" ? "● 运行状态正常" : "○ 停机/离线"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10.5px] font-mono">
                      <div className="bg-slate-900/40 p-2 rounded border border-slate-900/40">
                        <span className="text-slate-500 text-[8.5px] block">工作电压</span>
                        <span className="text-slate-200 font-bold">{selectedPin.data.voltage || 382} V</span>
                      </div>
                      <div className="bg-slate-900/40 p-2 rounded border border-slate-900/40">
                        <span className="text-slate-500 text-[8.5px] block">额定工作电流</span>
                        <span className="text-slate-200 font-bold">{selectedPin.data.current || 14.5} A</span>
                      </div>
                      <div className="bg-slate-900/40 p-2 rounded border border-slate-900/40">
                        <span className="text-slate-500 text-[8.5px] block">累积运行耗电</span>
                        <span className="text-slate-200 font-bold">{selectedPin.data.powerCons || 48.5} kWh</span>
                      </div>
                      <div className="bg-slate-900/40 p-2 rounded border border-slate-900/40">
                        <span className="text-slate-500 text-[8.5px] block">累计消耗水量</span>
                        <span className="text-slate-200 font-bold">{selectedPin.data.waterCons || 5.2} m³</span>
                      </div>
                    </div>

                    <div className="bg-slate-900/30 p-2 rounded border border-slate-900/40 text-[10px] leading-relaxed text-slate-300 space-y-1">
                      <span className="text-teal-400 font-bold block">无组织微雾抑尘联动日志</span>
                      <p>● 08:32 强电柜绝缘检测通过</p>
                      <p>● 08:39 接收微站TSP阈值信号，二级雾化开阀</p>
                      <p>● 08:44 当前阀门回馈开度：100% (工作风压良好)</p>
                    </div>
                  </div>
                )}

                {selectedPin.type === "video" && (
                  <div className="space-y-3">
                    {/* Live stream */}
                    {renderCctvLiveFeed(selectedPin.data.id, cctvFilter)}

                    {/* Mode buttons */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] text-slate-500 font-bold block font-sans">鹰眼夜视红外云台模式</span>
                      <div className="flex gap-1 justify-between bg-slate-900/60 p-1 rounded border border-slate-850">
                        <button
                          onClick={() => setCctvFilter("normal")}
                          className={`flex-1 py-1 text-[9px] rounded font-semibold transition-all cursor-pointer ${
                            cctvFilter === "normal" ? "bg-indigo-600 text-white font-bold" : "text-slate-400 hover:bg-slate-800"
                          }`}
                        >
                          常规彩色
                        </button>
                        <button
                          onClick={() => setCctvFilter("night")}
                          className={`flex-1 py-1 text-[9px] rounded font-semibold transition-all cursor-pointer ${
                            cctvFilter === "night" ? "bg-emerald-800 text-white font-bold animate-pulse" : "text-slate-400 hover:bg-slate-800"
                          }`}
                        >
                          红外夜视
                        </button>
                        <button
                          onClick={() => setCctvFilter("thermal")}
                          className={`flex-1 py-1 text-[9px] rounded font-semibold transition-all cursor-pointer ${
                            cctvFilter === "thermal" ? "bg-purple-850 text-white font-bold" : "text-slate-400 hover:bg-slate-800"
                          }`}
                        >
                          红热成像
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1 text-[10px] text-slate-400 bg-slate-900/30 p-2 rounded border border-slate-900/40 leading-relaxed font-sans">
                      <p>监控代号: <span className="text-indigo-400 font-mono font-bold">CAM_0{selectedPin.data.id.split("-")[1]}</span></p>
                      <p>高清协议: Onvif Profile-S / GB28181冶金安防标</p>
                      <p>精准位置: {selectedPin.data.area}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

            {/* Bottom floating capsule bar: Map buttons controller */}
            <div className="absolute bottom-4 inset-x-0 flex justify-center z-10 px-4">
              <div className="rounded-full bg-slate-950/95 border border-cyan-800/40 p-1 flex items-center justify-around gap-1.5 w-full max-w-sm shadow-xl backdrop-blur-md">
                
                <button
                  onClick={() => {
                    setActiveLayer("monitoring");
                    setShowHeatmap(false);
                  }}
                  className={`flex-1 flex flex-col items-center justify-center rounded-full py-1 text-[10px] transition-colors cursor-pointer ${
                    activeLayer === "monitoring" ? "bg-cyan-950 text-cyan-400 font-bold" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Activity className="h-3.5 w-3.5" />
                  <span className="scale-90 font-sans mt-0.5">监测设备</span>
                </button>

                <button
                  onClick={() => {
                    setActiveLayer("production");
                    setShowHeatmap(false);
                  }}
                  className={`flex-1 flex flex-col items-center justify-center rounded-full py-1 text-[10px] transition-colors cursor-pointer ${
                    activeLayer === "production" ? "bg-cyan-950 text-cyan-400 font-bold" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Wrench className="h-3.5 w-3.5" />
                  <span className="scale-90 font-sans mt-0.5">生产设备</span>
                </button>

                <button
                  onClick={() => {
                    setActiveLayer("treatment");
                    setShowHeatmap(false);
                  }}
                  className={`flex-1 flex flex-col items-center justify-center rounded-full py-1 text-[10px] transition-colors cursor-pointer ${
                    activeLayer === "treatment" ? "bg-cyan-950 text-cyan-400 font-bold" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Droplet className="h-3.5 w-3.5" />
                  <span className="scale-90 font-sans mt-0.5">治理设备</span>
                </button>

                <button
                  onClick={() => {
                    setActiveLayer("cctv");
                    setShowHeatmap(false);
                  }}
                  className={`flex-1 flex flex-col items-center justify-center rounded-full py-1 text-[10px] transition-colors cursor-pointer ${
                    activeLayer === "cctv" ? "bg-indigo-950 text-indigo-400 font-bold" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Video className="h-3.5 w-3.5" />
                  <span className="scale-90 font-sans mt-0.5">监控设备</span>
                </button>

                <button
                  onClick={() => {
                    setActiveLayer("heatmap");
                  }}
                  className={`flex-1 flex flex-col items-center justify-center rounded-full py-1 text-[10px] transition-colors cursor-pointer ${
                    activeLayer === "heatmap" ? "bg-red-950 text-rose-400 font-bold animate-pulse" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Flame className="h-3.5 w-3.5" />
                  <span className="scale-90 font-sans mt-0.5">热力图</span>
                </button>

              </div>
            </div>

          </div> {/* ends satellite map container */}

        </div> {/* ends Center Column */}


        {/* ==========================================
            RIGHT COLUMN (Total width: 3/12 of viewport)
            ========================================== */}
        <div id="gis-surround-right-telemetry" className="lg:col-span-3 flex flex-col gap-3.5 overflow-y-auto pl-0.5 max-h-[820px] lg:max-h-[90vh]">
          
          {/* Card 1: 厂区重点位置监控 (CCTV Live Videos side-by-side) */}
          <div className="rounded bg-slate-900/60 border border-blue-950/40 p-3.5 shadow-md shadow-black/20 flex flex-col">
            <div className="border-b border-blue-950/60 pb-2 mb-3">
              <h3 className="text-xs font-semibold text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                <span className="h-3 w-1 bg-cyan-400 block rounded-full" />
                厂区重点位置监控
              </h3>
            </div>

            {/* Dual live streaming simulation camera feeds */}
            <div className="grid grid-cols-2 gap-2">
              
              {/* CCTV Monitor 1 */}
              <div className="rounded border border-blue-950 bg-black aspect-video relative overflow-hidden flex flex-col group">
                {/* scanline sweep anim */}
                <div className="absolute inset-x-0 h-px bg-cyan-400/20 top-0 animate-scanline pointer-events-none" />
                {/* live label */}
                <div className="absolute top-1 left-1.5 flex items-center gap-1 bg-black/60 px-1 rounded text-[7.5px] scale-90 font-mono text-emerald-400 z-10">
                  <span className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
                  <span>N1-窑尾排口</span>
                </div>
                {/* video content mock drawing */}
                <div className="flex-1 w-full h-full flex flex-col items-center justify-center bg-sky-950/5 font-mono select-none text-slate-700">
                  <Tv className="h-4 w-4 text-slate-800 animate-pulse" style={{ animationDuration: "2s" }} />
                  <span className="text-[6.5px] text-slate-600 block mt-1">云台水平巡踪</span>
                </div>
                {/* bottom cctv stats counter */}
                <div className="bg-slate-950/80 px-1 py-0.5 text-[7px] font-mono text-slate-500 flex justify-between border-t border-slate-900 z-10">
                  <span>FPS: 25.0</span>
                  <span>{formatTimecode(systemCounter)}</span>
                </div>
              </div>

              {/* CCTV Monitor 2 */}
              <div className="rounded border border-blue-950 bg-black aspect-video relative overflow-hidden flex flex-col group">
                <div className="absolute inset-x-0 h-px bg-cyan-400/20 top-0 animate-scanline pointer-events-none" />
                <div className="absolute top-1 left-1.5 flex items-center gap-1 bg-black/60 px-1 rounded text-[7.5px] scale-90 font-mono text-amber-500 z-10">
                  <span className="h-1 w-1 rounded-full bg-amber-500 animate-pulse" />
                  <span>N2-石灰石破碎</span>
                </div>
                <div className="flex-1 w-full h-full flex flex-col items-center justify-center bg-indigo-950/5 font-mono select-none text-slate-700">
                  <Tv className="h-4 w-4 text-slate-800 animate-pulse" style={{ animationDuration: "2.5s" }} />
                  <span className="text-[6.5px] text-slate-600 block mt-1">智能红外夜视</span>
                </div>
                <div className="bg-slate-950/80 px-1 py-0.5 text-[7px] font-mono text-slate-500 flex justify-between border-t border-slate-900 z-10">
                  <span>BIT: 1024k</span>
                  <span>{formatTimecode(systemCounter + 120)}</span>
                </div>
              </div>

            </div>
          </div>

          {/* Card 2: 无组织治理状态 (Bar Column Chart with neon gradient caps) */}
          <div className="rounded bg-slate-900/60 border border-blue-950/40 p-3.5 shadow-md shadow-black/20 flex flex-col">
            <div className="border-b border-blue-950/60 pb-2 mb-3 flex items-center justify-between">
              <h3 className="text-xs font-semibold text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                <span className="h-3 w-1 bg-cyan-400 block rounded-full" />
                无组织治理状态
              </h3>
              <div className="flex items-center gap-1 scale-95">
                <span className="h-2 w-2 rounded-full bg-cyan-400" />
                <span className="text-[8.5px] text-slate-450 font-sans">抑尘效能</span>
              </div>
            </div>

            {/* Flat SVG-constructed sleek columns bar chart with exact labels */}
            <div className="h-32 w-full mt-1.5">
              <svg width="100%" height="100%" viewBox="0 0 200 120" preserveAspectRatio="none">
                {/* Horizontal reference split lines */}
                <line x1="10" y1="20" x2="190" y2="20" stroke="rgba(30, 41, 59, 0.25)" strokeWidth="0.5" strokeDasharray="3 3" />
                <line x1="10" y1="50" x2="190" y2="50" stroke="rgba(30, 41, 59, 0.25)" strokeWidth="0.5" strokeDasharray="3 3" />
                <line x1="10" y1="80" x2="190" y2="80" stroke="rgba(30, 41, 59, 0.25)" strokeWidth="0.5" strokeDasharray="3 3" />
                <line x1="10" y1="100" x2="190" y2="100" stroke="rgba(30, 41, 59, 0.4)" strokeWidth="0.5" />

                <defs>
                  <linearGradient id="barCyber" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.95" />
                    <stop offset="60%" stopColor="#0891b2" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#0f172a" stopOpacity="0.1" />
                  </linearGradient>
                </defs>

                {/* Bar 1: 洒水车 (Height/Value: 90/180) */}
                <g className="cursor-pointer hover:opacity-80 transition-opacity">
                  <rect x="22" y="30" width="12" height="70" fill="url(#barCyber)" />
                  <rect x="22" y="28" width="12" height="2" fill="#22d3ee" /> {/* Cyan premium glow border cap */}
                  <text x="28" y="112" textAnchor="middle" fill="#94a3b8" className="font-sans text-[7.5px]">洒水车</text>
                  <text x="28" y="24" textAnchor="middle" fill="#22d3ee" className="font-mono text-[7px] font-bold">180</text>
                </g>

                {/* Bar 2: 清扫车 (Height/Value: 70/140) */}
                <g className="cursor-pointer hover:opacity-80 transition-opacity">
                  <rect x="58" y="45" width="12" height="55" fill="url(#barCyber)" />
                  <rect x="58" y="43" width="12" height="2" fill="#22d3ee" />
                  <text x="64" y="112" textAnchor="middle" fill="#94a3b8" className="font-sans text-[7.5px]">清扫车</text>
                  <text x="64" y="39" textAnchor="middle" fill="#22d3ee" className="font-mono text-[7px] font-bold">140</text>
                </g>

                {/* Bar 3: 防尘网 (Height/Value: 55/110) */}
                <g className="cursor-pointer hover:opacity-80 transition-opacity">
                  <rect x="94" y="55" width="12" height="45" fill="url(#barCyber)" />
                  <rect x="94" y="53" width="12" height="2" fill="#22d3ee" />
                  <text x="100" y="112" textAnchor="middle" fill="#94a3b8" className="font-sans text-[7.5px]">防尘网</text>
                  <text x="100" y="49" textAnchor="middle" fill="#22d3ee" className="font-mono text-[7px] font-bold">110</text>
                </g>

                {/* Bar 4: 重型卡车 (Height/Value: 40/80) */}
                <g className="cursor-pointer hover:opacity-80 transition-opacity">
                  <rect x="130" y="70" width="12" height="30" fill="url(#barCyber)" />
                  <rect x="130" y="68" width="12" height="2" fill="#22d3ee" />
                  <text x="136" y="112" textAnchor="middle" fill="#94a3b8" className="font-sans text-[7.5px]">重型卡车</text>
                  <text x="136" y="64" textAnchor="middle" fill="#22d3ee" className="font-mono text-[7px] font-bold">80</text>
                </g>

                {/* Bar 5: 中型卡车 (Height/Value: 32/65) */}
                <g className="cursor-pointer hover:opacity-80 transition-opacity">
                  <rect x="166" y="78" width="12" height="22" fill="url(#barCyber)" />
                  <rect x="166" y="76" width="12" height="2" fill="#22d3ee" />
                  <text x="172" y="112" textAnchor="middle" fill="#94a3b8" className="font-sans text-[7.5px]">中型卡车</text>
                  <text x="172" y="72" textAnchor="middle" fill="#22d3ee" className="font-mono text-[7px] font-bold">65</text>
                </g>
              </svg>
            </div>
          </div>

          {/* Card 3: 平均环境数据 (Three interactive circular gauges PM2.5/PM10/TSP side by side) */}
          <div className="rounded bg-slate-900/60 border border-blue-950/40 p-3.5 shadow-md shadow-black/20 flex flex-col">
            <div className="border-b border-blue-950/60 pb-2 mb-2.5 flex items-center justify-between">
              <h3 className="text-xs font-semibold text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                <span className="h-3 w-1 bg-cyan-400 block rounded-full" />
                平均环境数据
              </h3>
              {/* Legends color code */}
              <div className="flex items-center gap-2 text-[8px] font-sans scale-90">
                <div className="flex items-center gap-0.5"><span className="h-1.5 w-1.5 rounded-full bg-cyan-400" /><span>实时</span></div>
                <div className="flex items-center gap-0.5"><span className="h-1.5 w-1.5 rounded-full bg-amber-500" /><span>管控</span></div>
                <div className="flex items-center gap-0.5"><span className="h-1.5 w-1.5 rounded-full bg-red-500" /><span>国控</span></div>
              </div>
            </div>

            {/* Three gauges container */}
            <div className="grid grid-cols-3 gap-1.5 text-center mt-1">
              
              {/* Gauge 1: PM2.5 */}
              <div className="flex flex-col items-center">
                <div className="relative h-16 w-16 flex items-center justify-center">
                  <svg width="60" height="60" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(30, 41, 59, 0.6)" strokeWidth="1.5" />
                    {/* Ring indicator showing exceeded value: 80% */}
                    <circle cx="18" cy="18" r="15" fill="none" stroke="#22d3ee" strokeWidth="2" strokeDasharray="75, 100" strokeLinecap="round" className="transform -rotate-90 origin-center" />
                    <circle cx="18" cy="18" r="16.5" fill="none" stroke="#f59e0b" strokeWidth="0.5" strokeDasharray="3, 3" />
                  </svg>
                  {/* Gauge inner texts */}
                  <div className="absolute inset-0 flex flex-col justify-center items-center scale-90 font-mono">
                    <span className="text-cyan-400 font-extrabold text-[11px] leading-tight">80</span>
                    <span className="h-px w-5 bg-slate-800 my-0.5" />
                    <span className="text-slate-500 text-[8px] leading-tight">75</span>
                  </div>
                </div>
                <span className="text-[10px] text-slate-300 font-sans font-semibold mt-1">PM2.5</span>
                <span className="text-[7.5px] text-slate-500 font-sans mt-0.5 block">单位: ug/m³</span>
              </div>

              {/* Gauge 2: PM10 */}
              <div className="flex flex-col items-center">
                <div className="relative h-16 w-16 flex items-center justify-center">
                  <svg width="60" height="60" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(30, 41, 59, 0.6)" strokeWidth="1.5" />
                    {/* Ring indicator showing critical value: 100% */}
                    <circle cx="18" cy="18" r="15" fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="94, 100" strokeLinecap="round" className="transform -rotate-90 origin-center" />
                    <circle cx="18" cy="18" r="16.5" fill="none" stroke="#f59e0b" strokeWidth="0.5" strokeDasharray="3, 3" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col justify-center items-center scale-90 font-mono">
                    <span className="text-amber-500 font-extrabold text-[11px] leading-tight">100</span>
                    <span className="h-px w-5 bg-slate-800 my-0.5" />
                    <span className="text-slate-500 text-[8px] leading-tight">75</span>
                  </div>
                </div>
                <span className="text-[10px] text-slate-300 font-sans font-semibold mt-1">PM10</span>
                <span className="text-[7.5px] text-slate-500 font-sans mt-0.5 block">单位: ug/m³</span>
              </div>

              {/* Gauge 3: TSP */}
              <div className="flex flex-col items-center">
                <div className="relative h-16 w-16 flex items-center justify-center">
                  <svg width="60" height="60" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(30, 41, 59, 0.6)" strokeWidth="1.5" />
                    {/* Ring indicator showing safe value: 30% */}
                    <circle cx="18" cy="18" r="15" fill="none" stroke="#10b981" strokeWidth="2" strokeDasharray="35, 100" strokeLinecap="round" className="transform -rotate-90 origin-center" />
                    <circle cx="18" cy="18" r="16.5" fill="none" stroke="#f59e0b" strokeWidth="0.5" strokeDasharray="3, 3" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col justify-center items-center scale-90 font-mono">
                    <span className="text-emerald-400 font-extrabold text-[11px] leading-tight">30</span>
                    <span className="h-px w-5 bg-slate-800 my-0.5" />
                    <span className="text-slate-500 text-[8px] leading-tight">75</span>
                  </div>
                </div>
                <span className="text-[10px] text-slate-300 font-sans font-semibold mt-1">TSP</span>
                <span className="text-[7.5px] text-slate-500 font-sans mt-0.5 block">单位: ug/m³</span>
              </div>

            </div>
          </div>

          {/* Card 4: 厂区环境质量变化趋势 (Area Glowing Chart over time) */}
          <div className="rounded bg-slate-900/60 border border-blue-950/40 p-3.5 shadow-md shadow-black/20 flex flex-col">
            <div className="border-b border-blue-950/60 pb-2 mb-2.5">
              <h3 className="text-xs font-semibold text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                <span className="h-3 w-1 bg-cyan-400 block rounded-full" />
                厂区环境质量变化趋势
              </h3>
            </div>

            {/* Recharts Area Chart matching the screenshot wave */}
            <div className="h-28 w-full mt-1.5">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={qualityTrendData} margin={{ top: 5, right: 5, left: -38, bottom: -5 }}>
                  <defs>
                    <linearGradient id="colorWave" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0284c7" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#0284c7" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,58,138,0.15)" vertical={false} />
                  <XAxis dataKey="name" fontSize={7.5} stroke="#334155" />
                  <YAxis fontSize={7.5} stroke="#334155" />
                  <Tooltip contentStyle={{ backgroundColor: "#030712", borderColor: "#1e3a8a", borderRadius: "4px", fontSize: "10px" }} />
                  <Area type="monotone" dataKey="value" stroke="#38bdf8" strokeWidth={1.8} fillOpacity={1} fill="url(#colorWave)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div> {/* ends Right Column */}

      </div> {/* ends main grid container */}


      {/* ==========================================
          MODAL VIEWS (Archive, detail telemetry)
          ========================================== */}
      {isArchiveModalOpen && activeDocCategory && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 p-4 backdrop-blur-sm transition-all animate-fade-in">
          <div className="bg-slate-950 border-2 border-cyan-500/70 rounded-lg shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh] animate-scale-up">
            
            {/* Modal Header */}
            <div className="bg-slate-900 border-b border-cyan-800/60 p-3.5 flex items-center justify-between text-cyan-400">
              <span className="font-sans font-bold text-sm tracking-widest flex items-center gap-2.5">
                <FileText className="h-5 w-5 text-cyan-400" />
                {documentContents[activeDocCategory]?.title || "档案详情"}
              </span>
              <button
                onClick={() => setIsArchiveModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800/80 cursor-pointer transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Scroll Content */}
            <div className="p-5 overflow-y-auto max-h-[60vh] text-slate-100">
              {documentContents[activeDocCategory]?.content || (
                <p className="text-xs text-slate-400">未找到相关档案卷宗。</p>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-900/60 border-t border-slate-900 p-3.5 flex items-center justify-end">
              <button
                onClick={() => setIsArchiveModalOpen(false)}
                className="bg-cyan-950 text-cyan-400 border border-cyan-800/60 hover:bg-cyan-900 px-4 py-1.5 rounded text-xs font-semibold cursor-pointer tracking-wider"
              >
                确认关闭
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
