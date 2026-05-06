'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { savedSearchesAPI } from '@/lib/api/savedSearches';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, BellOff, Trash2, Plus, Search } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

function criteriaLabel(alert) {
  const parts = [];
  if (alert.species) parts.push(alert.species);
  if (alert.breed) parts.push(alert.breed);
  if (alert.gender) parts.push(alert.gender);
  if (alert.size) parts.push(`${alert.size} size`);
  if (alert.city) parts.push(alert.city);
  else if (alert.state) parts.push(alert.state);
  return parts.length > 0 ? parts.join(' · ') : 'All pets';
}

export default function AlertsPage() {
  const { user } = useAuth({ requireAuth: true });
  const router = useRouter();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (user && user.role !== 'adopter') {
      router.push('/dashboard');
    }
  }, [user, router]);

  useEffect(() => {
    if (user?.role === 'adopter') {
      fetchAlerts();
    }
  }, [user]);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const res = await savedSearchesAPI.getMyAlerts();
      if (res.success) {
        setAlerts(res.data.data || []);
      }
    } catch {
      toast.error('Failed to load alerts');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id) => {
    setTogglingId(id);
    try {
      const res = await savedSearchesAPI.toggleAlert(id);
      if (res.success) {
        setAlerts(prev => prev.map(a => a.id === id ? { ...a, isActive: res.data.data.isActive } : a));
        toast.success(res.data.data.isActive ? 'Alert activated' : 'Alert paused');
      }
    } catch {
      toast.error('Failed to update alert');
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      const res = await savedSearchesAPI.deleteAlert(id);
      if (res.success) {
        setAlerts(prev => prev.filter(a => a.id !== id));
        toast.success('Alert deleted');
      }
    } catch {
      toast.error('Failed to delete alert');
    } finally {
      setDeletingId(null);
    }
  };

  if (!user || user.role !== 'adopter') return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="inline-flex p-2 rounded-xl bg-primary/10 border-2 border-primary/20">
              <Bell className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">Pet Alerts</h1>
          </div>
          <p className="text-muted-foreground text-sm ml-[52px]">
            Get notified when new pets match your saved searches
          </p>
        </div>
        <Link href="/pets">
          <Button variant="outline" size="sm" className="gap-2 border-2">
            <Search className="h-4 w-4" />
            Browse & Save
          </Button>
        </Link>
      </div>

      {/* Alert List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 rounded-xl bg-muted/50 animate-pulse" />
          ))}
        </div>
      ) : alerts.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-border rounded-xl">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
            <BellOff className="h-7 w-7 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-1">No alerts yet</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
            Browse pets and apply filters, then click "Save Alert" to get notified when new matches appear.
          </p>
          <Link href="/pets">
            <Button>
              <Search className="h-4 w-4 mr-2" />
              Browse Pets
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-colors ${
                alert.isActive
                  ? 'border-primary/20 bg-primary/5'
                  : 'border-border bg-muted/30'
              }`}
            >
              {/* Icon */}
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                alert.isActive ? 'bg-primary/15' : 'bg-muted'
              }`}>
                {alert.isActive
                  ? <Bell className="h-5 w-5 text-primary" />
                  : <BellOff className="h-5 w-5 text-muted-foreground" />
                }
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-sm truncate">{alert.name}</span>
                  <Badge
                    variant={alert.isActive ? 'default' : 'secondary'}
                    className="text-[10px] px-1.5 py-0"
                  >
                    {alert.isActive ? 'Active' : 'Paused'}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 capitalize">{criteriaLabel(alert)}</p>
                {alert.lastNotifiedAt && (
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Last notified: {new Date(alert.lastNotifiedAt).toLocaleDateString()}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  onClick={() => handleToggle(alert.id)}
                  disabled={togglingId === alert.id}
                  title={alert.isActive ? 'Pause alert' : 'Activate alert'}
                >
                  {alert.isActive
                    ? <BellOff className="h-4 w-4 text-muted-foreground" />
                    : <Bell className="h-4 w-4 text-primary" />
                  }
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 hover:text-destructive hover:bg-destructive/10"
                  onClick={() => handleDelete(alert.id)}
                  disabled={deletingId === alert.id}
                  title="Delete alert"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {alerts.length > 0 && (
        <p className="text-xs text-center text-muted-foreground">
          You have {alerts.filter(a => a.isActive).length} active alert{alerts.filter(a => a.isActive).length !== 1 ? 's' : ''}.{' '}
          Notifications are sent in-app when new pets match.
        </p>
      )}
    </div>
  );
}
