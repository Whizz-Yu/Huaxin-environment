import React, { useState } from "react";
import { CemsStack } from "../types";
import {
  ListFilter,
  Layers,
  Edit,
  Trash2,
  Wrench,
  Plus,
  X,
  Radio,
  Terminal,
  Check,
  Settings,
  Network,
  Activity,
  Play,
} from "lucide-react";

interface EmissionLedgerProps {
  allStacks: CemsStack[];
  selectedStackId: string;
  setSelectedStackId: (id: string) => void;
  onSetSubTab: (tab: string) => void;
  editingStackId: string | null;
  setEditingStackId: (id: string | null) => void;
  formName: string;
  setFormName: (val: string) => void;
  formProcess: string;
  setFormProcess: (val: string) => void;
  formPermitNo: string;
  setFormPermitNo: (val: string) => void;
  formHeight: string;
  setFormHeight: (val: string) => void;
  formDustMethod: string;
  setFormDustMethod: (val: string) => void;
  formDenitMethod: string;
  setFormDenitMethod: (val: string) => void;
  formHasBypass: boolean;
  setFormHasBypass: (val: boolean) => void;
  formStatus: "running" | "stopped" | "fault";
  setFormStatus: (val: "running" | "stopped" | "fault") => void;
  onAddOrEditStack: (e: React.FormEvent) => void;
  onTriggerEditStack: (stack: CemsStack) => void;
  onDeleteCustomStack: (id: string, e: React.MouseEvent) => void;
}

export default function EmissionLedger({
  allStacks,
  selectedStackId,
  setSelectedStackId,
  onSetSubTab,
  editingStackId,
  setEditingStackId,
  formName,
  setFormName,
  formProcess,
  setFormProcess,
  formPermitNo,
  setFormPermitNo,
  formHeight,
  setFormHeight,
  formDustMethod,
  setFormDustMethod,
  formDenitMethod,
  setFormDenitMethod,
  formHasBypass,
  setFormHasBypass,
  formStatus,
  setFormStatus,
  onAddOrEditStack,
  onTriggerEditStack,
  onDeleteCustomStack,
}: EmissionLedgerProps) {
  
  // Dialog state
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Equipment pairing tabs inside dialog: "profile" | "binding"
  const [modalTab, setModalTab] = useState<"profile" | "binding">("profile");

  // Equipment integration form fields inside modal
  const [deviceModel, setDeviceModel] = useState("华信物联 HZ-CEMS-300 型 烟气监测仪");
  const [protocol, setProtocol] = useState("Modbus TCP");
  const [ipAddress, setIpAddress] = useState("192.168.12.80:502");
  const [samplingRate, setSamplingRate] = useState("5s/次 高频轮询");
  const [deviceSn, setDeviceSn] = useState("CEMS-SN-2609-AD32B");
  
  // Simulated hardware connection state
  const [isTestingConn, setIsTestingConn] = useState(false);
  const [testLogs, setTestLogs] = useState<string[]>([]);
  const [connSuccess, setConnSuccess] = useState(false);

  // Trigger test pairing sequence
  const startConnectionTest = () => {
    setIsTestingConn(true);
    setConnSuccess(false);
    setTestLogs(["[INFO] 启动 CEMS 分析仪通讯连通性验证...", "[INFO] 连接 IP 地址: " + ipAddress + " (端口 502)"]);
    
    setTimeout(() => {
      setTestLogs(prev => [...prev, "[OK] TCP握手连通成功，设备在线", "[WARN] 正在校验 PLC 时钟寄存器..."]);
    }, 500);

    setTimeout(() => {
      setTestLogs(prev => [...prev, "[OK] HJ/T 212-2017 数字上报链路握手校验码: 0xF37A 对齐成功", "[INFO] 正在读取模拟气体零点偏..."]);
    }, 1100);

    setTimeout(() => {
      setTestLogs(prev => [...prev, "[绿色达标] CEMS 硬件连接完毕！一分钟高频秒级轮询就绪。", "✔ 在线监测遥测通道安全挂载启动!"]);
      setIsTestingConn(false);
      setConnSuccess(true);
    }, 1800);
  };

  // Open modal for editing
  const handleEditClick = (stack: CemsStack) => {
    onTriggerEditStack(stack);
    setModalTab("profile");
    setConnSuccess(false);
    setTestLogs([]);
    setIsModalOpen(true);
  };

  // Open modal for adding new
  const handleAddNewClick = () => {
    // Reset core states and parameters
    setEditingStackId(null);
    setFormName("");
    setFormProcess("熟料烧成工段");
    setFormPermitNo("91530181MA6N3K2D5X" + Math.floor(Math.random() * 900 + 100) + "P");
    setFormHeight("85m");
    setFormDustMethod("低压脉冲袋式除尘器");
    setFormDenitMethod("SNCR+SCR联合脱硝");
    setFormHasBypass(false);
    setFormStatus("running");
    
    setModalTab("profile");
    setConnSuccess(false);
    setTestLogs([]);
    setIsModalOpen(true);
  };

  // On submit, cascade down and close dialog
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddOrEditStack(e);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* 1. Statistics Cards Block */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-slate-950 p-3.5 rounded-xl border border-blue-950/70 relative overflow-hidden flex flex-col justify-between shadow-md">
          <div className="text-slate-500 font-sans font-medium text-[11px] flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
            厂区有组织采样点
          </div>
          <div className="mt-1 flex items-baseline gap-1 font-mono">
            <span className="text-2xl font-bold text-sky-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.2)] font-sans">12</span>
            <span className="text-[10px] text-slate-500">处 (按标设置)</span>
          </div>
          <div className="text-[9.5px] text-emerald-500 font-bold mt-1.5 flex items-center gap-1 bg-emerald-950/40 border border-emerald-900/30 px-1 py-0.5 rounded w-max">
            <span className="h-1 w-1 bg-emerald-400 rounded-full animate-pulse" />
            规范达标: 100%
          </div>
        </div>

        <div className="bg-slate-950 p-3.5 rounded-xl border border-blue-950/70 relative overflow-hidden flex flex-col justify-between shadow-md">
          <div className="text-slate-500 font-sans font-medium text-[11px] flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
            排气筒标准采样孔
          </div>
          <div className="mt-1 flex items-baseline gap-1 font-mono">
            <span className="text-2xl font-bold text-cyan-400 font-sans font-sans">24</span>
            <span className="text-[10px] text-slate-500">个 (对向双孔/四孔)</span>
          </div>
          <div className="text-[9.5px] text-emerald-500 font-bold mt-1.5 flex items-center gap-1 bg-emerald-950/40 border border-emerald-900/30 px-1 py-0.5 rounded w-max">
            <span className="h-1 w-1 bg-emerald-400 rounded-full animate-pulse" />
            孔高及规格达标
          </div>
        </div>

        <div className="bg-slate-950 p-3.5 rounded-xl border border-blue-950/70 relative overflow-hidden flex flex-col justify-between shadow-md">
          <div className="text-slate-500 font-sans font-medium text-[11px] flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
            标准采样平台/爬梯
          </div>
          <div className="mt-1 flex items-baseline gap-1 font-mono">
            <span className="text-2xl font-bold text-teal-400 font-sans">8</span>
            <span className="text-[10px] text-slate-500">座 (护栏及防坠标准)</span>
          </div>
          <div className="text-[9.5px] text-emerald-500 font-bold mt-1.5 flex items-center gap-1 bg-emerald-950/40 border border-emerald-900/30 px-1 py-0.5 rounded w-max">
            <span className="h-1 w-1 bg-emerald-400 rounded-full animate-pulse" />
            验收高度合格
          </div>
        </div>

        <div className="bg-slate-950 p-3.5 rounded-xl border border-blue-950/70 relative overflow-hidden flex flex-col justify-between shadow-md">
          <div className="text-slate-500 font-sans font-medium text-[11px] flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            连续在线监测系统(CEMS)
          </div>
          <div className="mt-1 flex items-baseline gap-1 font-mono">
            <span className="text-2xl font-bold text-emerald-400 font-sans">6</span>
            <span className="text-[10px] text-slate-500">套 (省监控直连)</span>
          </div>
          <div className="text-[9.5px] text-emerald-500 font-bold mt-1.5 flex items-center gap-1 bg-emerald-950/40 border border-emerald-900/30 px-1 py-0.5 rounded w-max">
            <span className="h-1 w-1 bg-emerald-400 rounded-full animate-pulse" />
            全烟道设备合格
          </div>
        </div>

        <div className="bg-slate-950 p-3.5 rounded-xl border border-blue-950/70 relative overflow-hidden flex flex-col justify-between shadow-md">
          <div className="text-slate-500 font-sans font-medium text-[11px] flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-fuchsia-400" />
            手工比对采样点
          </div>
          <div className="mt-1 flex items-baseline gap-1 font-mono">
            <span className="text-2xl font-bold text-fuchsia-400 font-sans">6</span>
            <span className="text-[10px] text-slate-500">个 (环保校正比对)</span>
          </div>
          <div className="text-[9.5px] text-emerald-500 font-bold mt-1.5 flex items-center gap-1 bg-emerald-950/40 border border-emerald-900/30 px-1 py-0.5 rounded w-max">
            <span className="h-1 w-1 bg-emerald-400 rounded-full" />
            自检验对标率 100%
          </div>
        </div>
      </div>

      {/* 2. Full-width Spacious Ledger Table Card */}
      <div className="rounded-xl border border-blue-900/30 bg-slate-950 p-4 shadow-xl">
        <div className="flex flex-wrap justify-between items-center border-b border-blue-950/70 pb-3.5 mb-3.5 gap-2">
          <div className="space-y-0.5">
            <h3 className="font-sans text-xs font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2">
              <Layers className="h-4.5 w-4.5" /> 厂区有组织排放源建账台账登记表
            </h3>
            <p className="text-[10px] text-slate-400 font-sans">
              本台账通过区块链哈希及设备自校验功能与省环保网关高密对齐，点击指标跳转查看联合监测对标。
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-[9.5px] text-slate-450 bg-slate-900 py-1.5 px-2.5 rounded font-mono border border-slate-800">
              内录备案底数: {allStacks.length} 处排口
            </span>
            <button
              type="button"
              onClick={handleAddNewClick}
              className="px-3 py-1.5 text-xs rounded bg-gradient-to-r from-sky-500 to-cyan-505 text-white hover:from-sky-600 hover:to-cyan-600 font-bold font-sans flex items-center gap-1 animate-pulse border border-cyan-400/20 active:scale-95 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              新增排放源建账
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-900 text-slate-400 font-sans text-[10px] uppercase">
                <th className="py-2.5 px-2">有组织排放口 & 许可证网码</th>
                <th className="py-2.5 px-2">匹配生产环节</th>
                <th className="py-2.5 px-2 text-center text-teal-400">一键穿梭 ➔ 联合监测与对标评价 (在线/手工/评判)</th>
                <th className="py-2.5 px-2 text-center">状态</th>
                <th className="py-2.5 px-2 text-center">设备对接情况</th>
                <th className="py-2.5 px-2 text-center w-[120px]">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900 font-mono">
              {allStacks.map((cems) => {
                const isSelected = selectedStackId === cems.id;
                const isCustom = cems.id.startsWith("cems-custom-");

                return (
                  <tr
                    key={cems.id}
                    onClick={() => setSelectedStackId(cems.id)}
                    className={`hover:bg-slate-900/40 cursor-pointer transition-all ${
                      isSelected ? "bg-cyan-950/20 text-cyan-300 font-semibold border-l-2 border-cyan-400" : "text-slate-300"
                    }`}
                  >
                    <td className="py-3 px-2">
                      <div className="flex flex-col">
                        <span className="font-sans text-[11px] truncate max-w-[210px] font-semibold text-slate-200">
                          {cems.name}
                        </span>
                        <span className="text-[9px] text-slate-500 tracking-tight mt-0.5 font-mono">{cems.permitNo}</span>
                      </div>
                    </td>
                    <td className="py-3 px-2 font-sans text-slate-400 text-[11px]">{cems.process}</td>

                    {/* Integrated Shuttle Button - redirect to single workspace tab */}
                    <td className="py-3 px-2 text-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedStackId(cems.id);
                          onSetSubTab("joint_monitoring");
                        }}
                        className="rounded px-3 py-1.2 text-[10.5px] font-sans bg-cyan-950/50 text-cyan-300 border border-cyan-900/50 hover:bg-cyan-900/60 hover:text-white transition-all inline-flex items-center gap-1.5 font-bold shadow-sm"
                      >
                        <Activity className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
                        查看联合监测与比标评价 ➔
                      </button>
                    </td>

                    <td className="py-3 px-2 text-center">
                      {cems.status === "running" ? (
                        <span className="text-[9.5px] bg-emerald-950/60 text-emerald-400 border border-emerald-900/40 px-2 py-0.5 rounded font-sans">
                          运行中
                        </span>
                      ) : cems.status === "stopped" ? (
                        <span className="text-[9.5px] bg-slate-900 text-slate-450 border border-slate-800 px-2 py-0.5 rounded font-sans">
                          待命备用
                        </span>
                      ) : (
                        <span className="text-[9.5px] bg-red-950/40 text-red-400 border border-red-900/40 px-2 py-0.5 rounded font-sans animate-pulse">
                          系统停机
                        </span>
                      )}
                    </td>

                    {/* Equipment Pairing Status Tag */}
                    <td className="py-3 px-2 text-center font-sans text-[10.5px]">
                      {isCustom ? (
                        <span className="text-cyan-400 font-semibold flex items-center justify-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                          已绑定Modbus(CEMS)
                        </span>
                      ) : (
                        <span className="text-sky-400 font-semibold flex items-center justify-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                          已绑定HJ212(原厂)
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-2 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleEditClick(cems)}
                          className="p-1 px-2 text-[10px] rounded bg-slate-900 text-slate-400 hover:text-cyan-400 hover:bg-slate-850 flex items-center gap-1 border border-slate-800/80 transition-all font-sans"
                        >
                          <Edit className="h-3 w-3" />
                          编辑档案
                        </button>
                        {isCustom ? (
                          <button
                            type="button"
                            onClick={(e) => onDeleteCustomStack(cems.id, e)}
                            className="p-1.5 rounded hover:bg-red-950 text-slate-450 hover:text-red-400 transition-all border border-transparent hover:border-red-900/30"
                            title="注销排口"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        ) : (
                          <span className="text-[9px] text-slate-600 select-none scale-90 italic">固定源</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. New Pop-up Dialog Modal for Adding/Editing Stack Profile & Equipping binding */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md animate-fade-in p-4 text-xs">
          <div className="relative bg-slate-950 border border-slate-800 rounded-xl w-full max-w-[680px] shadow-2xl p-5 overflow-hidden animate-scale-up">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-slate-900 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded bg-cyan-950 text-cyan-400">
                  <Wrench className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 className="font-sans text-xs font-bold text-slate-100 uppercase tracking-widest">
                    {editingStackId ? "修改有组织排口建账档案" : "新建有组织排口建账"}
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-0.5">登记新烟筒物理底数，并接入对标自动CEMS仪硬件配对</p>
                </div>
              </div>
              
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-105 hover:bg-slate-900 transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal SubTab Controls for Two pages inside Dialog */}
            <div className="flex border-b border-slate-900/60 mb-4 text-[11px] gap-2">
              <button
                type="button"
                onClick={() => setModalTab("profile")}
                className={`pb-2 px-3 font-sans transition-all relative cursor-pointer ${
                  modalTab === "profile" ? "text-cyan-400 font-bold" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                1. 📋 排放源基本物理档案
                {modalTab === "profile" && (
                  <div className="absolute bottom-0 inset-x-0 h-0.5 bg-cyan-400 rounded-full" />
                )}
              </button>
              <button
                type="button"
                onClick={() => setModalTab("binding")}
                className={`pb-2 px-3 font-sans transition-all relative flex items-center gap-1 cursor-pointer ${
                  modalTab === "binding" ? "text-cyan-300 font-bold" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                2. 🔋 绑定对接在线监测设备 (CEMS)
                <span className="text-[7.5px] bg-red-950 text-red-400 px-1 rounded border border-red-900/30 scale-90">必填</span>
                {modalTab === "binding" && (
                  <div className="absolute bottom-0 inset-x-0 h-0.5 bg-cyan-400 rounded-full" />
                )}
              </button>
            </div>

            {/* Modal Page 1: Profile fields */}
            {modalTab === "profile" ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="col-span-2">
                    <label className="block mb-1 text-slate-400 text-[10.5px]">排气筒/排放口名称: *</label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="例如: 窑尾高架物联对标专用排气筒"
                      className="w-full rounded bg-slate-900 border border-slate-800 px-3 py-2 text-slate-100 outline-none focus:border-cyan-705 text-xs font-sans"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-slate-400 text-[10.5px]">匹配生产工段:</label>
                    <select
                      value={formProcess}
                      onChange={(e) => setFormProcess(e.target.value)}
                      className="w-full rounded bg-slate-900 border border-slate-800 px-2.5 py-2 text-slate-100 outline-none focus:border-cyan-705 text-[11px]"
                    >
                      <option value="熟料烧成工段">熟料烧成工段</option>
                      <option value="预热与余热发电">预热与余热发电</option>
                      <option value="煤粉制备工段">煤粉制备工段</option>
                      <option value="水泥粉磨工段">水泥粉磨工段</option>
                      <option value="原料破碎工段">原料破碎工段</option>
                    </select>
                  </div>

                  <div>
                    <label className="block mb-1 text-slate-400 text-[10.5px]">当前运营时况:</label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as any)}
                      className="w-full rounded bg-slate-900 border border-slate-800 px-2.5 py-2 text-slate-100 outline-none focus:border-cyan-705 text-[11px]"
                    >
                      <option value="running">运行在线 (CEMS监控中)</option>
                      <option value="stopped">待命备用 (临时停窑备案)</option>
                      <option value="fault">异常停机 (数据锁定暂不上报)</option>
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="block mb-1 text-slate-400 text-[10.5px]">环保排污许可证编号 (省环保一网通码):</label>
                    <input
                      type="text"
                      value={formPermitNo}
                      onChange={(e) => setFormPermitNo(e.target.value)}
                      placeholder="字号: 91530181MA6N3K..."
                      className="w-full tracking-wider font-mono rounded bg-slate-900 border border-slate-800 px-3 py-2 text-slate-100 outline-none focus:border-cyan-705"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-slate-400 text-[10.5px]">主要配备除尘技术:</label>
                    <input
                      type="text"
                      value={formDustMethod}
                      onChange={(e) => setFormDustMethod(e.target.value)}
                      className="w-full rounded bg-slate-900 border border-slate-800 px-3 py-2 text-slate-200 outline-none focus:border-cyan-705"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-slate-400 text-[10.5px]">主要配套脱硝装置技术:</label>
                    <input
                      type="text"
                      value={formDenitMethod}
                      onChange={(e) => setFormDenitMethod(e.target.value)}
                      className="w-full rounded bg-slate-900 border border-slate-800 px-3 py-2 text-slate-200 outline-none focus:border-cyan-705"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="hasBypass"
                    checked={formHasBypass}
                    onChange={(e) => setFormHasBypass(e.target.checked)}
                    className="h-3 w-3 rounded text-cyan-600 focus:ring-cyan-500 bg-slate-900 border-slate-800 cursor-pointer"
                  />
                  <label htmlFor="hasBypass" className="text-slate-450 cursor-pointer text-[10.5px] select-none hover:text-slate-250 transition-all">
                    配套应急烟气物理旁路网阀 (如有，发生动作同步上报省监控台账)
                  </label>
                </div>

                {/* Navigation Button */}
                <div className="pt-4 flex justify-end gap-2.5 border-t border-slate-900">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded bg-slate-900 text-slate-400 hover:text-slate-100 font-sans cursor-pointer transition-all border border-slate-850"
                  >
                    取消
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!formName.trim()) {
                        alert("请输入排气口名称");
                        return;
                      }
                      setModalTab("binding");
                    }}
                    className="px-4 py-2 rounded bg-gradient-to-r from-sky-900 to-cyan-900 text-cyan-200 font-sans font-bold flex items-center gap-1 cursor-pointer transition-all hover:brightness-110 border border-cyan-800/40"
                  >
                    继续: 设备对接绑定 ➔
                  </button>
                </div>
              </form>
            ) : (
              /* Modal Page 2: CEMS Equipment pairing & connectivity testing panel */
              <div className="space-y-4 animate-fade-in text-xs">
                <div className="p-3 rounded-lg bg-cyan-950/20 border border-cyan-900/20 text-slate-400 leading-relaxed font-sans">
                  <p className="text-[10.5px] font-bold text-cyan-300 flex items-center gap-1 mb-1">
                    <Settings className="h-3.5 w-3.5" />
                    在线采集数采仪与通讯通道设置
                  </p>
                  在此填写并关联该气筒所安装的监测遥测 PLC 终端网络，实现高频烟气成分(PM、SO2、NOx)一键对接上墙。
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block mb-1 text-slate-400 text-[10.5px]">数采仪分析硬件型号:</label>
                    <select
                      value={deviceModel}
                      onChange={(e) => setDeviceModel(e.target.value)}
                      className="w-full rounded bg-slate-900 border border-slate-800 px-2.5 py-2 text-slate-200 outline-none text-[11px]"
                    >
                      <option value="华信物联 HZ-CEMS-300 型 烟气监测仪">华信物联 HZ-CEMS-300 型</option>
                      <option value="西门子 Siemens Ultramat 23 双气监测仪">西门子 Siemens Ultramat 23</option>
                      <option value="聚光科技 FPI F-CEMS-100A 高性能数采平台">聚光科技 FPI CEMS-100A</option>
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1 text-slate-400 text-[10.5px]">通讯协议及链路介质:</label>
                    <select
                      value={protocol}
                      onChange={(e) => setProtocol(e.target.value)}
                      className="w-full rounded bg-slate-900 border border-slate-800 px-2.5 py-2 text-slate-200 text-[11px] outline-none"
                    >
                      <option value="Modbus TCP">Modbus TCP 中控直连层</option>
                      <option value="OPC UA (Da/He)">OPC UA Realtime 安全封装</option>
                      <option value="国家标准环保协议 HJ 212-2017">国标环保协议 HJ 212-2017</option>
                    </select>
                  </div>

                  <div>
                    <label className="block mb-1 text-slate-400 text-[10.5px]">数采网物理 IP 与监听端口:</label>
                    <input
                      type="text"
                      value={ipAddress}
                      onChange={(e) => setIpAddress(e.target.value)}
                      placeholder="例如: 192.168.12.80:502"
                      className="w-full rounded font-mono bg-slate-900 border border-slate-800 px-3 py-2 text-slate-100 outline-none focus:border-cyan-705"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-slate-400 text-[10.5px]">数据采集传输底频 (轮询阀值):</label>
                    <select
                      value={samplingRate}
                      onChange={(e) => setSamplingRate(e.target.value)}
                      className="w-full rounded bg-slate-900 border border-slate-800 px-2.5 py-2 text-slate-200 text-[11px] outline-none"
                    >
                      <option value="5s/次 高频轮询">5秒/次 实时高频状态轮询</option>
                      <option value="30s/次 状态校验">30秒/次 稳态滤波算数轮测</option>
                      <option value="1min/次 分时均算">1分钟/次 分钟算术累计值</option>
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="block mb-1 text-slate-400 text-[10.5px]">设备出厂物理条码 (SN) / 备案加密签章:</label>
                    <input
                      type="text"
                      value={deviceSn}
                      onChange={(e) => setDeviceSn(e.target.value)}
                      className="w-full rounded font-mono bg-slate-900 border border-slate-800 px-3 tracking-wide py-2 text-slate-100 outline-none focus:border-cyan-705"
                    />
                  </div>
                </div>

                {/* Dynamic live test diagnostics simulator */}
                <div className="bg-slate-950 border border-slate-900 rounded-lg p-3">
                  <div className="flex justify-between items-center mb-1.5 border-b border-slate-900 pb-1">
                    <span className="text-[10px] text-teal-400 font-bold font-sans flex items-center gap-1">
                      <Terminal className="h-3 w-3" />
                      数采仪连通链路自诊断终端 (Live Check Console)
                    </span>
                    <button
                      type="button"
                      disabled={isTestingConn}
                      onClick={startConnectionTest}
                      className="px-2 py-0.5 rounded text-[9.5px] font-sans bg-cyan-950 hover:bg-cyan-900 text-cyan-300 font-bold border border-cyan-800/40 cursor-pointer disabled:text-slate-500 disabled:bg-slate-900 flex items-center gap-1 active:scale-95"
                    >
                      <Play className="h-2.5 w-2.5" />
                      {isTestingConn ? "正在校验联网..." : "测试物理连接"}
                    </button>
                  </div>
                  
                  {/* Test progress output queue */}
                  <div className="h-[90px] overflow-y-auto bg-slate-950 border border-slate-900/60 rounded p-2 text-[9.5px] font-mono text-slate-400 space-y-1 select-none">
                    {testLogs.length === 0 ? (
                      <span className="text-slate-650 italic">等待发起物理分析仪 PLC 变送寻址测试...</span>
                    ) : (
                      testLogs.map((log, i) => (
                        <div key={i} className={log.includes("[OK]") || log.includes("✔") || log.includes("绿色") ? "text-emerald-400" : log.includes("[WARN]") ? "text-amber-400" : "text-slate-400"}>
                          {log}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Dynamic Save submit */}
                <div className="pt-4 border-t border-slate-900 flex justify-end gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setModalTab("profile")}
                    className="px-4 py-2 rounded bg-slate-900 text-slate-400 hover:text-slate-100 font-sans cursor-pointer transition-all border border-slate-850"
                  >
                    返回上一步
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!connSuccess}
                    className={`px-5 py-2 rounded font-sans font-bold transition-all border ${
                      connSuccess
                        ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-500 shadow-md hover:brightness-110 select-all cursor-pointer"
                        : "bg-slate-900 text-slate-550 border-slate-800 cursor-not-allowed"
                    }`}
                  >
                    {connSuccess ? "✔ 完成对接并保存建账排口" : "(请先完成物理链路测试)"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
