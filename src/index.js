import { init } from 'klinecharts'
import './index.css'

function genData (timestamp = new Date().getTime(), length = 800) {
  let basePrice = 5000
  timestamp = Math.floor(timestamp / 1000 / 60) * 60 * 1000 - length * 60 * 1000
  const dataList = []
  for (let i = 0; i < length; i++) {
    const prices = []
    for (let j = 0; j < 4; j++) {
      prices.push(basePrice + Math.random() * 60 - 30)
    }
    prices.sort()
    const open = +(prices[Math.round(Math.random() * 3)].toFixed(2))
    const high = +(prices[3].toFixed(2))
    const low = +(prices[0].toFixed(2))
    const close = +(prices[Math.round(Math.random() * 3)].toFixed(2))
    const volume = Math.round(Math.random() * 100) + 10
    const turnover = (open + high + low + close) / 4 * volume
    dataList.push({ timestamp, open, high,low, close, volume, turnover })

    basePrice = close
    timestamp += 60 * 1000
  }
  return dataList
}

const chart = init('k-line-chart')
chart.applyNewData(genData())

// Apply dark theme styling to match the screenshot
chart.setStyles({
  candle: {
    type: 'candle_solid',
    bar: {
      upColor: '#26A69A',
      downColor: '#EF5350',
      upBorderColor: '#26A69A',
      downBorderColor: '#EF5350',
      upWickColor: '#26A69A',
      downWickColor: '#EF5350'
    },
    priceMark: {
      show: true,
      high: {
        show: true,
        color: '#D9D9D9'
      },
      low: {
        show: true,
        color: '#D9D9D9'
      },
      last: {
        show: true,
        upColor: '#26A69A',
        downColor: '#EF5350',
        noChangeColor: '#888888',
        line: {
          show: true,
          style: 'dashed',
          dashedValue: [4, 4],
          size: 1
        },
        text: {
          show: true,
          color: '#FFFFFF',
          size: 12
        }
      }
    },
    tooltip: {
      text: {
        color: '#D9D9D9'
      }
    }
  },
  grid: {
    show: true,
    horizontal: {
      show: true,
      size: 1,
      color: 'rgba(255, 255, 255, 0.06)',
      style: 'dashed',
      dashedValue: [2, 2]
    },
    vertical: {
      show: true,
      size: 1,
      color: 'rgba(255, 255, 255, 0.06)',
      style: 'dashed',
      dashedValue: [2, 2]
    }
  },
  xAxis: {
    axisLine: {
      show: true,
      color: 'rgba(255, 255, 255, 0.1)'
    },
    tickLine: {
      show: true,
      color: 'rgba(255, 255, 255, 0.1)'
    },
    tickText: {
      show: true,
      color: '#929AA5'
    }
  },
  yAxis: {
    axisLine: {
      show: true,
      color: 'rgba(255, 255, 255, 0.1)'
    },
    tickLine: {
      show: true,
      color: 'rgba(255, 255, 255, 0.1)'
    },
    tickText: {
      show: true,
      color: '#929AA5'
    }
  },
  separator: {
    size: 1,
    color: 'rgba(255, 255, 255, 0.1)'
  },
  crosshair: {
    show: true,
    horizontal: {
      show: true,
      line: {
        show: true,
        style: 'dashed',
        dashedValue: [4, 2],
        size: 1,
        color: 'rgba(255, 255, 255, 0.2)'
      },
      text: {
        show: true,
        color: '#FFFFFF',
        backgroundColor: '#505050'
      }
    },
    vertical: {
      show: true,
      line: {
        show: true,
        style: 'dashed',
        dashedValue: [4, 2],
        size: 1,
        color: 'rgba(255, 255, 255, 0.2)'
      },
      text: {
        show: true,
        color: '#FFFFFF',
        backgroundColor: '#505050'
      }
    }
  },
  overlay: {
    line: {
      color: '#1677FF'
    },
    text: {
      color: '#FFFFFF'
    }
  }
})

// --- Interactive horizontal level lines on Y-axis click ---
// Stores overlay IDs mapped by their rounded price value for toggle behavior
const levelLines = new Map()
const PRICE_SNAP_THRESHOLD = 5 // price units threshold for "close enough" to remove

const yAxisDom = chart.getDom('candle_pane', 'yAxis')

if (yAxisDom) {
  yAxisDom.style.cursor = 'pointer'

  yAxisDom.addEventListener('click', function (e) {
    const rect = yAxisDom.getBoundingClientRect()
    const y = e.clientY - rect.top

    // Convert the y-pixel coordinate to a price value
    const point = chart.convertFromPixel(
      { x: 0, y: y },
      { paneId: 'candle_pane' }
    )

    if (point && point.value != null) {
      const clickedPrice = Math.round(point.value)

      // Check if there's an existing line close to this price
      let existingKey = null
      for (const [price] of levelLines) {
        if (Math.abs(price - clickedPrice) <= PRICE_SNAP_THRESHOLD) {
          existingKey = price
          break
        }
      }

      if (existingKey !== null) {
        // Remove the existing line (toggle off)
        const overlayId = levelLines.get(existingKey)
        chart.removeOverlay({ id: overlayId })
        levelLines.delete(existingKey)
      } else {
        // Create a new horizontal line at the clicked price level
        const overlayIds = chart.createOverlay({
          name: 'horizontalStraightLine',
          points: [{ value: clickedPrice }],
          styles: {
            line: {
              style: 'dashed',
              dashedValue: [6, 4],
              size: 1,
              color: '#2196F3'
            }
          },
          lock: true
        })

        if (overlayIds) {
          const id = Array.isArray(overlayIds) ? overlayIds[0] : overlayIds
          if (id) {
            levelLines.set(clickedPrice, id)
          }
        }
      }
    }
  })
}

function setType (type) {
  chart.setStyles({
    candle: { type }
  })
}

// The following is only for the purpose of assisting in code demonstration, and adjustments will be made according to the actual situation in the project.
const container = document.getElementById('container')
const buttonContainer = document.createElement('div')
buttonContainer.className = 'button-container'
const items = [
  { key: 'candle_solid', text: 'All solid' },
  { key: 'candle_stroke', text: 'All stroke' },
  { key: 'candle_up_stroke', text: 'Up stroke' },
  { key: 'candle_down_stroke', text: 'Down stroke' },
  { key: 'ohlc', text: 'OHLC' },
  { key: 'area', text: 'Area' }
]
items.forEach(({ key, text }) => {
  const button = document.createElement('button')
  button.innerText = text
  button.addEventListener('click', () => { setType(key) })
  buttonContainer.appendChild(button)
})

// Add a "Clear Lines" button
const clearButton = document.createElement('button')
clearButton.innerText = 'Clear Lines'
clearButton.style.backgroundColor = '#EF5350'
clearButton.addEventListener('click', () => {
  chart.removeOverlay({ name: 'horizontalStraightLine' })
  levelLines.clear()
})
buttonContainer.appendChild(clearButton)

container.appendChild(buttonContainer)
