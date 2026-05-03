'use client';

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { lostFoundAPI } from '@/lib/api/lostFound';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
  Search, Plus, MapPin, Calendar, Phone, Mail, CheckCircle,
  AlertTriangle, Dog, Cat, Bird, PawPrint, Loader2, X
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const SPECIES_OPTIONS = ['dog', 'cat', 'bird', 'rabbit', 'other'];
const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const SpeciesIcon = ({ species }) => {
  const cls = 'h-4 w-4';
  if (species === 'dog') return <Dog className={cls} />;
  if (species === 'cat') return <Cat className={cls} />;
  if (species === 'bird') return <Bird className={cls} />;
  return <PawPrint className={cls} />;
};

const StatusBadge = ({ type }) => (
  <Badge
    variant={type === 'lost' ? 'destructive' : 'default'}
    className={type === 'found' ? 'bg-green-600 text-white' : ''}
  >
    {type === 'lost' ? '🔴 Lost' : '🟢 Found'}
  </Badge>
);

function ReportCard({ report, onResolve, isOwner }) {
  const images = Array.isArray(report.images) ? report.images : [];
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      {report.primaryImage && (
        <div className="h-40 overflow-hidden">
          <img
            src={report.primaryImage}
            alt={report.petName || report.species}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <SpeciesIcon species={report.species} />
            <h3 className="font-semibold text-base">
              {report.petName || `${report.species.charAt(0).toUpperCase() + report.species.slice(1)} (unnamed)`}
            </h3>
          </div>
          <StatusBadge type={report.type} />
        </div>

        {report.breed && (
          <p className="text-sm text-muted-foreground">{report.breed} • {report.color}</p>
        )}

        <p className="text-sm line-clamp-2 text-muted-foreground">{report.description}</p>

        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3 shrink-0" />
          <span>{report.city}, {report.state}</span>
        </div>

        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3 shrink-0" />
          <span>{formatDistanceToNow(new Date(report.incidentDate), { addSuffix: true })}</span>
        </div>

        {report.reward && parseFloat(report.reward) > 0 && (
          <Badge variant="outline" className="text-yellow-600 border-yellow-600">
            Reward: ₹{parseFloat(report.reward).toLocaleString('en-IN')}
          </Badge>
        )}

        <div className="flex items-center gap-2 pt-1 flex-wrap">
          {report.contactPhone && (
            <a
              href={`tel:${report.contactPhone}`}
              className="flex items-center gap-1 text-xs text-primary hover:underline"
            >
              <Phone className="h-3 w-3" /> {report.contactPhone}
            </a>
          )}
          {report.contactEmail && (
            <a
              href={`mailto:${report.contactEmail}`}
              className="flex items-center gap-1 text-xs text-primary hover:underline"
            >
              <Mail className="h-3 w-3" /> Contact
            </a>
          )}
        </div>

        {isOwner && report.status === 'active' && (
          <Button
            size="sm"
            variant="outline"
            className="w-full text-green-600 border-green-600 hover:bg-green-50"
            onClick={() => onResolve(report.id)}
          >
            <CheckCircle className="h-4 w-4 mr-1" /> Mark as Resolved
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function CreateReportForm({ onSuccess, onClose }) {
  const [form, setForm] = useState({
    type: 'lost', petName: '', species: 'dog', breed: '', color: '', gender: '',
    age: '', description: '', lastSeenAddress: '', city: '', state: '',
    incidentDate: '', contactName: '', contactPhone: '', contactEmail: '',
    reward: '', rewardNotes: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.description.trim() || !form.city.trim() || !form.state.trim() || !form.incidentDate) {
      toast.error('Please fill in all required fields.');
      return;
    }
    setLoading(true);
    try {
      const res = await lostFoundAPI.createReport(form);
      if (res.success) {
        toast.success(res.data.message);
        onSuccess();
        onClose();
      } else {
        toast.error(res.error || 'Failed to submit report.');
      }
    } catch {
      toast.error('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const field = (label, key, type = 'text', required = false) => (
    <div className="space-y-1">
      <label className="text-sm font-medium">{label}{required && ' *'}</label>
      <Input
        type={type}
        value={form[key]}
        onChange={e => handleChange(key, e.target.value)}
        required={required}
      />
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
      {/* Report type */}
      <div className="grid grid-cols-2 gap-3">
        {['lost', 'found'].map(t => (
          <button
            key={t}
            type="button"
            onClick={() => handleChange('type', t)}
            className={`py-3 rounded-lg border-2 font-semibold text-sm transition-all ${
              form.type === t
                ? t === 'lost'
                  ? 'border-red-500 bg-red-50 text-red-700'
                  : 'border-green-500 bg-green-50 text-green-700'
                : 'border-muted hover:border-primary'
            }`}
          >
            {t === 'lost' ? '🔴 I Lost My Pet' : '🟢 I Found a Pet'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {field('Pet Name (optional)', 'petName')}
        <div className="space-y-1">
          <label className="text-sm font-medium">Species *</label>
          <Select value={form.species} onValueChange={v => handleChange('species', v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {SPECIES_OPTIONS.map(s => <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {field('Breed', 'breed')}
        {field('Color / Markings', 'color')}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-sm font-medium">Gender</label>
          <Select value={form.gender} onValueChange={v => handleChange('gender', v)}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="unknown">Unknown</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {field('Approximate Age', 'age')}
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Description *</label>
        <Textarea
          value={form.description}
          onChange={e => handleChange('description', e.target.value)}
          placeholder="Describe the pet — any distinctive features, behaviour, collar, tags..."
          rows={3}
          required
        />
      </div>

      {field('Last Seen / Found Address', 'lastSeenAddress')}
      <div className="grid grid-cols-2 gap-3">
        {field('City *', 'city', 'text', true)}
        {field('State *', 'state', 'text', true)}
      </div>

      {field('Date of Incident *', 'incidentDate', 'date', true)}

      <div className="border-t pt-3 space-y-1">
        <p className="text-sm font-semibold text-muted-foreground">Contact Information</p>
        <div className="grid grid-cols-2 gap-3">
          {field('Your Name', 'contactName')}
          {field('Phone', 'contactPhone', 'tel')}
        </div>
        {field('Email', 'contactEmail', 'email')}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {field('Reward Amount (₹)', 'reward', 'number')}
        {field('Reward Notes', 'rewardNotes')}
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Submitting...</> : 'Submit Report'}
      </Button>
    </form>
  );
}

export default function LostFoundPage() {
  const { user } = useSelector(state => state.auth);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ type: '', species: '', city: '', state: '', status: 'active' });
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'mine'

  const loadReports = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.type) params.type = filters.type;
      if (filters.species) params.species = filters.species;
      if (filters.city) params.city = filters.city;
      if (filters.state) params.state = filters.state;
      if (filters.status) params.status = filters.status;

      const res = activeTab === 'mine'
        ? await lostFoundAPI.getMyReports()
        : await lostFoundAPI.getReports(params);

      if (res.success) {
        setReports(res.data.data.reports || res.data.data || []);
      }
    } catch {
      toast.error('Failed to load reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadReports(); }, [activeTab, filters]);

  const handleResolve = async (reportId) => {
    const res = await lostFoundAPI.resolveReport(reportId);
    if (res.success) {
      toast.success('Great news — marked as resolved!');
      loadReports();
    } else {
      toast.error(res.error || 'Failed to resolve.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <AlertTriangle className="h-7 w-7 text-yellow-500" />
            Lost & Found Pets
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Report a lost pet or help reunite a found animal with its family.
          </p>
        </div>
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger asChild>
            <Button className="shrink-0">
              <Plus className="h-4 w-4 mr-2" /> Post a Report
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Submit a Lost or Found Report</DialogTitle>
            </DialogHeader>
            <CreateReportForm onSuccess={loadReports} onClose={() => setShowForm(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b pb-2">
        {[{ key: 'all', label: 'All Reports' }, { key: 'mine', label: 'My Reports' }].map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${
              activeTab === t.key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      {activeTab === 'all' && (
        <div className="flex flex-wrap gap-2">
          <Select value={filters.type} onValueChange={v => setFilters(f => ({ ...f, type: v }))}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All types</SelectItem>
              <SelectItem value="lost">🔴 Lost</SelectItem>
              <SelectItem value="found">🟢 Found</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.species} onValueChange={v => setFilters(f => ({ ...f, species: v }))}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="All species" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All species</SelectItem>
              {SPECIES_OPTIONS.map(s => (
                <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.status} onValueChange={v => setFilters(f => ({ ...f, status: v }))}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="">All</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2">
            <Input
              placeholder="City"
              value={filters.city}
              onChange={e => setFilters(f => ({ ...f, city: e.target.value }))}
              className="w-28"
            />
            <Input
              placeholder="State"
              value={filters.state}
              onChange={e => setFilters(f => ({ ...f, state: e.target.value }))}
              className="w-28"
            />
          </div>

          {(filters.type || filters.species || filters.city || filters.state) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFilters({ type: '', species: '', city: '', state: '', status: 'active' })}
            >
              <X className="h-4 w-4 mr-1" /> Clear
            </Button>
          )}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto" />
          <h3 className="text-lg font-semibold">No reports found</h3>
          <p className="text-muted-foreground text-sm">
            {activeTab === 'mine' ? "You haven't posted any reports yet." : 'No active reports match your filters.'}
          </p>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" /> Post a Report
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {reports.map(report => (
            <ReportCard
              key={report.id}
              report={report}
              onResolve={handleResolve}
              isOwner={user?.id === report.reporterId || activeTab === 'mine'}
            />
          ))}
        </div>
      )}
    </div>
  );
}
