import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { DashboardTileData } from '@/components/dashboard/DashboardTile';
import { FilterCondition } from '@/components/dashboard/DashboardFilters';

export interface SavedDashboard {
  id: string;
  name: string;
  description?: string;
  dataset_id?: string;
  created_at: string;
  updated_at: string;
}

export const useDashboards = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: dashboards = [], isLoading } = useQuery({
    queryKey: ['dashboards', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('saved_dashboards')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data as SavedDashboard[];
    },
    enabled: !!user?.id,
  });

  const saveDashboardMutation = useMutation({
    mutationFn: async ({
      name,
      description,
      datasetId,
      tiles,
      filters
    }: {
      name: string;
      description?: string;
      datasetId?: string;
      tiles: DashboardTileData[];
      filters: FilterCondition[];
    }) => {
      if (!user?.id) throw new Error('User not authenticated');

      console.log('Saving dashboard mutation with:', { name, description, datasetId, tilesCount: tiles.length });

      // Validate and clean the dataset ID
      const cleanDatasetId = datasetId && datasetId.trim() !== '' ? datasetId.trim() : null;
      
      // Create dashboard
      const { data: dashboard, error: dashboardError } = await supabase
        .from('saved_dashboards')
        .insert({
          user_id: user.id,
          name,
          description,
          dataset_id: cleanDatasetId
        })
        .select()
        .single();

      if (dashboardError) throw dashboardError;

      // Save tiles
      if (tiles.length > 0) {
        const tileInserts = tiles.map(tile => ({
          dashboard_id: dashboard.id,
          tile_data: {
            title: tile.title,
            chartType: tile.chartType,
            xColumn: tile.xColumn,
            yColumn: tile.yColumn,
            stackColumn: tile.stackColumn,
            sankeyTargetColumn: tile.sankeyTargetColumn,
            valueColumn: tile.valueColumn,
            sortColumn: tile.sortColumn,
            sortDirection: tile.sortDirection,
            series: tile.series,
            showDataLabels: tile.showDataLabels
          } as any, // Cast to any for Json compatibility
          position: tile.position as any, // Cast to any for Json compatibility
          size: tile.size as any // Cast to any for Json compatibility
        }));

        const { error: tilesError } = await supabase
          .from('dashboard_tiles')
          .insert(tileInserts);

        if (tilesError) throw tilesError;
      }

      // Save filters
      const { error: filtersError } = await supabase
        .from('dashboard_filters')
        .insert({
          dashboard_id: dashboard.id,
          filters: filters as any // Cast to any for Json compatibility
        });

      if (filtersError) throw filtersError;

      return dashboard;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboards', user?.id] });
      toast({
        title: "Dashboard saved successfully",
        description: "Your dashboard has been saved.",
      });
    },
    onError: (error) => {
      console.error('Dashboard save error:', error);
      toast({
        title: "Failed to save dashboard",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateDashboardMutation = useMutation({
    mutationFn: async ({
      id,
      name,
      description
    }: {
      id: string;
      name?: string;
      description?: string;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const updateData: any = {};
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;

      const { data, error } = await supabase
        .from('saved_dashboards')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboards', user?.id] });
      toast({
        title: "Dashboard updated",
        description: "Your dashboard has been updated successfully.",
      });
    },
    onError: (error) => {
      console.error('Dashboard update error:', error);
      toast({
        title: "Failed to update dashboard",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const loadDashboardMutation = useMutation({
    mutationFn: async (dashboardId: string) => {
      // Load dashboard info
      const { data: dashboard, error: dashboardError } = await supabase
        .from('saved_dashboards')
        .select('*')
        .eq('id', dashboardId)
        .single();

      if (dashboardError) throw dashboardError;

      // Load tiles
      const { data: tiles, error: tilesError } = await supabase
        .from('dashboard_tiles')
        .select('*')
        .eq('dashboard_id', dashboardId);

      if (tilesError) throw tilesError;

      // Load filters
      const { data: filters, error: filtersError } = await supabase
        .from('dashboard_filters')
        .select('*')
        .eq('dashboard_id', dashboardId)
        .single();

      if (filtersError) throw filtersError;

      // Load dataset if linked
      let dataset = null;
      if (dashboard.dataset_id) {
        const { data: datasetData, error: datasetError } = await supabase
          .from('saved_datasets')
          .select('*')
          .eq('id', dashboard.dataset_id)
          .single();

        if (!datasetError) {
          dataset = {
            ...datasetData,
            data: datasetData.data as any,
            columns: datasetData.columns as any
          };
        }
      }

      return {
        dashboard,
        tiles: tiles.map(tile => ({
          id: tile.id,
          ...(tile.tile_data as any),
          position: tile.position as any,
          size: tile.size as any
        })) as DashboardTileData[],
        filters: (filters.filters as any) as FilterCondition[],
        dataset
      };
    },
    onSuccess: () => {
      toast({
        title: "Dashboard loaded",
        description: "Your dashboard has been restored.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to load dashboard",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteDashboardMutation = useMutation({
    mutationFn: async (dashboardId: string) => {
      const { error } = await supabase
        .from('saved_dashboards')
        .delete()
        .eq('id', dashboardId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboards', user?.id] });
      toast({
        title: "Dashboard deleted",
        description: "The dashboard has been removed.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete dashboard",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    dashboards,
    isLoading,
    saveDashboard: saveDashboardMutation.mutate,
    loadDashboard: loadDashboardMutation.mutateAsync,
    deleteDashboard: deleteDashboardMutation.mutate,
    updateDashboard: updateDashboardMutation.mutate,
    isSaving: saveDashboardMutation.isPending,
    isLoadingDashboard: loadDashboardMutation.isPending,
    isDeleting: deleteDashboardMutation.isPending,
    isUpdating: updateDashboardMutation.isPending,
  };
};
