import React, { useEffect, useState } from "react";
import { ChartType, IMyServiceModel, MyService, VariantType } from "../services/MyService";
import "./FiltersDashlet.scss";

const COOB_ID = "luxmsbi.custom_2_pro_org";
const ORG_NAME = ["Инфекционное", "Кардиология", "Косметология", "ЛОР", "Онкология", "Родильное", "Стоматология", "Терапевтическое", "Хирургия"];

const FiltersDashlet = () => {
  const service = MyService.createInstance(COOB_ID);

  const [variant, setVariant] = useState("table");
  const [chart, setChart] = useState("line");
  const [filter, setFilter] = useState<{cod: Array<string>, orgName: Array<string>}>({
    cod: ["прочие", "Соц.Финанс."], 
    orgName: ["Инфекционное", "Кардиология", "Косметология", "ЛОР", "Онкология", "Родильное", "Стоматология", "Терапевтическое", "Хирургия"]
  });

  const variantChangeHandler = (variant: VariantType) => {
    setVariant(variant);
    service.changeVariant(variant);
  };

  const chartChangeHandler = (chart: ChartType) => {
    setChart(chart);
    service.changeChart(chart);
  };

  const onFilterChangeHandler = (filterField: "cod" | "orgName", value: string) => {
    if (filter[filterField].includes(value)) {
      setFilter(prev => ({...prev, [filterField]: prev[filterField].filter(item => item !== value)}));
    } else {
      setFilter(prev => ({...prev, [filterField]: [...filter[filterField], value]}));
    }
  };

  const getDataByFilter = async () => {
    const result = await service.getKoobDataByCfg({
      with: COOB_ID,
      columns: ["code_finance", "org_name", "sum(value):r"],
      filters: {
        code_finance: ["=", ...filter.cod],
        name: ["!="],
        org_name: ["=", ...filter.orgName]
      },
    });
    service.changeFilteredDataAndFilters(result, filter);
  };

  useEffect(() => {
    getDataByFilter();
  }, [filter]);

  useEffect(() => {
    if (!!service) {
      // @ts-ignore
      const result: IMyServiceModel = service.getModel();
      setVariant(result?.variant);
      setChart(result?.chart);
    }
  }, [service]);

  return (
    <div className="FiltersDashlet">
      <h2>Фильтр</h2>
      <div  className="FiltersDashlet__block">
      <fieldset id="variant-block" className="FiltersDashlet__block-variant">
        <legend>Выберите вариант отображения данных:</legend>
        <div>
          <input type="radio" id="table" name="variant-block" value="table" checked={variant === "table"} onChange={() => {
            variantChangeHandler("table")
            }} />
          <label htmlFor="huey" className="FiltersDashlet__block-variant-label">Таблица</label>
        </div>

        <div>
          <input type="radio" id="chart" name="variant-block" value="chart" checked={variant === "chart"} onChange={() => {
            variantChangeHandler("chart")
            }} />
          <label htmlFor="chart" className="FiltersDashlet__block-variant-label">График</label>
        </div>
      </fieldset>
      </div>
      
      <div  className="FiltersDashlet__block">
      <fieldset id="chart-block" className="FiltersDashlet__block-chart">
        <legend>Выберите вариант отображения графика:</legend>

        <div>
          <input type="radio" id="line" name="chart-block" value="line" checked={chart === "line"} onChange={() => {
            chartChangeHandler("line")
            }} />
          <label htmlFor="line" className="FiltersDashlet__block-chart-label">Линии</label>
        </div>

        <div>
          <input type="radio" id="bar" name="chart-block" value="bar" checked={chart === "bar"} onChange={() => {
            chartChangeHandler("bar")
            }} />
          <label htmlFor="bar" className="FiltersDashlet__block-chart-label">Столбики</label>
        </div>
      </fieldset>
      </div>

      <div className="FiltersDashlet__block">
        <fieldset className="FiltersDashlet__block-cod">
          <legend>Выберите код финансирования:</legend>
          <div className="FiltersDashlet__block-cod-item" key={"прочие"}>
            <input 
              type="checkbox" 
              id={"прочие"} name="block-cod" 
              value={"прочие"} 
              checked={filter.cod.includes("прочие")} 
              onClick={event => onFilterChangeHandler("cod", event.currentTarget.value)} 
            />
            <label htmlFor={"прочие"} className="FiltersDashlet__block-cod-item-title">Прочие</label>
          </div>
          <div className="FiltersDashlet__block-cod-item" key={"Соц.Финанс."}>
            <input 
              type="checkbox" 
              id={"Соц.Финанс."} name="org-name-block" 
              value={"Соц.Финанс."} 
              checked={filter.cod.includes("Соц.Финанс.")} 
              onClick={event => onFilterChangeHandler("cod", event.currentTarget.value)} 
            />
            <label htmlFor={"Соц.Финанс."} className="FiltersDashlet__block-cod-item-title">Соц.Финанс.</label>
          </div>
        </fieldset>
      </div>

      <div className="FiltersDashlet__block">
        <fieldset id="org-name-block" className="FiltersDashlet__block-org-name">
          <legend>Выберите организации:</legend>
          {ORG_NAME.map(item => (<div className="FiltersDashlet__block-org-name-item" key={item}>
            <input 
              type="checkbox" 
              id={item} name="org-name-block" 
              value={item} 
              checked={filter.orgName.includes(item)} 
              onClick={event => onFilterChangeHandler("orgName", event.currentTarget.value)} 
            />
            <label htmlFor={item} className="FiltersDashlet__block-org-name-item-title">{item}</label>
          </div>))}
        </fieldset>
      </div>

      
    </div>
  );
};

export default FiltersDashlet;