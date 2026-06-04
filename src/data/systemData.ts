/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Core Types for our Data Management System
export interface UserItem {
  id: string;
  username: string;
  nickname: string;
  deptName: string;
  phone: string;
  roleName: string;
  status: "active" | "disabled";
  createTime: string;
}

export interface RoleItem {
  id: string;
  name: string;
  code: string;
  sort: number;
  permissions: string[];
  status: "active" | "disabled";
  createTime: string;
}

export interface MenuItem {
  id: string;
  name: string;
  icon: string;
  sort: number;
  path: string;
  type: "directory" | "menu" | "button";
  permission: string;
}

export interface DeptItem {
  id: string;
  name: string;
  sort: number;
  status: "active" | "disabled";
  leader: string;
  phone: string;
  email: string;
  createTime: string;
}

export interface PostItem {
  id: string;
  code: string;
  name: string;
  sort: number;
  status: "active" | "disabled";
  createTime: string;
}

export interface DictTypeItem {
  id: string;
  name: string;
  type: string;
  status: "active" | "disabled";
  createTime: string;
}

export interface DictDataValue {
  label: string;
  value: string;
  cssClass: string;
}

export interface ConfigParamItem {
  id: string;
  name: string;
  key: string;
  value: string;
  type: "system" | "custom";
  remark: string;
}

export interface NoticeItem {
  id: string;
  title: string;
  type: "notice" | "announcement" | "alert";
  content: string;
  status: "published" | "draft";
  author: string;
  createTime: string;
}

export interface OperationalLogItem {
  id: string;
  module: string;
  actionType: string;
  operator: string;
  ip: string;
  location: string;
  status: "success" | "fail";
  duration: number; // ms
  time: string;
}

export interface LoginLogItem {
  id: string;
  username: string;
  ip: string;
  location: string;
  browser: string;
  os: string;
  status: "success" | "fail";
  msg: string;
  time: string;
}

export interface OnlineUserItem {
  id: string;
  username: string;
  deptName: string;
  ip: string;
  location: string;
  browser: string;
  loginTime: string;
}

export interface CronTaskItem {
  id: string;
  name: string;
  group: string;
  cronExpr: string;
  status: "running" | "paused";
  remark: string;
}

export interface DbTableInfo {
  id: string;
  tableName: string;
  comment: string;
  rowsCount: number;
  dataSize: string;
  indexSize: string;
  queriesSec: number;
}

export interface RedisCacheItem {
  id: string;
  key: string;
  type: string;
  size: string;
  ttl: number; // seconds
}

export interface DeviceRegistryItem {
  id: string;
  code: string;
  name: string;
  category: string;
  groupName: string;
  status: "online" | "offline" | "fault";
  lastActive: string;
  ip: string;
}

export interface DeviceTypeItem {
  id: string;
  code: string;
  name: string;
  desc: string;
}

export interface DeviceGroupItem {
  id: string;
  name: string;
  parent: string;
  leader: string;
  remarks: string;
}

export interface DeviceAttributeItem {
  id: string;
  deviceId: string;
  attrName: string;
  registerAddress: string;
  dataType: string;
  unit: string;
  accessMode: "R" | "RW";
}

export interface ConnConfigItem {
  id: string;
  name: string;
  protocol: "Modbus-TCP" | "Modbus-RTU" | "OPC-UA" | "MQTT";
  ipAddress: string;
  port: number;
  nodeId: number;
  baudRate?: number;
  parity?: "None" | "Even" | "Odd";
  status: "connected" | "disconnected" | "error";
  lastPing: string;
}

// Initial Mock Datasets
export const initialUsers: UserItem[] = [
  { id: "u-101", username: "admin", nickname: "总系统管理员", deptName: "安环监管处", phone: "18866778899", roleName: "超级管理员", status: "active", createTime: "2026-01-01 08:30:00" },
  { id: "u-102", username: "caogong", nickname: "曹工（环保专员）", deptName: "环保专班", phone: "13511223344", roleName: "环保管理员", status: "active", createTime: "2026-03-12 10:15:24" },
  { id: "u-103", username: "linjiaoguan", nickname: "林教官", deptName: "脱硝运维组", phone: "17722334455", roleName: "维保工程师", status: "active", createTime: "2026-04-05 14:22:11" },
  { id: "u-104", username: "yanshou_test", nickname: "验收外协组", deptName: "外部专家组", phone: "15599887766", roleName: "访客只读员", status: "active", createTime: "2026-05-18 09:00:00" },
  { id: "u-105", username: "guard_operator", nickname: "周值班班长", deptName: "熟料一工车间", phone: "13944556677", roleName: "值班操作员", status: "disabled", createTime: "2026-02-10 16:45:00" }
];

export const initialRoles: RoleItem[] = [
  { id: "r-01", name: "超级管理员", code: "super_admin", sort: 1, permissions: ["dashboard", "organized", "unorganized", "data_mgmt:sys", "data_mgmt:mon", "data_mgmt:dev", "data_mgmt:query", "data_mgmt:comm"], status: "active", createTime: "2026-01-01 08:00:00" },
  { id: "r-02", name: "环保管理员", code: "env_manager", sort: 2, permissions: ["dashboard", "organized", "unorganized", "data_mgmt:dev", "data_mgmt:query"], status: "active", createTime: "2026-01-01 08:05:00" },
  { id: "r-03", name: "维保工程师", code: "repair_engineer", sort: 3, permissions: ["dashboard", "data_mgmt:dev", "data_mgmt:comm"], status: "active", createTime: "2026-01-01 08:10:00" },
  { id: "r-04", name: "访客只读员", code: "viewer", sort: 4, permissions: ["dashboard", "data_mgmt:query"], status: "active", createTime: "2026-01-01 08:15:00" }
];

export const initialMenus: MenuItem[] = [
  { id: "m-1", name: "一张图管控中心", icon: "Compass", sort: 1, path: "/gis", type: "menu", permission: "gis:view" },
  { id: "m-2", name: "有组织超低排放监测", icon: "Wind", sort: 2, path: "/organized", type: "menu", permission: "organized:view" },
  { id: "m-3", name: "无组织扬尘联锁管控", icon: "Droplet", sort: 3, path: "/unorganized", type: "menu", permission: "unorganized:view" },
  { id: "m-4", name: "大宗清洁运输台账", icon: "Truck", sort: 4, path: "/transport", type: "menu", permission: "transport:view" },
  { id: "m-5", name: "数据管理主系统", icon: "Database", sort: 5, path: "/data_mgmt", type: "directory", permission: "data_mgmt:list" },
  { id: "m-6", name: "用户编辑保存", icon: "User", sort: 6, path: "", type: "button", permission: "sys:user:edit" }
];

export const initialDepts: DeptItem[] = [
  { id: "d-1", name: "华新水泥(禄劝)集团", sort: 1, status: "active", leader: "李集团长", phone: "0871-667788", email: "lq@huaxin.com", createTime: "2025-12-01 09:00:00" },
  { id: "d-2", name: "安环监管处", sort: 2, status: "active", leader: "梁总监", phone: "13800112233", email: "liang_saf@huaxin.com", createTime: "2026-01-02 10:00:00" },
  { id: "d-3", name: "环保专班", sort: 3, status: "active", leader: "曹工", phone: "13511223344", email: "cao_env@huaxin.com", createTime: "2026-01-03 11:30:00" },
  { id: "d-4", name: "脱硝运维组", sort: 4, status: "active", leader: "林教官", phone: "17722334455", email: "lin_ox@huaxin.com", createTime: "2026-01-05 15:00:00" },
  { id: "d-5", name: "熟料一工车间", sort: 5, status: "active", leader: "马车长", phone: "13912345678", email: "ma_works@huaxin.com", createTime: "2026-01-06 16:00:00" }
];

export const initialPosts: PostItem[] = [
  { id: "p-01", code: "SA_CEO", name: "安环部总监", sort: 1, status: "active", createTime: "2026-01-01 08:30:00" },
  { id: "p-02", code: "ENV_SPE", name: "环保责任专员", sort: 2, status: "active", createTime: "2026-01-01 08:31:00" },
  { id: "p-03", code: "KILN_OP", name: "窑系统主控调度", sort: 3, status: "active", createTime: "2026-01-01 08:32:00" },
  { id: "p-04", code: "CEMS_RE", name: "CEMS站维护技师", sort: 4, status: "active", createTime: "2026-01-01 08:33:00" },
  { id: "p-05", code: "WET_DRV", name: "降尘炮洒水机驾驶员", sort: 5, status: "active", createTime: "2026-01-01 08:34:00" }
];

export const initialDictTypes: DictTypeItem[] = [
  { id: "dt-1", name: "全局设备分类", type: "sys_device_category", status: "active", createTime: "2026-01-10 10:00:00" },
  { id: "dt-2", name: "环保报警级别", type: "env_alarm_level", status: "active", createTime: "2026-01-12 11:20:00" },
  { id: "dt-3", name: "通信规约协议", type: "comm_protocol_type", status: "active", createTime: "2026-01-15 14:10:00" },
  { id: "dt-4", name: "排污控制段", type: "emission_control_section", status: "active", createTime: "2026-01-20 09:40:00" }
];

export const dictDataMap: Record<string, DictDataValue[]> = {
  "sys_device_category": [
    { label: "有组织CEMS在线监测", value: "cems", cssClass: "text-cyan-400 font-bold" },
    { label: "无组织粉尘微物研判站", value: "dust", cssClass: "text-amber-400" },
    { label: "环保抑尘治理执行阀门", value: "sprayer", cssClass: "text-emerald-400" },
    { label: "视频OCR道闸车辆捕获枪", value: "cctv", cssClass: "text-sky-400" }
  ],
  "env_alarm_level": [
    { label: "一级红色紧急违限", value: "critical", cssClass: "text-rose-500 font-bold" },
    { label: "二级橙色主要告警", value: "major", cssClass: "text-amber-400" },
    { label: "三级黄色常规微漂", value: "minor", cssClass: "text-yellow-400" }
  ],
  "comm_protocol_type": [
    { label: "Modbus TCP 以太网", value: "modbus_tcp", cssClass: "text-sky-305 text-cyan-400" },
    { label: "OPC UA 架构规约", value: "opc_ua", cssClass: "text-indigo-400" },
    { label: "MQTT 薄介联络端", value: "mqtt", cssClass: "text-teal-400" },
    { label: "国标HJ212-2017数据规约", value: "hj212", cssClass: "text-emerald-400" }
  ],
  "emission_control_section": [
    { label: "熟料煅烧烧成工段", value: "burning", cssClass: "text-orange-400" },
    { label: "原料密闭皮带粉碎", value: "crushing", cssClass: "text-slate-300" },
    { label: "副料煤堆卸堆收仓", value: "storing", cssClass: "text-blue-400" }
  ]
};

export const initialConfigParams: ConfigParamItem[] = [
  { id: "cfg-1", name: "有组织超标锁定阈值(PM)", key: "env.threshold.pm", value: "10.0", type: "system", remark: "烟尘国家标杆限值：10mg/m³" },
  { id: "cfg-2", name: "无组织微站预警线(PM10)", key: "env.threshold.dust_pm10", value: "150", type: "system", remark: "扬尘越界自动联锁起喷触发值" },
  { id: "cfg-3", name: "系统密码错误锁定次数", key: "sys.security.lockLimit", value: "5", type: "system", remark: "账户登录重试阻断深度" },
  { id: "cfg-4", name: "环保中继采样时钟频振(ms)", key: "telemetry.sample.interval", value: "2000", type: "custom", remark: "Modbus/TCP寄存器组批刷新时间" },
  { id: "cfg-5", name: "报警日报通知组邮箱别名", key: "env.notify.receivers", value: "an-huan-lq@huaxin.com", type: "custom", remark: "报警生成后流转督办主送邮箱" }
];

export const initialNotices: NoticeItem[] = [
  { id: "not-1", title: "关于1#水泥窑头有组织排气旁路烟道进行密封检查及电缆铺设公告", type: "notice", content: "接安环部通知，将于本周六早8点至12点对1#窑进行物理盲板铅印焊死。期间有组织CEMS不中断上传调试。请维保室做好安全警戒线标志红灯提示。", status: "published", author: "安环处梁总", createTime: "2026-06-01 08:30" },
  { id: "not-2", title: "【预警方案】大颗粒无组织大棚熟料输送落落口5号微雾自联动检验演练方案", type: "announcement", content: "各车间：兹定于明日15时进行大棚内部扬尘越线与雾炮及高空除尘自联锁点射测试，届时喷水会伴发短暂脉冲，属于仿真测试演习，请保卫科及保工车间按序进行。", status: "published", author: "曹工（环保专班）", createTime: "2026-06-03 14:00" },
  { id: "not-3", title: "突发环保通告：禄劝辖区气象发布高温黄色预警，做好熟料圆库密闭与道路抑尘降温", type: "alert", content: "市环保督办提示：针对高温导致的大气粉尘漂流扩散，要求道路保洁洒水频次由2小时/次提升至1小时/次，北斗GPS车组做好航向追踪汇报。", status: "draft", author: "值班环保调度", createTime: "2026-06-04 05:00" }
];

export const initialOpsLogs: OperationalLogItem[] = [
  { id: "op-1", module: "用户管理", actionType: "新增用户", operator: "admin", ip: "192.168.10.45", location: "昆明市 盘龙区", status: "success", duration: 15, time: "2026-06-04 05:10:22" },
  { id: "op-2", module: "有组织控制", actionType: "开启旁路", operator: "caogong", ip: "192.168.12.80", location: "局域网终端", status: "success", duration: 42, time: "2026-06-04 04:32:01" },
  { id: "op-3", module: "系统配置", actionType: "参数修改", operator: "admin", ip: "192.168.10.45", location: "昆明市 盘龙区", status: "success", duration: 8, time: "2026-06-04 03:15:10" },
  { id: "op-4", module: "字典管理", actionType: "添加字典", operator: "linjiaoguan", ip: "192.168.11.13", location: "局域网终端", status: "fail", duration: 122, time: "2026-06-03 16:40:55" },
  { id: "op-5", module: "设备管理", actionType: "修改设备信息", operator: "caogong", ip: "192.168.12.80", location: "局域网终端", status: "success", duration: 33, time: "2026-06-03 11:20:14" }
];

export const initialLoginLogs: LoginLogItem[] = [
  { id: "log-1", username: "admin", ip: "192.168.10.45", location: "昆明市 盘龙区", browser: "Chrome 124", os: "Windows 11", status: "success", msg: "登录成功", time: "2026-06-04 05:00:12" },
  { id: "log-2", username: "caogong", ip: "192.168.12.80", location: "昆明市 禄劝县", browser: "Edge 120", os: "macOS 14.2", status: "success", msg: "登录成功", time: "2026-06-04 03:45:00" },
  { id: "log-3", username: "unknown_test", ip: "220.122.95.14", location: "昆明市 官渡区", browser: "Firefox 118", os: "Linux Ubuntu", status: "fail", msg: "密码错误3次锁定", time: "2026-06-04 02:30:11" },
  { id: "log-4", username: "linjiaoguan", ip: "192.168.11.13", location: "昆明市 禄劝县", browser: "Mobile WeChat", os: "Android Core", status: "success", msg: "登录口令校验成功", time: "2026-06-03 22:50:44" }
];

export const initialOnlineUsers: OnlineUserItem[] = [
  { id: "on-1", username: "admin", deptName: "安环监管处", ip: "192.168.10.45", location: "昆明市 盘龙区", browser: "Chrome 124", loginTime: "2026-06-04 05:00:12" },
  { id: "on-2", username: "caogong", deptName: "环保专班", ip: "192.168.12.80", location: "昆明市 禄劝县", browser: "Edge 120", loginTime: "2026-06-04 03:45:00" },
  { id: "on-3", username: "linjiaoguan", deptName: "脱硝运维组", ip: "192.168.11.13", location: "昆明市 禄劝县", browser: "WeChat Mobile", loginTime: "2026-06-03 22:50:44" }
];

export const initialCronTasks: CronTaskItem[] = [
  { id: "cron-1", name: "CemsMinutesFetchJob", group: "ENV_COLLECT", cronExpr: "0 */1 * * * ?", status: "running", remark: "每分钟轮询取回各窑顶CEMS浓度瞬时均值，存储并刷新一张图" },
  { id: "cron-2", name: "DustInterlockTriggerTask", group: "ENV_LINK", cronExpr: "*/5 * * * * ?", status: "running", remark: "每5秒计算全棚2D热力颗粒度均值，阈值自匹配联动高压水门发水" },
  { id: "cron-3", name: "OcrGateDatabaseSyncJob", group: "SYS_SYNC", cronExpr: "0 0 */2 * * ?", status: "running", remark: "每2小时校对北斗重卡过卡清单与昆明市环税绿色环保直通港数据" },
  { id: "cron-4", name: "HistoricalLogBackupCron", group: "SYS_BACKUP", cronExpr: "0 0 1 * * ?", status: "paused", remark: "每晚凌晨1点对历史Cems越段进行哈希冻结，并输出签章电子文件" }
];

export const initialDbTables: DbTableInfo[] = [
  { id: "db-1", tableName: "tbl_env_cems_log_instant", comment: "有组织废气小时在线监测瞬测台账", rowsCount: 1420550, dataSize: "320.5 MB", indexSize: "88.4 MB", queriesSec: 125 },
  { id: "db-2", tableName: "tbl_env_dust_microsensor_ledger", comment: "无组织扬尘网格测算数据高频库", rowsCount: 8421000, dataSize: "1.45 GB", indexSize: "442.0 MB", queriesSec: 460 },
  { id: "db-3", tableName: "tbl_sys_operational_logs", comment: "系统管理员对开闭闭印等审计日志", rowsCount: 42100, dataSize: "12.4 MB", indexSize: "3.5 MB", queriesSec: 12 },
  { id: "db-4", tableName: "tbl_gate_ocr_car_records", comment: "道闸车牌色国六纯电卡车绿色核准表", rowsCount: 185300, dataSize: "44.2 MB", indexSize: "18.1 MB", queriesSec: 28 }
];

export const initialRedisCaches: RedisCacheItem[] = [
  { id: "red-1", key: "sys:dict:cache_list", type: "Hash_Map", size: "12.5 KB", ttl: -1 },
  { id: "red-2", key: "auth:token:admin_lq", type: "String", size: "1.2 KB", ttl: 7200 },
  { id: "red-3", key: "env:instant:telemetry_grid", type: "Hash_Map", size: "450.4 KB", ttl: 15 },
  { id: "red-4", key: "env:interlock:sprinkler_running_state", type: "Integer", size: "128 Bytes", ttl: 3 },
  { id: "red-5", key: "sys:config:parameters", type: "Hash_Map", size: "8.4 KB", ttl: 86400 }
];

export const initialDeviceRegistries: DeviceRegistryItem[] = [
  { id: "dev-01", code: "CEMS-EQ-101", name: "1#回转窑头CEMS烟气分析仪", category: "有组织CEMS在线监测", groupName: "回转窑头工段", status: "online", lastActive: "2026-06-04 05:45:11", ip: "192.168.102.10" },
  { id: "dev-02", code: "CEMS-EQ-102", name: "2#窑尾余热排气筒烟分析仪", category: "有组织CEMS在线监测", groupName: "窑尾发电工段", status: "online", lastActive: "2026-06-04 05:45:09", ip: "192.168.102.11" },
  { id: "dev-03", code: "DUST-EQ-301", name: "原料搅拌大棚无组织激光测震仪", category: "无组织粉尘微物研判站", groupName: "物料大棚区域", status: "online", lastActive: "2026-06-04 05:44:55", ip: "192.168.102.31" },
  { id: "dev-04", code: "DUST-EQ-302", name: "石灰石均化库出口TSP高强仪", category: "无组织粉尘微物研判站", groupName: "物料大棚区域", status: "fault", lastActive: "2026-06-04 05:30:10", ip: "192.168.102.32" },
  { id: "dev-05", code: "SPRAY-EQ-501", name: "3#主熟料大棚全效超高压降尘雾炮", category: "环保抑尘治理执行阀门", groupName: "活性大棚自抑设施", status: "online", lastActive: "2026-06-04 05:45:00", ip: "192.168.102.51" },
  { id: "dev-06", code: "CCTV-OCR-701", name: "南厂门一号OCR重卡排自核道闸摄像机", category: "视频OCR道闸车辆捕获枪", groupName: "外防道闸网格", status: "offline", lastActive: "2026-06-03 18:22:11", ip: "192.168.102.71" }
];

export const initialDeviceTypes: DeviceTypeItem[] = [
  { id: "dt-cems", code: "cems_station", name: "有组织CEMS在线监测端", desc: "专责检测窑口连续排放，分析PM/SO2/NOx浓度，附气体旁路阀测点" },
  { id: "dt-dust", code: "dust_micro", name: "无组织激光扬尘微环境仪", desc: "微米级固体悬浮TSP/PM10测算，具备MODBUS寄存器输出，支持级联控水机制" },
  { id: "dt-spray", code: "sprinkler_valve", name: "环保大功率发瀑雾炮水枪", desc: "受PLC控制的强效抑尘降水端，包含变频控制、电流测监" },
  { id: "dt-ocr", code: "ocr_camera", name: "外防出入口OCR辨查摄像头", desc: "自动抓拍卡车车牌色彩、校验排放环保规格并进行远程门槛释放" }
];

export const initialDeviceGroups: DeviceGroupItem[] = [
  { id: "g-1", name: "回转窑头工段", parent: "生产部", leader: "段工长", remarks: "涵盖1#及2#回转窑头及低位燃烧中继设备" },
  { id: "g-2", name: "窑尾发电工段", parent: "发电车间", leader: "梁主任", remarks: "涉及中低温余热发电机组排放以及热交换阀组监控" },
  { id: "g-3", name: "物料大棚区域", parent: "物流仓储", leader: "曹工", remarks: "覆盖全场长跨密闭落尘大棚，主要密集布置扬尘激光监测微站" },
  { id: "g-4", name: "活性大棚自抑设施", parent: "物流仓储", leader: "曹工", remarks: "配备有常启长射雾炮、全压清扫洒水枪控制网络" },
  { id: "g-5", name: "外防道闸网格", parent: "综管部", leader: "卫队长", remarks: "主管货运车辆进入大宗货物运输管理平台的接口" }
];

export const initialDeviceAttributes: DeviceAttributeItem[] = [
  { id: "attr-1", deviceId: "dev-01", attrName: "烟气瞬时氧含量", registerAddress: "0x011a", dataType: "Float32", unit: "%", accessMode: "R" },
  { id: "attr-2", deviceId: "dev-01", attrName: "烟尘折算粉尘浓度", registerAddress: "0x011e", dataType: "Float32", unit: "mg/m³", accessMode: "R" },
  { id: "attr-3", deviceId: "dev-01", attrName: "脱硝旁路烟道铅封传感器", registerAddress: "0x0124", dataType: "Int16", unit: "无", accessMode: "RW" },
  { id: "attr-4", deviceId: "dev-03", attrName: "微站TSP实测值", registerAddress: "0x0210", dataType: "Int16", unit: "ug/m³", accessMode: "R" },
  { id: "attr-5", deviceId: "dev-05", attrName: "高压泵管道变频运转电流", registerAddress: "0x0308", dataType: "Float32", unit: "A", accessMode: "RW" },
  { id: "attr-6", deviceId: "dev-05", attrName: "高雾水门阀口开闭使能", registerAddress: "0x0302", dataType: "Boolean", unit: "开/闭", accessMode: "RW" }
];

export const initialConnConfigs: ConnConfigItem[] = [
  { id: "cc-1", name: "高空1#回转烟囱 CEMS 调频网关", protocol: "Modbus-TCP", ipAddress: "192.168.102.10", port: 502, nodeId: 1, status: "connected", lastPing: "2026-06-04 05:45:00" },
  { id: "cc-2", name: "活性落灰熟料棚 3# PLC干预水站", protocol: "Modbus-TCP", ipAddress: "192.168.102.51", port: 502, nodeId: 3, status: "connected", lastPing: "2026-06-04 05:44:00" },
  { id: "cc-3", name: "石灰均化库二组 激光监测点位器", protocol: "Modbus-RTU", ipAddress: "192.168.102.32", port: 9600, nodeId: 2, baudRate: 9600, parity: "Even", status: "error", lastPing: "2026-06-04 05:30:10" },
  { id: "cc-4", name: "南厂大门 OCR 遥感控制柜", protocol: "MQTT", ipAddress: "192.168.102.71", port: 1883, nodeId: 10, status: "disconnected", lastPing: "2026-06-03 18:22:11" }
];
