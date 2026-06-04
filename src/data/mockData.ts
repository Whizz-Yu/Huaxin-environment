/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  CemsStack,
  DenitrationLog,
  DcsParameter,
  DustSensor,
  DeviceStatusLog,
  AlarmItem,
  UnorganizedSource,
  GateRecord,
  CleaningVehicle,
  EnvironmentalDoc,
  MaintenanceStaff,
  StaffEducation,
} from "../types";

export const initialCemsStacks: CemsStack[] = [
  {
    id: "cems-1",
    name: "水泥窑窑头（冷却机）排气筒",
    process: "熟料窑头冷却工序",
    permitNo: "91530181MA6N3K2D5X001P",
    status: "running",
    hasBypass: false,
    bypassStatus: "sealed",
    oxygen: 11.2,
    pm: 4.8, // 超低排放标准: 国标通常要求颗粒物 < 10mg/m3
    so2: 1.5, // 超低排放标准: SO2无明显产生
    nox: 12.6, // 冷却机无燃烧过程，通常NOx极低
    nh3: 0.1,
    hf: 0.02,
    co: 5,
    nmhc: 0.1,
    temperature: 145,
    flowRate: 350000,
    pressure: -0.22,
  },
  {
    id: "cems-2",
    name: "水泥窑及窑尾余热利用系统排气筒",
    process: "窑尾烧成与余热电站工序",
    permitNo: "91530181MA6N3K2D5X001P",
    status: "running",
    hasBypass: true,
    bypassStatus: "closed",
    oxygen: 9.8,
    pm: 5.2,
    so2: 18.2,
    nox: 42.1,
    nh3: 2.3,
    hf: 0.15,
    co: 154,
    nmhc: 1.8,
    temperature: 180,
    flowRate: 580000,
    pressure: -1.45,
  },
  {
    id: "cems-3",
    name: "煤磨排气筒",
    process: "粉煤制备及煤磨除尘工序",
    permitNo: "91530181MA6N3K2D5X001P",
    status: "running",
    hasBypass: false,
    bypassStatus: "sealed",
    oxygen: 16.5,
    pm: 3.1,
    so2: 2.4,
    nox: 15.0,
    nh3: 0.2,
    hf: 0.01,
    co: 45,
    nmhc: 0.8,
    temperature: 65,
    flowRate: 120000,
    pressure: -0.32,
  },
  {
    id: "cems-4",
    name: "水泥磨主排气筒",
    process: "成品磨合粉磨除尘工序",
    permitNo: "91530181MA6N3K2D5X002P",
    status: "running",
    hasBypass: false,
    bypassStatus: "sealed",
    oxygen: 19.8,
    pm: 2.8,
    so2: 1.1,
    nox: 5.4,
    nh3: 0.1,
    hf: 0.01,
    co: 12,
    nmhc: 0.3,
    temperature: 72,
    flowRate: 160000,
    pressure: -0.55,
  },
  {
    id: "cems-5",
    name: "独立烘干热源排气筒",
    process: "原料/混合材烘干热源工序",
    permitNo: "91530181MA6N3K2D5X001P",
    status: "running",
    hasBypass: false,
    bypassStatus: "sealed",
    oxygen: 15.4,
    pm: 6.5,
    so2: 14.5,
    nox: 32.1,
    nh3: 0.8,
    hf: 0.05,
    co: 48,
    nmhc: 0.4,
    temperature: 92,
    flowRate: 115000,
    pressure: -0.28,
  },
  {
    id: "cems-6",
    name: "旁路应急排气排气筒 (生料磨备用)",
    process: "原料粉磨阶段",
    permitNo: "91530181MA6N3K2D5X001P",
    status: "stopped",
    hasBypass: true,
    bypassStatus: "closed",
    oxygen: 20.9,
    pm: 0.0,
    so2: 0.0,
    nox: 0.0,
    nh3: 0.0,
    hf: 0.0,
    co: 0,
    nmhc: 0.0,
    temperature: 24,
    flowRate: 0,
    pressure: 0.0,
  }
];

export const initialDenitrationLogs: DenitrationLog[] = [
  {
    id: "dn-1",
    date: "2026-06-01",
    purchasedAmount: 45.0,
    consumedAmount: 12.8,
    nozzleInspect: "1~12号高效双流体雾化喷枪运行正常，2号备用喷头已拆洗",
    operator: "张强"
  },
  {
    id: "dn-2",
    date: "2026-05-31",
    purchasedAmount: 0.0,
    consumedAmount: 13.1,
    nozzleInspect: "例行清理1-4层催化剂积灰，4号、7号喷头防磨罩更换",
    operator: "张强"
  },
  {
    id: "dn-3",
    date: "2026-05-30",
    purchasedAmount: 50.0,
    consumedAmount: 12.5,
    nozzleInspect: "反应单元A段流场测定，出口喷咀密封环紧固",
    operator: "王建国"
  },
  {
    id: "dn-4",
    date: "2026-05-29",
    purchasedAmount: 0.0,
    consumedAmount: 11.9,
    nozzleInspect: "5~8号喷头风管气泡泄漏排查，未见异常",
    operator: "李四"
  }
];

export const initialDcsParameters: DcsParameter[] = [
  // 窑体运转参数
  { id: "dcs-1", section: "kiln", name: "窑熟料喂料量", value: 380, unit: "t/h" },
  { id: "dcs-2", section: "kiln", name: "窑头送煤量", value: 14.5, unit: "t/h" },
  { id: "dcs-3", section: "kiln", name: "分解炉设定温度", value: 895, unit: "℃" },
  { id: "dcs-4", section: "kiln", name: "一级筒出口温度", value: 312, unit: "℃" },
  { id: "dcs-5", section: "kiln", name: "预热器出口CO浓度", value: 450, unit: "ppm" },
  { id: "dcs-6", section: "kiln", name: "协同危废固废入窑量", value: 4.5, unit: "t/h" },
  // 窑尾排放源参数
  { id: "dcs-7", section: "kilnTail", name: "窑尾总烟气量", value: 580000, unit: "m³/h" },
  { id: "dcs-8", section: "kilnTail", name: "窑尾实测含氧量", value: 9.8, unit: "%" },
  { id: "dcs-9", section: "kilnTail", name: "窑尾折算排烟温度", value: 180, unit: "℃" },
  { id: "dcs-10", section: "kilnTail", name: "脱硝反应器入口NOx浓度", value: 310, unit: "mg/m³" },
  { id: "dcs-11", section: "kilnTail", name: "脱硝反应器出口NOx浓度", value: 42.1, unit: "mg/m³" },
  { id: "dcs-12", section: "kilnTail", name: "除尘器入口烟温", value: 135, unit: "℃" },
  // 除尘段
  { id: "dcs-13", section: "dustRemove", name: "除尘器出口颗粒物实测", value: 5.2, unit: "mg/m³" },
  { id: "dcs-14", section: "dustRemove", name: "主风机变频阻抗", value: 48, unit: "Hz" },
  { id: "dcs-15", section: "dustRemove", name: "袋式除尘室分室压差", value: 1100, unit: "Pa" },
  // 脱硫段
  { id: "dcs-16", section: "desof", name: "湿法脱硫吸收液pH值", value: 6.25, unit: "pH" },
  { id: "dcs-17", section: "desof", name: "脱硫浆液循环泵电流", value: 245, unit: "A" },
  { id: "dcs-18", section: "desof", name: "二氧化硫实测浓度", value: 18.2, unit: "mg/m³" },
  // 脱硝段
  { id: "dcs-19", section: "denit", name: "20%氨水瞬时消耗量", value: 2.15, unit: "t/h" },
  { id: "dcs-20", section: "denit", name: "催化还原床压降", value: 320, unit: "Pa" },
  { id: "dcs-21", section: "denit", name: "出口逃逸氨浓度", value: 2.3, unit: "ppm" }
];

export const initialDustSensors: DustSensor[] = [
  { id: "dust-1", name: "1#原料卸料及预均化大棚", area: "原料区", pm25: 18, pm10: 42, tsp: 65, status: "normal", lastActive: "14:40:02" },
  { id: "dust-2", name: "石灰石二级破碎进料仓", area: "破碎区", pm25: 45, pm10: 115, tsp: 175, status: "warning", lastActive: "14:39:55" },
  { id: "dust-3", name: "2#粘土页岩堆场出口旁侧", area: "原料区", pm25: 15, pm10: 38, tsp: 54, status: "normal", lastActive: "14:39:12" },
  { id: "dust-4", name: "生料配料站与石膏筒仓底", area: "配料区", pm25: 22, pm10: 55, tsp: 88, status: "normal", lastActive: "14:40:11" },
  { id: "dust-5", name: "回转窑头熟料篦冷机排渣地", area: "烧成区", pm25: 58, pm10: 145, tsp: 230, status: "warning", lastActive: "14:40:15" },
  { id: "dust-6", name: "熟料深坑圆库底出料口", area: "储运区", pm25: 98, pm10: 245, tsp: 380, status: "error", lastActive: "14:38:51" },
  { id: "dust-7", name: "3#水泥包装机与罐装发运线", area: "包装发运区", pm25: 28, pm10: 64, tsp: 98, status: "normal", lastActive: "14:39:58" },
  { id: "dust-8", name: "厂区东侧物流主通道(近磅房)", area: "道路物流区", pm25: 12, pm10: 32, tsp: 45, status: "normal", lastActive: "14:40:22" },
  { id: "dust-9", name: "厂区北侧车辆洗车排出水槽", area: "道路物流区", pm25: 8, pm10: 19, tsp: 31, status: "normal", lastActive: "14:40:00" },
  { id: "dust-10", name: "西侧生活办公及家属楼区", area: "敏感保护区", pm25: 14, pm10: 24, tsp: 35, status: "normal", lastActive: "14:40:12" },
];

export const initialDeviceLogs: DeviceStatusLog[] = [
  { id: "devlog-1", deviceType: "monitoring", deviceName: "1#回转窑头CEMS监测仪", status: "normal", voltage: 220, current: 3.2, powerCons: 8.5 },
  { id: "devlog-2", deviceType: "video", deviceName: "原煤堆棚入口球机监控", status: "normal", voltage: 24, current: 1.1, powerCons: 1.2 },
  { id: "devlog-3", deviceType: "treatment", deviceName: "石灰石入料口5号高压微雾泵", status: "normal", voltage: 380, current: 15.4, flowRate: 4.5, waterCons: 1.2, powerCons: 12.8 },
  { id: "devlog-4", deviceType: "treatment", deviceName: "厂区大门自动洗车槽高压冲洗组", status: "normal", voltage: 380, current: 34.2, flowRate: 25.0, waterCons: 4.8, powerCons: 45.1 },
  { id: "devlog-5", deviceType: "treatment", deviceName: "篦冷机出料地8个双流体除尘器", status: "warning", voltage: 380, current: 8.5, flowRate: 2.1, waterCons: 0.6, powerCons: 6.4 },
  { id: "devlog-6", deviceType: "monitoring", deviceName: "熟料圆库底粉尘连续遥测仪", status: "error", voltage: 212, current: 0.0, powerCons: 0.0 }
];

export const initialAlarms: AlarmItem[] = [
  {
    id: "alm-1",
    type: "overshoot_alarm",
    name: "熟料深坑圆库出料口粉尘浓度超标",
    location: "熟料圆库库底321控制分区",
    startTime: "2026-06-02 14:15:22",
    endTime: null,
    status: "active",
    level: "critical",
    description: "受料器落料气压不平衡，空气含尘量骤升，PM10测值245ug/m³触发高限(200ug/m³)"
  },
  {
    id: "alm-2",
    type: "monitoring_fault",
    name: "熟料圆库底粉尘遥测仪离线/无电流",
    location: "熟料圆库出口检测亭",
    startTime: "2026-06-02 14:38:51",
    endTime: null,
    status: "active",
    level: "major",
    description: "供电熔断器脱扣或断纤，遥测下位机连接断开"
  },
  {
    id: "alm-3",
    type: "treatment_fault",
    name: "粘土大棚3号除尘水压欠压故障",
    location: "原料卸料大棚喷咀单元",
    startTime: "2026-06-02 10:22:15",
    endTime: "2026-06-02 11:45:00",
    status: "resolved",
    level: "minor",
    description: "管道电磁阀启动卡滞导致压力持续低于0.3MPa，经手动拉网重置已恢复"
  },
  {
    id: "alm-4",
    type: "production_fault",
    name: "2#回转窑尾旁路应急风挡泄露预警",
    location: "余热发电旁路烟道挡闸",
    startTime: "2026-06-02 08:30:00",
    endTime: "2026-06-02 09:12:30",
    status: "resolved",
    level: "major",
    description: "热应力位移使闭锁压簧指示偏移0.3%，中控降速复位安全锁闭"
  }
];

export const initialUnorganizedSources: UnorganizedSource[] = [
  { id: "un-1", name: "1#原煤储存堆放棚", type: "物料储存", treatmentDevice: "高压微雾抑尘系统", treatmentStatus: "active", pm10Value: 42, cctvUrl: "通道4-原煤1棚" },
  { id: "un-2", name: "黏土、砂岩等辅料均化库", type: "物料储存", treatmentDevice: "旋转喷雾防尘枪组", treatmentStatus: "inactive", pm10Value: 38, cctvUrl: "通道9-辅料堆场" },
  { id: "un-3", name: "熟料中间库大库底装运廊", type: "物料输送", treatmentDevice: "双流体干雾抑尘系统", treatmentStatus: "active", pm10Value: 245, cctvUrl: "通道15-熟料出料" },
  { id: "un-4", name: "石灰石中转皮带输送通廊", type: "物料输送", treatmentDevice: "干法重力自闭式除尘阀", treatmentStatus: "active", pm10Value: 55, cctvUrl: "通道7-皮带廊" },
  { id: "un-5", name: "生料制备烘干及混合作业", type: "工艺过程", treatmentDevice: "多段式高压空气排烟罩", treatmentStatus: "active", pm10Value: 32, cctvUrl: "通道11-生料车间" }
];

export const initialGateRecords: GateRecord[] = [
  { id: "gt-1", plateNumber: "云A·8R93Y", plateColor: "green", vehicleType: "新能源散装罐车", emissionStandard: "New Energy", driverName: "黄一鸣", driverPhone: "13888321045", cargoName: "42.5标号熟料", weight: 32.5, direction: "out", time: "2026-06-02 14:35:10", approved: true },
  { id: "gt-2", plateNumber: "云A·5W28P", plateColor: "blue", vehicleType: "重型自卸洒水车", emissionStandard: "National VI", driverName: "田富贵", driverPhone: "13566129845", cargoName: "厂区内部水务保洁", weight: 15.0, direction: "in", time: "2026-06-02 14:31:05", approved: true },
  { id: "gt-3", plateNumber: "川B·9032F", plateColor: "yellow", vehicleType: "重载运煤卡车", emissionStandard: "National VI", driverName: "罗树林", driverPhone: "15982035914", cargoName: "烟煤煤粉颗粒", weight: 48.2, direction: "in", time: "2026-06-02 14:28:11", approved: true },
  { id: "gt-4", plateNumber: "渝A·7X118", plateColor: "yellow", vehicleType: "石灰石集卡", emissionStandard: "National V", driverName: "吴光耀", driverPhone: "18123049581", cargoName: "大块砂岩骨料", weight: 52.0, direction: "in", time: "2026-06-02 14:15:00", approved: true },
  { id: "gt-5", plateNumber: "云A·3K940", plateColor: "green", vehicleType: "纯电矿用卡车", emissionStandard: "New Energy", driverName: "段国威", driverPhone: "17724103195", cargoName: "石灰石原料", weight: 65.5, direction: "in", time: "2026-06-02 14:02:45", approved: true },
  { id: "gt-6", plateNumber: "云B·8H19F", plateColor: "yellow", vehicleType: "非国标重载旧卡机", emissionStandard: "Below V", driverName: "陈大江", driverPhone: "13919451003", cargoName: "耐火砖维修辅料", weight: 8.5, direction: "in", time: "2026-06-02 13:50:00", approved: false } // 未报备且黄标不符合标准，需人工判断
];

export const initialCleaningVehicles: CleaningVehicle[] = [
  {
    id: "v-1",
    name: "01# 高压清扫洒水车",
    type: "sprinkler",
    driver: "刘建国",
    phone: "13988661122",
    status: "working",
    speed: 12,
    waterLevel: 78,
    todayMileage: 48.5,
    todaySprays: 8,
    lastActive: "14:40:10",
    latitude: 38,  // X Axis % on grid
    longitude: 42, // Y Axis % on grid
  },
  {
    id: "v-2",
    name: "02# 旋盘强力吸尘洗扫车",
    type: "sweeper",
    driver: "马德胜",
    phone: "15187123344",
    status: "working",
    speed: 8,
    waterLevel: 52,
    todayMileage: 32.1,
    todaySprays: 5,
    lastActive: "14:39:55",
    latitude: 65,
    longitude: 28,
  },
  {
    id: "v-3",
    name: "03# 风送超强推雾抑尘车",
    type: "duster_car",
    driver: "郭小飞",
    phone: "13324567788",
    status: "idle",
    speed: 0,
    waterLevel: 100,
    todayMileage: 22.0,
    todaySprays: 3,
    lastActive: "14:35:12",
    latitude: 82,
    longitude: 74,
  }
];

export const initialDocs: EnvironmentalDoc[] = [
  { id: "doc-1", title: "华新禄劝水泥厂企业环境评估及能效改造自评书.pdf", category: "企业环保档案", uploadDate: "2026-01-15", size: "14.2 MB", verified: true },
  { id: "doc-2", title: "2026年度二季度回转窑废气排放第三方CEMS校准检测报告.pdf", category: "检测报告", uploadDate: "2026-05-10", size: "4.8 MB", verified: true },
  { id: "doc-3", title: "生产组织环境保护委员会专职层级责任机制规章.docx", category: "环保组织架构", uploadDate: "2025-11-20", size: "1.2 MB", verified: true },
  { id: "doc-4", title: "中南地区重点行业颗粒物与SO2超低排放技术规范汇编.pdf", category: "企业简介", uploadDate: "2024-03-05", size: "22.5 MB", verified: true },
  { id: "doc-5", title: "华新禄劝污染源自动监控及排污许可证申报副本2025版.pdf", category: "排污许可证", uploadDate: "2025-08-30", size: "8.1 MB", verified: true },
  { id: "doc-6", title: "一五七期脱硝超低催化机组物理隔离环评审批意见书.pdf", category: "环评报告", uploadDate: "2024-07-12", size: "5.4 MB", verified: true },
];

export const initialStaff: MaintenanceStaff[] = [
  { id: "st-1", name: "高志明", role: "环境监测专员", phone: "13800138000", status: "on_duty", location: "CEMS站房区" },
  { id: "st-2", name: "徐保平", role: "除尘设备维保工", phone: "13800138001", status: "on_duty", location: "石灰石破碎地" },
  { id: "st-3", name: "张同心", role: "绿化抑尘车组长", phone: "13800138002", status: "on_duty", location: "原料均质大棚" },
  { id: "st-4", name: "王维福", role: "安全环保监管员", phone: "13800138003", status: "resting", location: "值班调度室" }
];

export const staffEducationStats: StaffEducation[] = [
  { level: "研究生及以上", count: 2 },
  { level: "大学本科", count: 8 },
  { level: "大学专科", count: 15 },
  { level: "中专及高中以下", count: 5 },
];

// 24 Hour baseline timeline representing emissions for trends chart
export const selectHourlyTrends = () => {
  const dustHours: { hour: string; pm25: number; pm10: number; tsp: number; limitPm10: number }[] = [];
  for (let i = 0; i < 24; i++) {
    const hourStr = `${String(i).padStart(2, "0")}:00`;
    // Add random fluctuations around a pattern: higher during peak transport (8-18)
    const multiplier = i >= 8 && i <= 17 ? 1.4 : 0.8;
    const basePM10 = Math.floor(45 + Math.sin((i / 24) * Math.PI * 2) * 15 * multiplier);
    dustHours.push({
      hour: hourStr,
      pm25: Math.floor(basePM10 * 0.4),
      pm10: basePM10,
      tsp: Math.floor(basePM10 * 1.5),
      limitPm10: 150, // GB Standard general limit
    });
  }
  return dustHours;
};

// Historical 12 months pollution levels for long-term planning (annual trend comparison)
export const selectMonthlyHistory = () => {
  return [
    { name: "1月", "2025年均值(PM10)": 48, "2026年均值(PM10)": 38, 国控限值: 50 },
    { name: "2月", "2025年均值(PM10)": 52, "2026年均值(PM10)": 36, 国控限值: 50 },
    { name: "3月", "2025年均值(PM10)": 49, "2026年均值(PM10)": 39, 国控限值: 50 },
    { name: "4月", "2025年均值(PM10)": 55, "2026年均值(PM10)": 41, 国控限值: 50 },
    { name: "5月", "2025年均值(PM10)": 58, "2026年均值(PM10)": 40, 国控限值: 50 },
    { name: "6月", "2025年均值(PM10)": 42, "2026年均值(PM10)": 35, 国控限值: 50 },
    { name: "7月", "2025年均值(PM10)": 38, "2026年均值(PM10)": 33, 国控限值: 50 },
    { name: "8月", "2025年均值(PM10)": 35, "2026年均值(PM10)": 31, 国控限值: 50 },
    { name: "9月", "2025年均值(PM10)": 41, "2026年均值(PM10)": 34, 国控限值: 50 },
    { name: "10月", "2025年均值(PM10)": 46, "2026年均值(PM10)": 38, 国控限值: 50 },
    { name: "11月", "2025年均值(PM10)": 50, "2026年均值(PM10)": 39, 国控限值: 50 },
    { name: "12月", "2025年均值(PM10)": 54, "2026年均值(PM10)": 42, 国控限值: 50 },
  ];
};

// Transport statistics representation (truck counts, trains, belts)
export const initialTransportStats = {
  ironFrequency: 185,  // Train delivery count
  roadFrequency: 1220, // Clean heavy vehicle delivery count
  beltUptime: 99.8,    // Belt conveyor system uptime %
  cleanRate: 88.5,     // Cleaner transportation ratio %
  nationalTarget: 80.0 // GB limit target
};

// Simulated fluctuations generator to update values dynamically at runtime
export function perturbCems(cems: CemsStack[]): CemsStack[] {
  return cems.map((item) => {
    if (item.status !== "running") return item;
    // Tiny drift
    const drift = () => (Math.random() - 0.5) * 0.1;
    return {
      ...item,
      oxygen: Math.max(5, Math.min(20, parseFloat((item.oxygen + drift() * 2).toFixed(1)))),
      pm: Math.max(1, Math.min(15, parseFloat((item.pm + drift() * 0.4).toFixed(1)))),
      so2: Math.max(2, Math.min(30, parseFloat((item.so2 + drift() * 1.2).toFixed(1)))),
      nox: Math.max(10, Math.min(48, parseFloat((item.nox + drift() * 2.5).toFixed(1)))),
      temperature: Math.max(30, Math.min(220, Math.floor(item.temperature + (Math.random() - 0.5) * 3))),
      flowRate: Math.floor(item.flowRate + (Math.random() - 0.5) * 2000),
    };
  });
}

export function perturbDust(sensors: DustSensor[]): DustSensor[] {
  return sensors.map((item) => {
    if (item.status === "offline") return item;
    const modifier = item.id === "dust-6" ? 1.5 : 1.0; // Keep the faulty one higher
    const delta = (Math.random() - 0.5) * 4 * modifier;
    const nextPm10 = Math.max(5, Math.floor(item.pm10 + delta));
    const nextPm25 = Math.max(2, Math.floor(nextPm10 * (0.4 + Math.random() * 0.1)));
    const nextTsp = Math.max(8, Math.floor(nextPm10 * (1.4 + Math.random() * 0.2)));

    let status: DustSensor["status"] = "normal";
    if (nextPm10 > 200) status = "error";
    else if (nextPm10 > 100) status = "warning";

    // Keep original offline offline
    if (item.id === "dust-6" && item.pm10 > 300) {
      return item; // locked in error
    }

    return {
      ...item,
      pm10: nextPm10,
      pm25: nextPm25,
      tsp: nextTsp,
      status: item.id === "dust-6" ? "error" : status,
    };
  });
}

export function perturbCleaningVehicles(vehicles: CleaningVehicle[]): CleaningVehicle[] {
  return vehicles.map((v) => {
    if (v.status !== "working") return v;
    // Drift coordinates representation randomly on a boundary Box (10 to 90)
    let nextLat = v.latitude + (Math.random() - 0.5) * 2;
    let nextLng = v.longitude + (Math.random() - 0.5) * 2;
    if (nextLat < 10) nextLat = 12;
    if (nextLat > 90) nextLat = 88;
    if (nextLng < 10) nextLng = 12;
    if (nextLng > 90) nextLng = 88;

    // Water consumption simulation
    let nextWater = v.waterLevel - (Math.random() > 0.4 ? 1 : 0);
    if (nextWater <= 5) nextWater = 100; // Auto refilled!

    return {
      ...v,
      latitude: parseFloat(nextLat.toFixed(2)),
      longitude: parseFloat(nextLng.toFixed(2)),
      waterLevel: nextWater,
      todayMileage: parseFloat((v.todayMileage + 0.02).toFixed(2)),
      speed: Math.max(5, Math.min(25, Math.floor(v.speed + (Math.random() - 0.5) * 4))),
    };
  });
}
