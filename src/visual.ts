import powerbi from "powerbi-visuals-api";
import "./../style/visual.less";

import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import IVisualEventService = powerbi.extensibility.IVisualEventService;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import DataView = powerbi.DataView;
import * as d3 from 'd3';

export class Visual implements IVisual {
  private events: IVisualEventService;
  private target: HTMLElement;
  private host: any;
  private svg: d3.Selection<SVGSVGElement, any, any, any>;
  private metricNames = ['IP/1000', 'Readmission %', 'ED/1000', 'Avoidable ED %', 'SNF/1000', 'High Tech/1000'];

  constructor(options: VisualConstructorOptions) {
    this.events = options.host.eventService;
    this.target = options.element;
    this.host = options.host;
    this.svg = d3
      .select<SVGSVGElement, any>(document.createElementNS('http://www.w3.org/2000/svg', 'svg'))
      .classed('customD3Visual', true);

    this.target.appendChild(this.svg.node());
  }

  public update(options: VisualUpdateOptions) {
    const dataView: DataView = options.dataViews[0];

    const categorical = dataView.categorical;
    const categoryData = categorical.categories[0].values.map(String); // Assuming category data is strings

    // Logic for Y-axis
    const yAxisFields = [''].concat(this.metricNames); // Adding an empty entry at the start

    // Logic for X-axis
    const xAxisLabels = ['5', '25', '50', '75', '90', '95'];

    const width: number = options.viewport.width;
    const height: number = options.viewport.height;
    const margin = { top: 20, right: 20, bottom: 30, left: 80 };

    this.svg.attr('width', width).attr('height', height);

    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;
    

    const xScale = d3.scaleBand()
      .domain(xAxisLabels)
      .range([margin.left, chartWidth + margin.left]);

    const yScale = d3.scaleBand()
      .domain(yAxisFields)
      .range([margin.top, chartHeight + margin.top])
      .padding(0.1);

    const xAxis = d3.axisBottom(xScale);
    this.svg.selectAll('.x-axis').remove();
    this.svg
      .append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${chartHeight + margin.top})`)
      .call(xAxis)
      .selectAll('line')
      .style('stroke', 'black');

      

    const yAxis = d3.axisLeft(yScale);
    this.svg.selectAll('.y-axis').remove();
    this.svg
      .append('g')
      .attr('class', 'y-axis')
      .attr('transform', `translate(${margin.left},${margin.top})`)
      .call(yAxis)
      .selectAll('text')
      .style('fill', 'black');

    const barData = [
      { start: '5', end: '25', color: 'rgb(255,181,8)' },
      { start: '25', end: '50', color: 'rgb(253,209,110)' },
      { start: '50', end: '75', color: 'rgb(251,230,187)' },
      { start: '75', end: '90', color: 'rgb(142,203,143)' },
      { start: '90', end: '95', color: 'rgb(101,188,111)' }
    ];

    yAxisFields.forEach((metric, i) => {
      const bars = this.svg.selectAll(`.bar-${i}`).data(barData);

      bars.enter()
        .append('rect')
        .attr('class', `bar-${i}`)
        .attr('x', d => xScale(d.start) || 0)
        .attr('y', yScale(metric) || 0)
        .attr('width', d => (xScale(d.end) || 0) - (xScale(d.start) || 0))
        .attr('height', yScale.bandwidth()*0.7)
        .attr('fill', d => d.color);
    });
  }
}
