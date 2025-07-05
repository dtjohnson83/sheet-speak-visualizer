import { DataRow, ColumnInfo } from '@/pages/Index';
import { EnhancedDataContext } from '@/components/ai-context/EnhancedDataContextManager';
import { SemanticEntity, SemanticRelationship } from './SemanticDataFusion';

export interface OntologyClass {
  id: string;
  name: string;
  description: string;
  properties: string[];
  superClass?: string;
  confidence: number;
}

export interface OntologyProperty {
  id: string;
  name: string;
  domain: string; // Class it belongs to
  range: string; // Expected value type
  description: string;
  isRequired: boolean;
  confidence: number;
}

export interface BusinessOntology {
  id: string;
  domain: string;
  classes: OntologyClass[];
  properties: OntologyProperty[];
  relationships: OntologyRelationship[];
  rules: BusinessRule[];
  createdAt: Date;
  updatedAt: Date;
}

export interface OntologyRelationship {
  id: string;
  sourceClass: string;
  targetClass: string;
  relationshipType: string;
  cardinality: 'one-to-one' | 'one-to-many' | 'many-to-one' | 'many-to-many';
  confidence: number;
}

export interface BusinessRule {
  id: string;
  name: string;
  description: string;
  condition: string;
  action: string;
  appliesTo: string[]; // Class or property IDs
  confidence: number;
}

export class AIOntogyBuilder {
  private enhancedContext: EnhancedDataContext | null = null;

  setEnhancedContext(context: EnhancedDataContext) {
    this.enhancedContext = context;
  }

  /**
   * Build a domain-specific ontology from semantic entities and business context
   */
  buildOntology(entities: SemanticEntity[], relationships: SemanticRelationship[]): BusinessOntology {
    const domain = this.enhancedContext?.businessContext.domain || 'General';
    
    const classes = this.deriveOntologyClasses(entities);
    const properties = this.deriveOntologyProperties(entities);
    const ontologyRelationships = this.convertToOntologyRelationships(relationships);
    const rules = this.generateBusinessRules(classes, properties);

    return {
      id: `ontology_${domain.toLowerCase()}_${Date.now()}`,
      domain,
      classes,
      properties,
      relationships: ontologyRelationships,
      rules,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  private deriveOntologyClasses(entities: SemanticEntity[]): OntologyClass[] {
    const classes: OntologyClass[] = [];

    // Group entities by type to create class hierarchy
    const entityGroups = this.groupEntitiesByType(entities);

    Object.entries(entityGroups).forEach(([type, typeEntities]) => {
      const className = this.capitalizeFirst(type);
      const properties = this.extractUniqueProperties(typeEntities);
      
      classes.push({
        id: `class_${type}`,
        name: className,
        description: this.generateClassDescription(type, typeEntities),
        properties,
        confidence: this.calculateClassConfidence(typeEntities)
      });
    });

    // Add domain-specific classes based on business context
    if (this.enhancedContext) {
      const domainClasses = this.generateDomainSpecificClasses();
      classes.push(...domainClasses);
    }

    return classes;
  }

  private deriveOntologyProperties(entities: SemanticEntity[]): OntologyProperty[] {
    const properties: OntologyProperty[] = [];

    entities.forEach(entity => {
      entity.columns.forEach(columnName => {
        const columnContext = this.enhancedContext?.columnContexts.find(ctx => ctx.name === columnName);
        
        properties.push({
          id: `prop_${entity.type}_${columnName.toLowerCase().replace(/\s+/g, '_')}`,
          name: columnName,
          domain: `class_${entity.type}`,
          range: this.mapColumnTypeToRange(columnContext?.dataType || 'string'),
          description: columnContext?.businessMeaning || `${columnName} property of ${entity.type}`,
          isRequired: columnContext?.isKPI || false,
          confidence: entity.confidence
        });
      });
    });

    return properties;
  }

  private convertToOntologyRelationships(relationships: SemanticRelationship[]): OntologyRelationship[] {
    return relationships.map(rel => ({
      id: `rel_${rel.sourceEntity.type}_${rel.targetEntity.type}`,
      sourceClass: `class_${rel.sourceEntity.type}`,
      targetClass: `class_${rel.targetEntity.type}`,
      relationshipType: this.mapToOntologyRelationType(rel.relationshipType),
      cardinality: this.mapToCardinality(rel.relationshipType),
      confidence: rel.confidence
    }));
  }

  private mapToCardinality(relType: SemanticRelationship['relationshipType']): OntologyRelationship['cardinality'] {
    switch (relType) {
      case 'temporal':
      case 'hierarchical':
        return 'one-to-many'; // Default mapping for temporal and hierarchical
      default:
        return relType;
    }
  }

  private generateBusinessRules(classes: OntologyClass[], properties: OntologyProperty[]): BusinessRule[] {
    const rules: BusinessRule[] = [];

    // Generate domain-specific rules
    if (this.enhancedContext) {
      const contextRules = this.enhancedContext.domainKnowledge.businessRules;
      
      contextRules.forEach((ruleDescription, index) => {
        rules.push({
          id: `rule_${index}`,
          name: `Business Rule ${index + 1}`,
          description: ruleDescription,
          condition: this.deriveRuleCondition(ruleDescription),
          action: this.deriveRuleAction(ruleDescription),
          appliesTo: this.deriveRuleScope(ruleDescription, classes),
          confidence: 0.8
        });
      });
    }

    // Generate data quality rules
    properties.filter(prop => prop.isRequired).forEach(prop => {
      rules.push({
        id: `rule_required_${prop.id}`,
        name: `Required Property: ${prop.name}`,
        description: `${prop.name} is required for ${prop.domain}`,
        condition: `${prop.domain}.${prop.name} IS NULL`,
        action: 'VALIDATE_REQUIRED',
        appliesTo: [prop.domain],
        confidence: 0.9
      });
    });

    return rules;
  }

  /**
   * Suggest ontology improvements based on data patterns
   */
  suggestOntologyImprovements(ontology: BusinessOntology, dataPatterns: any[]): string[] {
    const suggestions: string[] = [];

    // Analyze class completeness
    ontology.classes.forEach(cls => {
      if (cls.properties.length < 3) {
        suggestions.push(`Consider adding more properties to ${cls.name} class for better modeling`);
      }
    });

    // Analyze relationship coverage
    const classCount = ontology.classes.length;
    const relationshipCount = ontology.relationships.length;
    const expectedRelationships = (classCount * (classCount - 1)) / 2;
    
    if (relationshipCount < expectedRelationships * 0.3) {
      suggestions.push('Consider exploring more relationships between classes');
    }

    // Domain-specific suggestions
    if (this.enhancedContext?.businessContext.domain === 'sales') {
      if (!ontology.classes.some(cls => cls.name.toLowerCase().includes('customer'))) {
        suggestions.push('Sales domain typically requires a Customer class');
      }
      if (!ontology.classes.some(cls => cls.name.toLowerCase().includes('product'))) {
        suggestions.push('Sales domain typically requires a Product class');
      }
    }

    return suggestions;
  }

  /**
   * Learn from user interactions to improve ontology
   */
  learnFromUserFeedback(ontology: BusinessOntology, userActions: UserAction[]): BusinessOntology {
    const updatedOntology = { ...ontology, updatedAt: new Date() };

    userActions.forEach(action => {
      switch (action.type) {
        case 'accept_relationship':
          this.reinforceRelationship(updatedOntology, action.targetId);
          break;
        case 'reject_relationship':
          this.weakenRelationship(updatedOntology, action.targetId);
          break;
        case 'add_property':
          this.addUserProperty(updatedOntology, action.data);
          break;
        case 'modify_class':
          this.modifyClass(updatedOntology, action.targetId, action.data);
          break;
      }
    });

    return updatedOntology;
  }

  // Helper methods
  private groupEntitiesByType(entities: SemanticEntity[]): Record<string, SemanticEntity[]> {
    return entities.reduce((groups, entity) => {
      if (!groups[entity.type]) {
        groups[entity.type] = [];
      }
      groups[entity.type].push(entity);
      return groups;
    }, {} as Record<string, SemanticEntity[]>);
  }

  private extractUniqueProperties(entities: SemanticEntity[]): string[] {
    const allProperties = entities.flatMap(entity => entity.columns);
    return [...new Set(allProperties)];
  }

  private generateClassDescription(type: string, entities: SemanticEntity[]): string {
    const domainContext = this.enhancedContext?.businessContext.domain || 'business';
    const entityCount = entities.length;
    
    return `${this.capitalizeFirst(type)} entity in ${domainContext} domain (derived from ${entityCount} data source${entityCount > 1 ? 's' : ''})`;
  }

  private calculateClassConfidence(entities: SemanticEntity[]): number {
    return entities.reduce((sum, entity) => sum + entity.confidence, 0) / entities.length;
  }

  private generateDomainSpecificClasses(): OntologyClass[] {
    const classes: OntologyClass[] = [];
    const domain = this.enhancedContext!.businessContext.domain;

    switch (domain) {
      case 'sales':
        classes.push(
          {
            id: 'class_opportunity',
            name: 'Opportunity',
            description: 'Sales opportunity or deal',
            properties: ['value', 'stage', 'probability', 'close_date'],
            superClass: 'class_transaction',
            confidence: 0.8
          },
          {
            id: 'class_lead',
            name: 'Lead',
            description: 'Potential customer lead',
            properties: ['source', 'qualification_score', 'status'],
            superClass: 'class_customer',
            confidence: 0.8
          }
        );
        break;
      case 'marketing':
        classes.push(
          {
            id: 'class_campaign',
            name: 'Campaign',
            description: 'Marketing campaign',
            properties: ['budget', 'channel', 'start_date', 'end_date'],
            confidence: 0.8
          }
        );
        break;
    }

    return classes;
  }

  private mapColumnTypeToRange(dataType: string): string {
    const typeMapping: Record<string, string> = {
      'numeric': 'xsd:decimal',
      'date': 'xsd:dateTime',
      'categorical': 'xsd:string',
      'text': 'xsd:string',
      'boolean': 'xsd:boolean'
    };
    
    return typeMapping[dataType] || 'xsd:string';
  }

  private mapToOntologyRelationType(relType: string): string {
    const typeMapping: Record<string, string> = {
      'one-to-many': 'hasMany',
      'many-to-one': 'belongsTo',
      'many-to-many': 'associatedWith',
      'temporal': 'occursDuring',
      'hierarchical': 'isPartOf'
    };
    
    return typeMapping[relType] || 'relatedTo';
  }

  private deriveRuleCondition(ruleDescription: string): string {
    // Simple pattern matching for common business rules
    if (ruleDescription.toLowerCase().includes('positive')) {
      return 'value > 0';
    }
    if (ruleDescription.toLowerCase().includes('required')) {
      return 'IS NOT NULL';
    }
    return ruleDescription;
  }

  private deriveRuleAction(ruleDescription: string): string {
    if (ruleDescription.toLowerCase().includes('validate')) {
      return 'VALIDATE';
    }
    if (ruleDescription.toLowerCase().includes('alert')) {
      return 'ALERT';
    }
    return 'ENFORCE';
  }

  private deriveRuleScope(ruleDescription: string, classes: OntologyClass[]): string[] {
    // Find classes mentioned in rule description
    return classes
      .filter(cls => ruleDescription.toLowerCase().includes(cls.name.toLowerCase()))
      .map(cls => cls.id);
  }

  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  private reinforceRelationship(ontology: BusinessOntology, relationshipId: string): void {
    const relationship = ontology.relationships.find(r => r.id === relationshipId);
    if (relationship) {
      relationship.confidence = Math.min(relationship.confidence + 0.1, 1.0);
    }
  }

  private weakenRelationship(ontology: BusinessOntology, relationshipId: string): void {
    const relationship = ontology.relationships.find(r => r.id === relationshipId);
    if (relationship) {
      relationship.confidence = Math.max(relationship.confidence - 0.2, 0.0);
    }
  }

  private addUserProperty(ontology: BusinessOntology, propertyData: any): void {
    ontology.properties.push({
      id: `user_prop_${Date.now()}`,
      name: propertyData.name,
      domain: propertyData.domain,
      range: propertyData.range,
      description: propertyData.description,
      isRequired: propertyData.isRequired || false,
      confidence: 1.0 // User-added properties have high confidence
    });
  }

  private modifyClass(ontology: BusinessOntology, classId: string, classData: any): void {
    const cls = ontology.classes.find(c => c.id === classId);
    if (cls) {
      Object.assign(cls, classData);
      cls.confidence = Math.min(cls.confidence + 0.1, 1.0);
    }
  }
}

export interface UserAction {
  type: 'accept_relationship' | 'reject_relationship' | 'add_property' | 'modify_class';
  targetId: string;
  data?: any;
  timestamp: Date;
}