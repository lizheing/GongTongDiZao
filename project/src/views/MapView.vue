<template>
  <div class="dashboard-container">
    <!-- 左侧统计面板 -->
    <div class="stat-panel left-panel">
      <el-card class="stat-card">
        <template #header>
          <div class="card-header">
            <h3>类别统计</h3>
          </div>
        </template>
        <div ref="categoryChart" class="chart"></div>
      </el-card>
      <el-card class="stat-card">
        <template #header>
          <div class="card-header">
            <h3>领域统计</h3>
          </div>
        </template>
        <div ref="domainChart" class="chart"></div>
      </el-card>
    </div>

    <!-- 中间地图面板 -->
    <div class="map-panel">
      <div id="map" ref="mapContainer"></div>
      <!-- 地图控件 -->
      <div class="map-controls">
        <!-- 底图切换 -->
        <el-dropdown trigger="click" @command="switchBaseMap">
          <el-button type="primary">
            底图切换
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="osm">OpenStreetMap</el-dropdown-item>
              <el-dropdown-item command="amap">高德卫星图</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        
        <!-- 测量工具 -->
        <el-dropdown trigger="click" @command="startMeasure">
          <el-button type="primary">
            测量工具
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="distance">距离测量</el-dropdown-item>
              <el-dropdown-item command="area">面积测量</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        
        <!-- 停止测量 -->
        <el-button type="warning" @click="stopMeasure">停止测量</el-button>
      </div>
    </div>

    <!-- 右侧统计面板 -->
    <div class="stat-panel right-panel">
      <el-card class="stat-card">
        <template #header>
          <div class="card-header">
            <h3>区域统计</h3>
          </div>
        </template>
        <div ref="districtChart" class="chart"></div>
      </el-card>
      <el-card class="stat-card">
        <template #header>
          <div class="card-header">
            <h3>满意度统计</h3>
          </div>
        </template>
        <div ref="satisfactionChart" class="chart"></div>
      </el-card>
      <el-card class="stat-card">
        <template #header>
          <div class="card-header">
            <h3>办理状态统计</h3>
          </div>
        </template>
        <div ref="statusChart" class="chart"></div>
      </el-card>
    </div>
  </div>

  <!-- 区域留言查询弹窗 -->
  <el-dialog
    v-model="districtDialogVisible"
    :title="`${selectedDistrict}留言信息`"
    width="800px"
    :before-close="clearDistrictSelection"
    destroy-on-close
  >
    <div class="district-dialog-content">
      <div class="result-summary">
        <p>共找到 <strong>{{ districtMessages.total }}</strong> 条留言</p>
      </div>
      
      <div class="message-list">
        <div v-for="message in districtMessages.list" :key="message.message_id" class="message-item" @click="openMessageDetail(message)">
          <div class="message-header">
            <span class="message-subject">{{ message.subject }}</span>
            <span class="message-status" :class="message.status">{{ message.status }}</span>
          </div>
          <div class="message-content">{{ message.content }}</div>
          <div class="message-footer">
            <span class="message-user">{{ message.user_nickname }}</span>
            <span class="message-time">{{ message.message_time }}</span>
          </div>
        </div>
      </div>
      
      <!-- 分页 -->
      <div v-if="districtMessages.total > 0" class="pagination-container">
        <el-pagination
          v-model:current-page="districtCurrentPage"
          v-model:page-size="districtPageSize"
          :page-sizes="[10, 20, 50]"
          :total="districtMessages.total"
          layout="total, sizes, prev, pager, next"
          @size-change="handleDistrictSizeChange"
          @current-change="handleDistrictCurrentChange"
        />
      </div>
    </div>
  </el-dialog>

  <!-- 留言详情弹窗 -->
  <el-dialog
    v-model="messageDetailVisible"
    title="留言详情"
    width="900px"
    :before-close="closeMessageDetail"
    destroy-on-close
  >
    <div v-if="selectedMessage" class="message-detail-content">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="留言ID">{{ selectedMessage.message_id }}</el-descriptions-item>
        <el-descriptions-item label="原始ID">{{ selectedMessage.original_id }}</el-descriptions-item>
        <el-descriptions-item label="用户昵称">{{ selectedMessage.user_nickname }}</el-descriptions-item>
        <el-descriptions-item label="留言时间">{{ formatDateTime(selectedMessage.message_time) }}</el-descriptions-item>
        <el-descriptions-item label="类别">{{ selectedMessage.category }}</el-descriptions-item>
        <el-descriptions-item label="领域">{{ selectedMessage.domain }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(selectedMessage.status)">{{ selectedMessage.status }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="满意度">
          <el-tag v-if="selectedMessage.satisfaction" :type="selectedMessage.satisfaction === '满意' ? 'success' : 'danger'">
            {{ selectedMessage.satisfaction }}
          </el-tag>
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item label="位置">{{ selectedMessage.location }}</el-descriptions-item>
        <el-descriptions-item label="目标对象">{{ selectedMessage.target_object }}</el-descriptions-item>
        <el-descriptions-item label="区域">{{ selectedMessage.district_name }}</el-descriptions-item>
        <el-descriptions-item label="链接" :span="2">
          <a v-if="selectedMessage.link_url" :href="selectedMessage.link_url" target="_blank" class="link-url">
            {{ selectedMessage.link_url }}
          </a>
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item label="留言标题" :span="2">{{ selectedMessage.subject }}</el-descriptions-item>
        <el-descriptions-item label="留言内容" :span="2">
          <div class="message-content-full">{{ selectedMessage.content }}</div>
        </el-descriptions-item>
      </el-descriptions>

      <!-- 回复信息 -->
      <div v-if="selectedMessage.reply_content" class="reply-section">
        <h4>回复信息</h4>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="回复ID">{{ selectedMessage.reply_id }}</el-descriptions-item>
          <el-descriptions-item label="回复人">{{ selectedMessage.reply_nickname }}</el-descriptions-item>
          <el-descriptions-item label="回复机构">{{ selectedMessage.reply_organization }}</el-descriptions-item>
          <el-descriptions-item label="回复时间">{{ formatDateTime(selectedMessage.reply_time) }}</el-descriptions-item>
          <el-descriptions-item label="回复内容" :span="2">
            <div class="reply-content">{{ selectedMessage.reply_content }}</div>
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 评分信息 -->
      <div v-if="selectedMessage.solution_score || selectedMessage.attitude_score || selectedMessage.speed_score" class="score-section">
        <h4>评分信息</h4>
        <el-descriptions :column="3" border>
          <el-descriptions-item label="解决方案评分">
            <el-rate v-if="selectedMessage.solution_score" :value="selectedMessage.solution_score" disabled />
            <span v-else>-</span>
          </el-descriptions-item>
          <el-descriptions-item label="服务态度评分">
            <el-rate v-if="selectedMessage.attitude_score" :value="selectedMessage.attitude_score" disabled />
            <span v-else>-</span>
          </el-descriptions-item>
          <el-descriptions-item label="处理速度评分">
            <el-rate v-if="selectedMessage.speed_score" :value="selectedMessage.speed_score" disabled />
            <span v-else>-</span>
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import OSM from 'ol/source/OSM'
import XYZ from 'ol/source/XYZ'
import { fromLonLat } from 'ol/proj'
import { Vector as VectorLayer } from 'ol/layer'
import { Vector as VectorSource } from 'ol/source'
import GeoJSON from 'ol/format/GeoJSON'
import axios from 'axios'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'
import { Style, Fill, Stroke } from 'ol/style'
import Draw, { DrawEvent } from 'ol/interaction/Draw'
import { unByKey } from 'ol/Observable'
import Overlay from 'ol/Overlay'
import { getArea, getLength } from 'ol/sphere'
import { Circle as CircleStyle } from 'ol/style'
import { Control, defaults as defaultControls } from 'ol/control'
import { ElButton, ElButtonGroup, ElDropdown, ElDropdownMenu, ElDropdownItem } from 'element-plus'
import { Type } from 'ol/geom/Geometry'
import { LineString, Polygon } from 'ol/geom'
import { Close } from '@element-plus/icons-vue'

// ================== 地图与图层模块 ==================
// 地图容器与实例
const mapContainer = ref<HTMLElement | null>(null)
const map = ref<Map | null>(null)

// 区域矢量图层
const featureSource = new VectorSource()
const featureLayer = new VectorLayer({
  source: featureSource,
  style: function(feature) {
    const districtName = feature.get('name')
    const color = districtColors[districtName] || '#CCCCCC'
    const rgba = color.match(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/) 
      ? `rgba(${parseInt(color.slice(1,3),16)}, ${parseInt(color.slice(3,5),16)}, ${parseInt(color.slice(5,7),16)}, 0.6)`
      : 'rgba(204, 204, 204, 0.6)'
    return new Style({
      fill: new Fill({ color: rgba }),
      stroke: new Stroke({ color: '#666666', width: 1 })
    })
  }
})

// 底图图层
const osmSource = new OSM()
const amapSatelliteSource = new XYZ({
  url: 'https://webst0{1-4}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}',
  crossOrigin: 'anonymous'
})
const amapRoadSource = new XYZ({
  url: 'https://webst0{1-4}.is.autonavi.com/appmaptile?style=8&x={x}&y={y}&z={z}',
  crossOrigin: 'anonymous'
})
const osmLayer = new TileLayer({ source: osmSource, visible: true })
const amapSatelliteLayer = new TileLayer({ source: amapSatelliteSource, visible: false })
const amapRoadLayer = new TileLayer({ source: amapRoadSource, visible: false })

// ================== 测量功能模块 ==================
const measureSource = new VectorSource()
const measureLayer = new VectorLayer({
  source: measureSource,
  style: new Style({
    fill: new Fill({ color: 'rgba(255, 255, 255, 0.2)' }),
    stroke: new Stroke({ color: '#ffcc33', width: 2 }),
    image: new CircleStyle({ radius: 7, fill: new Fill({ color: '#ffcc33' }) })
  })
})
let draw: Draw | null = null
let listener: any = null
let sketch: any = null
let measureTooltipElement: HTMLElement | null = null
let measureTooltip: Overlay | null = null

// ================== 图表与统计模块 ==================
const categoryChart = ref<HTMLElement | null>(null)
const domainChart = ref<HTMLElement | null>(null)
const districtChart = ref<HTMLElement | null>(null)
const satisfactionChart = ref<HTMLElement | null>(null)
const statusChart = ref<HTMLElement | null>(null)

// ================== 区域与留言模块 ==================
const selectedDistrict = ref<string>('')
const districtMessages = ref<{ total: number; list: any[]; districtName?: string }>({ total: 0, list: [] })
const districtCurrentPage = ref(1)
const districtPageSize = ref(10)
const districtDialogVisible = ref(false)
const messageDetailVisible = ref(false)
const selectedMessage = ref<any>(null)

// 区域颜色配置
const districtColors = {
  '江岸区': '#FFB6C1',  // 浅粉色
  '江汉区': '#87CEEB',  // 天蓝色
  '硚口区': '#98FB98',  // 浅绿色
  '汉阳区': '#DDA0DD',  // 梅红色
  '武昌区': '#F0E68C',  // 浅黄色
  '青山区': '#E6E6FA',  // 淡紫色
  '洪山区': '#FFA07A',  // 浅橙色
  '东西湖区': '#B0E0E6',  // 粉蓝色
  '汉南区': '#FFE4E1',  // 浅玫瑰色
  '蔡甸区': '#F0FFF0',  // 蜜瓜色
  '江夏区': '#FFF0F5',  // 淡紫红
  '黄陂区': '#F5F5DC',  // 米色
  '新洲区': '#E0FFFF'   // 淡青色
}

// 创建测量提示
const createMeasureTooltip = () => {
  if (measureTooltipElement) {
    measureTooltipElement.parentNode?.removeChild(measureTooltipElement)
  }
  measureTooltipElement = document.createElement('div')
  measureTooltipElement.className = 'ol-tooltip ol-tooltip-measure'
  measureTooltip = new Overlay({
    element: measureTooltipElement,
    offset: [0, -15],
    positioning: 'bottom-center',
    stopEvent: false
  })
  map.value?.addOverlay(measureTooltip)
}

// 格式化测量结果
const formatLength = (line: any) => {
  const length = getLength(line)
  let output
  if (length > 100) {
    output = Math.round((length / 1000) * 100) / 100 + ' km'
  } else {
    output = Math.round(length * 100) / 100 + ' m'
  }
  return output
}

const formatArea = (polygon: any) => {
  const area = getArea(polygon)
  let output
  if (area > 10000) {
    output = Math.round((area / 1000000) * 100) / 100 + ' km²'
  } else {
    output = Math.round(area * 100) / 100 + ' m²'
  }
  return output
}

// 撤销addInteraction中的crosshair设置
// 在draw添加和移除时动态监听和恢复鼠标样式
let prevCursor = ''

const addInteraction = (type: string) => {
  if (map.value) {
    const geometryType: Type = type === 'area' ? 'Polygon' : 'LineString'
    draw = new Draw({
      source: measureSource,
      type: geometryType,
      style: new Style({
        fill: new Fill({
          color: 'rgba(255, 255, 255, 0.2)'
        }),
        stroke: new Stroke({
          color: 'rgba(0, 0, 0, 0.5)',
          lineDash: [10, 10],
          width: 2
        }),
        image: new CircleStyle({
          radius: 5,
          stroke: new Stroke({
            color: 'rgba(0, 0, 0, 0.7)'
          }),
          fill: new Fill({
            color: 'rgba(255, 255, 255, 0.2)'
          })
        })
      })
    })

    // 只在draw激活时设置crosshair，记录原始cursor
    if (mapContainer.value) {
      prevCursor = mapContainer.value.style.cursor
      mapContainer.value.style.cursor = 'crosshair'
    }

    if (draw) {
      map.value.addInteraction(draw)
      createMeasureTooltip()

      draw.on('drawstart', (evt: DrawEvent) => {
        sketch = evt.feature
        const geometry = evt.feature?.getGeometry()
        let tooltipCoord = [0, 0]
        if (geometry) {
          if (geometry instanceof LineString) {
            tooltipCoord = geometry.getFirstCoordinate()
          } else if (geometry instanceof Polygon) {
            tooltipCoord = geometry.getFirstCoordinate()
          }
        }
        listener = sketch.getGeometry().on('change', (evt: any) => {
          const geom = evt.target
          let output
          if (type === 'area') {
            output = formatArea(geom)
            tooltipCoord = geom.getInteriorPoint().getCoordinates()
          } else {
            output = formatLength(geom)
            tooltipCoord = geom.getLastCoordinate()
          }
          if (measureTooltipElement) {
            measureTooltipElement.innerHTML = output
          }
          if (measureTooltip) {
            measureTooltip.setPosition(tooltipCoord)
          }
        })
      })

      draw.on('drawend', () => {
        if (measureTooltipElement) {
          measureTooltipElement.className = 'ol-tooltip ol-tooltip-static'
        }
        if (measureTooltip) {
          measureTooltip.setOffset([0, -7])
        }
        sketch = null
        measureTooltipElement = null
        createMeasureTooltip()
        unByKey(listener)
      })
    }
  }
}

// 切换底图
const switchBaseMap = (type: string) => {
  osmLayer.setVisible(type === 'osm')
  amapSatelliteLayer.setVisible(type === 'amap')
  amapRoadLayer.setVisible(type === 'amap')
}

// 开始测量
const startMeasure = (type: string) => {
  stopMeasure() // 先移除旧的交互和状态
  addInteraction(type)
}

// 加载地图数据
const loadMapData = async () => {
  try {
    const response = await axios.get('http://localhost:3000/api/geo/wuhan');
    if (!response.data || !response.data.features) {
      throw new Error('地图数据格式错误');
    }
    const features = new GeoJSON().readFeatures(response.data, {
      featureProjection: 'EPSG:3857'
    });
    featureSource.addFeatures(features);
  } catch (error) {
    ElMessage.error('加载地图数据失败，请检查后端服务是否正常运行');
  }
}

// 加载统计数据
const loadStats = async () => {
  try {
    // 类别统计
    const categoryResponse = await axios.get('http://localhost:3000/api/stats/category');
    if (categoryResponse.data) {
      initCategoryChart(categoryResponse.data);
    }
    // 领域统计
    const domainResponse = await axios.get('http://localhost:3000/api/stats/domain');
    if (domainResponse.data) {
      initDomainChart(domainResponse.data);
    }
    // 区域统计
    const districtResponse = await axios.get('http://localhost:3000/api/stats/district');
    if (districtResponse.data) {
      initDistrictChart(districtResponse.data);
    }
    // 满意度统计
    const satisfactionResponse = await axios.get('http://localhost:3000/api/stats/satisfaction');
    if (satisfactionResponse.data) {
      initSatisfactionChart(satisfactionResponse.data);
    }
    // 办理状态统计
    const statusResponse = await axios.get('http://localhost:3000/api/stats/status');
    if (statusResponse.data) {
      initStatusChart(statusResponse.data);
    }
  } catch (error) {
    ElMessage.error('加载统计数据失败，请检查后端服务是否正常运行');
  }
}

// 查询指定区域的留言
const queryDistrictMessages = async (districtName: string) => {
  try {
    const response = await axios.get(`http://localhost:3000/api/messages/district/${encodeURIComponent(districtName)}`, {
      params: {
        page: districtCurrentPage.value,
        pageSize: districtPageSize.value
      }
    });
    districtMessages.value = response.data;
    selectedDistrict.value = districtName;
    districtDialogVisible.value = true; // 显示弹窗
  } catch (error) {
    ElMessage.error('查询区域留言失败');
  }
}

// 清除区域选择
const clearDistrictSelection = () => {
  selectedDistrict.value = '';
  districtMessages.value = { total: 0, list: [] };
  districtCurrentPage.value = 1;
  districtDialogVisible.value = false; // 隐藏弹窗
}

// 处理区域分页大小变化
const handleDistrictSizeChange = (size: number) => {
  districtPageSize.value = size;
  districtCurrentPage.value = 1;
  if (selectedDistrict.value) {
    queryDistrictMessages(selectedDistrict.value);
  }
}

// 处理区域分页当前页变化
const handleDistrictCurrentChange = (page: number) => {
  districtCurrentPage.value = page;
  if (selectedDistrict.value) {
    queryDistrictMessages(selectedDistrict.value);
  }
}

// 初始化类别统计图表
const initCategoryChart = (data: any[]) => {
  if (!categoryChart.value) return
  const chart = echarts.init(categoryChart.value)
  chart.setOption({
    grid: {
      top: 10,
      bottom: 20,
      left: 20,
      right: 20,
      containLabel: true
    },
    tooltip: { 
      trigger: 'item', 
      formatter: '{b}: {c} ({d}%)',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderColor: '#eee',
      borderWidth: 1,
      textStyle: {
        color: '#333'
      }
    },
    series: [{
      type: 'pie',
      radius: ['35%', '65%'],
      center: ['50%', '50%'],
      data: data.map(item => ({ 
        name: item.category, 
        value: item.message_count,
        itemStyle: {
          color: ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399'][data.indexOf(item) % 5]
        }
      }))
    }]
  })
}

// 初始化领域统计图表
const initDomainChart = (data: any[]) => {
  if (!domainChart.value) return
  const chart = echarts.init(domainChart.value)
  chart.setOption({
    grid: {
      top: 30,
      bottom: 20,
      left: 0,
      right: 0,
      containLabel: true
    },
    tooltip: { 
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderColor: '#eee',
      borderWidth: 1,
      textStyle: {
        color: '#333'
      }
    },
    xAxis: { 
      type: 'category', 
      data: data.map(item => item.domain),
      axisLabel: {
        interval: 0,
        rotate: 30
      }
    },
    yAxis: { type: 'value' },
    series: [{
      type: 'bar',
      barWidth: '60%',
      data: data.map(item => ({
        value: item.message_count,
        itemStyle: {
          color: ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399'][data.indexOf(item) % 5]
        }
      }))
    }]
  })
}

// 初始化区域统计图表
const initDistrictChart = (data: any[]) => {
  if (!districtChart.value) return
  const chart = echarts.init(districtChart.value)
  chart.setOption({
    grid: {
      top: 10,
      bottom: 5,
      left: 0,
      right: 0,
      containLabel: true
    },
    tooltip: { 
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderColor: '#eee',
      borderWidth: 1,
      textStyle: {
        color: '#333'
      }
    },
    xAxis: { 
      type: 'category', 
      data: data.map(item => item.district_name),
      axisLabel: {
        interval: 'auto',
        rotate: 45,
        fontSize: 12,
        overflow: 'break'
      }
    },
    yAxis: { type: 'value' },
    series: [{
      type: 'bar',
      barWidth: '60%',
      data: data.map(item => ({
        value: item.message_count,
        itemStyle: {
          color: districtColors[item.district_name] || '#909399'
        }
      }))
    }]
  })
}

// 初始化满意度统计图表
const initSatisfactionChart = (data: any[]) => {
  if (!satisfactionChart.value) return
  const chart = echarts.init(satisfactionChart.value)
  chart.setOption({
    grid: {
      top: 10,
      bottom: 10,
      left: 0,
      right: 0,
      containLabel: true
    },
    tooltip: { 
      trigger: 'item', 
      formatter: '{b}: {c} ({d}%)',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderColor: '#eee',
      borderWidth: 1,
      textStyle: {
        color: '#333'
      }
    },
    series: [{
      type: 'pie',
      radius: ['35%', '65%'],
      center: ['50%', '50%'],
      data: data.map(item => ({
        name: item.satisfaction,
        value: item.message_count,
        itemStyle: {
          color: item.satisfaction === '满意' ? '#67C23A' : '#F56C6C'
        }
      }))
    }]
  })
}

// 初始化状态统计图表
const initStatusChart = (data: any[]) => {
  if (!statusChart.value) return
  const chart = echarts.init(statusChart.value)
  chart.setOption({
    grid: {
      top: 10,
      bottom: 10,
      left: 0,
      right: 0,
      containLabel: true
    },
    tooltip: { 
      trigger: 'item', 
      formatter: '{b}: {c} ({d}%)',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderColor: '#eee',
      borderWidth: 1,
      textStyle: {
        color: '#333'
      }
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      itemWidth: 10,
      itemHeight: 10,
      textStyle: {
        fontSize: 12
      }
    },
    series: [{
      type: 'pie',
      radius: ['35%', '65%'],
      center: ['40%', '50%'],  // 将饼图向左移动
      data: data.map(item => ({
        name: item.status,
        value: item.message_count,
        itemStyle: {
          color: {
            '已办理': '#67C23A',
            '办理中': '#409EFF',
            '待回复': '#E6A23C'
          }[item.status] || '#909399'
        }
      }))
    }]
  })
}

// 格式化时间
const formatDateTime = (timestamp: string) => {
  const date = new Date(timestamp);
  return date.toLocaleString();
}

// 获取状态类型
const getStatusType = (status: string) => {
  const statusTypes: Record<string, string> = {
    '已办理': 'success',
    '办理中': 'info',
    '待回复': 'warning'
  };
  return statusTypes[status] || 'info';
}

// 打开留言详情
const openMessageDetail = (message: any) => {
  selectedMessage.value = message;
  messageDetailVisible.value = true;
}

// 关闭留言详情
const closeMessageDetail = () => {
  selectedMessage.value = null;
  messageDetailVisible.value = false;
}

// 停止测量：只清理交互和 feature，不重建地图
const stopMeasure = () => {
  if (!map.value) return;
  // 移除所有 Draw 交互
  map.value.getInteractions().getArray().slice().forEach(interaction => {
    if (interaction instanceof Draw) {
      map.value.removeInteraction(interaction);
    }
  });
  draw = null;
  measureSource.clear();
  // 清理 overlay/tooltip
  map.value.getOverlays().getArray().slice().forEach(overlay => {
    map.value?.removeOverlay(overlay);
  });
  // 恢复鼠标样式
  if (mapContainer.value) mapContainer.value.style.cursor = '';
  const viewport = map.value.getViewport();
  if (viewport) viewport.style.cursor = '';
  document.body.style.cursor = '';
};

// onMounted 只初始化一次地图
onMounted(async () => {
  if (mapContainer.value) {
    map.value = new Map({
      target: mapContainer.value,
      layers: [
        osmLayer,
        amapSatelliteLayer,
        amapRoadLayer,
        featureLayer,
        measureLayer
      ],
      view: new View({
        center: fromLonLat([114.305393, 30.593099]),
        zoom: 10,
        minZoom: 8,
        maxZoom: 18
      }),
      controls: defaultControls({ attribution: false, zoom: true, rotate: false })
    });
    // 注册地图点击事件
    map.value.on('click', (event) => {
      const feature = map.value?.forEachFeatureAtPixel(event.pixel, (feature) => feature);
      if (feature && feature.get('name')) {
        const districtName = feature.get('name');
        selectedDistrict.value = districtName;
        districtDialogVisible.value = true;
        queryDistrictMessages(districtName);
      }
    });
    await loadMapData();
    await loadStats();
  }
});

onUnmounted(() => {
  if (map.value) {
    map.value.setTarget(undefined)
  }
})
</script>

<style scoped>
.dashboard-container {
  display: flex;
  height: 100vh;
  width: 100vw;
  background: #f4f6fa;
  overflow: hidden; /* 防止出现滚动条 */
}

.stat-panel {
  width: 320px;
  padding: 12px 8px;  /* 减小内边距 */
  background: #fff;
  box-shadow: 2px 0 8px 0 rgba(0,0,0,0.04);
  display: flex;
  flex-direction: column;
  gap: 12px;  /* 减小卡片间距 */
  height: 100%;
  overflow-y: auto;
}

.left-panel {
  border-right: 1px solid #e4e7ed;
}

.right-panel {
  border-left: 1px solid #e4e7ed;
}

.map-panel {
  flex: 1;
  position: relative;
  min-width: 0;
  background: #eaf1fb;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%; /* 确保地图面板占满整个高度 */
}

#map {
  width: 100%;
  height: 100%;
  background: #fff;
  position: relative;  /* 确保地图控件定位正确 */
}

.stat-card {
  margin-bottom: 0;
  border-radius: 8px;
  box-shadow: 0 1px 6px 0 rgba(0,0,0,0.04);
  flex: 0.8;  /* 减小卡片高度比例 */
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: #fff;
}

.card-header {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  font-weight: 600;
  color: #303133;
  font-size: 1.1rem;
  padding: 8px 12px;  /* 减小标题内边距 */
  border-bottom: 1px solid #ebeef5;
}

.chart {
  flex: 1;
  min-height: 0;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;  /* 减小图表内边距 */
}

h3 {
  margin: 0;
  color: #409EFF;
  font-size: 1.08rem;
}

.map-controls {
  position: absolute;
  bottom: 80px;  /* 继续增加底部距离 */
  left: 30px;
  z-index: 1000;
  display: flex;
  gap: 12px;
  background-color: rgba(255, 255, 255, 0.9);
  padding: 12px;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.ol-tooltip {
  position: relative;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 4px;
  color: white;
  padding: 4px 8px;
  white-space: nowrap;
  font-size: 12px;
}

.ol-tooltip-measure {
  opacity: 1;
  font-weight: bold;
}

.ol-tooltip-static {
  background-color: #ffcc33;
  color: black;
  border: 1px solid white;
}

.ol-tooltip-measure:before,
.ol-tooltip-static:before {
  border-top: 6px solid rgba(0, 0, 0, 0.5);
  border-right: 6px solid transparent;
  border-left: 6px solid transparent;
  content: "";
  position: absolute;
  bottom: -6px;
  margin-left: -7px;
  left: 50%;
}

.ol-tooltip-static:before {
  border-top-color: #ffcc33;
}

/* 调整图表容器样式 */
.stat-card :deep(.el-card__body) {
  flex: 1;
  padding: 12px;
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: 100%;  /* 确保内容区域占满高度 */
}

/* 确保图表能够正确填充容器 */
.stat-card :deep(.el-card__body) > div {
  flex: 1;
  min-height: 0;
  height: 100%;  /* 确保图表占满容器高度 */
}

/* 优化滚动条样式 */
.stat-panel::-webkit-scrollbar {
  width: 6px;
}

.stat-panel::-webkit-scrollbar-thumb {
  background-color: #dcdfe6;
  border-radius: 3px;
}

.stat-panel::-webkit-scrollbar-track {
  background-color: #f5f7fa;
}

/* 弹窗内容样式 */
.district-dialog-content {
  max-height: 600px;
  overflow-y: auto;
}

.result-summary {
  margin-bottom: 16px;
  padding: 12px;
  background-color: #f0f9ff;
  border-radius: 6px;
  border-left: 4px solid #409EFF;
}

.result-summary p {
  margin: 0;
  color: #303133;
  font-size: 14px;
}

.message-list {
  margin-bottom: 16px;
}

.message-item {
  padding: 12px;
  margin-bottom: 12px;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  background-color: #fafafa;
  transition: all 0.3s ease;
  cursor: pointer;
}

.message-item:hover {
  border-color: #409EFF;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
  background-color: #f0f9ff;
}

.message-item:active {
  transform: translateY(1px);
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.message-subject {
  font-weight: bold;
  color: #303133;
  font-size: 15px;
}

.message-status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  color: white;
  font-weight: 500;
}

.message-status.已办理 {
  background-color: #67C23A;
}

.message-status.办理中 {
  background-color: #409EFF;
}

.message-status.待回复 {
  background-color: #E6A23C;
}

.message-content {
  margin: 8px 0;
  color: #606266;
  font-size: 14px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
}

.message-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
}

.message-user {
  font-weight: 500;
  color: #409EFF;
}

.message-time {
  color: #c0c4cc;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid #e4e7ed;
}

/* 留言详情弹窗样式 */
.message-detail-content {
  padding: 20px;
}

.message-detail-content .el-descriptions {
  margin-bottom: 20px;
}

.reply-section,
.score-section {
  margin-top: 20px;
}

.reply-section h4,
.score-section h4 {
  margin-bottom: 15px;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}

.message-content-full,
.reply-content {
  white-space: pre-wrap;
  word-wrap: break-word;
  line-height: 1.6;
  color: #606266;
  background-color: #f8f9fa;
  padding: 12px;
  border-radius: 4px;
  border-left: 4px solid #409EFF;
}

.link-url {
  color: #409EFF;
  text-decoration: none;
  word-break: break-all;
}

.link-url:hover {
  text-decoration: underline;
}

body.dark .el-dialog__wrapper,
:root.dark .el-dialog__wrapper {
  background: rgba(0,0,0,0.7) !important;
}
body.dark .el-dialog,
:root.dark .el-dialog {
  background: #232323 !important;
  color: #fff !important;
  border-radius: 10px;
  border: 1px solid #333 !important;
}
body.dark .district-dialog-content,
:root.dark .district-dialog-content {
  background: #232323 !important;
  color: #fff !important;
}
body.dark .result-summary,
:root.dark .result-summary {
  background: #222 !important;
  color: #fff !important;
  border-left: 4px solid #ffd700 !important;
}
body.dark .message-item,
:root.dark .message-item {
  background: #181818 !important;
  border: 1px solid #444 !important;
  color: #fff !important;
}
body.dark .message-item:hover,
:root.dark .message-item:hover {
  background: #232323 !important;
  border-color: #ffd700 !important;
}
body.dark .message-header,
:root.dark .message-header {
  color: #fff !important;
}
body.dark .message-subject,
:root.dark .message-subject {
  color: #ffd700 !important;
}
body.dark .message-content,
:root.dark .message-content {
  color: #eee !important;
}
body.dark .message-footer,
:root.dark .message-footer {
  color: #aaa !important;
}
body.dark .message-user,
:root.dark .message-user {
  color: #8ecfff !important;
}
body.dark .message-time,
:root.dark .message-time {
  color: #888 !important;
}
body.dark .pagination-container,
:root.dark .pagination-container {
  border-top: 1px solid #444 !important;
}
body.dark .message-detail-content,
:root.dark .message-detail-content {
  background: #232323 !important;
  color: #fff !important;
}
body.dark .reply-section h4,
body.dark .score-section h4,
:root.dark .reply-section h4,
:root.dark .score-section h4 {
  color: #ffd700 !important;
}
body.dark .message-content-full,
body.dark .reply-content,
:root.dark .message-content-full,
:root.dark .reply-content {
  background: #181818 !important;
  color: #eee !important;
  border-left: 4px solid #ffd700 !important;
}
body.dark .stat-panel,
:root.dark .stat-panel {
  background: #181818 !important;
  border-right: 1px solid #222 !important;
}
body.dark .stat-card,
:root.dark .stat-card {
  background: #232323 !important;
  border: 1px solid #333 !important;
}
body.dark .card-header,
:root.dark .card-header {
  color: #ffd700 !important;
  border-bottom: 1px solid #333 !important;
}
body.dark .map-controls,
:root.dark .map-controls {
  background: rgba(30,30,30,0.95) !important;
  border: 1px solid #333 !important;
}
body.dark .el-pagination,
:root.dark .el-pagination {
  background: transparent !important;
  color: #fff !important;
}
</style>
