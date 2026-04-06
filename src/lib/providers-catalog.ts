export type ProviderCategory = 'exchange' | 'macro' | 'news' | 'onchain' | 'derivatives';

export interface ConfigOption {
  value: string;
  label: string;
}

export interface ConfigField {
  key: string;
  label: string;
  type: 'string' | 'number' | 'boolean' | 'enum' | 'array' | 'multiselect';
  required: boolean;
  defaultValue?: any;
  options?: ConfigOption[];
  description?: string;
  placeholder?: string;
}

export interface ProviderCatalogItem {
  id: string;
  name: string;
  category: ProviderCategory;
  description: string;
  icon: string;
  color: string;
  logoColor?: string;
  tags?: string[];
  authRequired: boolean;
  authFields?: ConfigField[];
  configFields: ConfigField[];
}

export const PROVIDER_CATALOG: ProviderCatalogItem[] = [
  {
    id: 'binance',
    name: 'Binance',
    category: 'exchange',
    description: '바이낸스 현물/선물 데이터 및 오더북, 청산 등 마켓 데이터 수집',
    icon: 'binance-logo',
    color: '#F3BA2F',
    logoColor: '#F3BA2F',
    tags: ['Spot', 'Futures'],
    authRequired: false,
    configFields: [
      { key: 'symbols', label: 'Symbols', type: 'multiselect', required: true, options: [{ value: 'BTCUSDT', label: 'BTC/USDT' }] }
    ],
  },
  {
    id: 'fred',
    name: 'FRED',
    category: 'macro',
    description: 'Federal Reserve Economic Data 거시경제 지표',
    icon: 'bank',
    color: '#0984E3',
    logoColor: '#0984E3',
    tags: ['Macro', 'USA'],
    authRequired: true,
    authFields: [{ key: 'apiKey', label: 'API Key', type: 'string', required: true, placeholder: 'Enter FRED API Key' }],
    configFields: [],
  },
];

