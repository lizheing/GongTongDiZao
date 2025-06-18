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
            <h3>满意度统计</h3>
          </div>
        </template>
        <div ref="satisfactionChart" class="chart"></div>
      </el-card>
    </div>

    <!-- 中间地图面板 -->
    <div class="map-panel">
      <div id="map" ref="mapContainer"></div>
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
import { fromLonLat } from 'ol/proj'
import { Draw, Modify, Snap } from 'ol/interaction'
import { Vector as VectorLayer } from 'ol/layer'
import { Vector as VectorSource } from 'ol/source'
import { Position, Aim, Delete } from '@element-plus/icons-vue'
import { ElButton, ElButtonGroup } from 'element-plus'
import axios from 'axios'
import GeoJSON from 'ol/format/GeoJSON'
import * as echarts from 'echarts'

const mapContainer = ref<HTMLElement | null>(null)
const map = ref<Map | null>(null)
const activeTool = ref<string>('')
const drawSource = new VectorSource()
const drawLayer = new VectorLayer({
  source: drawSource
})

// 空间数据源
const featureSource = new VectorSource()
const featureLayer = new VectorLayer({
  source: featureSource,
  style: {
    'fill-color': 'rgba(255, 255, 255, 0.6)',
    'stroke-color': '#319FD3',
    'stroke-width': 1
  }
})

// 图表相关
const categoryChart = ref<HTMLElement | null>(null)
const satisfactionChart = ref<HTMLElement | null>(null)
const districtChart = ref<HTMLElement | null>(null)
const statusChart = ref<HTMLElement | null>(null)

// 加载地图数据
const loadMapData = async () => {
  try {
    console.log('开始加载地图数据...');
    const response = await axios.get('http://localhost:3000/api/geo/wuhan');
    console.log('地图数据响应:', response.data);
    const features = new GeoJSON().readFeatures(response.data, {
      featureProjection: 'EPSG:3857'
    });
    console.log('解析后的地图要素:', features);
    featureSource.addFeatures(features);
  } catch (error) {
    console.error('加载地图数据失败:', error);
  }
}

// 加载统计数据
const loadStats = async () => {
  try {
    // 加载类别统计
    console.log('开始加载类别统计...');
    const categoryResponse = await axios.get('http://localhost:3000/api/stats/category');
    console.log('类别统计响应:', categoryResponse.data);
    initCategoryChart(categoryResponse.data);

    // 加载满意度统计
    console.log('开始加载满意度统计...');
    const satisfactionResponse = await axios.get('http://localhost:3000/api/stats/satisfaction');
    console.log('满意度统计响应:', satisfactionResponse.data);
    initSatisfactionChart(satisfactionResponse.data);

    // 加载区域统计
    console.log('开始加载区域统计...');
    const districtResponse = await axios.get('http://localhost:3000/api/stats/district');
    console.log('区域统计响应:', districtResponse.data);
    initDistrictChart(districtResponse.data);

    // 加载状态统计
    console.log('开始加载状态统计...');
    const statusResponse = await axios.get('http://localhost:3000/api/stats/status');
    console.log('状态统计响应:', statusResponse.data);
    initStatusChart(statusResponse.data);
  } catch (error) {
    console.error('加载统计数据失败:', error);
  }
}

// 初始化类别统计图表
const initCategoryChart = (data: any[]) => {
  if (!categoryChart.value) return
  const chart = echarts.init(categoryChart.value)
  chart.setOption({
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    series: [{
      type: 'pie',
      radius: '70%',
      data: data.map(item => ({
        name: item.category,
        value: item.message_count
      }))
    }]
  })
}

// 初始化满意度统计图表
const initSatisfactionChart = (data: any[]) => {
  if (!satisfactionChart.value) return
  const chart = echarts.init(satisfactionChart.value)
  chart.setOption({
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: data.map(item => item.satisfaction)
    },
    yAxis: {
      type: 'value'
    },
    series: [{
      type: 'bar',
      data: data.map(item => item.message_count)
    }]
  })
}

// 初始化区域统计图表
const initDistrictChart = (data: any[]) => {
  if (!districtChart.value) return
  const chart = echarts.init(districtChart.value)
  chart.setOption({
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: data.map(item => item.district_name)
    },
    yAxis: {
      type: 'value'
    },
    series: [{
      type: 'bar',
      data: data.map(item => item.message_count)
    }]
  })
}

// 初始化状态统计图表
const initStatusChart = (data: any[]) => {
  if (!statusChart.value) return
  const chart = echarts.init(statusChart.value)
  chart.setOption({
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    series: [{
      type: 'pie',
      radius: '70%',
      data: data.map(item => ({
        name: item.status,
        value: item.message_count
      }))
    }]
  })
}

onMounted(async () => {
  if (mapContainer.value) {
    map.value = new Map({
      target: mapContainer.value,
      layers: [
        new TileLayer({
          source: new OSM()
        }),
        featureLayer,
        drawLayer
      ],
      view: new View({
        center: fromLonLat([114.3055, 30.5928]), // 武汉市中心坐标
        zoom: 10
      })
    })

    // 加载数据
    await loadMapData()
    await loadStats()
  }
})

const measureDistance = () => {
  if (!map.value) return
  activeTool.value = 'distance'
  const draw = new Draw({
    source: drawSource,
    type: 'LineString'
  })
  map.value.addInteraction(draw)
}

const measureArea = () => {
  if (!map.value) return
  activeTool.value = 'area'
  const draw = new Draw({
    source: drawSource,
    type: 'Polygon'
  })
  map.value.addInteraction(draw)
}

const clearMeasurements = () => {
  if (!map.value) return
  drawSource.clear()
  activeTool.value = ''
  map.value.getInteractions().forEach(interaction => {
    if (interaction instanceof Draw) {
      map.value?.removeInteraction(interaction)
    }
  })
}

onUnmounted(() => {
  if (map.value) {
    map.value.setTarget(undefined)
  }
})
</script>

<style scoped>
.dashboard-container {
  display: flex;
  height: 100%;
  width: 100%;
}

.stat-panel {
  width: 300px;
  padding: 20px;
  background-color: #f5f7fa;
  overflow-y: auto;
}

.map-panel {
  flex: 1;
  position: relative;
}

#map {
  width: 100%;
  height: 100%;
}

.stat-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart {
  height: 300px;
  width: 100%;
}

h3 {
  margin: 0;
  color: #409EFF;
}
</style> 