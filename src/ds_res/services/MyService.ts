// @ts-ignore
import {AppConfig, BaseService, UrlState} from 'bi-internal/core';
import axios from "axios";
import { KoobDataService } from 'bi-internal/services';

export type VariantType = "table" | "chart";
export type ChartType = "line" | "bar";
export type ItemType = {title: string, values: Array<string>};
export type FilteredItemType = {
  code_finance: string,
  org_name: string,
  r: number,
};
export type FiltersType = {
  cod: Array<string>,
  orgName: Array<string>,
};

export interface IMyServiceModel{
  loading?: boolean;
  error?: string;
  variant: VariantType;
  chart: ChartType;
  filteredData: Array<FilteredItemType>;
  dataFilters: FiltersType;
  data: any;
  filters: any,
  dictionaries: any,
};

export class MyService extends BaseService<IMyServiceModel> {
  private readonly id: string | number;
  private constructor(koobId: string) {
    super({
      loading: false,
      error: null,
      variant: "table",
      chart: "line",
      filteredData: [],
      dataFilters: {cod: [], orgName: []},
      data: [],
      filters: {},
      dictionaries: {}
    });
    this.id = koobId;
    const dimensions = [
      'code_finance',
      'dt',
      'name',
      'org_id',
      'org_name',
      'parent_id',
      'val',
      'value',
    ];
    Promise.all(dimensions.map(dim => fetch(`api/v3/koob/${koobId}.${dim}`).then(resp => resp.json()))).then(responses => {
      // console.log("service", responses);
      let dictionaries = {};
      dimensions.map((dim, i) => {
        if (!dictionaries.hasOwnProperty(dim)) {
          dictionaries[dim] = {title: responses[i].title, values: responses[i].values};
        }
      })
      // @ts-ignore
      this._updateWithData({dictionaries});
    });
  }

  public changeVariant(variant: VariantType): void {
    // @ts-ignore
    this._updateWithData({ variant });
    UrlState.getInstance().navigate({ variant });
  }

  public changeChart(chart: ChartType): void {
    // @ts-ignore
    this._updateWithData({ chart });
    UrlState.getInstance().navigate({ chart });
  }

  public changeFilteredDataAndFilters(data: Array<FilteredItemType>, filters: FiltersType): void {
    // @ts-ignore
    this._updateWithData({ filteredData: data, dataFilters: filters });
  }

  public async getKoobDataByCfg(cfg): Promise<any> {
    const url: string = AppConfig.fixRequestUrl(`/api/v3/koob/data`);
    const columns = cfg.columns;

    let filters = {};
    if (cfg.filters) filters = {...cfg.filters};

    const body: any = {
      with: cfg.with,
      columns,
      filters,
    };

    if (cfg.offset) body.offset = cfg.offset;
    if (cfg.limit) body.limit = cfg.limit;
    if (cfg.sort) body.sort = cfg.sort;
    if (cfg.options) body.options = cfg.options;
    if (cfg.subtotals?.length) body.subtotals = cfg.subtotals;

    if (cfg.distinct) {                                                                           // если нет measures, то лучше применить distinct
      body.distinct = [];
    }

    try {
      const response = await axios({
        url,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/stream+json',
        },
        data: body,
        cancelToken: cfg.cancelToken,
      });

      let data = response.data;

      if (String(response.headers['content-type']).startsWith('application/stream+json')) {
        if (typeof data === 'string') {
          data = data.split('\n').filter((line: string) => !!line).map((line: string) => JSON.parse(line));
        } else if (data && (typeof data === 'object') && !Array.isArray(data)) {
          data = [data];
        }
      }

      return data;

    } catch (e) {
      return '';
    }
  }

  protected _dispose() {
    // @ts-ignore
    if (window.__myService && window.__myService[String(this.id)]) {
      // @ts-ignore
      delete window.__myService[String(this.id)];
    }
    super._dispose();
  }
  public static createInstance (id: string | number) : MyService {
    // @ts-ignore
    if (!(window.__myService)) {
      // @ts-ignore
      window.__myService = {};
    }
    // @ts-ignore
    if (!window.__myService.hasOwnProperty(String(id))) {
      // @ts-ignore
      window.__myService[String(id)] = new MyService(String(id));
    }
    // @ts-ignore
    return window.__myService[String(id)];
  };
};
