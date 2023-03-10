import React, { useEffect, useRef, useState } from "react";
import "./ChartsDashlet.scss";
// @ts-ignore
import { init } from "echarts";
// @ts-ignore
import type { ECharts } from "echarts";
import { FilteredItemType, FiltersType, IMyServiceModel, MyService } from "../services/MyService";

const COOB_ID = "luxmsbi.custom_2_pro_org";

const ChartsDashlet = () => {
  const service = MyService.createInstance(COOB_ID);
  
  const [data, setData] = useState({
    variant: "chart", 
    chart: "line", 
    isLoading: false, 
    filteredData: [] as Array<FilteredItemType>,
    filters: {cod: [], orgName: []} as FiltersType,
  });

  const serviceHandler = (value: IMyServiceModel) => {
    setData({
      variant: value.variant, 
      chart: value.chart, 
      isLoading: value?.loading || false, 
      filteredData: value.filteredData,
      filters: value.dataFilters,
    });
  };

  const titlesHandler = () => {
    return data.filters.orgName.map(item => item.slice(0, 4) + ".");
  };

  const chartDataHandler = (chart: string) => {
    const dataHandler = (cod: string) => {
      let rResult = [] as Array<number>;

      for(let i = 0; i < data.filters.orgName.length; i++) {
        let item = data.filteredData.find(el => ((el.code_finance === cod) && (el.org_name === data.filters.orgName[i])));
        
        if (!!item) {
          rResult.push(item.r);
        }
      }
      return rResult;
    };

    let dataResult = [] as Array<any>;

    if (chart === "line") {
      if (data.filters.cod.includes("Соц.Финанс.")) {
        dataResult.push({
            name: 'Соц.Финанс.',
            type: 'line',
            stack: 'Total',
            areaStyle: {},
            emphasis: {
              focus: 'series'
            },
            data: dataHandler("Соц.Финанс.")
          });
      }
      if (data.filters.cod.includes("прочие")) {
        dataResult.push({
          name: 'Прочие',
          type: 'line',
          stack: 'Total',
          areaStyle: {},
          emphasis: {
            focus: 'series'
          },
          data: dataHandler("прочие")
        });
      }
    } else {
      if (data.filters.cod.includes("Соц.Финанс.")) {
        dataResult.push({
          name: 'Соц.Финанс.',
          data: dataHandler("Соц.Финанс."),
          type: 'bar',
          showBackground: true,
          backgroundStyle: {
            color: 'rgba(180, 180, 180, 0.2)'
          }
        });
      }
      if (data.filters.cod.includes("прочие")) {
        dataResult.push({
          name: 'Прочие',
          data: dataHandler("прочие"),
          type: 'bar',
          showBackground: true,
          backgroundStyle: {
            color: 'rgba(180, 180, 180, 0.2)'
          }
        });
      }
    }

    return dataResult;
  };

  useEffect(() => {
    // @ts-ignore
    service.subscribeUpdatesAndNotify(serviceHandler);
  }, []);

  const lineChartRef = useRef<HTMLDivElement>(null); 
  const barChartRef = useRef<HTMLDivElement>(null); 

  useEffect(() => {
    let linesChart: ECharts | undefined;
    if (lineChartRef.current !== null) {
      linesChart = init(lineChartRef.current);
      linesChart.setOption({
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#6a7985'
            }
          }
        },
        legend: {},
        toolbox: {
          feature: {
            saveAsImage: {}
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [
          {
            type: 'category',
            boundaryGap: false,
            data: titlesHandler(),
          }
        ],
        yAxis: [
          {
            type: 'value'
          }
        ],
        series: chartDataHandler("line")
      });
    }

    return () => {
      linesChart?.dispose();
    };
  }, [lineChartRef.current, titlesHandler, chartDataHandler]);

  useEffect(() => {
    let barChart: ECharts | undefined;
    if (barChartRef.current !== null) {
      barChart = init(barChartRef.current);
      barChart.setOption({
        legend: {},
        xAxis: {
          type: 'category',
          data: titlesHandler()
        },
        yAxis: {
          type: 'value',
          boundaryGap: [0, 0.01]
        },
        series: chartDataHandler("bar")
      });
    }

    return () => {
      barChart?.dispose();
    };
  }, [barChartRef.current, chartDataHandler, titlesHandler]);

  return (
    <div className="ChartsDashlet">
      <h2>{data.variant === "chart" ? "График": "Таблица"}</h2>
      {(data.variant === "chart") && (data.chart === "line") && <div ref={lineChartRef} className="ChartsDashlet__chart" />}
      {(data.variant === "chart") && (data.chart === "bar") && <div ref={barChartRef} className="ChartsDashlet__chart" />}
      {data.variant === "table" && <div className="ChartsDashlet__table">
        <div className="ChartsDashlet__table-row">
          <div className="ChartsDashlet__table-row-cell ChartsDashlet__table-row-cell_header"/>
          {data.filters.cod.includes("прочие") && <div className="ChartsDashlet__table-row-cell ChartsDashlet__table-row-cell_header">
            Прочие</div>}
          {data.filters.cod.includes("Соц.Финанс.") && <div className="ChartsDashlet__table-row-cell ChartsDashlet__table-row-cell_header">
            Соц.Финанс.</div>}
        </div>
        {data.filters.orgName.map(item => (<div className="ChartsDashlet__table-row">
          <div className="ChartsDashlet__table-row-cell ChartsDashlet__table-row-cell_header">
            {item}
          </div>
          {data.filters.cod.includes("прочие") && <div className="ChartsDashlet__table-row-cell">
            {data.filteredData.find(el => el.code_finance === "прочие" && el.org_name === item)?.r}</div>}
          {data.filters.cod.includes("Соц.Финанс.") && <div className="ChartsDashlet__table-row-cell">
            {data.filteredData.find(el => el.code_finance === "Соц.Финанс." && el.org_name === item)?.r}</div>}
        </div>))}
      </div>}
    </div>
  );
};

export default ChartsDashlet;
