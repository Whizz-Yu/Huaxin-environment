/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import {
  Users, Shield, Menu, MapPin, Briefcase, BookOpen, Settings, Bell, FileText,
  Activity, Database, Cpu, Layers, Lock, Server, Wifi, Terminal, CheckCircle,
  Play, Pause, Trash2, Edit2, Info, Search, Plus, RefreshCw, Smartphone, 
  Send, AlertTriangle, HelpCircle, HardDrive, Network
} from "lucide-react";
import {
  UserItem, RoleItem, MenuItem, DeptItem, PostItem, DictTypeItem, DictDataValue,
  ConfigParamItem, NoticeItem, OperationalLogItem, LoginLogItem, OnlineUserItem,
  CronTaskItem, DbTableInfo, RedisCacheItem, DeviceRegistryItem, DeviceTypeItem,
  DeviceGroupItem, DeviceAttributeItem, ConnConfigItem,
  initialUsers, initialRoles, initialMenus, initialDepts, initialPosts,
  initialDictTypes, dictDataMap, initialConfigParams, initialNotices,
  initialOpsLogs, initialLoginLogs, initialOnlineUsers, initialCronTasks,
  initialDbTables, initialRedisCaches, initialDeviceRegistries, initialDeviceTypes,
  initialDeviceGroups, initialDeviceAttributes, initialConnConfigs
} from "../data/systemData";

interface Props {
  onAddLogMessage: (message: string) => void;
}

export default function DataManagementSystem({ onAddLogMessage }: Props) {
  // Navigation Tabs state
  const [activeTab, setActiveTab] = useState<"system" | "monitor" | "device" | "query" | "comm">("system");
  const [activeSubTab, setActiveSubTab] = useState<string>("user");

  // Dynamic States for data tables
  const [users, setUsers] = useState<UserItem[]>(initialUsers);
  const [roles, setRoles] = useState<RoleItem[]>(initialRoles);
  const [menus, setMenus] = useState<MenuItem[]>(initialMenus);
  const [depts, setDepts] = useState<DeptItem[]>(initialDepts);
  const [posts, setPosts] = useState<PostItem[]>(initialPosts);
  const [dictTypes, setDictTypes] = useState<DictTypeItem[]>(initialDictTypes);
  const [activeDictType, setActiveDictType] = useState<string>("sys_device_category");
  const [configParams, setConfigParams] = useState<ConfigParamItem[]>(initialConfigParams);
  const [notices, setNotices] = useState<NoticeItem[]>(initialNotices);
  const [opsLogs, setOpsLogs] = useState<OperationalLogItem[]>(initialOpsLogs);
  const [loginLogs, setLoginLogs] = useState<LoginLogItem[]>(initialLoginLogs);
  
  const [onlineUsers, setOnlineUsers] = useState<OnlineUserItem[]>(initialOnlineUsers);
  const [cronTasks, setCronTasks] = useState<CronTaskItem[]>(initialCronTasks);
  const [cronLogs, setCronLogs] = useState<string[]>([
    "2026-06-04 05:40:00 - CemsMinutesFetchJob - 采样有组织烟囱数据 normal ok", 
    "2026-06-04 05:40:05 - DustInterlockTriggerTask - 分级治污阈值比对：正常"
  ]);
  const [cacheList, setCacheList] = useState<RedisCacheItem[]>(initialRedisCaches);

  const [devices, setDevices] = useState<DeviceRegistryItem[]>(initialDeviceRegistries);
  const [deviceTypes, setDeviceTypes] = useState<DeviceTypeItem[]>(initialDeviceTypes);
  const [deviceGroups, setDeviceGroups] = useState<DeviceGroupItem[]>(initialDeviceGroups);
  const [deviceAttrs, setDeviceAttrs] = useState<DeviceAttributeItem[]>(initialDeviceAttributes);
  const [connConfigs, setConnConfigs] = useState<ConnConfigItem[]>(initialConnConfigs);

  // Search filter keywords
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Communication testing loading flag
  const [pingingConnId, setPingingConnId] = useState<string | null>(null);
  const [pingLogResults, setPingLogResults] = useState<string[]>([]);

  // Export spreadsheet simulation
  const [exportingPercent, setExportingPercent] = useState<number>(-1);

  // Form Modals helper states
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  
  // Generic form handlers
  const [formFields, setFormFields] = useState<Record<string, string>>({});

  // Triggered notifications logs
  const triggerSysMessage = (msg: string) => {
    onAddLogMessage(`[数据管理系统] ${msg}`);
  };

  // 1. SYSTEM MANAGEMENT - INTERACTIVE OPERATIONS
  const handleToggleUserStatus = (id: string, currentStatus: "active" | "disabled") => {
    const nextStatus = currentStatus === "active" ? "disabled" : "active";
    setUsers(users.map(u => u.id === id ? { ...u, status: nextStatus } : u));
    const target = users.find(u => u.id === id);
    triggerSysMessage(`更新用户 [${target?.username}] 状态为: ${nextStatus === "active" ? "启用" : "禁用"}`);
  };

  const handleDeleteUser = (id: string) => {
    const target = users.find(u => u.id === id);
    if (confirm(`确认要物理移除用户 [${target?.nickname}] 的所有授权数据吗?`)) {
      setUsers(users.filter(u => u.id !== id));
      triggerSysMessage(`已注销并删除用户 [${target?.username}]`);
    }
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: UserItem = {
      id: `u-${Date.now().toString().slice(-3)}`,
      username: formFields.username || "new_user",
      nickname: formFields.nickname || "新晋人员",
      deptName: formFields.deptName || "安环监管处",
      phone: formFields.phone || "13000000000",
      roleName: formFields.roleName || "访客只读员",
      status: "active",
      createTime: new Date().toISOString().replace("T", " ").slice(0, 19)
    };
    setUsers([newUser, ...users]);
    setShowAddForm(false);
    setFormFields({});
    triggerSysMessage(`成功录入并发布新用户：${newUser.nickname} (${newUser.username})`);
  };

  // ROLE MANAGE
  const handleToggleRoleStatus = (id: string, currentStatus: "active" | "disabled") => {
    const next = currentStatus === "active" ? "disabled" : "active";
    setRoles(roles.map(r => r.id === id ? { ...r, status: next } : r));
    triggerSysMessage(`修改角色状态: ${roles.find(r => r.id === id)?.name} -> ${next}`);
  };

  // MENU MANAGE
  const handleAddMenu = (e: React.FormEvent) => {
    e.preventDefault();
    const newMenu: MenuItem = {
      id: `m-${Date.now().toString().slice(-2)}`,
      name: formFields.menuName || "新定义菜单",
      icon: formFields.menuIcon || "Settings",
      sort: Number(formFields.menuSort) || 9,
      path: formFields.menuPath || "/new_route",
      type: (formFields.menuType as any) || "menu",
      permission: formFields.menuPerm || "sys:custom:view"
    };
    setMenus([...menus, newMenu]);
    setShowAddForm(false);
    setFormFields({});
    triggerSysMessage(`已成功挂载菜单 [${newMenu.name}]`);
  };

  // DEPT & POST MANAGERS
  const handleToggleDeptStatus = (id: string, current: string) => {
    const next = current === "active" ? "disabled" : "active";
    setDepts(depts.map(d => d.id === id ? { ...d, status: next } : d));
    triggerSysMessage(`状态变动：部门 ${depts.find(d => d.id === id)?.name} -> ${next}`);
  };

  // DICT CONTROLS
  const handleAddDictType = (e: React.FormEvent) => {
    e.preventDefault();
    const newType: DictTypeItem = {
      id: `dt-${Date.now().toString().slice(-2)}`,
      name: formFields.dictName || "新数据字典",
      type: formFields.dictType || "sys_custom_status",
      status: "active",
      createTime: new Date().toISOString().replace("T", " ").slice(0, 19)
    };
    setDictTypes([...dictTypes, newType]);
    setShowAddForm(false);
    setFormFields({});
    triggerSysMessage(`已注册新分类字典: ${newType.name}`);
  };

  // PARAM CONTROLLER
  const handleUpdateParamValue = (id: string, nextValue: string) => {
    setConfigParams(configParams.map(p => p.id === id ? { ...p, value: nextValue } : p));
  };

  // NOTICE BULLETIN
  const handleAddNotice = (e: React.FormEvent) => {
    e.preventDefault();
    const item: NoticeItem = {
      id: `not-${Date.now().toString().slice(-2)}`,
      title: formFields.noticeTitle || "新环保通告",
      type: (formFields.noticeType as any) || "notice",
      content: formFields.noticeContent || "请全场车间配合检查环保排放设备运行完好性。",
      status: "published",
      author: formFields.noticeAuthor || "梁处长",
      createTime: new Date().toISOString().replace("T", " ").slice(0, 16)
    };
    setNotices([item, ...notices]);
    setShowAddForm(false);
    setFormFields({});
    triggerSysMessage(`公告看板已成功挂布: ${item.title}`);
  };

  // 2. SYSTEM MONITORING - ACTIVE EVENTS
  const handleForceKickoutUser = (id: string, username: string) => {
    if (confirm(`确定要强退并阻断在线用户 [${username}] 的当前登录Session吗？`)) {
      setOnlineUsers(onlineUsers.filter(ou => ou.id !== id));
      
      // Inject audit operational failed logs reactively
      const targetSessionLog: LoginLogItem = {
        id: `log-f-${Date.now()}`,
        username,
        ip: "192.168.10.x",
        location: "远程强退注销",
        browser: "N/A",
        os: "System Terminal",
        status: "fail",
        msg: "强制断开Session注销",
        time: new Date().toISOString().replace("T", " ").slice(0, 19)
      };
      setLoginLogs([targetSessionLog, ...loginLogs]);
      triggerSysMessage(`管理员已物理断连强退在线人员 [${username}]，会话已被注销。`);
    }
  };

  const handleTriggerCronOnce = (jobName: string) => {
    triggerSysMessage(`[监控调度] 开始手动测试运行定时任务: ${jobName}`);
    setCronLogs(prev => [`${new Date().toISOString().replace("T", " ").slice(0, 19)} - [手动触发] ${jobName} - 执行状态：SUCCESS`, ...prev]);
    alert(`任务 [${jobName}] 已进入临时线程即时模拟运行完毕，日志已输出！`);
  };

  const handleToggleCronStatus = (id: string, username: string, current: string) => {
    const next = current === "running" ? "paused" : "running";
    setCronTasks(cronTasks.map(c => c.id === id ? { ...c, status: next } : c));
    triggerSysMessage(`定时器 [${username}] 电控状态更变为: ${next === "running" ? "运行中" : "已挂起暂停"}`);
  };

  const handleClearRedisCache = () => {
    if (confirm("是否确认清空系统 Redis 物联网高频率缓存？这会短时间内触发下位PLC重握手。")) {
      setCacheList(cacheList.map(c => ({ ...c, size: "0 Bytes" })));
      triggerSysMessage("Redis 集中式内存缓存已清空，所有 Modbus 校验表已重新实例化。");
    }
  };

  // 3. DEVICE REGISTRY - MANAGEMENT
  const handleAddDevice = (e: React.FormEvent) => {
    e.preventDefault();
    const newDev: DeviceRegistryItem = {
      id: `dev-${Date.now().toString().slice(-2)}`,
      code: formFields.devCode || "CEMS-EQ-99",
      name: formFields.devName || "新测流粉尘分析仪",
      category: formFields.devCategory || "有组织CEMS在线监测",
      groupName: formFields.devGroup || "回转窑头工段",
      status: "online",
      lastActive: new Date().toISOString().replace("T", " ").slice(0, 19),
      ip: formFields.devIp || "192.168.102.100"
    };
    setDevices([newDev, ...devices]);
    setShowAddForm(false);
    setFormFields({});
    triggerSysMessage(`设备注册成功：[${newDev.code}] ${newDev.name}`);
  };

  const handleDeleteDevice = (id: string) => {
    const target = devices.find(d => d.id === id);
    if (confirm(`确认注销并删除设备 ${target?.name} 吗？`)) {
      setDevices(devices.filter(d => d.id !== id));
      triggerSysMessage(`已删除设备：${target?.name}`);
    }
  };

  // 4. INTEGRATED QUERIES - EXCEL PACKAGER
  const handleExportSpreadsheet = () => {
    if (exportingPercent !== -1) return;
    setExportingPercent(0);
    triggerSysMessage("开始编译整合全量监测报警、环境实态和工业调试日志数据...");
    
    const interval = setInterval(() => {
      setExportingPercent(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          triggerSysMessage("数据打包整合完毕：环保综合分析统计_0604.xlsx 已经下载到本地。");
          setTimeout(() => setExportingPercent(-1), 4000);
          return 100;
        }
        return prev + 25;
      });
    }, 600);
  };

  // 5. COMMUNICATIONS CONFIGS - LINK HANDSHAKES
  const handlePingHandshake = (id: string, ip: string, port: number, node: number) => {
    setPingingConnId(id);
    setPingLogResults([`[1/3] CONNECTING to target PLC gateway ${ip}:${port} ...`]);
    triggerSysMessage(`正在发起 Modbus / OPC 数据握手机理测试 (网关 IP: ${ip})`);

    setTimeout(() => {
      setPingLogResults(prev => [...prev, `[2/3] MODBUS Frame validated successfully. Slave address ID [${node}] is responsive.`]);
    }, 600);

    setTimeout(() => {
      setPingLogResults(prev => [...prev, `[3/3] Ping test COMPLETED. Handshake latency is 14ms. Status is normal.`]);
      setPingingConnId(null);
      setConnConfigs(connConfigs.map(c => c.id === id ? { ...c, status: "connected", lastPing: new Date().toISOString().replace("T", " ").slice(0, 19) } : c));
      triggerSysMessage(`通信通道 ${ip}:${port} 测试连通度：100% 成功。`);
    }, 1500);
  };

  // Filter lists helper based on Search Input
  const filterList = <T extends Record<string, any>>(items: T[], fields: string[]): T[] => {
    if (!searchQuery) return items;
    const q = searchQuery.toLowerCase();
    return items.filter(item => 
      fields.some(field => String(item[field] || "").toLowerCase().includes(q))
    );
  };

  return (
    <div className="bg-slate-900/60 border border-slate-850 rounded-xl p-4 shadow-xl flex flex-col lg:flex-row gap-4 min-h-[580px]">
      
      {/* 2-LEVEL COMPACT SUB NAVIGATION COLUMN */}
      <aside className="w-full lg:w-56 shrink-0 bg-slate-950/70 p-3 rounded-lg border border-slate-900/80 flex flex-col gap-3 font-mono">
        <div>
          <span className="text-[10px] text-slate-500 block uppercase tracking-widest pl-1 mb-1.5 font-bold">数据模块大类</span>
          <div className="space-y-1">
            {[
              { id: "system", label: "系统管理", icon: Settings, defaultSub: "user" },
              { id: "monitor", label: "系统监控", icon: Cpu, defaultSub: "online" },
              { id: "device", label: "设备管理", icon: Layers, defaultSub: "registry" },
              { id: "query", label: "综合查询", icon: FileText, defaultSub: "alarm_log" },
              { id: "comm", label: "通信配置", icon: Wifi, defaultSub: "plc_conn" }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setActiveSubTab(tab.defaultSub);
                  setSearchQuery("");
                }}
                className={`w-full text-left px-2.5 py-1.5 rounded transition-all flex items-center justify-between text-xs font-bold leading-none ${activeTab === tab.id ? "bg-cyan-950 text-cyan-400 border border-cyan-900" : "text-slate-400 hover:text-white"}`}
              >
                <span className="flex items-center gap-1.5">
                  <tab.icon className="h-4 w-4 shrink-0" />
                  {tab.label}
                </span>
                {activeTab === tab.id && <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Secondary Menu items under Category */}
        <div className="border-t border-slate-900/80 pt-2 flex-grow">
          <span className="text-[10px] text-slate-550 block uppercase tracking-widest pl-1 mb-1.5">核心分类页面</span>
          <div className="space-y-0.5 max-h-[220px] overflow-y-auto custom-scrollbar">
            {activeTab === "system" && [
              { id: "user", label: "用户管理" },
              { id: "role", label: "角色管理" },
              { id: "menu", label: "菜单管理" },
              { id: "dept", label: "部门管理" },
              { id: "post", label: "岗位管理" },
              { id: "dict", label: "字典管理" },
              { id: "param", label: "参数设置" },
              { id: "notice", label: "通知公告" },
              { id: "logs", label: "日志管理" }
            ].map(s => (
              <button
                key={s.id}
                type="button"
                onClick={() => { setActiveSubTab(s.id); setSearchQuery(""); }}
                className={`w-full text-left px-2 py-1.5 rounded text-[11px] transition-colors ${activeSubTab === s.id ? "text-cyan-400 bg-slate-900/40 font-black pl-3" : "text-slate-500 hover:text-slate-300"}`}
              >
                📝 {s.label}
              </button>
            ))}

            {activeTab === "monitor" && [
              { id: "online", label: "在线用户进程" },
              { id: "cron", label: "定时作业任务" },
              { id: "db_monitor", label: "物理数据监视" },
              { id: "server", label: "服务状态监控" },
              { id: "redis", label: "缓存监控中心" }
            ].map(s => (
              <button
                key={s.id}
                type="button"
                onClick={() => { setActiveSubTab(s.id); setSearchQuery(""); }}
                className={`w-full text-left px-2 py-1.5 rounded text-[11px] transition-colors ${activeSubTab === s.id ? "text-cyan-400 bg-slate-900/40 font-black pl-3" : "text-slate-500 hover:text-slate-300"}`}
              >
                📈 {s.label}
              </button>
            ))}

            {activeTab === "device" && [
              { id: "registry", label: "设备信息备册" },
              { id: "category", label: "设备类型名录" },
              { id: "grouping", label: "场所/分组分配" },
              { id: "attributes", label: "设备运行属性" }
            ].map(s => (
              <button
                key={s.id}
                type="button"
                onClick={() => { setActiveSubTab(s.id); setSearchQuery(""); }}
                className={`w-full text-left px-2 py-1.5 rounded text-[11px] transition-colors ${activeSubTab === s.id ? "text-cyan-400 bg-slate-900/40 font-black pl-3" : "text-slate-500 hover:text-slate-300"}`}
              >
                ⚙️ {s.label}
              </button>
            ))}

            {activeTab === "query" && [
              { id: "alarm_log", label: "监测报警履历" },
              { id: "env_readings", label: "环境监测日志" },
              { id: "operator_log", label: "设备治污令志" }
            ].map(s => (
              <button
                key={s.id}
                type="button"
                onClick={() => { setActiveSubTab(s.id); setSearchQuery(""); }}
                className={`w-full text-left px-2 py-1.5 rounded text-[11px] transition-colors ${activeSubTab === s.id ? "text-cyan-400 bg-slate-900/40 font-black pl-3" : "text-slate-500 hover:text-slate-300"}`}
              >
                🔍 {s.label}
              </button>
            ))}

            {activeTab === "comm" && [
              { id: "plc_conn", label: "对接物理数据心跳" }
            ].map(s => (
              <button
                key={s.id}
                type="button"
                className="w-full text-left px-2 py-1.5 rounded text-[11px] text-cyan-410 text-cyan-400 bg-slate-900/20 font-black"
                disabled
              >
                📡 {s.label}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* CORE ACTIVE VIEW WORKSPACE */}
      <section className="flex-1 bg-slate-950/80 rounded-lg p-4 border border-slate-900 flex flex-col justify-between">
        
        {/* VIEW HEADER & SEARCH TOOLBAR ROW */}
        <div className="border-b border-slate-900 pb-3 mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-sans font-black text-cyan-400 tracking-wider flex items-center gap-1.5 uppercase">
              <Database className="h-4.5 w-4.5 animate-pulse" />
              数据与运维主控面板 &gt; {
                activeTab === "system" ? "系统管理" :
                activeTab === "monitor" ? "系统监控" :
                activeTab === "device" ? "设备管理" :
                activeTab === "query" ? "综合查询" : "对接设备通信配置"
              } &gt; {activeSubTab.toUpperCase()}
            </h2>
            <p className="text-[10px] text-slate-500 font-sans mt-0.5">
              禄劝厂区物理Modbus采样、安全岗位、DCS阈值一站式管理台账
            </p>
          </div>

          {/* Core Search & Add Controls */}
          <div className="flex items-center gap-2 text-xs">
            {/* Show Add action depending on subpages */}
            {(["user", "menu", "dict", "notice", "registry"].includes(activeSubTab)) && (
              <button
                type="button"
                onClick={() => { setShowAddForm(!showAddForm); setFormFields({}); }}
                className="px-2.5 py-1.5 bg-cyan-950/80 hover:bg-cyan-900 text-cyan-400 font-bold border border-cyan-800 rounded flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>一键录入新规</span>
              </button>
            )}

            {/* Quick Spreadsheet Exporter trigger (Comprehensive querying) */}
            {activeTab === "query" && (
              <button
                type="button"
                onClick={handleExportSpreadsheet}
                className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded shadow hover:scale-[1.01] transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Send className="h-3.5 w-3.5" />
                <span>导出表格数据 (.xlsx)</span>
              </button>
            )}

            {/* Search Input Filter */}
            {!(["server", "db_monitor", "redis"].includes(activeSubTab)) && (
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="查找过滤本表..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-[#030712] border border-slate-800 text-slate-350 rounded px-2.5 pl-7 py-1.5 text-xs outline-none focus:border-cyan-805/40 w-44 font-mono"
                />
              </div>
            )}
          </div>
        </div>

        {/* EXPORTING STATUS PROGRESS BAR */}
        {exportingPercent >= 0 && (
          <div className="mb-4 bg-slate-900/60 p-3 rounded border border-cyan-900/50 flex items-center gap-4 text-xs font-mono">
            <RefreshCw className="h-4 w-4 text-cyan-400 animate-spin shrink-0" />
            <div className="flex-1">
              <div className="flex justify-between font-bold text-slate-300 mb-1 leading-none">
                <span>正在编译环保全量综合分析报表...</span>
                <span>{exportingPercent}%</span>
              </div>
              <div className="w-full bg-slate-950 h-1.5 rounded overflow-hidden">
                <div className="bg-cyan-500 h-full transition-all duration-300" style={{ width: `${exportingPercent}%` }} />
              </div>
            </div>
          </div>
        )}

        {/* WORKSPACE DETAILED SUB-PAGES ACCORDION */}
        <div className="flex-1 min-h-[350px] overflow-x-auto max-h-[480px] overflow-y-auto custom-scrollbar pr-1">
          
          {/* SECTION A: FORM POPUP DRAWER IN-VIEW (Simulating modular form entry) */}
          {showAddForm && (
            <div className="mb-4 p-4 rounded-lg bg-slate-900/80 border border-slate-800/80 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-cyan-400 flex items-center gap-1.5">
                  <Plus className="h-4 w-4 animate-bounce" /> 
                  录入 / 添加新规明细备案
                </span>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="text-slate-500 hover:text-white"
                >
                  [取消 ESC]
                </button>
              </div>

              {/* DYNAMIC FORM CONTENTS BASED ON MODULES */}
              {activeSubTab === "user" && (
                <form onSubmit={handleAddUser} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div>
                    <label className="text-slate-450 block mb-1 text-[10px]">用户名</label>
                    <input type="text" placeholder="caipan" onChange={(e) => setFormFields({...formFields, username: e.target.value})} className="bg-slate-950 border border-slate-800 w-full rounded p-1.5 text-xs outline-none text-slate-200" required />
                  </div>
                  <div>
                    <label className="text-slate-450 block mb-1 text-[10px]">真实姓名</label>
                    <input type="text" placeholder="特邀检验专家" onChange={(e) => setFormFields({...formFields, nickname: e.target.value})} className="bg-slate-950 border border-slate-800 w-full rounded p-1.5 text-xs outline-none text-slate-200" required />
                  </div>
                  <div>
                    <label className="text-slate-450 block mb-1 text-[10px]">科室部门</label>
                    <select select={formFields.deptName} onChange={(e) => setFormFields({...formFields, deptName: e.target.value})} className="bg-slate-950 border border-slate-800 w-full rounded p-1 text-xs outline-none text-slate-350">
                      <option value="部门">选择对应科室</option>
                      {depts.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-450 block mb-1 text-[10px]">对公手机</label>
                    <input type="text" placeholder="139xxxx" onChange={(e) => setFormFields({...formFields, phone: e.target.value})} className="bg-slate-950 border border-slate-800 w-full rounded p-1.5 text-xs outline-none text-slate-200" />
                  </div>
                  <div>
                    <label className="text-slate-450 block mb-1 text-[10px]">系统角色归属</label>
                    <select onChange={(e) => setFormFields({...formFields, roleName: e.target.value})} className="bg-slate-950 border border-slate-800 w-full rounded p-1.5 text-xs outline-none text-slate-350">
                      {roles.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button type="submit" className="bg-cyan-900 border border-cyan-805/70 hover:bg-cyan-800 text-white font-bold py-1.5 rounded w-full transition-colors">确认入库</button>
                  </div>
                </form>
              )}

              {activeSubTab === "menu" && (
                <form onSubmit={handleAddMenu} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <input type="text" placeholder="菜单名称 (例: DCS实时看板)" onChange={(e) => setFormFields({...formFields, menuName: e.target.value})} className="bg-slate-950 border border-slate-800 rounded p-1.5 outline-none text-xs text-slate-200" required />
                  <input type="text" placeholder="对应图标 (Compass / Activity)" onChange={(e) => setFormFields({...formFields, menuIcon: e.target.value})} className="bg-slate-950 border border-slate-800 rounded p-1.5 outline-none text-xs text-slate-200" />
                  <input type="text" placeholder="路由物理路径 (/dcs)" onChange={(e) => setFormFields({...formFields, menuPath: e.target.value})} className="bg-slate-950 border border-slate-800 rounded p-1.5 outline-none text-xs text-slate-200" />
                  <input type="text" placeholder="菜单权限标识 (sys:user:list)" onChange={(e) => setFormFields({...formFields, menuPerm: e.target.value})} className="bg-slate-950 border border-slate-800 rounded p-1.5 outline-none text-xs text-slate-200" />
                  <select onChange={(e) => setFormFields({...formFields, menuType: e.target.value})} className="bg-slate-950 border border-slate-800 rounded p-1 text-xs text-slate-350">
                    <option value="menu">单体主菜单</option>
                    <option value="directory">顶级目录</option>
                    <option value="button">特定功能控制按钮</option>
                  </select>
                  <button type="submit" className="bg-cyan-950 hover:bg-cyan-900 text-cyan-400 font-bold border border-cyan-800 py-1.5 rounded transition-all">创建菜单项</button>
                </form>
              )}

              {activeSubTab === "dict" && (
                <form onSubmit={handleAddDictType} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input type="text" placeholder="字典中文标题 (例如 : 排污严重程度)" onChange={(e) => setFormFields({...formFields, dictName: e.target.value})} className="bg-slate-950 border border-slate-800 rounded p-1.5 outline-none text-xs text-slate-200" required />
                  <input type="text" placeholder="字典全局标识 (例如 : emission_severity_dict)" onChange={(e) => setFormFields({...formFields, dictType: e.target.value})} className="bg-slate-950 border border-slate-800 rounded p-1.5 outline-none text-xs text-slate-200" required />
                  <div className="sm:col-span-2 flex justify-end">
                    <button type="submit" className="bg-cyan-900 text-white font-bold px-5 py-1.5 rounded">创建字典分类</button>
                  </div>
                </form>
              )}

              {activeSubTab === "notice" && (
                <form onSubmit={handleAddNotice} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-300">
                    <input type="text" placeholder="公告核心标题" onChange={(e) => setFormFields({...formFields, noticeTitle: e.target.value})} className="bg-slate-950 border border-slate-800 rounded p-1.5 text-xs outline-none" required />
                    <select onChange={(e) => setFormFields({...formFields, noticeType: e.target.value})} className="bg-slate-950 border border-slate-800 rounded p-1 text-xs text-slate-350">
                      <option value="notice">普通通知</option>
                      <option value="announcement">政策宣贯大纲公告</option>
                      <option value="alert">红色环保断警提示</option>
                    </select>
                  </div>
                  <textarea placeholder="填入具体的通知正文内容，公告挂布后会实时刷新在全厂大板看板上..." rows={3} onChange={(e) => setFormFields({...formFields, noticeContent: e.target.value})} className="bg-slate-950 border border-slate-800 w-full rounded p-2 text-xs outline-none text-slate-200" required />
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" placeholder="发布责任人 (曹工)" onChange={(e) => setFormFields({...formFields, noticeAuthor: e.target.value})} className="bg-slate-950 border border-slate-800 rounded p-1.5 text-xs outline-none text-slate-200" />
                    <button type="submit" className="bg-cyan-950 text-cyan-400 font-bold border border-cyan-900 py-1.5 rounded transition-all">正式对外发布</button>
                  </div>
                </form>
              )}

              {activeSubTab === "registry" && (
                <form onSubmit={handleAddDevice} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <input type="text" placeholder="设备登记编号 (CEMS-EQ-152)" onChange={(e) => setFormFields({...formFields, devCode: e.target.value})} className="bg-slate-950 border border-slate-800 rounded p-1.5 text-xs outline-none" required />
                  <input type="text" placeholder="设备物理名字" onChange={(e) => setFormFields({...formFields, devName: e.target.value})} className="bg-slate-950 border border-slate-800 rounded p-1.5 text-xs outline-none" required />
                  <select onChange={(e) => setFormFields({...formFields, devCategory: e.target.value})} className="bg-slate-950 border border-slate-800 rounded p-1 text-xs text-slate-350">
                    <option value="有组织CEMS在线监测">有组织CEMS在线监测</option>
                    <option value="无组织粉尘微物研判站">无组织粉尘微物研判站</option>
                    <option value="环保抑尘治理执行阀门">环保抑尘治理执行阀门</option>
                    <option value="视频OCR道闸车辆捕获枪">视频OCR道闸车辆捕获枪</option>
                  </select>
                  <select onChange={(e) => setFormFields({...formFields, devGroup: e.target.value})} className="bg-slate-950 border border-slate-800 rounded p-1 text-xs text-slate-350">
                    {deviceGroups.map(g => <option key={g.id} value={g.name}>{g.name}</option>)}
                  </select>
                  <input type="text" placeholder="通讯IP地址 (192.168.102.50)" onChange={(e) => setFormFields({...formFields, devIp: e.target.value})} className="bg-slate-950 border border-slate-800 rounded p-1.5 text-xs outline-none" />
                  <button type="submit" className="bg-cyan-900 text-white font-bold py-1.5 rounded">挂载硬件注册</button>
                </form>
              )}
            </div>
          )}

          {/* PAGE LISTING TEMPLATE SWITCHES */}
          
          {/* 1.1 用户管理 */}
          {activeSubTab === "user" && (
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 font-sans">
                  <th className="py-2 pl-1">ID</th>
                  <th className="py-2">用户名</th>
                  <th className="py-2">昵称</th>
                  <th className="py-2">隶属科室</th>
                  <th className="py-2">手机</th>
                  <th className="py-2">主控授权</th>
                  <th className="py-2">当前状态</th>
                  <th className="py-2 text-right pr-2">管理运维</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/60 text-slate-300">
                {filterList(users, ["username", "nickname", "deptName", "roleName"]).map(u => (
                  <tr key={u.id} className="hover:bg-slate-900/30">
                    <td className="py-2.5 pl-1 text-[10.5px] text-slate-550">{u.id}</td>
                    <td className="py-2.5 font-bold text-slate-100">{u.username}</td>
                    <td className="py-2.5 text-slate-200">{u.nickname}</td>
                    <td className="py-2.5">{u.deptName}</td>
                    <td className="py-2.5 text-slate-450">{u.phone}</td>
                    <td className="py-2.5 text-cyan-400 font-sans">{u.roleName}</td>
                    <td className="py-2.5">
                      <span className={`px-1.5 py-0.5 rounded text-[9.5px] border font-bold ${u.status === "active" ? "bg-emerald-950/80 text-emerald-400 border-emerald-900" : "bg-red-950/85 text-red-500 border-red-900"}`}>
                        {u.status === "active" ? "启用" : "停用"}
                      </span>
                    </td>
                    <td className="py-2.5 text-right pr-2 space-x-1.5 select-none">
                      <button type="button" onClick={() => handleToggleUserStatus(u.id, u.status)} className="text-blue-400 hover:underline">
                        切换启用
                      </button>
                      <button type="button" onClick={() => handleDeleteUser(u.id)} className="text-red-400 hover:text-red-500 hover:underline">
                        注销
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* 1.2 角色管理 */}
          {activeSubTab === "role" && (
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500">
                  <th className="py-2 pl-1">角色编码</th>
                  <th className="py-2">角色名称</th>
                  <th className="py-2">排序</th>
                  <th className="py-2">绑入菜单权限数</th>
                  <th className="py-2">许可标签</th>
                  <th className="py-2">状态</th>
                  <th className="py-2 text-right pr-2">管理</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900 text-slate-300">
                {filterList(roles, ["name", "code"]).map(r => (
                  <tr key={r.id} className="hover:bg-slate-900/30">
                    <td className="py-2.5 pl-1 italic text-slate-400">{r.code}</td>
                    <td className="py-2.5 font-bold text-slate-100">{r.name}</td>
                    <td className="py-2.5">{r.sort}</td>
                    <td className="py-2.5 text-cyan-400">{r.permissions.length}个页面</td>
                    <td className="py-2.5 truncate max-w-[150px] text-slate-500" title={r.permissions.join(", ")}>
                      {r.permissions.join(", ")}
                    </td>
                    <td className="py-2.5">
                      <span className={`px-1 rounded text-[9px] border font-bold ${r.status === "active" ? "bg-emerald-950 text-emerald-400 border-emerald-900" : "bg-red-950 text-red-500 border-red-900"}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="py-2.5 text-right pr-2">
                      <button type="button" onClick={() => handleToggleRoleStatus(r.id, r.status)} className="text-slate-400 hover:text-white underline">
                        阻断/松开
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* 1.3 菜单管理 */}
          {activeSubTab === "menu" && (
            <div className="space-y-4 font-mono text-xs text-slate-400">
              <span className="text-[10px] bg-slate-900 px-2.5 py-1 rounded inline-block text-cyan-400 select-none border border-slate-800">
                ⭐ 菜单权限支持直接绑定至 256 位 RSA 物理令牌校验
              </span>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500">
                    <th className="py-2 pl-1">名称</th>
                    <th className="py-2">页面类型</th>
                    <th className="py-2">路由</th>
                    <th className="py-2">显示图标</th>
                    <th className="py-2">排序</th>
                    <th className="py-2 text-right pr-2">权限标识</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900 text-slate-300">
                  {filterList(menus, ["name", "path", "permission"]).map(m => (
                    <tr key={m.id} className="hover:bg-slate-900/30">
                      <td className="py-3 pl-1 font-bold text-slate-100 flex items-center gap-1.5">
                        <Menu className="h-3.5 w-3.5 text-slate-550 text-slate-500" />
                        {m.name}
                      </td>
                      <td className="py-3 text-[10.5px]">
                        <span className={`px-1 rounded ${m.type === "directory" ? "bg-indigo-950 text-indigo-400" : m.type === "menu" ? "bg-cyan-950 text-cyan-400" : "bg-slate-800 text-slate-400"}`}>
                          {m.type === "directory" ? "目录" : m.type === "menu" ? "菜单" : "按钮"}
                        </span>
                      </td>
                      <td className="py-3 text-slate-450 italic">{m.path || "#"}</td>
                      <td className="py-3 text-cyan-500">{m.icon}</td>
                      <td className="py-3">{m.sort}</td>
                      <td className="py-3 text-right pr-2 text-slate-500 text-[10.5px]">{m.permission}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 1.4 部门管理 */}
          {activeSubTab === "dept" && (
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500">
                  <th className="py-2 pl-1">部门架构名称</th>
                  <th className="py-2">排序</th>
                  <th className="py-2">负责人</th>
                  <th className="py-2">状态</th>
                  <th className="py-2">固话/手机</th>
                  <th className="py-2">公理邮箱</th>
                  <th className="py-2 text-right pr-2">功能管理</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900 text-slate-300">
                {filterList(depts, ["name", "leader"]).map(d => (
                  <tr key={d.id} className="hover:bg-slate-900/30">
                    <td className="py-3 pl-1 font-bold text-slate-100">{d.name}</td>
                    <td className="py-1.5">{d.sort}</td>
                    <td className="py-1.5 text-slate-205 text-slate-200">{d.leader}</td>
                    <td className="py-1.5">
                      <span className={`px-1 rounded text-[9.5px] border ${d.status === "active" ? "bg-emerald-950 text-emerald-400 border-emerald-900" : "bg-slate-800 text-slate-500 border-slate-700"}`}>
                        {d.status}
                      </span>
                    </td>
                    <td className="py-1.5 text-slate-450">{d.phone}</td>
                    <td className="py-1.5 text-slate-500 text-[10px]">{d.email}</td>
                    <td className="py-1.5 text-right pr-2">
                      <button type="button" onClick={() => handleToggleDeptStatus(d.id, d.status)} className="text-cyan-402 text-cyan-400 hover:underline">
                        自诊断状态
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* 1.5 岗位管理 */}
          {activeSubTab === "post" && (
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500">
                  <th className="py-2 pl-1">岗位编码</th>
                  <th className="py-2">岗位名字</th>
                  <th className="py-2">排序</th>
                  <th className="py-2">状态</th>
                  <th className="py-2 text-right pr-2">备案日期</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900 text-slate-300">
                {filterList(posts, ["name", "code"]).map(p => (
                  <tr key={p.id} className="hover:bg-slate-900/30">
                    <td className="py-3 pl-1 italic text-slate-400">{p.code}</td>
                    <td className="py-3 font-bold text-slate-100">{p.name}</td>
                    <td className="py-3">{p.sort}</td>
                    <td className="py-3">
                      <span className="bg-emerald-950 text-emerald-400 border border-emerald-900 px-1 rounded text-[9px]">
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3 text-right pr-2 text-slate-500 text-[10.5px]">{p.createTime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* 1.6 字典管理 */}
          {activeSubTab === "dict" && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              
              {/* Dictionary classes list */}
              <div className="md:col-span-5 bg-slate-950/60 border border-slate-900 rounded p-2 text-xs font-mono">
                <span className="text-[10px] text-slate-500 block mb-2 font-bold select-none uppercase">📖 字典元数据大类</span>
                <div className="space-y-1">
                  {dictTypes.map(dt => (
                    <div
                      key={dt.id}
                      onClick={() => setActiveDictType(dt.type)}
                      className={`p-2 rounded cursor-pointer transition-colors flex justify-between items-center ${activeDictType === dt.type ? "bg-cyan-950 text-cyan-400 border border-cyan-900/40" : "text-slate-400 hover:text-white"}`}
                    >
                      <span className="font-bold">{dt.name}</span>
                      <span className="text-[9.5px] text-slate-600 font-mono italic">{dt.type}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dictionary mapping key value contents list */}
              <div className="md:col-span-7 bg-slate-955 bg-slate-950/20 border border-slate-900 rounded p-3 font-mono text-xs">
                <span className="text-[10px] text-slate-500 block mb-3 font-bold uppercase select-none">
                  📊 [{activeDictType}] 子类型键值标定映射
                </span>
                
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-900 text-slate-500 text-[11px]">
                      <th className="py-1">标定中文 Lable</th>
                      <th className="py-1">存根数据 Value</th>
                      <th className="py-1 text-right pr-1">可视化样式别名</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900/60 text-slate-300">
                    {(dictDataMap[activeDictType] || []).map((dict, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/10">
                        <td className="py-2 font-bold text-slate-205 text-slate-200">{dict.label}</td>
                        <td className="py-2 text-cyan-405 text-cyan-400">{dict.value}</td>
                        <td className="py-2 text-right pr-1">
                          <span className={`${dict.cssClass} text-[10px] border border-slate-900 px-1 py-0.5 rounded bg-slate-950/50`}>
                            {dict.cssClass}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 1.7 参数设置 */}
          {activeSubTab === "param" && (
            <div className="space-y-3 font-mono text-xs">
              <span className="text-[10px] text-slate-500 block leading-tight border-b border-slate-900 pb-2">
                * 参数变动后，物联网高频采样探头和微站分析中继将一小时刷新自适配参数文件。
              </span>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500">
                    <th className="py-2 pl-1">配置名称</th>
                    <th className="py-2 text-cyan-400">参数变量 Key</th>
                    <th className="py-2">可更改 Value</th>
                    <th className="py-2">参数特征</th>
                    <th className="py-2 text-right pr-2 col-span-2">原理解释</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900 text-slate-300">
                  {filterList(configParams, ["name", "key"]).map(p => (
                    <tr key={p.id} className="hover:bg-slate-900/30">
                      <td className="py-3.5 pl-1 font-bold text-slate-100">{p.name}</td>
                      <td className="py-3.5 text-[11px] text-cyan-502 text-cyan-400">{p.key}</td>
                      <td className="py-3.5">
                        <input
                          type="text"
                          value={p.value}
                          onChange={(e) => handleUpdateParamValue(p.id, e.target.value)}
                          className="bg-[#030712] border border-slate-800 text-slate-200 rounded px-2 py-1 text-xs outline-none focus:border-cyan-800 w-28 text-center"
                        />
                      </td>
                      <td className="py-3.5 text-[10px]">
                        <span className={`px-1.5 rounded ${p.type === "system" ? "bg-red-950 text-red-400" : "bg-cyan-950 text-cyan-400"}`}>
                          {p.type === "system" ? "核心规约" : "自建拓展"}
                        </span>
                      </td>
                      <td className="py-3.5 text-right text-slate-500 text-[10px] pr-2 max-w-[200px] truncate" title={p.remark}>
                        {p.remark}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 1.8 通知公告 */}
          {activeSubTab === "notice" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
              {filterList(notices, ["title", "content"]).map(n => (
                <div key={n.id} className="p-3 bg-[#030712]/50 border border-slate-900 hover:border-slate-800 rounded-lg flex flex-col justify-between space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded text-[9.5px] border font-bold ${n.type === "notice" ? "bg-blue-9 * 0/30 text-blue-400 border-blue-900" : n.type === "alert" ? "bg-rose-950/80 text-rose-400 border-rose-900" : "bg-amber-950/60 text-amber-550 border-amber-900"}`}>
                      {n.type === "notice" ? "普通通知" : n.type === "alert" ? "突发环保通告" : "管理规范公告"}
                    </span>
                    <span className="text-slate-500 text-[10px]">{n.createTime}</span>
                  </div>
                  
                  <div>
                    <h3 className="font-sans font-bold text-slate-200 text-xs leading-normal">{n.title}</h3>
                    <p className="text-slate-450 leading-relaxed text-[11px] mt-1.5">{n.content}</p>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-550 border-t border-slate-900/60 pt-2">
                    <span>发布：{n.author}</span>
                    <span className="text-cyan-400">● 挂布中(Published)</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 1.9 日志管理 (包含操作和登录日志) */}
          {activeSubTab === "logs" && (
            <div className="space-y-4 font-mono text-xs text-slate-400">
              <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-900 flex justify-between items-center flex-wrap gap-2 text-xs">
                <span>🛡️ 安全溯源审计：操作及物理登录日志已同步至华新国密审计通道。</span>
                <button
                  type="button"
                  onClick={() => { setOpsLogs([]); setLoginLogs([]); triggerSysMessage("审计日志已全清"); }}
                  className="px-2.5 py-1 text-[10.5px] font-bold text-red-400 hover:text-white hover:bg-red-950 border border-red-900 rounded"
                >
                  💣 一键清理并销毁审计日志
                </button>
              </div>

              {/* Sub-Tab Operation Logs */}
              <div className="space-y-2.5">
                <span className="font-sans font-black text-slate-350 block border-l-2 border-cyan-455 pl-2 leading-none uppercase select-none">
                  🔑 管理人员操作安全日志 (HUAXIN ADMIN OPERATIONAL AUDIT)
                </span>
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-900 text-slate-500 font-sans text-[10.5px]">
                      <th className="py-1 pl-1">ID</th>
                      <th className="py-1">操作模块</th>
                      <th className="py-1">操作类别</th>
                      <th className="py-1">执行人</th>
                      <th className="py-1">IP 路径</th>
                      <th className="py-1 text-right">用时</th>
                      <th className="py-1 text-right pr-1">日志事件时间</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900/60 text-slate-300">
                    {filterList(opsLogs, ["module", "actionType", "operator"]).map(op => (
                      <tr key={op.id} className="hover:bg-slate-900/20 text-[11px]">
                        <td className="py-1.5 pl-1 text-slate-600">{op.id}</td>
                        <td className="py-1.5 font-bold text-slate-201 text-slate-200">{op.module}</td>
                        <td className="py-1.5 text-cyan-400">{op.actionType}</td>
                        <td className="py-1.5 text-slate-350">{op.operator}</td>
                        <td className="py-1.5 text-slate-450 italic">{op.ip}</td>
                        <td className="py-1.5 text-right font-black text-emerald-400">{op.duration}ms</td>
                        <td className="py-1.5 text-right pr-1 text-slate-500 text-[10.5px]">{op.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Sub-Tab Login logs */}
              <div className="space-y-2.5 pt-4">
                <span className="font-sans font-black text-slate-350 block border-l-2 border-indigo-505 pl-2 leading-none uppercase select-none">
                  🚪 统一身份门户物理签入日志 (AUTHENTICATION SIGN IN RETROSPECTIVE)
                </span>
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-900 text-slate-500 font-sans text-[10.5px]">
                      <th className="py-1 pl-1">ID</th>
                      <th className="py-1">登录账户</th>
                      <th className="py-1">局域网IP / 登录所在城市</th>
                      <th className="py-1">登录环境</th>
                      <th className="py-1">认证解析结果</th>
                      <th className="py-1 text-right pr-1">登录时间</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900/60 text-slate-300">
                    {filterList(loginLogs, ["username", "location"]).map(l => (
                      <tr key={l.id} className="hover:bg-slate-900/20 text-[11px]">
                        <td className="py-1.5 pl-1 text-[10px] text-slate-600">{l.id}</td>
                        <td className="py-1.5 font-bold">{l.username}</td>
                        <td className="py-1.5">{l.ip} [{l.location}]</td>
                        <td className="py-1.5 text-slate-500 text-[10px]">{l.browser} ({l.os})</td>
                        <td className="py-1.5">
                          <span className={`px-1 rounded text-[9.5px] border ${l.status === "success" ? "bg-emerald-950 text-emerald-400 border-emerald-900" : "bg-rose-950 text-rose-500 border-rose-900 animate-pulse"}`}>
                            {l.msg}
                          </span>
                        </td>
                        <td className="py-1.5 text-right pr-1 text-slate-500 text-[10.5px]">{l.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 2.1 在线用户进程 */}
          {activeSubTab === "online" && (
            <div className="space-y-3 font-mono text-xs">
              <span className="text-[10px] bg-sky-950/40 p-2 border border-sky-900/50 rounded inline-block text-cyan-400 select-none">
                ⚙️ 在线会话强制阻断（强退）将瞬间清除本地 Cookies 缓存并重置物理通讯总线。
              </span>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500">
                    <th className="py-2 pl-1">Session ID</th>
                    <th className="py-2">签入账户</th>
                    <th className="py-2">隶属科室</th>
                    <th className="py-2">登录物理IP</th>
                    <th className="py-2">所在地</th>
                    <th className="py-2">浏览器内核</th>
                    <th className="py-2">登录时戳</th>
                    <th className="py-2 text-right pr-2">会话阻断</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900 text-slate-300">
                  {filterList(onlineUsers, ["username", "deptName"]).map(ou => (
                    <tr key={ou.id} className="hover:bg-slate-900/30">
                      <td className="py-3 pl-1 italic text-slate-500 text-[10px]">{ou.id}</td>
                      <td className="py-3 font-bold text-slate-101 text-slate-100">{ou.username}</td>
                      <td className="py-3 text-cyan-401 text-cyan-400">{ou.deptName}</td>
                      <td className="py-3 text-slate-400">{ou.ip}</td>
                      <td className="py-3 text-slate-500">{ou.location}</td>
                      <td className="py-3 text-[10px]">{ou.browser}</td>
                      <td className="py-3 text-slate-500 text-[10.5px]">{ou.loginTime}</td>
                      <td className="py-3 text-right pr-2">
                        <button
                          type="button"
                          onClick={() => handleForceKickoutUser(ou.id, ou.username)}
                          className="px-2 py-0.5 bg-red-950 text-red-400 border border-red-900/40 hover:bg-red-900 hover:text-white rounded text-[10px]"
                        >
                          强制下线
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 2.2 定时任务作业 */}
          {activeSubTab === "cron" && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 font-mono text-xs">
              {/* Task list configuration (left) */}
              <div className="md:col-span-8 bg-[#030712]/40 border border-slate-900 p-3 rounded-lg space-y-3">
                <span className="font-sans font-black text-slate-400 block pb-1 border-b border-slate-900 uppercase">
                  ⏰ 环保及数据同步定时计划器
                </span>
                
                <div className="space-y-2.5">
                  {filterList(cronTasks, ["name", "remark"]).map(t => (
                    <div key={t.id} className="p-3 border border-slate-900 bg-slate-950/60 rounded flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap text-[11px] mb-1">
                          <span className="font-bold text-slate-200">{t.name}</span>
                          <span className="text-[10px] bg-slate-900 border border-slate-800 text-slate-500 px-1 py-0.5 rounded italic">
                            [{t.group}]
                          </span>
                          <span className={`px-1 py-0.5 rounded text-[8.5px] border font-sans font-bold uppercase ${t.status === "running" ? "bg-emerald-950 text-emerald-400 border-emerald-900 animate-pulse" : "bg-slate-900 text-slate-500 border-slate-800"}`}>
                            {t.status === "running" ? "活跃运行" : "已挂起暂停"}
                          </span>
                        </div>
                        <span className="text-cyan-502 text-cyan-400 text-[11px] font-bold block mb-1">Cron expression: {t.cronExpr}</span>
                        <p className="text-slate-500 text-[10px] leading-normal">{t.remark}</p>
                      </div>

                      {/* Commands triggers */}
                      <div className="flex gap-2 shrink-0 select-none text-[10px]">
                        <button
                          type="button"
                          onClick={() => handleTriggerCronOnce(t.name)}
                          className="px-2 py-1 bg-cyan-950/60 text-cyan-400 border border-cyan-900 rounded"
                          title="运行一次计划器"
                        >
                          立即轮询
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleCronStatus(t.id, t.name, t.status)}
                          className="px-2 py-1 bg-slate-900 text-slate-300 border border-slate-800 rounded hover:text-white"
                        >
                          {t.status === "running" ? "暂停计划" : "拉起运行"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Schedules executions logs container (right) */}
              <div className="md:col-span-4 bg-slate-950/90 border border-slate-955 p-3 rounded-lg flex flex-col justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 block mb-2 font-bold uppercase py-0.5 border-b border-slate-900 select-none">
                    📋 定时中继心跳执行历史 (LIVE SYSTEM THREADS FEED)
                  </span>
                  <div className="space-y-2 h-[200px] overflow-y-auto custom-scrollbar text-[10px] text-slate-450 pr-1 select-none">
                    {cronLogs.map((log, idx) => (
                      <p key={idx} className="leading-normal py-1 border-b border-slate-900/50">
                        {log}
                      </p>
                    ))}
                  </div>
                </div>

                <div className="mt-4 text-[9px] text-slate-650 leading-relaxed pt-2 border-t border-slate-900 font-bold select-none text-slate-600">
                  * 系统底座依据 Linux Crontab 内层物理指针轮询发信，秒级差值低于 2ms。
                </div>
              </div>
            </div>
          )}

          {/* 2.3 数据监控 */}
          {activeSubTab === "db_monitor" && (
            <div className="space-y-4 font-mono text-xs">
              <div className="bg-slate-900/60 border border-indigo-900/55 p-3.5 rounded-lg flex justify-between items-center flex-wrap gap-2 leading-tight">
                <div>
                  <h3 className="font-sans font-bold text-slate-201 text-slate-200">🗄️ 物理关系数据库连接及 Druid 数据池状态</h3>
                  <p className="text-[10px] text-slate-500 mt-1">连通禄劝本地 PostgreSQL 与 时序级 Cassandra 引擎</p>
                </div>
                <div className="flex gap-4 text-[11px] text-slate-400">
                  <span>活动进程池数: <b className="text-emerald-400">8/200 OK</b></span>
                  <span>锁冲突数: <b className="text-slate-100">0</b></span>
                </div>
              </div>

              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-900 text-slate-500 text-[11.5px]">
                    <th className="py-2 pl-1">物理表名称 (Table Schema)</th>
                    <th className="py-2">核心业务功能</th>
                    <th className="py-2 text-right">总记录行数</th>
                    <th className="py-2 text-right">数据体积</th>
                    <th className="py-2 text-right">索引缓存</th>
                    <th className="py-2 text-right pr-2">系统吞吐 AQS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900 text-slate-300">
                  {initialDbTables.map(t => (
                    <tr key={t.id} className="hover:bg-slate-900/20">
                      <td className="py-3 pl-1 font-bold italic text-slate-400">{t.tableName}</td>
                      <td className="py-3 text-[11px] text-slate-200">{t.comment}</td>
                      <td className="py-3 text-right text-cyan-400">{t.rowsCount.toLocaleString()} 行</td>
                      <td className="py-3 text-right">{t.dataSize}</td>
                      <td className="py-3 text-right text-slate-500">{t.indexSize}</td>
                      <td className="py-3 text-right text-emerald-400 font-bold pr-2">{t.queriesSec} Qps/s</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 2.4 服务状态监控 (机器核心参数仪表盘) */}
          {activeSubTab === "server" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
              
              {/* CPU load card */}
              <div className="p-3 bg-slate-[#030712] bg-slate-950/50 border border-slate-900 rounded-lg flex flex-col justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 block mb-1 uppercase font-bold">🖥️ CPU 双核运转率</span>
                  <span className="text-lg font-black text-emerald-400 block">12.4 %</span>
                </div>
                <div className="mt-3 leading-normal border-t border-slate-900/60 pt-2 text-[10px] text-slate-500 space-y-1 select-none">
                  <div className="flex justify-between"><span>用户空间:</span><span>4.1%</span></div>
                  <div className="flex justify-between"><span>系统空间:</span><span>8.2%</span></div>
                  <div className="flex justify-between"><span>硬件等待:</span><span>0.1%</span></div>
                </div>
              </div>

              {/* Memory pool card */}
              <div className="p-3 bg-slate-[#030712] bg-slate-950/50 border border-slate-900 rounded-lg flex flex-col justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 block mb-1 uppercase font-bold">💾 堆栈 JVM 分配内存</span>
                  <span className="text-lg font-black text-cyan-400 block">2.08 GB / 4.0 GB</span>
                </div>
                <div className="mt-3 leading-normal border-t border-slate-900/60 pt-2 text-[10px] text-slate-500 space-y-1 select-none">
                  <div className="flex justify-between"><span>堆已申请:</span><span>2124.5MB</span></div>
                  <div className="flex justify-between"><span>堆总大小:</span><span>4096MB</span></div>
                  <div className="flex justify-between"><span>物理内耗:</span><span>53.2%</span></div>
                </div>
              </div>

              {/* Disk load card */}
              <div className="p-3 bg-slate-[#030712] bg-slate-950/50 border border-slate-900 rounded-lg flex flex-col justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 block mb-1 uppercase font-bold">💽 SSD 阵列表卷大小</span>
                  <span className="text-lg font-black text-slate-200 block">45.2 % LOADED</span>
                </div>
                <div className="mt-3 leading-normal border-t border-slate-900/60 pt-2 text-[10px] text-slate-500 space-y-1 select-none">
                  <div className="flex justify-between"><span>表盘已用:</span><span>182.4 GB</span></div>
                  <div className="flex justify-between"><span>磁盘总量:</span><span>400.0 GB</span></div>
                  <div className="flex justify-between"><span>物理IO:</span><span>0.5 MB/s</span></div>
                </div>
              </div>

              {/* Node link limits card */}
              <div className="p-3 bg-slate-[#030712] bg-slate-950/50 border border-slate-900 rounded-lg flex flex-col justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 block mb-1 uppercase font-bold">📡 通信网络网关延时</span>
                  <span className="text-lg font-black text-indigo-400 block">&lt; 14 ms</span>
                </div>
                <div className="mt-3 leading-normal border-t border-slate-900/60 pt-2 text-[10px] text-slate-500 space-y-1 select-none">
                  <div className="flex justify-between"><span>网络丢包:</span><span>0.0 %</span></div>
                  <div className="flex justify-between"><span>PLC轮巡率:</span><span>50/50个</span></div>
                  <div className="flex justify-between"><span>长连心跳:</span><span>正常(ESTABLISHED)</span></div>
                </div>
              </div>
            </div>
          )}

          {/* 2.5 缓存监控 */}
          {activeSubTab === "redis" && (
            <div className="space-y-4 font-mono text-xs">
              <div className="bg-slate-950/80 border border-slate-900 p-3.5 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs leading-none">
                <div>
                  <span className="font-bold text-slate-300 block mb-1.5">📡 Redis 缓存池存储详情 & 内存分析</span>
                  <span className="text-slate-550 block text-[9.5px]">当前缓存加载了设备寄存器、权限会话等全部高频项</span>
                </div>
                
                <button
                  type="button"
                  onClick={handleClearRedisCache}
                  className="px-3 py-1.5 bg-red-950 hover:bg-red-900 text-red-400 border border-red-900 rounded font-bold cursor-pointer"
                >
                  🧹 集中式一键清空 Redis 缓存
                </button>
              </div>

              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-900 text-slate-500 text-[11.5px]">
                    <th className="py-2 pl-1">逻辑键 Key 别名</th>
                    <th className="py-2">大项序列类型</th>
                    <th className="py-2">占用大小</th>
                    <th className="py-2 text-right pr-2">剩余生存周期 (Ttl)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900 text-slate-300">
                  {cacheList.map(c => (
                    <tr key={c.id} className="hover:bg-slate-900/10">
                      <td className="py-2.5 pl-1 text-[11px] text-cyan-402 text-cyan-400 font-bold">{c.key}</td>
                      <td className="py-2.5 text-slate-400">{c.type}</td>
                      <td className="py-2.5 font-bold">{c.size}</td>
                      <td className="py-2.5 text-right text-slate-550 text-slate-500 pr-2">
                        {c.ttl === -1 ? "持久保存" : `${c.ttl}s`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 3.1 设备信息管理 */}
          {activeSubTab === "registry" && (
            <div className="space-y-3 font-mono text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500">
                    <th className="py-2 pl-1">设备编码</th>
                    <th className="py-2">设备名字</th>
                    <th className="py-2">分类类别</th>
                    <th className="py-2">场所/分组名</th>
                    <th className="py-2">绑定IP</th>
                    <th className="py-2">电控状态</th>
                    <th className="py-2 text-right">上次上报瞬测</th>
                    <th className="py-2 text-right pr-2">物理注销</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900 text-slate-300">
                  {filterList(devices, ["name", "code", "category", "groupName"]).map(d => (
                    <tr key={d.id} className="hover:bg-slate-900/30">
                      <td className="py-3 pl-1 font-bold text-slate-101 text-slate-100 italic text-[11px]">{d.code}</td>
                      <td className="py-3 font-bold text-slate-200">{d.name}</td>
                      <td className="py-3 text-[10.5px] text-cyan-400">{d.category}</td>
                      <td className="py-3 text-slate-450">{d.groupName}</td>
                      <td className="py-3 text-slate-500">{d.ip}</td>
                      <td className="py-3">
                        <span className={`px-1 py-0.5 rounded text-[8.5px] font-sans font-bold uppercase border ${d.status === "online" ? "bg-emerald-950 text-emerald-400 border-emerald-900" : d.status === "fault" ? "bg-amber-955 text-amber-500 border-amber-900" : "bg-slate-900 text-slate-500 border-slate-800"}`}>
                          {d.status === "online" ? "连通正常" : d.status === "fault" ? "故障报错" : "设备离线"}
                        </span>
                      </td>
                      <td className="py-3 text-right text-[10.5px] text-slate-500">{d.lastActive}</td>
                      <td className="py-3 text-right pr-2">
                        <button type="button" onClick={() => handleDeleteDevice(d.id)} className="text-red-400 hover:text-red-500 hover:underline">
                          注销设备
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 3.2 类型定义 */}
          {activeSubTab === "category" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
              {deviceTypes.map(dt => (
                <div key={dt.id} className="p-3 bg-slate-950/65 border border-slate-900 hover:border-slate-800 rounded-lg flex flex-col justify-between space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-900/40 pb-1.5">
                    <span className="font-bold text-cyan-401 text-cyan-400">Type: {dt.code}</span>
                    <span className="text-[10px] text-slate-600 block shrink-0 italic">ID: {dt.id}</span>
                  </div>
                  <h3 className="font-sans text-xs font-black text-slate-202 text-slate-200 leading-normal">{dt.name}</h3>
                  <p className="text-slate-500 text-[10.5px] leading-relaxed pt-1">{dt.desc}</p>
                </div>
              ))}
            </div>
          )}

          {/* 3.3 场所与分组管理 */}
          {activeSubTab === "grouping" && (
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500">
                  <th className="py-2 pl-1">网格场所/分组名</th>
                  <th className="py-2">上级归属大类</th>
                  <th className="py-2">主管工长</th>
                  <th className="py-2 text-right pr-2 col-span-2">场所部署备注</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900 text-slate-300">
                {deviceGroups.map(g => (
                  <tr key={g.id} className="hover:bg-slate-900/30">
                    <td className="py-3 pl-1 font-bold text-slate-201 text-slate-200">{g.name}</td>
                    <td className="py-3 italic text-slate-400">{g.parent}</td>
                    <td className="py-3 text-cyan-400 font-sans">{g.leader}</td>
                    <td className="py-3 text-right text-slate-500 text-[10.5px] pr-2 max-w-[240px] truncate" title={g.remarks}>
                      {g.remarks}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* 3.4 运行属性定义 */}
          {activeSubTab === "attributes" && (
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500">
                  <th className="py-2 pl-1">属性物理名称</th>
                  <th className="py-2 text-cyan-400">Modbus寄存器物理偏址 Address</th>
                  <th className="py-2">绑定设备ID</th>
                  <th className="py-2">数据类型</th>
                  <th className="py-2">物理单位</th>
                  <th className="py-2 text-right pr-2">寄存器读写权限 (R/W)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900 text-slate-300">
                {deviceAttrs.map(attr => (
                  <tr key={attr.id} className="hover:bg-slate-900/30">
                    <td className="py-3 pl-1 font-bold text-slate-101 text-slate-100">{attr.attrName}</td>
                    <td className="py-3 text-[11px] text-cyan-502 text-cyan-400 font-bold">{attr.registerAddress}</td>
                    <td className="py-3 italic text-slate-450">{attr.deviceId}</td>
                    <td className="py-3 text-slate-200">{attr.dataType}</td>
                    <td className="py-3 text-slate-300 font-bold">{attr.unit}</td>
                    <td className="py-3 text-right pr-2">
                      <span className={`px-1.5 rounded text-[10px] font-bold ${attr.accessMode === "RW" ? "bg-cyan-950 text-cyan-400 border border-cyan-900/60" : "bg-slate-900 text-slate-550 border-slate-800 text-slate-400"}`}>
                        {attr.accessMode === "RW" ? "MODBUS 可读写 R/W" : "MODBUS 只读 Read"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* 4.1 监测报警履历 */}
          {activeSubTab === "alarm_log" && (
            <div className="space-y-3 font-mono text-xs">
              <span className="text-[10px] text-slate-550 block select-none uppercase">
                📋 全厂超低排放突载、在线CEMS漂移告警历史日志
              </span>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500">
                    <th className="py-2 pl-1">告警编号</th>
                    <th className="py-2">故障描述标题</th>
                    <th className="py-2">物理场所部署</th>
                    <th className="py-2">告警级别</th>
                    <th className="py-2 text-right pr-2 col-span-2">发生起始时戳</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900 text-slate-300">
                  {filterList(opsLogs, ["actionType"]).map((alm, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/30">
                      <td className="py-2.5 pl-1 italic text-slate-500 text-[10px]">ALM-{1000 + idx}</td>
                      <td className="py-2.5 font-bold text-rose-410 text-rose-400">{alm.actionType} 异常中断超限提示</td>
                      <td className="py-2.5">{alm.module}部署间</td>
                      <td className="py-2.5 font-bold text-amber-500">红色严重 red</td>
                      <td className="py-2.5 text-right text-slate-500 text-[10.5px] pr-2">{alm.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 4.2 环境监测日志 */}
          {activeSubTab === "env_readings" && (
            <div className="space-y-3 font-mono text-xs">
              <span className="text-[10px] text-slate-550 block uppercase">
                ⏱️ PM10，PM2.5 及高空烟气颗粒物连续秒级监测历史
              </span>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-850 text-slate-500 text-[11px]">
                    <th className="py-2 pl-1">读数采集时戳</th>
                    <th className="py-2">核心监测点区</th>
                    <th className="py-2 text-right">PM2.5 折算</th>
                    <th className="py-2 text-right text-cyan-400">PM10 (TSP) 测量</th>
                    <th className="py-2 text-right">上报合格状态</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900 text-slate-300">
                  {[
                    { t: "2026-06-04 05:43:00", p: "熟料一窑顶CEMS烟道", pm2: "14.2 ug", pm1: "8.5 mg/m³", st: "正常合规" },
                    { t: "2026-06-04 05:41:22", p: "原料搅拌密闭大棚北侧", pm2: "22.5 ug", pm1: "42.0 ug/m³", st: "超标消退" },
                    { t: "2026-06-04 05:40:00", p: "西侧2#熟料大库顶卸库嘴", pm2: "35.1 ug", pm1: "110.5 ug/m³", st: "正常" },
                    { t: "2026-06-04 05:38:11", p: "大井重车道闸入口探针", pm2: "18.0 ug", pm1: "65.4 ug/m³", st: "合规" }
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/30">
                      <td className="py-3 pl-1 text-[10.5px] text-slate-500">{row.t}</td>
                      <td className="py-3 font-bold text-slate-101 text-slate-100">{row.p}</td>
                      <td className="py-3 text-right">{row.pm2}</td>
                      <td className="py-3 text-right text-cyan-405 text-cyan-400 font-extrabold">{row.pm1}</td>
                      <td className="py-3 text-right text-emerald-400 font-black">{row.st}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 4.3 设备操作日志 */}
          {activeSubTab === "operator_log" && (
            <div className="space-y-3 font-mono text-xs">
              <span className="text-[10px] text-slate-550 block uppercase">
                ⚙️ 汇总高压雾炮一键除尘、引风、旁路隔离阀人工调度令日志
              </span>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500 text-[11px]">
                    <th className="py-2 pl-1">指令日志时间</th>
                    <th className="py-2">执行操控单元</th>
                    <th className="py-2">操作原语（命令包）</th>
                    <th className="py-2">调度操作员</th>
                    <th className="py-2 text-right pr-2">联锁执行结果</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900 text-slate-300">
                  {[
                    { t: "2026-06-04 05:10:00", u: "4#熟料棚双重高功率雾炮", cmd: "TRIGGER_PWM_SPRINKLER_HIGH [60hz]", op: "曹专班", res: "机械出水成功 / TSP降至 35ug" },
                    { t: "2026-06-04 04:32:00", u: "1#烟气旁通旁路物理烟道隔板", cmd: "LOCKOUT_BYPASS_VALVE_CLOSE", op: "安环总梁督", res: "闭锁封印成功 / CEMS强制" },
                    { t: "2026-06-04 03:00:15", u: "2#窑尾余热布袋除尘高压脉冲振打", cmd: "FORCE_PULSE_SHAKE_EXECUTE", op: "马工长", res: "振打清堵正常" }
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/30">
                      <td className="py-3.5 pl-1 text-slate-500 text-[10.5px]">{row.t}</td>
                      <td className="py-3.5 font-bold text-slate-200">{row.u}</td>
                      <td className="py-3.5 text-cyan-400 text-[11px] font-bold italic">{row.cmd}</td>
                      <td className="py-3.5 font-sans">{row.op}</td>
                      <td className="py-3.5 text-right text-emerald-400 font-extrabold pr-2">{row.res}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 5.1 通信配置对接物理PLC接口网关 (Modbus IP) */}
          {activeSubTab === "plc_conn" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 font-mono text-xs">
              
              {/* Left gateway link list */}
              <div className="lg:col-span-8 bg-[#030712]/40 border border-slate-900 rounded-lg p-3 space-y-3">
                <span className="font-sans font-black text-slate-305 block border-b border-sidebar-slate-900-3 border-slate-900 pb-1.5 uppercase select-none">
                  📡 PLC / CEMS 物理通信网管连接表
                </span>
                
                <div className="space-y-2">
                  {filterList(connConfigs, ["name", "ipAddress"]).map(cc => (
                    <div key={cc.id} className="p-3 bg-slate-950/65 border border-slate-900 rounded-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-bold text-slate-200">{cc.name}</span>
                          <span className="text-[9px] bg-indigo-950 text-indigo-400 border border-indigo-900 font-sans px-1 py-0.5 rounded uppercase">
                            {cc.protocol}
                          </span>
                          <span className={`px-1.5 py-0.5 rounded text-[8.5px] font-bold border font-sans uppercase ${cc.status === "connected" ? "bg-emerald-950 text-emerald-400 border-emerald-900" : cc.status === "error" ? "bg-amber-955 text-amber-500 border-amber-900" : "bg-slate-900 text-slate-550 border-slate-800"}`}>
                            {cc.status === "connected" ? "握手连通" : cc.status === "error" ? "寄存器断线错" : "未连结关闭"}
                          </span>
                        </div>
                        
                        <div className="text-slate-500 text-[11px] leading-relaxed">
                          <span>物理终端：<b>{cc.ipAddress}:{cc.port}</b></span>
                          <span className="ml-3">下位机Slave ID: <b>{cc.nodeId}</b></span>
                          {cc.baudRate && <span className="ml-3">波特: {cc.baudRate} / 校验: {cc.parity} </span>}
                        </div>
                        <span className="text-[10px] text-slate-550 block mt-1">上次成功的握手机器时戳: {cc.lastPing}</span>
                      </div>

                      {/* Diagnostic Ping Button */}
                      <button
                        type="button"
                        onClick={() => handlePingHandshake(cc.id, cc.ipAddress, cc.port, cc.nodeId)}
                        disabled={pingingConnId !== null}
                        className={`px-3 py-1.5 font-bold rounded text-[11.5px] cursor-pointer shrink-0 transition-colors ${pingingConnId === cc.id ? "bg-cyan-950 text-cyan-400 animate-pulse border border-cyan-500" : "bg-cyan-900 text-white hover:bg-cyan-800"}`}
                      >
                        {pingingConnId === cc.id ? "🤝 握手中..." : "📡 测联握手测试"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right telemetry diagnosis console log (right) */}
              <div className="lg:col-span-4 bg-slate-950/90 border border-slate-900 rounded-lg p-3.5 flex flex-col justify-between space-y-4">
                <div>
                  <span className="text-[10px] text-slate-500 block mb-2 font-bold uppercase pb-1.5 border-b border-slate-900 select-none">
                    ⏱️ MODBUS DIAGNOSTIC TERMINAL WINDOW
                  </span>
                  
                  {/* Interactive handshaker steps display */}
                  <div className="space-y-1.5 h-[170px] overflow-y-auto custom-scrollbar text-[10px] text-zinc-400 pr-1 select-none">
                    {pingLogResults.length === 0 ? (
                      <p className="text-slate-600 leading-normal italic py-10 text-center">
                        点击左侧物理网关“测联握手测试”按钮，在此实时显示电控校验返回。
                      </p>
                    ) : (
                      pingLogResults.map((line, idx) => (
                        <p key={idx} className="leading-relaxed border-b border-slate-900/40 pb-1 text-slate-350">
                          {line}
                        </p>
                      ))
                    )}
                  </div>
                </div>

                <div className="text-[9px] text-slate-650 leading-relaxed font-bold select-none text-slate-600 border-t border-slate-900/60 pt-2 shrink-0">
                  ⚠️ 对接配置包含全厂 PLC 底层硬电控总线，调试请务必遵循安全规约操作！
                </div>
              </div>

            </div>
          )}

        </div>

        {/* BOTTOM LEDGER METRIC FOOTER BAR */}
        <div className="mt-4 pt-3 border-t border-slate-900/60 flex items-center justify-between text-[10px] font-mono text-slate-500 select-none flex-wrap gap-2 leading-none">
          <span>* 当前数据模块支持全季度 Modbus 寄存器自映射。</span>
          <div className="flex gap-4">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" /> 用户数: {users.length}名</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-cyan-550 bg-cyan-500" /> 连接网关: {connConfigs.length}组</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> 轮测延时: &lt; 14ms</span>
          </div>
        </div>

      </section>

    </div>
  );
}
