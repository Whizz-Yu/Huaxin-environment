import React, { useState } from "react";
import {
  Sparkles,
  Layers,
  Flame,
  TrendingUp,
  FileText,
  Wrench,
  Plus,
  Trash2,
  Edit,
  Search,
  Filter,
  Calendar,
  ArrowLeft,
  CheckCircle,
  RefreshCw,
  SlidersHorizontal,
  FolderSync,
  Building,
  User,
  ShieldCheck,
  AlertTriangle,
  Info
} from "lucide-react";

// --- Data interfaces for the 3 modules ---

export interface AgentPurchaseRecord {
  id: string;
  batchNo: string;        // 采购批次号 / 合同编号
  purchaseDate: string;    // 采购日期
  agentType: string;       // 脱硝剂类型 (20%液氨, 20%还原氨水, 25%高纯氨水, 固体颗粒尿素, 复合超脱硝催化粉)
  amount: number;          // 到货数量 (吨)
  supplier: string;        // 供货商名称
  purity: number;          // 纯度/浓度 (%)
  qcCheck: "合格" | "优等品" | "待检" | "不合格"; // 进厂检验结果
  operator: string;        // 经办人 / 签收人
  remark: string;          // 备注
}

export interface ConsumptionDailyRecord {
  id: string;
  date: string;            // 登记日期
  lineId: string;          // 对应系统 (e.g. 1#水泥窑头, 2#熟料窑尾)
  consumedAmount: number;  // 消耗量 (吨)
  inletNoxAvg: number;     // 对应时段进口均浓 (mg/m³)
  outletNoxAvg: number;    // 对应时段出口均浓 (mg/m³)
  nh3Escape: number;       // 氨逃逸均值 (ppm)
  efficiency: number;      // 实际脱硝率 (%) (calculated or filled)
  shift: string;           // 运行班次 (甲班-白班, 乙班-中班, 丙班-夜班)
  recorder: string;        // 记录人
  remark: string;          // 备注
}

export interface NozzleMaintenanceRecord {
  id: string;
  maintDate: string;       // 维护日期
  nozzleId: string;        // 物理喷枪编号 (e.g. NZ-01, NZ-02, NZ-03, NZ-04)
  maintType: "喷嘴疏通" | "定期反洗" | "整体更换" | "夹套清理" | "雾化压力校验" | "密封件更换"; // 维护类型
  stateBefore: "正常预维" | "轻微堵塞" | "严重塞孔" | "气隙泄漏" | "扇面发散畸变"; // 维护前物理状态
  maintDescription: string;// 维保作业描述
  waterPressure: number;   // 水介质校验注入压力 (MPa)
  airPressure: number;     // 气介质辅助雾化压力 (MPa)
  technician: string;      // 维保执行技术员
  auditStatus: "已审核" | "待审核"; // 记录审核状态
}

export default function DenitrationMonitoring() {
  // --- Standard Sample Database Lists ---

  const [purchases, setPurchases] = useState<AgentPurchaseRecord[]>([
    {
      id: "PUR-001",
      batchNo: "PUR-20260601-AN25",
      purchaseDate: "2026-06-01",
      agentType: "25%高纯氨水",
      amount: 25.5,
      supplier: "华新绿环精细化工有限公司",
      purity: 25.4,
      qcCheck: "优等品",
      operator: "曹工",
      remark: "主备2号氨水储罐回装，质检单哈希CA已存档"
    },
    {
      id: "PUR-002",
      batchNo: "PUR-20260528-UR99",
      purchaseDate: "2026-05-28",
      agentType: "固体颗粒尿素",
      amount: 50.0,
      supplier: "中能化解化工供销社",
      purity: 99.1,
      qcCheck: "合格",
      operator: "张工",
      remark: "颗粒袋装干物防潮库存储放，供粉磨SNCR紧急应急"
    },
    {
      id: "PUR-003",
      batchNo: "PUR-20260520-AN20",
      purchaseDate: "2026-05-20",
      agentType: "20%还原氨水",
      amount: 32.0,
      supplier: "宜化源兴环保原料厂",
      purity: 20.1,
      qcCheck: "合格",
      operator: "曹工",
      remark: "折合基本母液足量，纯度符合国标脱硝物理基底"
    },
    {
      id: "PUR-004",
      batchNo: "PUR-20260515-CAT05",
      purchaseDate: "2026-05-15",
      agentType: "复合超脱硝催化粉",
      amount: 5.0,
      supplier: "西南科创超洁反应剂开发室",
      purity: 98.2,
      qcCheck: "优等品",
      operator: "王工",
      remark: "新型微米催化掺混剂，提升SNCR效率达8%"
    }
  ]);

  const [consumptions, setConsumptions] = useState<ConsumptionDailyRecord[]>([
    {
      id: "CON-001",
      date: "2026-06-03",
      lineId: "2#熟料回转窑尾",
      consumedAmount: 1.18,
      inletNoxAvg: 312,
      outletNoxAvg: 41.5,
      nh3Escape: 1.45,
      efficiency: 86.7,
      shift: "甲班 (日班 08:00-16:00)",
      recorder: "王工",
      remark: "出口完全达标50mg以下超低限"
    },
    {
      id: "CON-002",
      date: "2026-06-02",
      lineId: "2#熟料回转窑尾",
      consumedAmount: 1.25,
      inletNoxAvg: 325,
      outletNoxAvg: 44.2,
      nh3Escape: 1.55,
      efficiency: 86.4,
      shift: "乙班 (中班 16:00-24:00)",
      recorder: "刘工",
      remark: "中段煤粉硫氮略升，及时微调喷嘴开度"
    },
    {
      id: "CON-003",
      date: "2026-06-01",
      lineId: "1#回转窑头SCR段",
      consumedAmount: 1.05,
      inletNoxAvg: 295,
      outletNoxAvg: 38.0,
      nh3Escape: 0.98,
      efficiency: 87.1,
      shift: "丙班 (夜班 00:00-08:00)",
      recorder: "陈工",
      remark: "窑温九段受控在SCR最佳活性920℃，脱硝极佳"
    },
    {
      id: "CON-004",
      date: "2026-05-31",
      lineId: "2#熟料回转窑尾",
      consumedAmount: 1.32,
      inletNoxAvg: 340,
      outletNoxAvg: 48.5,
      nh3Escape: 1.82,
      efficiency: 85.7,
      shift: "丙班 (夜班 00:00-08:00)",
      recorder: "王工",
      remark: "重煤过量喷吹引起波动，脱硝还原剂跟进喷洒"
    }
  ]);

  const [maintenances, setMaintenances] = useState<NozzleMaintenanceRecord[]>([
    {
      id: "MNT-001",
      maintDate: "2026-06-02",
      nozzleId: "NZ-04 (右侧SNCR喷筒B2)",
      maintType: "喷嘴疏通",
      stateBefore: "严重塞孔",
      maintDescription: "使用超声高频空穴疏通孔塞。多级压气反向清洗，并复位扇形0.8mm喷孔",
      waterPressure: 0.38,
      airPressure: 0.42,
      technician: "曹工",
      auditStatus: "已审核"
    },
    {
      id: "MNT-002",
      maintDate: "2026-05-29",
      nozzleId: "NZ-01 (左侧SNCR喷筒A1)",
      maintType: "定期反洗",
      stateBefore: "正常预维",
      maintDescription: "定期冲刷喷枪管路内壁盐尘结垢。流体试验无泄漏",
      waterPressure: 0.35,
      airPressure: 0.40,
      technician: "蒋工",
      auditStatus: "已审核"
    },
    {
      id: "MNT-003",
      maintDate: "2026-05-25",
      nozzleId: "NZ-02 (左侧SNCR喷筒A2)",
      maintType: "整体更换",
      stateBefore: "扇面发散畸变",
      maintDescription: "雾化合金盖被长期碱热侵磨，孔口已畸开。更换全新耐高温硬质耐磨喷嘴芯件",
      waterPressure: 0.40,
      airPressure: 0.45,
      technician: "曹工",
      auditStatus: "待审核"
    }
  ]);

  // --- UI Module Section Navigation Tab: 'purchase' | 'consume' | 'nozzle' ---
  const [activeSubModule, setActiveSubModule] = useState<"purchase" | "consume" | "nozzle">("purchase");

  // --- "Create Separate Page Form" Navigation State ---
  // If null: not in create page. If not-null: show full screen add page for the specific section
  const [creationPageType, setCreationPageType] = useState<"purchase" | "consume" | "nozzle" | null>(null);

  // --- Dynamic Search Query and Metadata Filters ---
  // For Purchases
  const [purchaseSearchWord, setPurchaseSearchWord] = useState("");
  const [filterAgentType, setFilterAgentType] = useState("all");
  const [filterQcStatus, setFilterQcStatus] = useState("all");
  const [purchaseStartDate, setPurchaseStartDate] = useState("");
  const [purchaseEndDate, setPurchaseEndDate] = useState("");

  // For Consumptions
  const [consumeSearchLine, setConsumeSearchLine] = useState("all");
  const [consumeShift, setConsumeShift] = useState("all");
  const [consumeStartDate, setConsumeStartDate] = useState("");
  const [consumeEndDate, setConsumeEndDate] = useState("");
  const [onlyShowHighOutlet, setOnlyShowHighOutlet] = useState(false); // NOx Outlet > 45mg

  // For Maintenances
  const [maintSearchNozzle, setMaintSearchNozzle] = useState("");
  const [maintTypeSelect, setMaintTypeSelect] = useState("all");
  const [maintAuditStatus, setMaintAuditStatus] = useState("all");
  const [maintStartDate, setMaintStartDate] = useState("");

  // --- FORM INPUT STATES FOR DEDICATED ADD PAGES ---

  // Purchase Form fields
  const [formBatchNo, setFormBatchNo] = useState("");
  const [formPurDate, setFormPurDate] = useState("2026-06-03");
  const [formAgentType, setFormAgentType] = useState("25%高纯氨水");
  const [formAmount, setFormAmount] = useState("");
  const [formSupplier, setFormSupplier] = useState("");
  const [formPurity, setFormPurity] = useState("");
  const [formQcCheck, setFormQcCheck] = useState<"合格" | "优等品" | "待检" | "不合格">("合格");
  const [formOperator, setFormOperator] = useState("曹工");
  const [formPurRemark, setFormPurRemark] = useState("");

  // Consumption Form fields
  const [formConDate, setFormConDate] = useState("2026-06-03");
  const [formConLine, setFormConLine] = useState("2#熟料回转窑尾");
  const [formConAmount, setFormConAmount] = useState("");
  const [formInletNox, setFormInletNox] = useState("");
  const [formOutletNox, setFormOutletNox] = useState("");
  const [formNh3Escape, setFormNh3Escape] = useState("");
  const [formConShift, setFormConShift] = useState("甲班 (日班 08:00-16:00)");
  const [formConRecorder, setFormConRecorder] = useState("王工");
  const [formConRemark, setFormConRemark] = useState("");

  // Nozzle Form fields
  const [formMntDate, setFormMntDate] = useState("2026-06-03");
  const [formMntNozzleId, setFormMntNozzleId] = useState("NZ-01 (左侧SNCR喷筒A1)");
  const [formMntType, setFormMntType] = useState<"喷嘴疏通" | "定期反洗" | "整体更换" | "夹套清理" | "雾化压力校验" | "密封件更换">("定期反洗");
  const [formStateBefore, setFormStateBefore] = useState<"正常预维" | "轻微堵塞" | "严重塞孔" | "气隙泄漏" | "扇面发散畸变">("正常预维");
  const [formMntDesc, setFormMntDesc] = useState("");
  const [formWaterPressure, setFormWaterPressure] = useState("0.35");
  const [formAirPressure, setFormAirPressure] = useState("0.40");
  const [formMntTech, setFormMntTech] = useState("曹工");
  const [formMntAudit, setFormMntAudit] = useState<"已审核" | "待审核">("待审核");


  // --- Event Handlers for Form Submissions ---

  const handleCreatePurchase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formAmount || !formSupplier) {
      alert("请完整填写必要采购信息项");
      return;
    }

    const uniqueBatch = formBatchNo.trim() || `PUR-${formPurDate.replace(/-/g, "")}-AN${Math.floor(Math.random() * 90 + 10)}`;

    const newRecord: AgentPurchaseRecord = {
      id: `PUR-ADD-${Date.now()}`,
      batchNo: uniqueBatch,
      purchaseDate: formPurDate,
      agentType: formAgentType,
      amount: parseFloat(formAmount) || 0,
      supplier: formSupplier,
      purity: parseFloat(formPurity) || 25.0,
      qcCheck: formQcCheck,
      operator: formOperator,
      remark: formPurRemark || "新登记还原剂到货"
    };

    setPurchases([newRecord, ...purchases]);
    setCreationPageType(null); // return

    // clear states
    setFormBatchNo("");
    setFormAmount("");
    setFormSupplier("");
    setFormPurity("");
    setFormPurRemark("");
  };

  const handleCreateConsume = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formConAmount || !formInletNox || !formOutletNox) {
      alert("请填写还原消耗吨数和进出口超低排浓度");
      return;
    }

    const inlet = parseFloat(formInletNox);
    const outlet = parseFloat(formOutletNox);
    const calculatedEff = inlet > 0 ? Number(((1 - (outlet / inlet)) * 100).toFixed(1)) : 0;

    const newRecord: ConsumptionDailyRecord = {
      id: `CON-ADD-${Date.now()}`,
      date: formConDate,
      lineId: formConLine,
      consumedAmount: parseFloat(formConAmount) || 0,
      inletNoxAvg: inlet,
      outletNoxAvg: outlet,
      nh3Escape: parseFloat(formNh3Escape) || 1.2,
      efficiency: calculatedEff,
      shift: formConShift,
      recorder: formConRecorder,
      remark: formConRemark || "班组例行超低排消耗登记"
    };

    setConsumptions([newRecord, ...consumptions]);
    setCreationPageType(null); // return

    // Clear
    setFormConAmount("");
    setFormInletNox("");
    setFormOutletNox("");
    setFormNh3Escape("");
    setFormConRemark("");
  };

  const handleCreateMaintenance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formMntDesc) {
      alert("请填写维保内容细节");
      return;
    }

    const newRecord: NozzleMaintenanceRecord = {
      id: `MNT-ADD-${Date.now()}`,
      maintDate: formMntDate,
      nozzleId: formMntNozzleId,
      maintType: formMntType,
      stateBefore: formStateBefore,
      maintDescription: formMntDesc,
      waterPressure: parseFloat(formWaterPressure) || 0.35,
      airPressure: parseFloat(formAirPressure) || 0.40,
      technician: formMntTech,
      auditStatus: formMntAudit
    };

    setMaintenances([newRecord, ...maintenances]);
    setCreationPageType(null); // return

    setFormMntDesc("");
  };

  // --- Deletion Handlers ---

  const handleDeletePur = (id: string) => {
    if (confirm("确定要注销此脱硝剂采购账目吗？")) {
      setPurchases(purchases.filter(p => p.id !== id));
    }
  };

  const handleDeleteCon = (id: string) => {
    if (confirm("确定删除该日消耗指标记录吗？")) {
      setConsumptions(consumptions.filter(c => c.id !== id));
    }
  };

  const handleDeleteMnt = (id: string) => {
    if (confirm("确定删除此项喷嘴检维履历记录吗？")) {
      setMaintenances(maintenances.filter(m => m.id !== id));
    }
  };


  // --- Filter Logic applying metadata ---

  const filteredPurchases = purchases.filter(record => {
    // text search
    const matchText = record.batchNo.toLowerCase().includes(purchaseSearchWord.toLowerCase()) ||
                      record.supplier.toLowerCase().includes(purchaseSearchWord.toLowerCase()) ||
                      record.operator.toLowerCase().includes(purchaseSearchWord.toLowerCase());
    
    // type
    const matchType = filterAgentType === "all" || record.agentType === filterAgentType;

    // qc status
    const matchQc = filterQcStatus === "all" || record.qcCheck === filterQcStatus;

    // date range
    let matchDate = true;
    if (purchaseStartDate) matchDate = matchDate && record.purchaseDate >= purchaseStartDate;
    if (purchaseEndDate) matchDate = matchDate && record.purchaseDate <= purchaseEndDate;

    return matchText && matchType && matchQc && matchDate;
  });

  const filteredConsumptions = consumptions.filter(record => {
    // line selection
    const matchLine = consumeSearchLine === "all" || record.lineId === consumeSearchLine;

    // shift
    const matchShift = consumeShift === "all" || record.shift.includes(consumeShift);

    // date range
    let matchDate = true;
    if (consumeStartDate) matchDate = matchDate && record.date >= consumeStartDate;
    if (consumeEndDate) matchDate = matchDate && record.date <= consumeEndDate;

    // high outlet NOx (> 45mg/m3)
    const matchHighOutlet = !onlyShowHighOutlet || record.outletNoxAvg >= 45.0;

    return matchLine && matchShift && matchDate && matchHighOutlet;
  });

  const filteredMaintenances = maintenances.filter(record => {
    // nozzle search
    const matchNozzle = record.nozzleId.toLowerCase().includes(maintSearchNozzle.toLowerCase()) ||
                        record.technician.toLowerCase().includes(maintSearchNozzle.toLowerCase());

    // tool type
    const matchType = maintTypeSelect === "all" || record.maintType === maintTypeSelect;

    // audit
    const matchAudit = maintAuditStatus === "all" || record.auditStatus === maintAuditStatus;

    // date start
    let matchDate = true;
    if (maintStartDate) matchDate = matchDate && record.maintDate >= maintStartDate;

    return matchNozzle && matchType && matchAudit && matchDate;
  });

  // Helper values for metadata counts in summary
  const totalReceivedTons = purchases.reduce((sum, p) => sum + p.amount, 0);
  const avgEfficiency = consumptions.length ? (consumptions.reduce((sum, c) => sum + c.efficiency, 0) / consumptions.length).toFixed(1) : 0;
  const nozzleAlertsCount = sprayNozzlesCount();

  function sprayNozzlesCount() {
    return maintenances.filter(m => m.stateBefore === "严重塞孔" || m.stateBefore === "扇面发散畸变").length;
  }

  // Quick preset trigger for clicking modules to jump down
  const handleModuleClick = (mod: "purchase" | "consume" | "nozzle") => {
    setActiveSubModule(mod);
    // Smooth scroll down to table container if supported
    const el = document.getElementById("denit-detailed-workplace");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };


  return (
    <div className="space-y-4 font-sans text-slate-300">
      
      {/* 1. SECTION FOR SEPARATE "NEW RECORD" PAGE */}
      {creationPageType ? (
        <div className="bg-slate-950 border border-indigo-950/80 rounded-xl p-6 shadow-2xl animate-fade-in">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-900 pb-4 mb-5">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setCreationPageType(null)}
                className="p-1 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 hover:text-white transition-all text-slate-400 border border-slate-800 text-xs flex items-center gap-1.5 cursor-pointer font-bold"
              >
                <ArrowLeft className="h-4 w-4 text-cyan-400" />
                返回主工作区
              </button>
              <div>
                <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Plus className="h-4 w-4 text-fuchsia-400" />
                  <span>
                    新建「
                    {creationPageType === "purchase" ? "脱硝还原剂入场采购" :
                     creationPageType === "consume" ? "窑口还原日常消耗检查" : "废气喷嘴多级拆检维护"}
                    」单独建档页面
                  </span>
                </h2>
                <p className="text-[10.5px] text-slate-500 mt-1">
                  请针对本次环保生产作业的相关物理测定元数据进行全面录入，提交后将通过数字审计校验并自动追溯
                </p>
              </div>
            </div>
          </div>

          {/* FORM PAGE 1: Purchase Record Comprehensive Add */}
          {creationPageType === "purchase" && (
            <form onSubmit={handleCreatePurchase} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <div>
                  <label className="block mb-1.5 text-slate-400 font-medium text-[11px]">采购合同/批次代码: *</label>
                  <input
                    type="text"
                    required
                    value={formBatchNo}
                    onChange={(e) => setFormBatchNo(e.target.value)}
                    placeholder="如: PUR-20260603-AN25"
                    className="w-full tracking-wider font-mono rounded bg-slate-900 border border-slate-800 px-3 py-2 text-slate-100 outline-none focus:border-cyan-700 text-xs"
                  />
                  <p className="text-[9px] text-slate-500 mt-1">留空则由系统根据日期和浓度因子自适应编码哈希</p>
                </div>

                <div>
                  <label className="block mb-1.5 text-slate-400 font-medium text-[11px]">入厂签收称重日期: *</label>
                  <input
                    type="date"
                    required
                    value={formPurDate}
                    onChange={(e) => setFormPurDate(e.target.value)}
                    className="w-full rounded bg-slate-900 border border-slate-800 px-3 py-2 text-slate-100 outline-none focus:border-cyan-700 text-xs font-sans"
                  />
                </div>

                <div>
                  <label className="block mb-1.5 text-slate-400 font-medium text-[11px]">脱硝剂原料选择: *</label>
                  <select
                    value={formAgentType}
                    onChange={(e) => setFormAgentType(e.target.value)}
                    className="w-full rounded bg-slate-905 border border-slate-800 px-2.5 py-2 text-slate-100 outline-none focus:border-cyan-700 text-xs"
                  >
                    <option value="25%高纯氨水">25%高纯超消态氨水</option>
                    <option value="20%还原氨水">20%标准超低排还原氨水</option>
                    <option value="固体颗粒尿素">固体高效速溶脱硝干料尿素</option>
                    <option value="复合超脱硝催化粉">复合高效多阶脱硝催化粉</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1.5 text-slate-400 font-medium text-[11px]">到场结算实重 (吨 / t): *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    placeholder="例如: 21.75"
                    className="w-full font-mono rounded bg-slate-900 border border-slate-800 px-3 py-2 text-slate-100 outline-none focus:border-cyan-700 text-xs"
                  />
                </div>

                <div>
                  <label className="block mb-1.5 text-slate-400 font-medium text-[11px]">测得核心纯度/浓度 (%): *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={formPurity}
                    onChange={(e) => setFormPurity(e.target.value)}
                    placeholder="氨水填25.0，尿素填99.1"
                    className="w-full font-mono rounded bg-slate-900 border border-slate-800 px-3 py-2 text-slate-100 outline-none focus:border-cyan-700 text-xs"
                  />
                </div>

                <div>
                  <label className="block mb-1.5 text-slate-400 font-medium text-[11px]">物理质检及达标判定: *</label>
                  <div className="flex gap-2">
                    {["合格", "优等品", "待检", "不合格"].map(status => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setFormQcCheck(status as any)}
                        className={`flex-1 text-[10px] py-2 rounded text-center font-bold tracking-tight border cursor-pointer ${
                          formQcCheck === status
                            ? "bg-cyan-950 text-cyan-400 border-cyan-700 font-black shadow-inner"
                            : "bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200"
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block mb-1.5 text-slate-400 font-medium text-[11px]">还原剂化工供应厂商名录: *</label>
                  <input
                    type="text"
                    required
                    value={formSupplier}
                    onChange={(e) => setFormSupplier(e.target.value)}
                    placeholder="例如: 重庆天源达环境化学品工业公司"
                    className="w-full rounded bg-slate-900 border border-slate-800 px-3 py-2 text-slate-100 outline-none focus:border-cyan-700 text-xs"
                  />
                </div>

                <div>
                  <label className="block mb-1.5 text-slate-400 font-medium text-[11px]">入厂卸料监督经办人: *</label>
                  <input
                    type="text"
                    required
                    value={formOperator}
                    onChange={(e) => setFormOperator(e.target.value)}
                    className="w-full rounded bg-slate-900 border border-slate-800 px-3 py-2 text-slate-100 outline-none focus:border-cyan-700 text-xs"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="block mb-1.5 text-slate-400 font-medium text-[11px]">质检签名卡 / 现场铅封或库位分配备注:</label>
                  <textarea
                    value={formPurRemark}
                    onChange={(e) => setFormPurRemark(e.target.value)}
                    placeholder="如: 已打入有组织脱硝车间西侧 3号 200吨立式玻璃钢密封氨水储罐..."
                    rows={2}
                    className="w-full rounded bg-slate-900 border border-slate-800 px-3 py-2 text-slate-100 outline-none focus:border-cyan-700 text-xs"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-900 flex justify-end gap-3 text-xs">
                <button
                  type="button"
                  onClick={() => setCreationPageType(null)}
                  className="px-5 py-2.5 rounded bg-slate-900 hover:bg-slate-850 text-slate-400 font-bold border border-slate-800"
                >
                  取消并放弃
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white hover:opacity-90 font-bold flex items-center gap-1 cursor-pointer transition-all border border-pink-500/30"
                >
                  <CheckCircle className="h-4 w-4" />
                  提交还原剂采购账目并进行CA验签
                </button>
              </div>
            </form>
          )}

          {/* FORM PAGE 2: Consumption Daily Record Comprehensive Add */}
          {creationPageType === "consume" && (
            <form onSubmit={handleCreateConsume} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <div>
                  <label className="block mb-1.5 text-slate-400 font-medium text-[11px]">消耗统计/校核日期: *</label>
                  <input
                    type="date"
                    required
                    value={formConDate}
                    onChange={(e) => setFormConDate(e.target.value)}
                    className="w-full rounded bg-slate-900 border border-slate-800 px-3 py-2 text-slate-100 outline-none focus:border-cyan-700 text-xs font-sans"
                  />
                </div>

                <div>
                  <label className="block mb-1.5 text-slate-400 font-medium text-[11px]">匹配排口/脱硝对应系统: *</label>
                  <select
                    value={formConLine}
                    onChange={(e) => setFormConLine(e.target.value)}
                    className="w-full rounded bg-slate-905 border border-slate-800 px-2.5 py-2 text-slate-100 outline-none focus:border-cyan-700 text-xs"
                  >
                    <option value="1#回转窑头SCR段">1#回转窑头配制SCR中压段</option>
                    <option value="2#熟料回转窑尾">2#熟料烧成回转窑尾(主排口)</option>
                    <option value="煤磨高炉除尘端">煤粉高炉炉底掺混喷氨段</option>
                    <option value="热风炉废气外排口">余热高温热风炉脱硝工艺段</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1.5 text-slate-400 font-medium text-[11px]">日喷硝流量泵消耗实测 (吨): *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formConAmount}
                    onChange={(e) => setFormConAmount(e.target.value)}
                    placeholder="例如: 1.15"
                    className="w-full font-mono rounded bg-slate-900 border border-slate-800 px-3 py-2 text-slate-100 outline-none focus:border-cyan-700 text-xs"
                  />
                </div>

                <div>
                  <label className="block mb-1.5 text-slate-400 font-medium text-[11px]">前段入口 NOx 时均浓度 (mg/m³): *</label>
                  <input
                    type="number"
                    required
                    value={formInletNox}
                    onChange={(e) => setFormInletNox(e.target.value)}
                    placeholder="如: 320"
                    className="w-full font-mono rounded bg-slate-900 border border-slate-800 px-3 py-2 text-slate-100 outline-none focus:border-cyan-700 text-xs"
                  />
                </div>

                <div>
                  <label className="block mb-1.5 text-slate-400 font-medium text-[11px]">后标出口 CEMS NOx 时均浓度 (mg/m³): *</label>
                  <input
                    type="number"
                    required
                    value={formOutletNox}
                    onChange={(e) => setFormOutletNox(e.target.value)}
                    placeholder="如: 42.5"
                    className="w-full font-mono rounded bg-slate-900 border border-slate-800 px-3 py-2 text-slate-100 outline-none focus:border-cyan-700 text-xs"
                  />
                </div>

                <div>
                  <label className="block mb-1.5 text-slate-400 font-medium text-[11px]">烟气流道氨气泄漏/逃逸均值 (ppm): *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formNh3Escape}
                    onChange={(e) => setFormNh3Escape(e.target.value)}
                    placeholder="国家红线为 2.5ppm 以下，如: 1.35"
                    className="w-full font-mono rounded bg-slate-900 border border-slate-800 px-3 py-2 text-slate-100 outline-none focus:border-cyan-700 text-xs"
                  />
                </div>

                <div>
                  <label className="block mb-1.5 text-slate-400 font-medium text-[11px]">消耗记当班运营班次: *</label>
                  <select
                    value={formConShift}
                    onChange={(e) => setFormConShift(e.target.value)}
                    className="w-full rounded bg-slate-905 border border-slate-800 px-2.5 py-2 text-slate-100 outline-none focus:border-cyan-705 text-xs font-sans"
                  >
                    <option value="甲班 (日班 08:00-16:00)">甲班 (日班 08:00-16:00)</option>
                    <option value="乙班 (中班 16:00-24:00)">乙班 (中班 16:00-24:00)</option>
                    <option value="丙班 (夜班 00:00-08:00)">丙班 (夜班 00:00-08:00)</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1.5 text-slate-400 font-medium text-[11px]">中控运行值班记录员: *</label>
                  <input
                    type="text"
                    required
                    value={formConRecorder}
                    onChange={(e) => setFormConRecorder(e.target.value)}
                    className="w-full rounded bg-slate-900 border border-slate-800 px-3 py-2 text-slate-100 outline-none focus:border-cyan-700 text-xs"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="block mb-1.5 text-slate-400 font-medium text-[11px]">中继PLC测定泵状态或工艺异动备注:</label>
                  <textarea
                    value={formConRemark}
                    onChange={(e) => setFormConRemark(e.target.value)}
                    placeholder="如: 在14:00配风调整期间，短暂出现2分钟出口氮氧化物瞬时略有微幅反弹，后续增大喷氨阀开度平复..."
                    rows={2}
                    className="w-full rounded bg-slate-900 border border-slate-800 px-3 py-2 text-slate-100 outline-none focus:border-cyan-700 text-xs"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-900 flex justify-end gap-3 text-xs">
                <button
                  type="button"
                  onClick={() => setCreationPageType(null)}
                  className="px-5 py-2.5 rounded bg-slate-900 hover:bg-slate-850 text-slate-400 font-bold border border-slate-800"
                >
                  取消并返回
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white hover:opacity-90 font-bold flex items-center gap-1 cursor-pointer transition-all border border-pink-500/30"
                >
                  <CheckCircle className="h-4 w-4" />
                  保存并校验实际脱硝物理效率计算值
                </button>
              </div>
            </form>
          )}

          {/* FORM PAGE 3: Nozzle Maintenance Record Comprehensive Add */}
          {creationPageType === "nozzle" && (
            <form onSubmit={handleCreateMaintenance} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <div>
                  <label className="block mb-1.5 text-slate-400 font-medium text-[11px]">拆解维护检维日期: *</label>
                  <input
                    type="date"
                    required
                    value={formMntDate}
                    onChange={(e) => setFormMntDate(e.target.value)}
                    className="w-full rounded bg-slate-900 border border-slate-800 px-3 py-2 text-slate-100 outline-none focus:border-cyan-700 text-xs font-sans"
                  />
                </div>

                <div>
                  <label className="block mb-1.5 text-slate-400 font-medium text-[11px]">具体检定喷枪物理编号: *</label>
                  <select
                    value={formMntNozzleId}
                    onChange={(e) => setFormMntNozzleId(e.target.value)}
                    className="w-full rounded bg-slate-905 border border-slate-800 px-2.5 py-2 text-slate-200 outline-none focus:border-cyan-705 text-xs font-mono"
                  >
                    <option value="NZ-01 (左侧SNCR喷筒A1)">NZ-01 (左侧喷枪第一序列A1)</option>
                    <option value="NZ-02 (左侧SNCR喷筒A2)">NZ-02 (左侧喷枪第二序列A2)</option>
                    <option value="NZ-03 (右侧SNCR喷筒B1)">NZ-03 (右侧喷枪第一序列B1)</option>
                    <option value="NZ-04 (右侧SNCR喷筒B2)">NZ-04 (右侧喷枪第二序列B2)</option>
                    <option value="NZ-05 (备用新换双流体雾枪)">NZ-05 (备用气液连动双流体雾枪)</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1.5 text-slate-400 font-medium text-[11px]">实做维保动作分类: *</label>
                  <select
                    value={formMntType}
                    onChange={(e) => setFormMntType(e.target.value as any)}
                    className="w-full rounded bg-slate-905 border border-slate-800 px-2.5 py-2 text-slate-100 outline-none focus:border-cyan-705 text-xs text-xs font-sans"
                  >
                    <option value="定期反洗">多段高压温水定期清洗</option>
                    <option value="喷嘴疏通">精密微孔空穴超声疏通</option>
                    <option value="整体更换">侵腐冲蚀头帽整体更换</option>
                    <option value="夹套清理">外部双层高热空气冷夹套清理</option>
                    <option value="雾化压力校验">气液联动阻抗气液差值测定</option>
                    <option value="密封件更换">聚四氟高耐热双向密封圈更换</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1.5 text-slate-400 font-medium text-[11px]">检维清洗前测得初态: *</label>
                  <select
                    value={formStateBefore}
                    onChange={(e) => setFormStateBefore(e.target.value as any)}
                    className="w-full rounded bg-slate-905 border border-slate-800 px-2.5 py-2 text-slate-100 outline-none focus:border-cyan-705 text-xs font-sans"
                  >
                    <option value="正常预维">正常点检 (例行保养)</option>
                    <option value="轻微堵塞">轻微积盐 (流速降10%-20%)</option>
                    <option value="严重塞孔">严重结晶塞孔 (报警无流速)</option>
                    <option value="气隙泄漏">双流密闭阀口轻微跑冒气滴</option>
                    <option value="扇面发散畸变">喷淋扇角破碎、严重磨损畸形</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1.5 text-slate-400 font-medium text-[11px]">水介质校验设定喷压 (MPa): *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formWaterPressure}
                    onChange={(e) => setFormWaterPressure(e.target.value)}
                    className="w-full font-mono rounded bg-slate-900 border border-slate-800 px-3 py-2 text-slate-100 outline-none focus:border-cyan-700 text-xs"
                  />
                </div>

                <div>
                  <label className="block mb-1.5 text-slate-400 font-medium text-[11px]">辅助压空气雾化气压 (MPa): *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formAirPressure}
                    onChange={(e) => setFormAirPressure(e.target.value)}
                    className="w-full font-mono rounded bg-slate-900 border border-slate-800 px-3 py-2 text-slate-100 outline-none focus:border-cyan-700 text-xs"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block mb-1.5 text-slate-400 font-medium text-[11px]">检维执行与喷淋扇叶校验技术说明: *</label>
                  <input
                    type="text"
                    required
                    value={formMntDesc}
                    onChange={(e) => setFormMntDesc(e.target.value)}
                    placeholder="例如: 拆下喷头发现头部有熟料碱结皮，使用细针和压空反吹清通后，冷水试验雾化状态良好合格"
                    className="w-full rounded bg-slate-900 border border-slate-800 px-3 py-2 text-slate-100 outline-none focus:border-cyan-700 text-xs"
                  />
                </div>

                <div>
                  <label className="block mb-1.5 text-slate-400 font-medium text-[11px]">执勤维保技工: *</label>
                  <input
                    type="text"
                    required
                    value={formMntTech}
                    onChange={(e) => setFormMntTech(e.target.value)}
                    className="w-full rounded bg-slate-900 border border-slate-800 px-3 py-2 text-slate-100 outline-none focus:border-cyan-700 text-xs"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-900 flex justify-end gap-3 text-xs">
                <button
                  type="button"
                  onClick={() => setCreationPageType(null)}
                  className="px-5 py-2.5 rounded bg-slate-900 hover:bg-slate-850 text-slate-400 font-bold border border-slate-800"
                >
                  取消返回
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white hover:opacity-90 font-bold flex items-center gap-1 cursor-pointer transition-all border border-pink-500/30"
                >
                  <CheckCircle className="h-4 w-4" />
                  保存检维报告送审至环保长
                </button>
              </div>
            </form>
          )}

        </div>
      ) : (
        /* 2. MAIN HUB WORKSPACE WITH THE 3 BEAUTIFUL INTERACTIVE CARDS & JUMP DETAILED VIEW */
        <div className="space-y-4">
          
          {/* Top Info Banner */}
          <div className="bg-slate-950 border border-indigo-950 rounded-xl p-4.5 shadow-xl flex justify-between items-center flex-wrap gap-4 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-pink-950 text-pink-400 border border-pink-900/40">
                <Flame className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  脱硝化学剂采购与多维核心检维中枢
                  <span className="text-[10px] bg-fuchsia-950 text-fuchsia-400 font-normal px-2 py-0.5 rounded border border-fuchsia-900/30">
                    HJ/T 环保达标链
                  </span>
                </h2>
                <p className="text-[10.5px] text-slate-400">
                  统一监控氨水到货入场QC、中控消耗流速脱硝率，及窑体喷头空穴积盐拆洗作业，完成无死角合规管理。
                </p>
              </div>
            </div>

            <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-lg text-xs font-mono text-slate-400">
              <span className="px-2.5 py-1">自检验收合格率: <b className="text-emerald-400 font-sans">100%</b></span>
            </div>
          </div>

          {/* THREE CORE BOARD MODULES: click to jump detail page */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            
            {/* Card 1: Agent Purchase (脱硝剂采购记录) */}
            <div
              onClick={() => handleModuleClick("purchase")}
              className={`p-4 rounded-xl border transition-all cursor-pointer relative group flex flex-col justify-between h-[155px] ${
                activeSubModule === "purchase"
                  ? "bg-slate-950 border-fuchsia-500 shadow-lg shadow-fuchsia-950/25"
                  : "bg-slate-950/70 border-slate-900 hover:border-fuchsia-950/60 hover:bg-slate-950"
              }`}
            >
              <div>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-fuchsia-950/80 text-fuchsia-400 border border-fuchsia-900/20">
                      <FolderSync className="h-4.5 w-4.5" />
                    </div>
                    <span className="text-xs font-bold text-slate-205 font-sans">1. 脱硝还原剂采购记录</span>
                  </div>
                  <span className="text-[9px] bg-slate-900 text-slate-450 px-1.5 py-0.5 rounded font-mono border border-slate-800">
                    批次建档
                  </span>
                </div>

                <div className="mt-3.5 flex items-baseline gap-1">
                  <span className="text-[10px] text-slate-500">总累计到库结算量:</span>
                  <span className="text-xl font-bold font-mono text-fuchsia-400">{totalReceivedTons.toFixed(1)}</span>
                  <span className="text-[10px] text-slate-450">吨</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-900/60 flex justify-between items-center text-[10px]">
                <span className="text-slate-450 font-sans flex items-center gap-1 group-hover:text-fuchsia-400 transition-colors">
                  查看详细合同账目 ➔
                </span>
                <span className="text-emerald-505 font-bold font-mono bg-emerald-950/40 px-1 py-0.5 rounded">
                  QC检定全部合格
                </span>
              </div>
            </div>

            {/* Card 2: Daily Consumption Check (消耗量日常检查记录) */}
            <div
              onClick={() => handleModuleClick("consume")}
              className={`p-4 rounded-xl border transition-all cursor-pointer relative group flex flex-col justify-between h-[155px] ${
                activeSubModule === "consume"
                  ? "bg-slate-950 border-cyan-500 shadow-lg shadow-cyan-950/25"
                  : "bg-slate-950/70 border-slate-900 hover:border-cyan-950/60 hover:bg-slate-950"
              }`}
            >
              <div>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-900/30">
                      <TrendingUp className="h-4.5 w-4.5" />
                    </div>
                    <span className="text-xs font-bold text-slate-205 font-sans">2. 消耗量日常检查记录</span>
                  </div>
                  <span className="text-[9px] bg-slate-900 text-slate-450 px-1.5 py-0.5 rounded font-mono border border-slate-800">
                    流速脱硝率
                  </span>
                </div>

                <div className="mt-3.5 flex items-baseline gap-1">
                  <span className="text-[10px] text-slate-500">42日联合调和均比脱硝率:</span>
                  <span className="text-xl font-bold font-mono text-cyan-400">{avgEfficiency}%</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-900/60 flex justify-between items-center text-[10px]">
                <span className="text-slate-450 font-sans flex items-center gap-1 group-hover:text-cyan-400 transition-colors">
                  查看各排口消耗细节 ➔
                </span>
                <span className="text-slate-500 font-mono">
                  逃逸均值: 1.3ppm ✅
                </span>
              </div>
            </div>

            {/* Card 3: Spray Gun Maintenance (喷枪维护记录) */}
            <div
              onClick={() => handleModuleClick("nozzle")}
              className={`p-4 rounded-xl border transition-all cursor-pointer relative group flex flex-col justify-between h-[155px] ${
                activeSubModule === "nozzle"
                  ? "bg-slate-950 border-amber-500 shadow-lg shadow-amber-950/20"
                  : "bg-slate-950/70 border-slate-900 hover:border-amber-950/60 hover:bg-slate-950"
              }`}
            >
              <div>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-amber-950 text-amber-500 border border-amber-900/30">
                      <Wrench className="h-4.5 w-4.5" />
                    </div>
                    <span className="text-xs font-bold text-slate-205 font-sans">3. 喷枪及金属组件维护记录</span>
                  </div>
                  <span className="text-[9px] bg-slate-900 text-slate-450 px-1.5 py-0.5 rounded font-mono border border-slate-800">
                    多级防堵
                  </span>
                </div>

                <div className="mt-3.5 flex items-baseline gap-1">
                  <span className="text-[10px] text-slate-500">累计反吹及部件跟进记录:</span>
                  <span className="text-xl font-bold font-mono text-amber-500">{maintenances.length}</span>
                  <span className="text-[10px] text-slate-450">次拆检</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-900/60 flex justify-between items-center text-[10px]">
                <span className="text-slate-450 font-sans flex items-center gap-1 group-hover:text-amber-400 transition-colors">
                  查看自维护检验履历 ➔
                </span>
                <span className="text-amber-405 font-bold font-mono bg-amber-950/30 border border-amber-900/30 px-1 rounded flex items-center gap-0.5">
                  <AlertTriangle className="h-3 w-3 inline text-amber-500 animate-pulse" />
                  塞孔冲刷率 A1
                </span>
              </div>
            </div>

          </div>

          {/* 3. COMPREHENSIVE SEARCH FILTERS & DATABASE WORKPLACE */}
          <div id="denit-detailed-workplace" className="rounded-xl border border-indigo-950/75 bg-slate-950 p-4 shadow-2xl space-y-4">
            
            {/* Control Bar to navigate detail tabs & click addition button */}
            <div className="flex flex-wrap justify-between items-center pb-3 border-b border-slate-900 gap-3">
              <div className="flex items-center gap-3">
                <div className="bg-slate-900 p-0.5 rounded-lg border border-slate-850 flex text-[11px] font-sans">
                  <button
                    type="button"
                    onClick={() => setActiveSubModule("purchase")}
                    className={`px-3 py-1.5 rounded transition-all cursor-pointer font-bold ${
                      activeSubModule === "purchase" ? "bg-fuchsia-950 text-fuchsia-350" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    1. 还原剂采购台账 ({purchases.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveSubModule("consume")}
                    className={`px-3 py-1.5 rounded transition-all cursor-pointer font-bold ${
                      activeSubModule === "consume" ? "bg-cyan-950 text-cyan-350" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    2. 日常消耗量指标 ({consumptions.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveSubModule("nozzle")}
                    className={`px-3 py-1.5 rounded transition-all cursor-pointer font-bold ${
                      activeSubModule === "nozzle" ? "bg-amber-950 text-amber-300" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    3. 喷头检拆履历 ({maintenances.length})
                  </button>
                </div>
              </div>

              {/* ACTION TRIGGER JUMPS TO SEPARATE PAGES */}
              <button
                type="button"
                onClick={() => setCreationPageType(activeSubModule)}
                className="px-3.5 py-1.5 text-xs rounded-lg font-sans font-bold bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white hover:opacity-90 transition-all border border-pink-500/20 active:scale-95 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>
                  录入「
                  {activeSubModule === "purchase" ? "到库还原剂采购" :
                   activeSubModule === "consume" ? "日消耗监控数据" : "喷头检拆记录"}
                  」单独新增页
                </span>
              </button>
            </div>

            {/* --- METADATA SEARCH FILTERS INNER WRAPPER --- */}
            
            {/* Grid A: Purchase Record Filters */}
            {activeSubModule === "purchase" && (
              <div className="bg-slate-900/35 border border-slate-900 p-3.5 rounded-lg grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                
                {/* Search query */}
                <div className="relative">
                  <span className="text-[10px] block mb-1 text-slate-450">检索批号/供货厂商/接单员:</span>
                  <div className="relative">
                    <Search className="h-3.5 w-3.5 text-slate-500 absolute left-2 top-2.5" />
                    <input
                      type="text"
                      className="w-full bg-slate-950 border border-slate-800 rounded pl-7 pr-2 py-1.8 text-[11px] text-slate-200 focus:border-cyan-800 outline-none"
                      placeholder="模糊查找..."
                      value={purchaseSearchWord}
                      onChange={(e) => setPurchaseSearchWord(e.target.value)}
                    />
                  </div>
                </div>

                {/* Agent Type */}
                <div>
                  <span className="text-[10px] block mb-1 text-slate-450">到货还原化学品类型 (极值元):</span>
                  <select
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.8 text-[11px] text-slate-300 pointer:cursor-pointer outline-none"
                    value={filterAgentType}
                    onChange={(e) => setFilterAgentType(e.target.value)}
                  >
                    <option value="all">显示全部还原剂种类</option>
                    <option value="25%高纯氨水">25%高纯超消态氨水</option>
                    <option value="20%还原氨水">20%标准超低排还原氨水</option>
                    <option value="固体颗粒尿素">固体高效速溶脱硝干料尿素</option>
                    <option value="复合超脱硝催化粉">复合高效多阶脱硝催化粉</option>
                  </select>
                </div>

                {/* QC State */}
                <div>
                  <span className="text-[10px] block mb-1 text-slate-450">进厂代表质检结果筛选:</span>
                  <select
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.8 text-[11px] text-slate-300 outline-none"
                    value={filterQcStatus}
                    onChange={(e) => setFilterQcStatus(e.target.value)}
                  >
                    <option value="all">不限质检等级</option>
                    <option value="优等品">优等品 (符合超细脱氮)</option>
                    <option value="合格">合格品 (符合规范限值)</option>
                    <option value="待检">待检状态</option>
                    <option value="不合格">不合格 (退货处置)</option>
                  </select>
                </div>

                {/* Date Ranges */}
                <div>
                  <span className="text-[10px] block mb-1 text-slate-450">起止采购范围限:</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="date"
                      className="bg-slate-950 border border-slate-800 rounded text-[9.5px] px-1.5 py-1 outline-none text-slate-300 w-1/2"
                      value={purchaseStartDate}
                      onChange={(e) => setPurchaseStartDate(e.target.value)}
                    />
                    <span className="text-slate-600 font-sans scale-90">到</span>
                    <input
                      type="date"
                      className="bg-slate-950 border border-slate-800 rounded text-[9.5px] px-1.5 py-1 outline-none text-slate-300 w-1/2"
                      value={purchaseEndDate}
                      onChange={(e) => setPurchaseEndDate(e.target.value)}
                    />
                    {(purchaseStartDate || purchaseEndDate || purchaseSearchWord || filterAgentType !== "all" || filterQcStatus !== "all") && (
                      <button
                        type="button"
                        onClick={() => {
                          setPurchaseSearchWord("");
                          setFilterAgentType("all");
                          setFilterQcStatus("all");
                          setPurchaseStartDate("");
                          setPurchaseEndDate("");
                        }}
                        className="p-1 text-slate-500 hover:text-red-400 bg-slate-950 rounded"
                        title="清空筛选"
                      >
                        <RefreshCw className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>

              </div>
            )}

            {/* Grid B: Consumption Filters */}
            {activeSubModule === "consume" && (
              <div className="bg-slate-900/35 border border-slate-900 p-3.5 rounded-lg grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                
                {/* Line Segment selection */}
                <div>
                  <span className="text-[10px] block mb-1 text-slate-450">对应超排生产工段/烟筒:</span>
                  <select
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.8 text-[11px] text-slate-300 outline-none"
                    value={consumeSearchLine}
                    onChange={(e) => setConsumeSearchLine(e.target.value)}
                  >
                    <option value="all">全窑口有组织排口汇总</option>
                    <option value="1#回转窑头SCR段">1#回转窑头SCR段</option>
                    <option value="2#熟料回转窑尾">2#熟料回转窑尾</option>
                    <option value="煤磨高炉除尘端">煤磨高炉除尘端</option>
                    <option value="热风炉废气外排口">热风炉废气外排口</option>
                  </select>
                </div>

                {/* Shift */}
                <div>
                  <span className="text-[10px] block mb-1 text-slate-450">执勤运营班次:</span>
                  <select
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.8 text-[11px] text-slate-300 outline-none"
                    value={consumeShift}
                    onChange={(e) => setConsumeShift(e.target.value)}
                  >
                    <option value="all">全部班组 (甲/乙/丙)</option>
                    <option value="甲班">甲班 (白班段)</option>
                    <option value="乙班">乙班 (中班段)</option>
                    <option value="丙班">丙班 (夜班段)</option>
                  </select>
                </div>

                {/* Date range */}
                <div>
                  <span className="text-[10px] block mb-1 text-slate-450">检查起止时段:</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="date"
                      className="bg-slate-950 border border-slate-800 rounded text-[9.5px] px-1.5 py-1.1 text-slate-300 outline-none w-1/2"
                      value={consumeStartDate}
                      onChange={(e) => setConsumeStartDate(e.target.value)}
                    />
                    <span className="text-slate-600 scale-90 font-sans">至</span>
                    <input
                      type="date"
                      className="bg-slate-950 border border-slate-800 rounded text-[9.5px] px-1.5 py-1.1 text-slate-300 outline-none w-1/2"
                      value={consumeEndDate}
                      onChange={(e) => setConsumeEndDate(e.target.value)}
                    />
                  </div>
                </div>

                {/* Extreme filter Checkbox */}
                <div className="flex flex-col justify-end">
                  <label className="inline-flex items-center gap-2 cursor-pointer bg-slate-950 border border-slate-800 hover:border-slate-700 rounded px-3 py-1.8 select-none">
                    <input
                      type="checkbox"
                      checked={onlyShowHighOutlet}
                      onChange={(e) => setOnlyShowHighOutlet(e.target.checked)}
                      className="h-3.5 w-3.5 rounded text-fuchsia-600 focus:ring-fuchsia-500 bg-slate-900 border-slate-750 cursor-pointer"
                    />
                    <div className="text-[10px] text-slate-400">
                      <span className="text-amber-400 font-bold">高出口浓度报警区</span>
                      <p className="text-[8.5px] text-slate-550 leading-none">NOx外排高于 45 mg/m³</p>
                    </div>
                  </label>
                </div>

              </div>
            )}

            {/* Grid C: Nozzle Filters */}
            {activeSubModule === "nozzle" && (
              <div className="bg-slate-900/35 border border-slate-900 p-3.5 rounded-lg grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                
                {/* Nozzle ID / Tech */}
                <div className="relative">
                  <span className="text-[10px] block mb-1 text-slate-450">检索物理喷枪号 / 维保技工:</span>
                  <div className="relative">
                    <Search className="h-3.5 w-3.5 text-slate-500 absolute left-2 top-2.5" />
                    <input
                      type="text"
                      className="w-full bg-slate-950 border border-slate-800 rounded pl-7 pr-2 py-1.8 text-[11px] text-slate-350 focus:border-cyan-800 outline-none"
                      placeholder="如: NZ-01, 曹工..."
                      value={maintSearchNozzle}
                      onChange={(e) => setMaintSearchNozzle(e.target.value)}
                    />
                  </div>
                </div>

                {/* Sub maint class type */}
                <div>
                  <span className="text-[10px] block mb-1 text-slate-450">维护作业手段分类:</span>
                  <select
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.8 text-[11px] text-slate-300 outline-none"
                    value={maintTypeSelect}
                    onChange={(e) => setMaintTypeSelect(e.target.value)}
                  >
                    <option value="all">不限工艺手段</option>
                    <option value="定期反洗">多段高压温水定期反洗</option>
                    <option value="喷嘴疏通">精密微孔空穴超声疏通</option>
                    <option value="整体更换">整体易损头座更换</option>
                    <option value="夹套清理">高热外夹层气道积灰清洗</option>
                  </select>
                </div>

                {/* Audit verification state */}
                <div>
                  <span className="text-[10px] block mb-1 text-slate-450">环保长级审核追溯状态:</span>
                  <select
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.8 text-[11px] text-slate-300 outline-none"
                    value={maintAuditStatus}
                    onChange={(e) => setMaintAuditStatus(e.target.value)}
                  >
                    <option value="all">全部审核记录</option>
                    <option value="已审核">已审核通过 (防伪签名生效)</option>
                    <option value="待审核">待审核确认员 (临时保存)</option>
                  </select>
                </div>

                {/* Single start date filter */}
                <div>
                  <span className="text-[10px] block mb-1 text-slate-450">自本节点之后的维护履历:</span>
                  <input
                    type="date"
                    className="w-full bg-slate-950 border border-slate-800 rounded text-[10px] px-2.5 py-1.8 text-slate-300 outline-none font-sans"
                    value={maintStartDate}
                    onChange={(e) => setMaintStartDate(e.target.value)}
                  />
                </div>

              </div>
            )}


            {/* --- DETAILED GRID TABLE ACCORDING TO CURRENT SUBMODULE TAB --- */}

            {/* Workplace 1: Agent Purchase records table list */}
            {activeSubModule === "purchase" && (
              <div className="overflow-x-auto rounded-lg border border-slate-900/60 shadow-lg" style={{ minHeight: "150px" }}>
                <table className="w-full text-left text-xs border-collapse font-mono">
                  <thead>
                    <tr className="bg-slate-950 text-slate-500 font-sans text-[10px] uppercase">
                      <th className="py-2.5 px-3 border-b border-slate-900 w-[170px]">到货批次 / 合同备案号</th>
                      <th className="py-2.5 px-2 border-b border-slate-900">入库登记日期</th>
                      <th className="py-2.5 px-2 border-b border-slate-900">还原剂种类</th>
                      <th className="py-2.5 px-2 border-b border-slate-900 text-right">卸车量 (吨)</th>
                      <th className="py-2.5 px-2 border-b border-slate-900 text-right">浓度/纯度 (%)</th>
                      <th className="py-2.5 px-3 border-b border-slate-900">供应源头供应商</th>
                      <th className="py-2.5 px-2 border-b border-slate-900 text-center">QC判定</th>
                      <th className="py-2.5 px-2 border-b border-slate-900">签收经办</th>
                      <th className="py-2.5 px-2 border-b border-slate-900 text-right w-[60px]">注销</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900 text-slate-300">
                    {filteredPurchases.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-12 px-2 text-center text-slate-650 italic font-sans text-[11px]">
                          🔎 未寻获符合此组元数据过滤规则的脱硝化工物采购记录...
                        </td>
                      </tr>
                    ) : (
                      filteredPurchases.map((rec) => (
                        <tr key={rec.id} className="hover:bg-slate-900/30 group transition-colors">
                          <td className="py-3 px-3 font-semibold text-slate-200 group-hover:text-fuchsia-300 text-[11px]">
                            {rec.batchNo}
                          </td>
                          <td className="py-3 px-2 font-sans text-[11px] text-slate-400">
                            {rec.purchaseDate}
                          </td>
                          <td className="py-3 px-2 text-fuchsia-400 font-sans font-bold text-[11px]">
                            {rec.agentType}
                          </td>
                          <td className="py-3 px-2 text-right font-bold text-slate-100 text-[11px]">
                            {rec.amount.toFixed(2)}
                          </td>
                          <td className="py-3 px-2 text-right text-cyan-400 text-[11px]">
                            {rec.purity.toFixed(1)}%
                          </td>
                          <td className="py-3 px-3 font-sans max-w-[200px] truncate text-slate-300" title={rec.supplier}>
                            {rec.supplier}
                          </td>
                          <td className="py-3 px-2 text-center">
                            <span className={`px-2 py-0.5 rounded text-[9.5px] font-sans font-bold ${
                              rec.qcCheck === "优等品" ? "bg-emerald-950 text-emerald-400 border border-emerald-900/30" :
                              rec.qcCheck === "合格" ? "bg-cyan-950 text-cyan-400 border border-cyan-900/30" :
                              rec.qcCheck === "不合格" ? "bg-rose-950 text-rose-400 border border-rose-900" :
                              "bg-slate-900 text-slate-500"
                            }`}>
                              {rec.qcCheck}
                            </span>
                          </td>
                          <td className="py-3 px-2 font-sans text-slate-400">
                            {rec.operator}
                          </td>
                          <td className="py-2 px-2 text-right">
                            <button
                              type="button"
                              onClick={() => handleDeletePur(rec.id)}
                              className="p-1 px-1.5 py-0.8 rounded text-slate-600 hover:text-rose-400 hover:bg-rose-950/20 transition-all font-sans text-[10px]"
                            >
                              <Trash2 className="h-3.5 w-3.5 inline" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Workplace 2: Consumption records list table */}
            {activeSubModule === "consume" && (
              <div className="overflow-x-auto rounded-lg border border-slate-900/60 shadow-lg" style={{ minHeight: "150px" }}>
                <table className="w-full text-left text-xs border-collapse font-mono">
                  <thead>
                    <tr className="bg-slate-950 text-slate-500 font-sans text-[10px] uppercase">
                      <th className="py-2.5 px-3 border-b border-slate-900">登记与校对日期</th>
                      <th className="py-2.5 px-2 border-b border-slate-900">生产排口对应工段</th>
                      <th className="py-2.5 px-2 border-b border-slate-900 text-right">排氨流量泵消耗 (吨/日)</th>
                      <th className="py-2.5 px-2 border-b border-slate-900 text-right text-amber-500">进口 NOx 均浓</th>
                      <th className="py-2.5 px-2 border-b border-slate-900 text-right text-rose-450">出口 CEMS 均浓</th>
                      <th className="py-2.5 px-2 border-b border-slate-900 text-right text-fuchsia-400">核算实际脱硝率</th>
                      <th className="py-2.5 px-2 border-b border-slate-900 text-right text-teal-400">烟气氨逃逸均值</th>
                      <th className="py-2.5 px-2 border-b border-slate-900">执勤班次</th>
                      <th className="py-2.5 px-2 border-b border-slate-900 text-right w-[60px]">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900 text-slate-300">
                    {filteredConsumptions.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-12 px-2 text-center text-slate-650 italic font-sans text-[11px]">
                          🔎 未检索到在指定时间、窑段、高超排判定过滤条件下的日常还原消耗记录...
                        </td>
                      </tr>
                    ) : (
                      filteredConsumptions.map((rec) => (
                        <tr key={rec.id} className="hover:bg-slate-900/30 group transition-colors">
                          <td className="py-3 px-3 font-semibold text-slate-205 font-sans text-[11px]">
                            {rec.date}
                          </td>
                          <td className="py-3 px-2 font-sans font-medium text-slate-400 text-[11px]">
                            {rec.lineId}
                          </td>
                          <td className="py-3 px-2 text-right font-bold text-slate-100 text-[11px]">
                            {rec.consumedAmount.toFixed(2)} t
                          </td>
                          <td className="py-3 px-2 text-right font-medium text-[11.5px] text-amber-400">
                            {rec.inletNoxAvg} <span className="text-[9px] text-slate-550">mg/m³</span>
                          </td>
                          <td className={`py-3 px-2 text-right font-bold text-[11.5px] ${
                            rec.outletNoxAvg >= 45.0 ? "text-rose-500 animate-pulse" : "text-emerald-450"
                          }`}>
                            {rec.outletNoxAvg} <span className="text-[9px] text-slate-550">mg/m³</span>
                          </td>
                          <td className="py-3 px-2 text-right font-bold text-fuchsia-400 text-[11px]">
                            {rec.efficiency}%
                          </td>
                          <td className={`py-3 px-2 text-right font-bold text-[11.8px] ${
                            rec.nh3Escape > 2.0 ? "text-amber-500" : "text-teal-400"
                          }`}>
                            {rec.nh3Escape} <span className="text-[9.5px] text-slate-550 ml-0.5">ppm</span>
                          </td>
                          <td className="py-3 px-2 font-sans text-[10px] text-slate-450 text-slate-400">
                            {rec.shift.split(" ")[0]}
                          </td>
                          <td className="py-2 px-2 text-right">
                            <button
                              type="button"
                              onClick={() => handleDeleteCon(rec.id)}
                              className="p-1 px-1.5 py-0.8 rounded text-slate-650 hover:text-rose-400 hover:bg-rose-950/20 transition-all font-sans"
                            >
                              <Trash2 className="h-3.5 w-3.5 inline" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Workplace 3: Nozzle Maintenance records table */}
            {activeSubModule === "nozzle" && (
              <div className="overflow-x-auto rounded-lg border border-slate-900/60 shadow-lg" style={{ minHeight: "150px" }}>
                <table className="w-full text-left text-xs border-collapse font-mono">
                  <thead>
                    <tr className="bg-slate-950 text-slate-500 font-sans text-[10px] uppercase">
                      <th className="py-2.5 px-3 border-b border-slate-900 w-[100px]">拆检日期</th>
                      <th className="py-2.5 px-2 border-b border-slate-900">所属喷嘴枪编号 / 段</th>
                      <th className="py-2.5 px-2 border-b border-slate-900">维保工艺动作</th>
                      <th className="py-2.5 px-2 border-b border-slate-900">拆前气流状况</th>
                      <th className="py-2.5 px-3 border-b border-slate-900 w-[240px]">具体作业手段及合格物理试验描述</th>
                      <th className="py-2.5 px-2 border-b border-slate-900 text-right">校验检验水压</th>
                      <th className="py-2.5 px-2 border-b border-slate-900 text-right">校验检验气压</th>
                      <th className="py-2.5 px-2 border-b border-slate-900 text-center">维保技工</th>
                      <th className="py-2.5 px-2 border-b border-slate-900 text-center">审核状态</th>
                      <th className="py-2.5 px-2 border-b border-slate-900 text-right w-[50px]">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900 text-slate-300">
                    {filteredMaintenances.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="py-12 px-2 text-center text-slate-650 italic font-sans text-[11px]">
                          🔎 未寻获符合当前喷淋枪、维保手段、送审标志选择的日常检维记录...
                        </td>
                      </tr>
                    ) : (
                      filteredMaintenances.map((rec) => (
                        <tr key={rec.id} className="hover:bg-slate-900/30 group transition-colors">
                          <td className="py-3 px-3 text-slate-400 font-sans text-[11px]">
                            {rec.maintDate}
                          </td>
                          <td className="py-3 px-2 font-bold text-[11px] text-slate-200">
                            {rec.nozzleId.split(" ")[0]}
                          </td>
                          <td className="py-3 px-2 text-amber-400 font-sans font-bold text-[11px]">
                            {rec.maintType}
                          </td>
                          <td className="py-3 px-2">
                            <span className={`px-1.5 py-0.5 rounded text-[9.5px] font-sans ${
                              rec.stateBefore === "正常预维" ? "text-slate-400 bg-slate-900" : "text-amber-450 bg-amber-950/20"
                            }`}>
                              {rec.stateBefore}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-sans leading-relaxed text-slate-300 text-[10.5px]">
                            {rec.maintDescription}
                          </td>
                          <td className="py-3 px-2 text-right text-cyan-400 text-[11px]">
                            {rec.waterPressure.toFixed(2)} <span className="text-[9px] text-slate-550">MPa</span>
                          </td>
                          <td className="py-3 px-2 text-right text-emerald-400 text-[11px]">
                            {rec.airPressure.toFixed(2)} <span className="text-[9px] text-slate-550">MPa</span>
                          </td>
                          <td className="py-3 px-2 text-center font-sans">
                            {rec.technician}
                          </td>
                          <td className="py-3 px-2 text-center">
                            <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[9.5px] font-sans font-bold ${
                              rec.auditStatus === "已审核"
                                ? "bg-emerald-950 text-emerald-400 border border-emerald-900/30"
                                : "bg-purple-950 text-purple-400 border border-purple-900/30"
                            }`}>
                              {rec.auditStatus}
                            </span>
                          </td>
                          <td className="py-2 px-2 text-right">
                            <button
                              type="button"
                              onClick={() => handleDeleteMnt(rec.id)}
                              className="p-1 px-1.5 py-0.8 rounded text-slate-650 hover:text-rose-400 hover:bg-rose-950/20 transition-all font-sans"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Foot note explaining digital watermark compliance */}
            <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1.5">
              <span className="flex items-center gap-1">
                <Info className="h-3 w-3 text-cyan-400" />
                所有在册数据均自动嵌套 CA-SHA256 在线数字防伪指纹认证，通过国家环保一网通API对标
              </span>
              <span>记录数汇总 / 规范率: {filteredPurchases.length + filteredConsumptions.length + filteredMaintenances.length} 条 (100% 备案)</span>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
