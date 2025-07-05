import { DataRow, ColumnInfo } from '@/pages/Index';

export interface DemoDataset {
  id: string;
  name: string;
  description: string;
  category: string;
  useCase: string;
  data: DataRow[];
  columns: ColumnInfo[];
  suggestedCharts: string[];
  learningObjectives: string[];
  businessContext: string;
  icon: string;
}

export const demoDatasets: DemoDataset[] = [
  {
    id: 'sales-performance',
    name: 'Sales Performance Q1-Q4',
    description: 'Quarterly sales data across regions and product categories',
    category: 'Sales & Marketing',
    useCase: 'Sales Dashboard Creation',
    businessContext: 'Track quarterly performance, identify top-performing regions, and analyze product category trends.',
    icon: 'TrendingUp',
    suggestedCharts: ['Bar Chart', 'Line Chart', 'Pie Chart', 'Stacked Bar'],
    learningObjectives: [
      'Create time-series visualizations',
      'Compare performance across categories',
      'Build executive dashboards'
    ],
    data: [
      { quarter: 'Q1 2024', region: 'North America', product_category: 'Electronics', sales: 125000, target: 120000, rep_name: 'John Smith' },
      { quarter: 'Q1 2024', region: 'North America', product_category: 'Clothing', sales: 89000, target: 85000, rep_name: 'Sarah Johnson' },
      { quarter: 'Q1 2024', region: 'Europe', product_category: 'Electronics', sales: 98000, target: 100000, rep_name: 'Mike Wilson' },
      { quarter: 'Q1 2024', region: 'Europe', product_category: 'Clothing', sales: 67000, target: 70000, rep_name: 'Emma Davis' },
      { quarter: 'Q2 2024', region: 'North America', product_category: 'Electronics', sales: 142000, target: 130000, rep_name: 'John Smith' },
      { quarter: 'Q2 2024', region: 'North America', product_category: 'Clothing', sales: 95000, target: 90000, rep_name: 'Sarah Johnson' },
      { quarter: 'Q2 2024', region: 'Europe', product_category: 'Electronics', sales: 115000, target: 110000, rep_name: 'Mike Wilson' },
      { quarter: 'Q2 2024', region: 'Europe', product_category: 'Clothing', sales: 78000, target: 75000, rep_name: 'Emma Davis' },
      { quarter: 'Q3 2024', region: 'North America', product_category: 'Electronics', sales: 158000, target: 140000, rep_name: 'John Smith' },
      { quarter: 'Q3 2024', region: 'North America', product_category: 'Clothing', sales: 102000, target: 95000, rep_name: 'Sarah Johnson' },
      { quarter: 'Q3 2024', region: 'Europe', product_category: 'Electronics', sales: 132000, target: 125000, rep_name: 'Mike Wilson' },
      { quarter: 'Q3 2024', region: 'Europe', product_category: 'Clothing', sales: 84000, target: 80000, rep_name: 'Emma Davis' },
      { quarter: 'Q4 2024', region: 'North America', product_category: 'Electronics', sales: 175000, target: 150000, rep_name: 'John Smith' },
      { quarter: 'Q4 2024', region: 'North America', product_category: 'Clothing', sales: 118000, target: 105000, rep_name: 'Sarah Johnson' },
      { quarter: 'Q4 2024', region: 'Europe', product_category: 'Electronics', sales: 148000, target: 135000, rep_name: 'Mike Wilson' },
      { quarter: 'Q4 2024', region: 'Europe', product_category: 'Clothing', sales: 91000, target: 85000, rep_name: 'Emma Davis' }
    ],
    columns: [
      { name: 'quarter', type: 'categorical', values: ['Q1 2024', 'Q2 2024', 'Q3 2024', 'Q4 2024'] },
      { name: 'region', type: 'categorical', values: ['North America', 'Europe'] },
      { name: 'product_category', type: 'categorical', values: ['Electronics', 'Clothing'] },
      { name: 'sales', type: 'numeric', values: [] },
      { name: 'target', type: 'numeric', values: [] },
      { name: 'rep_name', type: 'categorical', values: ['John Smith', 'Sarah Johnson', 'Mike Wilson', 'Emma Davis'] }
    ]
  },
  {
    id: 'ecommerce-analytics',
    name: 'E-commerce Customer Orders',
    description: 'Customer order data with demographics and purchasing patterns',
    category: 'E-commerce',
    useCase: 'Customer Analytics Dashboard',
    businessContext: 'Analyze customer behavior, seasonal trends, and product performance to optimize marketing and inventory.',
    icon: 'ShoppingCart',
    suggestedCharts: ['Histogram', 'Scatter Plot', 'Heatmap', 'Area Chart'],
    learningObjectives: [
      'Analyze customer demographics',
      'Identify seasonal patterns',
      'Create cohort analysis'
    ],
    data: [
      { order_date: '2024-01-15', customer_age: 28, gender: 'Female', city: 'New York', order_value: 89.99, product_count: 3, category: 'Fashion', payment_method: 'Credit Card' },
      { order_date: '2024-01-16', customer_age: 35, gender: 'Male', city: 'Los Angeles', order_value: 156.50, product_count: 2, category: 'Electronics', payment_method: 'PayPal' },
      { order_date: '2024-01-18', customer_age: 42, gender: 'Female', city: 'Chicago', order_value: 203.25, product_count: 4, category: 'Home & Garden', payment_method: 'Credit Card' },
      { order_date: '2024-02-02', customer_age: 31, gender: 'Male', city: 'Houston', order_value: 67.80, product_count: 1, category: 'Books', payment_method: 'Debit Card' },
      { order_date: '2024-02-05', customer_age: 26, gender: 'Female', city: 'Phoenix', order_value: 124.99, product_count: 2, category: 'Fashion', payment_method: 'Credit Card' },
      { order_date: '2024-02-12', customer_age: 38, gender: 'Male', city: 'Philadelphia', order_value: 89.99, product_count: 3, category: 'Sports', payment_method: 'PayPal' },
      { order_date: '2024-03-01', customer_age: 29, gender: 'Female', city: 'San Antonio', order_value: 175.40, product_count: 5, category: 'Electronics', payment_method: 'Credit Card' },
      { order_date: '2024-03-08', customer_age: 45, gender: 'Male', city: 'San Diego', order_value: 92.30, product_count: 2, category: 'Health & Beauty', payment_method: 'Debit Card' },
      { order_date: '2024-03-15', customer_age: 33, gender: 'Female', city: 'Dallas', order_value: 148.75, product_count: 3, category: 'Fashion', payment_method: 'PayPal' },
      { order_date: '2024-04-02', customer_age: 27, gender: 'Male', city: 'San Jose', order_value: 234.50, product_count: 4, category: 'Electronics', payment_method: 'Credit Card' },
      { order_date: '2024-04-10', customer_age: 36, gender: 'Female', city: 'Austin', order_value: 78.25, product_count: 2, category: 'Books', payment_method: 'Debit Card' },
      { order_date: '2024-04-18', customer_age: 41, gender: 'Male', city: 'Jacksonville', order_value: 167.90, product_count: 3, category: 'Home & Garden', payment_method: 'PayPal' }
    ],
    columns: [
      { name: 'order_date', type: 'date', values: [] },
      { name: 'customer_age', type: 'numeric', values: [] },
      { name: 'gender', type: 'categorical', values: ['Female', 'Male'] },
      { name: 'city', type: 'categorical', values: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville'] },
      { name: 'order_value', type: 'numeric', values: [] },
      { name: 'product_count', type: 'numeric', values: [] },
      { name: 'category', type: 'categorical', values: ['Fashion', 'Electronics', 'Home & Garden', 'Books', 'Sports', 'Health & Beauty'] },
      { name: 'payment_method', type: 'categorical', values: ['Credit Card', 'PayPal', 'Debit Card'] }
    ]
  },
  {
    id: 'financial-portfolio',
    name: 'Investment Portfolio Performance',
    description: 'Stock performance data with portfolio allocation and returns',
    category: 'Finance',
    useCase: 'Investment Dashboard',
    businessContext: 'Track portfolio performance, analyze risk distribution, and monitor asset allocation over time.',
    icon: 'DollarSign',
    suggestedCharts: ['Line Chart', 'Treemap', 'Scatter Plot', 'Area Chart'],
    learningObjectives: [
      'Create financial time-series charts',
      'Build portfolio allocation views',
      'Analyze risk vs return metrics'
    ],
    data: [
      { date: '2024-01-01', symbol: 'AAPL', company: 'Apple Inc.', price: 192.53, shares: 50, sector: 'Technology', market_cap: 'Large Cap', dividend_yield: 0.5 },
      { date: '2024-01-01', symbol: 'GOOGL', company: 'Alphabet Inc.', price: 140.93, shares: 30, sector: 'Technology', market_cap: 'Large Cap', dividend_yield: 0.0 },
      { date: '2024-01-01', symbol: 'MSFT', company: 'Microsoft Corp.', price: 376.04, shares: 25, sector: 'Technology', market_cap: 'Large Cap', dividend_yield: 0.7 },
      { date: '2024-01-01', symbol: 'TSLA', company: 'Tesla Inc.', price: 248.48, shares: 20, sector: 'Automotive', market_cap: 'Large Cap', dividend_yield: 0.0 },
      { date: '2024-02-01', symbol: 'AAPL', company: 'Apple Inc.', price: 188.85, shares: 50, sector: 'Technology', market_cap: 'Large Cap', dividend_yield: 0.5 },
      { date: '2024-02-01', symbol: 'GOOGL', company: 'Alphabet Inc.', price: 147.05, shares: 30, sector: 'Technology', market_cap: 'Large Cap', dividend_yield: 0.0 },
      { date: '2024-02-01', symbol: 'MSFT', company: 'Microsoft Corp.', price: 409.61, shares: 25, sector: 'Technology', market_cap: 'Large Cap', dividend_yield: 0.7 },
      { date: '2024-02-01', symbol: 'TSLA', company: 'Tesla Inc.', price: 191.97, shares: 20, sector: 'Automotive', market_cap: 'Large Cap', dividend_yield: 0.0 },
      { date: '2024-03-01', symbol: 'AAPL', company: 'Apple Inc.', price: 180.75, shares: 50, sector: 'Technology', market_cap: 'Large Cap', dividend_yield: 0.5 },
      { date: '2024-03-01', symbol: 'GOOGL', company: 'Alphabet Inc.', price: 134.12, shares: 30, sector: 'Technology', market_cap: 'Large Cap', dividend_yield: 0.0 },
      { date: '2024-03-01', symbol: 'MSFT', company: 'Microsoft Corp.', price: 421.43, shares: 25, sector: 'Technology', market_cap: 'Large Cap', dividend_yield: 0.7 },
      { date: '2024-03-01', symbol: 'TSLA', company: 'Tesla Inc.', price: 202.64, shares: 20, sector: 'Automotive', market_cap: 'Large Cap', dividend_yield: 0.0 }
    ],
    columns: [
      { name: 'date', type: 'date', values: [] },
      { name: 'symbol', type: 'categorical', values: ['AAPL', 'GOOGL', 'MSFT', 'TSLA'] },
      { name: 'company', type: 'categorical', values: ['Apple Inc.', 'Alphabet Inc.', 'Microsoft Corp.', 'Tesla Inc.'] },
      { name: 'price', type: 'numeric', values: [] },
      { name: 'shares', type: 'numeric', values: [] },
      { name: 'sector', type: 'categorical', values: ['Technology', 'Automotive'] },
      { name: 'market_cap', type: 'categorical', values: ['Large Cap'] },
      { name: 'dividend_yield', type: 'numeric', values: [] }
    ]
  },
  {
    id: 'marketing-campaigns',
    name: 'Digital Marketing Campaign Results',
    description: 'Multi-channel marketing campaign performance with ROI metrics',
    category: 'Marketing',
    useCase: 'Marketing ROI Analysis',
    businessContext: 'Evaluate campaign effectiveness across channels, optimize ad spend, and improve conversion rates.',
    icon: 'Target',
    suggestedCharts: ['Bar Chart', 'Funnel Chart', 'Scatter Plot', 'Pie Chart'],
    learningObjectives: [
      'Calculate marketing ROI',
      'Compare channel performance',
      'Create conversion funnels'
    ],
    data: [
      { campaign_name: 'Holiday Sale 2024', channel: 'Google Ads', start_date: '2024-01-01', spend: 15000, impressions: 125000, clicks: 3750, conversions: 187, revenue: 23400, age_group: '25-34', device: 'Mobile' },
      { campaign_name: 'Holiday Sale 2024', channel: 'Facebook Ads', start_date: '2024-01-01', spend: 12000, impressions: 98000, clicks: 2940, conversions: 147, revenue: 18375, age_group: '35-44', device: 'Desktop' },
      { campaign_name: 'Holiday Sale 2024', channel: 'Instagram Ads', start_date: '2024-01-01', spend: 8000, impressions: 67000, clicks: 2010, conversions: 101, revenue: 12625, age_group: '18-24', device: 'Mobile' },
      { campaign_name: 'Spring Launch', channel: 'Google Ads', start_date: '2024-02-15', spend: 18000, impressions: 145000, clicks: 4350, conversions: 218, revenue: 27250, age_group: '25-34', device: 'Desktop' },
      { campaign_name: 'Spring Launch', channel: 'Facebook Ads', start_date: '2024-02-15', spend: 14000, impressions: 112000, clicks: 3360, conversions: 168, revenue: 21000, age_group: '35-44', device: 'Mobile' },
      { campaign_name: 'Spring Launch', channel: 'LinkedIn Ads', start_date: '2024-02-15', spend: 10000, impressions: 45000, clicks: 900, conversions: 72, revenue: 14400, age_group: '35-44', device: 'Desktop' },
      { campaign_name: 'Summer Promo', channel: 'Google Ads', start_date: '2024-03-01', spend: 22000, impressions: 178000, clicks: 5340, conversions: 267, revenue: 33375, age_group: '25-34', device: 'Mobile' },
      { campaign_name: 'Summer Promo', channel: 'TikTok Ads', start_date: '2024-03-01', spend: 6000, impressions: 89000, clicks: 2670, conversions: 80, revenue: 8000, age_group: '18-24', device: 'Mobile' },
      { campaign_name: 'Back to School', channel: 'Google Ads', start_date: '2024-04-01', spend: 16000, impressions: 134000, clicks: 4020, conversions: 201, revenue: 25125, age_group: '25-34', device: 'Desktop' },
      { campaign_name: 'Back to School', channel: 'Facebook Ads', start_date: '2024-04-01', spend: 11000, impressions: 87000, clicks: 2610, conversions: 131, revenue: 16375, age_group: '35-44', device: 'Mobile' }
    ],
    columns: [
      { name: 'campaign_name', type: 'categorical', values: ['Holiday Sale 2024', 'Spring Launch', 'Summer Promo', 'Back to School'] },
      { name: 'channel', type: 'categorical', values: ['Google Ads', 'Facebook Ads', 'Instagram Ads', 'LinkedIn Ads', 'TikTok Ads'] },
      { name: 'start_date', type: 'date', values: [] },
      { name: 'spend', type: 'numeric', values: [] },
      { name: 'impressions', type: 'numeric', values: [] },
      { name: 'clicks', type: 'numeric', values: [] },
      { name: 'conversions', type: 'numeric', values: [] },
      { name: 'revenue', type: 'numeric', values: [] },
      { name: 'age_group', type: 'categorical', values: ['18-24', '25-34', '35-44'] },
      { name: 'device', type: 'categorical', values: ['Mobile', 'Desktop'] }
    ]
  },
  {
    id: 'customer-satisfaction',
    name: 'Customer Satisfaction Survey Results',
    description: 'Customer feedback scores across different service touchpoints',
    category: 'Customer Experience',
    useCase: 'Customer Experience Dashboard',
    businessContext: 'Monitor customer satisfaction trends, identify service improvement areas, and track NPS scores.',
    icon: 'Heart',
    suggestedCharts: ['Bar Chart', 'Histogram', 'Heatmap', 'Gauge Chart'],
    learningObjectives: [
      'Analyze satisfaction trends',
      'Create NPS calculations',
      'Build experience scorecards'
    ],
    data: [
      { survey_date: '2024-01-15', customer_id: 'C001', age_range: '25-34', service_type: 'Online Support', satisfaction_score: 4, nps_score: 8, response_time_hours: 2, issue_resolved: 'Yes', department: 'Technical Support' },
      { survey_date: '2024-01-16', customer_id: 'C002', age_range: '35-44', service_type: 'Phone Support', satisfaction_score: 5, nps_score: 9, response_time_hours: 1, issue_resolved: 'Yes', department: 'Customer Service' },
      { survey_date: '2024-01-18', customer_id: 'C003', age_range: '45-54', service_type: 'In-Store', satisfaction_score: 3, nps_score: 6, response_time_hours: 0, issue_resolved: 'Partial', department: 'Retail' },
      { survey_date: '2024-02-02', customer_id: 'C004', age_range: '18-24', service_type: 'Live Chat', satisfaction_score: 4, nps_score: 7, response_time_hours: 0.5, issue_resolved: 'Yes', department: 'Technical Support' },
      { survey_date: '2024-02-05', customer_id: 'C005', age_range: '55-64', service_type: 'Phone Support', satisfaction_score: 5, nps_score: 10, response_time_hours: 1.5, issue_resolved: 'Yes', department: 'Customer Service' },
      { survey_date: '2024-02-12', customer_id: 'C006', age_range: '25-34', service_type: 'Email Support', satisfaction_score: 2, nps_score: 4, response_time_hours: 24, issue_resolved: 'No', department: 'Technical Support' },
      { survey_date: '2024-03-01', customer_id: 'C007', age_range: '35-44', service_type: 'Online Support', satisfaction_score: 4, nps_score: 8, response_time_hours: 3, issue_resolved: 'Yes', department: 'Technical Support' },
      { survey_date: '2024-03-08', customer_id: 'C008', age_range: '45-54', service_type: 'In-Store', satisfaction_score: 5, nps_score: 9, response_time_hours: 0, issue_resolved: 'Yes', department: 'Retail' },
      { survey_date: '2024-03-15', customer_id: 'C009', age_range: '18-24', service_type: 'Live Chat', satisfaction_score: 3, nps_score: 5, response_time_hours: 2, issue_resolved: 'Partial', department: 'Customer Service' },
      { survey_date: '2024-04-02', customer_id: 'C010', age_range: '25-34', service_type: 'Phone Support', satisfaction_score: 5, nps_score: 10, response_time_hours: 0.5, issue_resolved: 'Yes', department: 'Customer Service' }
    ],
    columns: [
      { name: 'survey_date', type: 'date', values: [] },
      { name: 'customer_id', type: 'categorical', values: [] },
      { name: 'age_range', type: 'categorical', values: ['18-24', '25-34', '35-44', '45-54', '55-64'] },
      { name: 'service_type', type: 'categorical', values: ['Online Support', 'Phone Support', 'In-Store', 'Live Chat', 'Email Support'] },
      { name: 'satisfaction_score', type: 'numeric', values: [] },
      { name: 'nps_score', type: 'numeric', values: [] },
      { name: 'response_time_hours', type: 'numeric', values: [] },
      { name: 'issue_resolved', type: 'categorical', values: ['Yes', 'No', 'Partial'] },
      { name: 'department', type: 'categorical', values: ['Technical Support', 'Customer Service', 'Retail'] }
    ]
  }
];

// Helper functions
export const getDemoDatasetById = (id: string): DemoDataset | undefined => {
  return demoDatasets.find(dataset => dataset.id === id);
};

export const getDemoDatasetsByCategory = (category: string): DemoDataset[] => {
  return demoDatasets.filter(dataset => dataset.category === category);
};

export const getDemoDatasetCategories = (): string[] => {
  return [...new Set(demoDatasets.map(dataset => dataset.category))];
};