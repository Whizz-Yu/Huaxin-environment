/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface CemsStack {
  id: string;
  name: string; // e.g., "1#水泥窑头", "2#窑尾余热发电机", "煤磨排气筒", "水泥磨主排气筒"
  process: string; // "烧成工段", "余热发电", "煤粉制备", "水泥粉磨"
  permitNo: string; // 排污许可证编号
  status: "running" | "stopped" | "fault";
  hasBypass: boolean;
  bypassStatus: "closed" | "open" | "sealed";
  // Sub-parameters
  oxygen: number; // %
  pm: number; // mg/m3
  so2: number; // mg/m3
  nox: number; // mg/m3
  nh3: number; // mg/m3
  hf: number; // mg/m3 (氟化物)
  co: number; // mg/m3
  nmhc: number; // mg/m3 (非甲烷总烃)
  temperature: number; // ℃
  flowRate: number; // m3/h
  pressure: number; // kPa
}

export interface DenitrationLog {
  id: string;
  date: string;
  purchasedAmount: number; // 吨 (采购量)
  consumedAmount: number; // 吨 (消耗量)
  nozzleInspect: string; // 喷枪维护记录
  operator: string;
}

export interface DcsParameter {
  id: string;
  section: "kiln" | "kilnTail" | "dustRemove" | "desof" | "denit";
  name: string;
  value: number;
  unit: string;
}

export interface DustSensor {
  id: string;
  name: string; // e.g., "原料大棚", "熟料库顶", "1#皮带廊", "洗车平台"
  area: string;
  pm25: number; // ug/m3
  pm10: number; // ug/m3
  tsp: number; // ug/m3
  status: "normal" | "warning" | "error" | "offline";
  lastActive: string;
}

export interface DeviceStatusLog {
  id: string;
  deviceType: "monitoring" | "video" | "treatment" | "production";
  deviceName: string;
  status: "normal" | "warning" | "error" | "offline";
  voltage: number; // V
  current: number; // A
  flowRate?: number; // m3/h for sprayers
  powerCons?: number; // kWh
  waterCons?: number; // m3
  airCons?: number; // m3
}

export interface AlarmItem {
  id: string;
  type: "production_fault" | "treatment_fault" | "monitoring_fault" | "overshoot_alarm";
  name: string;
  location: string;
  startTime: string;
  endTime: string | null;
  status: "active" | "resolved";
  level: "minor" | "major" | "critical";
  description: string;
}

export interface UnorganizedSource {
  id: string;
  name: string;
  type: string; // "储存", "输送", "工艺过程"
  treatmentDevice: string; // "除尘器", "高压微雾", "双流体"
  treatmentStatus: "active" | "inactive";
  pm10Value: number;
  cctvUrl: string;
}

export interface GateRecord {
  id: string;
  plateNumber: string;
  plateColor: "blue" | "yellow" | "green" | "white";
  vehicleType: string; // "洒水车" | "清扫车" | "大卡车"
  emissionStandard: "New Energy" | "National V" | "National VI" | "Below V";
  driverName: string;
  driverPhone: string;
  cargoName: string;
  weight: number; // 吨
  direction: "in" | "out";
  time: string;
  approved: boolean;
}

export interface CleaningVehicle {
  id: string;
  name: string; // e.g., "1#洒水车", "2#清扫车"
  type: "sprinkler" | "sweeper" | "duster_car";
  driver: string;
  phone: string;
  status: "working" | "idle" | "fault";
  speed: number; // km/h
  waterLevel: number; // %
  todayMileage: number; // km
  todaySprays: number; // 次
  lastActive: string;
  latitude: number; // Mock grid X coordinate 0-100
  longitude: number; // Mock grid Y coordinate 0-100
}

export interface EnvironmentalDoc {
  id: string;
  title: string;
  category: "企业简介" | "环保组织架构" | "企业环保档案" | "环评报告" | "检测报告" | "排污许可证";
  uploadDate: string;
  size: string;
  verified: boolean;
}

export interface MaintenanceStaff {
  id: string;
  name: string;
  role: string; // "维保工程", "环境监测员", "安全员"
  phone: string;
  status: "on_duty" | "resting";
  location: string;
}

export interface StaffEducation {
  level: string; // "研究生", "本科", "大专", "高中及以下"
  count: number;
}
