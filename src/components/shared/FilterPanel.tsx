import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Filter, X, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

interface FilterGroup {
  key: string;
  label: string;
  type: 'checkbox' | 'radio' | 'toggle';
  options: FilterOption[];
  selectedValues: string[];
}

interface FilterPanelProps {
  groups: FilterGroup[];
  onFilterChange: (groupKey: string, values: string[]) => void;
  onClearAll: () => void;
  className?: string;
  collapsible?: boolean;
}

export function FilterPanel({
  groups,
  onFilterChange,
  onClearAll,
  className,
  collapsible = true
}: FilterPanelProps) {
  const [collapsed, setCollapsed] = React.useState(false);
  
  const totalActiveFilters = groups.reduce(
    (total, group) => total + group.selectedValues.length,
    0
  );

  const handleOptionChange = (groupKey: string, optionValue: string, type: string) => {
    const group = groups.find(g => g.key === groupKey);
    if (!group) return;

    let newValues: string[];
    
    if (type === 'radio') {
      newValues = [optionValue];
    } else {
      const isSelected = group.selectedValues.includes(optionValue);
      if (isSelected) {
        newValues = group.selectedValues.filter(v => v !== optionValue);
      } else {
        newValues = [...group.selectedValues, optionValue];
      }
    }
    
    onFilterChange(groupKey, newValues);
  };

  const clearGroup = (groupKey: string) => {
    onFilterChange(groupKey, []);
  };

  if (collapsible && collapsed) {
    return (
      <Card className={cn('w-full', className)}>
        <CardContent className="p-4">
          <Button
            variant="outline"
            onClick={() => setCollapsed(false)}
            className="w-full justify-between"
          >
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4" />
              <span>Filtros</span>
              {totalActiveFilters > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {totalActiveFilters}
                </Badge>
              )}
            </div>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-4 w-4" />
            <span>Filtros</span>
            {totalActiveFilters > 0 && (
              <Badge variant="secondary">
                {totalActiveFilters}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center space-x-2">
            {totalActiveFilters > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearAll}
                className="text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Limpiar
              </Button>
            )}
            {collapsible && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCollapsed(true)}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {groups.map((group, groupIndex) => (
          <div key={group.key}>
            {groupIndex > 0 && <Separator className="mb-4" />}
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">{group.label}</h4>
                {group.selectedValues.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => clearGroup(group.key)}
                    className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                  >
                    Limpiar
                  </Button>
                )}
              </div>
              
              {group.type === 'radio' ? (
                <RadioGroup
                  value={group.selectedValues[0] || ''}
                  onValueChange={(value) => handleOptionChange(group.key, value, 'radio')}
                >
                  {group.options.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.value} id={`${group.key}-${option.value}`} />
                      <Label 
                        htmlFor={`${group.key}-${option.value}`}
                        className="flex-1 cursor-pointer flex items-center justify-between"
                      >
                        <span>{option.label}</span>
                        {option.count !== undefined && (
                          <span className="text-xs text-muted-foreground">({option.count})</span>
                        )}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              ) : (
                <div className="space-y-2">
                  {group.options.map((option) => {
                    const isSelected = group.selectedValues.includes(option.value);
                    
                    return (
                      <div key={option.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`${group.key}-${option.value}`}
                          checked={isSelected}
                          onCheckedChange={() => handleOptionChange(group.key, option.value, 'checkbox')}
                        />
                        <Label 
                          htmlFor={`${group.key}-${option.value}`}
                          className="flex-1 cursor-pointer flex items-center justify-between"
                        >
                          <span>{option.label}</span>
                          {option.count !== undefined && (
                            <span className="text-xs text-muted-foreground">({option.count})</span>
                          )}
                        </Label>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// Active filters display
interface ActiveFiltersProps {
  groups: FilterGroup[];
  onRemoveFilter: (groupKey: string, value: string) => void;
  onClearAll: () => void;
  className?: string;
}

export function ActiveFilters({
  groups,
  onRemoveFilter,
  onClearAll,
  className
}: ActiveFiltersProps) {
  const activeFilters = groups.flatMap(group => 
    group.selectedValues.map(value => ({
      groupKey: group.key,
      groupLabel: group.label,
      value,
      label: group.options.find(opt => opt.value === value)?.label || value
    }))
  );

  if (activeFilters.length === 0) return null;

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      <span className="text-sm text-muted-foreground">Filtros activos:</span>
      {activeFilters.map((filter, index) => (
        <Badge
          key={`${filter.groupKey}-${filter.value}-${index}`}
          variant="secondary"
          className="cursor-pointer hover:bg-muted"
          onClick={() => onRemoveFilter(filter.groupKey, filter.value)}
        >
          {filter.groupLabel}: {filter.label}
          <X className="h-3 w-3 ml-1" />
        </Badge>
      ))}
      <Button
        variant="ghost"
        size="sm"
        onClick={onClearAll}
        className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
      >
        Limpiar todo
      </Button>
    </div>
  );
}

// Specialized filter panels
export function PilotFilterPanel({
  pilots,
  selectedTeams,
  selectedCountries,
  selectedStatus,
  onTeamsChange,
  onCountriesChange,
  onStatusChange,
  onClearAll
}: {
  pilots: any[];
  selectedTeams: string[];
  selectedCountries: string[];
  selectedStatus: string[];
  onTeamsChange: (teams: string[]) => void;
  onCountriesChange: (countries: string[]) => void;
  onStatusChange: (status: string[]) => void;
  onClearAll: () => void;
}) {
  const teams = React.useMemo(() => {
    const teamCounts = pilots.reduce((acc, pilot) => {
      acc[pilot.team] = (acc[pilot.team] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(teamCounts).map(([team, count]) => ({
      value: team,
      label: team,
      count: count as number
    }));
  }, [pilots]);

  const countries = React.useMemo(() => {
    const countryCounts = pilots.reduce((acc, pilot) => {
      acc[pilot.country] = (acc[pilot.country] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(countryCounts).map(([country, count]) => ({
      value: country,
      label: country,
      count: count as number
    }));
  }, [pilots]);

  const groups: FilterGroup[] = [
    {
      key: 'status',
      label: 'Estado',
      type: 'checkbox',
      options: [
        { value: 'active', label: 'Activo', count: pilots.filter(p => p.active).length },
        { value: 'inactive', label: 'Inactivo', count: pilots.filter(p => !p.active).length }
      ],
      selectedValues: selectedStatus
    },
    {
      key: 'teams',
      label: 'Escuderías',
      type: 'checkbox',
      options: teams,
      selectedValues: selectedTeams
    },
    {
      key: 'countries',
      label: 'Países',
      type: 'checkbox',
      options: countries,
      selectedValues: selectedCountries
    }
  ];

  const handleFilterChange = (groupKey: string, values: string[]) => {
    switch (groupKey) {
      case 'teams':
        onTeamsChange(values);
        break;
      case 'countries':
        onCountriesChange(values);
        break;
      case 'status':
        onStatusChange(values);
        break;
    }
  };

  return (
    <FilterPanel
      groups={groups}
      onFilterChange={handleFilterChange}
      onClearAll={onClearAll}
    />
  );
}

export function RaceFilterPanel({
  races,
  selectedStatus,
  selectedLocations,
  onStatusChange,
  onLocationsChange,
  onClearAll
}: {
  races: any[];
  selectedStatus: string[];
  selectedLocations: string[];
  onStatusChange: (status: string[]) => void;
  onLocationsChange: (locations: string[]) => void;
  onClearAll: () => void;
}) {
  const locations = React.useMemo(() => {
    const locationCounts = races.reduce((acc, race) => {
      acc[race.location] = (acc[race.location] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(locationCounts).map(([location, count]) => ({
      value: location,
      label: location,
      count: count as number
    }));
  }, [races]);

  const groups: FilterGroup[] = [
    {
      key: 'status',
      label: 'Estado',
      type: 'checkbox',
      options: [
        { value: 'upcoming', label: 'Próxima', count: races.filter(r => r.status === 'upcoming').length },
        { value: 'active', label: 'Activa', count: races.filter(r => r.status === 'active').length },
        { value: 'completed', label: 'Completada', count: races.filter(r => r.status === 'completed').length }
      ],
      selectedValues: selectedStatus
    },
    {
      key: 'locations',
      label: 'Ubicaciones',
      type: 'checkbox',
      options: locations,
      selectedValues: selectedLocations
    }
  ];

  const handleFilterChange = (groupKey: string, values: string[]) => {
    switch (groupKey) {
      case 'status':
        onStatusChange(values);
        break;
      case 'locations':
        onLocationsChange(values);
        break;
    }
  };

  return (
    <FilterPanel
      groups={groups}
      onFilterChange={handleFilterChange}
      onClearAll={onClearAll}
    />
  );
}