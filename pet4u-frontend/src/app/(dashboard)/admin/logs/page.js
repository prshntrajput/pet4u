'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { adminAPI } from '@/lib/api/admin';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Activity } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function AdminLogsPage() {
  const { user } = useAuth({ requireAuth: true });
  const router = useRouter();
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }

    if (user && user.role === 'admin') {
      loadLogs();
    }
  }, [user, router]);

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      const response = await adminAPI.getAdminLogs();
      if (response.success) {
        setLogs(response.data.data.logs);
      }
    } catch (error) {
      console.error('Failed to load logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getActionColor = (action) => {
    if (action.includes('deleted')) return 'destructive';
    if (action.includes('suspended')) return 'secondary';
    if (action.includes('activated')) return 'success';
    return 'default';
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Activity Logs</h1>
        <p className="text-gray-600 mt-2">Monitor all administrative actions</p>
      </div>

      {/* Logs List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-20">
          <Activity className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">No activity logs yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <Card key={log.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge variant={getActionColor(log.action)}>
                        {log.action.replace(/_/g, ' ').toUpperCase()}
                      </Badge>
                      <span className="text-sm text-gray-600">
                        by {log.admin?.name || 'System'}
                      </span>
                    </div>

                    <p className="text-sm text-gray-700 mb-2">{log.description}</p>

                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>Entity: {log.entityType}</span>
                      {log.ipAddress && <span>IP: {log.ipAddress}</span>}
                      <span>
                        {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
