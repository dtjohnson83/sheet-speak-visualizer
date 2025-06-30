
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

      // Create dashboard
      const { data: dashboard, error: dashboardError } = await supabase
        .from('saved_dashboards')
        .insert({
          user_id: user.id,
          name,
          description,
          dataset_id: datasetId
        })
        .select()
        .single();

      if (dashboardError) throw dashboardError;

      // Save tiles
      if (tiles.length > 0) {
        const { error: tilesError } = await supabase
          .from('dashboard_tiles')
          .insert(
            tiles.map(tile => ({
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
              },
              position: tile.position,
              size: tile.size
            }))
          );

        if (tilesError) throw tilesError;
      }

      // Save filters
      const { error: filtersError } = await supabase
        .from('dashboard_filters')
        .insert({
          dashboard_id: dashboard.id,
          filters: filters
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
      toast({
        title: "Failed to save dashboard",
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
          dataset = datasetData;
        }
      }

      return {
        dashboard,
        tiles: tiles.map(tile => ({
          id: tile.id,
          ...tile.tile_data,
          position: tile.position,
          size: tile.size
        })) as DashboardTileData[],
        filters: filters.filters as FilterCondition[],
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
    isSaving: saveDashboardMutation.isPending,
    isLoading: loadDashboardMutation.isPending || isLoading,
    isDeleting: deleteDashboardMutation.isPending,
  };
};
