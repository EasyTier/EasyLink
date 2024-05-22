<script setup lang="ts">
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { BarChart, LineChart } from 'echarts/charts'
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

const stack = computed(() => props.stack || 30)

use([GridComponent, TooltipComponent, LegendComponent, LineChart, BarChart, CanvasRenderer])

type EChartsOption = ComposeOption<
  | TooltipComponentOption
  | LegendComponentOption
  | GridComponentOption
  | LineSeriesOption
  | BarSeriesOption
  | AxisPointerComponentOption
>

const networkStore = useNetworkStore()
const appStore = useAppStore()

const { isDark } = storeToRefs(appStore)
const { currentNetworkInfoDataStack, networkCurrentId } = storeToRefs(networkStore)

const xAxisData = ref<(string | null)[]>([])
const rxLineData = ref<(number | null)[]>([])
const txLineData = ref<(number | null)[]>([])
const peerSumLineData = ref<(number | null)[]>([])

const option = computed<EChartsOption>(() => {
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
      {
        type: 'log',
        logBase: 5,
        min: 0,
        max: 255,
        interval: [1, 50, 150, 250],
        name: 'peers',
        position: 'right',
        axisLine: {
          show: true,
        },
      },
    ],
    series: [
      {
        name: 'rx',
        type: 'line',
        stack: 'Total',
        smooth: true,
        data: rxLineData.value,
      },
      {
        name: 'tx',
        type: 'line',
        stack: 'Total',
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

function updateChartData() {
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

watch(networkCurrentId, () => {
  xAxisData.value = []
  rxLineData.value = []
  txLineData.value = []
  updateChartData()
})

watch(currentNetworkInfoDataStack, () => {
  updateChartData()
}, { immediate: true, deep: true })
</script>

<template>
  <n-flex w-full>
    <n-tabs type="line" animated>
      <n-tab-pane v-if="currentNetworkInfoDataStack" name="base" tab="base">
        <VChart :theme="isDark ? 'dark' : undefined" class="chart" autoresize :option="option" />
      </n-tab-pane>
      <n-tab-pane name="topology" tab="topology">
        <!-- TODO: -->
      </n-tab-pane>
    </n-tabs>
  </n-flex>
</template>

<style scoped lang="postcss">
.chart {
  height: 50vh;
  @apply 50vh;
}
</style>
