import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Link as LinkIcon, 
  Search, 
  Target, 
  CheckCircle2, 
  AlertCircle,
  TrendingUp,
  Info,
  Zap
} from 'lucide-react';

export const RelationshipDiscoveryGuide = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Relationship Discovery Guide</h1>
        <p className="text-xl text-muted-foreground">
          Automatically discover and validate relationships between your datasets
        </p>
      </div>

      {/* Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LinkIcon className="h-5 w-5" />
            What is Relationship Discovery?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Relationship discovery automatically analyzes your datasets to find meaningful connections 
            between tables and columns. This enables powerful cross-dataset analytics and ensures data integrity.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold">Why It Matters</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Enable cross-dataset analytics</li>
                <li>• Ensure data integrity and consistency</li>
                <li>• Discover hidden business insights</li>
                <li>• Automate data model documentation</li>
                <li>• Improve query performance</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold">Discovery Methods</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Name similarity analysis</li>
                <li>• Value overlap detection</li>
                <li>• Foreign key pattern matching</li>
                <li>• Referential integrity validation</li>
                <li>• Statistical correlation analysis</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Discovery Methods */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            How Discovery Works
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">Name Similarity</Badge>
                <span className="text-sm text-muted-foreground">Pattern-based matching</span>
              </div>
              <p className="text-sm mb-3">
                Identifies relationships based on similar column names and common naming patterns.
              </p>
              <div className="space-y-2">
                <div className="text-xs font-mono bg-muted p-2 rounded">
                  orders.customer_id ↔ customers.id
                </div>
                <div className="text-xs font-mono bg-muted p-2 rounded">
                  sales.product_key ↔ products.product_id
                </div>
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">Value Overlap</Badge>
                <span className="text-sm text-muted-foreground">Data-driven analysis</span>
              </div>
              <p className="text-sm mb-3">
                Analyzes actual data values to find columns that share common values.
              </p>
              <div className="space-y-1 text-xs text-muted-foreground">
                <p>Example: 85% of values in orders.region also appear in regions.name</p>
                <p>Confidence: High overlap indicates strong relationship</p>
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">Pattern Matching</Badge>
                <span className="text-sm text-muted-foreground">Schema analysis</span>
              </div>
              <p className="text-sm mb-3">
                Detects common database relationship patterns like foreign keys.
              </p>
              <div className="space-y-1 text-xs text-muted-foreground">
                <p>• Foreign key patterns: *_id, *_key, *_ref</p>
                <p>• Hierarchical patterns: parent_*, category_*, sub_*</p>
                <p>• Reference patterns: lookup tables, dimension tables</p>
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">Referential Integrity</Badge>
                <span className="text-sm text-muted-foreground">Validation checks</span>
              </div>
              <p className="text-sm mb-3">
                Validates that relationships maintain data consistency.
              </p>
              <div className="space-y-1 text-xs text-muted-foreground">
                <p>• All foreign key values exist in referenced table</p>
                <p>• No orphaned records or broken references</p>
                <p>• Consistent data types and formats</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Relationship Types */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Relationship Types
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">One-to-One</Badge>
                <span className="text-xs text-muted-foreground">1:1</span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Each record in one table corresponds to exactly one record in another.
              </p>
              <p className="text-xs font-mono bg-muted p-2 rounded">
                users.id ↔ profiles.user_id
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">One-to-Many</Badge>
                <span className="text-xs text-muted-foreground">1:M</span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                One record relates to multiple records in another table.
              </p>
              <p className="text-xs font-mono bg-muted p-2 rounded">
                customers.id ← orders.customer_id
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">Many-to-One</Badge>
                <span className="text-xs text-muted-foreground">M:1</span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Multiple records relate to one record in another table.
              </p>
              <p className="text-xs font-mono bg-muted p-2 rounded">
                orders.customer_id → customers.id
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">Many-to-Many</Badge>
                <span className="text-xs text-muted-foreground">M:M</span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Multiple records relate to multiple records (often through a junction table).
              </p>
              <p className="text-xs font-mono bg-muted p-2 rounded">
                products ↔ categories
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Using Discovery */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            How to Use Relationship Discovery
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center mt-0.5">1</div>
              <div>
                <h5 className="font-semibold">Load Multiple Datasets</h5>
                <p className="text-sm text-muted-foreground">
                  Upload at least two datasets that you suspect might be related
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center mt-0.5">2</div>
              <div>
                <h5 className="font-semibold">Access Enhanced Data Model Dashboard</h5>
                <p className="text-sm text-muted-foreground">
                  Navigate to the Enhanced Data Model section in the Preview tab
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center mt-0.5">3</div>
              <div>
                <h5 className="font-semibold">Run Discovery Analysis</h5>
                <p className="text-sm text-muted-foreground">
                  Click "Discover Relationships" to start the automated analysis
                </p>
                <Button size="sm" className="mt-2">
                  <Zap className="h-4 w-4 mr-2" />
                  Discover Relationships
                </Button>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center mt-0.5">4</div>
              <div>
                <h5 className="font-semibold">Review Suggestions</h5>
                <p className="text-sm text-muted-foreground">
                  Examine discovered relationships with confidence scores and evidence
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center mt-0.5">5</div>
              <div>
                <h5 className="font-semibold">Validate and Confirm</h5>
                <p className="text-sm text-muted-foreground">
                  Review business logic and confirm meaningful relationships
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Example Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            Example Discovery Results
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-4 p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">orders.customer_id</span>
                <LinkIcon className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">customers.id</span>
              </div>
              <Badge variant="secondary" className="text-xs">one-to-many</Badge>
              <Badge variant="outline" className="text-xs">95% confidence</Badge>
              <Badge variant="outline" className="text-xs">name_similarity</Badge>
            </div>
            
            <div className="flex items-center gap-4 p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">sales.region</span>
                <LinkIcon className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">regions.name</span>
              </div>
              <Badge variant="secondary" className="text-xs">many-to-one</Badge>
              <Badge variant="outline" className="text-xs">87% confidence</Badge>
              <Badge variant="outline" className="text-xs">value_overlap</Badge>
            </div>
            
            <div className="flex items-center gap-4 p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">order_items.product_key</span>
                <LinkIcon className="h-4 w-4 text-purple-500" />
                <span className="text-sm font-medium">products.product_id</span>
              </div>
              <Badge variant="secondary" className="text-xs">many-to-one</Badge>
              <Badge variant="outline" className="text-xs">82% confidence</Badge>
              <Badge variant="outline" className="text-xs">pattern_match</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Troubleshooting */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Troubleshooting Discovery Issues
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <h5 className="font-semibold mb-2">No Relationships Found</h5>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Ensure column names are meaningful and follow conventions</li>
                <li>• Check that related columns contain overlapping values</li>
                <li>• Verify data types are compatible between datasets</li>
                <li>• Consider manual relationship creation for complex cases</li>
              </ul>
            </div>
            
            <div className="p-4 bg-muted rounded-lg">
              <h5 className="font-semibold mb-2">Low Confidence Scores</h5>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Review data quality - inconsistent formats reduce confidence</li>
                <li>• Standardize categorical values and naming conventions</li>
                <li>• Clean up data before running discovery analysis</li>
                <li>• Validate business logic for suggested relationships</li>
              </ul>
            </div>
            
            <div className="p-4 bg-muted rounded-lg">
              <h5 className="font-semibold mb-2">Too Many False Positives</h5>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Adjust confidence thresholds to filter weak relationships</li>
                <li>• Focus on relationships with multiple evidence types</li>
                <li>• Manually validate relationships before using in analysis</li>
                <li>• Consider domain knowledge when evaluating suggestions</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Best Practices */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Best Practices for Relationship Discovery</AlertTitle>
        <AlertDescription className="mt-2">
          <ul className="space-y-1 text-sm">
            <li>• Use consistent naming conventions across datasets</li>
            <li>• Ensure high data quality before running discovery</li>
            <li>• Start with datasets you know should be related</li>
            <li>• Validate discovered relationships with business knowledge</li>
            <li>• Document confirmed relationships for future reference</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  );
};