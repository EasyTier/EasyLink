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
const { currentNetworkInfoData, isCurrentNetworkRunning } = storeToRefs(networkStore)

const xAxisData = ref<string[]>([])
const seriesData = ref<LineSeriesOption[]>([])
const need = ['rx', 'tx']
watch(currentNetworkInfoData, (n) => {
  const now = new Date()
  const nowTime = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`
  xAxisData.value.push(nowTime)

  need.forEach((k) => {
    let tmp = 0
    n.forEach((d) => {
      // @ts-expect-error key
      tmp += d[k] || 0
    })

    const i = seriesData.value.findIndex(d => d.name === k)
    if (i >= 0) {
      seriesData.value[i].data!.push(tmp)
      if (seriesData.value[i].data!.length > stack.value)
        seriesData.value[i].data!.shift()
    }
    else {
      const nullArr: any[] = Array.from({ length: xAxisData.value.length }).fill(null)
      seriesData.value.push({
        name: k,
        type: 'line',
        stack: 'Total',
        smooth: true,
        data: [...nullArr, tmp],
      })
    }
  })

  if (xAxisData.value.length > stack.value)
    xAxisData.value.shift()
})

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
    series: seriesData.value,
  }
})
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
