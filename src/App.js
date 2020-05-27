import React from 'react'
import Highcharts from 'highcharts/highstock'
import HighchartsReact from 'highcharts-react-official'
import activity from './activity.json'
import './App.css'

Highcharts.Pointer.prototype.reset = function () {
	return undefined
}

Highcharts.Point.prototype.highlight = function (event) {
	event = this.series.chart.pointer.normalize(event)
	this.onMouseOver() // Show the hover marker
	this.series.chart.tooltip.refresh(this) // Show the tooltip
	this.series.chart.xAxis[0].drawCrosshair(event, this) // Show the crosshair
}

function syncExtremes(e) {
	var thisChart = this.chart

	if (e.trigger !== 'syncExtremes') {
		// Prevent feedback loop
		Highcharts.each(Highcharts.charts, function (chart) {
			if (chart !== thisChart) {
				if (chart.xAxis[0].setExtremes) {
					// It is null while updating
					chart.xAxis[0].setExtremes(e.min, e.max, undefined, false, {
						trigger: 'syncExtremes',
					})
				}
			}
		})
	}
}
class App extends React.Component {
	componentDidMount() {
		;['mousemove', 'touchmove', 'touchstart'].forEach((eventType) => {
			document.getElementById('container').addEventListener(eventType, (e) => {
				var chart, point, i, event

				var points = []
				var hightlight = false
				for (i = 0; i < Highcharts.charts.length; i = i + 1) {
					chart = Highcharts.charts[i]
					// Find coordinates within the chart
					event = chart.pointer.normalize(e)
					// Get the hovered point
					point = chart.series[0].searchPoint(event, true)
					if (point) {
						if (point.dist <= 20) hightlight = true
						points.push(point)
					}
				}
				if (hightlight) {
					points.forEach((point) => point.highlight(e))
				} else {
					Highcharts.charts.forEach((chart) => chart.xAxis[0].hideCrosshair())
				}
			})
		})
	}
	render() {
		const optionsList = []

		activity.datasets.forEach((dataset, i) => {
			// Add X values
			dataset.data = Highcharts.map(dataset.data, (val, j) => {
				return [activity.xData[j] + 0.01 * i, val]
			})

			const data2 = Highcharts.map(activity.datasets[1].data, (val, j) => {
				return [activity.xData[j] + 0.01 * i, val / 100]
			})

			optionsList.push({
				chart: {
					marginLeft: 40, // Keep all charts left aligned
					spacingTop: 20,
					spacingBottom: 20,
				},
				title: {
					text: dataset.name,
					align: 'left',
					margin: 0,
					x: 30,
				},
				credits: {
					enabled: false,
				},
				legend: {
					enabled: false,
				},
				xAxis: [
					{
						crosshair: true,
						events: {
							setExtremes: syncExtremes,
						},
						labels: {
							format: '{value} km',
						},
					},
					{
						crosshair: true,
						visible: false,
					},
					{
						crosshair: false,
						visible: false,
					},
					// {
					// 	opposite: true,
					// 	crosshair: {
					// 		enabled: false,
					// 		label: {
					// 			enabled: true,
					// 			formatter: function (e) {
					// 				return "<div class='hair-content'>Good Idea</div><br/><div class='seperator'>-----------------</div><br/><div><b>Good Idea</b></div>"
					// 			},
					// 			padding: 8,
					// 			backgroundColor: 'red',
					// 			borderColor: 'black',
					// 		},
					// 	},
					// 	visible: false,
					// },
				],
				yAxis: {
					title: {
						text: null,
					},
				},
				tooltip: {
					positioner: function (labelWidth, labelHeight, point) {
						if (this.chart.hoverPoint.series.name === 'Extra') {
							console.log('label width', labelWidth, labelHeight, point)
							return {
								// right aligned
								x: point.plotX - 100 + 32,
								y: -10, // align to title
							}
						}
						return {
							// right aligned
							x: this.chart.chartWidth - this.label.width,
							y: 10, // align to title
						}
					},
					formatter: function () {
						if (this.point.series.name === 'Extra') {
							return "<div class='commits-tooltip'>" + this.point.x + '</div>'
						} else {
							return (
								"<div class='timeline-tooltip'>" + this.point.y + 'km/h</div>'
							)
						}
					},
					useHTML: true,
					borderWidth: 0,
					backgroundColor: 'none',
					pointFormat: '{point.y}',
					headerFormat: '',
					shadow: false,
					style: {
						fontSize: '18px',
					},
					animation: false,
					valueDecimals: dataset.valueDecimals,
				},
				series: [
					{
						xAxis: 0,
						data: dataset.data,
						name: dataset.name,
						type: dataset.type,
						color: Highcharts.getOptions().colors[i],
						fillOpacity: 0.3,
						tooltip: {
							valueSuffix: ' ' + dataset.unit,
						},
					},
					{
						xAxis: 2,
						data: data2,
						name: 'Extra2',
						type: 'line',
						color: Highcharts.getOptions().colors[i],
						fillOpacity: 0.3,
						tooltip: {
							valueSuffix: ' ' + dataset.unit,
						},
					},
				],
			})

			optionsList[0].series.push({
				xAxis: 1,
				data: [[0.001567, 0][(2, 0)], [3, 0], [4, 0], [5, 0], [6.397159, 0]],
				name: 'Extra',
				lineWidth: 0,
				marker: {
					enabled: true,
					radius: 3,
					symbol: 'circle',
					fillColor: 'red',
				},
				tooltip: {
					valueDecimals: 2,
				},
				states: {
					hover: {
						lineWidthPlus: 0,
					},
				},
			})
		})

		return (
			<div className='App'>
				<div id='container'>
					{optionsList.map((options) => (
						<HighchartsReact highcharts={Highcharts} options={options} />
					))}
				</div>
			</div>
		)
	}
}

export default App
