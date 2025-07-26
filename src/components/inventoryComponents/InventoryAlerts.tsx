'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Clock, Package } from 'lucide-react';

interface InventoryAlert {
    id: string;
    item_name?: string;
    alert_type: string;
    message: string;
    priority: string;
    current_value?: number;
    threshold_value?: number;
    created_at?: string;
}

interface InventoryAlertsProps {
    alerts: InventoryAlert[];
}

export default function InventoryAlerts({ alerts }: InventoryAlertsProps) {

    const getAlertIcon = (type: string) => {
        switch (type) {
            case 'low_stock':
                return AlertTriangle;
            case 'out_of_stock':
                return Package;
            case 'overstock':
                return AlertTriangle;
            default:
                return AlertTriangle;
        }
    };

    const getAlertColor = (priority: string) => {
        switch (priority) {
            case 'critical':
                return {
                    badge: 'destructive' as const,
                    bg: 'bg-red-500/10',
                    border: 'border-red-500/50',
                    text: 'text-red-400',
                    icon: 'text-red-400',
                };
            case 'high':
                return {
                    badge: 'secondary' as const,
                    bg: 'bg-orange-500/10',
                    border: 'border-orange-500/50',
                    text: 'text-orange-400',
                    icon: 'text-orange-400',
                };
            case 'medium':
                return {
                    badge: 'outline' as const,
                    bg: 'bg-yellow-500/10',
                    border: 'border-yellow-500/50',
                    text: 'text-yellow-400',
                    icon: 'text-yellow-400',
                };
            default:
                return {
                    badge: 'outline' as const,
                    bg: 'bg-blue-500/10',
                    border: 'border-blue-500/50',
                    text: 'text-blue-400',
                    icon: 'text-blue-400',
                };
        }
    };

    if (alerts.length === 0) {
        return (
            <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-300 mb-2">All Clear!</h3>
                <p className="text-slate-400">No active inventory alerts</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {alerts.map((alert) => {
                const AlertIcon = getAlertIcon(alert.alert_type);
                const colors = getAlertColor(alert.priority);
                
                return (
                    <Card key={alert.id} className={`${colors.bg} ${colors.border} border transition-transform duration-150 ease-out hover:scale-[1.01]`}>
                        <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                                <div className={`p-2 rounded-lg ${colors.bg} mt-1`}>
                                    <AlertIcon className={`h-4 w-4 ${colors.icon}`} />
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Badge variant={colors.badge} className="text-xs">
                                            {alert.priority.toUpperCase()}
                                        </Badge>
                                        <Badge variant="outline" className="text-xs border-slate-600 text-slate-400">
                                            {alert.alert_type.replace('_', ' ').toUpperCase()}
                                        </Badge>
                                    </div>
                                    
                                    <p className={`text-sm font-medium ${colors.text} mb-1`}>
                                        {alert.item_name || 'Inventory Alert'}
                                    </p>
                                    
                                    <p className="text-sm text-slate-400 mb-2">
                                        {alert.message}
                                    </p>
                                    
                                    {alert.current_value !== undefined && alert.threshold_value !== undefined && (
                                        <div className="text-xs text-slate-500 mb-3">
                                            Current: {alert.current_value} | Threshold: {alert.threshold_value}
                                        </div>
                                    )}
                                    
                                </div>
                                
                                <div className="text-xs text-slate-500 flex items-center">
                                    <Clock className="h-3 w-3 mr-1" />
                                    Now
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}