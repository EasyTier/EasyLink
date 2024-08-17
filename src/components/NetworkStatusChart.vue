<script setup lang="ts">
import { hostname } from '@tauri-apps/plugin-os'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { BarChart, GraphChart, LineChart } from 'echarts/charts'
import type {
  AxisPointerComponentOption,
  GridComponentOption,
  LegendComponentOption,
  TooltipComponentOption,
} from 'echarts/components'
import {
  GridComponent,
  LegendComponent,
  TooltipComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import type { ComposeOption } from 'echarts/core'
import type { BarSeriesOption, LineSeriesOption } from 'echarts/charts'

const props = defineProps<{
  stack?: number
}>()

use([GridComponent, TooltipComponent, LegendComponent, GraphChart, LineChart, BarChart, CanvasRenderer])

type BaseEChartsOption = ComposeOption<
  | TooltipComponentOption
  | LegendComponentOption
  | GridComponentOption
  | LineSeriesOption
  | BarSeriesOption
  | AxisPointerComponentOption
>

const deviceName = ref('')
const stack = computed(() => props.stack || 30)

const networkStore = useNetworkStore()
const appStore = useAppStore()

const { isDark } = storeToRefs(appStore)
const { currentNetworkInfoDataStack, networkCurrentId, currentNetworkInfo, currentNetwork } = storeToRefs(networkStore)

const xAxisData = ref<(string | null)[]>([])
const rxLineData = ref<(number | null)[]>([])
const txLineData = ref<(number | null)[]>([])
const peerSumLineData = ref<(number | null)[]>([])

const graphData = ref<{
  nodes: { id: string, name: string, value: string, symbolSize?: number }[]
  links: { source: string, target: string }[]
  categories?: { name: string }[]
}>({
  nodes: [],
  links: [],
})

const last = ref<{
  nodes: string[]
  ip: string | null
  ipIsEmpty: number
}>({
  nodes: [],
  ip: null,
  ipIsEmpty: 0,
})

const baseOption = computed<BaseEChartsOption>(() => {
  return {
    backgroundColor: '',
    tooltip: {
      trigger: 'axis',
      // formatter: (params: any) => {
      //   console.log(params)
      //   return `${params[0].seriesName}: ${humanFileSize(Number(params[0].data)) || '0 B'}/s<br /> ${params[1].seriesName}: ${humanFileSize(Number(params[1].data)) || '0 B'}/s<br /> ${params[2].seriesName}: ${params[2].data}`
      // },
    },
    legend: {},
    grid: {
      left: '2%',
      right: '2%',
      bottom: '2%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: xAxisData.value,
    },
    yAxis: [
      {
        type: 'value',
        name: 'traffic',
        axisLabel: {
          alignTicks: true,
          show: true,
          formatter: (data) => {
            return humanFileSize(Number(data)) || '0 B'
          },
        },
      },
      // {
      //   type: 'log',
      //   logBase: 5,
      //   min: 0,
      //   max: 255,
      //   interval: [1, 50, 150, 250],
      //   name: 'peers',
      //   position: 'right',
      //   axisLine: {
      //     show: true,
      //   },
      // },
    ],
    series: [
      {
        name: 'rx',
        type: 'line',
        smooth: true,
        data: rxLineData.value,
      },
      {
        name: 'tx',
        type: 'line',
        smooth: true,
        data: txLineData.value,
      },
      // {
      //   name: 'device',
      //   type: 'bar',
      //   link: {
      //     yAxisIndex: 1,
      //   },
      //   smooth: true,
      //   data: peerSumLineData.value,
      // },
    ],
  }
})

onMounted(async () => {
  deviceName.value = await hostname() || ''
})

function updateBaseChartData() {
  let needStack = currentNetworkInfoDataStack.value.slice(-stack.value)

  const xAxisTemp: (string | null)[] = []
  const rxLineDataTemp: (number | null)[] = []
  const txLineDataTemp: (number | null)[] = []
  const peerSumLineDataTemp: (number | null)[] = []

  if (xAxisData.value.length > 0) {
    const lastTimeIndex = needStack.findIndex(d => d.time === xAxisData.value[xAxisData.value.length - 1])
    needStack = (lastTimeIndex !== -1 && lastTimeIndex < needStack.length - 1) ? needStack.slice((needStack.length - 1 - lastTimeIndex) * -1) : []
  }

  needStack.forEach((s) => {
    xAxisTemp.push(s.time)
    const prp = peerRoutePairToStatusData(s.peerRoutePair)
    rxLineDataTemp.push(prp.reduce((sum, d) => {
      return sum += d.rx || 0
    }, 0))
    txLineDataTemp.push(prp.reduce((sum, d) => {
      return sum += d.tx || 0
    }, 0))
    peerSumLineDataTemp.push(s.peerRoutePair.length)
  })

  xAxisData.value.push(...xAxisTemp)
  rxLineData.value.push(...rxLineDataTemp)
  txLineData.value.push(...txLineDataTemp)
  peerSumLineData.value.push(...peerSumLineDataTemp)

  if (xAxisData.value.length > stack.value) {
    xAxisData.value.shift()
    rxLineData.value.shift()
    txLineData.value.shift()
    peerSumLineData.value.shift()
  }
}

function updateTopologyChartData() {
  if (currentNetworkInfo.value) {
    const routeNodes = currentNetworkInfo.value.routes.map(d => d.peer_id.toString())
    const ip = currentNetworkInfo.value.node.virtual_ipv4
    if (JSON.stringify(last.value.nodes.sort()) !== JSON.stringify(routeNodes.sort()) && last.value.ip !== ip && last.value.ipIsEmpty < 10) {
      const nodesTemp: { id: string, name: string, value: string, symbolSize?: number }[] = []
      const linksTemp: { source: string, target: string }[] = []
      // const categoryTemp: (string | null)[] = []
      nodesTemp.push({
        // id: c.peer_id.toString(),
        id: ip,
        name: currentNetwork.value?.config.deviceName || deviceName.value,
        symbolSize: 45,
        value: ip,
      })
      currentNetworkInfo.value.routes.forEach((c) => {
        nodesTemp.push({
          // id: c.peer_id.toString(),
          id: c.ipv4_addr,
          name: c.hostname,
          symbolSize: 30,
          value: c.ipv4_addr,
        })

        if (ip) {
          linksTemp.push({
            source: ip,
            target: c.ipv4_addr,
          })
        }
      })
      graphData.value.nodes = nodesTemp
      graphData.value.links = linksTemp
      last.value.ip = ip
      last.value.nodes = routeNodes

      if (last.value.ip === '')
        last.value.ipIsEmpty += 1
    }
  }
}

watch(networkCurrentId, () => {
  xAxisData.value = []
  rxLineData.value = []
  txLineData.value = []
  graphData.value = { nodes: [], links: [] }
  updateBaseChartData()
  updateTopologyChartData()
})

watch(currentNetworkInfoDataStack, () => {
  updateBaseChartData()
  updateTopologyChartData()
}, { immediate: true, deep: true })
</script>

<template>
  <n-flex w-full>
    <VChart v-if="currentNetworkInfoDataStack" :theme="isDark ? 'dark' : undefined" class="chart" autoresize :option="baseOption" />
  </n-flex>
</template>

<style scoped lang="postcss">
.chart {
  height: 50vh;
  @apply 50vh;
}
</style>
