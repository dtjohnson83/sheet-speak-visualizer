import { QualityIssue } from './QualityReportTypes';

export const generateQualityIssues = (data: any[], columns: any[]): QualityIssue[] => {
  const issues: QualityIssue[] = [];

  columns.forEach(column => {
    const columnData = data.map(row => row[column.name]);
    const nonNullData = columnData.filter(value => value !== null && value !== undefined && value !== '');
    const nullCount = columnData.length - nonNullData.length;

    // Completeness issues
    if (nullCount > 0) {
      const percentage = (nullCount / columnData.length) * 100;
      issues.push({
        category: 'Completeness',
        severity: percentage > 20 ? 'high' : percentage > 10 ? 'medium' : 'low',
        column: column.name,
        description: `Column has ${nullCount} missing values (${percentage.toFixed(1)}% missing)`,
        recommendation: percentage > 20 
          ? 'Critical: Implement data validation rules and make this field mandatory in source systems'
          : percentage > 10
          ? 'Important: Review data collection process and add validation checks'
          : 'Monitor: Consider adding default values or optional field handling',
        priority: percentage > 20 ? 9 : percentage > 10 ? 6 : 3,
        affectedRows: nullCount,
        percentage
      });
    }

    // Validity issues for age fields
    if (column.name.toLowerCase().includes('age')) {
      const invalidAges = nonNullData.filter(value => {
        const num = Number(value);
        return isNaN(num) || num < 0 || num > 150;
      });
      
      if (invalidAges.length > 0) {
        issues.push({
          category: 'Validity',
          severity: 'high',
          column: column.name,
          description: `${invalidAges.length} invalid age values found`,
          recommendation: 'Implement age validation rules (0-150 years) and clean existing invalid data',
          priority: 8,
          affectedRows: invalidAges.length,
          percentage: (invalidAges.length / nonNullData.length) * 100
        });
      }
    }

    // Email format issues
    if (column.name.toLowerCase().includes('email')) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const invalidEmails = nonNullData.filter(value => !emailPattern.test(String(value)));
      
      if (invalidEmails.length > 0) {
        issues.push({
          category: 'Conformity',
          severity: 'medium',
          column: column.name,
          description: `${invalidEmails.length} invalid email formats found`,
          recommendation: 'Implement email validation at data entry points and clean existing invalid emails',
          priority: 7,
          affectedRows: invalidEmails.length,
          percentage: (invalidEmails.length / nonNullData.length) * 100
        });
      }
    }

    // Uniqueness issues for ID fields
    if (column.name.toLowerCase().includes('id')) {
      const uniqueValues = new Set(nonNullData).size;
      const duplicates = nonNullData.length - uniqueValues;
      
      if (duplicates > 0) {
        issues.push({
          category: 'Uniqueness',
          severity: 'high',
          column: column.name,
          description: `${duplicates} duplicate values found in ID field`,
          recommendation: 'Implement unique constraints and investigate source of duplicates',
          priority: 9,
          affectedRows: duplicates,
          percentage: (duplicates / nonNullData.length) * 100
        });
      }
    }

    // Consistency issues for numeric fields
    if (column.type === 'numeric') {
      const numericValues = nonNullData.filter(value => !isNaN(Number(value)));
      const nonNumericCount = nonNullData.length - numericValues.length;
      
      if (nonNumericCount > 0) {
        issues.push({
          category: 'Consistency',
          severity: 'medium',
          column: column.name,
          description: `${nonNumericCount} non-numeric values in numeric field`,
          recommendation: 'Implement data type validation and clean non-numeric values',
          priority: 6,
          affectedRows: nonNumericCount,
          percentage: (nonNumericCount / nonNullData.length) * 100
        });
      }
    }
  });

  return issues.sort((a, b) => b.priority - a.priority);
};