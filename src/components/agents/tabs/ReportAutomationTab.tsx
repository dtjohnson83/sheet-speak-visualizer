
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileSpreadsheet, Download, Calendar, Settings, Plus, Users, Clock } from 'lucide-react';

export const ReportAutomationTab = () => {
  return (
    <div className="space-y-6">
      {/* Header Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Active Reports</p>
                <p className="text-2xl font-bold text-green-900">3</p>
              </div>
              <FileSpreadsheet className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Scheduled</p>
                <p className="text-2xl font-bold text-blue-900">5</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">This Month</p>
                <p className="text-2xl font-bold text-purple-900">24</p>
              </div>
              <Download className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card className="border-green-200">
        <CardHeader className="bg-green-50 border-b border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-green-900">
                <FileSpreadsheet className="h-5 w-5 text-green-600" />
                Report Automation
              </CardTitle>
              <CardDescription className="text-green-700">
                Automate Excel report generation and distribution
              </CardDescription>
            </div>
            <Button className="bg-green-600 hover:bg-green-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              New Report
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-green-200 bg-green-50/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-green-900">Templates</h4>
                      <p className="text-sm text-green-600">Manage report templates</p>
                    </div>
                    <Settings className="h-8 w-8 text-green-500" />
                  </div>
                  <Button variant="outline" className="w-full mt-3 border-green-200 hover:bg-green-50">
                    Configure Templates
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-green-200 bg-green-50/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-green-900">Distribution</h4>
                      <p className="text-sm text-green-600">Manage recipients</p>
                    </div>
                    <Users className="h-8 w-8 text-green-500" />
                  </div>
                  <Button variant="outline" className="w-full mt-3 border-green-200 hover:bg-green-50">
                    Manage Recipients
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Recent Reports */}
            <div>
              <h3 className="text-lg font-semibold text-green-900 mb-4">Recent Reports</h3>
              <div className="space-y-3">
                <div className="p-4 border border-green-200 rounded-lg bg-green-50/30 hover:bg-green-50/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <FileSpreadsheet className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-green-900">Weekly Sales Report</h4>
                        <p className="text-sm text-green-600">Generated 2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        Completed
                      </Badge>
                      <Button size="sm" variant="outline" className="border-green-200 hover:bg-green-50">
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="p-4 border border-green-200 rounded-lg bg-green-50/30 hover:bg-green-50/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <FileSpreadsheet className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-green-900">Monthly Analytics</h4>
                        <p className="text-sm text-green-600">Scheduled for tomorrow</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                        <Clock className="h-3 w-3 mr-1" />
                        Scheduled
                      </Badge>
                      <Button size="sm" variant="outline" className="border-green-200 hover:bg-green-50">
                        <Settings className="h-4 w-4 mr-1" />
                        Configure
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="p-4 border border-green-200 rounded-lg bg-green-50/30 hover:bg-green-50/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <FileSpreadsheet className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-green-900">Data Quality Report</h4>
                        <p className="text-sm text-green-600">Auto-generated weekly</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        Active
                      </Badge>
                      <Button size="sm" variant="outline" className="border-green-200 hover:bg-green-50">
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Empty State for New Users */}
            {false && (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                  <FileSpreadsheet className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-lg font-medium text-green-900 mb-2">No reports yet</p>
                <p className="text-sm text-green-600 mb-4">
                  Create your first automated report to get started
                </p>
                <Button className="bg-green-600 hover:bg-green-700 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Report
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
