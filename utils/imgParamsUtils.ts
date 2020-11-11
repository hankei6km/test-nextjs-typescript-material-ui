import imgixUrlParams from 'imgix-url-params/dist/parameters.json';

export type ParamsExpect = {
  [key: string]: any;
};
type Parameters = {
  [key: string]: { category: string; expects: ParamsExpect[] } & any;
};
type FontValues = string[];
type CategoryValues = string[];

const urlParams: {
  // とりあえず
  parameters: Parameters;
  categoryValues: CategoryValues;
  fontValues: FontValues;
} = imgixUrlParams;

export function paramsKeyToSpread(
  paramsKey: string,
  paramsExpect: ParamsExpect,
  detail: boolean = true
): { label: string; defaultValue: string | number } {
  const p: any = urlParams.parameters[paramsKey];
  if (p) {
    // console.log(
    //   `key: ${paramsKey}, default: ${
    //     paramsExpect.default !== undefined ? paramsExpect.default : p.default
    //   }`
    // );
    return {
      label: detail
        ? `${p.display_name}(${paramsExpect.type})`
        : p.display_name,
      defaultValue:
        paramsExpect.default !== undefined ? paramsExpect.default : p.default
    };
  }
  return {
    label: '',
    defaultValue: ''
  };
}

export function paramsKeyDisallowBase64(paramsKey: string): boolean {
  const p: any = urlParams.parameters[paramsKey];
  if (p) {
    return p.disallow_base64 === undefined ? false : p.disallow_base64;
  }
  return false;
}

export function pruneExpects(exp: ParamsExpect[]): ParamsExpect[] {
  const m = exp.map((v) => {
    const r = { ...v };
    if (r.type === 'url' || r.type === 'path') {
      r.type = 'url or path';
    } else if (r.type === 'hex_color' || r.type === 'color_keyword') {
      r.type = 'color';
    }
    return r;
  });
  const u: { [key: string]: ParamsExpect } = {};
  return m.filter((v) => {
    if (u[v.type]) {
      return false;
    }
    u[v.type] = v;
    return true;
  });
}

export function paramsKeyParameters(
  paramsKey: string
): typeof urlParams['parameters'] | undefined {
  return urlParams.parameters[paramsKey];
}

export function expectToRange(
  exp: ParamsExpect
): [number, number | undefined] | undefined {
  if (exp.suggested_range) {
    const max =
      exp.suggested_range.max !== undefined ? exp.suggested_range.max : 500;
    return [exp.suggested_range.min, max];
  }
  return;
}

export function expectIsColor(exp: ParamsExpect): boolean {
  return exp.type === 'color';
}

export function expectToList(exp: ParamsExpect): string[] | undefined {
  if (exp.type === 'list') {
    return exp.possible_values;
  } else if (exp.type === 'font') {
    return urlParams.fontValues;
  }
  return;
}

export type ImgParamsItem = {
  category: string;
  paramsKey: string;
};
export type ImgParamsItems = ImgParamsItem[];

export function flattenParams(filter: string = ''): ImgParamsItems {
  const params = Object.entries(urlParams.parameters);
  return params
    .filter(([k]) => (filter ? k === filter : true)) // filter 仮の処理(現状では完全一致になっている)
    .map(([k, v]) => ({
      category: v.category,
      paramsKey: k
    }));
}

export function imgParamsInCategory(
  paramsItems: ImgParamsItems,
  category: string
): ImgParamsItems {
  return paramsItems.filter((v) => v.category === category);
}

export function imgParamsCategories(filter: string = '') {
  return urlParams.categoryValues.filter((v) => (filter ? v === filter : true)); // filter は同上
}
