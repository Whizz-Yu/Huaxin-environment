/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
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
  BarChart,
  Bar,
  AreaChart,
  Area,
} from "recharts";
import {
  TrendingUp,
  Cpu,
  GraduationCap,
  Map,
  BookOpen,
  FolderCheck,
  Users,
  AlertTriangle,
  Download,
  Upload,
  Search,
  CheckCircle,
  FileSpreadsheet,
  MapPin,
  RefreshCw,
  Phone,
  Eye,
  Trash2,
  Bookmark,
  Waves,
  Navigation,
  Check,
  Info,
  Calendar,
  Layers,
  Wrench,
  X,
  Sparkles,
} from "lucide-react";

interface SmartControlProps {
  onAddLogMessage: (msg: string) => void;
}

// Sub-module types
type SubModuleType =
  | "pollution_trend"
  | "dust_database"
  | "management_level"
  | "dust_heatmap"
  | "smart_academy"
  | "archives_mgmt"
  | "spares_list"
  | "spares_mgmt";

export default function SmartControl({ onAddLogMessage }: SmartControlProps) {
  // Currently Active Sub-module tab
  const [activeSubTab, setActiveSubTab] = useState<SubModuleType>("pollution_trend");

  // 1. POLLUTION TREND STATE
  const [pollutionParam, setPollutionParam] = useState<"pm10" | "pm25" | "so2" | "nox" | "co">("pm10");
  const [pollutionSeason, setPollutionSeason] = useState<"all" | "h1" | "h2">("all");

  const monthlyPollutionData = [
    { name: "1月", pm10: 44, pm25: 18, so2: 12.1, nox: 35.5, co: 0.8 },
    { name: "2月", pm10: 48, pm25: 22, so2: 14.5, nox: 38.2, co: 0.9 },
    { name: "3月", pm10: 42, pm25: 19, so2: 13.0, nox: 34.0, co: 0.7 },
    { name: "4月", pm10: 38, pm25: 15, so2: 11.2, nox: 31.8, co: 0.6 },
    { name: "5月", pm10: 35, pm25: 14, so2: 10.5, nox: 29.5, co: 0.5 },
    { name: "6月", pm10: 31, pm25: 12, so2: 9.8, nox: 27.1, co: 0.5 },
    { name: "7月", pm10: 28, pm25: 11, so2: 8.5, nox: 25.0, co: 0.4 },
    { name: "8月", pm10: 29, pm25: 12, so2: 8.8, nox: 25.8, co: 0.4 },
    { name: "9月", pm10: 33, pm25: 14, so2: 10.1, nox: 28.5, co: 0.5 },
    { name: "10月", pm10: 36, pm25: 15, so2: 11.0, nox: 30.2, co: 0.6 },
    { name: "11月", pm10: 41, pm25: 17, so2: 12.8, nox: 33.4, co: 0.7 },
    { name: "12月", pm10: 45, pm25: 19, so2: 13.5, nox: 36.8, co: 0.8 },
  ];

  const filteredPollutionData = monthlyPollutionData.filter((_, idx) => {
    if (pollutionSeason === "h1") return idx < 6;
    if (pollutionSeason === "h2") return idx >= 6;
    return true;
  });

  const getParamLabel = (param: string) => {
    switch (param) {
      case "pm10": return "粉尘颗粒物 PM10 (µg/m³)";
      case "pm25": return "细颗粒物 PM2.5 (µg/m³)";
      case "so2": return "二氧化硫 SO2 (mg/m³)";
      case "nox": return "氮氧化物 NOx (mg/m³)";
      case "co": return "一氧化碳 CO (mg/m³)";
      default: return "";
    }
  };

  const getParamColor = (param: string) => {
    switch (param) {
      case "pm10": return "#06b6d4";
      case "pm25": return "#6366f1";
      case "so2": return "#2dd4bf";
      case "nox": return "#f43f5e";
      case "co": return "#eab308";
      default: return "#06b6d4";
    }
  };


  // 2. DUST COMP & EXPERIENCE DB STATE
  const [expertNote, setExpertNote] = useState("");
  const [selectedExpMonth, setSelectedExpMonth] = useState("6月");

  const [experienceDb, setExperienceDb] = useState([
    { id: "exp-1", month: "12月-2月", condition: "低温弱逆温，窑头余热配比不振", advice: "对高架脱硫脱硝系统提级喷洒，设定脱硝反应器入口阈值为NOx 290mg/m³以控阻断" },
    { id: "exp-2", month: "3月-5月", condition: "大风沙尘天气，大宗原料棚负荷过载", advice: "联动启动1区至5区高压微雾防尘帘，自动开启大卡车重型底盘高压清洗槽1.5倍泵频" },
    { id: "exp-3", month: "6月-8月", condition: "高温湿润气流，生料预均化棚易结潮", advice: "执行脉冲袋式除尘器高频气流反吹，压差界限调控于950Pa~1150Pa之间以保持优异抽风量" },
    { id: "exp-4", month: "9月-11月", condition: "干燥换季，熟料发运线及包装站过载", advice: "高空智能雷达抓拍降尘雾炮设定全自动循环航线巡航，定点锁定3#与4#包装漏口喷射" },
  ]);

  const yearlyDustComparison = [
    { name: "1月", year2024: 65, year2025: 58, year2026: 44, alarmLimit: 50 },
    { name: "2月", year2024: 70, year2025: 64, year2026: 48, alarmLimit: 50 },
    { name: "3月", year2024: 62, year2025: 55, year2026: 42, alarmLimit: 50 },
    { name: "4月", year2024: 58, year2025: 52, year2026: 38, alarmLimit: 50 },
    { name: "5月", year2024: 55, year2025: 48, year2026: 35, alarmLimit: 50 },
    { name: "6月", year2024: 48, year2025: 42, year2026: 31, alarmLimit: 50 }, // June 2026 current
    { name: "7月", year2024: 45, year2025: 39, year2026: null, alarmLimit: 50 },
    { name: "8月", year2024: 46, year2025: 41, year2026: null, alarmLimit: 50 },
    { name: "9月", year2024: 52, year2025: 46, year2026: null, alarmLimit: 50 },
    { name: "10月", year2024: 58, year2025: 49, year2026: null, alarmLimit: 50 },
    { name: "11月", year2024: 62, year2025: 54, year2026: null, alarmLimit: 50 },
    { name: "12月", year2024: 68, year2025: 59, year2026: null, alarmLimit: 50 },
  ];

  const handleAddExpertAdvice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expertNote) return;
    const item = {
      id: `exp-${Date.now()}`,
      month: selectedExpMonth,
      condition: "用户补充月份关联气温及工况",
      advice: expertNote,
    };
    setExperienceDb([item, ...experienceDb]);
    setExpertNote("");
    onAddLogMessage(`[粉尘治理经验库] 补充归档了${selectedExpMonth}对治方案: "${expertNote.slice(0, 20)}..."`);
  };


  // 3. ENVIRONMENTAL MANAGEMENT LEVEL STATE
  const [activePolicyTab, setActivePolicyTab] = useState<"overhaul" | "monitoring" | "appraisal" | "emergency">("overhaul");
  const [policySearchQuery, setPolicySearchQuery] = useState("");

  const hrPieColors = ["#6366f1", "#06b6d4", "#2dd4bf", "#64748b"];

  // Stateful registry of staff
  const [managementRegistry, setManagementRegistry] = useState([
    { id: "staff-1", role: "总负责人-环保委委员会会长", name: "曹工程师", level: "博士及研究生及以上", title: "首席技术决策" },
    { id: "staff-2", role: "专职环境工程师-采样与精标", name: "张强", level: "博士及研究生及以上", title: "中级过程控制工" },
    { id: "staff-3", role: "运维工段长-设施检修组", name: "王建国", level: "本科", title: "15年熟料运维经验" },
    { id: "staff-4", role: "门栓监控安全员-道闸特准者", name: "李金山", level: "大专/高职", title: "退伍军人" },
  ]);

  // Form states for adding personnel info
  const [newStaffName, setNewStaffName] = useState("");
  const [newStaffRole, setNewStaffRole] = useState("");
  const [newStaffLevel, setNewStaffLevel] = useState("本科");
  const [newStaffTitle, setNewStaffTitle] = useState("");

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName.trim() || !newStaffRole.trim()) {
      alert("请填写姓名与岗位角色信息");
      return;
    }
    const item = {
      id: `staff-${Date.now()}`,
      name: newStaffName,
      role: newStaffRole,
      level: newStaffLevel,
      title: newStaffTitle || "环保专员",
    };
    setManagementRegistry([...managementRegistry, item]);
    onAddLogMessage(`[人员录入] 成功录入核心环保管理岗位人员: ${newStaffName} (${newStaffRole}) 元数据已同步归册。`);
    // Clear form
    setNewStaffName("");
    setNewStaffRole("");
    setNewStaffTitle("");
  };

  // Dynamic Education background stats compiled from managementRegistry
  const educationStats = (() => {
    const levels = ["博士及研究生及以上", "本科", "大专/高职", "中专/技校"];
    const counts = { "博士及研究生及以上": 0, "本科": 0, "大专/高职": 0, "中专/技校": 0 };
    managementRegistry.forEach(p => {
      const lv = p.level as keyof typeof counts;
      if (counts[lv] !== undefined) {
        counts[lv]++;
      } else {
        counts["本科"]++;
      }
    });
    const total = managementRegistry.length || 1;
    return levels.map(lv => ({
      level: lv,
      count: counts[lv as keyof typeof counts] || 0,
      percent: parseFloat(((counts[lv as keyof typeof counts] / total) * 100).toFixed(1))
    }));
  })();

  // Institutions & regulations states (录入、检索、发布状态、一键发布、版本管理)
  const [policies, setPolicies] = useState([
    { id: "pol-1", title: "华新水泥(禄劝)设备设施检修与环保安全运行规章", category: "overhaul", content: "每季度组织窑尾和窑头除尘系统全封闭反吹阻力校验；每周校验催化吸收塔喷枪结垢并进行机械酸洗，保障吸收转化保持在98%以上高标区。", status: "已发布", version: "V2.4", date: "2026-02-10" },
    { id: "pol-2", title: "厂内有组织/无组织粉尘微波雷达联动遥感方案与监测规程", category: "monitoring", content: "设立高架烟囱CEMS分析站、厂区西门、厂区北门、原煤均化棚等8处网置传感器，Modbus-TCP每隔2.0秒电直连上送，实测校正折算标态值。", status: "已发布", version: "V1.8", date: "2026-03-01" },
    { id: "pol-3", title: "企业环境监督、日常环保红线考核监督与日常考评细则", category: "appraisal", content: "任何脱硝旁路非指令泄放超过3.0分钟、或洗车槽泥砂压出溢出北门道路，扣除当天工段长绩效，连续三次亮红将挂红牌停产整顿并解除相关岗位职责。", status: "草稿", version: "V1.0", date: "2026-05-15" },
    { id: "pol-4", title: "突发干旱及重度沙尘等恶劣环境条件下的环保应急预案", category: "emergency", content: "接收本市级特指重度气象预警后，要求在15分钟内联动提高活性大棚降尘压力阀块，大车出口限制通行，全员到位启动双流体全开降尘。", status: "草稿", version: "V1.1", date: "2026-05-28" }
  ]);

  // Form states for adding regulation/policies
  const [newPolicyTitle, setNewPolicyTitle] = useState("");
  const [newPolicyCategory, setNewPolicyCategory] = useState<"overhaul" | "monitoring" | "appraisal" | "emergency">("overhaul");
  const [newPolicyContent, setNewPolicyContent] = useState("");
  const [newPolicyVersion, setNewPolicyVersion] = useState("V1.0");

  const handleAddPolicy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPolicyTitle.trim() || !newPolicyContent.trim()) {
      alert("请填写制度名称和具体条款内容");
      return;
    }
    const item = {
      id: `pol-${Date.now()}`,
      title: newPolicyTitle,
      category: newPolicyCategory,
      content: newPolicyContent,
      status: "草稿", // Starts as Draft
      version: newPolicyVersion || "V1.0",
      date: new Date().toISOString().split("T")[0]
    };
    setPolicies([item, ...policies]);
    onAddLogMessage(`[制度录入] 成功录入新规章制度《${newPolicyTitle}》其初始状态为【草稿】。`);
    // Reset form
    setNewPolicyTitle("");
    setNewPolicyContent("");
    setNewPolicyVersion("V1.0");
  };

  const handleOneKeyPublishAll = () => {
    setPolicies(policies.map(p => ({ ...p, status: "已发布" })));
    onAddLogMessage(`[一键发布] 机制触发！所有处于草稿状态的低碳环保规章制度一键完成发布上线！`);
  };

  const handlePublishPolicy = (id: string, title: string) => {
    setPolicies(policies.map(p => p.id === id ? { ...p, status: "已发布" } : p));
    onAddLogMessage(`[制度发布] 规章《${title}》已被单独审核签发，即刻生效！`);
  };

  const handleUpgradePolicyVersion = (id: string, currentVer: string) => {
    const mainNum = parseFloat(currentVer.replace(/[^\d.]/g, "")) || 1.0;
    const nextVer = `V${(mainNum + 0.1).toFixed(1)}`;
    setPolicies(policies.map(p => p.id === id ? { ...p, version: nextVer, date: new Date().toISOString().split("T")[0] } : p));
    onAddLogMessage(`[制度版本更新] 制度升级: ${currentVer} -> ${nextVer} (编制签认通过)`);
  };


  // Stateful maintenance repair ledger (检修台账)
  const [maintenanceLedger, setMaintenanceLedger] = useState([
    { id: "maint-1", name: "1#窑尾有组织CEMS采样探针酸洗维护", device: "CEMS分析仪", staff: "张强", date: "2026-05-10", status: "完成", version: "V1.1", issue: "探头冷凝器结垢，导致采样温度有些许漂移，已做清理", alertLevel: "normal" },
    { id: "maint-2", name: "中转走廊密闭防爆大袋除尘器滤袋整舱更换", device: "脉冲袋式除尘器", staff: "王建国", date: "2026-05-25", status: "运行中", version: "V2.0", issue: "第3区滤袋微破损、有阻力泄漏风险。检修班组提级更换", alertLevel: "warning" },
    { id: "maint-3", name: "北门加压道路大洗车槽高压加压电控水泵维保", device: "高压加压泵", staff: "孙立杰", date: "2026-06-02", status: "待维护", version: "V1.0", issue: "潜水泵电动机外壳绝缘电阻偏低(低于0.5MΩ)，若大风沙尘天气易发跳闸！", alertLevel: "danger" }
  ]);

  // Form states for maintenance ledger new entry & status updating & version control
  const [newMaintName, setNewMaintName] = useState("");
  const [newMaintDevice, setNewMaintDevice] = useState("CEMS分析仪");
  const [newMaintStaff, setNewMaintStaff] = useState("");
  const [newMaintIssue, setNewMaintIssue] = useState("");
  const [newMaintAlertLevel, setNewMaintAlertLevel] = useState<"normal" | "warning" | "danger">("normal");

  // Selection for active ledger entry editing details
  const [activeLedgerEditId, setActiveLedgerEditId] = useState<string | null>(null);
  const [editLgStatus, setEditLgStatus] = useState("待维护");
  const [editLgIssue, setEditLgIssue] = useState("");
  const [editLgVersion, setEditLgVersion] = useState("V1.0");

  const handleAddLedger = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMaintName.trim() || !newMaintStaff.trim()) {
      alert("请填写检修记录名称与填报人");
      return;
    }
    const item = {
      id: `maint-${Date.now()}`,
      name: newMaintName,
      device: newMaintDevice,
      staff: newMaintStaff,
      date: new Date().toISOString().split("T")[0],
      status: "待维护",
      version: "V1.0",
      issue: newMaintIssue || "日常例行点检，暂未上报严重设备安全异常",
      alertLevel: newMaintAlertLevel
    };
    setMaintenanceLedger([item, ...maintenanceLedger]);
    onAddLogMessage(`[台账新建] 成功建立《${newMaintName}》检修运维台账，安全风险设为 [${newMaintAlertLevel === "danger" ? "高危隐患" : newMaintAlertLevel === "warning" ? "中度预警" : "正常点检"}]。`);
    // Clear form
    setNewMaintName("");
    setNewMaintStaff("");
    setNewMaintIssue("");
    setNewMaintAlertLevel("normal");
  };

  const handleUpdateLedger = (id: string, status: string, issue: string, version: string) => {
    setMaintenanceLedger(prev =>
      prev.map(item => {
        if (item.id === id) {
          onAddLogMessage(`[台账更新] 《${item.name}》台账已更新: 状态->${status}, 升级版本->${version}`);
          return {
            ...item,
            status,
            issue,
            version
          };
        }
        return item;
      })
    );
    setActiveLedgerEditId(null);
  };

  const handleUpgradeLedgerVersion = (id: string, currentVer: string) => {
    const currentNum = parseFloat(currentVer.replace(/[^\d.]/g, "")) || 1.0;
    const nextVer = `V${(currentNum + 0.1).toFixed(1)}`;
    setMaintenanceLedger(prev =>
      prev.map(item => {
        if (item.id === id) {
          onAddLogMessage(`[台账版本升级] 《${item.name}》版本号升级: ${currentVer} 增加升级到 ${nextVer}`);
          return { ...item, version: nextVer };
        }
        return item;
      })
    );
  };


  // 4. DUST POLLUTION HEATMAP STATE
  const [activeHeatmapPollutant, setActiveHeatmapPollutant] = useState<"pm10" | "pm25" | "tsp">("pm10");
  const [simulatedWind, setSimulatedWind] = useState<"none" | "north" | "east">("none");
  const [sprayActivated, setSprayActivated] = useState<boolean>(false);

  // Layout zones for heatmap
  const plantZones = [
    { id: "coal_yard", name: "1# 原煤储存棚区", x: "12%", y: "15%", pm10Base: 42, pm25Base: 18, tspBase: 65 },
    { id: "crusher", name: "二级破碎进料仓", x: "45%", y: "18%", pm10Base: 115, pm25Base: 45, tspBase: 175 },
    { id: "additive_shed", name: "辅料均化大棚", x: "15%", y: "45%", pm10Base: 38, pm25Base: 15, tspBase: 54 },
    { id: "belts_corridor", name: "皮带中转廊道", x: "42%", y: "48%", pm10Base: 55, pm25Base: 22, tspBase: 88 },
    { id: "clinker_kiln", name: "回转窑头篦冷机", x: "78%", y: "22%", pm10Base: 145, pm25Base: 58, tspBase: 230 },
    { id: "clinker_silo", name: "深坑圆库出料口", x: "82%", y: "55%", pm10Base: 245, pm25Base: 98, tspBase: 380 },
    { id: "pack_station", name: "包装与袋装线", x: "75%", y: "80%", pm10Base: 64, pm25Base: 28, tspBase: 98 },
    { id: "east_gate", name: "北门车辆加压洗车槽", x: "45%", y: "82%", pm10Base: 19, pm25Base: 8, tspBase: 31 },
  ];


  // 5. SMART ACADEMY STATE
  const [selectedAcademyMat, setSelectedAcademyMat] = useState<string>("CEMS烟气监测分析仪巡检与洗刷视频.mp4");
  const [traineeLearningHours, setTraineeLearningHours] = useState([
    { range: "<5 小时", count: 5, value: 5, fill: "#e2e8f0" },
    { range: "5-10 小时", count: 12, value: 12, fill: "#38bdf8" },
    { range: "10-20 小时", count: 8, value: 8, fill: "#6366f1" },
    { range: "20 小时以上", count: 5, value: 5, fill: "#2dd4bf" },
  ]);

  // Beautiful interactive study resource ledger (支持录入、更新、查看下载)
  const [academyResources, setAcademyResources] = useState([
    { id: "acad-1", title: "2#窑尾环保主脉冲式除尘阀组安全操作手册.pdf", type: "pdf", count: 128, priv: "1级运维", downloadCount: 45, date: "2025-04-12", version: "V1.0", author: "曹工" },
    { id: "acad-2", title: "CEMS高架烟气在线校验规程与气池校正指南.pdf", type: "pdf", count: 95, priv: "专职检测员", downloadCount: 32, date: "2025-06-18", version: "V1.3", author: "曹工" },
    { id: "acad-3", title: "双流体活性抑尘干雾管路阀块拆装解剖手册.pdf", type: "pdf", count: 74, priv: "2级运维", downloadCount: 19, date: "2025-08-30", version: "V1.0", author: "王班长" },
    { id: "acad-4", title: "全厂北斗GPS特种保洁洒水车GIS终端出线指南.pdf", type: "pdf", count: 48, priv: "保洁司机", downloadCount: 12, date: "2026-01-10", version: "V1.0", author: "李队长" },
    { id: "acad-5", title: "CEMS烟气监测分析仪巡检与洗刷视频.mp4", type: "video", count: 184, priv: "高级专家讲解", downloadCount: 88, date: "2025-10-05", version: "V2.1", author: "张专家" },
    { id: "acad-6", title: "活性微米干雾压差自校验一键操作流程演示.mp4", type: "video", count: 142, priv: "厂内演习录屏", downloadCount: 51, date: "2025-11-20", version: "V1.0", author: "徐排长" },
  ]);

  // Form states for adding resource
  const [newAcadTitle, setNewAcadTitle] = useState("");
  const [newAcadType, setNewAcadType] = useState<"pdf" | "video">("pdf");
  const [newAcadPriv, setNewAcadPriv] = useState("1级运维");
  const [newAcadAuthor, setNewAcadAuthor] = useState("");

  const handleAddAcadResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAcadTitle.trim()) {
      alert("请输入资料标题名称");
      return;
    }
    const item = {
      id: `acad-${Date.now()}`,
      title: newAcadTitle + (newAcadType === "pdf" ? ".pdf" : ".mp4"),
      type: newAcadType,
      count: 0,
      priv: newAcadPriv,
      downloadCount: 0,
      date: new Date().toISOString().split("T")[0],
      version: "V1.0",
      author: newAcadAuthor || "常设讲师"
    };
    setAcademyResources([item, ...academyResources]);
    onAddLogMessage(`[学院资料录入] 成功收归并录入了新微课材料《${item.title}》分发权限：${newAcadPriv}。`);
    // Clear
    setNewAcadTitle("");
    setNewAcadAuthor("");
  };

  const handleSimulateAcadDownload = (id: string, title: string) => {
    setAcademyResources(prev =>
      prev.map(r => r.id === id ? { ...r, downloadCount: r.downloadCount + 1, count: r.count + 1 } : r)
    );
    onAddLogMessage(`[学院资料下载] 查看下传: 会员在线下载《${title}》对仗表记数增加1。`);
    alert(`【智慧学院云仓下载】\n正在缓存并检索本地存储证书：${title}\n当前已安全分发完毕。`);
  };

  const handleUpgradeAcadVersion = (id: string, title: string, currentVer: string) => {
    const curNum = parseFloat(currentVer.replace(/[^\d.]/g, "")) || 1.0;
    const nextVer = `V${(curNum + 0.1).toFixed(1)}`;
    setAcademyResources(prev =>
      prev.map(r => r.id === id ? { ...r, version: nextVer, date: new Date().toISOString().split("T")[0] } : r)
    );
    onAddLogMessage(`[学院资料更新] 《${title}》的版本号由 ${currentVer} 递进更新为新迭代版本 ${nextVer}`);
  };


  const [simulatedTraineeLogs, setSimulatedTraineeLogs] = useState([
    { id: "t-1", name: "高强", matName: "CEMS在线校验指南", studyTime: 24, status: "学习结束" },
    { id: "t-2", name: "李小明", matName: "活性抑尘干雾操作手册", studyTime: 8, status: "进行中...📖" },
    { id: "t-3", name: "陈师傅", matName: "高架除尘反吹指南", studyTime: 15, status: "进行中...📖" },
  ]);

  const handleSimulateStudy = (traineeName: string) => {
    setSimulatedTraineeLogs(prev =>
      prev.map(t => {
        if (t.name === traineeName) {
          const addedHours = 2; // Add 2 hours of simulated time
          onAddLogMessage(`[智慧学院] 实时记录: 运维技术员 ${t.name} 完成学习模块，培训时长增加 2h!`);
          return {
            ...t,
            studyTime: t.studyTime + addedHours,
            status: "刚更新学时 ✔️"
          };
        }
        return t;
      })
    );
    
    // Increment stats
    setTraineeLearningHours(prev =>
      prev.map((item, idx) => {
        if (idx === 2) {
          return { ...item, count: item.count + 1, value: item.value + 1 };
        }
        return item;
      })
    );
  };


  // 6. DAILY ENVIRONMENTAL ARCHIVE & REPORT EXPORT STATE
  const [selectedFileCategory, setSelectedFileCategory] = useState<string>("ALL");
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(-1);

  const [archivesList, setArchivesList] = useState([
    { id: "file-1", title: "华新禄劝250万吨水泥熟料超低排放技改造环评书及复批意见.pdf", category: "环评报告", size: "45.2 MB", uploaderName: "曹工", date: "2025-04-12", status: "已发布", version: "V1.0" },
    { id: "file-2", title: "云南省生态环境管理厅核发 华新禄劝排污许可证 2026版.pdf", category: "排污许可证", size: "12.8 MB", uploaderName: "刘安全", date: "2026-01-05", status: "已发布", version: "V2.0" },
    { id: "file-3", title: "二季度高架烟气CEMS比对检测与实测合规检测报告.pdf", category: "检测报告", size: "8.4 MB", uploaderName: "张检测", date: "2026-05-20", status: "草稿", version: "V1.1" },
    { id: "file-4", title: "厂内有组织/无组织粉尘密闭重构及双流体降尘组织架构细则.pdf", category: "环保组织架构", size: "3.5 MB", uploaderName: "张强", date: "2025-08-30", status: "已发布", version: "V1.2" },
    { id: "file-5", title: "2026年度 厂区环境整体管理水平及全岗专职监督核考准则.pdf", category: "企业环境应急预案", size: "6.1 MB", uploaderName: "曹工", date: "2026-02-15", status: "草稿", version: "V1.0" },
    { id: "file-6", title: "华新禄劝万吨标低碳节能超低改造阶段性工程简介白皮书.pdf", category: "企业简介", size: "22.5 MB", uploaderName: "宣传科", date: "2025-01-10", status: "已发布", version: "V1.0" },
  ]);

  // Archive Form adding
  const [newArchTitle, setNewArchTitle] = useState("");
  const [newArchCategory, setNewArchCategory] = useState("检测报告");
  const [newArchSize, setNewArchSize] = useState("4.5 MB");
  const [newArchUploader, setNewArchUploader] = useState("张强");

  const handleUploadArchive = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newArchTitle.trim()) {
      alert("请输入档案标题名称");
      return;
    }
    const item = {
      id: `file-${Date.now()}`,
      title: newArchTitle + ".pdf",
      category: newArchCategory,
      size: newArchSize || "1.5 MB",
      uploaderName: newArchUploader || "环保委",
      date: new Date().toISOString().split("T")[0],
      status: "草稿",
      version: "V1.0"
    };
    setArchivesList([item, ...archivesList]);
    onAddLogMessage(`[环保归档] 成功归档上传了日常环境报告《${item.title}》当前状态：【草稿】。`);
    setNewArchTitle("");
  };

  const handlePublishArchive = (id: string, title: string) => {
    setArchivesList(prev =>
      prev.map(file => file.id === id ? { ...file, status: "已发布" } : file)
    );
    onAddLogMessage(`[环保归档发布] 档案《${title}》已审核通过并向国家及省厅企业环保档案中心在线公开！`);
  };

  const handleUpgradeArchiveVersion = (id: string, title: string, currentVer: string) => {
    const numPart = parseFloat(currentVer.replace(/[^\d.]/g, "")) || 1.0;
    const nextVer = `V${(numPart + 0.1).toFixed(1)}`;
    setArchivesList(prev =>
      prev.map(file => file.id === id ? { ...file, version: nextVer, date: new Date().toISOString().split("T")[0] } : file)
    );
    onAddLogMessage(`[环保档案版本升级] 档案《${title}》升级：由原来的 ${currentVer} 顺利并轨到最新版 ${nextVer}`);
  };

  const handleSimulateDropFile = (e: React.DragEvent) => {
    e.preventDefault();
    const item = {
      id: `file-drop-${Date.now()}`,
      title: "日常运维在线抓拍粉尘数值归档报告_2026_06.pdf",
      category: "检测报告",
      size: "2.1 MB",
      uploaderName: "曹工",
      date: "2026-06-04",
      status: "已发布",
      version: "V1.0"
    };
    setArchivesList([item, ...archivesList]);
    onAddLogMessage(`[文档档案库] 通过拖拽核验归档了：${item.title}`);
  };

  const handleSimulateDownloadFile = (title: string) => {
    onAddLogMessage(`[文档安全下载] 成功对加密文件 ${title} 派发数字凭证，下传下载任务建立。`);
    alert(`【电子档案下传】\n已生成电子合规印旁批。\n正在下载：${title}`);
  };

  const handleSimulateDeleteFile = (id: string, title: string) => {
    setArchivesList(prev => prev.filter(f => f.id !== id));
    onAddLogMessage(`[档案注销] 从环保卡库注销了档案: ${title}`);
  };

  // Simulated Report Exporter Process
  const handleExportAllReports = () => {
    setExportProgress(0);
    onAddLogMessage(`[综合报表一键导出] 正在汇总CEMS数据、无组织扬尘、清洁卡口通行等五大重要环保指标...`);
    
    const interval = setInterval(() => {
      setExportProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          onAddLogMessage(`[导出成功] 环保综合档案报表编译完毕。打包保存在 downloads/HXLQ_Environmental_Comp_2026.zip`);
          setTimeout(() => setExportProgress(-1), 3500);
          return 100;
        }
        return prev + 25;
      });
    }, 600);
  };


  // 7. REAL-TIME RESIDENT OPERATOR POSITIONING LEDGER STATE (备品备件清单 tab)
  const [operatingStaffLocList, setOperatingStaffLocList] = useState([
    { name: "王建国", job: "窑尾脱硝工艺师", phone: "13888325942", status: "在岗巡检中", place: "2#回转窑尾B段 3F" },
    { name: "张强", job: "CEMS分析校验工", phone: "13566124501", status: "故障抢修中", place: "1#窑头有组织采样间" },
    { name: "赵博", job: "中控网关工程师", phone: "18123049581", status: "在岗中控配频", place: "智能环保控制室 1F" },
    { name: "孙立杰", job: "喷雾自清洗维保员", phone: "17724108845", status: "常驻在岗备勤", place: "1#原料码头大门" },
    { name: "刘保全", job: "洒水清洁总调度员", phone: "13919456021", status: "在岗巡检中", place: "洗车平台及防尘闸" },
  ]);

  const [operatorSearchText, setOperatorSearchText] = useState("");

  const handleSimulatePingOperator = (name: string) => {
    onAddLogMessage(`[考勤定位核验] 向驻点工程师 【${name}】 发送下行北斗握手握手电波。`);
    // Randomize location slightly to simulate live tracking
    setOperatingStaffLocList(prev =>
      prev.map(s => {
        if (s.name === name) {
          return {
            ...s,
            place: s.place.includes("A段") ? "2#回转窑尾B段 3F" : s.place.includes("1F") ? "智能环保控制室 2F" : s.place
          };
        }
        return s;
      })
    );
  };


  // 8. SPARE PARTS PROCUREMENT CONTROL STATE
  const [sparesStockList, setSparesStockList] = useState([
    { id: "sp-1", name: "2#回转窑尾PPS阻燃耐磨高温滤袋", category: "袋式除尘耗材", remaining: 450, limit: 500, unit: "条", statusCode: "low" },
    { id: "sp-2", name: "微米级高效双流体雾化抑尘喷枪喷咀", category: "无组织防尘件", remaining: 45, limit: 80, unit: "个", statusCode: "low" },
    { id: "sp-3", name: "CEMS红外气体池光谱分析检测窗口石英片", category: "精密监测配件", remaining: 12, limit: 10, unit: "块", statusCode: "ok" },
    { id: "sp-4", name: "道路洗车槽32KW潜水电控防爆加压泵", category: "流体泵组硬件", remaining: 2, limit: 3, unit: "台", statusCode: "low" },
    { id: "sp-5", name: "高效防磨碳化硅喷嘴护套", category: "脱硝吸收塔件", remaining: 180, limit: 150, unit: "只", statusCode: "ok" },
    { id: "sp-6", name: "活性大分子湿法脱硫酸碱碱液阀隔膜", category: "脱硫自控核心", remaining: 5, limit: 8, unit: "组", statusCode: "low" },
  ]);

  const handleProcureItem = (id: string, name: string) => {
    setSparesStockList(prev =>
      prev.map(item => {
        if (item.id === id) {
          onAddLogMessage(`[备件自动消红] 已经向后台采购提报订货合同！自主调拨增加 120 数量。`);
          return {
            ...item,
            remaining: item.remaining + 120,
            statusCode: "ok"
          };
        }
        return item;
      })
    );
  };

  // Auto-scroller logic for resident維保 personnel positioning table simulation
  useEffect(() => {
    const timer = setInterval(() => {
      // Simulate slow drift positioning every few seconds
      setOperatingStaffLocList(prev => {
        const copy = [...prev];
        const victimIdx = Math.floor(Math.random() * copy.length);
        const locations = ["1#窑尾吸收塔顶", "辅料仓2层", "原料堆棚南段", "厂界环保配电间", "熟料漏沙监控塔B"];
        const randLoc = locations[Math.floor(Math.random() * locations.length)];
        copy[victimIdx] = {
          ...copy[victimIdx],
          place: randLoc,
        };
        return copy;
      });
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div id="smart-control-workspace" className="grid grid-cols-1 xl:grid-cols-12 gap-5 text-slate-100 font-sans p-2">
      
      {/* LEFT-HAND CONTROL SELECTOR BAR (xl:col-span-3) */}
      <div className="xl:col-span-3 bg-slate-950/80 border border-slate-900 rounded-xl p-4 flex flex-col justify-between space-y-4 shadow-xl backdrop-blur-md relative overflow-hidden">
        <div className="absolute top-0 left-0 w-8 h-[1px] bg-cyan-500" />
        <div className="absolute top-0 left-0 w-[1px] h-8 bg-cyan-500" />
        <div className="absolute bottom-0 right-0 w-8 h-[1px] bg-cyan-500" />
        <div className="absolute bottom-0 right-0 w-[1px] h-8 bg-cyan-500" />

        <div className="space-y-4.5">
          <div className="border-b border-slate-905 pb-2 border-slate-900">
            <h2 className="text-sm font-black text-transparent bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text uppercase tracking-wider flex items-center gap-1.5 font-mono">
              <Cpu className="h-5.5 w-5.5 text-cyan-500 animate-spin" style={{ animationDuration: "12s" }} />
              全能智能管控中心
            </h2>
            <p className="text-[10px] text-slate-500 mt-1 font-sans">
              超低排环保改造技术级专设模块汇合
            </p>
          </div>

          <div className="flex flex-col gap-1.5 font-sans">
            {[
              { id: "pollution_trend", label: "1、污染趋势分析", icon: TrendingUp, desc: "月度均值长效趋势模型", badge: "PM/SO2/NOx" },
              { id: "dust_database", label: "2、粉尘参数与经验库", icon: BookOpen, desc: "多年度粉尘参数对比决策", badge: "经验档案" },
              { id: "management_level", label: "3、环境管理水平", icon: GraduationCap, desc: "学历圆环与环保规章制度", badge: "管委会" },
              { id: "dust_heatmap", label: "4、粉尘污染热力图", icon: Map, desc: "二维厂界分域温度热图", badge: "降尘风阻" },
              { id: "smart_academy", label: "5、智慧学院", icon: GraduationCap, desc: "设备手册、学时、饼图", badge: "学时考评" },
              { id: "archives_mgmt", label: "6、日常环保档案", icon: FolderCheck, desc: "超低改官方公文与打包导出", badge: "一键导出" },
              { id: "spares_list", label: "7、人员考勤定位", icon: Users, desc: "驻点工程师北斗定位电话", badge: "常任维保" },
              { id: "spares_mgmt", label: "8、设备运维与备件", icon: AlertTriangle, desc: "采购警报触发及库存防触底", badge: "库房水位" },
            ].map(tab => {
              const isActive = activeSubTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveSubTab(tab.id as SubModuleType);
                    onAddLogMessage(`[智能管控导航] 载入子模块: ${tab.label}`);
                  }}
                  id={`smart-tab-${tab.id}`}
                  className={`w-full text-left p-3.5 rounded-lg border transition-all flex items-start gap-3 cursor-pointer group ${
                    isActive
                      ? "bg-cyan-950/40 border-cyan-500 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.15)] font-bold"
                      : "hover:bg-slate-900/60 border-transparent text-slate-400"
                  }`}
                >
                  <tab.icon className={`h-5 w-5 shrink-0 mt-0.5 ${isActive ? "text-cyan-400 animate-bounce" : "text-slate-550 group-hover:text-slate-200"}`} />
                  <div className="min-w-0 leading-tight">
                    <span className="text-[11.5px] block truncate">{tab.label}</span>
                    <span className="text-[9.5px] text-slate-500 block font-normal truncate max-w-[150px]">{tab.desc}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="pt-2.5 border-t border-slate-900 font-mono text-[9px] text-slate-500 space-y-1">
          <div className="flex justify-between">
            <span>数据链路加密：</span>
            <span className="text-emerald-500 font-bold">SHA-256 ACTIVE</span>
          </div>
          <div className="flex justify-between">
            <span>PLC探针握手：</span>
            <span>12c / 2500ms</span>
          </div>
        </div>
      </div>

      {/* RIGHT-HAND MAIN DETAIL WORKSPACE (xl:col-span-9) */}
      <div className="xl:col-span-9 flex flex-col justify-between gap-4">

        {/* ACTIVE PAGE CONTENT */}
        <div className="min-h-[500px]">

          {/* PAGE 1: 污染趋势分析 */}
          {activeSubTab === "pollution_trend" && (
            <div id="pollution-trend-page" className="bg-slate-950/80 border border-slate-900 rounded-xl p-5 shadow-lg relative overflow-hidden transition-all duration-300">
              <div className="border-b border-slate-900 pb-3 mb-4 flex justify-between items-center flex-wrap gap-2">
                <div>
                  <h3 className="font-sans text-xs font-semibold text-cyan-400 uppercase tracking-widest flex items-center gap-1.5 font-mono">
                    <span className="inline-block h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                    污染趋势分析与月份长效透视
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-1">
                    统计分析当年每月份污染实测的变化折线，以折线图直观显示动态变化
                  </p>
                </div>
                
                {/* Season toggle */}
                <div className="flex bg-slate-900 p-1 rounded border border-slate-800 text-[10px] text-slate-400 gap-1 leading-none">
                  {[
                    { val: "all", lab: "全年度" },
                    { val: "h1", lab: "上半年度(1-6月)" },
                    { val: "h2", lab: "下半年度(7-12月)" },
                  ].map(s => (
                    <button
                      key={s.val}
                      onClick={() => setPollutionSeason(s.val as any)}
                      className={`px-2 py-1 font-bold rounded cursor-pointer ${pollutionSeason === s.val ? "bg-cyan-950 text-cyan-400 border border-cyan-900" : ""}`}
                    >
                      {s.lab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Param Selector Pill Row */}
              <div className="flex bg-slate-900/50 p-2 rounded-lg border border-slate-900/80 mb-5 justify-between items-center flex-wrap gap-2 text-xs select-none">
                <span className="text-[10px] text-slate-500 font-mono tracking-wider">选择透视的污染物名称:</span>
                <div className="flex gap-1.5 flex-wrap">
                  {[
                    { id: "pm10", name: "粉尘 PM10" },
                    { id: "pm25", name: "微粒 PM2.5" },
                    { id: "so2", name: "二氧化硫 SO2" },
                    { id: "nox", name: "氮氧化物 NOx" },
                    { id: "co", name: "一氧化碳 CO" },
                  ].map(param => (
                    <button
                      key={param.id}
                      onClick={() => setPollutionParam(param.id as any)}
                      className={`px-3 py-1.5 font-bold rounded cursor-pointer transition-colors ${
                        pollutionParam === param.id
                          ? "bg-cyan-950 border border-cyan-850 text-cyan-400"
                          : "text-slate-500 hover:text-slate-350 hover:bg-slate-900"
                      }`}
                    >
                      {param.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Main LineChart */}
              <div className="h-[280px] w-full bg-[#020617]/50 rounded-lg p-3 border border-slate-900">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={filteredPollutionData} margin={{ top: 15, right: 10, left: -25, bottom: 5 }}>
                    <defs>
                      <linearGradient id="colorPollution" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={getParamColor(pollutionParam)} stopOpacity={0.25}/>
                        <stop offset="95%" stopColor={getParamColor(pollutionParam)} stopOpacity={0.005}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(30, 41, 59, 0.2)" />
                    <XAxis dataKey="name" stroke="#475569" fontSize={9} />
                    <YAxis stroke="#475569" fontSize={9} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#020617", borderColor: "#1e293b", borderRadius: "6px" }}
                      itemStyle={{ color: getParamColor(pollutionParam), fontSize: "11px" }}
                    />
                    <Legend wrapperStyle={{ fontSize: "10.5px" }} />
                    <Area
                      name={getParamLabel(pollutionParam)}
                      type="monotone"
                      dataKey={pollutionParam}
                      stroke={getParamColor(pollutionParam)}
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#colorPollution)"
                      dot={{ r: 4, strokeWidth: 1 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Statistics Panel Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mt-5 text-center text-xs">
                <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-900 font-mono">
                  <span className="text-[9.5px] text-slate-500 block uppercase">区间实测平均值</span>
                  <span className="text-lg font-bold text-slate-200 mt-1 block">
                    {filteredPollutionData.reduce((acc, curr) => acc + (curr[pollutionParam] as number), 0) / filteredPollutionData.length}
                  </span>
                </div>
                <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-900 font-mono">
                  <span className="text-[9.5px] text-slate-500 block uppercase">极值极大值 (Peak)</span>
                  <span className="text-lg font-bold text-cyan-400 mt-1 block">
                    {Math.max(...filteredPollutionData.map(d => d[pollutionParam] as number))}
                  </span>
                </div>
                <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-900 font-mono">
                  <span className="text-[9.5px] text-slate-500 block uppercase">控制国标准线限制对照</span>
                  <span className="text-lg font-bold text-amber-500 mt-1 block">
                    {pollutionParam === "pm10" ? "50" : pollutionParam === "pm25" ? "35" : pollutionParam === "so2" ? "20" : "50"} (合格)
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* PAGE 2: 粉尘参数分析与经验数据库 */}
          {activeSubTab === "dust_database" && (
            <div id="dust-database-page" className="bg-slate-950/80 border border-slate-900 rounded-xl p-5 shadow-lg relative transition-all duration-300">
              <div className="border-b border-slate-900 pb-3 mb-4">
                <h3 className="font-sans text-xs font-semibold text-cyan-400 uppercase tracking-widest flex items-center gap-1.5 font-mono">
                  <BookOpen className="h-4.5 w-4.5 text-cyan-500 animate-pulse" />
                  粉尘参数多年度研判与历史经验数据库
                </h3>
                <p className="text-[10px] text-slate-500 mt-1">
                  对比过往两个完整年度月度粉尘变化，结合当前月份趋势以及历史经验专家对策，提高粉尘防漏治理
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-5">
                
                {/* Sub Chart: Years Comparison 2024 vs 2025 vs 2026 */}
                <div className="lg:col-span-8 bg-[#020617]/50 border border-slate-900 rounded-lg p-3">
                  <span className="text-[10px] font-bold text-slate-350 block mb-2 font-mono flex items-center justify-between">
                    <span>月度粉尘均值对比图(PM10)</span>
                    <span className="text-slate-500">2026年从7-12月为缺省未观测月</span>
                  </span>
                  <div className="h-[210px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={yearlyDustComparison} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(30, 41, 59, 0.2)" />
                        <XAxis dataKey="name" stroke="#475569" fontSize={9} />
                        <YAxis stroke="#475569" fontSize={9} />
                        <Tooltip
                          contentStyle={{ backgroundColor: "#020617", borderColor: "#1e293b", borderRadius: "6px" }}
                          itemStyle={{ fontSize: "11px" }}
                        />
                        <Legend iconSize={8} wrapperStyle={{ fontSize: "10px" }} />
                        <Line name="2024年均变化" type="monotone" dataKey="year2024" stroke="#475569" strokeDasharray="3 3" dot={false} strokeWidth={1} />
                        <Line name="2025年均变化" type="monotone" dataKey="year2025" stroke="#94a3b8" strokeDasharray="4 2" dot={false} strokeWidth={1.5} />
                        <Line name="2026当前趋势 (超低改后)" type="monotone" dataKey="year2026" stroke="#06b6d4" dot={true} strokeWidth={2.5} />
                        <Line name="环保标准警告线" type="step" dataKey="alarmLimit" stroke="#ef4444" strokeDasharray="5 5" dot={false} strokeWidth={1} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* DB input form */}
                <div className="lg:col-span-4 bg-slate-900/30 border border-slate-900 rounded-lg p-4 flex flex-col justify-between">
                  <form onSubmit={handleAddExpertAdvice} className="space-y-3.5 text-xs">
                    <span className="text-[10.5px] font-bold text-slate-200 border-b border-slate-900 pb-1.5 block">
                      📝 新增专家长效治理经验归档
                    </span>

                    <div>
                      <label className="block mb-1 text-slate-500">绑定针对月份工况</label>
                      <select
                        value={selectedExpMonth}
                        onChange={(e) => setSelectedExpMonth(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-805 px-2 py-1.5 rounded outline-none border-slate-800 text-slate-355 font-mono"
                      >
                        {["1月-3月 极冷", "4月-6月 干燥", "7月-9月 湿热", "10月-12月 干燥", "全面通用"].map(m => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block mb-1 text-slate-500">治理经验/对策措施说明</label>
                      <textarea
                        required
                        rows={3}
                        value={expertNote}
                        onChange={(e) => setExpertNote(e.target.value)}
                        placeholder="输入专家长效治粉方案。如大雾大风自动调高洗车嘴水泵，增加阀室脉冲气压等..."
                        className="w-full bg-slate-950 border border-slate-850 p-2 rounded outline-none border-slate-800 text-slate-200 leading-normal"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full text-center rounded bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-850 py-2 font-bold cursor-pointer transition-colors"
                    >
                      提交归档至历史经验数据库
                    </button>
                  </form>
                </div>
              </div>

              {/* Experience DB scrolling table */}
              <div className="border border-slate-900 rounded-lg overflow-hidden text-xs">
                <div className="bg-slate-900/50 p-2 border-b border-slate-900 font-mono text-[10.5px] text-cyan-400 font-bold flex items-center gap-1.5">
                  <Bookmark className="h-4 w-4" /> 历史经验数据库防尘治理措施匹配
                </div>
                <div className="max-h-[160px] overflow-y-auto divide-y divide-slate-900">
                  {experienceDb.map((exp) => (
                    <div key={exp.id} className="p-3.5 hover:bg-slate-900/20 grid grid-cols-1 md:grid-cols-12 gap-2">
                      <div className="md:col-span-2 font-mono font-bold text-cyan-400">{exp.month}</div>
                      <div className="md:col-span-3 text-slate-500 truncate">{exp.condition}</div>
                      <div className="md:col-span-7 font-sans text-slate-350">{exp.advice}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* PAGE 3: 环境管理水平 */}
          {activeSubTab === "management_level" && (
            <div id="management-level-page" className="bg-slate-950/80 border border-slate-900 rounded-xl p-5 shadow-lg relative transition-all duration-300">
              <div className="border-b border-slate-900 pb-3 mb-4 flex justify-between items-center flex-wrap gap-2">
                <div>
                  <h3 className="font-sans text-xs font-semibold text-cyan-400 uppercase tracking-widest flex items-center gap-1.5 font-mono">
                    <GraduationCap className="h-4.5 w-4.5 text-cyan-500 animate-pulse" />
                    环境管理水平与全厂精细化运维管控台账
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-1">
                    实时维护环保人员机构、检索规章制度发布状态，跟踪设备检修运维台账并直观呈现高危故障隐患
                  </p>
                </div>
                
                {/* Global stats indicator */}
                <div className="flex gap-2.5 text-[10px] font-mono">
                  <div className="bg-slate-900 px-2.5 py-1 rounded border border-slate-800 flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="text-slate-400">在册人员: {managementRegistry.length} 人</span>
                  </div>
                  <div className="bg-slate-900 px-2.5 py-1 rounded border border-slate-800 flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                    <span className="text-slate-400">存续制度: {policies.length} 项</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                
                {/* COLUMN 1: PERSONNEL INFO & ACADEMIC BACKGROUND (lg:col-span-4) */}
                <div className="lg:col-span-4 bg-[#020617]/50 border border-slate-900 rounded-lg p-3.5 flex flex-col justify-between space-y-4">
                  <div>
                    <span className="text-[10.5px] font-bold text-slate-300 font-mono block mb-2">管网成员学历背景统计与岗位名录</span>
                    
                    {/* Pie Chart */}
                    <div className="h-[120px] w-full relative my-1.5">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={educationStats}
                            cx="50%"
                            cy="50%"
                            innerRadius={32}
                            outerRadius={48}
                            dataKey="count"
                          >
                            {educationStats.map((entry, idx) => (
                              <Cell key={`edu-cell-${idx}`} fill={hrPieColors[idx % hrPieColors.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{ backgroundColor: "#020617", borderColor: "#1e3a8a", borderRadius: "6px" }}
                            itemStyle={{ fontSize: "11px" }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                        <span className="font-mono text-sm font-black text-slate-100 block">{managementRegistry.length}人</span>
                        <span className="text-[8px] text-slate-500 block">常置专职</span>
                      </div>
                    </div>

                    {/* Member scrolling tag section */}
                    <div className="space-y-1 max-h-[140px] overflow-y-auto custom-scrollbar pr-1">
                      {managementRegistry.map((item, idx) => (
                        <div key={item.id || idx} className="p-1.5 border border-slate-900 rounded bg-slate-950/40 flex items-center justify-between text-[11px]">
                          <div>
                            <span className="font-bold text-slate-300">{item.name}</span>
                            <span className="text-[9px] text-slate-500 ml-2 font-mono">[{item.role.split('-')[0]}]</span>
                          </div>
                          <span className="text-[8.5px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 shrink-0">{item.level}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Form to Regist/Enter personnel info */}
                  <form onSubmit={handleAddStaff} className="bg-slate-950 border border-slate-900 rounded p-2.5 space-y-2 mt-2">
                    <span className="text-[10px] font-bold text-cyan-400 font-mono block">👤 新环保成员资料快速录入</span>
                    <div className="grid grid-cols-2 gap-1.5">
                      <input
                        type="text"
                        placeholder="姓名 (例 曹工)"
                        value={newStaffName}
                        onChange={(e) => setNewStaffName(e.target.value)}
                        className="bg-slate-900 border border-slate-800 text-xs text-slate-200 px-2 py-1 rounded placeholder-slate-600 outline-none"
                        required
                      />
                      <input
                        type="text"
                        placeholder="岗位角色 (例 采样员)"
                        value={newStaffRole}
                        onChange={(e) => setNewStaffRole(e.target.value)}
                        className="bg-slate-900 border border-slate-800 text-xs text-slate-200 px-2 py-1 rounded placeholder-slate-600 outline-none"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      <select
                        value={newStaffLevel}
                        onChange={(e) => setNewStaffLevel(e.target.value)}
                        className="bg-slate-950 border border-slate-800 text-[10.5px] text-slate-350 px-1.5 py-1 rounded outline-none"
                      >
                        <option value="博士及研究生及以上">博士及研究生</option>
                        <option value="本科">本科</option>
                        <option value="大专/高职">大专/高职</option>
                        <option value="中专/技校">中专/技校</option>
                      </select>
                      <input
                        type="text"
                        placeholder="资历/经验 (15年熟料)"
                        value={newStaffTitle}
                        onChange={(e) => setNewStaffTitle(e.target.value)}
                        className="bg-slate-900 border border-slate-800 text-xs text-slate-200 px-2 py-1 rounded placeholder-slate-600 outline-none"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full text-center py-1 bg-cyan-950 hover:bg-cyan-900 text-[10.5px] font-bold text-cyan-400 rounded border border-cyan-900 cursor-pointer"
                    >
                      安全录入并重算学力占比
                    </button>
                  </form>
                </div>

                {/* COLUMN 2: OVERHAUL & MAINTENANCE LEDGERS + INTUITIVE ISSUES BADGING (lg:col-span-4) */}
                <div className="lg:col-span-4 bg-[#020617]/50 border border-slate-900 rounded-lg p-3.5 flex flex-col justify-between space-y-4">
                  <div>
                    <span className="text-[10.5px] font-bold text-slate-300 font-mono block mb-1">🔧 设备检修运维台账 (实时反应异常)</span>
                    
                    {/* Intuitive Issue counter display */}
                    <div className="p-2 bg-slate-950 border border-red-950 rounded flex justify-between items-center mb-2 animate-pulse">
                      <div>
                        <span className="text-[11px] text-slate-300 font-medium block">一键感知故障/隐患仪表盘:</span>
                        <div className="flex gap-2.5 mt-0.5 text-[10px] font-mono">
                          <span className="text-red-400 font-bold flex items-center gap-1">
                            <span className="h-1.5 w-1.5 bg-red-500 rounded-full animate-ping" />
                            高危隐患: {maintenanceLedger.filter(l => l.alertLevel === "danger").length} 项
                          </span>
                          <span className="text-amber-500 font-bold">
                            中度警告: {maintenanceLedger.filter(l => l.alertLevel === "warning").length} 项
                          </span>
                          <span className="text-green-400">
                            未决事件: {maintenanceLedger.filter(l => l.status !== "完成").length} 起
                          </span>
                        </div>
                      </div>
                      <AlertTriangle className="h-5 w-5 text-red-500 animate-bounce" />
                    </div>

                    {/* Ledgers table scrolling */}
                    <div className="space-y-1.5 max-h-[160px] overflow-y-auto custom-scrollbar pr-1">
                      {maintenanceLedger.map((lg) => {
                        const alertColor = lg.alertLevel === "danger" ? "border-red-900/60 bg-red-950/20" : lg.alertLevel === "warning" ? "border-amber-900/50 bg-amber-950/10" : "border-slate-900 bg-slate-950/40";
                        return (
                          <div key={lg.id} className={`p-2 border rounded ${alertColor} text-xs relative flex flex-col`}>
                            {/* Danger dot flashing */}
                            {lg.alertLevel === "danger" && (
                              <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
                              </span>
                            )}
                            {lg.alertLevel === "warning" && (
                              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-amber-500" />
                            )}
                            
                            <div className="flex justify-between items-center text-[10.5px] border-b border-slate-900/50 pb-1">
                              <span className="font-mono text-slate-400 shrink-0">{lg.device}</span>
                              <span className="text-slate-550 shrink-0 font-mono pr-4 select-none">{lg.version} / {lg.date}</span>
                            </div>
                            
                            <h4 className="font-extrabold text-slate-200 mt-1 truncate" title={lg.name}>{lg.name}</h4>
                            <p className="text-[10px] text-slate-400 mt-0.5 leading-snug line-clamp-2 italic">“{lg.issue}”</p>
                            
                            <div className="mt-1.5 flex justify-between items-center border-t border-slate-900/30 pt-1 text-[10px] font-mono select-none">
                              <span className="text-slate-500">负责人: {lg.staff}</span>
                              <div className="flex items-center gap-1.5">
                                <span className={`px-1.5 rounded py-0.5 font-bold ${
                                  lg.status === "完成" ? "bg-emerald-950 text-emerald-400" : lg.status === "运行中" ? "bg-blue-950 text-blue-400" : "bg-red-950/60 text-red-400 font-bold"
                                }`}>
                                  {lg.status}
                                </span>
                                
                                <button
                                  type="button"
                                  onClick={() => {
                                    const nextStatus = lg.status === "待维护" ? "运行中" : lg.status === "运行中" ? "完成" : "待维护";
                                    handleUpdateLedger(lg.id, nextStatus, lg.issue, lg.version);
                                  }}
                                  className="text-cyan-400 hover:underline bg-transparent border-none cursor-pointer p-0"
                                  title="更新状态"
                                >
                                  更新
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleUpgradeLedgerVersion(lg.id, lg.version)}
                                  className="text-slate-400 hover:text-white hover:underline bg-transparent border-none cursor-pointer p-0 select-none font-mono ml-1"
                                  title="升级版本"
                                >
                                  版控+
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Form to insert new ledger */}
                  <form onSubmit={handleAddLedger} className="bg-slate-950 border border-slate-900 rounded p-2.5 space-y-1.5 mt-2">
                    <span className="text-[10px] font-bold text-red-400 font-mono block">⚠️ 建立/填报新检修点检台账</span>
                    <input
                      type="text"
                      placeholder="检修运维名称 (例: 2#除尘阀组清堵)"
                      value={newMaintName}
                      onChange={(e) => setNewMaintName(e.target.value)}
                      className="w-full bg-slate-905 border border-slate-800 text-xs text-slate-200 px-2 py-1 rounded placeholder-slate-600 outline-none"
                      required
                    />
                    <div className="grid grid-cols-2 gap-1.5">
                      <select
                        value={newMaintDevice}
                        onChange={(e) => setNewMaintDevice(e.target.value)}
                        className="bg-slate-950 border border-slate-800 text-[10.5px] text-slate-350 px-1 py-1 rounded outline-none"
                      >
                        <option value="CEMS分析仪">CEMS分析仪</option>
                        <option value="脉冲袋式除尘器">脉冲袋式除尘器</option>
                        <option value="高压加压泵">高压加压泵</option>
                        <option value="脱硫喷枪">脱硫喷枪</option>
                      </select>
                      <input
                        type="text"
                        placeholder="填报人 (例: 王建国)"
                        value={newMaintStaff}
                        onChange={(e) => setNewMaintStaff(e.target.value)}
                        className="bg-slate-905 border border-slate-800 text-xs text-slate-200 px-2 py-1 rounded placeholder-slate-600 outline-none"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-12 gap-1.5">
                      <input
                        type="text"
                        placeholder="具体运行缺陷/隐患描述说明"
                        value={newMaintIssue}
                        onChange={(e) => setNewMaintIssue(e.target.value)}
                        className="col-span-8 bg-slate-905 border border-slate-800 text-xs text-slate-200 px-2 py-1 rounded placeholder-slate-600 outline-none"
                      />
                      <select
                        value={newMaintAlertLevel}
                        onChange={(e) => setNewMaintAlertLevel(e.target.value as any)}
                        className="col-span-4 bg-slate-950 border border-slate-800 text-[10px] text-slate-355 px-1 py-1 rounded outline-none"
                      >
                        <option value="normal">🟢 正常</option>
                        <option value="warning">🟡 警告</option>
                        <option value="danger">🔴 隐患缺陷</option>
                      </select>
                    </div>
                    <button
                      type="submit"
                      className="w-full text-center py-1 bg-red-955 bg-red-900/20 hover:bg-red-900 text-[10.5px] font-bold text-red-400 rounded border border-red-900 cursor-pointer"
                    >
                      提交台账并反映故障直观红点
                    </button>
                  </form>
                </div>

                {/* COLUMN 3: CORPORATE POLICIES (SEARCH, INSTANT PUBLISH, VERSION UPDATE) (lg:col-span-4) */}
                <div className="lg:col-span-4 bg-[#020617]/50 border border-slate-900 rounded-lg p-3.5 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10.5px] font-bold text-slate-300 font-mono block">自研低排放监督及宣贯规章制度</span>
                      <button
                        type="button"
                        onClick={handleOneKeyPublishAll}
                        className="px-2 py-0.5 bg-blue-950 hover:bg-blue-900 text-[9px] text-blue-400 rounded border border-blue-800 cursor-pointer text-center font-bold"
                        title="草稿制度一键全部变更为已发布"
                      >
                        🚀 一键发布草稿
                      </button>
                    </div>

                    {/* Search Bar for retrieval */}
                    <div className="relative text-xs mb-2.5">
                      <span className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                        <Search className="h-3 w-3 text-slate-600" />
                      </span>
                      <input
                        type="text"
                        placeholder="检索条款制度/快速检索..."
                        value={policySearchQuery}
                        onChange={(e) => setPolicySearchQuery(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-900 text-slate-200 pl-7 pr-2 py-1 rounded text-[10px] outline-none"
                      />
                    </div>
                    
                    {/* Top quick sub-tabs */}
                    <div className="grid grid-cols-4 gap-1 text-[9px] font-mono leading-none font-bold mb-2">
                      {[
                        { id: "overhaul", label: "设施检修" },
                        { id: "monitoring", label: "例监测" },
                        { id: "appraisal", label: "日常考评" },
                        { id: "emergency", label: "突发预案" },
                      ].map(st => (
                        <button
                          key={st.id}
                          onClick={() => setActivePolicyTab(st.id as any)}
                          className={`py-1 rounded border text-center transition-colors cursor-pointer ${
                            activePolicyTab === st.id
                              ? "bg-cyan-950 text-cyan-400 border-cyan-850"
                              : "bg-slate-905 border-slate-900 text-slate-500"
                          }`}
                        >
                          {st.label}
                        </button>
                      ))}
                    </div>

                    {/* Render matching policy detail with publishing controls */}
                    <div className="bg-slate-950/90 border border-slate-900 rounded p-2.5 text-xs text-slate-350 min-h-[140px] max-h-[140px] overflow-y-auto custom-scrollbar flex flex-col justify-between">
                      {policies
                        .filter(p => p.category === activePolicyTab && (policySearchQuery.trim() === "" || p.title.includes(policySearchQuery) || p.content.includes(policySearchQuery)))
                        .map(p => (
                          <div key={p.id} className="space-y-1">
                            <div className="flex justify-between items-center border-b border-slate-900/50 pb-1 mb-1 text-[10.5px]">
                              <span className="font-extrabold text-slate-200 truncate pr-2 max-w-[130px]" title={p.title}>{p.title}</span>
                              <div className="flex gap-1.5 shrink-0 select-none">
                                <span className={`px-1.5 rounded text-[8.5px] font-mono font-bold ${
                                  p.status === "已发布" ? "bg-emerald-950/85 text-emerald-400 border border-emerald-900" : "bg-amber-955 text-amber-500 bg-amber-950/60"
                                }`}>
                                  {p.status}
                                </span>
                                <span className="text-[9px] text-slate-500 font-mono">{p.version}</span>
                              </div>
                            </div>
                            
                            <p className="text-[10px] leading-relaxed text-slate-400 font-sans">{p.content}</p>
                            
                            <div className="mt-2.5 flex gap-2 border-t border-slate-900/50 pt-1 text-[9.5px] select-none font-mono">
                              {p.status === "草稿" ? (
                                <button
                                  type="button"
                                  onClick={() => handlePublishPolicy(p.id, p.title)}
                                  className="text-emerald-400 hover:underline bg-transparent border-none cursor-pointer"
                                >
                                  🚀 审核即刻发布
                                </button>
                              ) : (
                                <span className="text-slate-500 text-emerald-500">已发布实施</span>
                              )}
                              
                              <button
                                type="button"
                                onClick={() => handleUpgradePolicyVersion(p.id, p.version)}
                                className="text-cyan-400 hover:underline bg-transparent border-none cursor-pointer ml-auto"
                              >
                                🔄 升级重版修订
                              </button>
                            </div>
                          </div>
                        ))}
                      {policies.filter(p => p.category === activePolicyTab && (policySearchQuery.trim() === "" || p.title.includes(policySearchQuery) || p.content.includes(policySearchQuery))).length === 0 && (
                        <p className="text-[10.5px] text-slate-555 text-slate-500 text-center py-6">无对应制度或搜索内容无匹配</p>
                      )}
                    </div>
                  </div>

                  {/* Form to insert new regulatory policy */}
                  <form onSubmit={handleAddPolicy} className="bg-slate-950 border border-slate-900 rounded p-2.5 space-y-1.5 mt-1">
                    <span className="text-[10px] font-bold text-amber-400 font-mono block">⚖️ 录入并发布全场新环境长效规章</span>
                    <input
                      type="text"
                      placeholder="规章制度名称 (例: 催化消磁校对办法)"
                      value={newPolicyTitle}
                      onChange={(e) => setNewPolicyTitle(e.target.value)}
                      className="w-full bg-[#050b14] border border-slate-800 text-xs text-slate-200 px-2 py-1 rounded placeholder-slate-600 outline-none"
                      required
                    />
                    <div className="grid grid-cols-2 gap-1.5">
                      <select
                        value={newPolicyCategory}
                        onChange={(e) => setNewPolicyCategory(e.target.value as any)}
                        className="bg-slate-950 border border-slate-800 text-[10px] text-slate-350 px-1 py-1 rounded outline-none"
                      >
                        <option value="overhaul">设施检修</option>
                        <option value="monitoring">例监测</option>
                        <option value="appraisal">日常考评</option>
                        <option value="emergency">突发预案</option>
                      </select>
                      <input
                        type="text"
                        placeholder="编制版本号 (例 V1.0)"
                        value={newPolicyVersion}
                        onChange={(e) => setNewPolicyVersion(e.target.value)}
                        className="bg-[#050b14] border border-slate-800 text-xs text-slate-200 px-2 py-1 rounded placeholder-slate-600 outline-none"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="草案条例具体条款正文内容..."
                      value={newPolicyContent}
                      onChange={(e) => setNewPolicyContent(e.target.value)}
                      className="w-full bg-[#050b14] border border-slate-800 text-xs text-slate-200 px-2 py-1 rounded placeholder-slate-600 outline-none"
                      required
                    />
                    <button
                      type="submit"
                      className="w-full text-center py-1 bg-amber-955 bg-amber-950/70 hover:bg-amber-900 text-[10.5px] font-bold text-amber-400 rounded border border-amber-900 cursor-pointer"
                    >
                      提交存纳新制度 (默认草稿)
                    </button>
                  </form>
                </div>

              </div>
            </div>
          )}

          {/* PAGE 4: 粉尘污染热力图 */}
          {activeSubTab === "dust_heatmap" && (
            <div id="dust-heatmap-page" className="bg-slate-950/80 border border-slate-900 rounded-xl p-5 shadow-lg relative transition-all duration-300">
              <div className="border-b border-slate-900 pb-3 mb-4 flex justify-between items-center flex-wrap gap-2">
                <div>
                  <h3 className="font-sans text-xs font-semibold text-cyan-400 uppercase tracking-widest flex items-center gap-1.5 font-mono">
                    <Map className="h-4.5 w-4.5 text-cyan-500 animate-pulse animate-spin" />
                    粉尘污染二维热力多态仿真图
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-1">
                    实时汇总厂区8个子分区监测数据，结合当前工况强度与风速风向，在二维图上以热力斑块直观展示
                  </p>
                </div>

                {/* Pollutant selector */}
                <div className="flex bg-slate-900 p-1 rounded border border-slate-800 text-[10px] text-slate-400 gap-1 leading-none">
                  {[
                    { val: "pm10", lab: "PM10 粉尘" },
                    { val: "pm25", lab: "PM2.5 微粒" },
                    { val: "tsp", lab: "TSP 总悬浮" },
                  ].map(p => (
                    <button
                      key={p.val}
                      onClick={() => setActiveHeatmapPollutant(p.val as any)}
                      className={`px-2.5 py-1 font-bold rounded cursor-pointer ${activeHeatmapPollutant === p.val ? "bg-cyan-950 text-cyan-400 border border-cyan-900 font-bold" : ""}`}
                    >
                      {p.lab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Simulation Environment dials toolbar */}
              <div className="flex bg-slate-900/50 p-2.5 rounded-lg border border-slate-900/80 mb-4 justify-between items-center text-xs flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500 font-mono">风速风向气流模拟:</span>
                  <div className="flex bg-slate-950 p-1 rounded border border-slate-850 text-[10.5px]">
                    {[
                      { val: "none", lab: "静息状态" },
                      { val: "north", lab: "4级暖北风 ↗" },
                      { val: "east", lab: "6级干燥强东风 ←" },
                    ].map(w => (
                      <button
                        key={w.val}
                        onClick={() => {
                          setSimulatedWind(w.val as any);
                          onAddLogMessage(`[热力图风算仿真] 气温风速设定为: ${w.lab}`);
                        }}
                        className={`px-2 py-0.5 rounded cursor-pointer ${simulatedWind === w.val ? "bg-cyan-950 text-cyan-400 font-black border border-cyan-900" : "text-slate-500 hover:text-slate-250"}`}
                      >
                        {w.lab}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Active Spray toggle button */}
                <button
                  type="button"
                  onClick={() => {
                    setSprayActivated(!sprayActivated);
                    onAddLogMessage(`[热力降尘消警] ${sprayActivated ? "关闭区域智能风洗降尘" : "开启活性大棚紧急降尘雾炮冲洗"}`);
                  }}
                  className={`px-3 py-1.5 font-bold rounded transition-colors text-[11px] cursor-pointer border-none ${
                    sprayActivated
                      ? "bg-emerald-950 text-emerald-400 border border-emerald-900 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                      : "bg-slate-950 text-slate-400 border border-slate-850 hover:text-white"
                  }`}
                >
                  {sprayActivated ? "💧 区域冲洗雾炮激活中 (降冷冷却)" : "🌧️ 开启一键高空除尘雾炮清洗"}
                </button>
              </div>

              {/* Plant 2D Canvas layout schematic simulated */}
              <div className="relative w-full h-[260px] bg-[#020617] border border-slate-900 rounded-lg overflow-hidden flex items-center justify-center">
                
                {/* Raster lines background */}
                <div className="absolute inset-0 bg-[radial-gradient(#111827_1px,transparent_1px)] [background-size:15px_15px] opacity-40" />

                {/* Simulated wind particle ripples */}
                {simulatedWind === "north" && (
                  <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_45%,rgba(6,182,212,0.06)_50%,transparent_55%)] [background-size:30px_30px] animate-pulse pointer-events-none" />
                )}
                {simulatedWind === "east" && (
                  <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_45%,rgba(168,85,247,0.06)_50%,transparent_55%)] [background-size:20px_20px] animate-pulse pointer-events-none" />
                )}

                {/* Plant boundaries overlay */}
                <div className="absolute inset-x-5 inset-y-4 border border-dashed border-slate-900/20 rounded pointer-events-none text-[8px] font-mono text-slate-800 flex justify-between p-2">
                  <span>LAT 25° N - LNG 102° E</span>
                  <span>HUAXIN ENVIRONMENTAL GRID SV2</span>
                </div>

                {/* Map Grid areas rendering */}
                {plantZones.map(zone => {
                  
                  // Compute simulated value based on interactive knobs
                  let baseVal = activeHeatmapPollutant === "pm10" ? zone.pm10Base : activeHeatmapPollutant === "pm25" ? zone.pm25Base : zone.tspBase;
                  
                  // Wind calculation drift
                  if (simulatedWind === "north") {
                    if (zone.id === "pack_station" || zone.id === "east_gate") baseVal = Math.floor(baseVal * 1.35);
                    if (zone.id === "coal_yard") baseVal = Math.floor(baseVal * 0.75);
                  } else if (simulatedWind === "east") {
                    if (zone.id === "coal_yard" || zone.id === "additive_shed") baseVal = Math.floor(baseVal * 1.45);
                    if (zone.id === "clinker_kiln") baseVal = Math.floor(baseVal * 0.65);
                  }

                  // Chemical Spray Cooling down
                  if (sprayActivated) {
                    baseVal = Math.floor(baseVal * 0.35); // Cut dust down by 65%!!
                  }

                  // Determine heat-indicator bg level color
                  let colorClass = "bg-emerald-500/10 border-emerald-500/40 text-emerald-400";
                  let pingColor = "bg-emerald-400";
                  
                  if (baseVal > 150) {
                    colorClass = "bg-rose-500/15 border-rose-500/60 text-rose-400 animate-pulse ring-2 ring-rose-500/30";
                    pingColor = "bg-rose-500";
                  } else if (baseVal > 80) {
                    colorClass = "bg-amber-500/12 border-amber-500/50 text-amber-400 shadow-inner";
                    pingColor = "bg-amber-400";
                  }

                  return (
                    <div
                      key={zone.id}
                      className={`absolute p-1.5 rounded border transition-all duration-500 font-mono text-[9px] cursor-help w-[110px] ${colorClass}`}
                      style={{ left: zone.x, top: zone.y }}
                      title={`${zone.name} | 环境均值: ${baseVal}`}
                    >
                      {/* Flashing hot pulsing dot */}
                      <div className="flex items-center gap-1.5 font-bold leading-none">
                        <span className="relative flex h-2 w-2">
                          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${pingColor}`} />
                          <span className={`relative inline-flex rounded-full h-2 w-2 ${pingColor}`} />
                        </span>
                        <span className="truncate">{zone.name.replace("1# ", "")}</span>
                      </div>
                      
                      <div className="flex justify-between items-center text-[8.5px] text-slate-500 font-light mt-1">
                        <span>测尘:</span>
                        <span className="font-bold">{baseVal} ug</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Legend row */}
              <div className="flex justify-between items-center text-[10.5px] font-mono text-slate-500 p-1 flex-wrap gap-2">
                <span>* 热力指标基于即时微米级阻尼折算。</span>
                <div className="flex gap-4">
                  <span className="flex items-center gap-1 text-emerald-400"><span className="h-2 w-2 bg-emerald-500 rounded-full" /> 优良 (0-50ug)</span>
                  <span className="flex items-center gap-1 text-amber-400"><span className="h-2 w-2 bg-amber-500 rounded-full" /> 预警 (51-150ug)</span>
                  <span className="flex items-center gap-1 text-rose-400"><span className="h-2 w-2 bg-rose-500 rounded-full" /> 超标越界 (&gt;150ug)</span>
                </div>
              </div>
            </div>
          )}

          {/* PAGE 5: 智慧学院 */}
          {activeSubTab === "smart_academy" && (
            <div id="smart-academy-page" className="bg-slate-950/80 border border-slate-900 rounded-xl p-5 shadow-lg relative transition-all duration-300">
              <div className="border-b border-slate-900 pb-3 mb-4 flex justify-between items-center flex-wrap gap-2">
                <div>
                  <h3 className="font-sans text-xs font-semibold text-cyan-400 uppercase tracking-widest flex items-center gap-1.5 font-mono">
                    <Sparkles className="h-4.5 w-4.5 text-cyan-500 animate-pulse" />
                    智慧学院运维资源与学时自动管理
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-1">
                    汇总全场运维手册、教学视频及规范指南，建立实时学习学时统计与文件下载监测网络
                  </p>
                </div>
                
                {/* Total Statistics indicator */}
                <div className="flex gap-2.5 text-[10px] font-mono">
                  <div className="bg-slate-900 px-2.5 py-1 rounded border border-slate-800 text-slate-400">
                    在仓教辅: {academyResources.length} 门
                  </div>
                  <div className="bg-slate-900 px-2.5 py-1 rounded border border-slate-800 text-slate-400">
                    累计流转下载: {academyResources.reduce((acc, curr) => acc + curr.downloadCount, 0)} 次
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                
                {/* COLUMN 1: STATE-DRIVEN RESOURCE EXPLORER (lg:col-span-5) */}
                <div className="lg:col-span-5 bg-[#020617]/50 border border-slate-900 rounded-lg p-3.5 flex flex-col justify-between space-y-4">
                  <div>
                    <span className="text-[10.5px] font-bold text-slate-300 font-mono block mb-2.5">📘 学院培训材料仓储 (可下载及更新)</span>
                    
                    {/* Real-time reactive resource list */}
                    <div className="space-y-1.5 max-h-[190px] overflow-y-auto custom-scrollbar pr-1">
                      {academyResources.map(res => (
                        <div
                          key={res.id}
                          className={`p-2 border rounded text-xs transition-colors flex flex-col gap-1 ${
                            selectedAcademyMat === res.title
                              ? "bg-cyan-950/40 border-cyan-850"
                              : "bg-slate-950/40 border-slate-900 hover:border-slate-800"
                          }`}
                        >
                          <div className="flex justify-between items-start gap-2">
                            <span
                              onClick={() => {
                                setSelectedAcademyMat(res.title);
                                onAddLogMessage(`[智慧学院] 激活切换宣贯教材: ${res.title}`);
                              }}
                              className="font-bold text-slate-200 cursor-pointer hover:text-cyan-400 transition-colors truncate max-w-[170px]"
                              title={res.title}
                            >
                              {res.type === "pdf" ? "📘" : "🎬"} {res.title}
                            </span>
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 font-mono text-slate-450 text-slate-400 shrink-0 select-none">
                              {res.version}
                            </span>
                          </div>

                          <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono mt-0.5 select-none">
                            <span>主理: {res.author} | 权限: {res.priv}</span>
                            <span className="text-cyan-401 text-cyan-400">下载记录: {res.downloadCount}次</span>
                          </div>

                          {/* List Action Controllers */}
                          <div className="flex justify-end gap-2 border-t border-slate-900/40 pt-1 mt-1 text-[9.5px] font-mono select-none">
                            <button
                              type="button"
                              onClick={() => handleSimulateAcadDownload(res.id, res.title)}
                              className="text-cyan-400 hover:underline bg-transparent border-none cursor-pointer flex items-center gap-0.5"
                            >
                              📥 确认下载
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpgradeAcadVersion(res.id, res.title, res.version)}
                              className="text-slate-400 hover:text-white hover:underline bg-transparent border-none cursor-pointer flex items-center gap-0.5"
                            >
                              🔄 升级版控
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Related manual files entry / adding form (录入) */}
                  <form onSubmit={handleAddAcadResource} className="bg-slate-950 border border-slate-950 rounded p-2.5 space-y-1.5">
                    <span className="text-[10px] font-bold text-cyan-400 font-mono block">✨ 录入并上传新教学大纲或视频</span>
                    <input
                      type="text"
                      placeholder="手册标题/微课名字 (例: 喷雾管道清堵)"
                      value={newAcadTitle}
                      onChange={(e) => setNewAcadTitle(e.target.value)}
                      className="w-full bg-[#050b14] border border-slate-800 text-xs text-slate-200 px-2 py-1.5 rounded placeholder-slate-600 outline-none"
                      required
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={newAcadType}
                        onChange={(e) => setNewAcadType(e.target.value as any)}
                        className="bg-slate-950 border border-slate-800 text-[10px] text-slate-350 px-1 py-1 rounded outline-none"
                      >
                        <option value="pdf">📘 设备操作规程 PDF</option>
                        <option value="video">🎬 mp4 视频讲义</option>
                      </select>
                      <input
                        type="text"
                        placeholder="作者 (例 林教官)"
                        value={newAcadAuthor}
                        onChange={(e) => setNewAcadAuthor(e.target.value)}
                        className="bg-[#050b14] border border-slate-800 text-xs text-slate-200 px-2 py-1 rounded placeholder-slate-600 outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-8 flex items-center gap-1">
                        <span className="text-[9px] text-slate-500 font-mono shrink-0">可见权限:</span>
                        <select
                          value={newAcadPriv}
                          onChange={(e) => setNewAcadPriv(e.target.value)}
                          className="bg-slate-950 border border-slate-800 text-[9.5px] text-slate-350 px-1 py-0.5 rounded outline-none w-full"
                        >
                          <option value="1级运维">1级运维人员</option>
                          <option value="2级运维">2级高级维保</option>
                          <option value="专职检测员">专职环境核测</option>
                        </select>
                      </div>
                      <button
                        type="submit"
                        className="col-span-4 text-center py-1 bg-cyan-955 bg-cyan-950/80 hover:bg-cyan-900 text-[10px] font-bold text-cyan-400 rounded border border-cyan-900 cursor-pointer shrink-0"
                      >
                        入库录入
                      </button>
                    </div>
                  </form>
                </div>

                {/* COLUMN 2: REGIONAL STUDYING PIE CHART & TRAINEE DETAILS LOGGER (lg:col-span-4) */}
                <div className="lg:col-span-4 bg-[#020617]/50 border border-slate-900 rounded-lg p-3.5 flex flex-col justify-between space-y-4">
                  <div>
                    <span className="text-[10.5px] font-bold text-slate-300 block mb-0.5 font-mono">考评学时跨度占比 (学时圆环饼图)</span>
                    <span className="text-[9px] text-slate-500 font-sans block mb-2 leading-none">实测计算全员在线培训学时累计分布比例</span>

                    {/* Highly active circular chart */}
                    <div className="h-[120px] w-full my-1 relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={traineeLearningHours}
                            cx="50%"
                            cy="50%"
                            innerRadius={30}
                            outerRadius={45}
                            dataKey="value"
                          >
                            {traineeLearningHours.map((entry, idx) => (
                              <Cell key={`hour-cell-${idx}`} fill={entry.fill} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{ backgroundColor: "#020617", borderColor: "#1e3a8a", borderRadius: "6px" }}
                            itemStyle={{ fontSize: "11px" }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                        <span className="font-mono text-xs font-black text-slate-100 block">
                          {traineeLearningHours.reduce((acc, c) => acc + c.count, 0)}人
                        </span>
                        <span className="text-[8px] text-slate-550 block">总学籍</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-1 text-[9px] font-mono leading-none font-bold">
                      {traineeLearningHours.map((item, idx) => (
                        <div key={item.range || idx} className="flex justify-between items-center bg-slate-950 p-1 rounded border border-slate-900 leading-none">
                          <span className="text-slate-400 flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: item.fill }} />
                            {item.range}
                          </span>
                          <span className="text-slate-200">{item.count}人</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Active student interactive roster with instant supplement hour triggers */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 font-mono block mb-1">👩‍💻 正在参与线上培训人员学时核对</span>
                    <div className="space-y-1 max-h-[120px] overflow-y-auto custom-scrollbar pr-1">
                      {simulatedTraineeLogs.map(student => (
                        <div key={student.id} className="p-1.5 border border-slate-900 rounded bg-slate-950/60 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-bold text-slate-200 block">{student.name}</span>
                            <span className="text-[9px] text-slate-500 font-mono block truncate max-w-[120px]">{student.matName}</span>
                          </div>
                          
                          <div className="text-right">
                            <span className="text-[10px] font-mono font-bold text-cyan-400 block">{student.studyTime}小时</span>
                            <button
                              type="button"
                              onClick={() => handleSimulateStudy(student.name)}
                              className="text-[8.5px] text-blue-400 hover:underline bg-transparent border-none cursor-pointer p-0 font-mono font-bold leading-none"
                              title="手动录入并重算圆环"
                            >
                              一键增2h
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* COLUMN 3: ACADEMY DOWNLOAD TRACKING LOGS & TELEMETRY (lg:col-span-3) */}
                <div className="lg:col-span-3 bg-slate-900/20 border border-slate-900 rounded-lg p-3 flex flex-col justify-between">
                  <div>
                    <span className="text-[10.5px] font-bold text-slate-300 font-mono block mb-1.5">📊 学院文件下载情况与阅读流转监视</span>
                    <span className="text-[9px] text-slate-500 font-sans block mb-2 leading-tight">记录在学各成员电子教辅一键下载轨迹</span>
                    
                    {/* Live downloads statistics table */}
                    <div className="space-y-1.5 max-h-[170px] overflow-y-auto custom-scrollbar pr-1 text-[10.5px]">
                      {academyResources.map((item, idx) => (
                        <div key={item.id} className="p-1.5 bg-slate-950 border border-slate-900 rounded flex justify-between items-center font-mono">
                          <span className="text-slate-450 text-slate-400 truncate max-w-[120px]" title={item.title}>
                            {idx + 1}.{item.title}
                          </span>
                          <span className="font-extrabold text-cyan-400 shrink-0 ml-1">
                            {item.downloadCount} 次
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Simulated telemetry logger */}
                  <div className="mt-3 pt-2.5 border-t border-slate-900 font-mono text-[9px] text-slate-500 space-y-1 leading-normal">
                    <span className="block border-b border-slate-900/50 pb-1 font-bold text-slate-400">⏱️ 微视频及手册流转总审计:</span>
                    <div className="flex justify-between">
                      <span>已下载手册总量:</span>
                      <span className="font-bold text-slate-305 text-slate-300">
                        {academyResources.filter(r => r.type === "pdf").reduce((acc, c) => acc + c.downloadCount, 0)}份
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>视频点播总量数:</span>
                      <span className="font-bold text-slate-305 text-slate-300">
                        {academyResources.filter(r => r.type === "video").reduce((acc, c) => acc + c.downloadCount, 0)}次
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* PAGE 6: 日常环保档案管理 */}
          {activeSubTab === "archives_mgmt" && (
            <div id="archives-mgmt-page" className="bg-slate-950/80 border border-slate-900 rounded-xl p-5 shadow-lg relative transition-all duration-300">
              <div className="border-b border-slate-900 pb-3 mb-4 flex justify-between items-center flex-wrap gap-2">
                <div>
                  <h3 className="font-sans text-xs font-semibold text-cyan-400 uppercase tracking-widest flex items-center gap-1.5 font-mono">
                    <FolderCheck className="h-4.5 w-4.5 text-cyan-500 animate-pulse" />
                    日常环保改造电子档案及资质备案台账
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-1">
                    实时对相应的改选、环评、排污报告包进行上传、发布状态修订、历史版本升级及一键导出等项
                  </p>
                </div>

                {/* Exporter triggers */}
                <button
                  type="button"
                  onClick={handleExportAllReports}
                  className="px-3.5 py-1.5 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold rounded text-[10.5px] shadow active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer border-none"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  <span>一键综合分析并打包导出全部报表数据</span>
                </button>
              </div>

              {/* Loader exporter interactive indicator */}
              {exportProgress >= 0 && (
                <div className="mb-3.5 bg-slate-900/60 border border-cyan-900/55 p-3 rounded-lg flex items-center gap-4 text-xs font-mono">
                  <RefreshCw className="h-4 w-4 text-cyan-400 animate-spin shrink-0" />
                  <div className="flex-1">
                    <div className="flex justify-between font-bold text-slate-300 mb-1 leading-none">
                      <span>编译导出项目合规包 [HXLQ_Environmental_Comp...]</span>
                      <span>{exportProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-950 h-1 rounded overflow-hidden">
                      <div className="bg-cyan-500 h-full transition-all duration-500" style={{ width: `${exportProgress}%` }} />
                    </div>
                  </div>
                </div>
              )}

              {/* Category fast filters */}
              <div className="flex bg-slate-900/40 p-2 rounded-lg border border-slate-900/80 mb-3 ml-0 justify-between items-center text-xs flex-wrap gap-2.5">
                <span className="text-[10px] text-slate-500 font-mono">筛选档案资质分类:</span>
                <div className="flex gap-1 flex-wrap">
                  {["ALL", "环评报告", "排污许可证", "检测报告", "环保组织架构", "企业简介"].map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedFileCategory(cat)}
                      className={`px-2 md:px-2.5 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                        selectedFileCategory === cat
                          ? "bg-cyan-950 text-cyan-400 border border-cyan-900"
                          : "text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      {cat === "ALL" ? "全部类型" : cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                
                {/* COLUMN 1: DOSSIER STATE LIST (lg:col-span-8) */}
                <div className="lg:col-span-8 bg-[#020617]/50 border border-slate-900 rounded-lg p-3.5 flex flex-col justify-between">
                  <div>
                    <span className="text-[10.5px] font-bold text-slate-300 font-mono block mb-2.5">🗂️ 档案流转名录库 (支持发布状态控制及重版升级)</span>
                    
                    <div className="space-y-1.5 max-h-[290px] overflow-y-auto custom-scrollbar pr-1">
                      {archivesList
                        .filter(f => selectedFileCategory === "ALL" || f.category === selectedFileCategory)
                        .map(file => (
                          <div key={file.id} className="p-3 border border-slate-900 hover:border-slate-800 bg-slate-950/40 rounded-lg flex flex-col gap-1.5 md:flex-row md:items-center md:justify-between text-xs">
                            <div className="min-w-0">
                              <span className="font-bold text-slate-200 block truncate max-w-[390px]" title={file.title}>
                                📃 {file.title}
                              </span>
                              
                              <div className="flex gap-3 text-[10px] text-slate-500 font-mono mt-1 select-none flex-wrap leading-tight">
                                <span className="text-cyan-401 text-cyan-400">[{file.category}]</span>
                                <span>版次: {file.version}</span>
                                <span>大小: {file.size}</span>
                                <span>上传人: {file.uploaderName}</span>
                                <span>时间: {file.date}</span>
                              </div>
                            </div>

                            {/* Flexible publishing/version controller buttons */}
                            <div className="flex items-center gap-1.5 ml-auto md:ml-0 shrink-0 select-none">
                              {/* Publish status badge */}
                              <span className={`px-1.5 py-0.5 rounded text-[8.5px] font-mono font-bold border ${
                                file.status === "已发布"
                                  ? "bg-emerald-950/80 text-emerald-400 border-emerald-900"
                                  : "bg-amber-955 text-amber-500 border-amber-900 bg-amber-950/60"
                              }`}>
                                {file.status}
                              </span>

                              {/* Trigger single publish if Draft */}
                              {file.status === "草稿" && (
                                <button
                                  type="button"
                                  onClick={() => handlePublishArchive(file.id, file.title)}
                                  className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-900 text-emerald-400 hover:bg-emerald-900 transition-colors font-bold cursor-pointer"
                                  title="审核签章一键发布"
                                >
                                  核准发布
                                </button>
                              )}

                              {/* Upgrade File version trigger */}
                              <button
                                type="button"
                                onClick={() => handleUpgradeArchiveVersion(file.id, file.title, file.version)}
                                className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors font-bold cursor-pointer"
                                title="修订其长效版本"
                              >
                                修订版控
                              </button>

                              {/* Download trigger */}
                              <button
                                type="button"
                                onClick={() => handleSimulateDownloadFile(file.title)}
                                className="bg-slate-900 border border-slate-800 p-1 rounded text-slate-300 hover:text-white cursor-pointer shrink-0"
                                title="查阅下传"
                              >
                                <Download className="h-3 w-3" />
                              </button>

                              {/* Revoke trigger */}
                              <button
                                type="button"
                                onClick={() => handleSimulateDeleteFile(file.id, file.title)}
                                className="bg-slate-900 border border-slate-800 p-1 rounded text-red-400 hover:text-red-500 cursor-pointer shrink-0"
                                title="删档注销"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      {archivesList.filter(f => selectedFileCategory === "ALL" || f.category === selectedFileCategory).length === 0 && (
                        <p className="text-[11px] text-slate-500 text-center py-10 font-mono">在此分类下暂无已录入文件档案</p>
                      )}
                    </div>
                  </div>

                  <span className="text-[9px] text-slate-550 font-mono italic block pt-2 border-t border-slate-900 mt-2">
                    * 档案管理支持全季度Modbus/CEMS实态数据自动签章归册。
                  </span>
                </div>

                {/* COLUMN 2: DUST DRAG-DROP ZONE + MANUAL FILE SELECTOR (lg:col-span-4) */}
                <div className="lg:col-span-4 flex flex-col justify-between space-y-4">
                  {/* Advanced drag-drop mock zone supporting upload */}
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleSimulateDropFile}
                    className="flex-1 rounded-lg border-2 border-dashed border-slate-800 bg-slate-900/10 hover:border-cyan-850 hover:bg-slate-900/20 flex flex-col items-center justify-center p-5 text-center cursor-pointer transition-all min-h-[141px]"
                    onClick={() => {
                      // Click to simulate upload
                      const inputTitle = prompt("【手动点击模拟本地上传环境文件】\n请输入想要上传的政策或环评文件标题名（无需打后缀）：", "二季度有组织污染自排测标定检测");
                      if (inputTitle) {
                        const item = {
                          id: `file-upload-${Date.now()}`,
                          title: inputTitle + ".pdf",
                          category: "检测报告",
                          size: `${(Math.random() * 15 + 1).toFixed(1)} MB`,
                          uploaderName: "曹工",
                          date: new Date().toISOString().split("T")[0],
                          status: "草稿",
                          version: "V1.0"
                        };
                        setArchivesList([item, ...archivesList]);
                        onAddLogMessage(`[环保归档-上传] 手动上传公文：${item.title} 存为草料草稿。`);
                      }
                    }}
                  >
                    <Upload className="h-7 w-7 text-slate-500 animate-bounce mb-1.5" />
                    <span className="text-[11px] font-bold text-slate-350 block">托拽本地文件或直接【点击】此框</span>
                    <span className="text-[9px] text-slate-500 block">
                      支持拖放上传环境检测报告、排污资质
                    </span>
                    <span className="text-[8.5px] text-cyan-500 font-mono mt-1 border border-cyan-900 px-1 py-0.5 rounded bg-cyan-950/20">
                      支持 PDF、DOCX、XLSX
                    </span>
                  </div>

                  {/* Manual Form upload/entry (录入) */}
                  <form onSubmit={handleUploadArchive} className="bg-slate-950 border border-slate-900 rounded p-2.5 space-y-1.5 text-xs text-slate-300">
                    <span className="text-[10px] font-bold text-cyan-400 font-mono block">⚖️ 手动填报/录入官方资质电子档案</span>
                    
                    <input
                      type="text"
                      placeholder="公文档名 (例: 1#窑脱硝旁路消磁调试)"
                      value={newArchTitle}
                      onChange={(e) => setNewArchTitle(e.target.value)}
                      className="w-full bg-[#050b14] border border-slate-800 text-xs text-slate-200 px-2 py-1 rounded placeholder-slate-600 outline-none"
                      required
                    />
                    
                    <div className="grid grid-cols-2 gap-1.5">
                      <select
                        value={newArchCategory}
                        onChange={(e) => setNewArchCategory(e.target.value)}
                        className="bg-slate-950 border border-slate-800 text-[10px] text-slate-350 px-1.5 py-1 rounded outline-none"
                      >
                        <option value="环评报告">环评报告</option>
                        <option value="排污许可证">排污许可证</option>
                        <option value="检测报告">检测报告</option>
                        <option value="环保组织架构">环保组织架构</option>
                        <option value="企业简介">企业简介</option>
                      </select>
                      <input
                        type="text"
                        placeholder="主理人 (例 曹工)"
                        value={newArchUploader}
                        onChange={(e) => setNewArchUploader(e.target.value)}
                        className="bg-[#050b14] border border-slate-800 text-xs text-slate-200 px-2 py-1.5 rounded placeholder-slate-600 outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-12 gap-1.5 items-center">
                      <input
                        type="text"
                        placeholder="大少 (2.4 MB)"
                        value={newArchSize}
                        onChange={(e) => setNewArchSize(e.target.value)}
                        className="col-span-8 bg-[#050b14] border border-slate-800 text-xs text-slate-200 px-2 py-1 rounded placeholder-slate-600 outline-none"
                      />
                      <button
                        type="submit"
                        className="col-span-4 text-center py-1 bg-cyan-955 bg-cyan-950/70 hover:bg-cyan-900 text-[10px] font-bold text-cyan-400 rounded border border-cyan-900 cursor-pointer"
                      >
                        手动录入
                      </button>
                    </div>
                  </form>
                </div>

              </div>
            </div>
          )}

          {/* PAGE 7: 备品备件清单 (驻点人员定位考勤) */}
          {activeSubTab === "spares_list" && (
            <div id="spares-list-page" className="bg-slate-950/80 border border-slate-900 rounded-xl p-5 shadow-lg relative transition-all duration-300">
              <div className="border-b border-slate-900 pb-3 mb-4 flex justify-between items-center flex-wrap gap-2">
                <div>
                  <h3 className="font-sans text-xs font-semibold text-cyan-400 uppercase tracking-widest flex items-center gap-1.5 font-mono">
                    <Users className="h-4.5 w-4.5 text-cyan-500 animate-pulse" />
                    备品备件清单 — 驻点维保人员北斗实时考勤定位台账
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-1">
                    实时采集维保人员北斗定位系统和电子考勤系统数据，列表滚动形式显示驻点维保、工种、在岗及精确位置信息
                  </p>
                </div>

                {/* Live Search bar */}
                <div className="relative text-xs">
                  <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                    <Search className="h-3.5 w-3.5 text-slate-650" />
                  </span>
                  <input
                    type="text"
                    placeholder="按姓名/工种智能筛选人员..."
                    value={operatorSearchText}
                    onChange={(e) => setOperatorSearchText(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded pl-8 pr-3 py-1 text-slate-200 outline-none w-[180px] text-[10.5px] placeholder-slate-600"
                  />
                </div>
              </div>

              {/* Scrolling vertical ticker listing table */}
              <div className="border border-slate-900 rounded-lg overflow-hidden text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-900 text-slate-550 border-b border-slate-850 text-[10px] font-mono">
                      <th className="py-2 px-3 font-bold">常设维保姓名</th>
                      <th className="py-2 px-3">专职及工种</th>
                      <th className="py-2 px-3">北斗呼叫联络</th>
                      <th className="py-2 px-3 text-center">电子打卡状态</th>
                      <th className="py-2 px-3 font-bold flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-cyan-500" />北斗精确定位驻点位置</th>
                      <th className="py-2 px-3 text-center">系统探针</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900 bg-slate-950 font-mono text-slate-300">
                    {operatingStaffLocList
                      .filter(s => {
                        const q = operatorSearchText.toLowerCase();
                        return s.name.toLowerCase().includes(q) || s.job.toLowerCase().includes(q);
                      })
                      .map((staff, idx) => {
                        const isWorking = staff.status.includes("在岗") || staff._status === "在岗巡检中";
                        
                        return (
                          <tr key={staff.name} className="hover:bg-slate-905 transition-colors">
                            <td className="py-3 px-3 font-sans font-bold text-slate-100">{staff.name}</td>
                            <td className="py-3 px-3 text-slate-400 font-sans">{staff.job}</td>
                            <td className="py-3 px-3 font-mono text-slate-400">
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3 text-slate-600" />
                                {staff.phone}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-center">
                              <span className={`px-1.5 py-0.5 rounded text-[9.5px] font-sans font-medium ${
                                staff.status === "故障抢修中"
                                  ? "bg-rose-950 text-rose-450 border border-rose-900"
                                  : "bg-emerald-950 text-emerald-450 border border-emerald-900 text-emerald-400"
                              }`}>
                                {staff.status}
                              </span>
                            </td>
                            <td className="py-3 px-3 font-sans font-semibold text-slate-205 flex items-center gap-1.5 py-3.5">
                              <Navigation className="h-3.5 w-3.5 text-cyan-404 shrink-0 animate-bounce text-cyan-400" />
                              <span>{staff.place}</span>
                            </td>
                            <td className="py-3 px-3 text-center">
                              <button
                                onClick={() => handleSimulatePingOperator(staff.name)}
                                className="px-2 py-0.5 border border-slate-800 rounded bg-slate-900 text-[10.5px] text-slate-350 hover:bg-slate-800 hover:text-white cursor-pointer"
                              >
                                手动电寻
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>

              {/* Attendance and scroll active notice indicator */}
              <div className="rounded p-3 bg-slate-900/40 border border-slate-900 mt-4 leading-normal text-[10.5px] font-mono text-slate-500 flex justify-between items-center">
                <span>🟢 列表已开启自动滚动。考勤和北斗GPS穿戴芯片同步每5秒自愈心跳正常。</span>
                <span>常设轮值：5人 | 实际在线：5人</span>
              </div>
            </div>
          )}

          {/* PAGE 8: 设备运维和备品备件管理 */}
          {activeSubTab === "spares_mgmt" && (
            <div id="spares-mgmt-page" className="bg-slate-950/80 border border-slate-900 rounded-xl p-5 shadow-lg relative transition-all duration-300">
              <div className="border-b border-slate-900 pb-3 mb-4">
                <h3 className="font-sans text-xs font-semibold text-cyan-400 uppercase tracking-widest flex items-center gap-1.5 font-mono">
                  <AlertTriangle className="h-4.5 w-4.5 text-cyan-500 animate-pulse text-red-510 text-red-400" />
                  环保净化专用备用材料库存下限监控制
                </h3>
                <p className="text-[10px] text-slate-500 mt-1">
                  对接全厂仓储物资系统中各类备件耗件，在库存量跌破安全防线时，自主预警并提醒采购下发单，避免脱硫脱硝或除尘停机
                </p>
              </div>

              {/* Grid of Spare stocks */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                {sparesStockList.map(item => {
                  const isUnderLimit = item.remaining < item.limit;
                  
                  return (
                    <div
                      key={item.id}
                      className={`p-4 rounded-xl border relative transition-all duration-300 ${
                        isUnderLimit
                          ? "bg-red-950/10 border-red-500/40 shadow-[0_0_12px_rgba(239,68,68,0.1)] ring-1 ring-red-500/15"
                          : "bg-slate-900/20 border-slate-900 hover:border-cyan-900"
                      }`}
                    >
                      {/* Top Warning flasher badge icon */}
                      {isUnderLimit && (
                        <span className="absolute top-3.5 right-3.5 h-2 w-2 rounded-full bg-red-400 animate-ping" />
                      )}

                      <span className="text-[9px] text-slate-500 font-mono block uppercase">{item.category}</span>
                      <h4 className="text-[11.5px] font-bold text-slate-200 mt-1 font-sans truncate" title={item.name}>{item.name}</h4>
                      
                      {/* Metrics bar */}
                      <div className="space-y-1 mt-3 font-mono text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-500">当前在库储备:</span>
                          <span className={`font-black ${isUnderLimit ? "text-red-400 animate-pulse text-[13px]" : "text-emerald-450 text-emerald-400 font-bold"}`}>
                            {item.remaining} {item.unit}
                          </span>
                        </div>
                        <div className="flex justify-between text-[11px] text-slate-550 border-t border-slate-900/20 pt-1">
                          <span className="text-slate-600">低水位预警限:</span>
                          <span className="text-slate-500">{item.limit} {item.unit}</span>
                        </div>
                      </div>

                      {/* Procurement action trigger */}
                      <div className="mt-4.5 flex gap-2 pt-2 border-t border-slate-900/10">
                        {isUnderLimit ? (
                          <button
                            onClick={() => handleProcureItem(item.id, item.name)}
                            className="w-full text-center py-1.5 rounded bg-red-950 hover:bg-red-900 text-red-200 font-bold border border-red-800 text-[11px] cursor-pointer"
                          >
                            ⚠️ 触发报警 · 提交补货申购契
                          </button>
                        ) : (
                          <div className="w-full text-center py-1.5 text-emerald-500 text-[10.5px] bg-emerald-950/20 border border-emerald-950/30 rounded font-mono font-medium flex items-center justify-center gap-1">
                            <Check className="h-3.5 w-3.5" /> 库存充足健康度高
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Warehouse safety info alert notes */}
              <div className="rounded-lg p-3 bg-slate-900/40 border border-slate-900 text-[10.5px] leading-normal font-sans text-slate-350">
                <b>💡 治暴防尘安全控制机制说:</b> 如果滤袋、喷咀等易损品发生越界缺货，会导致熟料粉碎机降压喷雾被动挂机30分钟以上，届时环境扬尘将出现灾难。库存系统每隔12小时自动与厂内备料库比对，对警戒红区进行标黄标红提醒。
              </div>
            </div>
          )}

        </div>

        {/* COMPREHENSIVE BOTTOM RUNNING STAT LOG DISPLAY */}
        <div className="bg-[#050b14]/50 border border-slate-900 rounded-xl p-3 flex justify-between items-center text-xs">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
            </span>
            <span className="font-mono text-slate-505 text-slate-400">目前选定子系统的底层遥感节点连通率保持：100% (正常调配模式)</span>
          </div>
          <span className="font-mono text-slate-600 text-[10px]">华新禄劝超低排放集中智能辅助</span>
        </div>

      </div>

      {/* 6B: FULL-SCREEN EXPORT REPORTS MODAL CONTAINER */}
      {showExportModal && (
        <div id="export-modal-overlay" className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-slate-950 border border-slate-900 max-w-4xl w-full rounded-xl p-6 relative flex flex-col justify-between max-h-[90vh] overflow-y-auto">
            
            {/* Close button */}
            <button
              onClick={() => {
                setShowExportModal(false);
                setExportProgress(-1);
              }}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-200 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Modal description header */}
            <div className="border-b border-slate-900 pb-3.5 mb-5">
              <span className="text-[10px] font-mono text-cyan-400 uppercase block font-bold leading-none">环境管理月度/年度超低改造汇总清单</span>
              <h3 className="text-sm font-black text-slate-200 mt-2 font-mono flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-emerald-400" />
                华新禄劝水泥厂 超低排放合规重要数据报表中心
              </h3>
              <p className="text-[10.5px] text-slate-500 mt-1">
                分项编译当前有组织CEMS、无组织微观站、大宗清洁运输量化及驻点工程对位等多端报表档案
              </p>
            </div>

            {/* Progress indicators if actively running */}
            {exportProgress >= 0 ? (
              <div className="py-20 text-center space-y-4">
                <RefreshCw className="h-8 w-8 text-cyan-400 animate-spin mx-auto" />
                <span className="text-xs font-bold font-mono text-slate-200 mt-2 block">
                  {exportProgress < 100 ? `系统正在自愈加密并编译报表一键包: ${exportProgress}%` : "【重要报表全部打包编译成功 ✔️】"}
                </span>
                
                {/* Visual Progress percentage bar */}
                <div className="w-64 bg-slate-900 h-2 rounded-full mx-auto overflow-hidden border border-slate-800">
                  <div
                    className="bg-cyan-500 h-full transition-all duration-300"
                    style={{ width: `${exportProgress}%` }}
                  />
                </div>

                {exportProgress === 100 && (
                  <p className="text-[10.5px] text-emerald-400 font-mono">
                    档案已保存至：<b>downloads/HXLQ_Environmental_Comp_2026.zip</b>
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-5">
                
                {/* 5 key Itemized report tables preview sheets */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                  
                  {/* Item 1: CEMS Stack Organized Average */}
                  <div className="bg-[#020617] p-3 rounded-lg border border-slate-905 border-slate-900">
                    <span className="text-[10px] text-cyan-400 font-bold block mb-1.5 flex justify-between">
                      <span>分项 1: CEMS 有组织年累排放年报</span>
                      <span className="text-slate-600">已校验</span>
                    </span>
                    <div className="space-y-1 text-slate-400 leading-normal">
                      <div className="flex justify-between"><span>1# 水泥窑头折算pm:</span> <span>3.8 mg/m³</span></div>
                      <div className="flex justify-between"><span>2# 余热发电机SO2折算:</span> <span>12.5 mg/m³</span></div>
                      <div className="flex justify-between border-t border-slate-900/60 pt-0.5"><span>脱硝氨逃逸实测均值:</span> <span className="text-emerald-500 font-bold">1.8 ppm</span></div>
                    </div>
                  </div>

                  {/* Item 2: Unorganized Ambient Dust */}
                  <div className="bg-[#020617] p-3 rounded-lg border border-slate-905 border-slate-900">
                    <span className="text-[10px] text-indigo-400 font-bold block mb-1.5 flex justify-between">
                      <span>分项 2: 无组织厂界粉尘及TSP合规表</span>
                      <span className="text-slate-600">已校验</span>
                    </span>
                    <div className="space-y-1 text-slate-400 leading-normal">
                      <div className="flex justify-between"><span>储煤均化大棚PM10均:</span> <span>42.0 µg/m³</span></div>
                      <div className="flex justify-between"><span>窑口熟料篦冷机TSP均:</span> <span>145.0 µg/m³</span></div>
                      <div className="flex justify-between border-t border-slate-900/60 pt-0.5"><span>全厂均无组织达标率:</span> <span className="text-emerald-500 font-bold">98.5% (极优)</span></div>
                    </div>
                  </div>

                  {/* Item 3: Clean Trans Euro VI Standard ratio */}
                  <div className="bg-[#020617] p-3 rounded-lg border border-slate-905 border-slate-900">
                    <span className="text-[10px] text-teal-400 font-bold block mb-1.5 flex justify-between">
                      <span>分项 3: 大宗绿色清洁运输指标档案</span>
                      <span className="text-slate-600">已校验</span>
                    </span>
                    <div className="space-y-1 text-slate-400 leading-normal">
                      <div className="flex justify-between"><span>进厂新能源+国六车辆数:</span> <span>1420 辆次</span></div>
                      <div className="flex justify-between"><span>厂内低排放纯电特种占比:</span> <span>88.0%</span></div>
                      <div className="flex justify-between border-t border-slate-900/60 pt-0.5"><span>清洁运输综合达成度:</span> <span className="text-emerald-500 font-bold">92.4% (通过)</span></div>
                    </div>
                  </div>

                  {/* Item 4: Spares Inventory alarm */}
                  <div className="bg-[#020617] p-3 rounded-lg border border-slate-905 border-slate-900">
                    <span className="text-[10px] text-amber-500 font-bold block mb-1.5 flex justify-between">
                      <span>分项 4: 除尘活性备件耗库存对仗表</span>
                      <span className="text-slate-600">已核</span>
                    </span>
                    <div className="space-y-1 text-slate-400 leading-normal">
                      <div className="flex justify-between"><span>PPS耐高温过滤布袋量:</span> <span>450 条 (低报警)</span></div>
                      <div className="flex justify-between"><span>双流体抑尘高空喷头嘴:</span> <span>45 个 (告警中)</span></div>
                      <div className="flex justify-between border-t border-slate-900/60 pt-0.5"><span>本月自动提报采购申请:</span> <span className="text-amber-500 font-bold">已并轨 2 次</span></div>
                    </div>
                  </div>

                </div>

                {/* Bottom modal triggers */}
                <div className="bg-slate-900/30 p-3.5 rounded-lg border border-slate-900 text-xs font-sans text-slate-400 flex items-center justify-between">
                  <span>
                    报表涵盖所有 <b>8 个子模块</b> 信息，下传一键包经数字时间戳盖章加密，支持省厅直接核实上墙。
                  </span>
                  
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => {
                        setShowExportModal(false);
                        setExportProgress(-1);
                      }}
                      className="px-4 py-2 border border-slate-800 rounded text-slate-400 hover:text-white cursor-pointer"
                    >
                      返回查阅
                    </button>
                    <button
                      onClick={handleExportAllReports}
                      className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-cyan-500 text-white font-bold rounded shadow cursor-pointer text-xs"
                    >
                      立即编译导出
                    </button>
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
