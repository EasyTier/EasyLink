<script setup lang="ts">
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { LineChart } from 'echarts/charts'
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import type { ComposeOption } from 'echarts/core'
import type { LineSeriesOption } from 'echarts/charts'
import type { GridComponentOption } from 'echarts/components'

const props = defineProps<{
  stack?: number
}>()

const stack = computed(() => props.stack || 30)

use([GridComponent, TooltipComponent, LegendComponent, LineChart, CanvasRenderer])

type EChartsOption = ComposeOption<GridComponentOption | LineSeriesOption>

const networkStore = useNetworkStore()
const appStore = useAppStore()

const { isDark } = storeToRefs(appStore)
const { isCurrentNetworkRunning, currentNetworkInfoDataStack, networkCurrentId } = storeToRefs(networkStore)

const xAxisData = ref<string[]>([])
const rxLineData = ref<(number | null)[]>([])
const txLineData = ref<(number | null)[]>([])

const option = computed<EChartsOption>(() => {
  return {
    backgroundColor: '',
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        return `${params[0].seriesName}: ${humanFileSize(Number(params[0].data)) || '0 B'}/s<br /> ${params[1].seriesName}: ${humanFileSize(Number(params[1].data)) || '0 B'}/s`
      },
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
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: (data) => {
          return humanFileSize(Number(data)) || '0 B'
        },
      },
    },
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
    ],
  }
})

function updateChartData() {
  const needStack = currentNetworkInfoDataStack.value.slice(-stack.value)

  if (xAxisData.value.length === 0) {
    xAxisData.value = currentNetworkInfoDataStack.value.slice(-stack.value).map(d => d.time)
    rxLineData.value = needStack.map((s) => {
      return s.data.reduce((sum, d) => {
        return sum += d.rx || 0
      }, 0)
    })
    txLineData.value = needStack.map((s) => {
      return s.data.reduce((sum, d) => {
        return sum += d.tx || 0
      }, 0)
    })
  }
  else {
    const lastTime = xAxisData.value[xAxisData.value.length - 1]

    const lastTimeIndex = needStack.findIndex(d => d.time === lastTime)

    if (lastTimeIndex !== -1 && lastTimeIndex < needStack.length - 1) {
      xAxisData.value.push(...needStack.slice((needStack.length - 1 - lastTimeIndex) * -1).map(d => d.time))
      rxLineData.value.push(...needStack.slice((needStack.length - 1 - lastTimeIndex) * -1).map((s) => {
        return s.data.reduce((sum, d) => {
          return sum += d.rx || 0
        }, 0)
      }))
      txLineData.value.push(...needStack.slice((needStack.length - 1 - lastTimeIndex) * -1).map((s) => {
        return s.data.reduce((sum, d) => {
          return sum += d.tx || 0
        }, 0)
      }))
    }
  }

  if (xAxisData.value.length > stack.value) {
    xAxisData.value.shift()
    rxLineData.value.shift()
    txLineData.value.shift()
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
  <n-flex v-if="isCurrentNetworkRunning" w-full>
    <VChart :theme="isDark ? 'dark' : undefined" class="chart" autoresize :option="option" />
  </n-flex>
</template>

<style scoped lang="postcss">
.chart {
  height: 50vh;
  @apply 50vh;
}
</style>
