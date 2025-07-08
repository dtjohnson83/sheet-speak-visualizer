import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Database, 
  Shield, 
  Link as LinkIcon, 
  BarChart3, 
  Zap, 
  Clock,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  FileText,
  Target
} from 'lucide-react';

export const EnhancedDataModelingGuide = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Enhanced Data Modeling Guide</h1>
        <p className="text-xl text-muted-foreground">
          Discover advanced data modeling features that unlock deeper insights from your data
        </p>
      </div>

      {/* Introduction */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            What is Enhanced Data Modeling?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Enhanced Data Modeling goes beyond basic data upload and visualization. It provides intelligent 
            data understanding, quality assessment, relationship discovery, and storage optimization to help 
            you build more robust and insightful analytics.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold">Key Benefits:</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Automatic data quality assessment</li>
                <li>• Smart relationship discovery</li>
                <li>• Semantic type detection</li>
                <li>• Storage optimization</li>
                <li>• Schema versioning</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Use Cases:</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Multi-dataset analytics</li>
                <li>• Data quality monitoring</li>
                <li>• Enterprise data modeling</li>
                <li>• Performance optimization</li>
                <li>• Compliance reporting</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Data Types */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Enhanced Data Types & Semantic Understanding
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>The system automatically detects and enriches your data with semantic meaning.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Basic Types</h4>
              <div className="space-y-2">
                <Badge variant="outline">numeric</Badge>
                <Badge variant="outline">text</Badge>
                <Badge variant="outline">date</Badge>
                <Badge variant="outline">categorical</Badge>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Semantic Types</h4>
              <div className="space-y-2">
                <Badge variant="secondary">identifier</Badge> - Unique keys, IDs
                <br />
                <Badge variant="secondary">measure</Badge> - Quantitative metrics
                <br />
                <Badge variant="secondary">dimension</Badge> - Categorical attributes
                <br />
                <Badge variant="secondary">temporal</Badge> - Time-based data
                <br />
                <Badge variant="secondary">geospatial</Badge> - Location data
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h5 className="font-semibold mb-2">Example: Enhanced Column Detection</h5>
            <div className="text-sm space-y-1">
              <div>Column: "customer_id" → Type: <Badge>text</Badge> → Semantic: <Badge variant="secondary">identifier</Badge></div>
              <div>Column: "revenue" → Type: <Badge>numeric</Badge> → Semantic: <Badge variant="secondary">measure</Badge></div>
              <div>Column: "region" → Type: <Badge>categorical</Badge> → Semantic: <Badge variant="secondary">dimension</Badge></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Quality Profiles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Data Quality Assessment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>Automatic quality assessment provides comprehensive data health metrics.</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">85%</div>
              <div className="text-sm text-muted-foreground">Completeness</div>
              <p className="text-xs mt-1">Missing values assessment</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">92%</div>
              <div className="text-sm text-muted-foreground">Validity</div>
              <p className="text-xs mt-1">Format consistency check</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">78%</div>
              <div className="text-sm text-muted-foreground">Consistency</div>
              <p className="text-xs mt-1">Internal logic validation</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-orange-600">88%</div>
              <div className="text-sm text-muted-foreground">Accuracy</div>
              <p className="text-xs mt-1">Outlier detection</p>
            </div>
          </div>

          <div className="space-y-3">
            <h5 className="font-semibold">Quality Issues & Recommendations</h5>
            <div className="space-y-2">
              <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Column 'phone_number' has inconsistent formatting</p>
                  <p className="text-xs text-muted-foreground">Suggestion: Standardize phone number format</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Consider adding data validation rules</p>
                  <p className="text-xs text-muted-foreground">Improve consistency with automated checks</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Relationship Discovery */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LinkIcon className="h-5 w-5" />
            Automatic Relationship Discovery
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            The system automatically discovers relationships between datasets, enabling powerful 
            cross-dataset analytics and ensuring data integrity.
          </p>

          <div className="space-y-4">
            <h5 className="font-semibold">Discovery Methods</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Badge variant="outline">Name Similarity</Badge>
                <p className="text-sm text-muted-foreground">
                  Matches columns with similar names (e.g., "customer_id" ↔ "cust_id")
                </p>
              </div>
              <div className="space-y-2">
                <Badge variant="outline">Value Overlap</Badge>
                <p className="text-sm text-muted-foreground">
                  Finds columns sharing common values indicating relationships
                </p>
              </div>
              <div className="space-y-2">
                <Badge variant="outline">Pattern Matching</Badge>
                <p className="text-sm text-muted-foreground">
                  Detects foreign key patterns (e.g., "product_id" → "products.id")
                </p>
              </div>
              <div className="space-y-2">
                <Badge variant="outline">Referential Integrity</Badge>
                <p className="text-sm text-muted-foreground">
                  Validates data relationships for consistency
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h5 className="font-semibold">Example Discovered Relationships</h5>
            <div className="space-y-2">
              <div className="flex items-center gap-4 p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">orders.customer_id</span>
                  <LinkIcon className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">customers.id</span>
                </div>
                <Badge variant="secondary" className="text-xs">one-to-many</Badge>
                <Badge variant="outline" className="text-xs">95% confidence</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Storage Optimization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Storage Optimization
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>Intelligent storage optimization improves performance and reduces costs.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg text-center">
              <Database className="h-8 w-8 mx-auto mb-2 text-blue-500" />
              <h5 className="font-semibold">JSONB</h5>
              <p className="text-sm text-muted-foreground">Flexible, great for mixed data types</p>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <BarChart3 className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <h5 className="font-semibold">Columnar</h5>
              <p className="text-sm text-muted-foreground">Optimized for analytics queries</p>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <Zap className="h-8 w-8 mx-auto mb-2 text-purple-500" />
              <h5 className="font-semibold">Hybrid</h5>
              <p className="text-sm text-muted-foreground">Best of both worlds</p>
            </div>
          </div>

          <div className="space-y-2">
            <h5 className="font-semibold">Access Patterns & Caching</h5>
            <div className="flex gap-2">
              <Badge variant="default">Hot</Badge> - Frequently accessed data
              <Badge variant="secondary">Warm</Badge> - Regular access
              <Badge variant="outline">Cold</Badge> - Archive data
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schema Versioning */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Schema Versioning & Evolution
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>Track and manage changes to your data structure over time.</p>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <h5 className="font-semibold">Version History</h5>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <span className="font-medium">Version 2.1</span>
                    <span className="text-sm text-muted-foreground ml-2">Added 'email_verified' column</span>
                  </div>
                  <Badge variant="default">Current</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <span className="font-medium">Version 2.0</span>
                    <span className="text-sm text-muted-foreground ml-2">Updated semantic types</span>
                  </div>
                  <Badge variant="outline">Previous</Badge>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h5 className="font-semibold">Backward Compatibility</h5>
              <p className="text-sm text-muted-foreground">
                Enhanced data modeling is fully backward compatible. Existing workflows 
                continue to work while gaining access to new features automatically.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Getting Started */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Getting Started with Enhanced Data Modeling
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center mt-0.5">1</div>
                <div>
                  <h5 className="font-semibold">Upload Data</h5>
                  <p className="text-sm text-muted-foreground">
                    Upload your dataset as usual - enhancement happens automatically
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center mt-0.5">2</div>
                <div>
                  <h5 className="font-semibold">Review Quality Profile</h5>
                  <p className="text-sm text-muted-foreground">
                    Check the automated quality assessment and address any issues
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center mt-0.5">3</div>
                <div>
                  <h5 className="font-semibold">Discover Relationships</h5>
                  <p className="text-sm text-muted-foreground">
                    Use the relationship discovery tool to find connections between datasets
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center mt-0.5">4</div>
                <div>
                  <h5 className="font-semibold">Optimize & Analyze</h5>
                  <p className="text-sm text-muted-foreground">
                    Leverage enhanced features for deeper insights and better performance
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};