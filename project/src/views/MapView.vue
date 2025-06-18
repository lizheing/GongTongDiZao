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

// 地图相关
const mapContainer = ref<HTMLElement | null>(null)
const map = ref<Map | null>(null)
const featureSource = new VectorSource()

// 图表相关
const categoryChart = ref<HTMLElement | null>(null)
const domainChart = ref<HTMLElement | null>(null)
const districtChart = ref<HTMLElement | null>(null)
const satisfactionChart = ref<HTMLElement | null>(null)
const statusChart = ref<HTMLElement | null>(null)

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

// 修改矢量图层配置
const featureLayer = new VectorLayer({
  source: featureSource,
  style: function(feature) {
    const districtName = feature.get('name')  // 获取区域名称
    const color = districtColors[districtName] || '#CCCCCC'
    // 将颜色转换为rgba格式，添加0.6的透明度
    const rgba = color.match(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/) 
      ? `rgba(${parseInt(color.slice(1,3),16)}, ${parseInt(color.slice(3,5),16)}, ${parseInt(color.slice(5,7),16)}, 0.6)`
      : 'rgba(204, 204, 204, 0.6)'  // 默认颜色的透明版本
    return new Style({
      fill: new Fill({
        color: rgba
      }),
      stroke: new Stroke({
        color: '#666666',
        width: 1
      })
    })
  }
})

// 底图源
const osmSource = new OSM()
// 高德卫星图层
const amapSatelliteSource = new XYZ({
  url: 'https://webst0{1-4}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}',
  crossOrigin: 'anonymous'
})
// 高德路网图层
const amapRoadSource = new XYZ({
  url: 'https://webst0{1-4}.is.autonavi.com/appmaptile?style=8&x={x}&y={y}&z={z}',
  crossOrigin: 'anonymous'
})

// 底图图层
const osmLayer = new TileLayer({ source: osmSource, visible: true })
const amapSatelliteLayer = new TileLayer({ source: amapSatelliteSource, visible: false })
const amapRoadLayer = new TileLayer({ source: amapRoadSource, visible: false })

// 测量绘制图层
const measureSource = new VectorSource()
const measureLayer = new VectorLayer({
  source: measureSource,
  style: new Style({
    fill: new Fill({
      color: 'rgba(255, 255, 255, 0.2)'
    }),
    stroke: new Stroke({
      color: '#ffcc33',
      width: 2
    }),
    image: new CircleStyle({
      radius: 7,
      fill: new Fill({
        color: '#ffcc33'
      })
    })
  })
})

// 当前测量工具
let draw: Draw | null = null
let measureTooltipElement: HTMLElement | null = null
let measureTooltip: Overlay | null = null
let sketch: any = null
let listener: any = null

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

// 添加交互
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
  // 清除之前的测量
  if (draw && map.value) {
    map.value.removeInteraction(draw)
  }
  measureSource.clear()
  if (measureTooltip) {
    map.value?.removeOverlay(measureTooltip)
  }
  
  // 添加新的测量交互
  addInteraction(type)
}

// 停止测量
const stopMeasure = () => {
  // 移除绘图交互
  if (draw) {
    map.value?.removeInteraction(draw)
    draw = null
  }
  
  // 清除测量图层上的所有要素
  measureSource.clear()
  
  // 移除所有测量提示
  if (map.value) {
    const overlays = map.value.getOverlays().getArray()
    overlays.slice().forEach(overlay => {
      if (overlay.getElement()?.className.includes('ol-tooltip')) {
        map.value?.removeOverlay(overlay)
      }
    })
  }
  
  // 重置相关变量
  measureTooltipElement = null
  measureTooltip = null
  sketch = null
  if (listener) {
    unByKey(listener)
    listener = null
  }
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
        center: fromLonLat([114.3055, 30.5928]),
        zoom: 9,
        maxZoom: 19,
        minZoom: 4
      }),
      controls: defaultControls({
        zoom: true,
        attribution: false,
        rotate: false
      })
    })
    await loadMapData()
    await loadStats()
  }
})

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
</style>
